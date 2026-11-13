import { useEffect, useState } from "react";

const KEY = "saptashati-progress-v1";
type Progress = Record<number, { read?: boolean; score?: number }>;

export function useProgress() {
  const [p, setP] = useState<Progress>({});
  useEffect(() => {
    try { setP(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { /* ignore */ }
  }, []);
  const update = (n: number, patch: { read?: boolean; score?: number }) =>
    setP((prev) => {
      const next = { ...prev, [n]: { ...prev[n], ...patch } };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  const done = Object.values(p).filter((x) => x.read).length;
  return { progress: p, update, done };
}
