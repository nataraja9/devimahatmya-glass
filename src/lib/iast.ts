// SOMNATH-AI: IAST verse script | ZONE: 0 | PURPOSE: Spell each Devanagari verse in Roman letters | CONTRACT: Transliterate the akshara only · add no meaning
const VOWELS: Record<string, string> = {
  "\u0905": "a", "\u0906": "\u0101", "\u0907": "i", "\u0908": "\u012b", "\u0909": "u", "\u090a": "\u016b",
  "\u090b": "\u1e5b", "\u0960": "\u1e5d", "\u090c": "\u1e37", "\u0961": "\u1e39",
  "\u090f": "e", "\u0910": "ai", "\u0913": "o", "\u0914": "au",
};
const SIGNS: Record<string, string> = {
  "\u093e": "\u0101", "\u093f": "i", "\u0940": "\u012b", "\u0941": "u", "\u0942": "\u016b",
  "\u0943": "\u1e5b", "\u0944": "\u1e5d", "\u0962": "\u1e37", "\u0963": "\u1e39",
  "\u0947": "e", "\u0948": "ai", "\u094b": "o", "\u094c": "au",
};
const CONS: Record<string, string> = {
  "\u0915": "k", "\u0916": "kh", "\u0917": "g", "\u0918": "gh", "\u0919": "\u1e45",
  "\u091a": "c", "\u091b": "ch", "\u091c": "j", "\u091d": "jh", "\u091e": "\u00f1",
  "\u091f": "\u1e6d", "\u0920": "\u1e6dh", "\u0921": "\u1e0d", "\u0922": "\u1e0dh", "\u0923": "\u1e47",
  "\u0924": "t", "\u0925": "th", "\u0926": "d", "\u0927": "dh", "\u0928": "n",
  "\u092a": "p", "\u092b": "ph", "\u092c": "b", "\u092d": "bh", "\u092e": "m",
  "\u092f": "y", "\u0930": "r", "\u0932": "l", "\u0935": "v",
  "\u0936": "\u015b", "\u0937": "\u1e63", "\u0938": "s", "\u0939": "h",
  "\u0933": "\u1e37", "\u0931": "r",
};

function markAfter(chars: string[], i: number): { kind: "virama" | "sign"; sign: string; end: number } | null {
  let j = i + 1;
  while (chars[j] === "\u200c" || chars[j] === "\u200d" || chars[j] === "\u093c") j++;
  const mark = chars[j];
  if (mark === "\u094d") return { kind: "virama", sign: "", end: j };
  if (mark && SIGNS[mark]) return { kind: "sign", sign: SIGNS[mark], end: j };
  return null;
}
const DIGITS: Record<string, string> = {
  "\u0966": "0", "\u0967": "1", "\u0968": "2", "\u0969": "3", "\u096a": "4",
  "\u096b": "5", "\u096c": "6", "\u096d": "7", "\u096e": "8", "\u096f": "9",
};

/** Roman spelling (IAST) of a Devanagari line, keeping its line breaks. */
export function toIast(text: string): string {
  const chars = [...text];
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (c === "\u0950") { out += "o\u1e43"; continue; }
    if (c === "\u093d") { out += "'"; continue; }
    if (c === "\u0964") { out += "|"; continue; }
    if (c === "\u0965") { out += "||"; continue; }
    if (c === "\u0902") { out += "\u1e43"; continue; }
    if (c === "\u0901") { out += "m\u0310"; continue; }
    if (c === "\u0903") { out += "\u1e25"; continue; }
    if (VOWELS[c]) { out += VOWELS[c]; continue; }
    if (DIGITS[c]) { out += DIGITS[c]; continue; }
    if (CONS[c]) {
      const mark = markAfter(chars, i);
      if (mark?.kind === "virama") { out += CONS[c]; i = mark.end; continue; }
      if (mark?.kind === "sign") { out += CONS[c]! + mark.sign; i = mark.end; continue; }
      out += CONS[c] + "a";
      continue;
    }
    if (c === "\u093c" || c === "\u200c" || c === "\u200d") continue;
    out += c;
  }
  return out;
}
