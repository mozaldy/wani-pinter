const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Total wall-clock budget for one generation, retries included. A teacher is
// watching a spinner: better to fail with a clear message than to keep retrying
// a service that is refusing us. Measured calls run 3-5s, so this is ~20x slack.
const BUDGET_MS = 90_000;

const BUSY = new Set([429, 500, 503]);

/**
 * Ask Gemini for JSON matching `schema`. The schema is enforced during decoding,
 * so the returned object is structurally guaranteed — no runtime validator needed.
 */
export async function generateJson<T>(prompt: string, schema: object): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
  });

  const deadline = Date.now() + BUDGET_MS;
  let res: Response | undefined;
  let attempt = 0;

  // Retry only while there is budget left — a slow 503 must not buy itself
  // another full attempt, which is how one busy model turned into a 4.5min wait.
  while (Date.now() < deadline) {
    const remaining = deadline - Date.now();
    try {
      res = await fetch(ENDPOINT, {
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

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error(`Gemini tidak mengembalikan isi (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'unknown'})`);
  return JSON.parse(text) as T;
}
