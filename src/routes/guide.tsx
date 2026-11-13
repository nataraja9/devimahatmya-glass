import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { askGuide } from "@/lib/guide.functions";
import type { GuideCite } from "@/lib/guideRag";
import { chapters } from "@/data/chapters";
import { useT, useTranslated } from "@/lib/i18n";

export const Route = createFileRoute("/guide")({
  validateSearch: z.object({ chapter: z.number().int().min(1).max(13).optional() }),
  head: () => ({
    meta: [
      { title: "Ask the Guide — Devi Mahatmya" },
      { name: "description", content: "Ask questions about the Durga Saptashati: verse meanings, symbolism, pronunciation and practice." },
      { property: "og:title", content: "Ask the Guide — Devi Mahatmya" },
      { property: "og:description", content: "An AI study companion for the Devi Mahatmyam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Guide,
});

type Msg = { role: "user" | "assistant"; content: string; cites?: GuideCite[] };

function Guide() {
  const { chapter } = Route.useSearch();
  const ask = useServerFn(askGuide);
  const ch = chapters.find((c) => c.n === chapter);
  const { t, lang } = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  const starters = ch
    ? [`What is the deeper meaning of ${ch.title}?`, `Help me pronounce the key shloka of Chapter ${ch.n}`, `How can I apply Chapter ${ch.n} in daily life?`]
    : ["How should a beginner start reciting the Saptashati?", "What do the three charitras represent?", "Explain the Navarna mantra", "Why is 'Ya Devi Sarvabhuteshu' so beloved?"];

  const { texts: starterTexts } = useTranslated(starters);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: text.trim() }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await ask({ data: { messages: next, chapter, lang } });
      setMsgs([...next, { role: "assistant", content: r.text, cites: r.cites }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "The guide couldn't answer just now. Please try again." }]);
    } finally { setBusy(false); }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-60px)] max-w-3xl flex-col px-5 py-8">
      <div className="text-center">
        <p className="deva text-3xl text-gold animate-diya">🪔</p>
        <h1 className="font-display text-4xl text-gold-gradient">{t("askGuide")}</h1>
        <p className="mt-1 text-muted-foreground">{ch ? `${t("studying")}: ${t("chapter")} ${ch.n}` : t("guideSub")}</p>
      </div>

      <div className="mt-8 flex-1 space-y-4">
        {msgs.length === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {starterTexts.map((s) => <button key={s} onClick={() => send(s)} className="rounded-xl border border-border bg-card/70 p-4 text-left hover:border-gold hover:shadow-glow">{s}</button>)}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-4 py-3 text-secondary-foreground" : "max-w-[90%] rounded-2xl rounded-bl-sm border border-gold/30 bg-card px-5 py-4 whitespace-pre-wrap leading-relaxed"}>
            {m.content}
            {m.cites && m.cites.length > 0 && (
              <ul className="mt-3 space-y-2 border-t border-gold/30 pt-3">
                {m.cites.map((cite) => (
                  <li key={`${cite.title}-${cite.chapter ?? "x"}-${cite.verse ?? "x"}`} className="text-sm">
                    <p className="font-[Cinzel] text-xs tracking-widest text-gold">{[cite.chapter ? `Chapter ${cite.chapter}` : "", cite.verse != null ? `verse ${cite.verse}` : "", cite.title].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-muted-foreground">{cite.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {busy && <p className="italic text-gold animate-diya">{t("thinking")}</p>}
        <div ref={end} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-4 mt-6 flex gap-2 rounded-full border border-gold/50 bg-card p-1.5 shadow-glow">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("placeholder")} className="flex-1 bg-transparent px-4 outline-none placeholder:text-muted-foreground" />
        <button disabled={busy || !input.trim()} className="rounded-full bg-gold-gradient px-5 py-2 font-[Cinzel] font-bold text-primary-foreground disabled:opacity-40">{t("ask")}</button>
      </form>
    </main>
  );
}
