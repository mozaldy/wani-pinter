import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import { streamJson } from '@/lib/gemini';
import { trackKeyProgress, type ProgressEvent } from '@/lib/gemini-progress';
import {
  SKELETON_SCHEMA, SKELETON_STAGE_KEYS, SKELETON_STAGE_LABELS,
  skeletonPrompt, emptyPertemuan, type Rpp, type RppInput,
} from '@/lib/rpp';
import { insertRpp } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';

type DoneEvent = { type: 'done'; id: string };
type ErrorEvent = { type: 'error'; message: string };
type StreamEvent = ProgressEvent | DoneEvent | ErrorEvent;

export const maxDuration = 200;

export async function POST(req: NextRequest) {
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
        const user = await requireTeacher();
        const body = await req.json();

        const jumlah = Math.min(20, Math.max(1, Number(body.jumlahPertemuan) || 1));
        const input: RppInput = {
          satuan: String(body.satuan || '').trim(),
          mapel: String(body.mapel || '').trim(),
          fase: String(body.fase || '').trim(),
          kelas: String(body.kelas || '').trim(),
          semester: String(body.semester || '').trim(),
          topik: String(body.topik || '').trim(),
          alokasi: String(body.alokasi || '').trim(),
          kondisiKelas: String(body.kondisiKelas || '').trim(),
          tujuanPembelajaran: String(body.tujuanPembelajaran || '').trim(),
          jumlahPertemuan: jumlah,
        };

        if (!input.mapel || !input.topik) {
          send({ type: 'error', message: dict.errors.mapelTopikRequired });
          return;
        }

        const deltas = streamJson(skeletonPrompt(input), SKELETON_SCHEMA);
        const buf = await trackKeyProgress(deltas, SKELETON_STAGE_KEYS, SKELETON_STAGE_LABELS, send);
        let skeleton: Omit<Rpp, 'pertemuan'>;
        try {
          skeleton = JSON.parse(buf) as Omit<Rpp, 'pertemuan'>;
        } catch {
          throw new Error(dict.errors.gagalMembacaHasilAi);
        }

        // The teacher's TP is authoritative — never trust the model to copy it verbatim.
        if (input.tujuanPembelajaran) skeleton.tujuanPembelajaran = input.tujuanPembelajaran;
        const content: Rpp = { ...skeleton, pertemuan: emptyPertemuan(skeleton.rutePertemuan) };

        const id = await insertRpp(user.userId, {
          judul: content.identitas.judul,
          mapel: content.identitas.mapel,
          kelas: content.identitas.kelas,
        }, content);

        revalidatePath('/rpp');
        send({ type: 'done', id });
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
