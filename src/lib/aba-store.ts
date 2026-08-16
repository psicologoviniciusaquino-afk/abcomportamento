import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listChildrenFn,
  createChildFn,
  deleteChildFn,
  listLogsFn,
  createLogFn,
  deleteLogFn,
  listSessionsFn,
  createSessionFn,
  clearSessionsFn,
} from "./aba.functions";

export type FunctionType = "Atenção" | "Fuga" | "Tangível" | "Sensorial";
export type Phase = "baseline" | "intervention";
export type FACondition = "Attention" | "Demand" | "Tangible" | "Play";

export interface Child {
  id: string;
  owner_id: string;
  name: string;
  birth_date?: string | null;
  target_behavior?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ABCLog {
  id: string;
  owner_id: string;
  child_id?: string | null;
  timestamp: string;
  phase?: Phase | null;
  antecedent: string;
  antecedentTags: string[];
  behavior: string;
  severity: number;
  consequence: string;
  consequenceTags: string[];
  environmentTags?: string[];
  environmentNotes?: string | null;
  hypothesizedFunction?: FunctionType | "Pendente";
  // convenience fields for UI
  childName?: string;
  targetBehavior?: string;
  created_at?: string;
}

export interface FASession {
  id: string;
  owner_id: string;
  child_id?: string | null;
  condition: FACondition;
  durationMin: number;
  frequency: number;
  createdAt: string;
}

export function useChildren() {
  const list = useServerFn(listChildrenFn);
  const { data = [], isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: () => list({ data: undefined }),
    staleTime: 30_000,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createChildFn);
  const remove = useServerFn(deleteChildFn);

  const addMutation = useMutation({
    mutationFn: async (input: { name: string; birth_date?: string | null; target_behavior?: string | null; notes?: string | null }) => {
      return create({ data: input });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
  });

  return {
    children: data as Child[],
    isLoading,
    add: (name: string) => addMutation.mutate({ name }),
    addFull: (input: Parameters<typeof addMutation.mutate>[0]) => addMutation.mutate(input),
    remove: (id: string) => removeMutation.mutate(id),
  };
}

export function useLogs(childId?: string | null) {
  const list = useServerFn(listLogsFn);
  const { data = [], isLoading } = useQuery({
    queryKey: ["abc_logs", childId ?? "all"],
    queryFn: () => list({ data: { childId: childId ?? null } }),
    staleTime: 10_000,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createLogFn);
  const remove = useServerFn(deleteLogFn);

  const addMutation = useMutation({
    mutationFn: (log: Omit<ABCLog, "id" | "owner_id" | "hypothesizedFunction" | "created_at">) =>
      create({ data: log }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abc_logs"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abc_logs"] }),
  });

  return {
    logs: data as ABCLog[],
    isLoading,
    add: (log: Omit<ABCLog, "id" | "owner_id" | "hypothesizedFunction" | "created_at">) => addMutation.mutate(log),
    remove: (id: string) => removeMutation.mutate(id),
  };
}

export function useFASessions(childId?: string | null) {
  const list = useServerFn(listSessionsFn);
  const { data = [], isLoading } = useQuery({
    queryKey: ["fa_sessions", childId ?? "all"],
    queryFn: () => list({ data: { childId: childId ?? null } }),
    staleTime: 10_000,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createSessionFn);
  const clear = useServerFn(clearSessionsFn);

  const addMutation = useMutation({
    mutationFn: (session: Omit<FASession, "id" | "owner_id" | "createdAt">) =>
      create({ data: session }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fa_sessions"] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => clear({ data: { childId: childId ?? null } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fa_sessions"] }),
  });

  return {
    sessions: data as FASession[],
    isLoading,
    add: (session: Omit<FASession, "id" | "owner_id" | "createdAt">) => addMutation.mutate(session),
    clear: () => clearMutation.mutate(),
  };
}

// --- Analytics ---

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
  if (/(retirada da tarefa|pausa|redução da exigência|retirada do ambiente|demanda removida)/.test(t)) return "Fuga";
  if (/(atenção social|atenção verbal|contato físico|proximidade|atenção dada|retirada da atenção)/.test(t)) return "Atenção";
  if (/(acesso ao objeto|entrega do objeto|alimento|item fornecido|tangível|retirada do objeto)/.test(t)) return "Tangível";
  if (/(nenhuma consequência|ignorado|sozinho|sem estímulos|excesso de estímulos|desconforto)/.test(t)) return "Sensorial";
  if (/(demanda|transição|rotina)/.test(t)) return "Fuga";
  if (/(retirada de atenção)/.test(t)) return "Atenção";
  if (/(restrição de acesso|atraso|espera|item negado)/.test(t)) return "Tangível";
  return "Pendente";
}
