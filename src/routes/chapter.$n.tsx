import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { chapters, charitraOf } from "@/data/chapters";
import { useProgress } from "@/lib/progress";
import { Recitation } from "@/components/Recitation";
import { mediaFor } from "@/data/media";
import { useT, useTranslated } from "@/lib/i18n";

export const Route = createFileRoute("/chapter/$n")({
  loader: ({ params }) => {
    const ch = chapters.find((c) => c.n === Number(params.n));
    if (!ch) throw notFound();
    return ch;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `Chapter ${loaderData.n}: ${loaderData.title} — Devi Mahatmya` : "Chapter — Devi Mahatmya";
    const d = loaderData ? `${loaderData.theme}. Story, Sanskrit verse, lessons and quiz for Durga Saptashati Chapter ${loaderData.n}.` : "";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: () => <div className="p-20 text-center">Chapter not found. <Link to="/study" className="text-gold">Back</Link></div>,
  component: ChapterPage,
});

function ChapterPage() {
  return <ChapterLearn />;
}

function ChapterLearn() {
  const base = Route.useLoaderData();
  const { t } = useT();
  const src = [base.title, base.theme, base.story, base.verse.en, base.practice, ...base.lessons, ...base.quiz.flatMap((q) => [q.q, ...q.options]), "§" + base.verse.tr, charitraOf(base).name, charitraOf(base).deity];
  const tail = src.length - 3;
  const { texts: trRaw, loading } = useTranslated(src);
  const tr = (i: number) => trRaw[i] ?? "";
  let k = 5 + base.lessons.length;
  const ch = {
    ...base, title: tr(0), theme: tr(1), story: tr(2), verse: { ...base.verse, en: tr(3), tr: tr(tail).replace(/^§/, "") }, practice: tr(4),
    lessons: base.lessons.map((_, i) => tr(5 + i)),
    quiz: base.quiz.map((q) => { const qq = tr(k++); return { ...q, q: qq, options: q.options.map(() => tr(k++)) }; }),
  };
  const c = charitraOf(ch);
  const { progress, update } = useProgress();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const media = mediaFor(ch.n);
  const score = ch.quiz.filter((q, i) => answers[i] === q.answer).length;

  return (
    <main key={ch.n} className="mx-auto max-w-5xl px-5 py-10 animate-rise">
      <img src={c.image} alt={c.deity} width={800} height={1008} className="mx-auto w-full rounded-xl object-contain" />
      <div className="mt-8 text-center">
        <p className="font-[Cinzel] text-sm tracking-widest text-vermilion">{tr(tail + 1).toUpperCase()} · {tr(tail + 2).toUpperCase()}</p>
        <p className="mt-2 font-[Cinzel] text-gold">{t("chapter")} {ch.n} {t("of13")}</p>
        <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">{ch.title}</h1>
        <p className="deva mt-1 text-2xl text-gold/90">{ch.sanskritTitle}</p>
        <p className="mt-2 text-xl italic text-muted-foreground">{ch.theme}</p>
        {loading && <p className="mt-2 text-sm text-gold animate-diya">{t("translating")}</p>}
      </div>

      <section className="mt-12 rounded-2xl frame-temple bg-card/80 p-8 text-center">
        <p className="font-[Cinzel] text-xs tracking-[0.3em] text-gold">{t("keyShloka")}</p>
        <p className="deva mt-4 text-2xl leading-relaxed text-gold md:text-3xl">{ch.verse.sa}</p>
        <p className="mt-4 italic text-foreground/80">{ch.verse.tr}</p>
        <p className="mx-auto mt-4 max-w-2xl text-lg">{ch.verse.en}</p>
      </section>

      {media.chant && (
        <section className="mt-12 rounded-2xl frame-temple bg-card/80 p-6 md:p-8">
          <Recitation chapter={ch.n} src={media.chant} label={t("chantLabel")} />
        </section>
      )}

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="font-display text-2xl text-gold">{t("story")}</h2>
          <p className="mt-3 text-lg leading-relaxed text-foreground/90">{ch.story}</p>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-gold">{t("teachings")}</h2>
            <ul className="mt-3 space-y-2">{ch.lessons.map((l) => <li key={l} className="flex gap-2"><span className="text-vermilion">✦</span>{l}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-vermilion/50 bg-secondary/20 p-5">
            <h3 className="font-[Cinzel] text-sm tracking-widest text-vermilion">{t("sadhana")}</h3>
            <p className="mt-2">{ch.practice}</p>
          </div>
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-card/60 p-7">
        <h2 className="font-display text-2xl text-gold">{t("reflect")}</h2>
        <div className="mt-5 space-y-6">
          {ch.quiz.map((q, i) => (
            <div key={i}>
              <p className="font-semibold">{i + 1}. {q.q}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {q.options.map((o, j) => {
                  const sel = answers[i] === j;
                  const state = checked ? (j === q.answer ? "border-gold bg-gold/15 text-gold" : sel ? "border-destructive bg-destructive/15" : "border-border opacity-70") : sel ? "border-gold bg-gold/10" : "border-border hover:border-gold/60";
                  return <button key={j} disabled={checked} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))} className={`rounded-lg border px-4 py-2 text-left transition-colors ${state}`}>{o}</button>;
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {!checked ? (
            <button disabled={Object.keys(answers).length < ch.quiz.length} onClick={() => { setChecked(true); update(ch.n, { read: true, score }); }} className="rounded-full bg-gold-gradient px-6 py-2 font-[Cinzel] font-bold text-primary-foreground disabled:opacity-40">{t("check")}</button>
          ) : (
            <>
              <p className="text-lg text-gold">{t("scored")} {score} / {ch.quiz.length} {score === 3 ? "— Jai Mata Di! 🪔" : ""}</p>
              <button onClick={() => { setAnswers({}); setChecked(false); }} className="text-sm text-muted-foreground underline">{t("retry")}</button>
            </>
          )}
          {!progress[ch.n]?.read && !checked && <button onClick={() => update(ch.n, { read: true })} className="text-sm text-muted-foreground underline">{t("markRead")}</button>}
        </div>
      </section>

      <nav className="mt-12 flex items-center justify-between font-[Cinzel]">
        {ch.n > 1 ? <Link to="/chapter/$n" params={{ n: String(ch.n - 1) }} className="text-gold hover:underline">← {t("chapter")} {ch.n - 1}</Link> : <span />}
        <Link to="/guide" search={{ chapter: ch.n }} className="rounded-full border border-gold/60 px-5 py-2 text-gold hover:bg-gold/10">{t("askChapter")}</Link>
        {ch.n < 13 ? <Link to="/chapter/$n" params={{ n: String(ch.n + 1) }} className="text-gold hover:underline">{t("chapter")} {ch.n + 1} →</Link> : <span />}
      </nav>
    </main>
  );
}
