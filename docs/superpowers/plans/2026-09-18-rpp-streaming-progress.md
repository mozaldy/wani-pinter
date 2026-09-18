# RPP Streaming Generation Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the indeterminate spinner shown while generating an RPP (create, per-pertemuan, and section-refine) with real progress driven by Gemini's actual SSE output stream.

**Architecture:** Move the Gemini-calling part of `createRpp`, `generatePertemuan`, and `refineSection` out of Server Actions and into three new Next.js Route Handlers that stream Server-Sent Events. Progress is detected by scanning the accumulating raw JSON text for newly-appeared top-level schema keys (or, for the single-key refine schema, a growing character count). A shared client hook consumes the SSE stream and drives the UI in `CreateRppForm.tsx`, `PertemuanCard.tsx`, and `Section.tsx`.

**Tech Stack:** Next.js App Router (Route Handlers, `ReadableStream`), Gemini `streamGenerateContent` REST API (SSE), plain `fetch` on the client (no new dependencies).

**Spec:** `docs/superpowers/specs/2026-09-18-rpp-streaming-progress-design.md`

## Global Constraints

- No new npm dependencies (spec explicitly rejected the Vercel AI SDK approach — see spec's "Approach B" rejection).
- No test runner exists in this repo (`package.json` has no `test` script). Verification per task is `npx tsc --noEmit`, `npm run lint`, and — where noted — a small throwaway Node script run via `npx tsx` (already a devDependency, used by `db:seed`) or manual browser testing. Throwaway scripts are written to a temp file (e.g. via `mktemp`) and are **not** committed.
- Gemini bills identically for streaming and non-streaming calls (confirmed against `ai.google.dev/gemini-api/docs/pricing`) — no cost concern in this work.
- Keep `lib/gemini.ts`'s `generateJson()` — it is still used by `lib/rpp.check.ts` (the `pnpm rpp:check` live contract-check script), which is out of scope for this work.
- Every new/changed file must leave the app in a state that passes `npx tsc --noEmit`.

---

### Task 1: `lib/gemini.ts` — extract shared retry logic, add `streamJson()`

**Files:**
- Modify: `lib/gemini.ts`

**Interfaces:**
- Produces: `streamJson(prompt: string, schema: object): AsyncGenerator<string>` — same prompt/schema contract as `generateJson`, but yields raw text deltas as they arrive instead of the full parsed object. Later tasks (5, 6, 7) consume this.
- Produces (internal, not exported): `openWithRetry(endpoint: string, body: string): Promise<Response>`, `buildBody(prompt: string, schema: object): string` — shared by `generateJson` and `streamJson`.

- [ ] **Step 1: Replace the full file contents**

Replace all of `lib/gemini.ts` with:

```ts
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
const GENERATE_ENDPOINT = `${BASE}:generateContent`;
const STREAM_ENDPOINT = `${BASE}:streamGenerateContent?alt=sse`;

// Total wall-clock budget for one generation, retries included. A teacher is
// watching a spinner: better to fail with a clear message than to keep retrying
// a service that is refusing us. Measured calls run 3-5s, so this is ~20x slack.
const BUDGET_MS = 90_000;

const BUSY = new Set([429, 500, 503]);

function buildBody(prompt: string, schema: object): string {
  return JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      thinkingConfig: { thinkingLevel: 'high' },
    },
  });
}

/** Opens `endpoint`, retrying while Gemini is busy, within `BUDGET_MS` total. */
async function openWithRetry(endpoint: string, body: string): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const deadline = Date.now() + BUDGET_MS;
  let res: Response | undefined;
  let attempt = 0;

  // Retry only while there is budget left — a slow 503 must not buy itself
  // another full attempt, which is how one busy model turned into a 4.5min wait.
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body,
        signal: AbortSignal.timeout(remaining),
      });
    } catch (e) {
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) break;
      throw e;
    }

    if (!BUSY.has(res.status)) break;

    const backoff = Math.min(4000 * 2 ** attempt++, 15_000);
    if (Date.now() + backoff >= deadline) break;
    await new Promise(r => setTimeout(r, backoff));
  }

  if (!res) throw new Error(`Layanan AI (${MODEL}) tidak merespons dalam ${BUDGET_MS / 1000} detik. Coba lagi.`);

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    if (BUSY.has(res.status)) {
      throw new Error(`Model ${MODEL} sedang penuh dan menolak permintaan. Coba lagi beberapa saat, atau jalankan dengan GEMINI_MODEL lain.`);
    }
    throw new Error(`Gemini ${res.status}: ${detail}`);
  }

  return res;
}

/**
 * Ask Gemini for JSON matching `schema`. The schema is enforced during decoding,
 * so the returned object is structurally guaranteed — no runtime validator needed.
 */
export async function generateJson<T>(prompt: string, schema: object): Promise<T> {
  const res = await openWithRetry(GENERATE_ENDPOINT, buildBody(prompt, schema));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini tidak mengembalikan isi (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'unknown'})`);
  return JSON.parse(text) as T;
}

/**
 * Same contract as `generateJson`, but yields raw text as it streams in
 * instead of waiting for the full response. The caller accumulates the
 * deltas and decides what to do with the partial buffer (e.g. progress
 * detection) before parsing the final concatenated text.
 */
export async function* streamJson(prompt: string, schema: object): AsyncGenerator<string> {
  const res = await openWithRetry(STREAM_ENDPOINT, buildBody(prompt, schema));
  const body = res.body;
  if (!body) throw new Error('Gemini tidak mengembalikan aliran data');

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const events = buf.split('\n\n');
    buf = events.pop() ?? '';
    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        const chunk = JSON.parse(payload);
        const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      }
    }
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors related to `lib/gemini.ts` (there may be pre-existing unrelated errors elsewhere in the repo — only `lib/gemini.ts` and its callers matter here; at this point its only callers, `lib/rpp.check.ts` and `app/(app)/rpp/actions.ts`, still only call `generateJson`, whose signature is unchanged).

- [ ] **Step 3: Manual sanity check against the real API**

