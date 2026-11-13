import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { translateTexts } from "@/lib/guide.functions";

export type Lang = "en" | "hi" | "te";
export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "te", label: "తెలుగు" },
];
const KEY = "devi-lang";
const listeners = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  localStorage.setItem(KEY, l);
  document.documentElement.lang = l;
  listeners.forEach((f) => f(l));
}

export function useLang() {
  const [lang, set] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem(KEY) as Lang | null;
    if (s === "hi" || s === "te") { set(s); document.documentElement.lang = s; }
    listeners.add(set);
    return () => { listeners.delete(set); };
  }, []);
  return lang;
}

const UI = {
  chapters: { en: "Chapters", hi: "अध्याय", te: "అధ్యాయాలు" },
  askGuide: { en: "Ask the Guide", hi: "मार्गदर्शक से पूछें", te: "మార్గదర్శిని అడగండి" },
  heroLine: { en: "Seven hundred verses. Thirteen chapters. One Devi. Walk the Devi Mahatmyam chapter by chapter — story, shloka, practice and quiz.", hi: "सात सौ श्लोक। तेरह अध्याय। एक देवी। देवी माहात्म्य को अध्याय-दर-अध्याय जानें — कथा, श्लोक, साधना और प्रश्नोत्तरी।", te: "ఏడు వందల శ్లోకాలు. పదమూడు అధ్యాయాలు. ఒకే దేవి. దేవీ మాహాత్మ్యాన్ని అధ్యాయం వారీగా నేర్చుకోండి — కథ, శ్లోకం, సాధన మరియు క్విజ్." },
  begin: { en: "Begin Chapter 1", hi: "अध्याय 1 आरंभ करें", te: "అధ్యాయం 1 ప్రారంభించండి" },
  completed: { en: "of 13 chapters completed", hi: "/ 13 अध्याय पूर्ण", te: "/ 13 అధ్యాయాలు పూర్తయ్యాయి" },
  chapter: { en: "Chapter", hi: "अध्याय", te: "అధ్యాయం" },
  of13: { en: "of 13", hi: "/ 13", te: "/ 13" },
  read: { en: "read", hi: "पढ़ा", te: "చదివారు" },
  keyShloka: { en: "KEY SHLOKA", hi: "मुख्य श्लोक", te: "ముఖ్య శ్లోకం" },
  watch: { en: "WATCH & LISTEN", hi: "देखें और सुनें", te: "చూడండి & వినండి" },
  hear: { en: "Hear the story", hi: "कथा सुनें", te: "కథ వినండి" },
  hearDesc: { en: "A gentle narration of this chapter and the meaning of its key verse (in English).", hi: "इस अध्याय और इसके मुख्य श्लोक के अर्थ का सरल वर्णन (अंग्रेज़ी में)।", te: "ఈ అధ్యాయం మరియు దాని ముఖ్య శ్లోక అర్థం యొక్క సున్నితమైన కథనం (ఆంగ్లంలో)." },
  story: { en: "The Story", hi: "कथा", te: "కథ" },
  teachings: { en: "Teachings", hi: "शिक्षाएँ", te: "బోధనలు" },
  sadhana: { en: "TODAY'S SADHANA", hi: "आज की साधना", te: "నేటి సాధన" },
  reflect: { en: "Reflect & Remember", hi: "मनन और स्मरण", te: "మననం & స్మరణ" },
  check: { en: "Check answers", hi: "उत्तर जाँचें", te: "సమాధానాలు చూడండి" },
  scored: { en: "You scored", hi: "आपके अंक", te: "మీ స్కోరు" },
  retry: { en: "Try again", hi: "फिर से प्रयास करें", te: "మళ్ళీ ప్రయత్నించండి" },
  markRead: { en: "Mark as read", hi: "पढ़ा हुआ चिह्नित करें", te: "చదివినట్లు గుర్తించు" },
  askChapter: { en: "Ask the Guide about this chapter", hi: "इस अध्याय के बारे में पूछें", te: "ఈ అధ్యాయం గురించి అడగండి" },
  guideSub: { en: "Questions on story, verse, symbolism and practice", hi: "कथा, श्लोक, प्रतीक और साधना पर प्रश्न", te: "కథ, శ్లోకం, ప్రతీకలు మరియు సాధనపై ప్రశ్నలు" },
  studying: { en: "Studying", hi: "अध्ययन", te: "అధ్యయనం" },
  placeholder: { en: "Ask about any chapter or verse…", hi: "किसी भी अध्याय या श्लोक के बारे में पूछें…", te: "ఏ అధ్యాయం లేదా శ్లోకం గురించైనా అడగండి…" },
  ask: { en: "Ask", hi: "पूछें", te: "అడుగు" },
  thinking: { en: "The guide is contemplating…", hi: "मार्गदर्शक मनन कर रहे हैं…", te: "మార్గదర్శి ఆలోచిస్తున్నారు…" },
  appName: { en: "Devi Mahatmya", hi: "देवी माहात्म्य", te: "దేవీ మాహాత్మ్యం" },
  hearChant: { en: "Hear the chant", hi: "पाठ सुनें", te: "పారాయణం వినండి" },
  chantDesc: { en: "The full chapter chanted in Sanskrit.", hi: "संपूर्ण अध्याय का संस्कृत पाठ।", te: "సంపూర్ణ అధ్యాయం సంస్కృతంలో పారాయణం." },
  chantLabel: { en: "Sanskrit recitation", hi: "संस्कृत पाठ", te: "సంస్కృత పారాయణం" },
  translating: { en: "", hi: "अनुवाद हो रहा है…", te: "అనువాదం జరుగుతోంది…" },
} satisfies Record<string, Record<Lang, string>>;

export type UIKey = keyof typeof UI;
export function useT() {
  const lang = useLang();
  return { lang, t: (k: UIKey) => UI[k][lang] };
}

/** Translates content strings via AI; returns English until ready. Cached in the browser. */
export function useTranslated(texts: string[]) {
  const lang = useLang();
  const fn = useServerFn(translateTexts);
  const key = JSON.stringify(texts);
  const q = useQuery({
    queryKey: ["tr", lang, key],
    enabled: lang !== "en" && texts.length > 0,
    staleTime: Infinity,
    retry: 1,
    queryFn: async () => {
      const ck = `devi-tr:${lang}:${hash(key)}`;
      const hit = localStorage.getItem(ck);
      if (hit) return JSON.parse(hit) as string[];
      const r = await fn({ data: { texts, lang: lang as "hi" | "te" } });
      if (r.length !== texts.length) throw new Error("bad translation");
      localStorage.setItem(ck, JSON.stringify(r));
      return r;
    },
  });
  const out: string[] = lang !== "en" && q.data ? q.data : texts;
  return { texts: texts.map((s, i) => out[i] ?? s), loading: q.isFetching, lang };
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + s.length;
}
