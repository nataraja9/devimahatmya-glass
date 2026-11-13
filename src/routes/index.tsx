import { createFileRoute } from "@tanstack/react-router";
import { VaishnoLanding } from "@/components/VaishnoLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vaishno Devi" },
      { name: "description", content: "Vaishno Devi. Om Aim Hrim Klim Chamundaye Vicche." },
      { property: "og:title", content: "Vaishno Devi" },
      { property: "og:description", content: "Om Aim Hrim Klim Chamundaye Vicche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VaishnoLanding,
});
