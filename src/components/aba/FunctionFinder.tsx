import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles, LogOut, Package, MessageSquare, CheckCircle2, RefreshCw,
} from "lucide-react";

type FunctionKey = "sensorial" | "esquiva" | "tangivel" | "atencao";

const FUNCTIONS: {
  key: FunctionKey;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  tip: string;
  tone: string;
  bar: string;
}[] = [
  {
    key: "sensorial",
    name: "Sensorial",
    icon: Sparkles,
    desc: "Comportamento mantido por estimulação física/sensorial interna e satisfação automática.",
    tip: "Oferecer atividades sensoriais alternativas e enriquecimento ambiental; usar extinção sensorial quando seguro e apropriado.",
    tone: "text-chart-4",
    bar: "bg-chart-4/10 border-chart-4/30",
  },
  {
    key: "esquiva",
    name: "Esquiva / Fuga",
    icon: LogOut,
    desc: "Comportamento mantido pelo término, adiamento ou remoção de uma demanda, tarefa ou situação indesejada.",
    tip: "Graduar demandas, usar pausas programadas e reforçar a tolerância à tarefa; ensinar a pedir intervalo funcionalmente.",
    tone: "text-chart-2",
    bar: "bg-chart-2/10 border-chart-2/30",
  },
  {
    key: "tangivel",
    name: "Tangível",
    icon: Package,
    desc: "Comportamento mantido pelo acesso a um item, brinquedo, alimento ou atividade.",
    tip: "Reforçar pedidos funcionais (mando) para acesso ao item; usar extinção do comportamento-problema e acesso não contingente programado.",
    tone: "text-chart-3",
    bar: "bg-chart-3/10 border-chart-3/30",
  },
  {
    key: "atencao",
    name: "Atenção",
    icon: MessageSquare,
    desc: "Comportamento mantido pelo recebimento de interação social, olhar ou resposta do outro.",
    tip: "Reforçar atenção contingente ao comportamento apropriado; usar extinção/ignorar o comportamento-problema quando seguro.",
    tone: "text-chart-1",
    bar: "bg-chart-1/10 border-chart-1/30",
  },
];

const QUESTIONS: { text: string; points: FunctionKey }[] = [
  { text: "O comportamento continua acontecendo mesmo se a criança estiver sozinha?", points: "sensorial" },
  { text: "Acontece logo após uma ordem, tarefa ou pedido ser feito?", points: "esquiva" },
  { text: "Acontece quando um objeto/atividade é retirado ou negado?", points: "tangivel" },
  { text: "Acontece quando a atenção do adulto é direcionada a outra pessoa ou coisa?", points: "atencao" },
];

export function FunctionFinder() {
  const [selected, setSelected] = useState<FunctionKey | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const suggestion = useMemo<FunctionKey | null>(() => {
    if (Object.keys(answers).length < QUESTIONS.length) return null;
    const score: Record<FunctionKey, number> = { sensorial: 0, esquiva: 0, tangivel: 0, atencao: 0 };
    QUESTIONS.forEach((q, i) => {
      if (answers[i]) score[q.points] += 1;
    });
    const top = Object.entries(score).sort((a, b) => b[1] - a[1]);
    return top[0][1] > 0 ? (top[0][0] as FunctionKey) : null;
  }, [answers]);

  const active = selected ?? suggestion;
  const activeFn = FUNCTIONS.find((f) => f.key === active);

  const reset = () => { setSelected(null); setAnswers({}); };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Funções do Comportamento</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Identifique rapidamente qual função mantém um comportamento observável. Toque em um card ou responda ao testador.
          </p>
        </div>
        {(selected || Object.keys(answers).length > 0) && (
          <button
            onClick={reset}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="size-3.5" /> Limpar
          </button>
        )}
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FUNCTIONS.map((f) => {
          const Icon = f.icon;
          const isActive = active === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setSelected(isActive ? null : f.key)}
              className={cn(
                "text-left rounded-2xl border p-4 transition-all active:scale-[0.98] flex gap-3",
                isActive
                  ? `border-primary bg-primary/10 shadow-sm`
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <span className={cn("size-11 rounded-xl grid place-items-center shrink-0", f.bar)}>
                <Icon className={cn("size-5", f.tone)} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{f.name}</span>
                  {isActive && <CheckCircle2 className="size-4 text-primary" />}
                </span>
                <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</span>
              </span>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-1">Testador Rápido de Função</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Responda 4 perguntas diretas. A função sugerida aparece automaticamente.
        </p>
        <div className="space-y-3">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border p-3">
              <div className="flex-1 text-sm">
                <span className="font-medium text-muted-foreground mr-2">{i + 1}.</span>
                {q.text}
              </div>
              <div className="flex gap-2 shrink-0">
                {(["Sim", "Não"] as const).map((label) => {
                  const isYes = label === "Sim";
                  const chosen = answers[i] === isYes;
                  return (
                    <button
                      key={label}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: isYes }))}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        chosen
                          ? isYes
                            ? "bg-success text-success-foreground border-success"
                            : "bg-muted text-foreground border-border"
                          : "bg-background text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {activeFn && (
        <section className={cn("rounded-2xl border-2 p-5 shadow-sm", "border-primary/30 bg-primary/5")}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary mb-2">
            {selected ? "Função selecionada" : "Função sugerida"}
          </div>
          <div className="flex items-start gap-3">
            <span className={cn("size-12 rounded-xl grid place-items-center shrink-0", activeFn.bar)}>
              <activeFn.icon className={cn("size-6", activeFn.tone)} />
            </span>
            <div>
              <div className="text-lg font-bold tracking-tight">{activeFn.name}</div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{activeFn.desc}</p>
              <div className="mt-3 rounded-xl bg-background/60 border border-border p-3 text-sm">
                <span className="font-semibold">Manejo sugerido: </span>
                {activeFn.tip}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
