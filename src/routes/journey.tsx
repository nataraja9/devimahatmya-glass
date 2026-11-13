// SOMNATH-AI: Sankalpa conversation page | ZONE: 0 | PURPOSE: The same short questionnaire as the yatra window, when the route is opened directly. | CONTRACT: No form. The blessing card is minted in the conversation.
import { createFileRoute } from "@tanstack/react-router";
import { SankalpaConversation } from "@/components/SankalpaConversation";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "Journey Sankalpa · Devi Mahatmya" },
      { name: "description", content: "The sankalpa is the 13 km journey to the Devi's mandir. A name may be spoken, then the blessing card is minted in the same window." },
      { property: "og:title", content: "Journey Sankalpa · Devi Mahatmya" },
      { property: "og:description", content: "A blessing card for the 13 km journey to the Devi's mandir." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Journey,
});

function Journey() {
  return (
    <main className="mx-auto flex h-[min(40rem,calc(100dvh-6rem))] max-w-lg flex-col px-3 py-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gold/40 bg-background/80">
        <SankalpaConversation />
      </div>
    </main>
  );
}
