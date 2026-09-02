// Normalização de erros vindos do banco / server functions
export type DbLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  status?: number;
};

export function describeDbError(error: unknown, action = "salvar"): string {
  const e = (error ?? {}) as DbLikeError;
  const raw = typeof e.message === "string" ? e.message : String(error ?? "");

  if (/unauthorized|no authorization header|jwt expired|invalid jwt|401/i.test(raw)) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }
  if (e.code === "42501" || /row-level security|permission denied|violates row-level/i.test(raw)) {
    return `Permissão negada pelas regras de acesso ao ${action}. Verifique se você está logado com a conta correta.`;
  }
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }
  return raw ? `Não foi possível ${action}: ${raw}` : `Não foi possível ${action}.`;
}

/** Lança um Error com mensagem legível preservando o detalhe original no console do servidor. */
export function throwDbError(error: unknown, action: string): never {
  console.error(`[aba] erro ao ${action}:`, error);
  const err = new Error(describeDbError(error, action));
  (err as Error & { cause?: unknown }).cause = error;
  throw err;
}
