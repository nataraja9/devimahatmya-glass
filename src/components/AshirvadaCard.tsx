// SOMNATH-AI: Ashirvada card | ZONE: 0 | PURPOSE: The gold blessing plate with one mark in the open gold. | CONTRACT: The mark stays between the trishul and Devi and does not cover the lamps.
import ashirvadaCard from "@/assets/kanaka-durga-ashirvada.png";

export function AshirvadaCard({ mark, emblem = false, dimmed = false, alt = "" }: { mark?: string; emblem?: boolean; dimmed?: boolean; alt?: string }) {
  return (
    <figure className={`ashirvada-plate relative mx-auto w-full max-w-full ${dimmed ? "ashirvada-plate-dim" : ""}`}>
      <img src={ashirvadaCard} alt={alt} width={768} height={428} className="block h-auto w-full max-w-full object-contain" />
      {mark && <figcaption className={`ashirvada-mark pointer-events-none absolute top-[30%] left-[27%] flex w-[28%] items-center justify-center gap-[0.35em] whitespace-nowrap font-display font-bold leading-none text-[#3b1408] [text-shadow:0_0_1px_#fffaf3,0_0_4px_#fffaf3,0_1px_0_#fffaf3] ${emblem ? "tracking-[0.04em]" : ""}`}>
        {emblem && <svg viewBox="0 0 100 100" className="h-[1.15em] w-[1.15em] shrink-0" aria-hidden="true"><path fill="currentColor" d="M43 8h14v42H43zM43 8h49v14H43zM50 43h42v14H50zM78 43h14v49H78zM43 50h14v42H43zM8 78h49v14H8zM8 43h42v14H8zM8 8h14v49H8z" /></svg>}
        {mark}
      </figcaption>}
    </figure>
  );
}