Run: `pnpm rpp:check` (this exercises `generateJson`, confirming the refactor didn't change its behavior).
Expected: same pass/fail outcome as before this change (it calls the real Gemini API — if it was passing before, it should still pass; this only proves the refactor is behavior-preserving, not that Gemini itself is reachable in a sandboxed environment).

- [ ] **Step 4: Commit**

```bash
git add lib/gemini.ts
git commit -m "refactor(gemini): extract retry/backoff into openWithRetry, add streamJson"
```

---

### Task 2: `lib/gemini-progress.ts` — progress-detection helpers

**Files:**
- Create: `lib/gemini-progress.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (works against any `AsyncGenerator<string>`, including `streamJson()` from Task 1).
- Produces: `ProgressEvent` type (`{type:'stage', key, label}` | `{type:'progress', chars}`), `trackKeyProgress(deltas, keys, labels, onEvent): Promise<string>`, `trackCharProgress(deltas, onEvent, throttleMs?): Promise<string>`. Tasks 5, 6, 7 (the Route Handlers) call these.

- [ ] **Step 1: Write the file**

```ts
export type ProgressEvent =
  | { type: 'stage'; key: string; label: string }
  | { type: 'progress'; chars: number };

/**
 * Consumes text deltas from `streamJson`, calling `onEvent` each time a new
 * top-level schema key first appears in the accumulating buffer, in `keys`
 * order. Returns the final concatenated buffer once `deltas` is drained.
 */
export async function trackKeyProgress(
  deltas: AsyncGenerator<string>,
  keys: readonly string[],
  labels: Record<string, string>,
  onEvent: (e: ProgressEvent) => void,
): Promise<string> {
  let buf = '';
  let seen = 0;

  for await (const delta of deltas) {
    buf += delta;
    while (seen < keys.length && new RegExp(`"${keys[seen]}"\\s*:`).test(buf)) {
      onEvent({ type: 'stage', key: keys[seen], label: labels[keys[seen]] ?? keys[seen] });
      seen++;
    }
  }

  return buf;
}

/**
 * Consumes text deltas, calling `onEvent` with the running character count
 * on a throttle — for schemas with no meaningful sub-keys to stage (e.g.
 * refine's single `value` wrapper). Returns the final concatenated buffer.
 */
export async function trackCharProgress(
  deltas: AsyncGenerator<string>,
  onEvent: (e: ProgressEvent) => void,
  throttleMs = 200,
): Promise<string> {
  let buf = '';
  let lastEmit = 0;

  for await (const delta of deltas) {
    buf += delta;
    const now = Date.now();
    if (now - lastEmit >= throttleMs) {
      onEvent({ type: 'progress', chars: buf.length });
      lastEmit = now;
    }
  }

  onEvent({ type: 'progress', chars: buf.length });
  return buf;
}
```

- [ ] **Step 2: Write a throwaway verification script**

Create a temp file (e.g. `tmp=$(mktemp /tmp/gemini-progress-check.XXXX.ts)`) with:

```ts
import assert from 'node:assert/strict';
import { trackKeyProgress, trackCharProgress } from '/ABSOLUTE/PATH/TO/REPO/lib/gemini-progress.ts';

async function* fakeDeltas(chunks: string[]) {
  for (const c of chunks) yield c;
}

async function main() {
  const keyEvents: unknown[] = [];
  const buf1 = await trackKeyProgress(
    fakeDeltas(['{"a":1,', '"b":2}']),
    ['a', 'b'],
    { a: 'Alpha', b: 'Beta' },
    e => keyEvents.push(e),
  );
  assert.deepEqual(keyEvents, [
    { type: 'stage', key: 'a', label: 'Alpha' },
    { type: 'stage', key: 'b', label: 'Beta' },
  ]);
  assert.equal(buf1, '{"a":1,"b":2}');

  const charEvents: { chars: number }[] = [];
  const buf2 = await trackCharProgress(fakeDeltas(['hello ', 'world']), e => charEvents.push(e as { chars: number }), 0);
  assert.ok(charEvents.length >= 1);
  assert.equal(charEvents[charEvents.length - 1].chars, 11);
  assert.equal(buf2, 'hello world');

  console.log('OK');
}

main();
```

Replace `/ABSOLUTE/PATH/TO/REPO/` with the repo's actual absolute path.

- [ ] **Step 3: Run it and confirm it fails before Step 1 exists / passes after**

Since Step 1 already wrote the real file, just run it now to confirm the implementation is correct:

Run: `npx tsx "$tmp"`
Expected output: `OK`

If it doesn't print `OK`, fix `lib/gemini-progress.ts` and rerun until it does.

- [ ] **Step 4: Delete the throwaway script**

Run: `rm "$tmp"`

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `lib/gemini-progress.ts`.

- [ ] **Step 6: Commit**

```bash
git add lib/gemini-progress.ts
git commit -m "feat(rpp): add trackKeyProgress/trackCharProgress SSE progress helpers"
```

---

### Task 3: `lib/rpp.ts` — stage key/label exports

**Files:**
- Modify: `lib/rpp.ts:124` (insert immediately after the `PERTEMUAN_SCHEMA` block, before the `// ─── Editable sections ───` comment)

**Interfaces:**
- Produces: `SKELETON_STAGE_LABELS: Record<string, string>`, `SKELETON_STAGE_KEYS: string[]`, `PERTEMUAN_STAGE_LABELS: Record<string, string>`, `PERTEMUAN_STAGE_KEYS: string[]`. Task 5 uses the `SKELETON_*` pair, Task 6 uses the `PERTEMUAN_*` pair.

- [ ] **Step 1: Insert the exports**

In `lib/rpp.ts`, immediately after the closing `} as const;` of `PERTEMUAN_SCHEMA` (currently line 124) and before the `// ─── Editable sections ───` comment (currently line 126), insert:

```ts
// ─── Streaming-progress key order ──────────────────────────────────────────
// Mirrors the property order in SKELETON_SCHEMA / PERTEMUAN_SCHEMA above —
// Gemini's structured JSON output emits keys in schema-declaration order, so
// scanning for these markers in order gives a live checklist as they stream in.

export const SKELETON_STAGE_LABELS: Record<string, string> = {
  identitas: 'Identitas Modul',
  identifikasiMurid: 'Identifikasi Murid',
  identifikasiMateri: 'Identifikasi Materi',
  dimensiProfilLulusan: 'Dimensi Profil Lulusan',
  tujuanPembelajaran: 'Tujuan Pembelajaran',
  indikator: 'Kriteria Ketercapaian Tujuan Pembelajaran',
  praktikPedagogis: 'Praktik Pedagogis',
  lingkunganPembelajaran: 'Lingkungan Pembelajaran',
  kemitraanPembelajaran: 'Kemitraan Pembelajaran',
  pemanfaatanDigital: 'Pemanfaatan Digital',
  rutePertemuan: 'Alur Belajar',
  asesmenSumatif: 'Asesmen Sumatif',
  rencanaTindakLanjut: 'Rencana Tindak Lanjut',
  daftarPustaka: 'Daftar Pustaka',
};
export const SKELETON_STAGE_KEYS = Object.keys(SKELETON_STAGE_LABELS);

export const PERTEMUAN_STAGE_LABELS: Record<string, string> = {
  no: 'Nomor Pertemuan',
  judul: 'Judul Aktivitas',
  pengalamanBelajar: 'Pengalaman Belajar',
  prinsip: 'Prinsip Pembelajaran',
  media: 'Media',
  langkah: 'Langkah Pembelajaran',
  asesmen: 'Asesmen Formatif',
};
export const PERTEMUAN_STAGE_KEYS = Object.keys(PERTEMUAN_STAGE_LABELS);
```

- [ ] **Step 2: Verify key order matches the schemas**

Run: `npx tsc --noEmit` (confirms no typos break the file), then manually diff the key order:
- `SKELETON_SCHEMA.properties` keys (lines 88-103 of `lib/rpp.ts`): `identitas, identifikasiMurid, identifikasiMateri, dimensiProfilLulusan, tujuanPembelajaran, indikator, praktikPedagogis, lingkunganPembelajaran, kemitraanPembelajaran, pemanfaatanDigital, rutePertemuan, asesmenSumatif, rencanaTindakLanjut, daftarPustaka`
- `Object.keys(SKELETON_STAGE_LABELS)` must list the same 14 keys in the same order — confirm by eye.
- `PERTEMUAN_SCHEMA.properties` keys (lines 114-122): `no, judul, pengalamanBelajar, prinsip, media, langkah, asesmen`
- `Object.keys(PERTEMUAN_STAGE_LABELS)` must match.

- [ ] **Step 3: Commit**

```bash
git add lib/rpp.ts
git commit -m "feat(rpp): export stage key/label maps for streaming progress"
```

---

### Task 4: `components/rpp/useStreamedGeneration.ts` — shared client hook

**Files:**
- Create: `components/rpp/useStreamedGeneration.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks directly (it's a generic SSE-consuming hook; it matches the wire format Tasks 5-7 will produce: `data: {...}\n\n` lines where `{...}` is one of `ProgressEvent` from Task 2, or `{type:'done', ...}` / `{type:'error', message}`).
- Produces: `useStreamedGeneration<T>(): { start(url, body): void; phase: 'idle'|'thinking'|'streaming'|'done'|'error'; stages: {key,label}[]; chars: number|null; result: T|null; error: string|null }`. Tasks 6, 7, 8 (UI components) consume this.

- [ ] **Step 1: Write the file**

```ts
'use client';
import { useCallback, useRef, useState } from 'react';

export type Stage = { key: string; label: string };
export type Phase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error';

type ServerEvent =
  | { type: 'stage'; key: string; label: string }
  | { type: 'progress'; chars: number }
  | { type: 'done'; [k: string]: unknown }
  | { type: 'error'; message: string };

export function useStreamedGeneration<T = Record<string, unknown>>() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [stages, setStages] = useState<Stage[]>([]);
  const [chars, setChars] = useState<number | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);

  const start = useCallback(async (url: string, body: unknown) => {
    if (running.current) return;
    running.current = true;
    setPhase('thinking'); setStages([]); setChars(null); setResult(null); setError(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.body) throw new Error('Tidak ada respons streaming dari server');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const raw of events) {
          const line = raw.split('\n').find(l => l.startsWith('data:'));
          if (!line) continue;
          const evt = JSON.parse(line.slice(5).trim()) as ServerEvent;

          if (evt.type === 'stage') {
            setPhase('streaming');
            setStages(s => [...s, { key: evt.key, label: evt.label }]);
          } else if (evt.type === 'progress') {
            setPhase('streaming');
            setChars(evt.chars);
          } else if (evt.type === 'done') {
            setPhase('done');
            setResult(evt as unknown as T);
          } else if (evt.type === 'error') {
            setPhase('error');
            setError(evt.message);
          }
        }
      }
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan tak terduga');
    } finally {
      running.current = false;
    }
  }, []);

  return { start, phase, stages, chars, result, error };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `components/rpp/useStreamedGeneration.ts`. (It isn't imported anywhere yet, so this only checks it's internally well-typed.)

