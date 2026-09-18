# RPP generation — real streaming progress — Design

Date: 2026-09-18
Status: Approved in chat, pending spec review

## Goal

Replace the indeterminate spinner shown during RPP (Modul Ajar) generation with
real, live progress driven by Gemini's actual output stream — for all three
generation flows: creating an RPP, generating a single pertemuan, and
refining a section.

## Scope

In scope:

- `createRpp` (skeleton generation), `generatePertemuan`, `refineSection` —
  their Gemini call + the UI that shows generation is in progress.
- A new streaming primitive in `lib/gemini.ts`.
- New Route Handlers to carry SSE from Gemini to the browser.
- A shared client hook for consuming the stream.

Out of scope:

- Model/thinking-level choice (already `gemini-3.8-flash`, `thinkingLevel: 'high'` —
  unchanged by this work).
- Any other Server Action (`saveSection`, `savePertemuan`, `deleteRpp`) — these
  don't call Gemini and are untouched.
- Retrying a partially-streamed generation — see Error handling.

## Background

Today, `lib/gemini.ts#generateJson<T>()` makes one non-streaming
`generateContent` call with `responseMimeType: 'application/json'` +
`responseSchema`, and the three call sites (`app/(app)/rpp/actions.ts`) are
plain Server Actions invoked via `<form action>` (`createRpp`) or
`useTransition` (`generatePertemuan`, `refineSection`). The UI shows a fixed
pulsing circle / sliding bar (`CreateRppForm.tsx`) or dims the card and
changes button text (`PertemuanCard.tsx`, `Section.tsx`) for the whole call
duration — no signal of what's actually happening.

Gemini bills identically for `generateContent` and `streamGenerateContent`
(token-based, confirmed against `ai.google.dev/gemini-api/docs/pricing`), so
switching to streaming has no cost impact.

Whether Gemini streams visible thought-summary content during the "thinking"
phase for a structured-JSON (`responseSchema`) request is unconfirmed from
available docs — this design does **not** depend on it. The silent-thinking
period is shown honestly as an indeterminate state (see Data flow).

## Architecture

Three new Route Handlers replace the Gemini-calling portion of the
corresponding Server Actions. The Server Actions' non-generation
responsibilities (auth, DB writes) move into the handlers; the actions
themselves either stay for non-generation operations or are removed if fully
superseded.

| Route | Replaces | Ends with |
|---|---|---|
| `POST /api/rpp/generate` | `createRpp`'s Gemini call + insert | `{type:'done', id}` |
| `POST /api/rpp/[id]/pertemuan/[no]` | `generatePertemuan` | `{type:'done', pertemuan}` |
| `POST /api/rpp/[id]/refine` | `refineSection`'s Gemini call | `{type:'done', key, value}` |

Each handler:
1. Runs the same auth/ownership checks as its Server Action does today
   (`requireTeacher()`, `loadOwned(id)` where applicable).
2. Calls a new `streamJson<T>()` in `lib/gemini.ts`.
3. Emits SSE progress events to the browser as text arrives (see Data flow).
4. On completion, does the same DB write the Server Action does today
   (`insertRpp`, `updateRppContent`) and `revalidatePath`.
5. Emits a final `done` event with whatever the client needs next.

`lib/gemini.ts` gains:

```ts
async function* streamJson(prompt: string, schema: object): AsyncGenerator<string>
```

It reuses the existing pre-request retry/backoff loop (429/500/503, bounded by
`BUDGET_MS`) to open `POST .../streamGenerateContent?alt=sse`, then yields
each raw text delta as it arrives (decoded from the SSE `data:` lines). The
existing `generateJson<T>()` stays as-is; if nothing ends up calling it after
this work, it's removed rather than kept dead.

## Data flow

Each route handler knows the ordered top-level keys of the schema it's
using:

