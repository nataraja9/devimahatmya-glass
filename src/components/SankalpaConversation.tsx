// SOMNATH-AI: Sankalpa conversation | ZONE: 0 | PURPOSE: A short questionnaire that mints the blessing card for the 13 km journey. | CONTRACT: The purpose is the journey to the Devi's mandir. No day count is asked or sent. Name may reach the blessing call. Gotra, nakshatra, phone, and email are never asked or sent.
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AshirvadaCard } from "@/components/AshirvadaCard";
import { planSankalpa } from "@/lib/guide.functions";
import { useT, type Lang } from "@/lib/i18n";
import { isSkip, mintSankalpaToken, useJourneyAI, type Sankalpa } from "@/lib/journey";

const YATRA_INTENT: Record<Lang, string> = {
  en: "This sankalpa is for the journey to the Devi's mandir, along 13 km.",
  hi: "यह सङ्कल्प देवी के मंदिर की यात्रा के लिए है, 13 किमी के पथ पर।",
  te: "ఈ సంకల్పం దేవి మందిర యాత్ర కోసం, 13 కి.మీ. మార్గం.",
};
const FALLBACK_BLESSING: Record<Lang, string> = {
  en: "May the Devi's grace walk with you on the 13 km journey to the mandir.",
  hi: "देवी की कृपा 13 किमी के मंदिर पथ पर साथ चले।",
  te: "13 కి.మీ. మందిర యాత్రలో దేవి కృప తోడుండుగాక.",
};

const COPY: Record<string, Record<Lang, string>> = {
  title: { en: "Journey Sankalpa", hi: "सङ्कल्प यात्रा", te: "సంకల్ప యాత్ర" },
  name: { en: "What name should the blessing carry? Reply skip to leave it unspoken.", hi: "आशीर्वाद किस नाम पर हो? नाम न हो तो skip लिखें।", te: "ఆశీర్వాదం ఏ పేరుపై ఉండాలి? పేరు వద్దంటే skip అని రాయండి." },
  receiving: { en: "The blessing is being received.", hi: "आशीर्वाद आ रहा है।", te: "ఆశీర్వాదం వస్తోంది." },
  send: { en: "Send", hi: "भेजें", te: "పంపండి" },
  reply: { en: "Reply", hi: "उत्तर", te: "సమాధానం" },
};

type Step = "name" | "minting" | "done";
type Line = { who: "guide" | "devotee"; text: string };

export function SankalpaConversation({ titled = true }: { titled?: boolean }) {
  const { lang } = useT();
  const say = (key: keyof typeof COPY) => COPY[key][lang];
  const { save } = useJourneyAI();
  const plan = useServerFn(planSankalpa);
  const [step, setStep] = useState<Step>("name");
  const [lines, setLines] = useState<Line[]>([{ who: "guide", text: YATRA_INTENT[lang] }, { who: "guide", text: COPY.name[lang] }]);
  const [draft, setDraft] = useState("");
  const [held, setHeld] = useState<Sankalpa | null>(null);
  const thread = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = thread.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines, held, step]);

  const speak = (who: Line["who"], text: string) => setLines((prev) => [...prev, { who, text }]);

  const mint = async (named: string) => {
    setStep("minting");
    speak("guide", COPY.receiving[lang]);
    const intent = YATRA_INTENT[lang];
    let planned = { focus: [] as number[], why: "", blessing: "" };
    try {
      planned = await plan({ data: { intent, lang, name: named || undefined } });
    } catch { /* A missing blessing still mints the card. */ }
    const sankalpa: Sankalpa = { intent, focus: planned.focus, why: planned.why, name: named, gotra: "", nakshatra: "", token: mintSankalpaToken(), blessing: planned.blessing || FALLBACK_BLESSING[lang] };
    save({ sankalpa, reflections: [], pauseReason: undefined });
    speak("guide", sankalpa.blessing || FALLBACK_BLESSING[lang]);
    setHeld(sankalpa);
    setStep("done");
  };

  const answer = (raw: string) => {
    const text = raw.trim();
    if (!text || step !== "name") return;
    speak("devotee", text);
    setDraft("");
    void mint(isSkip(text) ? "" : text.slice(0, 120));
  };

  return (
    <section aria-label={say("title")} className="flex h-full min-h-0 flex-1 flex-col">
      {titled && <h1 className="border-b border-gold/30 px-4 py-3 font-display text-lg text-gold">{say("title")}</h1>}
      <div ref={thread} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {lines.map((line, i) => (
          <p key={i} className={line.who === "guide" ? "max-w-[90%] rounded-2xl border border-gold/40 bg-card/80 px-3 py-2 text-sm leading-relaxed" : "ml-auto max-w-[90%] rounded-2xl bg-gold/15 px-3 py-2 text-sm leading-relaxed text-gold"}>{line.text}</p>
        ))}
        {held?.token && <div className="pt-2"><AshirvadaCard mark={held.token} emblem alt="Ashirwad. Om Aim Hreem Kleem Chamundayai Vichche. Kanaka Durga Temple." /></div>}
      </div>
      {step !== "done" && <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); answer(draft); }}>
        <label className="sr-only" htmlFor="sankalpa-reply">{say("reply")}</label>
        <input id="sankalpa-reply" value={draft} onChange={(e) => setDraft(e.target.value)} disabled={step === "minting"} placeholder={say("reply")} className="min-w-0 flex-1 rounded-full border border-gold/40 bg-background px-3 py-2 text-sm outline-none focus:border-gold disabled:opacity-50" />
        <button type="submit" disabled={step === "minting" || !draft.trim()} className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-[#3b1408] disabled:opacity-40">{step === "minting" ? "…" : say("send")}</button>
      </form>}
    </section>
  );
}
