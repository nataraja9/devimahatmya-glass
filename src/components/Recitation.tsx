import { useEffect, useMemo, useRef, useState } from "react";
import { loadMeanings, type VerseMeaning } from "@/data/meanings";
import { loadVerses, verseTimes, type Verse } from "@/data/verses";
import { useT, type Lang } from "@/lib/i18n";
import { toIast } from "@/lib/iast";
import { speakLine, stopSpeaking } from "@/lib/owned-voice";
import { verseMeaning } from "@/lib/wordGloss";

const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5];
const SIZES = { s: "text-base", m: "text-xl", l: "text-2xl" } as const;
const BATCH = 12;

const L = {
  speed: { en: "Speed", hi: "गति", te: "వేగం" },
  size: { en: "Text size", hi: "अक्षर आकार", te: "అక్షర పరిమాణం" },
  repeat: { en: "Repeat verse", hi: "श्लोक दोहराएँ", te: "శ్లోకం పునరావృతం" },
  pause: { en: "Pause after each verse", hi: "प्रत्येक श्लोक के बाद रुकें", te: "ప్రతి శ్లోకం తర్వాత ఆగు" },
  follow: { en: "Follow along", hi: "साथ चलें", te: "అనుసరించు" },
  meaning: { en: "Meaning", hi: "अर्थ", te: "అర్థం" },
  transcript: { en: "FULL TRANSCRIPT", hi: "संपूर्ण पाठ", te: "సంపూర్ణ పాఠం" },
  preamble: { en: "Invocation", hi: "विनियोग / ध्यान", te: "వినియోగం / ధ్యానం" },
  approx: { en: "Verse timing is approximate — tap any verse to jump to it.", hi: "समय अनुमानित है — किसी भी श्लोक पर टैप कर वहाँ जाएँ।", te: "సమయం సుమారుగా ఉంటుంది — ఏ శ్లోకాన్నైనా తాకి అక్కడికి వెళ్ళండి." },
} satisfies Record<string, Record<Lang, string>>;

