import { useState } from "react";
import { ABCLog, inferFunctionFromTags, useLogs } from "@/lib/aba-store";
import { toast } from "sonner";
import { Trash2, Plus, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const ANT_TAGS = ["Demanda apresentada", "Deixado sozinho", "Item negado", "Transição"];
const CON_TAGS = ["Demanda removida", "Atenção dada", "Item fornecido", "Ignorado"];

export function Logger() {
  const { logs, add, remove } = useLogs();
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [antecedent, setAntecedent] = useState("");
  const [antTags, setAntTags] = useState<string[]>([]);
  const [behavior, setBehavior] = useState("");
  const [severity, setSeverity] = useState(3);
  const [consequence, setConsequence] = useState("");
  const [conTags, setConTags] = useState<string[]>([]);

  const toggle = (arr: string[], setArr: (v: string[]) => void, tag: string) =>
    setArr(arr.includes(tag) ? arr.filter((x) => x !== tag) : [...arr, tag]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!behavior.trim()) {
      toast.error("Descreva o comportamento.");
      return;
    }
    const log: ABCLog = {
      id: crypto.randomUUID(),
      timestamp,
      antecedent,
      antecedentTags: antTags,
      behavior,
      severity,
      consequence,
      consequenceTags: conTags,
      hypothesizedFunction: inferFunctionFromTags([...antTags, ...conTags]),
    };
    add(log);
    toast.success("Registro salvo", { description: `Hipótese: ${log.hypothesizedFunction}` });
    setAntecedent(""); setBehavior(""); setConsequence("");
    setAntTags([]); setConTags([]); setSeverity(3);
    setTimestamp(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Registro ABC</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Observação direta: registre antecedentes, comportamentos e consequências.
        </p>
      </header>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Data e Hora">
            <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="input" />
          </Field>
          <Field label={`Severidade: ${severity}/5`}>
            <input type="range" min={1} max={5} value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
          </Field>
        </div>

        <Field label="Antecedente (A)">
          <textarea value={antecedent} onChange={(e) => setAntecedent(e.target.value)}
            rows={2} placeholder="O que aconteceu logo antes..." className="input" />
          <TagRow tags={ANT_TAGS} active={antTags} onToggle={(t) => toggle(antTags, setAntTags, t)} />
        </Field>

        <Field label="Comportamento (B)">
          <textarea value={behavior} onChange={(e) => setBehavior(e.target.value)}
            rows={2} placeholder="Comportamento observável e mensurável..." className="input" />
        </Field>

        <Field label="Consequência (C)">
          <textarea value={consequence} onChange={(e) => setConsequence(e.target.value)}
            rows={2} placeholder="O que ocorreu após o comportamento..." className="input" />
          <TagRow tags={CON_TAGS} active={conTags} onToggle={(t) => toggle(conTags, setConTags, t)} />
        </Field>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            <Save className="size-4" /> Salvar Registro
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Registros Recentes</h2>
          <span className="text-xs text-muted-foreground">{logs.length} no total</span>
        </div>
        {logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <Plus className="size-6 mx-auto mb-2 opacity-50" />
            Nenhum registro ainda — seu primeiro aparecerá aqui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Quando</th>
                  <th className="text-left px-4 py-3">Comportamento</th>
                  <th className="text-left px-4 py-3">Sev</th>
                  <th className="text-left px-4 py-3">Função</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{l.behavior}</td>
                    <td className="px-4 py-3">{l.severity}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        l.hypothesizedFunction === "Pendente"
                          ? "bg-warning/15 text-warning-foreground"
                          : "bg-primary/10 text-primary"
                      )}>
                        {l.hypothesizedFunction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { remove(l.id); toast.success("Registro excluído"); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          background: var(--background);
          border: 1px solid var(--input);
          border-radius: 0.625rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus { border-color: var(--ring); box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 20%, transparent); }
        .btn-primary {
          display: inline-flex; align-items: center; gap: .5rem;
          background: var(--primary); color: var(--primary-foreground);
          padding: .55rem 1rem; border-radius: .625rem;
          font-size: .875rem; font-weight: 500;
          transition: opacity .15s, transform .05s;
        }
        .btn-primary:hover { opacity: .92; }
        .btn-primary:active { transform: translateY(1px); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function TagRow({ tags, active, onToggle }: { tags: string[]; active: string[]; onToggle: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {tags.map((t) => {
        const on = active.includes(t);
        return (
          <button type="button" key={t} onClick={() => onToggle(t)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}>
            {t}
          </button>
        );
      })}
    </div>
  );
}
