import type { FunctionType } from "./aba-store";

/** Fonte única das cores das funções (hex espelha src/styles.css). */
export const FUNCTION_THEME: Record<
  FunctionType,
  { hex: string; softHex: string; solid: string; soft: string; text: string; border: string }
> = {
  "Esquiva/fuga": { hex: "#C9722F", softHex: "#F7E3D0", solid: "bg-fn-escape", soft: "bg-fn-escape-soft", text: "text-fn-escape", border: "border-fn-escape" },
  "Atenção": { hex: "#2E6DA4", softHex: "#DBE9F5", solid: "bg-fn-attention", soft: "bg-fn-attention-soft", text: "text-fn-attention", border: "border-fn-attention" },
  "Tangível": { hex: "#C99A2E", softHex: "#F8ECD0", solid: "bg-fn-tangible", soft: "bg-fn-tangible-soft", text: "text-fn-tangible", border: "border-fn-tangible" },
  "Sensorial/automática": { hex: "#7A5CA8", softHex: "#E8E0F3", solid: "bg-fn-sensory", soft: "bg-fn-sensory-soft", text: "text-fn-sensory", border: "border-fn-sensory" },
};

export function fnTheme(fn?: string | null) {
  return fn && fn in FUNCTION_THEME ? FUNCTION_THEME[fn as FunctionType] : null;
}

/** Badge de função: fundo claro + texto da cor. Pendente = neutro. */
export function fnBadgeClass(fn?: string | null) {
  const t = fnTheme(fn);
  return t ? `${t.soft} ${t.text}` : "bg-muted text-muted-foreground italic";
}
