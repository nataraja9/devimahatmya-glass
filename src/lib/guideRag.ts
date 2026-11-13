// SOMNATH-AI: Guide RAG | ZONE: 0 | PURPOSE: Retrieve Saptashati passages for Ask the Guide | CONTRACT: Cite only text held in this companion · no invented verse number
import { chapters, charitras } from "@/data/chapters";
import { stotras } from "@/data/stotras";

export type GuideCite = { title: string; text: string; chapter?: number; verse?: number };

type Verse = { v: number; sa: string };
type Row = { title: string; chapter?: number; verse: number; sa: string; flat: string };

const versePacks = import.meta.glob<Verse[]>("../data/verses/chapter_*.json", { eager: true, import: "default" });
const stotraPacks = import.meta.glob<Verse[]>("../data/stotras/*.json", { eager: true, import: "default" });
const ALIASES = [{ words: ["trishul", "trishula", "trishulam", "trident", "trisula"], needle: "त्रिशूल", lead: "The trishula (त्रिशूल) is named among the weapons in the Devi's hands." }];
const STOP = new Set(["the", "and", "for", "what", "how", "why", "who", "are", "you", "can", "this", "that", "with", "from", "your", "about", "does", "have", "has", "into", "they", "them", "their", "was", "were", "will", "should", "could", "would", "please", "explain", "help", "mean", "meaning", "deeper", "daily", "life", "apply", "beginner", "start", "reciting", "tell"]);

let vocab: string[] | null = null;

function vocabulary(): string[] {
  if (vocab) return vocab;
  const words = new Set<string>();
  const add = (value: string) => tokens(value).forEach((word) => { if (word.length >= 5) words.add(word); });
  for (const chapter of chapters) { add(chapter.title); add(chapter.theme); add(chapter.story); add(chapter.verse.en); add(chapter.verse.tr); add(chapter.practice); }
  for (const charitra of charitras) { add(charitra.name); add(charitra.deity); add(charitra.essence); }
  for (const stotra of stotras) { add(stotra.name); add(stotra.purpose); }
  for (const alias of ALIASES) alias.words.forEach((word) => words.add(word));
  vocab = [...words];
  return vocab;
}

function levenshtein(left: string, right: string, limit: number): number {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0];
    row[0] = i;
    let best = row[0];
    for (let j = 1; j <= right.length; j++) {
      const current = row[j];
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      row[j] = Math.min(current + 1, row[j - 1] + 1, previous + cost);
      previous = current;
      if (row[j] < best) best = row[j];
    }
    if (best > limit) return limit + 1;
  }
  return row[right.length];
}

/** Nearest companion word for a misspelling, or the word itself when it is already known. */
function closest(word: string): string | null {
  if (word.length < 5) return null;
  const known = vocabulary();
  if (known.includes(word)) return word;
  const prefixes = known.filter((item) => item.startsWith(word) && item.length - word.length <= 3);
  if (prefixes.length) return prefixes.sort((a, b) => a.length - b.length)[0];
  const limit = word.length >= 8 ? 2 : 1;
  let best = "";
  let bestDistance = limit + 1;
  let ties = 0;
  for (const item of known) {
    const distance = levenshtein(word, item, limit);
    if (distance < bestDistance) { best = item; bestDistance = distance; ties = 1; }
    else if (distance === bestDistance) ties += 1;
  }
  return best && bestDistance <= limit && ties === 1 ? best : null;
}

function correctedTerms(query: string): string[] {
  return tokens(query.replace(/chapter\s+\d{1,2}/i, " ")).map((word) => closest(word) ?? word);
}

let rows: Row[] | null = null;

function verseIndex(): Row[] {
  if (rows) return rows;
  rows = [];
  for (const [path, verses] of Object.entries(versePacks)) {
    const chapter = Number(path.match(/chapter_(\d+)/)?.[1] ?? 0);
    if (!chapter) continue;
    const title = chapters.find((item) => item.n === chapter)?.title ?? `Chapter ${chapter}`;
    for (const verse of verses) rows.push({ title, chapter, verse: verse.v, sa: verse.sa, flat: squash(verse.sa) });
  }
  for (const [path, verses] of Object.entries(stotraPacks)) {
    const id = path.match(/\/([^/]+)\.json$/)?.[1] ?? "";
    const title = stotras.find((item) => item.id === id)?.name ?? id;
    for (const verse of verses) rows.push({ title, verse: verse.v, sa: verse.sa, flat: squash(verse.sa) });
  }
  return rows;
}

function squash(value: string): string {
  return value.replace(/[\s।॥]+/g, "");
}

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !STOP.has(word));
}

function chapterPassage(chapter: (typeof chapters)[number]): GuideCite {
  return {
    chapter: chapter.n,
    title: chapter.title,
    text: `${chapter.theme}. ${chapter.story}\nLine: ${chapter.verse.sa}\nMeaning: ${chapter.verse.en}`,
  };
}

