import { createFileRoute } from "@tanstack/react-router";
import { ChapterHome } from "@/components/ChapterHome";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Devi Mahatmya — Learn the Durga Saptashati" },
      { name: "description", content: "A devotional learning companion for all 13 chapters of the Durga Saptashati: stories, Sanskrit verses, practices, quizzes and an AI guide." },
      { property: "og:title", content: "Devi Mahatmya — Learn the Durga Saptashati" },
      { property: "og:description", content: "Walk the 13 chapters of the Devi Mahatmyam with verses, stories and quizzes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChapterHome,
});
