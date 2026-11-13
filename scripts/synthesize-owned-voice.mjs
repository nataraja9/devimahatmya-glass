// SOMNATH-AI: Owned voice render | ZONE: 0 | PURPOSE: Render the Saptashati in a neural voice this seat owns | CONTRACT: A stock neural voice, never a copy of a person's voice. Runs only when AZURE_SPEECH_KEY is set.
// Usage, from devimahatmya-glass:
//   $env:AZURE_SPEECH_KEY="..."; $env:AZURE_SPEECH_REGION="eastus"; node scripts/synthesize-owned-voice.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const key = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION || "eastus";
const voice = process.env.OWNED_VOICE || "hi-IN-SwaraNeural";
if (!key) {
  console.error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION. No audio was rendered.");
  process.exit(1);
}

const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
async function render(text) {
  const ssml = `<speak version="1.0" xml:lang="hi-IN"><voice name="${voice}">${escapeXml(text)}</voice></speak>`;
  const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`Speech ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function versesIn(dir) {
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort().flatMap((f) => {
    const id = f.replace(/\.json$/, "").replace("chapter_", "");
    const rows = JSON.parse(readFileSync(join(dir, f), "utf8"));
    return rows.map((row) => ({ id, text: String(row.sa || "").replace(/\s+/g, " ").trim() })).filter((row) => row.text);
  });
}

const jobs = [
  ...versesIn(join(root, "src/data/stotras")).map((row) => ({ file: `stotra-${row.id}.mp3`, text: row.text, group: row.id })),
  ...versesIn(join(root, "src/data/verses")).map((row) => ({ file: `chapter-${String(row.id).padStart(2, "0")}.mp3`, text: row.text, group: `chapter-${row.id}` })),
];
const out = join(root, "public/voice");
mkdirSync(out, { recursive: true });
const grouped = new Map();
for (const job of jobs) {
  const buf = await render(job.text);
  const list = grouped.get(job.file) ?? [];
  list.push(buf);
  grouped.set(job.file, list);
  process.stdout.write(".");
}
for (const [file, parts] of grouped) writeFileSync(join(out, file), Buffer.concat(parts));
console.log(`\nWrote ${grouped.size} owned chants to public/voice with voice ${voice}.`);
