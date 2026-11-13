// SOMNATH-AI: Climb service worker | ZONE: 0 | PURPOSE: Play saved chants and the yatra page when the mountain has no reception. | CONTRACT: Saves only what the devotee asked to store. No location. No account.
const CHANTS = "devi-climb-chants-v1";
const SHELL = "devi-climb-shell-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function sliceChant(buffer, range, type) {
  const match = /bytes=(\d+)-(\d*)/.exec(range || "");
  if (!match) return null;
  const start = Number(match[1]);
  const end = match[2] ? Number(match[2]) : buffer.byteLength - 1;
  if (start > end || start >= buffer.byteLength) return null;
  const slice = buffer.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": type || "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${buffer.byteLength}`,
      "Content-Length": String(slice.byteLength),
      "Accept-Ranges": "bytes",
    },
  });
}

async function chantResponse(request) {
  const cache = await caches.open(CHANTS);
  const hit = await cache.match(request.url);
  if (hit) {
    const range = request.headers.get("range");
    if (!range) return hit;
    const ranged = sliceChant(await hit.clone().arrayBuffer(), range, hit.headers.get("content-type"));
    if (ranged) return ranged;
    return hit;
  }
  return fetch(request);
}

async function shellResponse(request) {
  try {
    const fresh = await fetch(request);
    const copy = fresh.clone();
    const shell = await caches.open(SHELL);
    await shell.put(request, copy);
    return fresh;
  } catch {
    const shell = await caches.open(SHELL);
    const hit = await shell.match(request);
    if (hit) return hit;
    return new Response("This page was not saved on this phone.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.hostname === "archive.org") {
    event.respondWith(chantResponse(event.request));
    return;
  }
  if (url.origin === self.location.origin) event.respondWith(shellResponse(event.request));
});
