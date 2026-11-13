// 90-day sadhana journey: pure planning logic + browser-stored state.
import { useEffect, useState } from "react";
import { chapters } from "@/data/chapters";

export const JOURNEY_DAYS = 90;
export type Task = "story" | "chant" | "practice" | "reflect" | "quiz";
const TASKS: Task[] = ["story", "chant", "practice", "reflect", "quiz"];

/** Chapter (1–13) studied on a given day (1–90), spread evenly. */
export function chapterForDay(day: number, len = JOURNEY_DAYS): number {
  return chaptersForDay(day, len)[0]!;
}
/** Sankalpa periods a learner can choose. */
export const PERIODS = [1, 8, 13, 90, 108] as const;
/** Chapters read on a day: short periods (≤13 days) split all 13 chapters across the days; longer ones spread one chapter over several days. */
export function chaptersForDay(day: number, len = JOURNEY_DAYS): number[] {
  const d = Math.min(Math.max(day, 1), len);
  if (len <= 13) {
    const from = Math.floor(((d - 1) * 13) / len) + 1, to = Math.floor((d * 13) / len);
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
  }
  return [Math.min(13, Math.ceil((d * 13) / len))];
}

/** Which practice the day asks for, cycling within each chapter's days. */
export function taskForDay(day: number, len = JOURNEY_DAYS): Task {
  if (len <= 13) return "story";
  const ch = chapterForDay(day, len);
  let first = day;
  while (first > 1 && chapterForDay(first - 1, len) === ch) first--;
  return TASKS[(day - first) % TASKS.length]!;
}

export type Status = "active" | "paused" | "stopped";
export type JourneyState = { len?: number | undefined; day: number; status: Status; done: number[]; log: { day: number; reply: Reply; at: string }[] };
export type Reply = "DONE" | "PAUSE" | "STOP" | "RESUME";
export const fresh = (): JourneyState => ({ day: 1, status: "active", done: [], log: [] });

/** Apply a check-in reply. DONE completes today and moves on; PAUSE holds the day; STOP ends the journey. */
export function reply(s: JourneyState, r: Reply, at = new Date().toISOString()): JourneyState {
  const log = [...s.log, { day: s.day, reply: r, at }];
  if (s.status === "stopped") return r === "RESUME" ? { ...fresh(), len: s.len, log } : s;
  if (r === "PAUSE") return { ...s, status: "paused", log };
  if (r === "RESUME") return { ...s, status: "active", log };
  if (r === "STOP") return { ...s, status: "stopped", log };
  if (s.status === "paused") return s;
  const done = s.done.includes(s.day) ? s.done : [...s.done, s.day];
  return { ...s, done, day: Math.min(s.day + 1, (s.len ?? JOURNEY_DAYS) + 1), log };
}

export function messageFor(day: number): string {
  const c = chapters[chapterForDay(day) - 1]!;
  const t = taskForDay(day);
  const ask = {
    story: `Read the story of Chapter ${c.n}, ${c.title}.`,
    chant: `Chant today's verse slowly three times: ${(c.verse.tr.split("|")[0] ?? "").trim()}`,
    practice: `Today's practice: ${c.practice}`,
    reflect: `Reflect: ${c.lessons[0]}`,
    quiz: `Take the Chapter ${c.n} quiz to review what you learned.`,
  }[t];
  return `🙏 Day ${day} of ${JOURNEY_DAYS} · ${c.theme}\n${ask}\nReply DONE, PAUSE or STOP.`;
}

const KEY = "devi-journey-v1";
export function useJourney() {
  const [s, setS] = useState<JourneyState>(fresh);
  useEffect(() => { try { const v = localStorage.getItem(KEY); if (v) setS(JSON.parse(v)); } catch { /* ignore */ } }, []);
  const put = (n: JourneyState) => { localStorage.setItem(KEY, JSON.stringify(n)); return n; };
  const send = (r: Reply) => setS((p) => put(reply(p, r)));
  const start = (len: number) => setS(put({ ...fresh(), len }));
  return { s, send, start };
}

// --- AI personalization (sankalpa, remembered pauses, adaptive pace) ---
export type ReminderChannel = "sms" | "email" | "whatsapp";
export type Sankalpa = { intent: string; focus: number[]; why: string; name: string; gotra: string; nakshatra: string; days?: number | undefined; blessing?: string | undefined; token?: string | undefined; subscribe?: boolean | undefined; channels?: ReminderChannel[] | undefined; reminderTime?: string | undefined; timezone?: string | undefined; startDate?: string | undefined };

const TOKEN_SEEN_KEY = "devi-sankalpa-tokens";
/** Header "Sankalpa Journey" asks the open card to return to the form. */
export const JOURNEY_RESET = "devi-journey-reset";

