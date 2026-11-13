import { describe, expect, it } from "vitest";
import { toSpokenLatin } from "./owned-voice";

describe("spoken latin", () => {
  it("reads a key verse in syllables an English voice can say", () => {
    const spoken = toSpokenLatin("या देवी सर्वभूतेषु निद्रारूपेण संस्थिता");
    expect(spoken.startsWith("yaa de")).toBe(true);
    expect(spoken).toContain("ni draa");
    expect(spoken).not.toMatch(/[\u0900-\u097F]/);
  });
});
