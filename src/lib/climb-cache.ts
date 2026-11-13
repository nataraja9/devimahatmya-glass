// SOMNATH-AI: Climb chant cache | ZONE: 0 | PURPOSE: Save the thirteen chants when the devotee asks at Katra. | CONTRACT: Nothing downloads until they tap. The phone stores the files. No location is read.
import { mediaFor } from "@/data/media";

export const CLIMB_CHANTS = "devi-climb-chants-v1";
export const CLIMB_SHELL = "devi-climb-shell-v1";
export const CLIMB_SW = "/climb-sw.js";

export function chantUrls(): string[] {
  return Array.from({ length: 13 }, (_, i) => mediaFor(i + 1).chant).filter((url): url is string => Boolean(url));
}

export function shellUrls(): string[] {
  const found = [location.href];
  document.querySelectorAll("script[src], link[rel=stylesheet], link[rel=modulepreload]").forEach((el) => {
    const src = el.getAttribute("src") || el.getAttribute("href");
    if (src) found.push(new URL(src, location.href).href);
  });
  return [...new Set(found)].filter((url) => url.startsWith(location.origin));
}

export async function savedChantCount(urls = chantUrls()): Promise<number> {
  if (!("caches" in window)) return 0;
  const cache = await caches.open(CLIMB_CHANTS);
  const hits = await Promise.all(urls.map((url) => cache.match(url)));
  return hits.filter(Boolean).length;
}

async function cacheShell(): Promise<void> {
  const shell = await caches.open(CLIMB_SHELL);
  await Promise.all(shellUrls().map(async (url) => {
    try {
      const res = await fetch(url);
      if (res.ok) await shell.put(url, res);
    } catch { /* A missed script does not hide the chants that did save. */ }
  }));
}

export async function saveChants(onProgress: (done: number, total: number) => void): Promise<void> {
  if (!("serviceWorker" in navigator) || !("caches" in window)) throw new Error("unsupported");
  await navigator.serviceWorker.register(CLIMB_SW, { scope: "/" });
  await navigator.serviceWorker.ready;
  await cacheShell();
  const cache = await caches.open(CLIMB_CHANTS);
  const urls = chantUrls();
  let done = 0;
  for (const url of urls) {
    if (!(await cache.match(url))) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      await cache.put(url, res);
    }
    done += 1;
    onProgress(done, urls.length);
  }
}