/** Card token. The digits always begin with 999, then a unique tail. */
export function sankalpaToken(tail: string): string {
  const digits = tail.replace(/\D/g, "").slice(0, 9).padStart(9, "0");
  return `999${digits}`;
}

function randomTail(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => String(byte % 10)).join("");
}

function readSeenTokens(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(TOKEN_SEEN_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Mint a card token this browser has not minted before. Nothing is sent. */
export function mintSankalpaToken(): string {
  const seen = new Set(readSeenTokens());
  let token = sankalpaToken(randomTail());
  for (let attempt = 0; attempt < 8 && seen.has(token); attempt += 1) token = sankalpaToken(randomTail());
  if (seen.has(token)) token = sankalpaToken(`${Date.now()}${seen.size + 1}`.slice(-9));
  seen.add(token);
  try { localStorage.setItem(TOKEN_SEEN_KEY, JSON.stringify([...seen].slice(-500))); } catch { /* the card still shows this mint */ }
  return token;
}

const CHANNEL_LABEL: Record<ReminderChannel, string> = { sms: "SMS", email: "Email", whatsapp: "WhatsApp" };

/** One reminder each day of the chosen period, at the subscriber's time. Nothing is sent. */
export function reminderPlan(days: number, time: string, timezone: string, channels: ReminderChannel[], startDate: string): string {
  const span = days === 1 ? "1 day" : `${days} days`;
  const via = channels.map((channel) => CHANNEL_LABEL[channel]).join(", ");
  return via
    ? `One reminder a day at ${time} (${timezone}), for ${span} from ${startDate}, by ${via}.`
    : "Choose at least one of SMS, email, or WhatsApp.";
}
export type Pace = "steady" | "gentle" | "catchup";
/** Whole days since the last check-in. */
export function daysSince(iso: string | undefined, now = new Date()): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000));
}
/** 0–1 missed days: steady; 2–4: a lighter day; 5+: offer a catch-up plan. */
export function paceFor(missed: number): Pace {
  return missed >= 5 ? "catchup" : missed >= 2 ? "gentle" : "steady";
}
const PKEY = "devi-journey-ai-v1";
export type Reflection = { day: number; text: string };
export type Feedback = { up: boolean; tag?: string | undefined };
export type JourneyAI = { sankalpa?: Sankalpa | undefined; pauseReason?: string | undefined; reflections?: Reflection[] | undefined; feedback?: Feedback[] | undefined };
export function useJourneyAI() {
  const [a, setA] = useState<JourneyAI>({});
  useEffect(() => { try { const v = localStorage.getItem(PKEY); if (v) setA(JSON.parse(v)); } catch { /* ignore */ } }, []);
  const save = (p: Partial<JourneyAI>) => setA((o) => { const n = { ...o, ...p }; localStorage.setItem(PKEY, JSON.stringify(n)); return n; });
  return { a, save };
}

/** Style lessons learned from thumbs-down tags (most recent 20 ratings). */
export function stylePrefs(fb: Feedback[] = []): string[] {
  return [...new Set(fb.slice(-20).filter((f) => !f.up && f.tag).map((f) => f.tag!))];
}
/** Week number (1–13) a day falls in. */
export const weekOf = (day: number) => Math.ceil(Math.max(day, 1) / 7);
export type Card = { id: "sankalpa" | "resume" | "light" | "mirror" | "chant" | "chapter"; title: string; why: string };
/** Contextual starter cards so the page never opens blank; each says why it is shown. */
export function starterCards(s: JourneyState, a: JourneyAI, missed: number): Card[] {
  const c: Card[] = [];
  const day = Math.min(s.day, JOURNEY_DAYS);
  if (!a.sankalpa) c.push({ id: "sankalpa", title: "Take your sankalpa", why: "Your 90 days aren't shaped around an intention yet." });
  if (s.status === "paused") c.push({ id: "resume", title: "Resume your journey", why: a.pauseReason ? `You paused for: ${a.pauseReason}.` : "Your journey is paused." });
  if (s.status === "active" && missed >= 2) c.push({ id: "light", title: "Take a lighter 10-minute day", why: `You've been away ${missed} days.` });
  const wk = (a.reflections ?? []).filter((r) => weekOf(r.day) === weekOf(day));
  if (wk.length >= 3) c.push({ id: "mirror", title: "See this week's mirror", why: `You wrote ${wk.length} reflections this week.` });
  if (taskForDay(day) === "chant") c.push({ id: "chant", title: "Chant today's verse", why: "Today's practice is chanting." });
  c.push({ id: "chapter", title: `Open Chapter ${chapterForDay(day)}`, why: `Day ${day} belongs to Chapter ${chapterForDay(day)}.` });
  return c.slice(0, 3);
}
