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

const CHILDREN_KEY = "aba.children.v1";

export function useChildren() {
  const [children, setChildren] = useState<string[]>([]);
  useEffect(() => setChildren(read<string[]>(CHILDREN_KEY, [])), []);
  const save = (next: string[]) => {
    setChildren(next);
    write(CHILDREN_KEY, next);
  };
  return {
    children,
    add: (name: string) => {
      const n = name.trim();
      if (!n || children.includes(n)) return;
      save([n, ...children]);
    },
    remove: (name: string) => save(children.filter((c) => c !== name)),
  };
}

export function computeTopAntecedent(logs: ABCLog[]): { tag: string; count: number; percent: number } | null {
  if (logs.length === 0) return null;
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    l.antecedentTags.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;
  const [tag, count] = sorted[0];
  return { tag, count, percent: Math.round((count / logs.length) * 100) };
}

export function computeTopConsequence(logs: ABCLog[]): { tag: string; count: number; percent: number } | null {
  if (logs.length === 0) return null;
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    l.consequenceTags.forEach((t) => {
      counts[t] = (counts[t] ?? 0) + 1;
    });
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) return null;
  const [tag, count] = sorted[0];
  return { tag, count, percent: Math.round((count / logs.length) * 100) };
}

export function computeHypothesis(logs: ABCLog[]): FunctionType | "Pendente" {
  const topCon = computeTopConsequence(logs);
  if (!topCon) return "Pendente";
  return inferFunctionFromTags([topCon.tag]);
}

export function inferFunctionFromTags(tags: string[]): FunctionType | "Pendente" {
  const t = tags.map((x) => x.toLowerCase()).join(" | ");
  // Consequências têm prioridade (definem a função reforçadora)
  if (/(retirada da tarefa|pausa|redução da exigência|retirada do ambiente|demanda removida)/.test(t)) return "Fuga";
  if (/(atenção verbal|contato físico|proximidade|atenção dada)/.test(t)) return "Atenção";
  if (/(entrega do objeto|alimento|item fornecido|tangível)/.test(t)) return "Tangível";
  if (/(nenhuma consequência|ignorado|sozinho|sem estímulos|excesso de estímulos|desconforto)/.test(t)) return "Sensorial";
  // Antecedentes como pista secundária
  if (/(demanda|transição|rotina)/.test(t)) return "Fuga";
  if (/(retirada de atenção)/.test(t)) return "Atenção";
  if (/(restrição de acesso|atraso|espera|item negado)/.test(t)) return "Tangível";
  return "Pendente";
}
