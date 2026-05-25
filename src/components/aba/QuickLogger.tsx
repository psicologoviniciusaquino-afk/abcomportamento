import { useEffect, useRef, useState } from "react";
import { ABCLog, inferFunctionFromTags, useLogs, useChildren } from "@/lib/aba-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Zap } from "lucide-react";

type Phase = "baseline" | "intervention";

const ANTECEDENTES = [
  { emoji: "⚠️", label: "Demanda", tag: "Demanda acadêmica" },
  { emoji: "🗣️", label: "Baixa Atenção", tag: "Retirada de atenção" },
  { emoji: "🚫", label: "Item Negado", tag: "Restrição de acesso" },
  { emoji: "🔄", label: "Transição", tag: "Transição de atividade" },
  { emoji: "🧱", label: "Sozinho", tag: "Sozinho / sem demandas" },
  { emoji: "🤢", label: "Dor/Fome", tag: "Desconforto físico (fome, sono, dor)" },
];

const COMPORTAMENTOS = [
  { emoji: "💥", label: "Agressão" },
  { emoji: "😭", label: "Choro" },
  { emoji: "🔄", label: "Estereotipia" },
  { emoji: "🏃", label: "Fuga" },
  { emoji: "🙅", label: "Recusa" },
  { emoji: "📝", label: "Outro" },
];

const CONSEQUENCIAS = [
  { emoji: "🛑", label: "Pausa/Fuga", tag: "Retirada da tarefa / pausa" },
  { emoji: "🧸", label: "Ganhou Item", tag: "Entrega do objeto/alimento preferido" },
  { emoji: "💬", label: "Ganhou Atenção", tag: "Atenção verbal direta (bronca/consolo)" },
  { emoji: "🤷", label: "Ignorado", tag: "Nenhuma consequência social visível" },
];

type Step = 0 | 1 | 2;

