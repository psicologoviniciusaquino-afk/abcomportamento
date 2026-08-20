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
  phase: z.enum(["baseline", "intervention"]).optional().nullable(),
  antecedent: z.string().min(1).max(500),
  antecedentTags: z.array(z.string()).default([]),
  behavior: z.string().min(1).max(500),
  severity: z.number().int().min(1).max(5),
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