export function Recitation({ chapter, textId, textName, src, label, onEnded, autoStart, homam }: { homam?: boolean | undefined; chapter?: number | undefined; textId?: string | undefined; textName?: string | undefined; src: string; label: string; onEnded?: (() => void) | undefined; autoStart?: boolean | undefined }) {
  const key: number | string = textId ?? chapter ?? 1;
  const { lang } = useT();
  const l = (k: keyof typeof L) => L[k][lang];
  const a = useRef<HTMLAudioElement>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [meanings, setMeanings] = useState<VerseMeaning[]>([]);
  const times = verseTimes(key);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [size, setSize] = useState<keyof typeof SIZES>("m");
  const [repeat, setRepeat] = useState(false);
  const [pauseAfter, setPauseAfter] = useState(false);
  const [follow, setFollow] = useState(true);
  const [ownedVoice, setOwnedVoice] = useState(false);
  const [spokenIdx, setSpokenIdx] = useState(0);
  const lastIdx = useRef(0);
  const resumeTimer = useRef<number | undefined>(undefined);
  const pendingSpeak = useRef(false);
  const flags = useRef({ repeat, pauseAfter, verses, onEnded, speed });
  flags.current = { repeat, pauseAfter, verses, onEnded, speed };

  useEffect(() => { let on = true; void loadVerses(key).then((v) => on && setVerses(v)); void loadMeanings(key).then((v) => on && setMeanings(v)); setPlaying(false); setT(0); lastIdx.current = 0; return () => { on = false; }; }, [key]);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("devi-recite") || "{}"); if (s.speed) setSpeed(s.speed); if (s.size) setSize(s.size); } catch { /* ignore */ } }, []);
  useEffect(() => { localStorage.setItem("devi-recite", JSON.stringify({ speed, size })); if (a.current) { a.current.playbackRate = speed; a.current.preservesPitch = true; } }, [speed, size]);
  useEffect(() => () => window.clearTimeout(resumeTimer.current), []);
  useEffect(() => { if (autoStart) void a.current?.play().catch(() => undefined); }, [autoStart, src]);

  const fileIdx = useMemo(() => { let i = 0; for (let k = 0; k < times.length; k++) if (times[k]! <= t) i = k; return Math.min(i, Math.max(verses.length - 1, 0)); }, [t, times, verses.length]);
  const idx = ownedVoice ? spokenIdx : fileIdx;
  const byV = useMemo(() => new Map(meanings.map((row) => [row.v, row.m])), [meanings]);
  const meaningOf = (verse: Verse) => (homam ? "" : byV.get(verse.v) || verseMeaning(verse.sa, "en"));

  const onTime = (el: HTMLAudioElement) => {
    const now = el.currentTime; setT(now);
    let i = 0; for (let k = 0; k < times.length; k++) if (times[k]! <= now) i = k;
    if (i !== lastIdx.current && i === lastIdx.current + 1 && !el.paused) {
      const prev = lastIdx.current;
      if (repeat) { el.currentTime = times[prev] ?? 0; return; }
      if (pauseAfter) { el.pause(); resumeTimer.current = window.setTimeout(() => void el.play(), 3000); }
    }
    lastIdx.current = i;
  };

  useEffect(() => {
    if (!follow || !playing) return;
    const verse = document.getElementById(`verse-${key}-${idx}`);
    const bar = document.getElementById("recite-bar");
    if (!verse) return;
    const clearance = (bar?.getBoundingClientRect().bottom ?? 96) + 12;
    const top = verse.getBoundingClientRect().top + window.scrollY - clearance;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [idx, follow, playing, key]);

  const speakIndex = (i: number) => {
    const line = flags.current.verses[i]?.sa?.replace(/\s+/g, " ").trim();
    if (!line) return;
    setOwnedVoice(true);
    setSpokenIdx(i);
    lastIdx.current = i;
    speakLine(line, {
      rate: flags.current.speed,
      onstart: () => setPlaying(true),
      onend: () => {
        const f = flags.current;
        if (f.repeat) { speakIndex(i); return; }
        const next = i + 1;
        if (next < f.verses.length) {
          if (f.pauseAfter) resumeTimer.current = window.setTimeout(() => speakIndex(next), 3000);
          else speakIndex(next);
        } else {
          setPlaying(false);
          f.onEnded?.();
        }
      },
    });
  };
  useEffect(() => {
    if (!pendingSpeak.current || !verses.length) return;
    pendingSpeak.current = false;
    speakIndex(0);
  }, [verses]);
  const tryFile = (at?: number) => {
    const el = a.current;
    if (!el || !src) return Promise.reject(new Error("no recording"));
    if (el.error) el.load();
    if (at != null && Number.isFinite(el.duration) && el.duration > 0) el.currentTime = at;
    return el.play().then(() => setOwnedVoice(false));
  };
  const jump = (i: number) => {
    window.clearTimeout(resumeTimer.current);
    stopSpeaking();
    lastIdx.current = i;
    void tryFile(times[i] ?? 0).catch(() => speakIndex(i));
  };
  const toggle = () => {
    window.clearTimeout(resumeTimer.current);
    if (playing) { stopSpeaking(); a.current?.pause(); setPlaying(false); return; }
    stopSpeaking();
    void tryFile().catch(() => {
      if (!verses.length) { pendingSpeak.current = true; return; }
      speakIndex(idx);
    });
  };

  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm transition-colors ${on ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground hover:text-gold"}`;
  const batches = Math.ceil(verses.length / BATCH);
  const timed = d > 0 && !ownedVoice;

  return (
    <div className="mt-4">
      <div id="recite-bar" className="sticky top-16 z-30 rounded-2xl border border-gold/40 bg-card/95 p-3 shadow-glow backdrop-blur">
        <div className="flex items-center gap-4">
          <audio ref={a} src={src} preload="metadata" onError={() => setOwnedVoice(true)} onPlay={() => { setPlaying(true); setOwnedVoice(false); }} onPause={() => setPlaying(false)} onTimeUpdate={(e) => onTime(e.currentTarget)} onEnded={() => onEnded?.()} onLoadedMetadata={(e) => { setD(e.currentTarget.duration); setOwnedVoice(false); e.currentTarget.playbackRate = speed; if (autoStart) void e.currentTarget.play().catch(() => setOwnedVoice(true)); }} />
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-gradient text-primary-foreground shadow-glow transition-transform hover:scale-105">
            {playing ? <span className="flex gap-1"><i className="block h-4 w-1 rounded bg-current" /><i className="block h-4 w-1 rounded bg-current" /></span> : <span className="ml-1 block h-0 w-0 border-y-8 border-l-[13px] border-y-transparent border-l-current" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-[Cinzel] text-xs tracking-widest text-gold">{label}</p>
            <input type="range" aria-label="Seek" min={0} max={timed ? d : Math.max(verses.length - 1, 0)} step={1} value={timed ? t : idx} onChange={(e) => { const next = Number(e.target.value); if (timed && a.current) a.current.currentTime = next; else jump(next); }} className="mt-1 h-1 w-full cursor-pointer accent-[var(--color-gold)]" />
            <p className="text-xs text-muted-foreground">{ownedVoice ? (playing ? "Speaking the verse" : "Ready to speak") : `${fmt(t)} / ${fmt(d)}`}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">{l("speed")}
            <select aria-label={l("speed")} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="rounded-md border border-gold/50 bg-card px-2 py-0.5 text-gold">
              {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1.5" aria-label={l("size")}><span className="text-muted-foreground">{l("size")}</span>
            {(["s", "m", "l"] as const).map((s, i) => <button key={s} onClick={() => setSize(s)} className={chip(size === s)} style={{ fontSize: 12 + i * 3 }}>A</button>)}
          </div>
          <button onClick={() => setRepeat((v) => !v)} className={chip(repeat)} aria-pressed={repeat}>↻ {l("repeat")}</button>
          <button onClick={() => setPauseAfter((v) => !v)} className={chip(pauseAfter)} aria-pressed={pauseAfter}>⏸ {l("pause")}</button>
          <button onClick={() => setFollow((v) => !v)} className={chip(follow)} aria-pressed={follow}>⇣ {l("follow")}</button>
        </div>
      </div>

      {!homam && <p className="mt-8 text-center font-[Cinzel] text-xs tracking-[0.3em] text-gold">{l("transcript")}</p>}
      <p className="mt-1 text-center text-xs text-muted-foreground">{l("approx")}</p>
      <div className="mt-4 space-y-3">
        {Array.from({ length: batches }, (_, b) => (
          <VerseBatch key={`${key}-${b}`} chapter={chapter} textId={textId} textName={textName} start={b * BATCH} verses={verses.slice(b * BATCH, b * BATCH + BATCH)} active={idx} meaningOf={meaningOf} onJump={jump} homam={homam} size={SIZES[size]} l={l} />
        ))}
      </div>
    </div>
  );
}

function VerseBatch({ homam, chapter, textId, textName, start, verses, active, meaningOf, onJump, size, l }: { homam?: boolean | undefined; chapter?: number | undefined; textId?: string | undefined; textName?: string | undefined; start: number; verses: Verse[]; active: number; meaningOf: (verse: Verse) => string; onJump: (i: number) => void; size: string; l: (k: keyof typeof L) => string }) {
  return (
    <div className="space-y-3">
      {verses.map((v, j) => {
        const i = start + j;
        return <VerseCard key={i} id={`verse-${textId ?? chapter}-${i}`} chapter={chapter} textId={textId} textName={textName} verse={v} active={i === active} meaning={meaningOf(v)} onJump={() => onJump(i)} homam={homam} size={size} l={l} />;
      })}
    </div>
  );
}

function VerseCard({ homam, id, chapter, textId, textName, verse, active, meaning, onJump, size, l }: { homam?: boolean | undefined; id: string; chapter?: number | undefined; textId?: string | undefined; textName?: string | undefined; verse: Verse; active: boolean; meaning: string; onJump: () => void; size: string; l: (k: keyof typeof L) => string }) {
  return (
    <div id={id} className={`scroll-mt-64 rounded-xl border p-4 transition-all duration-500 ${homam ? "text-center " : ""}${active ? "border-gold bg-gold/10 shadow-glow" : homam ? "border-transparent opacity-60" : "border-border bg-card/60"}`}>
      <button onClick={onJump} className={`block w-full ${homam ? "text-center" : "text-left"}`}>
        <span className="font-[Cinzel] text-xs tracking-widest text-vermilion">{verse.v === 0 ? l("preamble") : textId ? `${textName ?? ""} ${verse.v}` : `${chapter}.${verse.v}`}</span>
        <p className={`deva mt-1 whitespace-pre-line leading-relaxed ${active ? "text-gold" : "text-gold/85"} ${size}`}>{verse.sa}</p>
        {!homam && <p lang="sa-Latn" className="mt-2 whitespace-pre-line break-words text-left text-base italic leading-relaxed text-foreground/80">{toIast(verse.sa)}</p>}
      </button>
      {homam && verse.v > 0 && <p className="deva mt-2 text-center text-vermilion">॥ स्वाहा ॥</p>}
      {meaning && (
        <p lang="en" className="mt-3 border-t border-gold/30 pt-3 text-left text-base leading-relaxed text-foreground/90">
          <span className="mb-1 block font-[Cinzel] text-[0.65rem] tracking-widest text-gold">{l("meaning")}</span>
          {meaning}
        </p>
      )}
    </div>
  );
}
