import { ABCLog, FASession, Child, computeTopAntecedent, computeTopConsequence, computeHypothesis, useChildren, inferFunctionFromTags } from "@/lib/aba-store";
import { Activity, Target, HelpCircle, TrendingUp, FileDown, CalendarClock, Lightbulb, User, PieChart as PieIcon, History, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell, Legend,
} from "recharts";
import { exportPdf } from "@/lib/aba-pdf";
import { usePdfHistory } from "@/lib/pdf-history";
import { toast } from "sonner";

export function Dashboard({ logs, sessions }: { logs: ABCLog[]; sessions: FASession[] }) {
  const { children } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("");

  const childMap = new Map(children.map((c) => [c.id, c] as const));
  const selectedChild = childMap.get(selectedChildId);

  const filteredLogs = selectedChildId ? logs.filter((l) => l.child_id === selectedChildId) : logs;

  const total = filteredLogs.length;
  const pending = filteredLogs.filter((l) => !l.hypothesizedFunction || l.hypothesizedFunction === "Pendente").length;
  const counts: Record<string, number> = {};
  filteredLogs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const mostFrequent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const filteredSessions = selectedChildId ? sessions.filter((s) => s.child_id === selectedChildId) : sessions;

  const conditionTotals: Record<string, { condition: string; rate: number }> = {};
  filteredSessions.forEach((s) => {
    const rate = s.frequency / Math.max(s.durationMin, 1);
    if (!conditionTotals[s.condition]) conditionTotals[s.condition] = { condition: s.condition, rate: 0 };
    conditionTotals[s.condition].rate = Math.max(conditionTotals[s.condition].rate, rate);
  });
  const labels: Record<string, string> = { Attention: "Atenção", Demand: "Demanda", Tangible: "Tangível", Play: "Brincar" };
  const chartData = ["Attention", "Demand", "Tangible", "Play"].map((c) => ({
    condition: labels[c],
    rate: Number((conditionTotals[c]?.rate ?? 0).toFixed(2)),
  }));

  const stats = [
    { label: "Comportamentos Registrados", value: total, icon: Activity, tone: "text-chart-1 bg-chart-1/10" },
    { label: "Função Mais Frequente", value: mostFrequent, icon: Target, tone: "text-chart-3 bg-chart-3/10" },
    { label: "Hipóteses Pendentes", value: pending, icon: HelpCircle, tone: "text-chart-2 bg-chart-2/10" },
  ];

  const topAnt = computeTopAntecedent(filteredLogs);
  const topCon = computeTopConsequence(filteredLogs);
  const hypothesis = computeHypothesis(filteredLogs);

  const handleExport = () => {
    if (logs.length === 0 && sessions.length === 0) {
      toast.error("Nenhum dado para exportar.");
      return;
    }
    exportPdf(logs, sessions, children, selectedChild);
    toast.success("PDF gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Painel Clínico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumo das observações e dados experimentais.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 shadow-sm"
        >
          <FileDown className="size-4" /> Exportar PDF
        </button>
      </header>

      {children.length > 0 && (
        <div className="flex items-center gap-3">
          <User className="size-4 text-muted-foreground" />
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Todos os pacientes</option>
            {children.map((c: Child) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedChild && (
            <span className="text-xs text-muted-foreground">
              Mostrando dados de <span className="font-medium text-foreground">{selectedChild.name}</span>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`size-10 rounded-xl grid place-items-center ${tone}`}>
              <Icon className="size-5" />
            </div>
            <div className="mt-4 text-2xl font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="size-4 text-primary" />
          <h2 className="font-semibold">Insights Clínicos</h2>
        </div>
        {filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum registro encontrado{selectedChild ? ` para ${selectedChild.name}` : ""}. Adicione observações no Logger para gerar insights.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Antecedente Mais Frequente</div>
                {topAnt ? (
                  <>
                    <div className="text-lg font-semibold">{topAnt.tag}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topAnt.count} ocorrência{topAnt.count > 1 ? "s" : ""} ({topAnt.percent}% dos registros)
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum antecedente categorizado</div>
                )}
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Consequência Mais Frequente</div>
                {topCon ? (
                  <>
                    <div className="text-lg font-semibold">{topCon.tag}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {topCon.count} ocorrência{topCon.count > 1 ? "s" : ""} ({topCon.percent}% dos registros)
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhuma consequência categorizada</div>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
              <div className="text-xs text-primary/80 uppercase tracking-wide mb-1">Hipótese Provável</div>
              <div className="text-lg font-semibold text-primary">
                Comportamento mantido por <span className="underline decoration-2 underline-offset-4">{hypothesis}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado na consequência mais frequente registrada nos dados{selectedChild ? ` de ${selectedChild.name}` : ""}.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="font-semibold">Condições da AF — Taxa de Resposta (por min)</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="condition" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="rate" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {filteredSessions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Execute sessões no Simulador AF para preencher este gráfico.
          </p>
        )}
      </div>

      <FunctionPie logs={filteredLogs} />

      <BehaviorPie logs={filteredLogs} />

      <ScatterPanel logs={filteredLogs} />

      <PdfHistoryPanel />
    </div>
  );
}

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function PieLegend({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ul className="mt-4 flex flex-col gap-1.5">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center gap-2 text-xs min-w-0">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
          />
          <span className="truncate min-w-0 flex-1" title={d.name}>{d.name}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">
            {d.value} • {Math.round((d.value / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function FunctionPie({ logs }: { logs: ABCLog[] }) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    const fn =
      l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente"
        ? l.hypothesizedFunction
        : inferFunctionFromTags([...(l.consequenceTags ?? []), ...(l.antecedentTags ?? [])]);
    counts[fn] = (counts[fn] ?? 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PieIcon className="size-4 text-primary" />
        <h2 className="font-semibold">Distribuição das Funções (Pizza)</h2>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Registre ocorrências para visualizar a distribuição das funções.</p>
      ) : (
        <>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <PieLegend data={data} />
        </>
      )}
    </div>
  );
}

function BehaviorPie({ logs }: { logs: ABCLog[] }) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    const b = (l.behavior || "").trim() || "Não especificado";
    counts[b] = (counts[b] ?? 0) + 1;
  });
  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PieIcon className="size-4 text-chart-2" />
        <h2 className="font-semibold">Distribuição dos Comportamentos (Pizza)</h2>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Registre ocorrências para visualizar a distribuição dos comportamentos.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={95}
                paddingAngle={2}
                label={(e: { name?: string; percent?: number }) => `${e.name}: ${Math.round((e.percent ?? 0) * 100)}%`}
                labelLine={false}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function PdfHistoryPanel() {
  const { entries, clear } = usePdfHistory();
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h2 className="font-semibold">Histórico de PDFs</h2>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => { clear(); toast.success("Histórico limpo"); }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Limpar
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum relatório gerado ainda. Use “Exportar PDF” para criar o primeiro.</p>
      ) : (
        <ul className="divide-y divide-border">
          {entries.map((e) => (
            <li key={e.id} className="py-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{e.fileName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(e.createdAt).toLocaleString("pt-BR")} • {e.childName}
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 text-right">
                {e.logs} registros<br />{e.sessions} sessões
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function ScatterPanel({ logs }: { logs: ABCLog[] }) {
  const map = new Map<string, { x: number; y: number; count: number }>();
  logs.forEach((l) => {
    const d = new Date(l.timestamp);
    if (isNaN(d.getTime())) return;
    const x = d.getHours();
    const y = d.getDay();
    const key = `${y}-${x}`;
    const prev = map.get(key);
    if (prev) prev.count += 1;
    else map.set(key, { x, y, count: 1 });
  });
  const data = Array.from(map.values());
  const maxCount = data.reduce((m, p) => Math.max(m, p.count), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock className="size-4 text-primary" />
        <h2 className="font-semibold">Gráfico de Dispersão — Hora × Dia da Semana</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Cada círculo mostra um horário com ocorrências; tamanho = frequência. Útil para identificar Operações Motivadoras (ex.: pico próximo ao almoço sugere fome/cansaço).
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Hora"
              domain={[0, 23]}
              ticks={[0, 3, 6, 9, 12, 15, 18, 21]}
              tickFormatter={(h) => `${h}h`}
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Dia"
              domain={[-0.5, 6.5]}
              ticks={[0, 1, 2, 3, 4, 5, 6]}
              tickFormatter={(d) => WEEKDAYS[d] ?? ""}
              stroke="var(--muted-foreground)"
              fontSize={12}
              width={44}
            />
            <ZAxis type="number" dataKey="count" range={[60, 400]} name="Ocorrências" />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value: number | string, name: string) => {
                if (name === "Dia") return [WEEKDAYS[Number(value)] ?? value, name];
                if (name === "Hora") return [`${value}h`, name];
                return [value, name];
              }}
            />
            <Scatter data={data} fill="var(--primary)" fillOpacity={0.65} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {logs.length === 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          Registre comportamentos no Logger para visualizar padrões temporais.
        </p>
      )}
      <div className="mt-2 text-[11px] text-muted-foreground">
        Total de pontos: {data.length} • Pico: {maxCount} ocorrência{maxCount > 1 ? "s" : ""} em um mesmo horário.
      </div>
    </div>
  );
}