- [ ] **Step 3: Commit**

```bash
git add components/rpp/useStreamedGeneration.ts
git commit -m "feat(rpp): add useStreamedGeneration client hook for SSE progress"
```

---

### Task 5: RPP creation flow — Route Handler + `CreateRppForm.tsx`

**Files:**
- Create: `app/api/rpp/generate/route.ts`
- Modify: `components/rpp/CreateRppForm.tsx`
- Modify: `app/(app)/rpp/actions.ts:26-62` (remove `createRpp`), and trim its now-unused imports

**Interfaces:**
- Consumes: `streamJson` (Task 1), `trackKeyProgress` + `ProgressEvent` (Task 2), `SKELETON_STAGE_KEYS`/`SKELETON_STAGE_LABELS` (Task 3), `useStreamedGeneration` (Task 4).
- Produces: `POST /api/rpp/generate` — request body `{satuan, mapel, fase, kelas, semester, topik, alokasi, kondisiKelas, tujuanPembelajaran, jumlahPertemuan}` (all strings except `jumlahPertemuan`), SSE response of `ProgressEvent | {type:'done', id: string} | {type:'error', message: string}`.

- [ ] **Step 1: Create the Route Handler**

Create `app/api/rpp/generate/route.ts`:

```ts
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

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
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
        const skeleton = JSON.parse(buf) as Omit<Rpp, 'pertemuan'>;

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
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' },
  });
}
```

- [ ] **Step 2: Rewrite `CreateRppForm.tsx`**

Replace all of `components/rpp/CreateRppForm.tsx` with:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useStreamedGeneration } from './useStreamedGeneration';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { lookup } from '@/lib/i18n/format';

const DEFAULTS = {
  satuan: 'SDN 1 Keputran Surabaya',
  semester: 'Ganjil',
  alokasi: '2 x 35 menit per pertemuan',
};

const DEFAULT_MAPEL = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'IPA Terpadu',
  'IPS Terpadu',
  'IPAS',
  'Pendidikan Pancasila',
  'Pendidikan Agama & Budi Pekerti',
  'PJOK',
  'Seni Budaya',
  'Seni Rupa',
  'Seni Musik',
  'Informatika',
  'Bahasa Jawa',
];

