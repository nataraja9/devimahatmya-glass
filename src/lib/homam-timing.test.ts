import { describe, expect, it } from "vitest";
import { recitationPosition } from "./homam-timing";

describe("recording-driven mantra timing", () => {
  const cues = [1755, 1803.5, 1807.6];
  it("changes mantra exactly at the recording cue", () => {
    expect(recitationPosition(1803.49, cues, 1819.1).index).toBe(0);
    expect(recitationPosition(1803.5, cues, 1819.1)).toEqual({ index: 1, progress: 0 });
  });
  it("derives rising progress from playback seconds, not a fixed loop", () => {
    expect(recitationPosition(1805.55, cues, 1819.1).progress).toBeCloseTo(.5);
  });
  it("seeking backwards restores the appropriate mantra", () => {
    expect(recitationPosition(1809, cues, 1819.1).index).toBe(2);
    expect(recitationPosition(1800, cues, 1819.1).index).toBe(0);
    expect(recitationPosition(1754, cues, 1819.1).index).toBe(-1);
  });
});
