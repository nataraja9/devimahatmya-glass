import { Link } from "@tanstack/react-router";
import { LANGS, setLang, useT, type Lang } from "@/lib/i18n";
import { HL } from "@/lib/homam-labels";
import { JOURNEY_RESET } from "@/lib/journey";

export function SiteHeader() {
  const { t, lang } = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex w-full flex-wrap items-center justify-between gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="deva text-2xl text-gold animate-diya">ॐ</span>
          <span className="font-display text-lg text-gold-gradient">{t("appName")}</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-base font-[Cinzel] tracking-wide">
          <Link to="/journey" onClick={() => window.dispatchEvent(new Event(JOURNEY_RESET))} className="rounded-full border border-gold/60 px-3 py-1 text-sm text-gold hover:bg-gold/10">Sankalpa Journey</Link>
          <Link to="/homam" className="homam-btn rounded-full px-4 py-1.5 font-display text-sm font-bold transition-transform hover:scale-105 md:px-5 md:text-base">
            🔥 {HL.homam[lang]}
          </Link>
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="rounded-md border border-gold/50 bg-card px-2 py-0.5 text-sm text-gold">
            {LANGS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </nav>
      </div>
    </header>
  );
}
