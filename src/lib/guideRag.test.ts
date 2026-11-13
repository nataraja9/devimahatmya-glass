// SOMNATH-AI: Guide RAG tests | ZONE: 0 | PURPOSE: Check that Ask the Guide retrieves the matching passage | CONTRACT: No live model call
import { describe, expect, it } from "vitest";
import { answerFromCites, passagesForGuide, retrieveGuide } from "./guideRag";

describe("guide retrieval", () => {
  it("retrieves the three charitras", () => {
    const cites = retrieveGuide("What do the three charitras represent?");
    expect(cites.some((cite) => cite.title === "Three charitras" && cite.text.includes("Prathama"))).toBe(true);
  });

  it("retrieves the Mahishasura chapters", () => {
    const cites = retrieveGuide("Who is Mahishasura?");
    expect(cites.some((cite) => cite.chapter === 2 || cite.chapter === 3)).toBe(true);
  });

  it("keeps the chapter the learner is studying", () => {
    const cites = retrieveGuide("What is happening here?", 11);
    expect(cites[0]?.chapter).toBe(11);
    expect(cites[0]?.title).toBe("Narayani Stuti");
  });

  it("locates a Sanskrit line by its verse", () => {
    const cites = retrieveGuide("या देवी सर्वभूतेषु निद्रारूपेण संस्थिता");
    expect(cites.some((cite) => cite.verse != null && cite.text.includes("निद्रारूपेण"))).toBe(true);
  });

  it("answers what a trishul is from the weapon list", () => {
    const cites = retrieveGuide("what is trishul");
    expect(cites.some((cite) => cite.text.includes("त्रिशूल"))).toBe(true);
    expect(passagesForGuide(cites)).toContain("त्रिशूल");
  });

  it("treats a shortened trishu as the trishula", () => {
    const cites = retrieveGuide("what is trishu;");
    expect(cites.some((cite) => cite.text.includes("त्रिशूल"))).toBe(true);
    expect(answerFromCites("what is trishu;", cites)).toContain("Reading “trishu” as trishul");
  });

  it("finds Mahishasura when a letter is missing", () => {
    const cites = retrieveGuide("who is mahisasura");
    expect(cites.some((cite) => cite.chapter === 2 || cite.chapter === 3)).toBe(true);
    expect(answerFromCites("who is mahisasura", cites)).toContain("Mahishasura");
  });

  it("finds the kavacham from a short spelling", () => {
    const cites = retrieveGuide("what is kavach");
    expect(cites.some((cite) => cite.title.includes("Kavach"))).toBe(true);
  });

  it("refuses a verse number when nothing was retrieved", () => {
    expect(passagesForGuide([])).toContain("Do not quote");
  });
});
