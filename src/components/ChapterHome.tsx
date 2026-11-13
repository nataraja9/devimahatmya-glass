import { Link } from "@tanstack/react-router";
import hero from "@/assets/durga-hero.jpg";
import { chapters, charitras } from "@/data/chapters";
import { useProgress } from "@/lib/progress";
import { useT, useTranslated } from "@/lib/i18n";
import { stotras } from "@/data/stotras";
import { StotraCard } from "@/components/StotraCard";
import { HL } from "@/lib/homam-labels";

export function ChapterHome() {
  const { progress } = useProgress();
  const { t, lang } = useT();
  const { texts: st } = useTranslated(stotras.flatMap((s) => [s.name, s.purpose]));
  const src = [...charitras.flatMap((c) => [c.name, c.deity, c.guna, c.essence]), ...chapters.flatMap((ch) => [ch.title, ch.theme])];
  const { texts: tr } = useTranslated(src);
  const cx = (i: number, k: number) => tr[i * 4 + k] ?? "";
  const chx = (n: number, k: number) => tr[charitras.length * 4 + (n - 1) * 2 + k] ?? "";
  const Angas = ({ g }: { g: "pre" | "post" }) => (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <p className="text-center font-[Cinzel] text-sm tracking-[0.3em] text-vermilion">{HL[g][lang].toUpperCase()}</p>
      <p className="mt-2 text-center italic text-muted-foreground">{HL[g === "pre" ? "preDesc" : "postDesc"][lang]}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stotras.map((s, i) => s.group === g && <StotraCard key={s.id} s={s} name={st[i * 2] ?? s.name} purpose={st[i * 2 + 1] ?? s.purpose} />)}
      </div>
    </section>
  );
  return (
    <main>
      <section className="px-2 pb-10 pt-2 sm:px-4">
        <img
          src={hero}
          alt="Goddess Durga seated on her lion in a golden temple"
          width={1600}
          height={1008}
          className="mx-auto block h-auto w-auto max-h-[calc(100dvh-8rem)] max-w-full object-contain sm:max-h-[calc(100dvh-5.5rem)]"
        />
        <div className="mx-auto mt-4 max-w-6xl px-3 text-center">
          <p className="deva text-2xl text-gold">॥ ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥</p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-gold-gradient md:text-7xl">{t("appName")}</h1>
        </div>
      </section>

      <Angas g="pre" />

      {charitras.map((c, ci) => (
        <section key={c.id} className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-8 md:grid-cols-[300px_1fr] md:items-start">
            <div className="frame-temple mx-auto w-full max-w-[300px] self-start overflow-hidden rounded-xl md:sticky md:top-20">
              <img src={c.image} alt={c.deity} width={800} height={1008} loading="lazy" className="block h-auto w-full" />
            </div>
            <div>
              <p className="deva text-xl text-gold">{c.devanagari}</p>
              <h2 className="font-display text-3xl text-gold-gradient md:text-4xl">{cx(ci, 0)}</h2>
              <p className="mt-1 font-[Cinzel] text-sm tracking-widest text-vermilion">{cx(ci, 1).toUpperCase()} · {cx(ci, 2).toUpperCase()}</p>
              <p className="mt-3 text-lg italic text-muted-foreground">{cx(ci, 3)}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {chapters.filter((ch) => ch.charitra === c.id).map((ch) => (
                  <Link key={ch.n} to="/chapter/$n" params={{ n: String(ch.n) }} className="group rounded-lg border border-border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-glow">
                    <div className="flex items-baseline justify-between">
                      <span className="font-[Cinzel] text-xs tracking-widest text-gold">{t("chapter").toUpperCase()} {ch.n}</span>
                      {progress[ch.n]?.read && <span className="text-xs text-gold">✦ {t("read")}{progress[ch.n]?.score != null ? ` · ${progress[ch.n]?.score}/3` : ""}</span>}
                    </div>
                    <h3 className="mt-1 text-xl font-semibold group-hover:text-gold">{chx(ch.n, 0)}</h3>
                    <p className="deva text-sm text-muted-foreground">{ch.sanskritTitle}</p>
                    <p className="mt-1 text-sm text-foreground/75">{chx(ch.n, 1)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
      <Angas g="post" />
      <footer className="border-t border-border py-8 text-center deva text-gold/80">सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके</footer>
    </main>
  );
}
