import { z } from "zod";

export const childSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").optional().nullable(),
  target_behavior: z.string().max(300).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const abcLogSchema = z.object({
  child_id: z.string().uuid().optional().nullable(),
  timestamp: z.string().datetime(),
  phase: z.enum(["Linha de base", "Intervenção", "Não classificado"]),
  antecedent: z.string().min(1).max(500),
  antecedentTags: z.array(z.string()).default([]),
  behaviorCategory: z.enum(["Agressão", "Autolesão", "Choro/grito", "Fuga/esquiva", "Estereotipia", "Recusa", "Outro"]),
  behaviorDetail: z.string().max(500).optional().nullable(),
  severity: z.enum(["Leve", "Média", "Alta"]),
  consequence: z.string().max(500),
  consequenceTags: z.array(z.string()).default([]),
  environmentTags: z.array(z.string()).default([]),
  environmentNotes: z.string().max(2000).optional().nullable(),
});

export const abcLogUpdateSchema = abcLogSchema.extend({
  id: z.string().uuid(),
});

export const faSessionSchema = z.object({
  child_id: z.string().uuid().optional().nullable(),
  condition: z.enum(["Attention", "Demand", "Tangible", "Play"]),
  durationMin: z.number().int().min(1).max(180),
  frequency: z.number().int().min(0).max(10000),
});

export const idSchema = z.object({
  id: z.string().uuid(),
});

export const optionalChildIdSchema = z.object({
  childId: z.string().uuid().optional().nullable(),
});

export const fastAssessmentSchema = z.object({
  child_id: z.string().uuid({ message: "Selecione o paciente" }),
  child_name: z.string().max(120).default(""),
  applied_by: z.string().max(120).default(""),
  responded_by: z.string().max(120).default(""),
  answers: z.record(z.string(), z.enum(["sim", "nao", "na"])).default({}),
  note_14: z.string().max(1000).default(""),
  scores: z.array(z.number().int().min(0).max(4)).length(4),
  primary_hypothesis: z.string().max(300).default(""),
});
