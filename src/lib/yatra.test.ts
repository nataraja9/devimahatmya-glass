// SOMNATH-AI: Sacred Yatra tests | ZONE: 0 | PURPOSE: Prove the trail unlocks one step at a time. | CONTRACT: A locked step cannot mint a token.
import { describe, expect, it } from "vitest";
import { yatraSteps } from "@/data/yatra";
import { yatraProfile } from "@/data/yatra-profile";
import { completeYatraStep, initialYatra, isYatraUnlocked, restoreYatra } from "./yatra";

describe("13-step sacred trail", () => {
  it("preserves prototype estimates and marks the Bhairon extension beyond the 13 km Bhawan leg", () => {
    expect(yatraProfile).toHaveLength(13);
    expect(yatraProfile[0]?.km).toBe("0.0");
    expect(yatraProfile[7]?.elev).toBe(2190);
    expect(yatraProfile[11]?.km).toBe("13.0");
    expect(yatraProfile[12]?.km).toBe("13.0+");
  });
  it("begins at Katra with only Chapter 1 unlocked", () => {
    expect(yatraSteps[0]).toEqual({ chapter: 1, place: "Katra Yatra Darwaza", token: "Awakening" });
    expect(yatraSteps.filter(s => isYatraUnlocked(initialYatra(), s.chapter)).map(s => s.chapter)).toEqual([1]);
  });
  it("cannot receive a token for a locked step", () => {
    expect(completeYatraStep(initialYatra(), 2)).toEqual({ completed: 0 });
  });
  it("each completed chapter receives one token and unlocks the next", () => {
    const state = completeYatraStep(initialYatra(), 1);
    expect(state.completed).toBe(1);
    expect(isYatraUnlocked(state, 2)).toBe(true);
    expect(isYatraUnlocked(state, 3)).toBe(false);
    expect(completeYatraStep(state, 1)).toEqual(state);
  });
  it("forms the crown only after all 13 chapters, ending at Bhaironath", () => {
    let state = initialYatra();
    for (let chapter = 1; chapter <= 12; chapter++) state = completeYatraStep(state, chapter);
    expect(state.completed).toBe(12);
    expect(yatraSteps[12]).toEqual({ chapter: 13, place: "Bhaironath Temple Peak", token: "Crown Boon" });
    state = completeYatraStep(state, 13);
    expect(state.completed).toBe(13);
    expect(completeYatraStep(state, 14)).toEqual(state);
  });
  it("restores valid saved progress and rejects broken or out-of-range values", () => {
    expect(restoreYatra('{"completed":7}')).toEqual({ completed: 7 });
    for (const raw of ['{"completed":14}', '{"completed":-1}', '{"completed":1.5}', '{"completed":"2"}', "broken"]) {
      expect(restoreYatra(raw)).toEqual(initialYatra());
    }
  });
});
