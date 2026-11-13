import { describe, it, expect } from "vitest";
import { chapterForDay, chaptersForDay, reply, fresh, JOURNEY_DAYS, paceFor, daysSince, starterCards, stylePrefs, weekOf, reminderPlan, sankalpaToken } from "./journey";

describe("90-day journey", () => {
  it("starts on chapter 1 and ends on chapter 13", () => {
    expect(chapterForDay(1)).toBe(1);
    expect(chapterForDay(90)).toBe(13);
    expect(JOURNEY_DAYS).toBe(90);
  });
  it("DONE completes today and advances", () => {
    const s = reply(fresh(), "DONE");
    expect(s.day).toBe(2);
    expect(s.done).toEqual([1]);
  });
  it("PAUSE holds the day; DONE is ignored until RESUME", () => {
    let s = reply(fresh(), "PAUSE");
    s = reply(s, "DONE");
    expect(s.day).toBe(1);
    s = reply(reply(s, "RESUME"), "DONE");
    expect(s.day).toBe(2);
  });
  it("STOP ends the journey; RESUME starts over at day 1", () => {
    let s = reply(reply(fresh(), "DONE"), "STOP");
    expect(s.status).toBe("stopped");
    expect(reply(s, "DONE").day).toBe(2);
    s = reply(s, "RESUME");
    expect(s.day).toBe(1);
    expect(s.status).toBe("active");
  });
});

describe("adaptive pace", () => {
  it("1 missed day stays steady, 2 is gentle, 5 offers catch-up", () => {
    expect(paceFor(1)).toBe("steady");
    expect(paceFor(2)).toBe("gentle");
    expect(paceFor(5)).toBe("catchup");
  });
  it("counts whole days since last check-in", () => {
    expect(daysSince("2026-01-01T00:00:00Z", new Date("2026-01-04T12:00:00Z"))).toBe(3);
  });
});

describe("starter cards and feedback", () => {
  it("new learner is first offered a sankalpa", () => {
    expect(starterCards(fresh(), {}, 0)[0]!.id).toBe("sankalpa");
  });
  it("paused journey offers resume with the remembered reason", () => {
    const c = starterCards({ ...fresh(), status: "paused" }, { sankalpa: { intent: "x", focus: [], why: "", name: "A", gotra: "B", nakshatra: "C", days: 13 }, pauseReason: "Travel" }, 0);
    expect(c[0]!.id).toBe("resume");
    expect(c[0]!.why).toContain("Travel");
  });
  it("2 missed days offers a lighter day; 3 reflections in a week offer the mirror", () => {
    const a = { sankalpa: { intent: "x", focus: [], why: "", name: "A", gotra: "B", nakshatra: "C", days: 13 }, reflections: [1, 2, 3].map((d) => ({ day: d, text: "t" })) };
    const ids = starterCards({ ...fresh(), day: 4 }, a, 2).map((c) => c.id);
    expect(ids).toContain("light");
    expect(ids).toContain("mirror");
  });
  it("only thumbs-down tags become style lessons", () => {
    expect(stylePrefs([{ up: false, tag: "Too long" }, { up: true, tag: "Warm" }, { up: false, tag: "Too long" }])).toEqual(["Too long"]);
  });
  it("day 8 is week 2", () => expect(weekOf(8)).toBe(2));
});

describe("sankalpa periods", () => {
  it("1 day covers all 13 chapters", () => expect(chaptersForDay(1, 1)).toHaveLength(13));
  it("13 days is one chapter a day", () => { expect(chaptersForDay(1, 13)).toEqual([1]); expect(chaptersForDay(13, 13)).toEqual([13]); });
  it("8 days covers every chapter exactly once", () => expect(Array.from({ length: 8 }, (_, i) => chaptersForDay(i + 1, 8)).flat()).toEqual(Array.from({ length: 13 }, (_, i) => i + 1)));
  it("108 days ends on chapter 13", () => { expect(chaptersForDay(1, 108)).toEqual([1]); expect(chaptersForDay(108, 108)).toEqual([13]); });
  it("DONE on the last day of a 13-day sankalpa finishes it", () => expect(reply({ ...fresh(), len: 13, day: 13 }, "DONE").day).toBe(14));
  it("mints a card token that starts with 999 and changes each time", () => {
    expect(sankalpaToken("482910337")).toBe("999482910337");
    expect(sankalpaToken("1")).toBe("999000000001");
    expect(sankalpaToken("482910337").startsWith("999")).toBe(true);
    expect(sankalpaToken("482910338")).toBe("999482910338");
  });
  it("records a daily reminder across the chosen channels", () => {
    expect(reminderPlan(13, "06:00", "UTC", ["sms", "email", "whatsapp"], "2026-11-13")).toBe("One reminder a day at 06:00 (UTC), for 13 days from 2026-11-13, by SMS, Email, WhatsApp.");
  });
});
