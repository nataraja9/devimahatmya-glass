import { Link } from "@tanstack/react-router";
import type { Stotra } from "@/data/stotras";

export function StotraCard({ s, name, purpose }: { s: Stotra; name: string; purpose: string }) {
  return (
    <Link to="/stotra/$id" params={{ id: s.id }} className="group flex gap-4 rounded-lg border border-border bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-glow">
      <img src={s.image} alt="" width={64} height={80} loading="lazy" className="h-20 w-16 shrink-0 rounded-md object-cover" />
      <div className="min-w-0">
        <p className="deva text-gold">{s.sanskrit}</p>
        <h3 className="text-xl font-semibold group-hover:text-gold">{name}</h3>
        <p className="mt-1 text-sm text-foreground/75">{purpose}</p>
      </div>
    </Link>
  );
}
