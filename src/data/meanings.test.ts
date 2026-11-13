// SOMNATH-AI: Verse meaning coverage | ZONE: 0 | PURPOSE: Every recited verse has an English meaning | CONTRACT: The meaning names the verse number and is not empty
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)));
type Row = { v: number; sa?: string; m?: string };

function rows(dir: string, file: string): Row[] {
  return JSON.parse(readFileSync(join(root, dir, file), "utf8")) as Row[];
}

describe("English meanings cover every verse", () => {
  const chapters = readdirSync(join(root, "verses")).filter((name) => name.endsWith(".json"));
  const stotras = readdirSync(join(root, "stotras")).filter((name) => name.endsWith(".json"));

  it("has a meaning file for every chapter and every pre and post stotra", () => {
    const meanings = new Set(readdirSync(join(root, "meanings")));
    for (const name of [...chapters, ...stotras]) expect(meanings.has(name), name).toBe(true);
  });

  it.each([...chapters.map((name) => ["verses", name] as const), ...stotras.map((name) => ["stotras", name] as const)])(
    "%s/%s",
    (dir, name) => {
      const source = rows(dir, name);
      const meaning = rows("meanings", name);
      expect(meaning.map((row) => row.v)).toEqual(source.map((row) => row.v));
      for (const row of meaning) {
        expect(row.m?.trim().length, `${name} ${row.v}`).toBeGreaterThan(8);
        expect(row.m).not.toMatch(/[\u0900-\u097F]/);
      }
    },
  );
});
