import { useState } from "react";
import { ChevronDown, BookOpen, Search, Eye, FlaskConical, MessageSquare, LogOut, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FUNCTIONS = [
  { name: "Fuga", icon: LogOut, color: "text-chart-2 bg-chart-2/10", desc: "O comportamento remove ou adia uma tarefa ou situação aversiva (ex.: demandas, transições)." },
  { name: "Atenção", icon: MessageSquare, color: "text-chart-1 bg-chart-1/10", desc: "O comportamento produz atenção social — reprimendas, conforto ou contato visual." },
  { name: "Tangíveis", icon: Package, color: "text-chart-3 bg-chart-3/10", desc: "O comportamento gera acesso a um item ou atividade preferida." },
  { name: "Sensorial / Automática", icon: Sparkles, color: "text-chart-4 bg-chart-4/10", desc: "O comportamento produz seu próprio reforço — feedback sensorial independente de outras pessoas." },
];

const SECTIONS = [
  {
    title: "Avaliação Funcional (Indireta e Direta)",
    icon: Search,
    body: "Coleta informações correlacionais por meio de entrevistas, escalas (ex.: FAST, MAS, QABF) e observação ABC estruturada no ambiente natural. Rápida e de baixo custo, mas não estabelece causalidade entre eventos ambientais e o comportamento.",
  },
  {
    title: "Análise Funcional (Experimental)",
    icon: FlaskConical,
    body: "Manipula sistematicamente antecedentes e consequências em condições análogas (Atenção, Demanda, Tangível, Brincar) para demonstrar relação funcional — causal. Estabelecida por Iwata, Dorsey, Slifer, Bauman e Richman (1982/1994). Considerada o padrão-ouro.",
  },
  {
    title: "Observação Direta (Registro ABC)",
    icon: Eye,
    body: "Método descritivo no qual o observador registra Antecedente, Comportamento e Consequência de cada ocorrência em tempo real. Reforça hipóteses geradas pela avaliação indireta e orienta quais condições de AF priorizar.",
  },
];

export function Education() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Referência Educacional</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Conceitos centrais da Análise do Comportamento Aplicada. Baseado em pesquisas fundamentais
          (Iwata et al.) e em trabalhos contemporâneos no Brasil (ex.: Thaís Yazawa).
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-4 text-primary" />
          <h2 className="font-semibold">Avaliação vs. Análise</h2>
        </div>
        <div className="space-y-2">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40">
                  <span className="flex items-center gap-3">
                    <span className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-medium text-sm">{s.title}</span>
                  </span>
                  <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-4">As Quatro Funções do Comportamento</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FUNCTIONS.map(({ name, icon: Icon, color, desc }) => (
            <div key={name} className="rounded-xl border border-border p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className={`size-9 rounded-lg grid place-items-center ${color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="font-medium text-sm">{name}</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
