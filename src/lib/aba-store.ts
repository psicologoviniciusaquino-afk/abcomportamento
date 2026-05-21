import { useEffect, useState } from "react";

export type FunctionType = "Attention" | "Escape" | "Tangible" | "Sensory";

export interface ABCLog {
  id: string;
  timestamp: string;
  antecedent: string;
  antecedentTags: string[];
  behavior: string;
  severity: number;
  consequence: string;
  consequenceTags: string[];
  hypothesizedFunction?: FunctionType | "Pending";
}

export interface FASession {
  id: string;
  condition: "Attention" | "Demand" | "Tangible" | "Play";
  durationMin: number;
  frequency: number;
  createdAt: string;
}

const LOGS_KEY = "aba.logs.v1";
const FA_KEY = "aba.fa.v1";

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
}

export function useLogs() {
  const [logs, setLogs] = useState<ABCLog[]>([]);
  useEffect(() => setLogs(read<ABCLog[]>(LOGS_KEY, [])), []);
  const save = (next: ABCLog[]) => {
    setLogs(next);
    write(LOGS_KEY, next);
  };
  return {
    logs,
    add: (l: ABCLog) => save([l, ...logs]),
    update: (id: string, patch: Partial<ABCLog>) =>
      save(logs.map((x) => (x.id === id ? { ...x, ...patch } : x))),
    remove: (id: string) => save(logs.filter((x) => x.id !== id)),
  };
}

export function useFASessions() {
  const [sessions, setSessions] = useState<FASession[]>([]);
  useEffect(() => setSessions(read<FASession[]>(FA_KEY, [])), []);
  const save = (next: FASession[]) => {
    setSessions(next);
    write(FA_KEY, next);
  };
  return {
    sessions,
    add: (s: FASession) => save([s, ...sessions]),
    clear: () => save([]),
  };
}

export function inferFunctionFromTags(tags: string[]): FunctionType | "Pending" {
  const t = tags.map((x) => x.toLowerCase()).join(" ");
  if (t.includes("attention")) return "Attention";
  if (t.includes("demand") || t.includes("escape")) return "Escape";
  if (t.includes("item") || t.includes("tangible")) return "Tangible";
  if (t.includes("alone") || t.includes("ignored")) return "Sensory";
  return "Pending";
}
