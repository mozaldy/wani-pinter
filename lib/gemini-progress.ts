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
