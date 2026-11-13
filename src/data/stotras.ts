// Saptashati angas recited before (purvanga) and after (uttaranga) the 13 chapters, e.g. in Chandi Homam.
// Recitations: "Durga Saptashati Chants" series on archive.org, streamed from the source.
import kali from "@/assets/mahakali.jpg";
import lakshmi from "@/assets/mahalakshmi.jpg";
import saraswati from "@/assets/mahasaraswati.jpg";
import hero from "@/assets/durga-hero.jpg";

export type Stotra = { id: string; group: "pre" | "post"; name: string; sanskrit: string; purpose: string; image: string; audio: string };
const ia = (item: string, file: string) => `https://archive.org/download/${item}/${encodeURIComponent(file)}`;

export const stotras: Stotra[] = [
  { id: "kavacham", group: "pre", name: "Devi Kavacham", sanskrit: "देवीकवचम्", purpose: "The armour of the Goddess — invokes Her forms to protect every part of the body and life before the Path begins.", image: kali, audio: ia("xzvz_03.-devyah-kavacham", "03. Devyah kavacham.mp3") },
  { id: "argala", group: "pre", name: "Argala Stotram", sanskrit: "अर्गलास्तोत्रम्", purpose: "The bolt-opening hymn — removes obstacles with the refrain “rūpaṃ dehi jayaṃ dehi yaśo dehi dviṣo jahi”.", image: lakshmi, audio: ia("uoev_04.-argalastotram-1", "04. Argalastotram(1).mp3") },
  { id: "keelakam", group: "pre", name: "Keelakam", sanskrit: "कीलकस्तोत्रम्", purpose: "The pin hymn — Shiva's teaching that unlocks the power of the Saptashati so the recitation bears fruit.", image: saraswati, audio: ia("avqq_05.-kilakam", "05. Kilakam.mp3") },
  { id: "pradhanika", group: "post", name: "Pradhanika Rahasyam", sanskrit: "प्राधानिकरहस्यम्", purpose: "First secret — Mahalakshmi as the primordial Source from whom Mahakali and Mahasaraswati arise.", image: lakshmi, audio: ia("qdgj_19.-pradhanikam-rahasyam", "19. Pradhanikam Rahasyam.mp3") },
  { id: "vaikritika", group: "post", name: "Vaikritika Rahasyam", sanskrit: "वैकृतिकरहस्यम्", purpose: "Second secret — the forms, colours and weapons of the three Devis and how to worship them.", image: kali, audio: ia("ymau_20.-vaikriti-rahasyam", "20. Vaikriti Rahasyam.mp3") },
  { id: "murti", group: "post", name: "Murti Rahasyam", sanskrit: "मूर्तिरहस्यम्", purpose: "Third secret — the incarnations Nanda, Raktadantika, Shakambhari, Durga, Bhima and Bhramari.", image: saraswati, audio: ia("gbza_21.-murti-rahasyam", "21. Murti Rahasyam.mp3") },
  { id: "kunjika", group: "post", name: "Siddha Kunjika Stotram", sanskrit: "सिद्धकुञ्जिकास्तोत्रम्", purpose: "The key hymn of seed-syllables — awakens the mantras of the whole Saptashati.", image: hero, audio: ia("butx_26.-siddha-kunjika-stotram", "26. Siddha kunjika stotram.mp3") },
  { id: "kshama", group: "post", name: "Kshama Prarthana", sanskrit: "देवीक्षमापणस्तोत्रम्", purpose: "The prayer for forgiveness — offering every omission in mantra, action or devotion back to the Mother. Recited at the close of the homam.", image: hero, audio: ia("isjr_22.-kshama-prarthana", "22. Kshama Prarthana.mp3") },
];
export const stotraById = (id: string) => stotras.find((s) => s.id === id);

/** Full Chandi Homam / Saptashati parayana order. */
export type Step = { kind: "stotra"; id: string } | { kind: "chapter"; n: number };
export const homamOrder: Step[] = [
  ...stotras.filter((s) => s.group === "pre").map((s) => ({ kind: "stotra" as const, id: s.id })),
  ...Array.from({ length: 13 }, (_, i) => ({ kind: "chapter" as const, n: i + 1 })),
  ...stotras.filter((s) => s.group === "post").map((s) => ({ kind: "stotra" as const, id: s.id })),
];
