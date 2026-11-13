import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).min(1).max(30),
  chapter: z.number().int().min(1).max(13).optional(),
  text: z.string().max(80).optional(),
  lang: z.enum(["en", "hi", "te"]).optional(),
});
const LANG_NAME = { en: "English", hi: "Hindi", te: "Telugu" } as const;

const SYSTEM = `You are "Saptashati Guide", a warm, reverent teacher of the Durga Saptashati (Devi Mahatmyam, 13 chapters, 700 verses, from the Markandeya Purana).
- Explain stories, symbolism, Sanskrit verses (give Devanagari, IAST transliteration and meaning), pronunciation and recitation practice.
- Stay faithful to the text; if unsure of an exact verse, say so rather than invent one.
- Do not give fortune-telling, medical, or crisis advice; for distress, gently encourage reaching a trusted person or local helpline.
- Keep answers concise (under 250 words) with short paragraphs. Use simple markdown.`;

export const askGuide = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const { answerFromCites, passagesForGuide, retrieveGuide } = await import("./guideRag");
    const latest = [...data.messages].reverse().find((message) => message.role === "user")?.content ?? "";
    const cites = retrieveGuide(latest, data.chapter);
    let ctx = data.text ? `\nThe learner is currently reciting the ${data.text} (a Saptashati anga / Chandi Homam prayer).` : data.chapter ? `\nThe learner is currently studying Chapter ${data.chapter}.` : "";
    if (data.lang && data.lang !== "en") ctx += `\nReply entirely in ${LANG_NAME[data.lang]} (native script), keeping Sanskrit verses in Devanagari.`;
    ctx += `\n\nRetrieved passages from the Devi Mahatmya text in this companion. The learner's spelling may be off; trust these passages. Answer from them in plain sentences. Quote a Sanskrit line only when it appears below. Name a verse number only when the passage says "verse". If the passages do not contain the answer, say so.\n${passagesForGuide(cites)}`;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM + ctx,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      let text = "";
      for (const item of res.output ?? []) {
        if (item.type === "message") {
          for (const c of item.content) if (c.type === "output_text") text += c.text;
        }
      }
      return { ok: true as const, text: text || "…", cites };
    } catch (e) {
      console.error(e);
      if (e instanceof Error && e.message.includes("LOVABLE_API_KEY")) return { ok: true as const, text: answerFromCites(latest, cites), cites };
      if (e instanceof GatewayError && e.httpStatus === 429) return { ok: false as const, text: "The guide is receiving many questions. Please try again in a moment.", cites };
      if (e instanceof GatewayError && e.httpStatus === 402) return { ok: false as const, text: "The guide is out of AI credits right now.", cites };
      return { ok: false as const, text: "The guide couldn't answer just now. Please try again.", cites };
    }
  });

const TrInput = z.object({ texts: z.array(z.string().max(3000)).min(1).max(80), lang: z.enum(["hi", "te"]) });

export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TrInput.parse(d))
  .handler(async ({ data }) => {
    const { generateResponse } = await import("@lovable.dev/ai-gateway");
    const res = await generateResponse({
      model: "openai/gpt-6-astra",
      instructions: `Translate each string in the JSON array into ${LANG_NAME[data.lang]} in its native script, in a reverent devotional register suited to the Durga Saptashati. Keep Sanskrit names natural for ${LANG_NAME[data.lang]} readers. Any string starting with '§' is a Sanskrit IAST transliteration: do not translate it; rewrite it phonetically in the target script and drop the '§'. Return ONLY a JSON array of strings with exactly the same length and order.`,
      input: JSON.stringify(data.texts),
    });
    let text = "";
    for (const item of res.output ?? []) if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
    const m = text.match(/\[[\s\S]*\]/);
    const arr = m ? (JSON.parse(m[0]) as unknown[]) : [];
    if (arr.length !== data.texts.length) throw new Error("Translation length mismatch");
    return arr.map(String);
  });

const ExplainInput = z.object({
  lang: z.enum(["en", "hi", "te"]),
  chapter: z.number().int().min(1).max(13).optional(),
  text: z.string().max(80).optional(),
  verses: z.array(z.object({ v: z.number().int(), sa: z.string().max(2000) })).min(1).max(15),
});

