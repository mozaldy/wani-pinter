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
      let terminal = false;

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
            terminal = true;
            setPhase('done');
            setResult(evt as unknown as T);
          } else if (evt.type === 'error') {
            terminal = true;
            setPhase('error');
            setError(evt.message);
          }
        }
      }

      // The stream ended without ever sending a 'done' or 'error' event —
      // e.g. a serverless function's execution cap silently killed the
      // connection mid-stream. Without this, `phase` would stay stuck at
      // 'thinking'/'streaming' forever with no way for the UI to recover.
      if (!terminal) {
        setPhase('error');
        setError('Koneksi berhenti sebelum selesai. Coba lagi.');
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
