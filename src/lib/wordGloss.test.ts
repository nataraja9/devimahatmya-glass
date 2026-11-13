// SOMNATH-AI: Word gloss tests | ZONE: 0 | PURPOSE: Lock word meanings to the selected language | CONTRACT: A gloss names the word · it does not add a teaching
import { describe, expect, it } from "vitest";
import { glossWords, verseMeaning } from "./wordGloss";

const LINE = "या देवी सर्वभूतेषु निद्रारूपेण संस्थिता । नमस्तस्यै नमः";

describe("glossWords", () => {
  it("gives the meaning in the selected language", () => {
    const en = glossWords(LINE, "en");
    const hi = glossWords(LINE, "hi");
    const te = glossWords(LINE, "te");
    expect(en.find((word) => word.w === "देवी")?.m).toBe("the Goddess");
    expect(hi.find((word) => word.w === "देवी")?.m).toBe("देवी");
    expect(te.find((word) => word.w === "देवी")?.m).toBe("దేవి");
    expect(en.find((word) => word.w === "सर्वभूतेषु")?.m).toBe("in all beings");
    expect(hi.find((word) => word.w === "सर्वभूतेषु")?.m).toBe("समस्त प्राणियों में");
    expect(te.find((word) => word.w === "निद्रारूपेण")?.m).toBe("నిద్ర రూపంలో");
    expect(en.find((word) => word.w === "नमस्तस्यै")?.m).toBe("salutation to her");
    expect(en.every((word) => word.m.length > 0)).toBe(true);
  });

  it("keeps the spoken reading beside the meaning", () => {
    const [first] = glossWords("विनियोगः", "en");
    expect(first?.m).toBe("the ritual direction");
    expect(first?.reading).toMatch(/viniyoga/i);
  });

  it("turns the verse into one meaning in the selected language", () => {
    expect(verseMeaning(LINE, "en")).toBe("To the Goddess who abides in all beings in the form of sleep — salutation.");
    expect(verseMeaning(LINE, "hi")).toBe("जो देवी समस्त प्राणियों में निद्रा के रूप में स्थित है, उसे नमस्कार।");
    expect(verseMeaning(LINE, "te")).toContain("సమస్త ప్రాణులలో");
    expect(verseMeaning(LINE, "en")).not.toContain("·");
    expect(verseMeaning("सावर्णिः सूर्यतनयो यो मनुः कथ्यतेऽष्टमः । निशामय तदुत्पत्तिं विस्तराद्गदतो मम", "en")).toBe("Savarni son of the sun who Manu is called the eighth listen that arising in full as I tell it my.");
  });
});
