// SOMNATH-AI: Verse meanings | ZONE: 0 | PURPOSE: Load the English meaning of each recited verse | CONTRACT: State what the verse says · do not add a teaching
export type VerseMeaning = { v: number; m: string };
const files = import.meta.glob<VerseMeaning[]>("./meanings/*.json", { import: "default" });

/** key: chapter number (1–13) or stotra id (e.g. "argala"). */
export async function loadMeanings(key: number | string): Promise<VerseMeaning[]> {
  const name = typeof key === "number" ? `chapter_${key}` : key;
  const load = files[`./meanings/${name}.json`];
  return load ? await load() : [];
}
