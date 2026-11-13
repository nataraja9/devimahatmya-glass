/** Absolute recording cues, never elapsed wall-clock timers. */
export function recitationPosition(time: number, starts: readonly number[], end: number) {
  let index = -1;
  for (let n = 0; n < starts.length && (starts[n] ?? Infinity) <= time; n++) index = n;
  const start = starts[index] ?? time;
  const stop = starts[index + 1] ?? end;
  return { index, progress: index < 0 ? 0 : Math.max(0, Math.min(1, (time - start) / Math.max(.01, stop - start))) };
}