const FASE_OPTIONS = [
  {
    value: 'A',
    label: 'A (Kelas I–II)',
    kelas: [
      { value: 'I', label: 'Kelas I (1)' },
      { value: 'II', label: 'Kelas II (2)' },
    ],
  },
  {
    value: 'B',
    label: 'B (Kelas III–IV)',
    kelas: [
      { value: 'III', label: 'Kelas III (3)' },
      { value: 'IV', label: 'Kelas IV (4)' },
    ],
  },
  {
    value: 'C',
    label: 'C (Kelas V–VI)',
    kelas: [
      { value: 'V', label: 'Kelas V (5)' },
      { value: 'VI', label: 'Kelas VI (6)' },
    ],
  },
  {
    value: 'D',
    label: 'D (Kelas VII–IX)',
    kelas: [
      { value: 'VII', label: 'Kelas VII (7)' },
      { value: 'VIII', label: 'Kelas VIII (8)' },
      { value: 'IX', label: 'Kelas IX (9)' },
    ],
  },
  {
    value: 'E',
    label: 'E (Kelas X)',
    kelas: [
      { value: 'X', label: 'Kelas X (10)' },
    ],
  },
  {
    value: 'F',
    label: 'F (Kelas XI–XII)',
    kelas: [
      { value: 'XI', label: 'Kelas XI (11)' },
      { value: 'XII', label: 'Kelas XII (12)' },
    ],
  },
] as const;

export function CreateRppForm({ mapel, jabatan }: { mapel: string[]; jabatan: string }) {
  const { dict } = useI18n();
  const router = useRouter();
  const { start, phase, stages, error, result } = useStreamedGeneration<{ id: string }>();
  const mapelList = Array.from(new Set([...mapel, ...DEFAULT_MAPEL]));
  const mapelDefault = mapelList.find(m => jabatan.toLowerCase().includes(m.toLowerCase())) ?? mapelList[0] ?? '';
  const pending = phase === 'thinking' || phase === 'streaming';

  useEffect(() => {
    if (phase === 'done' && result?.id) router.push(`/rpp/${result.id}`);
  }, [phase, result, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    start('/api/rpp/generate', {
      satuan: form.get('satuan'),
      mapel: form.get('mapel'),
      fase: form.get('fase'),
      kelas: form.get('kelas'),
      semester: form.get('semester'),
      topik: form.get('topik'),
      alokasi: form.get('alokasi'),
      kondisiKelas: form.get('kondisiKelas'),
      tujuanPembelajaran: form.get('tujuanPembelajaran'),
      jumlahPertemuan: form.get('jumlahPertemuan'),
    });
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-title">
        <h3>{dict.rpp.create.title}</h3>
        <span className="sub">{dict.rpp.create.subtitle}</span>
      </div>

      <Fieldset mapel={mapelList} mapelDefault={mapelDefault} dict={dict} pending={pending} />

      {error && (
        <div className="small" style={{ marginTop: 12, padding: 10, borderRadius: 8, background: 'var(--color-bad-soft)', color: 'var(--color-bad)' }}>
          {error}
        </div>
      )}

      <Submit pending={pending} stages={stages} dict={dict} />
    </form>
  );
}

function Fieldset({ mapel, mapelDefault, dict, pending }: { mapel: string[]; mapelDefault: string; dict: Dictionary; pending: boolean }) {
  const [fase, setFase] = useState('A');
  const [kelas, setKelas] = useState('I');

  const activeFase = FASE_OPTIONS.find(f => f.value === fase) ?? FASE_OPTIONS[0];

  const handleFaseChange = (newFase: string) => {
    setFase(newFase);
    const targetFase = FASE_OPTIONS.find(f => f.value === newFase);
    if (targetFase && !targetFase.kelas.some(k => k.value === kelas)) {
      setKelas(targetFase.kelas[0].value);
    }
  };

  return (
    <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0 }}>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-6 field">
          <label className="field-label">{dict.rpp.create.mapelLabel}</label>
          <select name="mapel" required defaultValue={mapelDefault}>
            {mapel.map(m => (
              <option key={m} value={m}>{lookup(dict.enums.mapel, m)}</option>
            ))}
          </select>
        </div>
        <div className="col-span-6 field">
          <label className="field-label">{dict.rpp.create.satuanLabel}</label>
          <input name="satuan" required defaultValue={DEFAULTS.satuan} />
        </div>

        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.faseLabel}</label>
          <select name="fase" required value={fase} onChange={e => handleFaseChange(e.target.value)}>
            {FASE_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{dict.rpp.create.faseOptions[f.value]}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.kelasLabel}</label>
          <select name="kelas" required value={kelas} onChange={e => setKelas(e.target.value)}>
            {activeFase.kelas.map(k => (
              <option key={k.value} value={k.value}>{dict.rpp.create.kelasOptions[k.value]}</option>
            ))}
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.semesterLabel}</label>
          <select name="semester" required defaultValue={DEFAULTS.semester}>
            <option value="Ganjil">{dict.rpp.create.semesterOptions.Ganjil}</option>
            <option value="Genap">{dict.rpp.create.semesterOptions.Genap}</option>
          </select>
        </div>
        <div className="col-span-3 field">
          <label className="field-label">{dict.rpp.create.jumlahPertemuanLabel}</label>
          <input name="jumlahPertemuan" type="number" min={1} max={20} required defaultValue={4} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.topikLabel}</label>
          <input name="topik" required placeholder={dict.rpp.create.topikPlaceholder} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">
            {dict.rpp.create.tpLabel} <span className="muted">{dict.rpp.create.tpOptional}</span>
          </label>
          <textarea name="tujuanPembelajaran" rows={2}
            placeholder={dict.rpp.create.tpPlaceholder} />
          <span className="tiny muted">{dict.rpp.create.tpHint}</span>
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.alokasiLabel}</label>
          <input name="alokasi" required defaultValue={DEFAULTS.alokasi} />
        </div>

        <div className="col-span-12 field">
          <label className="field-label">{dict.rpp.create.kondisiLabel} <span className="muted">{dict.rpp.create.kondisiOptional}</span></label>
          <textarea name="kondisiKelas" rows={3}
            placeholder={dict.rpp.create.kondisiPlaceholder} />
        </div>
      </div>
    </fieldset>
  );
}