/** Passages from the companion text that match this question. */
export function retrieveGuide(query: string, chapter?: number): GuideCite[] {
  const chapterWord = tokens(query).some((word) => word === "chapter" || levenshtein(word, "chapter", 1) <= 1);
  const hinted = Number(query.match(/(?:chapter|chapt\w*|chapte\w*)\s+(\d{1,2})/i)?.[1] ?? (chapterWord ? query.match(/(\d{1,2})/)?.[1] : ""));
  const focus = chapter && chapter >= 1 && chapter <= 13 ? chapter : hinted >= 1 && hinted <= 13 ? hinted : undefined;
  const terms = correctedTerms(query);
  const cites: GuideCite[] = [];

  const needles = (query.match(/[\u0900-\u097F][\u0900-\u097F\s।॥]{6,}/g) ?? []).map(squash).filter((run) => run.length >= 8);
  for (const alias of ALIASES) if (terms.some((term) => alias.words.includes(term))) needles.unshift(alias.needle);
  for (const run of needles.slice(0, 2)) {
    const hits = verseIndex().filter((row) => row.flat.includes(run)).sort((a, b) => Number(b.flat.includes("त्रिशूलं")) - Number(a.flat.includes("त्रिशूलं")));
    for (const row of hits) {
      const line = row.sa.split("\n").find((part) => part.includes(run) || squash(part).includes(run)) ?? row.sa;
      cites.push({ title: row.title, text: line.trim(), ...(row.chapter ? { chapter: row.chapter } : {}), verse: row.verse });
      if (cites.length >= 3) break;
    }
    if (cites.length >= 3) break;
  }

  const charitraText = charitras.map((item) => `${item.name} (${item.devanagari}), ${item.deity}, ${item.guna}: ${item.essence}`).join("\n");
  const charitraScore = tokens(charitraText).filter((word) => terms.includes(word)).length + (terms.some((term) => term.startsWith("charitra")) ? 6 : 0);
  const scored = chapters.map((item) => {
    const blob = [item.title, item.sanskritTitle, item.theme, item.story, item.practice, item.verse.en, item.verse.tr, ...item.lessons].join(" ");
    const hay = new Set(tokens(blob));
    let score = terms.reduce((sum, word) => sum + (hay.has(word) ? (item.title.toLowerCase().includes(word) || item.theme.toLowerCase().includes(word) ? 3 : 1) : 0), 0);
    if (focus === item.n) score += 8;
    return { item, score };
  });
  const stotraScored = stotras.map((item) => {
    const hay = new Set(tokens(`${item.name} ${item.sanskrit} ${item.purpose}`));
    const score = terms.reduce((sum, word) => sum + (hay.has(word) ? 2 : 0), 0);
    return { item, score };
  });

  const top = scored.filter((row) => row.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  if (charitraScore >= 4) cites.push({ title: "Three charitras", text: charitraText });
  for (const row of top) cites.push(chapterPassage(row.item));
  for (const row of stotraScored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 1)) {
    cites.push({ title: row.item.name, text: row.item.purpose });
  }
  if (focus && !cites.some((cite) => cite.chapter === focus)) {
    const chosen = chapters.find((item) => item.n === focus);
    if (chosen) cites.unshift(chapterPassage(chosen));
  }
  return cites.slice(0, 5);
}

function citeWhere(cite: GuideCite): string {
  return [cite.chapter ? `Chapter ${cite.chapter}` : "", cite.verse != null ? `verse ${cite.verse}` : "", cite.title].filter(Boolean).join(", ");
}

/** A grounded reply when the model gateway is not available. */
export function answerFromCites(query: string, cites: GuideCite[]): string {
  if (!cites.length) return "No passage in this companion matches that question.";
  const fix = tokens(query).map((word) => ({ from: word, to: closest(word) })).find((item) => item.to && item.to !== item.from);
  const reading = fix?.to ? `Reading “${fix.from}” as ${fix.to}. ` : "";
  const alias = ALIASES.find((item) => correctedTerms(query).some((term) => item.words.includes(term)));
  if (alias) {
    const lines = cites.filter((cite) => cite.verse != null).slice(0, 2).map((cite) => `${citeWhere(cite)}: ${cite.text.split("\n")[0]}`);
    return `${reading}${alias.lead}${lines.length ? `\n\n${lines.join("\n\n")}` : ""}`;
  }
  const main = cites.find((cite) => cite.text.includes("\n")) ?? cites[0];
  const summary = main.text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return `${reading}${summary}`;
}

export function passagesForGuide(cites: GuideCite[]): string {
  if (!cites.length) return "No passage was retrieved. Do not quote a Sanskrit line or a verse number.";
  return cites.map((cite) => `[${citeWhere(cite)}]\n${cite.text}`).join("\n\n");
}
