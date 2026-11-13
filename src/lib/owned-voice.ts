// SOMNATH-AI: Owned voice | ZONE: 0 | PURPOSE: Speak the Saptashati with a voice this seat generates | CONTRACT: No third-party recital is streamed · no person's voice is copied
export const OWNED_HOMAM = "/voice/chandi-homam.mp3";
export const OWNED_CUES = "/voice/cues.json";

export function ownedChapterChant(n: number) {
  return `/voice/chapter-${String(n).padStart(2, "0")}.mp3`;
}

export function ownedStotraChant(id: string) {
  return `/voice/stotra-${id}.mp3`;
}

const VOWEL: Record<string, string> = {
  "अ": "a", "आ": "aa", "इ": "i", "ई": "ee", "उ": "u", "ऊ": "oo", "ऋ": "ri", "ॠ": "ree",
  "ऌ": "li", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ॐ": "om",
};
const MARK: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri", "ॄ": "ree",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};
const CONS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h", "ळ": "l",
};

/** Latin reading of Devanagari, so an English voice on this machine can say the verse. */
export function toSpokenLatin(input: string): string {
  const chars = Array.from(input.normalize("NFC"));
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    if (c === "़") continue;
    if (VOWEL[c]) { out += VOWEL[c] + " "; continue; }
    if (CONS[c]) {
      let cluster = CONS[c];
      while (chars[i + 1] === "्" && CONS[chars[i + 2] ?? ""]) {
        i += 2;
        cluster += CONS[chars[i]!] ?? "";
      }
      const mark = chars[i + 1];
      if (mark && MARK[mark]) { cluster += MARK[mark]; i++; }
      else cluster += "a";
      out += cluster + " ";
      continue;
    }
    if (c === "ं" || c === "ँ") { out = out.replace(/ $/, "m "); continue; }
    if (c === "ः") { out = out.replace(/ $/, "h "); continue; }
    if (c === "।" || c === "॥" || c === "|" || c === "\n") { out += ", "; continue; }
    if (/[a-z0-9]/i.test(c)) { out += c; continue; }
    if (/\s/.test(c)) out += " ";
  }
  return out.replace(/\s+,/g, ",").replace(/\s+/g, " ").trim();
}

function indicVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const rank = (lang: string) => (lang.toLowerCase().startsWith("hi") ? 0 : lang.toLowerCase().startsWith("sa") ? 1 : lang.toLowerCase().startsWith("te") ? 2 : 9);
  const voice = [...voices].sort((a, b) => rank(a.lang) - rank(b.lang))[0];
  return voice && rank(voice.lang) < 9 ? voice : undefined;
}

function chunks(text: string): string[] {
  const parts = text.split(/,\s*/).flatMap((piece) => {
    const words = piece.trim().split(/\s+/);
    const out: string[] = [];
    let line = "";
    for (const word of words) {
      if (!word) continue;
      if ((line + " " + word).trim().length > 140) { if (line) out.push(line); line = word; }
      else line = (line + " " + word).trim();
    }
    if (line) out.push(line);
    return out;
  });
  return parts.length ? parts : [text];
}

let generation = 0;
if (typeof window !== "undefined") window.speechSynthesis?.getVoices();

/** Speak one line. An Indic voice reads Devanagari. Otherwise the verse is read in Latin. */
export function speakLine(text: string, hooks: { rate?: number; onstart?: () => void; onend?: () => void } = {}) {
  const synth = typeof window === "undefined" ? undefined : window.speechSynthesis;
  if (!synth) {
    hooks.onend?.();
    return;
  }
  const token = ++generation;
  const voice = indicVoice();
  const spoken = voice ? text : toSpokenLatin(text);
  const parts = chunks(spoken);
  let index = 0;
  let started = false;
  const finish = () => {
    if (token !== generation) return;
    generation++;
    hooks.onend?.();
  };
  const next = () => {
    if (token !== generation) return;
    if (index >= parts.length) { finish(); return; }
    const u = new SpeechSynthesisUtterance(parts[index++]!);
    u.rate = hooks.rate ?? 0.9;
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = "en-US";
    }
    let moved = false;
    const advance = () => {
      if (moved || token !== generation) return;
      moved = true;
      next();
    };
    u.onstart = () => {
      if (!started) { started = true; hooks.onstart?.(); }
    };
    u.onend = advance;
    u.onerror = (event) => {
      if (token !== generation) return;
      if (event.error === "interrupted" || event.error === "canceled") return;
      advance();
    };
    synth.resume();
    synth.speak(u);
  };
  next();
}

export function stopSpeaking() {
  generation++;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}
