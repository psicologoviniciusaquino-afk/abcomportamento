import { useState } from "react";
import { ChevronDown, BookOpen, Search, Eye, FlaskConical, MessageSquare, LogOut, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FUNCTIONS = [
  { name: "Escape", icon: LogOut, color: "text-chart-2 bg-chart-2/10", desc: "Behavior removes/postpones an aversive task or situation (e.g., demands, transitions)." },
  { name: "Attention", icon: MessageSquare, color: "text-chart-1 bg-chart-1/10", desc: "Behavior produces social attention — reprimands, comfort, or eye contact." },
  { name: "Tangibles", icon: Package, color: "text-chart-3 bg-chart-3/10", desc: "Behavior gains access to a preferred item or activity." },
  { name: "Sensory / Automatic", icon: Sparkles, color: "text-chart-4 bg-chart-4/10", desc: "Behavior produces its own reinforcement — sensory feedback independent of others." },
];

const SECTIONS = [
  {
    title: "Functional Assessment (Indirect & Direct)",
    icon: Search,
    body: "Gathers correlational information through interviews, rating scales (e.g., FAST, MAS, QABF) and structured ABC observation in the natural environment. Fast and low-effort, but does not establish causation between environmental events and behavior.",
  },
  {
    title: "Functional Analysis (Experimental)",
    icon: FlaskConical,
    body: "Systematically manipulates antecedents and consequences across analog conditions (Attention, Demand, Tangible, Play) to demonstrate a functional — causal — relationship. Established by Iwata, Dorsey, Slifer, Bauman & Richman (1982/1994). Considered the gold standard.",
  },
  {
    title: "Direct Observation (ABC Recording)",
    icon: Eye,
    body: "A descriptive method where the observer records the Antecedent, Behavior, and Consequence of each occurrence in real time. Strengthens hypotheses generated from indirect assessment and informs which FA conditions to prioritize.",
  },
];

export function Education() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Educational Reference</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Core concepts in Applied Behavior Analysis. Drawing on foundational research
          (Iwata et al.) and contemporary work in Brazil (e.g., Thaís Yazawa).
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-4 text-primary" />
          <h2 className="font-semibold">Assessment vs. Analysis</h2>
        </div>
        <div className="space-y-2">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40"
                >
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
        <h2 className="font-semibold mb-4">The Four Functions of Behavior</h2>
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
