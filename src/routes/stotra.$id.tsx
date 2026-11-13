import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { stotraById, stotras } from "@/data/stotras";
import { StotraView } from "@/components/StotraView";

export const Route = createFileRoute("/stotra/$id")({
  loader: ({ params }) => {
    const s = stotraById(params.id);
    if (!s) throw notFound();
    return s;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.name} — Devi Mahatmya` : "Stotram — Devi Mahatmya";
    const d = loaderData ? `${loaderData.purpose} Full Sanskrit text with meaning and recitation.` : "";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
  },
  notFoundComponent: () => <div className="p-20 text-center">Not found. <Link to="/study" className="text-gold">Back</Link></div>,
  component: StotraPage,
});

function StotraPage() {
  const s = Route.useLoaderData();
  return (
    <main key={s.id} className="mx-auto max-w-5xl px-5 py-10 animate-rise">
      <StotraView id={s.id} />
      <StotraNav id={s.id} />
    </main>
  );
}

function StotraNav({ id }: { id: string }) {
  const i = stotras.findIndex((x) => x.id === id);
  const prev = stotras[i - 1], next = stotras[i + 1];
  return (
    <nav className="mt-12 flex items-center justify-between gap-3 font-[Cinzel]">
      {prev ? <Link to="/stotra/$id" params={{ id: prev.id }} className="text-gold hover:underline">← {prev.name}</Link> : <span />}
      {next ? <Link to="/stotra/$id" params={{ id: next.id }} className="text-gold hover:underline">{next.name} →</Link> : <span />}
    </nav>
  );
}
