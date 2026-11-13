// SOMNATH-AI: IAST tests | ZONE: 0 | PURPOSE: Lock the Roman spelling of a recited verse | CONTRACT: The spelling follows the aksharas and adds no words
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { toIast } from "./iast";

const LINE = "\u0938\u093e\u0935\u0930\u094d\u0923\u093f\u0903 \u0938\u0942\u0930\u094d\u092f\u0924\u0928\u092f\u094b \u092f\u094b \u092e\u0928\u0941\u0903 \u0915\u0925\u094d\u092f\u0924\u0947\u093d\u0937\u094d\u091f\u092e\u0903 \u0964\n\u0928\u093f\u0936\u093e\u092e\u092f \u0924\u0926\u0941\u0924\u094d\u092a\u0924\u094d\u0924\u093f\u0902 \u0935\u093f\u0938\u094d\u0924\u0930\u093e\u0926\u094d\u0917\u0926\u0924\u094b \u092e\u092e";

describe("toIast", () => {
  it("spells the Savarni verse in Roman letters", () => {
    expect(toIast(LINE)).toBe("s\u0101var\u1e47i\u1e25 s\u016bryatanayo yo manu\u1e25 kathyate'\u1e63\u1e6dama\u1e25 |\nni\u015b\u0101maya tadutpatti\u1e43 vistar\u0101dgadato mama");
  });

  it("keeps a vowel mark that is joined through a zero-width joiner", () => {
    expect(toIast("\u0936\u200d\u0943\u0919\u094d\u0917\u0947")).toBe("\u015b\u1e5b\u1e45ge");
    expect(toIast("\u0939\u094d\u0931\u0940\u0902")).toBe("hr\u012b\u1e43");
  });

  it("leaves no Devanagari in any recited verse", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../data");
    const files = [
      ...readdirSync(join(root, "verses")).map((name) => join(root, "verses", name)),
      ...readdirSync(join(root, "stotras")).map((name) => join(root, "stotras", name)),
    ];
    const leftover = new Set<string>();
    for (const file of files) {
      const verses = JSON.parse(readFileSync(file, "utf8")) as { sa: string }[];
      for (const verse of verses) {
        for (const ch of toIast(verse.sa)) if (/[\u0900-\u097F]/.test(ch)) leftover.add(ch);
      }
    }
    expect([...leftover]).toEqual([]);
  });
});
