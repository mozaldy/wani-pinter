import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { streamJson } from '@/lib/gemini';
import { trackKeyProgress, type ProgressEvent } from '@/lib/gemini-progress';
import { PERTEMUAN_SCHEMA, PERTEMUAN_STAGE_KEYS, PERTEMUAN_STAGE_LABELS, pertemuanPrompt, type Pertemuan } from '@/lib/rpp';
import { updateRppContent } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';
import { loadOwned } from '@/app/(app)/rpp/actions';

type DoneEvent = { type: 'done'; pertemuan: Pertemuan };
type ErrorEvent = { type: 'error'; message: string };
type StreamEvent = ProgressEvent | DoneEvent | ErrorEvent;

export const maxDuration = 200;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; no: string }> }) {
  const { id, no: noParam } = await params;
  const no = Number(noParam);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client disconnected — the stream is already errored, nothing to do.
        }
      };
      const dict = await getDictionary();

      try {
        const { user, row } = await loadOwned(id);
        const content = row.content;

        // Cheap check first — don't burn a paid thinkingLevel:'high' generation
        // on a bad/NaN `no` that can never match.
        const i = content.pertemuan.findIndex(p => p.no === no);
        if (i === -1) throw new Error(interpolate(dict.errors.pertemuanTidakAda, { no }));

        const deltas = streamJson(pertemuanPrompt(content, no), PERTEMUAN_SCHEMA);
        const buf = await trackKeyProgress(deltas, PERTEMUAN_STAGE_KEYS, PERTEMUAN_STAGE_LABELS, send);
        let hasil: Pertemuan;
        try {
          hasil = JSON.parse(buf) as Pertemuan;
        } catch {
          throw new Error(dict.errors.gagalMembacaHasilAi);
        }

        content.pertemuan[i] = { ...hasil, no };

        await updateRppContent(id, user.userId, content);
        revalidatePath(`/rpp/${id}`);
        send({ type: 'done', pertemuan: content.pertemuan[i] });
      } catch (e) {
        send({ type: 'error', message: e instanceof Error ? e.message : dict.errors.gagalMenyusunModul });
      } finally {
        try {
          controller.close();
        } catch {
          // Client disconnected — the controller may already be closed/errored.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