function Submit({ pending, stages, dict }: { pending: boolean; stages: { key: string; label: string }[]; dict: Dictionary }) {
  if (pending) {
    return (
      <div style={{ textAlign: 'center', padding: '28px 20px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 50,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          margin: '0 auto 14px', display: 'grid', placeItems: 'center',
          color: 'white', animation: 'pulseScale 1.5s infinite',
        }}>
          <Icon name="sparkle" size={24} />
        </div>
        <div className="h-display" style={{ fontWeight: 500, marginBottom: 4 }}>{dict.rpp.create.loadingTitle}</div>
        <div className="muted small">{dict.rpp.create.loadingBody}</div>
        {stages.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '14px auto 0', maxWidth: 300, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6, padding: 0 }}>
            {stages.map(s => (
              <li key={s.key} className="tiny" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-ink-2)' }}>
                <Icon name="check" size={12} /> {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>
      <Icon name="sparkle" size={13} /> {dict.rpp.create.submit}
    </button>
  );
}
```

- [ ] **Step 3: Remove `createRpp` from `actions.ts` and trim its unused imports**

In `app/(app)/rpp/actions.ts`:
- Delete the entire `createRpp` function (currently lines 25-62, from `/** Returns an error message...` through the closing `}` before `export async function generatePertemuan`).
- In the top import block, remove `RppInput` from the `type` import list, remove `skeletonPrompt` and `emptyPertemuan` from the value-import list **only if** nothing else in the file still uses them — at this point in the plan, `generatePertemuan` and `refineSection` still exist and don't use `skeletonPrompt`/`emptyPertemuan`/`SKELETON_SCHEMA`/`insertRpp`, so all four can be removed now. Do **not** remove `generateJson` yet (still used by `generatePertemuan` and `refineSection`), and do **not** remove `redirect` (still used by `deleteRpp`).

The import block at the top of the file should become:

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import { generateJson } from '@/lib/gemini';
import {
  PERTEMUAN_SCHEMA, sectionSchema, isSectionKey,
  pertemuanPrompt, refinePrompt, emptyPertemuan,
  type Rpp, type Pertemuan, type SectionKey,
} from '@/lib/rpp';
import { getRpp, updateRppContent, deleteRppRow } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';
```

(Note `emptyPertemuan` is kept — `refineSection`, further down, still uses it for the `rutePertemuan` special case. `insertRpp` and `RppInput` are dropped entirely; `SKELETON_SCHEMA` and `skeletonPrompt` are dropped entirely.)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. This confirms `actions.ts` still compiles with `generatePertemuan`/`refineSection` intact and `createRpp` gone, and that `CreateRppForm.tsx` / the new route handler compile.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no new warnings/errors (in particular, no unused-import warnings in `actions.ts` or `CreateRppForm.tsx`).

- [ ] **Step 6: Manual browser test**

Run: `npm run dev`, log in as a teacher, go to the RPP create form, fill it out, submit.
Expected:
- The submit button is replaced by the pulsing circle + a checklist that grows with labels like "Identitas Modul", "Identifikasi Murid", … in order, as generation proceeds.
- On completion, the browser navigates to `/rpp/<new-id>` and the new RPP is there with correct content.
- If you temporarily set `GEMINI_API_KEY` to an invalid value and retry, the red error banner appears with a message instead of the UI hanging.

- [ ] **Step 7: Commit**

```bash
git add app/api/rpp/generate/route.ts components/rpp/CreateRppForm.tsx "app/(app)/rpp/actions.ts"
git commit -m "feat(rpp): stream real generation progress for RPP creation"
```

---

### Task 6: Pertemuan generation flow — Route Handler + `PertemuanCard.tsx`

**Files:**
- Create: `app/api/rpp/[id]/pertemuan/[no]/route.ts`
- Modify: `components/rpp/PertemuanCard.tsx`
- Modify: `app/(app)/rpp/actions.ts` (export `loadOwned`, remove `generatePertemuan`, trim imports)

**Interfaces:**
- Consumes: `streamJson` (Task 1), `trackKeyProgress` + `ProgressEvent` (Task 2), `PERTEMUAN_STAGE_KEYS`/`PERTEMUAN_STAGE_LABELS` (Task 3), `useStreamedGeneration` (Task 4), `loadOwned(id): Promise<{user, row}>` (this task exports it from `actions.ts`).
- Produces: `POST /api/rpp/[id]/pertemuan/[no]` — empty request body, SSE response of `ProgressEvent | {type:'done', pertemuan: Pertemuan} | {type:'error', message: string}`. `loadOwned` becomes an exported function other route handlers (Task 7) also import.

- [ ] **Step 1: Export `loadOwned` in `actions.ts`**

In `app/(app)/rpp/actions.ts`, change:

```ts
async function loadOwned(id: string) {
```

to:

```ts
export async function loadOwned(id: string) {
```

(No other change to its body — it's already `requireTeacher()` + `getRpp()` + a not-found check.)

- [ ] **Step 2: Create the Route Handler**

Create `app/api/rpp/[id]/pertemuan/[no]/route.ts`:

```ts
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; no: string }> }) {
  const { id, no: noParam } = await params;
  const no = Number(noParam);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      const dict = await getDictionary();

      try {
        const { user, row } = await loadOwned(id);
        const content = row.content;

        const deltas = streamJson(pertemuanPrompt(content, no), PERTEMUAN_SCHEMA);
        const buf = await trackKeyProgress(deltas, PERTEMUAN_STAGE_KEYS, PERTEMUAN_STAGE_LABELS, send);
        const hasil = JSON.parse(buf) as Pertemuan;

        const i = content.pertemuan.findIndex(p => p.no === no);
        if (i === -1) throw new Error(interpolate(dict.errors.pertemuanTidakAda, { no }));
        content.pertemuan[i] = { ...hasil, no };

        await updateRppContent(id, user.userId, content);
        revalidatePath(`/rpp/${id}`);
        send({ type: 'done', pertemuan: content.pertemuan[i] });
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
```

- [ ] **Step 3: Rewrite `PertemuanCard.tsx`**

Replace all of `components/rpp/PertemuanCard.tsx` with:

```tsx
'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/ui';
import { useModals } from '@/components/modals/ModalProvider';
import { savePertemuan } from '@/app/(app)/rpp/actions';
import { useStreamedGeneration } from './useStreamedGeneration';
import type { Pertemuan } from '@/lib/rpp';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';

export function PertemuanCard({ id, p }: { id: string; p: Pertemuan }) {
  const { dict } = useI18n();
  const { pushToast } = useModals();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [langkah, setLangkah] = useState(p.langkah.join('\n'));
  const [pending, start] = useTransition();
  const gen = useStreamedGeneration();
  const filled = p.langkah.length > 0;
  const streaming = gen.phase === 'thinking' || gen.phase === 'streaming';
  const busy = pending || streaming;

  const run = (fn: () => Promise<void>, ok: string) => start(async () => {
    try { await fn(); pushToast(ok, 'good'); setEditing(false); setOpen(true); }
    catch (e) { pushToast(e instanceof Error ? e.message : dict.rpp.editor.gagal, 'warn'); }
  });

  useEffect(() => {
    if (gen.phase === 'done') {
      pushToast(interpolate(dict.rpp.editor.pertemuanTersusunToast, { no: p.no }), 'good');
      setOpen(true);
      router.refresh();
    } else if (gen.phase === 'error' && gen.error) {
      pushToast(gen.error, 'warn');
    }
  }, [gen.phase, gen.error, dict, p.no, pushToast, router]);

  return (
    <div className="card" style={{ marginBottom: 10, opacity: busy ? 0.6 : 1 }}>
      <div className="card-title" style={{ marginBottom: filled && open ? 12 : 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tiny muted" style={{ fontFamily: 'var(--font-mono)' }}>P{p.no}</span>
          {p.judul || interpolate(dict.rpp.editor.pertemuanLabel, { no: p.no })}
          {filled
            ? <Pill kind="good">{interpolate(dict.rpp.editor.langkahCount, { count: p.langkah.length })}</Pill>
            : <Pill kind="ink">{dict.rpp.editor.belumDisusun}</Pill>}
        </h3>
        <span className="flex gap-1">
          {filled && (
            <button className="btn btn-ghost small" onClick={() => setOpen(o => !o)}>
              {open ? dict.common.tutup : dict.rpp.editor.lihat}
            </button>
          )}
          <button className="btn btn-ghost small" disabled={busy}
            onClick={() => gen.start(`/api/rpp/${id}/pertemuan/${p.no}`, {})}>
            <Icon name="sparkle" size={12} />
            {busy ? dict.rpp.editor.menyusun : filled ? dict.rpp.editor.susunUlang : dict.rpp.editor.susunDenganAi}
          </button>
        </span>
      </div>

      {streaming && gen.stages.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {gen.stages.map(s => (
            <li key={s.key} className="tiny muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={11} /> {s.label}
            </li>
          ))}
        </ul>
      )}

      {filled && open && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 tiny muted" style={{ flexWrap: 'wrap' }}>
            <Pill kind="primary">{p.pengalamanBelajar}</Pill>
            {p.prinsip.map(x => <Pill key={x} kind="accent">{x}</Pill>)}
          </div>
          <div className="small"><strong>{dict.rpp.editor.mediaLabel}</strong> {p.media}</div>

          {editing ? (
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label">{dict.rpp.editor.langkahFieldLabel}</label>
              <textarea rows={Math.max(8, p.langkah.length + 2)} value={langkah}
                onChange={e => setLangkah(e.target.value)} />
              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <button className="btn btn-primary" disabled={busy}
                  onClick={() => run(
                    () => savePertemuan(id, p.no, { langkah: langkah.split('\n').map(s => s.trim()).filter(Boolean) }),
                    interpolate(dict.rpp.editor.pertemuanDisimpanToast, { no: p.no }))}>
                  <Icon name="check" size={13} /> {dict.common.simpan}
                </button>
                <button className="btn btn-ghost" onClick={() => { setLangkah(p.langkah.join('\n')); setEditing(false); }}>{dict.common.batal}</button>
              </div>
            </div>
          ) : (
            <>
              <ol style={{ margin: '0 0 0 18px', listStyleType: 'decimal', fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
                {p.langkah.map((l, i) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
              </ol>
              <button className="btn btn-ghost small" style={{ alignSelf: 'flex-start' }}
                onClick={() => { setLangkah(p.langkah.join('\n')); setEditing(true); }}>
                <Icon name="edit" size={12} /> {dict.rpp.editor.editLangkah}
              </button>
            </>
          )}

          {p.asesmen && (
            <div style={{ padding: 12, background: 'var(--color-surface-2)', borderRadius: 10 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 6 }}>
                {interpolate(dict.rpp.editor.lampiranAsesmen, { no: p.no })}
              </div>
              <div className="tiny muted" style={{ marginBottom: 6 }}>
                {p.asesmen.teknik} — {p.asesmen.tujuan}
              </div>
              <ul style={{ margin: '0 0 0 16px', listStyleType: 'disc', fontSize: 12, lineHeight: 1.6 }}>
                {p.asesmen.rubrik.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Remove `generatePertemuan` from `actions.ts` and trim imports**

In `app/(app)/rpp/actions.ts`, delete the `generatePertemuan` function entirely. In the import block, remove `PERTEMUAN_SCHEMA` and `pertemuanPrompt` (no longer used — only `refineSection`, further down, remains, which doesn't use them). The import block becomes:

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import { generateJson } from '@/lib/gemini';
import {
  sectionSchema, isSectionKey, refinePrompt, emptyPertemuan,
  type Rpp, type Pertemuan, type SectionKey,
} from '@/lib/rpp';
import { getRpp, updateRppContent, deleteRppRow } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';
```

(`generateJson` stays — `refineSection` still uses it until Task 7. `Pertemuan` type stays — `savePertemuan` still uses it.)

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no new warnings/errors.

- [ ] **Step 7: Manual browser test**

Open an existing RPP's detail page, click "Susun dengan AI" on a pertemuan card.
Expected:
- The card dims and a checklist grows with labels like "Nomor Pertemuan", "Judul Aktivitas", "Pengalaman Belajar", … in order.
- On completion, a success toast appears, the card expands to show the generated `langkah`, and the content matches what's now in the database (refresh the page to double-check persistence).
- Force a failure (bad `GEMINI_API_KEY`) and confirm the warning toast appears and the card returns to its normal (non-dimmed) state instead of hanging.

- [ ] **Step 8: Commit**

```bash
git add "app/api/rpp/[id]/pertemuan/[no]/route.ts" components/rpp/PertemuanCard.tsx "app/(app)/rpp/actions.ts"
git commit -m "feat(rpp): stream real generation progress for pertemuan generation"
```

---

### Task 7: Section refine flow — Route Handler + `Section.tsx`

**Files:**
- Create: `app/api/rpp/[id]/refine/route.ts`
- Modify: `components/rpp/Section.tsx`
- Modify: `app/(app)/rpp/actions.ts` (remove `refineSection`, drop now-unused `generateJson`/`sectionSchema`/`refinePrompt` imports if applicable)
- Modify: `lib/i18n/dictionaries/id.ts`, `lib/i18n/dictionaries/en.ts` (add one new string for the refine word-count display)

**Interfaces:**
- Consumes: `streamJson` (Task 1), `trackCharProgress` + `ProgressEvent` (Task 2), `useStreamedGeneration` (Task 4), `loadOwned` (exported in Task 6).
- Produces: `POST /api/rpp/[id]/refine` — request body `{key: string, instruction: string}`, SSE response of `ProgressEvent | {type:'done', key, value} | {type:'error', message: string}`.

- [ ] **Step 1: Add the new dictionary string**

In `lib/i18n/dictionaries/id.ts`, in the `rpp.editor` namespace, immediately after the `menyusunUlang: 'Menyusun ulang…',` line (currently line 317), insert:

```ts
      karakterTersusun: '{count} karakter tersusun…',
```

In `lib/i18n/dictionaries/en.ts`, in the same namespace, immediately after the matching `menyusunUlang: 'Redrafting…',` line (currently line 319), insert:

```ts
      karakterTersusun: '{count} characters written…',
```

- [ ] **Step 2: Create the Route Handler**

Create `app/api/rpp/[id]/refine/route.ts`:

```ts
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
```

- [ ] **Step 3: Rewrite `Section.tsx`**

Replace all of `components/rpp/Section.tsx` with:

```tsx
'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { useModals } from '@/components/modals/ModalProvider';
import { saveSection } from '@/app/(app)/rpp/actions';
import { useStreamedGeneration } from './useStreamedGeneration';
import type { RuteRow, SectionKind } from '@/lib/rpp';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { interpolate } from '@/lib/i18n/format';
import type { Dictionary } from '@/lib/i18n/dictionaries';

type Value = string | string[] | RuteRow[];

export function Section({ id, sectionKey, label, kind, hint, ordered, value }: {
  id: string; sectionKey: string; label: string;
  kind: SectionKind; hint?: string; ordered?: boolean; value: Value;
}) {
  const { dict } = useI18n();
  const { pushToast } = useModals();
  const router = useRouter();
  const [mode, setMode] = useState<'read' | 'edit' | 'refine'>('read');
  const [draft, setDraft] = useState<Value>(value);
  const [instruction, setInstruction] = useState('');
  const [pending, start] = useTransition();
  const refine = useStreamedGeneration();
  const streaming = refine.phase === 'thinking' || refine.phase === 'streaming';
  const busy = pending || streaming;

  const run = (fn: () => Promise<void>, ok: string) => start(async () => {
    try {
      await fn();
      pushToast(ok, 'good');
      setMode('read');
      setInstruction('');
    } catch (e) {
      pushToast(e instanceof Error ? e.message : dict.rpp.editor.gagalMenyimpan, 'warn');
    }
  });

  useEffect(() => {
    if (refine.phase === 'done') {
      pushToast(interpolate(dict.rpp.editor.diperbarui, { label }), 'good');
      setMode('read');
      setInstruction('');
      router.refresh();
    } else if (refine.phase === 'error' && refine.error) {
      pushToast(refine.error, 'warn');
    }
  }, [refine.phase, refine.error, dict, label, router]);

  const openEdit = () => { setDraft(value); setMode('edit'); };

  return (
    <div className="card" style={{ marginBottom: 14, opacity: busy ? 0.6 : 1 }}>
      <div className="card-title">
        <h3>{label}</h3>
        <span className="flex gap-1">
          {hint && mode === 'read' && <span className="sub" style={{ marginRight: 8 }}>{hint}</span>}
          <button className="btn btn-ghost small" disabled={busy}
            onClick={() => (mode === 'edit' ? setMode('read') : openEdit())}>
            <Icon name="edit" size={12} /> {mode === 'edit' ? dict.common.batal : dict.rpp.editor.edit}
          </button>
          <button className="btn btn-ghost small" disabled={busy}
            onClick={() => setMode(mode === 'refine' ? 'read' : 'refine')}>
            <Icon name="sparkle" size={12} /> {mode === 'refine' ? dict.common.tutup : dict.rpp.editor.ubahDenganAi}
          </button>
        </span>
      </div>

      {mode === 'edit'
        ? <Editor kind={kind} draft={draft} onChange={setDraft} dict={dict} />
        : <Reader kind={kind} ordered={ordered} value={value} dict={dict} />}

      {mode === 'edit' && (
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" disabled={busy}
            onClick={() => run(() => saveSection(id, sectionKey, draft), interpolate(dict.rpp.editor.disimpan, { label }))}>
            <Icon name="check" size={13} /> {dict.common.simpan}
          </button>
        </div>
      )}

      {mode === 'refine' && (
        <div className="ai-card" style={{ marginTop: 12 }}>
          <div className="ai-badge"><span className="ai-glyph"><Icon name="sparkle" size={11} /></span> {dict.rpp.editor.refineTitle}</div>
          <div className="field" style={{ marginBottom: 8, marginTop: 8 }}>
            <textarea rows={2} value={instruction} disabled={busy}
              placeholder={dict.rpp.editor.refinePlaceholder}
              onChange={e => setInstruction(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={busy || !instruction.trim()}
            onClick={() => refine.start(`/api/rpp/${id}/refine`, { key: sectionKey, instruction })}>
            <Icon name="sparkle" size={13} /> {streaming ? dict.rpp.editor.menyusunUlang : dict.rpp.editor.terapkan}
          </button>
          {streaming && refine.chars !== null && (
            <div className="tiny muted" style={{ marginTop: 8 }}>
              {interpolate(dict.rpp.editor.karakterTersusun, { count: refine.chars })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── read / edit views per kind ────────────────────────────────────────────

function Reader({ kind, ordered, value, dict }: { kind: SectionKind; ordered?: boolean; value: Value; dict: Dictionary }) {
  if (kind === 'table') {
    const rows = value as RuteRow[];
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr><th style={{ width: 90 }}>{dict.rpp.editor.tableHeaders.pertemuan}</th><th>{dict.rpp.editor.tableHeaders.tujuan}</th><th>{dict.rpp.editor.tableHeaders.aktivitas}</th><th style={{ width: 130 }}>{dict.rpp.editor.tableHeaders.alokasi}</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.no}><td>{r.no}</td><td>{r.tujuan}</td><td>{r.aktivitas}</td><td>{r.alokasi}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (kind === 'list') {
    // Match RppDocument: numbered only where the printed document numbers too.
    const List = ordered ? 'ol' : 'ul';
    return (
      <List style={{ margin: '0 0 0 18px', listStyleType: ordered ? 'decimal' : 'disc', fontSize: 13, lineHeight: 1.7, color: 'var(--color-ink-2)' }}>
        {(value as string[]).map((t, i) => <li key={i}>{t}</li>)}
      </List>
    );
  }
  return <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--color-ink-2)', margin: 0, textAlign: 'justify' }}>{value as string}</p>;
}

function Editor({ kind, draft, onChange, dict }: { kind: SectionKind; draft: Value; onChange: (v: Value) => void; dict: Dictionary }) {
  if (kind === 'table') {
    const rows = draft as RuteRow[];
    const set = (i: number, patch: Partial<RuteRow>) =>
      onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    return (
      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="tiny muted" style={{ width: 24, textAlign: 'right' }}>{r.no}</span>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input value={r.tujuan} placeholder={dict.rpp.editor.tujuanPlaceholder} onChange={e => set(i, { tujuan: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input value={r.aktivitas} placeholder={dict.rpp.editor.aktivitasPlaceholder} onChange={e => set(i, { aktivitas: e.target.value })} />
            </div>
            <div className="field" style={{ width: 140, marginBottom: 0 }}>
              <input value={r.alokasi ?? ''} placeholder={dict.rpp.editor.alokasiPlaceholder} onChange={e => set(i, { alokasi: e.target.value })} />
            </div>
            <button className="btn btn-ghost small" title={dict.rpp.editor.hapusBaris}
              onClick={() => onChange(rows.filter((_, j) => j !== i).map((r2, j) => ({ ...r2, no: j + 1 })))}>&times;</button>
          </div>
        ))}
        <button className="btn btn-outline small" style={{ alignSelf: 'flex-start' }}
          onClick={() => onChange([...rows, { no: rows.length + 1, tujuan: '', aktivitas: '', alokasi: '' }])}>
          {dict.rpp.editor.tambahPertemuan}
        </button>
        <div className="tiny muted">{dict.rpp.editor.tambahPertemuanHint}</div>
      </div>
    );
  }

  if (kind === 'list') {
    return (
      <div className="field" style={{ marginBottom: 0 }}>
        <textarea rows={Math.max(4, (draft as string[]).length + 1)} value={(draft as string[]).join('\n')}
          onChange={e => onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} />
        <span className="tiny muted">{dict.rpp.editor.satuButirPerBaris}</span>
      </div>
    );
  }

  return (
    <div className="field" style={{ marginBottom: 0 }}>
      <textarea rows={6} value={draft as string} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
```

- [ ] **Step 4: Remove `refineSection` from `actions.ts` and finish trimming imports**

In `app/(app)/rpp/actions.ts`, delete the `refineSection` function entirely. `generateJson`, `sectionSchema`, and `refinePrompt` are no longer used anywhere in this file (all three call sites are now gone) — remove them from the imports. The final import block becomes:

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import {
  isSectionKey, emptyPertemuan,
  type Rpp, type Pertemuan,
} from '@/lib/rpp';
import { getRpp, updateRppContent, deleteRppRow } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';
```

The whole file should now be exactly:

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireTeacher } from '@/lib/auth';
import {
  isSectionKey, emptyPertemuan,
  type Rpp, type Pertemuan,
} from '@/lib/rpp';
import { getRpp, updateRppContent, deleteRppRow } from '@/lib/queries';
import { getDictionary } from '@/lib/i18n/server';
import { interpolate } from '@/lib/i18n/format';

// ponytail: read-modify-write of the whole JSONB document, last write wins.
// Add optimistic concurrency on updated_at if one RPP is ever edited from two tabs.
export async function loadOwned(id: string) {
  const user = await requireTeacher();
  const row = await getRpp(id, user.userId);
  if (!row) throw new Error((await getDictionary()).errors.rppNotFound);
  return { user, row };
}

export async function saveSection(id: string, key: string, value: unknown) {
  if (!isSectionKey(key)) throw new Error(interpolate((await getDictionary()).errors.bagianTidakDikenal, { key }));
  const { user, row } = await loadOwned(id);
  const next = { ...row.content, [key]: value } as Rpp;

  if (key === 'rutePertemuan') {
    next.pertemuan = next.rutePertemuan.map(r =>
      row.content.pertemuan.find(p => p.no === r.no) ?? emptyPertemuan([r])[0]);
  }

  await updateRppContent(id, user.userId, next);
  revalidatePath(`/rpp/${id}`);
}

export async function savePertemuan(id: string, no: number, patch: Partial<Pertemuan>) {
  const { user, row } = await loadOwned(id);
  const content = row.content;
  const i = content.pertemuan.findIndex(p => p.no === no);
  if (i === -1) throw new Error(interpolate((await getDictionary()).errors.pertemuanTidakAda, { no }));
  content.pertemuan[i] = { ...content.pertemuan[i], ...patch, no };

  await updateRppContent(id, user.userId, content);
  revalidatePath(`/rpp/${id}`);
}

export async function deleteRpp(id: string) {
  const user = await requireTeacher();
  await deleteRppRow(id, user.userId);
  revalidatePath('/rpp');
  redirect('/rpp');
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no new warnings/errors.

- [ ] **Step 7: Manual browser test**

Open an RPP detail page, pick any section, click "Ubah dengan AI", type an instruction, submit.
Expected:
- A "{N} karakter tersusun…" line appears and its count grows while streaming.
- On completion, a success toast appears, the section shows the updated content (confirm after a refresh too), and the page updates without a manual reload (via `router.refresh()`).
- Force a failure and confirm the warning toast appears instead of the UI hanging.
- Switch the UI language to English and repeat the refine flow once, confirming the "X characters written…" string renders correctly (a lightweight check that the new dictionary key round-trips into `en.ts`).

- [ ] **Step 8: Commit**

```bash
git add "app/api/rpp/[id]/refine/route.ts" components/rpp/Section.tsx "app/(app)/rpp/actions.ts" lib/i18n/dictionaries/id.ts lib/i18n/dictionaries/en.ts
git commit -m "feat(rpp): stream real generation progress for section refine"
```

---

### Task 8: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors anywhere in the project.

- [ ] **Step 2: Full lint**

Run: `npm run lint`
Expected: no errors (pre-existing warnings unrelated to this work, if any, are out of scope).

- [ ] **Step 3: Full build**

Run: `npm run build`
Expected: build succeeds — this also catches any Route Handler misconfiguration (e.g. wrong dynamic segment naming) that `tsc`/`lint` alone wouldn't.

- [ ] **Step 4: End-to-end manual pass**

Run: `npm run dev` and, as a logged-in teacher:
1. Create a new RPP — confirm the checklist grows and matches the 14 skeleton keys in order, and the page lands on the new RPP.
2. Generate a pertemuan — confirm the checklist grows and matches the 7 pertemuan keys in order, and the content persists after a page refresh.
3. Refine a section — confirm the character count grows, the section updates, and the content persists after a page refresh.
4. For each of the three flows, temporarily break `GEMINI_API_KEY`, retry, and confirm an error is shown (toast or banner) rather than an infinite/stuck loading state — then restore the key.

- [ ] **Step 5: Confirm no dead code remains**

Run: `grep -rn "generateJson" app lib components` — expected matches: only `lib/gemini.ts` (definition) and `lib/rpp.check.ts` (its one remaining caller). If `createRpp`, `generatePertemuan`, or `refineSection` show up anywhere via `grep -rn "createRpp\|generatePertemuan\|refineSection" app components`, track down and remove the stale reference.
