import { useEffect, useRef, useState } from "react";

const fmt = (s: number) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

export function ChantPlayer({ src, label }: { src: string; label: string }) {
  const a = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  useEffect(() => { setPlaying(false); setT(0); }, [src]);
  const toggle = () => { const el = a.current; if (!el) return; if (el.paused) void el.play(); else el.pause(); };
  return (
    <div className="mt-4 flex items-center gap-4 rounded-full border border-gold/40 bg-background/60 py-2 pl-2 pr-5">
      <audio ref={a} src={src} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setD(e.currentTarget.duration)} />
      <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold-gradient text-primary-foreground shadow-glow transition-transform hover:scale-105">
        {playing ? <span className="flex gap-1"><i className="block h-4 w-1 rounded bg-current" /><i className="block h-4 w-1 rounded bg-current" /></span> : <span className="ml-1 block h-0 w-0 border-y-8 border-l-[13px] border-y-transparent border-l-current" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-[Cinzel] text-xs tracking-widest text-gold">{label}</p>
        <input type="range" aria-label="Seek" min={0} max={d || 0} step={1} value={t} onChange={(e) => { if (a.current) a.current.currentTime = Number(e.target.value); }} className="mt-1 h-1 w-full cursor-pointer accent-[var(--color-gold)]" />
        <p className="text-xs text-muted-foreground">{fmt(t)} / {fmt(d)}</p>
      </div>
    </div>
  );
}
