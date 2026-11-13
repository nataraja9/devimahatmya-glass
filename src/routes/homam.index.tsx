import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { stotraById, homamOrder } from "@/data/stotras";
import verseTimes from "@/data/verse-times.json";
import stotraTimes from "@/data/stotra-times.json";
import { mediaFor } from "@/data/media";
import { chapters } from "@/data/chapters";
import { loadVerses, type Verse } from "@/data/verses";
import { useT } from "@/lib/i18n";
import { HL } from "@/lib/homam-labels";
import { blowConch, ringBell } from "@/lib/ritual-sounds";
import scene from "@/assets/homam-celestial.jpg";
import { Button } from "@/components/ui/button";
import { recitationPosition } from "@/lib/homam-timing";

export const Route = createFileRoute("/homam/")({
  head: () => ({
    meta: [
      { title: "Chandi Homam — Devi Mahatmya" },
      { name: "description", content: "Experience a full Chandi Homam: the complete Durga Saptashati chanted before the sacred fire, from Kavacham to Kshama Prarthana, with an ahuti at every verse." },
      { property: "og:title", content: "Chandi Homam — Devi Mahatmya" },
      { property: "og:description", content: "The complete Saptashati recited as a yagam before the sacred fire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Yagam,
});

// Each part of the homam is its own recording from the CC0 "Durga Saptashati Chants" series,
// played in the traditional parayana order; verse cues are measured per recording.
type Seg = { key: number | string; src: string; times: number[] };
const VT = verseTimes as Record<string, number[]>;
const ST = stotraTimes as Record<string, number[]>;
const SEGS: Seg[] = homamOrder.map((s) =>
  s.kind === "chapter"
    ? { key: s.n, src: mediaFor(s.n).chant!, times: VT[String(s.n)] ?? [] }
    : { key: s.id, src: stotraById(s.id)!.audio, times: ST[s.id] ?? [] });
const nameOf = (g: Seg) => (typeof g.key === "string" ? stotraById(g.key)!.sanskrit : chapters[g.key - 1]!.sanskritTitle);
const counts = SEGS.map((g) => g.times.length);
const before = counts.map((_, i) => counts.slice(0, i).reduce((a, b) => a + b, 0));
const TONGUES = [
  { x: 50, w: 54, h: 100, d: 0.85, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-flame-core)_12%,var(--color-flame)_46%,transparent_78%)]" },
  { x: 28, w: 36, h: 80, d: 0.62, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-flame)_22%,transparent_72%)]" },
  { x: 72, w: 36, h: 84, d: 0.7, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-flame)_22%,transparent_72%)]" },
  { x: 40, w: 28, h: 94, d: 0.52, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-flame-core)_26%,transparent_70%)]" },
  { x: 63, w: 24, h: 72, d: 0.58, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-gold)_28%,transparent_72%)]" },
  { x: 50, w: 16, h: 56, d: 0.45, c: "bg-[radial-gradient(ellipse_at_bottom,var(--color-foreground)_35%,transparent_75%)]" },
];
const DRAVYA_KINDS = ["h-2.5 w-1.5 rounded-full bg-gold shadow-glow", "h-1 w-2 rounded-full bg-foreground/90", "h-2.5 w-2.5 rounded-[60%_0] bg-kumkum", "h-2.5 w-2.5 rounded-[60%_0] bg-haldi", "h-4 w-1 rounded bg-brick"];
const DRAVYAS = Array.from({ length: 18 }, (_, k) => ({ c: DRAVYA_KINDS[k % 5]!, x: (k * 37) % 90 + 5, delay: (k * 0.43) % 3, dur: 2 + ((k * 7) % 10) / 10, dx: ((k * 13) % 30) - 15 }));
const TOTAL = counts.reduce((a, b) => a + b, 0);

// The yagna picture, and where its square pit opening sits inside it (fractions of the picture).
const SCENE = { w: 1024, h: 682 };
const PIT = { cx: 0.665, bottom: 0.713, w: 0.2, h: 0.23 };