async function askJson(instructions: string, input: string) {
  const { generateResponse } = await import("@lovable.dev/ai-gateway");
  const res = await generateResponse({ model: "openai/gpt-6-astra", instructions, input });
  let text = "";
  for (const item of res.output ?? []) if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
  const m = text.match(/[[{][\s\S]*[\]}]/);
  if (!m) throw new Error("No JSON in response");
  return JSON.parse(m[0]) as unknown;
}

/** Transliteration + plain meaning for a batch of verses of the Durga Saptashati. */
export const explainVerses = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ExplainInput.parse(d))
  .handler(async ({ data }) => {
    const L = LANG_NAME[data.lang];
    const script = data.lang === "en" ? "IAST (Roman with diacritics)" : data.lang === "te" ? "Telugu script" : "Devanagari (same as source)";
    const out = await askJson(
      `You are a careful Sanskrit scholar of the Durga Saptashati, ${data.text ? `the ${data.text}` : `Chapter ${data.chapter}`}. For each verse in the JSON input, return {"v": number, "tr": transliteration of the Sanskrit in ${script} preserving line breaks, "m": a faithful, clear meaning in ${L} (2-3 sentences)}. Verse 0 is the viniyoga/dhyana preamble. Return ONLY a JSON array in the same order.`,
      JSON.stringify(data.verses),
    );
    const arr = Array.isArray(out) ? out : [];
    return arr.map((x) => ({ v: Number((x as { v: unknown }).v), tr: String((x as { tr?: unknown }).tr ?? ""), m: String((x as { m?: unknown }).m ?? "") }));
  });

const WordInput = z.object({ lang: z.enum(["en", "hi", "te"]), chapter: z.number().int().min(1).max(13).optional(), text: z.string().max(80).optional(), sa: z.string().max(2000) });

/** Word-by-word breakdown and a short commentary for a single verse. */
export const explainVerseDetail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => WordInput.parse(d))
  .handler(async ({ data }) => {
    const L = LANG_NAME[data.lang];
    const out = (await askJson(
      `You are a reverent Sanskrit teacher of the Durga Saptashati, ${data.text ? `the ${data.text}` : `Chapter ${data.chapter}`}. For the given verse return ONLY JSON: {"words":[{"w": Sanskrit word in Devanagari, "m": its meaning in ${L}}], "note": a 3-5 sentence explanation in ${L} of the verse's context and spiritual significance}. Stay faithful to the text.`,
      data.sa,
    )) as { words?: { w: string; m: string }[]; note?: string };
    return { words: (out.words ?? []).map((x) => ({ w: String(x.w), m: String(x.m) })), note: String(out.note ?? "") };
  });

const SankInput = z.object({ intent: z.string().min(2).max(600), lang: z.enum(["en", "hi", "te"]), name: z.string().max(120).optional(), days: z.number().int().min(1).max(108).optional() });
/** Shape the chosen days around the learner's sankalpa: which chapters to emphasise and why. */
export const planSankalpa = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SankInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const out = (await askJson(
        `You are a reverent Durga Saptashati teacher. A learner states their sankalpa (intention) for a parayana of the given number of days. Choose 2-4 chapters (1-13) whose traditional themes best support it (e.g. 1-4 protection/courage, 5 Devi's presence in all beings, 11 gratitude/hymn, 12 phala/blessings, 13 boons). Return ONLY JSON {"focus":[numbers],"why": 2 sentences in ${LANG_NAME[data.lang]} explaining the choice from the text's themes, "blessing": a 2-3 sentence gentle blessing in ${LANG_NAME[data.lang]} addressed to the learner by name if given, invoking Devi's grace on their sankalpa in the spirit of the Devi Mahatmyam (e.g. Chapter 11/13 boons)}. Never promise outcomes or give advice beyond the text.`,
        JSON.stringify({ intent: data.intent, name: data.name, days: data.days }),
      )) as { focus?: unknown[]; why?: unknown; blessing?: unknown };
      const focus = (out.focus ?? []).map(Number).filter((n) => n >= 1 && n <= 13).slice(0, 4);
      return { ok: true as const, focus, why: String(out.why ?? ""), blessing: String(out.blessing ?? "") };
    } catch (e) { console.error(e); return { ok: false as const, focus: [] as number[], why: "", blessing: "" }; }
  });

