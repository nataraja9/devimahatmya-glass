import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useJourney, useJourneyAI, PERIODS, JOURNEY_RESET, mintSankalpaToken, type Sankalpa } from "@/lib/journey";
import { planSankalpa } from "@/lib/guide.functions";
import { useT } from "@/lib/i18n";
import ashirvadaCard from "@/assets/kanaka-durga-ashirvada.png";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Sankalpa Journey · Devi Mahatmya" },
      { name: "description", content: "Take a sankalpa for a 1, 8, 13, 90 or 108-day Devi Mahatmyam parayana and receive a blessing card." },
      { property: "og:title", content: "Sankalpa Journey · Devi Mahatmya" },
      { property: "og:description", content: "Choose your period, take your sankalpa and walk the 13 chapters of the Devi Mahatmyam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Journey,
});

const PERIOD_NOTE: Record<number, string> = { 1: "Full parayana in one sitting", 8: "Navaratri-style, 8 days", 13: "One chapter a day", 90: "A gentle season", 108: "The sacred count" };
const FALLBACK_BLESSING = "May the Devi's grace walk with you through every chapter of your sankalpa.";

function Journey() {
  const { start } = useJourney();
  const { save } = useJourneyAI();
  const { lang } = useT();
  const plan = useServerFn(planSankalpa);
  const [days, setDays] = useState<number>(13);
  const [name, setName] = useState("");
  const [gotra, setGotra] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [intent, setIntent] = useState("");
  const [busy, setBusy] = useState(false);
  const [held, setHeld] = useState<Sankalpa | null>(null);

  useEffect(() => {
    const showForm = () => {
      setHeld(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener(JOURNEY_RESET, showForm);
    return () => window.removeEventListener(JOURNEY_RESET, showForm);
  }, []);

  const take = async () => {
    setBusy(true);
    try {
      const named = name.trim();
      const words = intent.trim();
      const planned = words.length >= 2
        ? await plan({ data: { intent: words, lang, name: named || undefined, days } })
        : { focus: [] as number[], why: "", blessing: "" };
      const sankalpa: Sankalpa = { intent: words, focus: planned.focus, why: planned.why, name: named, gotra: gotra.trim(), nakshatra: nakshatra.trim(), days, token: mintSankalpaToken(), blessing: planned.blessing || FALLBACK_BLESSING };
      start(days);
      save({ sankalpa, reflections: [], pauseReason: undefined });
      setHeld(sankalpa);
    } finally { setBusy(false); }
  };

  if (!held) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="deva text-center text-xl text-gold">॥ सङ्कल्पः ॥</p>
        <h1 className="mt-2 text-center font-display text-4xl text-gold-gradient">Sankalpa Journey</h1>
        <div className="mt-8 space-y-6 rounded-xl border border-gold/40 bg-card/70 p-6">
          <div>
            <p className="font-[Cinzel] text-xs tracking-widest text-gold">1 · CHOOSE YOUR PERIOD</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setDays(p)} className={`rounded-full border px-4 py-1.5 font-display ${days === p ? "border-gold bg-gold/20 text-gold" : "border-border text-muted-foreground hover:border-gold"}`}>{p} {p === 1 ? "day" : "days"}</button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{PERIOD_NOTE[days]}</p>
          </div>
          <div>
            <label className="font-[Cinzel] text-xs tracking-widest text-gold" htmlFor="sankalpa-name">2 · YOUR NAME</label>
            <input id="sankalpa-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-2 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-gold" />
          </div>
          <div>
            <label className="font-[Cinzel] text-xs tracking-widest text-gold" htmlFor="sankalpa-gotra">3 · GOTRA</label>
            <input id="sankalpa-gotra" value={gotra} onChange={(e) => setGotra(e.target.value)} placeholder="Your gotra" className="mt-2 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-gold" />
          </div>
          <div>
            <label className="font-[Cinzel] text-xs tracking-widest text-gold" htmlFor="sankalpa-nakshatra">4 · NAKSHATRA</label>
            <input id="sankalpa-nakshatra" value={nakshatra} onChange={(e) => setNakshatra(e.target.value)} placeholder="Your nakshatra" className="mt-2 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-gold" />
          </div>
          <div>
            <label className="font-[Cinzel] text-xs tracking-widest text-gold" htmlFor="sankalpa-intent">5 · YOUR SANKALPA</label>
            <textarea id="sankalpa-intent" value={intent} onChange={(e) => setIntent(e.target.value)} rows={3} placeholder="I take this parayana for…" className="mt-2 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-gold" />
          </div>
          <button onClick={take} disabled={busy} className="homam-btn w-full rounded-full py-3 font-display text-lg font-bold disabled:opacity-40">{busy ? "Receiving blessing…" : "🙏 Take Sankalpa"}</button>
        </div>
      </main>
    );
  }

  const len = held.days ?? 90;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <section className="rounded-2xl border-2 border-gold/60 bg-card/80 p-6 text-center shadow-glow">
        <p className="deva text-2xl text-gold">॥ आशीर्वादः ॥</p>
        {held.name && <p className="mt-2 font-display text-xl text-gold-gradient">{held.name}</p>}
        {(held.gotra || held.nakshatra) && <p className="mt-1 text-sm text-gold">{[held.gotra, held.nakshatra].filter(Boolean).join(" · ")}</p>}
        <p className="mt-1 text-sm italic text-muted-foreground">{held.intent ? `“${held.intent}” · ` : ""}{len} {len === 1 ? "day" : "days"}</p>
        <p className="mt-4 leading-relaxed">{held.blessing}</p>
        <p className="deva mt-4 text-gold">ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे</p>
      </section>

      <figure className="relative mx-auto mt-6 w-full max-w-full">
        <img src={ashirvadaCard} alt="Ashirwad. Om Aim Hreem Kleem Chamundayai Vichche. Kanaka Durga Temple." width={768} height={428} className="block h-auto w-full max-w-full object-contain" />
        {held.token && <figcaption className="pointer-events-none absolute top-[30%] left-[27%] flex w-[34%] items-center justify-center gap-[0.35em] whitespace-nowrap font-display text-[clamp(0.64rem,2vw,1rem)] font-bold leading-none tracking-[0.04em] text-[#3b1408] [text-shadow:0_0_1px_#fffaf3,0_0_4px_#fffaf3,0_1px_0_#fffaf3]"><svg viewBox="0 0 100 100" className="h-[1.15em] w-[1.15em] shrink-0" aria-hidden="true"><path fill="currentColor" d="M43 8h14v42H43zM43 8h49v14H43zM50 43h42v14H50zM78 43h14v49H78zM43 50h14v42H43zM8 78h49v14H8zM8 43h42v14H8zM8 8h14v49H8z" /></svg>{held.token}</figcaption>}
      </figure>
    </main>
  );
}
