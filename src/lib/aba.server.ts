import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ABCLog, Child, FASession } from "./aba-store";
import { inferFunctionFromTags } from "./aba-store";

type Client = SupabaseClient<Database>;

function toCamelChild(row: Record<string, unknown>): Child {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    name: String(row.name),
    birth_date: row.birth_date ? String(row.birth_date) : null,
    target_behavior: row.target_behavior ? String(row.target_behavior) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
  };
}

function toCamelLog(row: Record<string, unknown>): ABCLog {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    child_id: row.child_id ? String(row.child_id) : null,
    timestamp: String(row.timestamp),
    phase: (row.phase as "baseline" | "intervention" | null) ?? null,
    antecedent: String(row.antecedent),
    antecedentTags: (row.antecedent_tags as string[]) ?? [],
    behavior: String(row.behavior),
    severity: Number(row.severity),
    consequence: String(row.consequence),
    consequenceTags: (row.consequence_tags as string[]) ?? [],
    environmentTags: (row.environment_tags as string[]) ?? [],
    environmentNotes: row.environment_notes ? String(row.environment_notes) : null,
    hypothesizedFunction: (row.hypothesized_function as ABCLog["hypothesizedFunction"]) ?? "Pendente",
    created_at: String(row.created_at),
  };
}

function toCamelSession(row: Record<string, unknown>): FASession {
  return {
    id: String(row.id),
    owner_id: String(row.owner_id),
    child_id: row.child_id ? String(row.child_id) : null,
    condition: row.condition as FASession["condition"],
    durationMin: Number(row.duration_min),
    frequency: Number(row.frequency),
    createdAt: String(row.created_at),
  };
}

// Children

export async function listChildren(supabase: Client, userId: string): Promise<Child[]> {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((r) => toCamelChild(r as Record<string, unknown>));
}

export async function createChild(
  supabase: Client,
  userId: string,
  input: { name: string; birth_date?: string | null; target_behavior?: string | null; notes?: string | null }
): Promise<Child> {
  const { data, error } = await supabase
    .from("children")
    .insert({ owner_id: userId, ...input })
    .select()
    .single();
  if (error) throw error;
  return toCamelChild(data as Record<string, unknown>);
}

export async function deleteChild(supabase: Client, _userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("children").delete().eq("id", id);
  if (error) throw error;
}

// ABC Logs

export async function listLogs(supabase: Client, userId: string, childId?: string | null): Promise<ABCLog[]> {
  let q = supabase.from("abc_logs").select("*").eq("owner_id", userId).order("timestamp", { ascending: false });
  if (childId) q = q.eq("child_id", childId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((r) => toCamelLog(r as Record<string, unknown>));
}

export async function createLog(
  supabase: Client,
  userId: string,
  input: Omit<ABCLog, "id" | "owner_id" | "hypothesizedFunction" | "created_at">
): Promise<ABCLog> {
  const allTags = [...input.antecedentTags, ...input.consequenceTags];
  const hypothesizedFunction = inferFunctionFromTags(allTags);
  const row = {
    owner_id: userId,
    child_id: input.child_id,
    timestamp: input.timestamp,
    phase: input.phase,
    antecedent: input.antecedent,
    antecedent_tags: input.antecedentTags,
    behavior: input.behavior,
    severity: input.severity,
    consequence: input.consequence,
    consequence_tags: input.consequenceTags,
    environment_tags: input.environmentTags ?? [],
    environment_notes: input.environmentNotes,
    hypothesized_function: hypothesizedFunction,
  };
  const { data, error } = await supabase.from("abc_logs").insert(row).select().single();
  if (error) throw error;
  return toCamelLog(data as Record<string, unknown>);
}

export async function updateLog(
  supabase: Client,
  _userId: string,
  input: Omit<ABCLog, "owner_id" | "hypothesizedFunction" | "created_at">
): Promise<ABCLog> {
  const allTags = [...input.antecedentTags, ...input.consequenceTags];
  const row = {
    child_id: input.child_id,
    timestamp: input.timestamp,
    phase: input.phase,
    antecedent: input.antecedent,
    antecedent_tags: input.antecedentTags,
    behavior: input.behavior,
    severity: input.severity,
    consequence: input.consequence,
    consequence_tags: input.consequenceTags,
    environment_tags: input.environmentTags ?? [],
    environment_notes: input.environmentNotes,
    hypothesized_function: inferFunctionFromTags(allTags),
  };
  const { data, error } = await supabase.from("abc_logs").update(row).eq("id", input.id).select().single();
  if (error) throw error;
  return toCamelLog(data as Record<string, unknown>);
}

export async function deleteLog(supabase: Client, _userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("abc_logs").delete().eq("id", id);
  if (error) throw error;
}

// FA Sessions

export async function listSessions(supabase: Client, userId: string, childId?: string | null): Promise<FASession[]> {
  let q = supabase.from("fa_sessions").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
  if (childId) q = q.eq("child_id", childId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((r) => toCamelSession(r as Record<string, unknown>));
}

export async function createSession(
  supabase: Client,
  userId: string,
  input: Omit<FASession, "id" | "owner_id" | "createdAt">
): Promise<FASession> {
  const row = {
    owner_id: userId,
    child_id: input.child_id,
    condition: input.condition,
    duration_min: input.durationMin,
    frequency: input.frequency,
  };
  const { data, error } = await supabase.from("fa_sessions").insert(row).select().single();
  if (error) throw error;
  return toCamelSession(data as Record<string, unknown>);
}

export async function clearSessions(supabase: Client, userId: string, childId?: string | null): Promise<void> {
  let q = supabase.from("fa_sessions").delete().eq("owner_id", userId);
  if (childId) q = q.eq("child_id", childId);
  const { error } = await q;
  if (error) throw error;
}