const NoteInput = z.object({
  lang: z.enum(["en", "hi", "te"]), day: z.number().int(), chapter: z.number().int().min(1).max(13),
  task: z.string().max(40), missed: z.number().int().min(0), pace: z.enum(["steady", "gentle", "catchup"]),
  prefs: z.array(z.string().max(40)).max(10).optional(),
  pauseReason: z.string().max(200).optional(), intent: z.string().max(600).optional(), focus: z.array(z.number()).max(4).optional(),
});
/** A short companion note: why today's task, remembering pauses and adapting pace. */
export const companionNote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NoteInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const { generateResponse } = await import("@lovable.dev/ai-gateway");
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: `You are a warm companion for a learner's Durga Saptashati parayana. Write 2-3 short sentences in ${LANG_NAME[data.lang]}. If they paused, gently acknowledge the remembered reason. If pace is "gentle", offer a lighter 10-minute version of today's task; if "catchup", offer to continue without guilt and just do today's step. Briefly say why today's task fits their sankalpa if given. Only refer to the text and their entries; no theology invention, no advice. If "prefs" lists things the learner disliked (e.g. "Too long", "Tone mismatch"), avoid them.`,
        input: JSON.stringify(data),
      });
      let text = "";
      for (const item of res.output ?? []) if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
      return text.trim();
    } catch (e) { console.error(e); return ""; }
  });

const CheckInput = z.object({ said: z.string().min(1).max(500), lang: z.enum(["en", "hi", "te"]) });
/** Turn a spoken or typed check-in into a structured journey update. The learner confirms before it applies. */
export const interpretCheckIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CheckInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const o = (await askJson(
        `Extract a check-in for a 90-day Durga Saptashati parayana tracker. Return ONLY JSON {"reply": one of "DONE","PAUSE","STOP","RESUME" or null, "pauseReason": short reason if pausing else null, "reflection": any personal reflection/feeling the learner shared (their words, trimmed) else null, "summary": one short literal sentence in ${LANG_NAME[data.lang]} describing what will be recorded}. Do not invent anything not said.`,
        data.said,
      )) as { reply?: unknown; pauseReason?: unknown; reflection?: unknown; summary?: unknown };
      const r = ["DONE", "PAUSE", "STOP", "RESUME"].includes(String(o.reply)) ? (String(o.reply) as "DONE" | "PAUSE" | "STOP" | "RESUME") : null;
      return { ok: true as const, reply: r, pauseReason: o.pauseReason ? String(o.pauseReason) : null, reflection: o.reflection ? String(o.reflection) : null, summary: String(o.summary ?? "") };
    } catch (e) { console.error(e); return { ok: false as const, reply: null, pauseReason: null, reflection: null, summary: "" }; }
  });

const MirrorInput = z.object({ lang: z.enum(["en", "hi", "te"]), week: z.number().int(), reflections: z.array(z.object({ day: z.number().int(), text: z.string().max(600) })).min(1).max(14) });
/** Weekly mirror: themes in the learner's own reflections, without interpretation beyond their words. */
export const weeklyMirror = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MirrorInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const o = (await askJson(
        `You are a gentle mirror for a Durga Saptashati learner. From their daily reflections, return ONLY JSON {"themes":[2-4 short theme labels in ${LANG_NAME[data.lang]}], "mirror": 2-3 sentences in ${LANG_NAME[data.lang]} reflecting back what they wrote, quoting their words; no advice, no diagnosis, no spiritual claims}.`,
        JSON.stringify(data.reflections),
      )) as { themes?: unknown[]; mirror?: unknown };
      return { ok: true as const, themes: (o.themes ?? []).map(String).slice(0, 4), mirror: String(o.mirror ?? "") };
    } catch (e) { console.error(e); return { ok: false as const, themes: [] as string[], mirror: "" }; }
  });
