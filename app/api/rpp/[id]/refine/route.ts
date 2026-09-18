import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { streamJson } from '@/lib/gemini';
import { trackCharProgress, type ProgressEvent } from '@/lib/gemini-progress';
import { isSectionKey, sectionSchema, refinePrompt, emptyPertemuan, type Rpp, type SectionKey } from '@/lib/rpp';
import { updateRppContent } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';
import { loadOwned } from '@/app/(app)/rpp/actions';

type DoneEvent = { type: 'done'; key: SectionKey; value: unknown };
type ErrorEvent = { type: 'error'; message: string };
type StreamEvent = ProgressEvent | DoneEvent | ErrorEvent;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      const dict = await getDictionary();

      try {
        const body = await req.json();
        const key = String(body.key || '');
        const instruction = String(body.instruction || '');

        if (!isSectionKey(key)) throw new Error(interpolate(dict.errors.bagianTidakDikenal, { key }));
        if (!instruction.trim()) throw new Error(dict.errors.instruksiWajibDiisi);

        const { user, row } = await loadOwned(id);
        const content = row.content;

        const deltas = streamJson(refinePrompt(content, key, content[key], instruction), sectionSchema(key));
        const buf = await trackCharProgress(deltas, send);
        const { value } = JSON.parse(buf) as { value: Rpp[SectionKey] };

        const next = { ...content, [key]: value } as Rpp;
        if (key === 'rutePertemuan') {
          next.pertemuan = next.rutePertemuan.map(r =>
            content.pertemuan.find(p => p.no === r.no) ?? emptyPertemuan([r])[0]);
        }

        await updateRppContent(id, user.userId, next);
        revalidatePath(`/rpp/${id}`);
        send({ type: 'done', key, value });
      } catch (e) {
        send({ type: 'error', message: e instanceof Error ? e.message : dict.errors.gagalMenyusunModul });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}
