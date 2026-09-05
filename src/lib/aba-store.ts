import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { describeDbError } from "./aba-errors";

import {
  listChildrenFn,
  createChildFn,
  deleteChildFn,
  listLogsFn,
  createLogFn,
  updateLogFn,
  deleteLogFn,
  listSessionsFn,
  createSessionFn,
  clearSessionsFn,
} from "./aba.functions";

export type FunctionType = "Atenção" | "Esquiva/fuga" | "Tangível" | "Sensorial";

/** Normaliza rótulos legados (ex.: "Fuga") para os 4 nomes canônicos. */
export function normalizeFunction(value?: string | null): FunctionType | "Pendente" {
  if (!value) return "Pendente";
  const v = value.trim().toLowerCase();
  if (v === "fuga" || v === "esquiva" || v === "esquiva/fuga" || v === "esquiva / fuga") return "Esquiva/fuga";
  if (v === "atenção" || v === "atencao") return "Atenção";
  if (v === "tangível" || v === "tangivel") return "Tangível";
  if (v === "sensorial") return "Sensorial";
  return "Pendente";
}
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

function useErrorToast(action: string) {
  return useCallback(
    (error: unknown) => {
      console.error(`[aba] falha ao ${action}:`, error);
      toast.error(describeDbError(error, action));
    },
    [action]
  );
}

export function useChildren() {
  const list = useServerFn(listChildrenFn);
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["children"],
    queryFn: () => list({ data: undefined }),
    staleTime: 30_000,
    retry: 1,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createChildFn);
  const remove = useServerFn(deleteChildFn);
  const onCreateError = useErrorToast("cadastrar paciente");
  const onDeleteError = useErrorToast("excluir paciente");

  const addMutation = useMutation({
    mutationFn: async (input: { name: string; birth_date?: string | null; target_behavior?: string | null; notes?: string | null }) => {
      return create({ data: input });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
    onError: onCreateError,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["children"] }),
    onError: onDeleteError,
  });

  return {
    children: data as Child[],
    isLoading,
    error: error as Error | null,
    refetch,
    isSaving: addMutation.isPending,
    add: (name: string) => addMutation.mutateAsync({ name }),
    addFull: (input: Parameters<typeof addMutation.mutateAsync>[0]) => addMutation.mutateAsync(input),
    remove: (id: string) => removeMutation.mutateAsync(id),
  };
}

export function useLogs(childId?: string | null) {
  const list = useServerFn(listLogsFn);
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["abc_logs", childId ?? "all"],
    queryFn: () => list({ data: { childId: childId ?? null } }),
    staleTime: 10_000,
    retry: 1,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createLogFn);
  const remove = useServerFn(deleteLogFn);
  const update = useServerFn(updateLogFn);
  const onSaveError = useErrorToast("salvar registro");
  const onUpdateError = useErrorToast("atualizar registro");
  const onDeleteError = useErrorToast("excluir registro");

  const updateMutation = useMutation({
    mutationFn: (log: Omit<ABCLog, "owner_id" | "hypothesizedFunction" | "created_at">) => update({ data: log }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abc_logs"] }),
    onError: onUpdateError,
  });

  const addMutation = useMutation({
    mutationFn: (log: Omit<ABCLog, "id" | "owner_id" | "hypothesizedFunction" | "created_at">) =>
      create({ data: log }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abc_logs"] }),
    onError: onSaveError,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abc_logs"] }),
    onError: onDeleteError,
  });

  return {
    logs: data as ABCLog[],
    isLoading,
    error: error as Error | null,
    refetch,
    add: (log: Omit<ABCLog, "id" | "owner_id" | "hypothesizedFunction" | "created_at">) => addMutation.mutateAsync(log),
    update: (log: Omit<ABCLog, "owner_id" | "hypothesizedFunction" | "created_at">) => updateMutation.mutateAsync(log),
    remove: (id: string) => removeMutation.mutateAsync(id),
  };
}

export function useFASessions(childId?: string | null) {
  const list = useServerFn(listSessionsFn);
  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ["fa_sessions", childId ?? "all"],
    queryFn: () => list({ data: { childId: childId ?? null } }),
    staleTime: 10_000,
    retry: 1,
  });
  const queryClient = useQueryClient();
  const create = useServerFn(createSessionFn);
  const clear = useServerFn(clearSessionsFn);
  const onSaveError = useErrorToast("salvar sessão");
  const onClearError = useErrorToast("limpar sessões");

  const addMutation = useMutation({
    mutationFn: (session: Omit<FASession, "id" | "owner_id" | "createdAt">) =>
      create({ data: session }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fa_sessions"] }),
    onError: onSaveError,
  });

  const clearMutation = useMutation({
    mutationFn: () => clear({ data: { childId: childId ?? null } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fa_sessions"] }),
    onError: onClearError,
  });

  return {
    sessions: data as FASession[],
    isLoading,
    error: error as Error | null,
    refetch,
    add: (session: Omit<FASession, "id" | "owner_id" | "createdAt">) => addMutation.mutateAsync(session),
    clear: () => clearMutation.mutateAsync(),
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
  if (/(retirada da tarefa|pausa|redução da exigência|retirada do ambiente|demanda removida|evasão|fuga)/.test(t)) return "Fuga";
  if (/(atenção social|atenção verbal|contato físico|proximidade|atenção dada|retirada da atenção)/.test(t)) return "Atenção";
  if (/(acesso ao objeto|entrega do objeto|alimento|item fornecido|tangível|retirada do objeto)/.test(t)) return "Tangível";
  if (/(nenhuma consequência|ignorado|sozinho|sem estímulos|excesso de estímulos|desconforto)/.test(t)) return "Sensorial";
  if (/(demanda|transição|rotina|instrução|atividade aversiva)/.test(t)) return "Fuga";
  if (/(retirada de atenção|desvio de atenção|interação social)/.test(t)) return "Atenção";
  if (/(restrição de acesso|atraso|espera|item negado|objeto preferido)/.test(t)) return "Tangível";
  if (/(sozinho)/.test(t)) return "Sensorial";
  return "Pendente";
}

const CUSTOM_ACTIVITIES_KEY = "aba:customActivities";

export function useCustomActivities() {
  const [activities, setActivities] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);
      if (raw) setActivities(JSON.parse(raw));
    } catch {}
  }, []);
  const add = useCallback((label: string) => {
    const v = label.trim();
    if (!v) return;
    setActivities((prev) => {
      if (prev.some((a) => a.toLowerCase() === v.toLowerCase())) return prev;
      const next = [...prev, v];
      try { localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  const remove = useCallback((label: string) => {
    setActivities((prev) => {
      const next = prev.filter((a) => a !== label);
      try { localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { activities, add, remove };
}