function useCoverBox(iw: number, ih: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const s = Math.min(cw / iw, ch / ih);
      const w = cw >= 640 ? cw : iw * s;
      const h = cw >= 640 ? ch : ih * s;
      setBox({ x: (cw - w) / 2, y: (ch - h) / 2, w, h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [iw, ih]);
  return { ref, box };
}

function Yagam() {
  const { lang } = useT();
  const audio = useRef<HTMLAudioElement>(null);
  const { ref: stageRef, box } = useCoverBox(SCENE.w, SCENE.h);
  const [phase, setPhase] = useState<"start" | "live" | "done">("start");
  const [i, setI] = useState(0);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [idx, setIdx] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [clock, setClock] = useState(0);
  const [dur, setDur] = useState(0);
  const [flare, setFlare] = useState(0);
  const seg = SEGS[i]!;
  const segEnd = dur || (seg.times[seg.times.length - 1] ?? 0) + 60;

  useEffect(() => { let on = true; setVerses([]); setIdx(-1); if (seg.key !== "devisuktam") void loadVerses(seg.key).then((v) => on && setVerses(v)); return () => { on = false; }; }, [seg]);
  useEffect(() => { if (idx > 0) setFlare((f) => f + 1); }, [idx]);
  useEffect(() => () => audio.current?.pause(), []);
  useEffect(() => {
    if (phase !== "live") return;
    let frame = 0;
    const update = () => { onTime(); frame = requestAnimationFrame(update); };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [phase, i, idx]);

  const playSeg = (k: number) => {
    const a = audio.current;
    if (!a) return;
    setDur(0);
    a.src = SEGS[k]!.src;
    a.currentTime = 0;
    setPhase("live");
    setPaused(false);
    void a.play().catch(() => setPaused(true));
  };
  const begin = () => { blowConch(); setPhase("live"); setTimeout(() => playSeg(0), 3800); };
  const onTime = () => {
    const t = audio.current?.currentTime ?? 0;
    setClock(t);
    const n = recitationPosition(t, seg.times, segEnd).index;
    if (n !== idx) setIdx(n);
  };
  const onEnded = () => {
    if (i + 1 < SEGS.length) {
      ringBell(typeof seg.key === "number" ? 3 : 2);
      setFlare((f) => f + 1);
      setI(i + 1);
      setIdx(-1);
      playSeg(i + 1);
    } else {
      ringBell(5);
      setFlare((f) => f + 1);
      setTimeout(() => setPhase("done"), 1500);
    }
  };
  const toggle = () => {
    if (phase !== "live") return;
    const a = audio.current;
    if (!a) return;
    if (a.paused) { void a.play(); setPaused(false); } else { a.pause(); setPaused(true); }
  };
  const verse = idx >= 0 ? (verses[idx]?.sa.replace(/[॥।]\s*[०-९\d.]*\s*[॥।]?\s*$/u, "").trim() ?? "") : "";
  const ahuti = phase === "done" ? TOTAL : before[i]! + idx + 1;
  const verseProgress = recitationPosition(clock, seg.times, segEnd).progress;

  const pitCx = box.x + PIT.cx * box.w;
  const pitBottom = box.y + PIT.bottom * box.h;
  const fireH = PIT.h * box.h;
  const fall = 0.32 * box.h;

  return (
    <div className="fixed inset-0 z-[60] select-none overflow-hidden bg-background text-foreground" onClick={toggle}>
      <img src={scene} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
      <div ref={stageRef} className="absolute inset-x-0 bottom-0 top-[25vh] sm:top-0">
        <img src={scene} alt="Durga on her lion above a celestial Chandi Yagam with three raja rishis" width={1024} height={682} className="absolute inset-0 h-full w-full object-contain sm:object-fill" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[8vh] bg-gradient-to-b from-background/20 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18vh] bg-gradient-to-t from-background/85 via-background/35 to-transparent" aria-hidden />
      </div>
      <audio ref={audio} preload="auto" onTimeUpdate={onTime} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onEnded={onEnded} />

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {phase === "start" ? "॥ श्री चण्डिका होमः ॥" : phase === "done" ? "॥ पूर्णाहुतिः ॥ सर्वं श्रीदेवीचरणार्पणमस्तु" : verse || nameOf(seg)}
      </p>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[25vh] sm:top-0" aria-hidden>
        <div data-fire className="pointer-events-none absolute -translate-x-1/2 opacity-55" style={{ left: pitCx, top: pitBottom - fireH, width: PIT.w * box.w, height: fireH }}>
          <div className="absolute inset-x-0 bottom-0 h-[30%] -translate-x-1/2">
            {[0, 1, 2, 3, 4].map((k) => <span key={k} className="homam-smoke" style={{ animationDelay: `${k * 1.25}s`, ["--dur" as string]: `${5.4 + k * 0.9}s`, ["--dx" as string]: `${(k - 2) * 48}px` }} />)}
          </div>
          <div className="absolute inset-0 motion-safe:animate-pulse">
            <div key={flare} className="animate-flare2 absolute inset-0">
              <div className="absolute inset-x-[-40%] bottom-[-14%] top-[26%] rounded-full bg-[radial-gradient(ellipse_at_bottom,var(--color-flame),transparent_70%)] opacity-70 blur-2xl" />
              {TONGUES.map((t, k) => <div key={k} className={`tongue ${t.c}`} style={{ left: `${t.x}%`, width: `${t.w}%`, height: `${t.h}%`, animationDuration: `${t.d}s`, animationDelay: `${k * 0.09}s` }} />)}
              {flare > 0 && Array.from({ length: 9 }, (_, k) => <span key={k} className="spark" style={{ ["--dx" as string]: `${(k - 4) * 22}px`, animationDelay: `${k * 60}ms` }} />)}
            </div>
          </div>
        </div>
        <div data-dravya className="pointer-events-none absolute -translate-x-1/2" style={{ left: pitCx, top: pitBottom - fall, width: 0.26 * box.w, height: fall }}>
          {DRAVYAS.map((d, k) => <span key={k} className={`dravya ${d.c}`} style={{ left: `${d.x}%`, animationDelay: `${d.delay}s`, ["--dur" as string]: `${d.dur}s`, ["--dx" as string]: `${d.dx}px`, ["--fall" as string]: `${fall}px` }} />)}
        </div>
        {phase === "live" && (
          <div data-rising-mantra className="pointer-events-none absolute z-10 -translate-x-1/2" style={{ left: pitCx, top: pitBottom - fireH - 8, width: Math.min(box.w * 0.44, 580) }}>
            <p key={`${i}-${idx}`} className="deva line-clamp-3 whitespace-pre-line break-words text-center text-lg font-semibold leading-snug text-foreground [text-shadow:0_2px_4px_var(--color-background),0_0_8px_var(--color-background),0_0_22px_var(--color-flame)] sm:text-xl" style={{ transform: `translateY(calc(-100% - ${verse ? verseProgress * 26 : 0}vh))`, opacity: verseProgress > .85 ? 1 - (verseProgress - .85) * 4 : 1 }}>{verse || nameOf(seg)}</p>
          </div>
        )}
      </div>

      <div className="absolute right-0 top-0 z-20 p-3" onClick={(e) => e.stopPropagation()}>
        <Link to="/" aria-label="Leave the homam" className="grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-background/60 text-gold">✕</Link>
      </div>

      {phase !== "start" && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 px-4 pb-2 text-xs text-gold/85">
          <span>{paused ? HL.paused[lang] : HL.tap[lang]}</span>
          <span className="max-w-[26vw] text-right font-[Cinzel]">{HL.ahuti[lang]} {ahuti} / {TOTAL}</span>
        </div>
      )}
      {phase === "start" && (
        <div className="absolute inset-x-0 bottom-[9vh] z-10 flex flex-col items-center gap-3 px-5 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="deva text-2xl text-gold [text-shadow:0_2px_8px_var(--color-background)]">॥ श्री चण्डिका होमः ॥</p>
          <Button variant="ghost" onClick={begin} className="h-auto border-b border-gold/60 bg-background/40 px-6 py-3 font-[Cinzel] text-lg text-gold">🔥 {HL.light[lang]}</Button>
        </div>
      )}
      {phase === "done" && (
        <div className="absolute inset-x-0 bottom-[9vh] z-10 flex flex-col items-center gap-2 text-center" onClick={(e) => e.stopPropagation()}>
          <p className="deva text-2xl text-gold-gradient">॥ पूर्णाहुतिः ॥</p>
          <p className="deva text-xl text-gold">सर्वं श्रीदेवीचरणार्पणमस्तु</p>
          <p className="text-muted-foreground">{HL.ahuti[lang]} {TOTAL}</p>
          <Link to="/" className="rounded-full border border-gold/40 bg-background/60 px-6 py-2 font-[Cinzel] text-sm text-gold">Return</Link>
        </div>
      )}
    </div>
  );
}
