import { stotraById } from "@/data/stotras";
import { Recitation } from "@/components/Recitation";
import { useT, useTranslated } from "@/lib/i18n";
import { HL } from "@/lib/homam-labels";

export function StotraView({ id, onEnded, autoStart }: { id: string; onEnded?: (() => void) | undefined; autoStart?: boolean | undefined }) {
  const s = stotraById(id)!;
  const { t, lang } = useT();
  const { texts } = useTranslated([s.name, s.purpose]);
  return (
    <>
      <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-end">
        <div className="frame-temple mx-auto w-full max-w-[200px] overflow-hidden rounded-xl"><img src={s.image} alt={s.name} width={800} height={1008} className="w-full object-cover" /></div>
        <div>
          <p className="font-[Cinzel] text-sm tracking-widest text-vermilion">{(s.group === "pre" ? HL.pre : HL.post)[lang].toUpperCase()}</p>
          <h1 className="font-display text-4xl text-gold-gradient md:text-5xl">{texts[0]}</h1>
          <p className="deva mt-1 text-2xl text-gold/90">{s.sanskrit}</p>
          <p className="mt-2 text-lg italic text-muted-foreground">{texts[1]}</p>
        </div>
      </div>
      <section className="mt-10 rounded-2xl frame-temple bg-card/80 p-6 md:p-8">
        <h2 className="text-center font-display text-2xl text-gold">{t("hearChant")}</h2>
        <Recitation textId={s.id} textName={s.name} src={s.audio} label={s.name} onEnded={onEnded} autoStart={autoStart} />
      </section>
    </>
  );
}