export function QuickLogger() {
  const { add } = useLogs();
  const { children } = useChildren();
  const [childName, setChildName] = useState("");
  const [phase, setPhase] = useState<Phase>("baseline");
  const [step, setStep] = useState<Step>(0);
  const [ant, setAnt] = useState<typeof ANTECEDENTES[number] | null>(null);
  const [beh, setBeh] = useState<typeof COMPORTAMENTOS[number] | null>(null);
  const [con, setCon] = useState<typeof CONSEQUENCIAS[number] | null>(null);
  const [flash, setFlash] = useState(false);
  const [customBeh, setCustomBeh] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!childName && children[0]) setChildName(children[0]);
  }, [children, childName]);

  useEffect(() => {
    if (showCustom) customRef.current?.focus();
  }, [showCustom]);

  const reset = () => {
    setAnt(null); setBeh(null); setCon(null);
    setCustomBeh(""); setShowCustom(false);
    setStep(0);
  };

  const pickAnt = (a: typeof ANTECEDENTES[number]) => { setAnt(a); setStep(1); };
  const pickBeh = (b: typeof COMPORTAMENTOS[number]) => {
    if (b.label === "Outro") { setShowCustom(true); setBeh(b); return; }
    setBeh(b); setShowCustom(false); setStep(2);
  };
  const pickCon = (c: typeof CONSEQUENCIAS[number]) => setCon(c);

  const ready = ant && beh && con && (beh.label !== "Outro" || customBeh.trim().length > 0);

  const save = () => {
    if (!ready || !ant || !beh || !con) return;
    const behaviorLabel = beh.label === "Outro" ? customBeh.trim() : beh.label;
    const allTags = [ant.tag, con.tag];
    const log: ABCLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString().slice(0, 16),
      childName: childName || undefined,
      targetBehavior: behaviorLabel,
      environmentTags: [phase === "baseline" ? "Linha de Base" : "Intervenção"],
      environmentNotes: undefined,
      antecedent: ant.label,
      antecedentTags: [ant.tag],
      behavior: behaviorLabel,
      severity: 3,
      consequence: con.label,
      consequenceTags: [con.tag],
      hypothesizedFunction: inferFunctionFromTags(allTags),
    };
    add(log);
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    toast.success("Ocorrência registrada", { description: `Função: ${log.hypothesizedFunction}` });
    reset();
  };

  return (
    <div className="relative -mx-4 -my-6 md:-mx-8 md:-my-10 min-h-[calc(100vh-1px)] flex flex-col bg-background">
      {flash && <div className="pointer-events-none fixed inset-0 z-50 bg-success/30 animate-[fade_350ms_ease-out]" />}

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
            <Zap className="size-5 text-primary" />
          </div>
          <select
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="flex-1 bg-background border border-input rounded-lg px-3 py-2.5 text-sm font-medium"
          >
            <option value="">— Selecionar paciente —</option>
            {children.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setPhase("baseline")}
            className={cn(
              "py-2 rounded-lg text-sm font-semibold transition-all",
              phase === "baseline" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            )}
          >Linha de Base</button>
          <button
            onClick={() => setPhase("intervention")}
            className={cn(
              "py-2 rounded-lg text-sm font-semibold transition-all",
              phase === "intervention" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            )}
          >Intervenção</button>
        </div>
        {/* Stepper */}
        <div className="flex items-center gap-1.5 pt-1">
          {(["A", "B", "C"] as const).map((l, i) => {
            const done = i === 0 ? !!ant : i === 1 ? !!beh && (beh?.label !== "Outro" || customBeh.trim()) : !!con;
            const current = step === i;
            return (
              <div key={l} className="flex-1 flex items-center gap-1.5">
                <div className={cn(
                  "size-6 rounded-full grid place-items-center text-[11px] font-bold transition-colors",
                  done ? "bg-success text-success-foreground"
                    : current ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {done ? <Check className="size-3.5" /> : l}
                </div>
                {i < 2 && <div className={cn("h-0.5 flex-1 rounded-full", done ? "bg-success" : "bg-muted")} />}
              </div>
            );
          })}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 px-3 py-4 space-y-5 pb-32">
        <Block
          title="Antecedente"
          subtitle="O que veio antes?"
          active={step === 0}
          selected={ant?.label}
          onHeaderClick={() => setStep(0)}
        >
          <Grid>
            {ANTECEDENTES.map((a) => (
              <TapCard key={a.label} emoji={a.emoji} label={a.label}
                selected={ant?.label === a.label}
                onClick={() => pickAnt(a)} />
            ))}
          </Grid>
        </Block>

        <Block
          title="Resposta"
          subtitle="Comportamento observado"
          active={step === 1}
          selected={beh?.label === "Outro" && customBeh ? customBeh : beh?.label}
          onHeaderClick={() => setStep(1)}
        >
          <Grid>
            {COMPORTAMENTOS.map((b) => (
              <TapCard key={b.label} emoji={b.emoji} label={b.label}
                selected={beh?.label === b.label}
                onClick={() => pickBeh(b)} />
            ))}
          </Grid>
          {showCustom && (
            <div className="mt-3 flex gap-2">
              <input
                ref={customRef}
                value={customBeh}
                onChange={(e) => setCustomBeh(e.target.value)}
                placeholder="Descrever comportamento..."
                className="flex-1 bg-background border border-input rounded-lg px-3 py-2.5 text-sm"
              />
              <button
                onClick={() => { if (customBeh.trim()) setStep(2); }}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                disabled={!customBeh.trim()}
              >OK</button>
            </div>
          )}
        </Block>

        <Block
          title="Consequência"
          subtitle="O que aconteceu depois?"
          active={step === 2}
          selected={con?.label}
          onHeaderClick={() => setStep(2)}
        >
          <Grid>
            {CONSEQUENCIAS.map((c) => (
              <TapCard key={c.label} emoji={c.emoji} label={c.label}
                selected={con?.label === c.label}
                onClick={() => pickCon(c)} />
            ))}
          </Grid>
        </Block>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-16 md:bottom-0 inset-x-0 z-30 p-3 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={save}
          disabled={!ready}
          className={cn(
            "w-full py-4 rounded-2xl text-base font-bold tracking-tight shadow-lg transition-all",
            "flex items-center justify-center gap-2",
            ready
              ? "bg-success text-success-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Check className="size-5" />
          Registrar Ocorrência
        </button>
      </div>

      <style>{`
        @keyframes fade { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  );
}

function Block({
  title, subtitle, active, selected, onHeaderClick, children,
}: {
  title: string; subtitle: string; active: boolean; selected?: string;
  onHeaderClick: () => void; children: React.ReactNode;
}) {
  return (
    <section className={cn(
      "rounded-2xl border bg-card p-3 transition-all",
      active ? "border-primary/50 shadow-sm" : "border-border"
    )}>
      <button onClick={onHeaderClick} className="w-full flex items-baseline justify-between mb-3 px-1">
        <div className="text-left">
          <div className="text-sm font-bold tracking-tight">{title}</div>
          <div className="text-[11px] text-muted-foreground">{subtitle}</div>
        </div>
        {selected && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary max-w-[55%] truncate">
            {selected}
          </span>
        )}
      </button>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-2">{children}</div>;
}

function TapCard({ emoji, label, selected, onClick }: { emoji: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-2 transition-all active:scale-95",
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-background hover:border-primary/40"
      )}
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className="text-[11px] font-semibold text-center leading-tight">{label}</span>
    </button>
  );
}
