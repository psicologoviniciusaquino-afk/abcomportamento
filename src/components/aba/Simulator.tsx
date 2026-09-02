import { useState } from "react";
import { FASession, useFASessions, useLogs, useChildren, Child } from "@/lib/aba-store";
import { exportPdf } from "@/lib/aba-pdf";
import { toast } from "sonner";
import { FlaskConical, Play, Trash2, Info, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";

const CONDITIONS: { key: FASession["condition"]; label: string; desc: string; color: string }[] = [
  { key: "Attention", label: "Atenção", desc: "Terapeuta retém atenção; libera atenção contingente ao comportamento.", color: "var(--chart-1)" },
  { key: "Demand", label: "Demanda / Fuga", desc: "Apresenta tarefas; remove a demanda contingente ao comportamento.", color: "var(--chart-2)" },
  { key: "Tangible", label: "Tangível", desc: "Item preferido é restringido; entregue contingente ao comportamento.", color: "var(--chart-3)" },
  { key: "Play", label: "Controle / Brincar", desc: "Acesso livre a atenção e itens; sem demandas. Linha de base.", color: "var(--chart-4)" },
];

export function Simulator() {
  const { sessions, add, clear } = useFASessions();
  const { logs } = useLogs();
  const { children, isLoading: childrenLoading } = useChildren();
  const [childId, setChildId] = useState<string>("");
  const [condition, setCondition] = useState<FASession["condition"]>("Attention");
  const [duration, setDuration] = useState(10);
  const [frequency, setFrequency] = useState(5);

  const childMap = new Map(children.map((c) => [c.id, c] as const));
  const selectedChild = childMap.get(childId);

  const run = async () => {
    try {
      await add({
        child_id: childId || null,
        condition,
        durationMin: duration,
        frequency,
      });
    } catch {
      return; // erro já exibido pelo hook
    }
    const label = CONDITIONS.find((c) => c.key === condition)?.label;

    toast.success(`Sessão de ${label} registrada`, {
      description: `Taxa: ${(frequency / duration).toFixed(2)} respostas/min`,
    });
    // Exportar PDF automaticamente
    try {
      exportPdf(logs, [...sessions, {
        id: "temp",
        owner_id: "",
        child_id: childId || null,
        condition,
        durationMin: duration,
        frequency,
        createdAt: new Date().toISOString(),
      }], children, selectedChild);
      toast.success("PDF exportado automaticamente", {
        icon: <FileDown className="size-4" />,
      });
    } catch {
      toast.error("Falha ao exportar PDF automaticamente");
    }
  };

  const filteredSessions = childId ? sessions.filter((s) => s.child_id === childId) : sessions;

  const grouped = CONDITIONS.map((c) => {
    const matching = filteredSessions.filter((s) => s.condition === c.key);
    const totalDur = matching.reduce((a, s) => a + s.durationMin, 0);
    const totalFreq = matching.reduce((a, s) => a + s.frequency, 0);
    return {
      condition: c.label.split(" ")[0],
      rate: totalDur > 0 ? Number((totalFreq / totalDur).toFixed(2)) : 0,
      color: c.color,
      sessions: matching.length,
    };
  });

  const elevated = grouped.filter((g) => g.condition !== "Controle" && g.condition !== "Brincar");
  const maxRate = Math.max(...elevated.map((g) => g.rate), 0);
  const winner = maxRate > 0 ? elevated.find((g) => g.rate === maxRate)?.condition : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Simulador de Análise Funcional</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          O "padrão-ouro" experimental (Iwata et al., 1982/1994): manipule antecedentes e
          consequências em diferentes condições para identificar a variável que mantém o comportamento.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <h2 className="font-semibold">Executar Sessão de Condição</h2>
          </div>

          <Field label="Paciente">
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="input w-full"
              disabled={childrenLoading}
            >
              <option value="">— Selecionar —</option>
              {children.map((c: Child) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c) => (
              <button key={c.key} onClick={() => setCondition(c.key)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  condition === c.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}>
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{c.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Duração: {duration} min
            </label>
            <input type="range" min={1} max={30} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[var(--primary)] mt-2" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Frequência observada: {frequency} respostas
            </label>
            <input type="range" min={0} max={60} value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-[var(--primary)] mt-2" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Taxa: <span className="font-medium text-foreground">{(frequency / duration).toFixed(2)}</span> /min
            </div>
            <button onClick={run} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              <Play className="size-4" /> Executar Sessão
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Taxa de Respostas por Condição</h2>
            {sessions.length > 0 && (
              <button onClick={() => { clear(); toast.success("Sessões removidas"); }}
                className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                <Trash2 className="size-3" /> Limpar
              </button>
            )}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="condition" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} label={{ value: "resp/min", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "var(--muted-foreground)" } }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                  {grouped.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-3 flex gap-2 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 mt-0.5 text-primary" />
            {winner ? (
              <span>
                Maior taxa observada em <strong className="text-foreground">{winner}</strong>.
                Se elevada em relação a Brincar, o comportamento provavelmente é mantido por essa consequência.
              </span>
            ) : (
              <span>Execute sessões nas quatro condições para identificar a variável mantenedora.</span>
            )}
          </div>
        </div>
      </div>
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