- Skeleton: `identitas, identifikasiMurid, identifikasiMateri, dimensiProfilLulusan, tujuanPembelajaran, indikator, praktikPedagogis, lingkunganPembelajaran, kemitraanPembelajaran, pemanfaatanDigital, rutePertemuan, asesmenSumatif, rencanaTindakLanjut, daftarPustaka` (14 keys)
- Pertemuan: `no, judul, pengalamanBelajar, prinsip, media, langkah, asesmen` (7 keys)
- Refine: `value` (1 key — no sub-key granularity possible)

As deltas arrive from `streamJson`, the handler appends them to a buffer and,
for skeleton/pertemuan, regex-checks for newly-appeared `"key":` markers in
schema order. Each new key found emits:

```
{type:'stage', key: 'asesmenSumatif', label: 'Asesmen Sumatif'}
```

Labels are pulled from the existing `SECTIONS` array (`lib/rpp.ts`) where the
key matches a section; a small additional map covers keys that aren't
sections (`identitas`, `pertemuan`-only keys like `judul`, `langkah`, etc.).

Before the first key appears, the handler emits `{type:'thinking'}` once, so
the client shows an honest indeterminate state for the (possibly long, given
`thinkingLevel: 'high'`) silent period before output tokens start.

For refine (single `value` key), there's no sub-key to detect, so the handler
instead emits `{type:'progress', chars: N}` on a throttle (e.g. every ~200ms
or every N new characters) so the client can show a growing word/character
count.

On stream end, the handler `JSON.parse`s the full accumulated buffer — same
as `generateJson` does today, same "schema guarantees valid JSON, no runtime
validator" invariant — does the DB write, then emits `done`.

On the client, one shared hook:

```ts
function useStreamedGeneration<T>(): {
  start(url: string, body: unknown): void;
  phase: 'idle' | 'thinking' | 'streaming' | 'done' | 'error';
  stages: { key: string; label: string }[];  // stages completed so far, in order
  progress: number | null;                   // chars, for refine's word-count display
  result: T | null;
  error: string | null;
}
```

It does the `fetch(url, {method:'POST', body})`, reads `res.body` as a
stream, splits on SSE event boundaries, and updates the state above as
events arrive. `CreateRppForm`, `PertemuanCard`, and `Section.tsx` each
consume it and render their own UI:

- `CreateRppForm` / `PertemuanCard`: a checklist that grows as `stages`
  grows, replacing the pulsing circle / sliding bar and the "menyusun..."
  button text.
- `Section.tsx` (refine): a growing word count instead of a checklist,
  since refine's schema has no sub-keys.

## Error handling

- The existing pre-request retry loop moves into `streamJson` unchanged — it
  governs *opening* the stream (retries on 429/500/503 within `BUDGET_MS`).
  Once the stream has started (HTTP 200 received), there is no further
  retry.
- If the connection drops mid-stream after starting, the handler emits
  `{type:'error', message}` and closes. No auto-retry: retrying would
  restart the whole generation from Gemini from scratch anyway, so this is
  the same failure the user sees today, just possibly detected a little
  later than a non-streaming call would.
- The client surfaces an `error` event through each component's existing
  error UI (`pushToast` in `PertemuanCard`, the error banner in
  `CreateRppForm`, whatever `Section.tsx` uses today), fed from the hook's
  `error` state instead of a caught exception.
- `redirect()` cannot be called from a Route Handler the way `createRpp`
  calls it today. The `/api/rpp/generate` handler returns the new `id` in
  its `done` event; the client calls `router.push(`/rpp/${id}`)` once that
  arrives.

## Testing

No test runner exists in this repo (`package.json` has no `test` script).
Verification is:

- `tsc --noEmit` and `lint` as a baseline.
- Manual browser testing of all three flows:
  - Normal completion — checklist fills in an order matching the real
    output structure, final saved content is correct, `createRpp` redirects.
  - Forced failure (temporarily invalid `GEMINI_API_KEY`) — confirms the
    error event surfaces the right localized message and the UI doesn't get
    stuck in a loading state.
