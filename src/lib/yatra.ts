// SOMNATH-AI: Sacred Yatra state | ZONE: 0 | PURPOSE: Remember which trail steps this browser has confirmed. | CONTRACT: Completion is self-confirmed. It is not GPS, shrine admission, or proof of recitation.
import { useEffect, useState } from "react";
import { yatraSteps } from "@/data/yatra";

export const YATRA_KEY = "devi-sacred-yatra-v1";
export type YatraState = { completed: number };
export const initialYatra = (): YatraState => ({ completed: 0 });

export function restoreYatra(raw: string | null): YatraState {
  try {
    const parsed: unknown = JSON.parse(raw ?? "null");
    if (parsed && typeof parsed === "object" && "completed" in parsed && typeof parsed.completed === "number" && Number.isInteger(parsed.completed) && parsed.completed >= 0 && parsed.completed <= yatraSteps.length) {
      return { completed: parsed.completed };
    }
  } catch { /* Keep invalid browser data from blocking the trail. */ }
  return initialYatra();
}

export function isYatraUnlocked(state: YatraState, chapter: number): boolean {
  return Number.isInteger(chapter) && chapter >= 1 && chapter <= yatraSteps.length && chapter <= state.completed + 1;
}

export function completeYatraStep(state: YatraState, chapter: number): YatraState {
  if (!isYatraUnlocked(state, chapter) || chapter !== state.completed + 1) return state;
  return { completed: chapter };
}

export function useYatra() {
  const [state, setState] = useState<YatraState>(initialYatra);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { setState(restoreYatra(localStorage.getItem(YATRA_KEY))); }
    catch { setStorageError(true); }
    setReady(true);
  }, []);
  const complete = (chapter: number) => {
    const next = completeYatraStep(state, chapter);
    if (next === state || !ready) return false;
    try {
      localStorage.setItem(YATRA_KEY, JSON.stringify(next));
      setState(next);
      setStorageError(false);
      return true;
    } catch { setStorageError(true); return false; }
  };
  const reset = () => {
    try { localStorage.setItem(YATRA_KEY, JSON.stringify(initialYatra())); setState(initialYatra()); setStorageError(false); return true; }
    catch { setStorageError(true); return false; }
  };
  return { state, ready, complete, reset, storageError };
}
