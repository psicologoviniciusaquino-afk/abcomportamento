import { useEffect, useState } from "react";

export type FunctionType = "Atenção" | "Fuga" | "Tangível" | "Sensorial";

export interface ABCLog {
  id: string;
  timestamp: string;
  childName?: string;
  targetBehavior?: string;
  environmentTags?: string[];
  environmentNotes?: string;
  antecedent: string;
  antecedentTags: string[];
  behavior: string;
  severity: number;
  consequence: string;
  consequenceTags: string[];
  hypothesizedFunction?: FunctionType | "Pendente";
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

export function inferFunctionFromTags(tags: string[]): FunctionType | "Pendente" {
  const t = tags.map((x) => x.toLowerCase()).join(" ");
  if (t.includes("atenção")) return "Atenção";
  if (t.includes("demanda") || t.includes("fuga")) return "Fuga";
  if (t.includes("item") || t.includes("tangível")) return "Tangível";
  if (t.includes("sozinho") || t.includes("ignorado")) return "Sensorial";
  return "Pendente";
}
