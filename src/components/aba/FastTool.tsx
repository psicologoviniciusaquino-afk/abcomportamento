import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardCheck, RefreshCw, TrendingUp } from "lucide-react";

type Answer = "sim" | "nao" | "na";

const QUESTIONS: { text: string; group: number; note?: boolean }[] = [
  { text: "O comportamento-problema ocorre quando a pessoa não está recebendo atenção ou quando cuidadores estão prestando atenção em outra pessoa?", group: 0 },
  { text: "O comportamento-problema ocorre quando o pedido da pessoa por itens de preferência ou atividades são negados ou quando são retirados?", group: 0 },
  { text: "Quando o comportamento-problema ocorre, os cuidadores geralmente tentam acalmar a pessoa ou direcioná-la para atividades de preferência?", group: 0 },
  { text: "A pessoa geralmente se comporta bem quando está recebendo muita atenção ou quando as atividades de preferência estão livremente disponíveis?", group: 0 },
  { text: "A pessoa geralmente se agita ou resiste quando é convidada a realizar uma tarefa ou participar em atividades?", group: 1 },
  { text: "O comportamento-problema ocorre quando a pessoa é direcionada a realizar uma tarefa ou participar de atividades?", group: 1 },
  { text: "Se o comportamento-problema ocorre enquanto as tarefas são apresentadas, o cuidador diminui ou retira as tarefas?", group: 1 },
  { text: "A pessoa geralmente se comporta bem quando não é obrigada a fazer nada?", group: 1 },
  { text: "O comportamento-problema ocorre mesmo quando ninguém está próximo ou observando?", group: 2 },
  { text: "A pessoa se envolve no comportamento-problema mesmo quando há atividades de lazer disponíveis?", group: 2 },
  { text: "O comportamento-problema parece ser uma forma de \"autoestimulação\"?", group: 2 },
  { text: "O comportamento-problema é menor provável de ocorrer quando as atividades de estimulação sensorial são apresentadas?", group: 2 },
  { text: "O comportamento-problema é cíclico, ocorrendo vários dias e depois parando?", group: 3 },
  { text: "A pessoa tem dores recorrentes de condições como infecções de ouvido ou alergias?", group: 3, note: true },
  { text: "O comportamento-problema é mais provável de ocorrer quando a pessoa está doente?", group: 3 },
  { text: "Se a pessoa está passando por problemas físicos e estes são tratados, o comportamento-problema costuma ir embora?", group: 3 },
];

const GROUPS: { name: string; desc: string; tone: string; bar: string }[] = [
  { name: "Social (Atenção / Itens de preferência)", desc: "Itens 1–4", tone: "text-chart-1", bar: "bg-chart-1/10" },
  { name: "Social (Fuga de tarefas / Atividades)", desc: "Itens 5–8", tone: "text-chart-2", bar: "bg-chart-2/10" },
  { name: "Automático (Estimulação Sensorial)", desc: "Itens 9–12", tone: "text-chart-4", bar: "bg-chart-4/10" },
  { name: "Automático (Atenuação da dor / Fisiológico)", desc: "Itens 13–16", tone: "text-chart-3", bar: "bg-chart-3/10" },
];

const OPTIONS: { key: Answer; label: string; active: string }[] = [
  { key: "sim", label: "Sim", active: "bg-success text-success-foreground border-success" },
  { key: "nao", label: "Não", active: "bg-muted text-foreground border-border" },
  { key: "na", label: "N/A", active: "bg-muted/60 text-muted-foreground border-border" },
];

export function FastTool() {
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [note14, setNote14] = useState("");
  const [childName, setChildName] = useState("");
  const [appliedBy, setAppliedBy] = useState("");
  const [respondedBy, setRespondedBy] = useState("");

  const answered = Object.keys(answers).length;

  const scores = useMemo(() => {
    const s = [0, 0, 0, 0];
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === "sim") s[q.group] += 1;
    });
    return s;
  }, [answers]);

  const max = Math.max(...scores);
  const topIndices = scores
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s === max && s > 0)
    .map(({ i }) => i);

  const reset = () => { setAnswers({}); setNote14(""); };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">FAST</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Ferramenta de Triage de Análise Funcional. Responda 16 perguntas para apontar a potencial fonte de reforçamento.
          </p>
        </div>
        {answered > 0 && (
          <button
            onClick={reset}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" /> Limpar
          </button>
        )}
      </header>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ClipboardCheck className="size-4 text-primary" />
        <span className="font-medium">{answered}/16 respondidas</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(answered / 16) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Perguntas */}
        <section className="lg:col-span-2 space-y-3">
          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border p-3.5 transition-colors",
                answers[i] ? "border-primary/30 bg-card" : "border-border bg-card"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 text-sm leading-relaxed">
                  <span className="font-semibold text-primary mr-2">{i + 1}.</span>
                  {q.text}
                </div>
                <div className="flex gap-2 shrink-0">
                  {OPTIONS.map((o) => {
                    const chosen = answers[i] === o.key;
                    return (
                      <button
                        key={o.key}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: o.key }))}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                          chosen ? o.active : "bg-background text-muted-foreground border-border hover:border-primary/40"
                        )}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {q.note && answers[i] === "sim" && (
                <input
                  value={note14}
                  onChange={(e) => setNote14(e.target.value)}
                  placeholder="Em caso afirmativo, liste:"
                  className="mt-3 w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </section>

        {/* Resumo */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-4 text-primary" />
              <h2 className="font-semibold">Potencial Fonte de Reforçamento</h2>
            </div>
            <div className="space-y-3">
              {GROUPS.map((g, i) => {
                const isTop = topIndices.includes(i);
                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border p-3 transition-all",
                      isTop ? "border-primary bg-primary/10" : "border-border bg-muted/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-medium leading-snug">{g.name}</div>
                      <div className={cn("text-sm font-bold tabular-nums shrink-0", isTop ? "text-primary" : "text-muted-foreground")}>
                        {scores[i]}/4
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-background overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", isTop ? "bg-primary" : "bg-muted-foreground/40")}
                        style={{ width: `${(scores[i] / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {topIndices.length > 0 ? (
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                Hipótese Funcional Primária
              </div>
              <div className="space-y-2">
                {topIndices.map((i) => (
                  <div key={i} className="font-bold tracking-tight">{GROUPS[i].name}</div>
                ))}
              </div>
              {topIndices.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Empate entre {topIndices.length} categorias. Considere análise funcional experimental para confirmar.
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Baseado nas respostas "Sim" do questionário FAST ({answered}/16 respondidas).
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Responda às perguntas para revelar a hipótese funcional primária.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
