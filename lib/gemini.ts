const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;
const GENERATE_ENDPOINT = `${BASE}:generateContent`;
const STREAM_ENDPOINT = `${BASE}:streamGenerateContent?alt=sse`;

// Total wall-clock budget for one generation, retries included. A teacher is
// watching a spinner: better to fail with a clear message than to keep retrying
// a service that is refusing us.
//
// Streaming gets a larger budget than a single non-streaming call: with
// thinking-mode generation, the model can take a while before the first
// output token, and the streaming UI keeps the wait visible to the teacher
// the whole time, so it's worth waiting longer for it to complete.
const BUDGET_MS = 90_000;
const STREAM_BUDGET_MS = 180_000;

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

/** Opens `endpoint`, retrying while Gemini is busy, within `budgetMs` total. */
async function openWithRetry(endpoint: string, body: string, budgetMs: number): Promise<Response> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const deadline = Date.now() + budgetMs;
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

  if (!res) throw new Error(`Layanan AI (${MODEL}) tidak merespons dalam ${budgetMs / 1000} detik. Coba lagi.`);

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
  const res = await openWithRetry(GENERATE_ENDPOINT, buildBody(prompt, schema), BUDGET_MS);
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
  const res = await openWithRetry(STREAM_ENDPOINT, buildBody(prompt, schema), STREAM_BUDGET_MS);
  const body = res.body;
  if (!body) throw new Error('Gemini tidak mengembalikan aliran data');

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  try {
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
          // Only the first content part is read. Safe only because
          // thinkingConfig never sets `includeThoughts` — if that's ever
          // turned on, a "thought" part could appear before the answer part
          // and this would need to pick the right part instead of [0].
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        }
      }
    }
  } catch (e) {
    if (e instanceof Error && (e.name === 'AbortError' || e.name === 'TimeoutError')) {
      throw new Error(`Layanan AI (${MODEL}) berhenti merespons sebelum selesai. Coba lagi.`);
    }
    throw e;
  }
}
