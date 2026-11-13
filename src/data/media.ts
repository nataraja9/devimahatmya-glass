// Per-chapter narration audio and devotional video clips (CDN asset pointers).
const audio = import.meta.glob<{ url: string }>("../assets/media/chapter_*_narration.mp3.asset.json", { eager: true, import: "default" });
const video = import.meta.glob<{ url: string }>("../assets/media/chapter_*_video.mp4.asset.json", { eager: true, import: "default" });
// Sanskrit recitations: "Durga Saptashati Chants" series on archive.org, released under CC0 (public domain).
const CHANT_ITEMS = ["elpd_06.-chandi-1","hyaw_07.-chandi-2","megp_08.-chandi-3","hcww_09.-chandi-4","yqza_10.-chandi-5","nvaz_11.-chandi-6","brub_12.-chandi-7","akjv_13.-chandi-8","ibct_14.-chandi-9","omcc_15.-chandi-10","xvly_16.-chandi-11","gocc_17.-chandi-12","unao_18.-chandi-13"];
const chant = (n: number) => `https://archive.org/download/${CHANT_ITEMS[n - 1]}/${encodeURIComponent(`${String(n + 5).padStart(2, "0")}. Chandi ${n === 8 ? " " : ""}${n}.mp3`)}`;
export function mediaFor(n: number) {
  return {
    chant: n >= 1 && n <= 13 ? chant(n) : undefined,
    audio: audio[`../assets/media/chapter_${n}_narration.mp3.asset.json`]?.url,
    video: video[`../assets/media/chapter_${n}_video.mp4.asset.json`]?.url,
  };
}
