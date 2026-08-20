import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  childSchema,
  abcLogSchema,
  abcLogUpdateSchema,
  faSessionSchema,
  idSchema,
  optionalChildIdSchema,
} from "./aba.schemas";
import * as aba from "./aba.server";

export const listChildrenFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => aba.listChildren(context.supabase, context.userId));

export const createChildFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => childSchema.parse(data))
  .handler(async ({ data, context }) => aba.createChild(context.supabase, context.userId, data));

export const deleteChildFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => aba.deleteChild(context.supabase, context.userId, data.id));

export const listLogsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => optionalChildIdSchema.parse(data))
  .handler(async ({ data, context }) => aba.listLogs(context.supabase, context.userId, data.childId));

export const createLogFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => abcLogSchema.parse(data))
  .handler(async ({ data, context }) => aba.createLog(context.supabase, context.userId, data));

export const updateLogFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => abcLogUpdateSchema.parse(data))
  .handler(async ({ data, context }) => aba.updateLog(context.supabase, context.userId, data));

export const deleteLogFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => idSchema.parse(data))
  .handler(async ({ data, context }) => aba.deleteLog(context.supabase, context.userId, data.id));

export const listSessionsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => optionalChildIdSchema.parse(data))
  .handler(async ({ data, context }) => aba.listSessions(context.supabase, context.userId, data.childId));

export const createSessionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => faSessionSchema.parse(data))
  .handler(async ({ data, context }) => aba.createSession(context.supabase, context.userId, data));

export const clearSessionsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => optionalChildIdSchema.parse(data))
  .handler(async ({ data, context }) => aba.clearSessions(context.supabase, context.userId, data.childId));
