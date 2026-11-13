// Full Sanskrit text per chapter / anga stotra (source: sanskritdocuments.org) plus estimated start times in the recitation.
import times from "./verse-times.json";
import stotraTimes from "./stotra-times.json";
export type Verse = { v: number; sa: string };
const files = import.meta.glob<Verse[]>("./verses/chapter_*.json", { import: "default" });
const stotras = import.meta.glob<Verse[]>("./stotras/*.json", { import: "default" });
/** key: chapter number (1–13) or stotra id (e.g. "argala"). */
export async function loadVerses(key: number | string): Promise<Verse[]> {
  const f = typeof key === "number" ? files[`./verses/chapter_${key}.json`] : stotras[`./stotras/${key}.json`];
  return f ? await f() : [];
}
export function verseTimes(key: number | string): number[] {
  return typeof key === "number" ? ((times as Record<string, number[]>)[String(key)] ?? []) : ((stotraTimes as Record<string, number[]>)[key] ?? []);
}
