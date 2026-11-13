// SOMNATH-AI: Sacred Yatra screen | ZONE: 0 | PURPOSE: A 13-step devotional trail through the Devi Mahatmyam. | CONTRACT: Symbolic keepsakes saved in this browser. Not a shrine pass or a walking map.
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, Check, Crown, Download, Lock, Mountain } from "lucide-react";
import mountain from "@/assets/vaishno/temple-hero.jpg";
import { AshirvadaCard } from "@/components/AshirvadaCard";
import { ClimbSave } from "@/components/ClimbSave";
import { SankalpaConversation } from "@/components/SankalpaConversation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chapters } from "@/data/chapters";
import { mediaFor } from "@/data/media";
import { yatraSteps } from "@/data/yatra";
import { useT, useTranslated } from "@/lib/i18n";
import { mileTitle, prettyKm } from "@/lib/trail-mile";
import { isYatraUnlocked, useYatra } from "@/lib/yatra";
import { YL } from "@/lib/yatra-labels";
import { yatraProfile } from "@/data/yatra-profile";

export const Route = createFileRoute("/yatra")({
  head: () => ({ meta: [
    { title: "Vaishno Devi Sacred Yatra · Devi Mahatmya" },
    { name: "description", content: "A symbolic 13-step Vaishno Devi devotional journey through the Devi Mahatmyam, with Sanskrit recitation and golden chapter keepsakes." },
    { property: "og:title", content: "Vaishno Devi Sacred Yatra · Devi Mahatmya" },
    { property: "og:description", content: "Walk a devotional trail through thirteen chapters and collect a personal golden token mala." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Yatra,
});

function Yatra() {
  const { lang } = useT();
  const l = (key: keyof typeof YL) => YL[key][lang];
  const { state, ready, complete, storageError } = useYatra();
  const [selected, setSelected] = useState<number | null>(null);
  const [sankalpaOpen, setSankalpaOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [received, setReceived] = useState<number | null>(null);
  const chant = useRef<HTMLAudioElement>(null);
  const source = yatraSteps.flatMap(s => [s.place, s.token, chapters[s.chapter - 1]?.title ?? ""]);
  const { texts } = useTranslated(source);
  const text = (chapter: number, offset: number) => texts[(chapter - 1) * 3 + offset] ?? "";
  const chapter = selected ?? Math.min(state.completed + 1, 13);
  const step = yatraSteps[chapter - 1];
  const currentChapter = chapters[chapter - 1];
  const audio = mediaFor(chapter).chant;
  const finished = state.completed === 13;
  const profile = yatraProfile[chapter - 1];
  const { texts: details } = useTranslated([profile?.reflection ?? "", currentChapter?.verse.en ?? "", ...yatraProfile.flatMap(s => [s.blessing, s.coinMantra, s.waypoint])]);
  const selectedBlessing = (n: number) => details[2 + (n - 1) * 3] ?? l("blessing");
  const inscription = (n: number) => details[3 + (n - 1) * 3] ?? "";

  const kmMark = (n: number) => {
    const km = yatraProfile[n - 1]?.km ?? "";
    return km.endsWith("+") ? l("past13") : `${l("est")} ${prettyKm(km)} km`;
  };
  const mile = (n: number) => mileTitle(text(n, 0), n, l("step"), yatraProfile[n - 1]?.km ?? "", l("est"), l("past13"));
  const choose = (n: number) => {
    if (!isYatraUnlocked(state, n)) return;
    chant.current?.pause();
    setPlaying(false);
    setSelected(n);
    setReceived(null);
  };
  const toggleChant = () => {
    const el = chant.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => setPlaying(false));
    else el.pause();
  };
  const receive = () => {
    if (chapter === state.completed + 1 && complete(chapter)) {
      chant.current?.pause();
      setPlaying(false);
      setReceived(chapter);
    }
  };
  const saveKeepsake = () => {
    const lines = [l("title"), finished ? l("completeTitle") : l("mala"), `${state.completed} ${l("collected")}`, "", ...yatraSteps.slice(0, state.completed).flatMap(s => [`${s.chapter}. ${text(s.chapter, 0)} — ${text(s.chapter, 1)}`, inscription(s.chapter), selectedBlessing(s.chapter), ""])];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "vaishno-devi-golden-mala.txt"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main>
      <section className="yatra-cover relative isolate overflow-hidden">
        <img src={mountain} width={1600} height={1000} alt={l("illustration")} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="yatra-cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-5 pb-10 pt-20 md:min-h-[480px]">
          <p className="text-base text-gold">Shri Mata Vaishno Devi Yatra · 13 km Mountain Pilgrimage</p>
          <h1 className="mt-3 max-w-4xl font-display text-3xl leading-tight text-foreground md:text-5xl">The Sacred Path of the Devi Mahatmyam</h1>
          <p className="mt-4 max-w-3xl text-xl leading-relaxed text-foreground">From Katra to the Holy Cave and Bhairon Ghati, each rest stop is one chapter. You confirm the step, hear the chant, and mint one golden token. Distances are walking estimates.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 text-sm text-gold"><Mountain size={16} />{state.completed} {l("collected")}</p>
            <button type="button" onClick={() => setSankalpaOpen(true)} className="homam-btn rounded-full px-6 py-2.5 font-display text-base font-bold transition-transform hover:scale-105 md:px-8 md:text-lg">Journey Sankalpa</button>
            <Dialog open={sankalpaOpen} onOpenChange={setSankalpaOpen}>
              <DialogContent className="flex h-[min(40rem,calc(100dvh-1.5rem))] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden p-0">
                <DialogHeader className="border-b border-gold/30 px-4 py-3 pr-12 text-left">
                  <DialogTitle className="font-display text-lg text-gold">Journey Sankalpa</DialogTitle>
                  <DialogDescription className="sr-only">A short questionnaire. The blessing card appears in this window.</DialogDescription>
                </DialogHeader>
                {sankalpaOpen && <SankalpaConversation titled={false} />}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="min-w-0" aria-label={l("trail")}>
            <h2 className="mb-5 font-display text-xl text-gold">{l("trail")}</h2>
            <ol className="yatra-trail grid gap-1">
              {yatraSteps.map(s => {
                const unlocked = ready && isYatraUnlocked(state, s.chapter);
                const done = s.chapter <= state.completed;
                return <li key={s.chapter}>
                  <Button variant="ghost" disabled={!unlocked} aria-current={chapter === s.chapter ? "step" : undefined} onClick={() => choose(s.chapter)} className={`h-auto min-h-16 w-full justify-start whitespace-normal px-2 py-3 text-left ${chapter === s.chapter ? "bg-gold/10 text-gold" : "text-foreground"}`}>
                    <span className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border bg-background ${done ? "border-gold text-gold" : "border-border"}`}>
                      {done ? <Check size={16} /> : unlocked ? s.chapter : <Lock size={14} />}
                    </span>
                    <span className="min-w-0"><span className="block text-base">{text(s.chapter, 0)}</span><span className="mt-0.5 block text-xs text-muted-foreground">{l("step")} {s.chapter} · {kmMark(s.chapter)} · {text(s.chapter, 1)}</span></span>
                  </Button>
                </li>;
              })}
            </ol>
          </section>

          <div className="min-w-0">
            {received ? <section className="yatra-blessing py-8 text-center" aria-live="polite">
              <div className="mx-auto w-full max-w-xl"><AshirvadaCard mark={text(received, 1)} emblem /></div>
              <p className="mt-6 text-sm text-gold">{l("received")}</p>
              <h2 className="mt-2 font-display text-3xl text-gold">{text(received, 1)}</h2>
              <p className="mt-3 text-sm text-gold">{inscription(received)}</p>
              <p className="mx-auto mt-5 max-w-md text-xl">{selectedBlessing(received)}</p>
              <Button className="mt-6" onClick={() => { setReceived(null); if (received < 13) choose(received + 1); else setSelected(null); }}>{received < 13 ? l("next") : l("treasury")}<ArrowRight /></Button>
            </section> : finished && selected === null ? <section className="yatra-blessing py-8 text-center">
              <Crown className="mx-auto size-20 text-gold" />
              <h2 className="mt-4 font-display text-3xl text-gold">{l("completeTitle")}</h2>
              <p className="mt-4 text-xl">{l("crownNote")}</p>
              <p className="mt-4 text-muted-foreground">{l("blessing")}</p>
            </section> : step && currentChapter ? <section className="border-b border-border pb-8">
              {chapter === 1 && <div className="mb-6"><ClimbSave /></div>}
              <h2 className="font-display text-3xl leading-tight text-gold">{mile(chapter)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{l("chapter")} {chapter} · {text(chapter, 2)}</p>
              <p className="deva mt-6 text-3xl leading-relaxed text-gold">{currentChapter.verse.sa}</p>
              <p className="mt-3 text-xl italic text-muted-foreground">{currentChapter.verse.tr}</p>
              <p className="mt-3 text-xl leading-relaxed">{details[1]}</p>
              {audio && <audio key={chapter} ref={chant} src={audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />}
              {audio && <button type="button" onClick={toggleChant} className="homam-btn mt-6 block w-full rounded-full px-4 py-4 font-display text-lg font-bold">{playing ? l("pause") : l("play")}</button>}
              {chapter > state.completed ? <button type="button" onClick={receive} disabled={!ready} className="yatra-btn mt-3 block w-full rounded-full px-4 py-4 text-base font-bold disabled:opacity-40">{chapter < 13 ? l("mint") : l("mintLast")}</button> : <p className="mt-6 flex items-center gap-2 text-gold"><Check size={16} />{l("revisit")}</p>}
            </section> : null}

            {storageError && <p role="alert" className="mt-4 text-destructive">{l("error")}</p>}
            <section className="pt-8" aria-label={l("mala")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-xl text-gold">{l("mala")}</h2>
                {state.completed > 0 && <Button variant="ghost" onClick={saveKeepsake}><Download />{l("save")}</Button>}
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {yatraSteps.map(s => {
                  const held = s.chapter <= state.completed;
                  return <button key={s.chapter} type="button" disabled={!held} onClick={() => { chant.current?.pause(); setPlaying(false); setReceived(s.chapter); }} className="block w-full cursor-pointer p-0 disabled:cursor-not-allowed" aria-label={`${l("review")} ${s.chapter}: ${text(s.chapter, 1)}`}>
                    <AshirvadaCard mark={text(s.chapter, 1)} emblem dimmed={!held} />
                  </button>;
                })}
              </div>
              {finished && <p className="mt-6 flex items-center gap-2 text-gold"><Crown size={20} />{l("completeTitle")}</p>}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
