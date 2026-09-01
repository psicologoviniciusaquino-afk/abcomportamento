import { useEffect, useRef, useState } from "react";
import { inferFunctionFromTags, useLogs, useChildren, useCustomActivities, Child } from "@/lib/aba-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Check, Zap, Activity } from "lucide-react";

const ANTECEDENTES = [
  { emoji: "📋", label: "Instrução/demanda", tag: "Instrução/demanda" },
  { emoji: "👀", label: "Desvio de atenção", tag: "Desvio de atenção" },
  { emoji: "👥", label: "Interação social", tag: "Interação social" },
  { emoji: "🧸", label: "Objeto preferido", tag: "Objeto preferido" },
  { emoji: "😖", label: "Atividade aversiva", tag: "Atividade aversiva" },
  { emoji: "🧍", label: "Presença de outra pessoa", tag: "Presença de outra pessoa" },
  { emoji: "🙍", label: "Sozinho(a)", tag: "Sozinho(a)" },
  { emoji: "🚫", label: "Item Negado", tag: "Restrição de acesso" },
  { emoji: "🔄", label: "Transição", tag: "Transição de atividade" },
  { emoji: "🤢", label: "Dor/Fome", tag: "Desconforto físico (fome, sono, dor)" },
];

const COMPORTAMENTOS = [
  { emoji: "💥", label: "Agressão" },
  { emoji: "🤕", label: "Autolesão" },
  { emoji: "😭", label: "Choro/Grito" },
  { emoji: "🏃", label: "Fuga/Esquiva" },
  { emoji: "🔄", label: "Estereotipia" },
  { emoji: "🙅", label: "Recusa" },
];

const MAIS_COMPORTAMENTOS = [
  { emoji: "🦷", label: "Morder" },
  { emoji: "🤸", label: "Se jogar" },
  { emoji: "🖐️", label: "Arranhar" },
  { emoji: "🌪️", label: "Destruição" },
  { emoji: "🤏", label: "Beliscar" },
  { emoji: "✊", label: "Puxar Cabelo" },
  { emoji: "💦", label: "Cuspir" },
  { emoji: "🗣️", label: "Xingamento" },
  { emoji: "👕", label: "Despir-se" },
  { emoji: "📝", label: "Outro" },
];

const CONSEQUENCIAS = [
  { emoji: "🗣️", label: "Atenção social", tag: "Atenção verbal direta (bronca/consolo)" },
  { emoji: "🧸", label: "Acesso ao objeto preferido", tag: "Entrega do objeto/alimento preferido" },
  { emoji: "🛑", label: "Retirada da tarefa", tag: "Retirada da tarefa / pausa" },
  { emoji: "🙈", label: "Retirada da atenção", tag: "Retirada da atenção" },
  { emoji: "📤", label: "Retirada do objeto preferido", tag: "Retirada do objeto preferido" },
  { emoji: "🤷", label: "Ignorado", tag: "Nenhuma consequência social visível" },
  { emoji: "🧭", label: "Redirecionamento", tag: "Redirecionamento" },
  { emoji: "🗨️", label: "Modelagem de mando", tag: "Modelagem de mando" },
];

type Phase = "baseline" | "intervention";
type Step = 0 | 1 | 2;

export function QuickLogger() {
  const { add } = useLogs();
  const { children, isLoading: childrenLoading, add: addChild } = useChildren();
  const { activities: savedActivities, add: addSavedActivity, remove: removeSavedActivity } = useCustomActivities();
  const [showNewChild, setShowNewChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [pendingChildName, setPendingChildName] = useState<string | null>(null);
  const newChildRef = useRef<HTMLInputElement>(null);
  const [childId, setChildId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("baseline");
  const [step, setStep] = useState<Step>(0);
  const [ant, setAnt] = useState<typeof ANTECEDENTES[number] | null>(null);
  const [beh, setBeh] = useState<typeof COMPORTAMENTOS[number] | null>(null);
  const [con, setCon] = useState<typeof CONSEQUENCIAS[number] | null>(null);
  const [flash, setFlash] = useState(false);
  const [customBeh, setCustomBeh] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [showMoreBeh, setShowMoreBeh] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);
  const [activity, setActivity] = useState<string>("");
  const [customActivity, setCustomActivity] = useState("");
  const [activityOpen, setActivityOpen] = useState(false);

  const ATIVIDADES = [
    { emoji: "👨‍🏫", label: "Instrução de grupo grande" },
    { emoji: "👥", label: "Trabalho em pequenos grupos" },
    { emoji: "✍️", label: "Trabalho independente" },
    { emoji: "🧩", label: "Tempo não estruturado" },
    { emoji: "✏️", label: "Especificar" },
  ];

  // Session timer state
  const [remaining, setRemaining] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!childId && children[0]) setChildId(children[0].id);
  }, [children, childId]);

  useEffect(() => {
    if (showCustom) customRef.current?.focus();
  }, [showCustom]);

  useEffect(() => {
    if (showNewChild) newChildRef.current?.focus();
  }, [showNewChild]);

  // Seleciona automaticamente o paciente recém-criado
  useEffect(() => {
    if (!pendingChildName) return;
    const found = children.find((c) => c.name === pendingChildName);
    if (found) {
      setChildId(found.id);
      setPendingChildName(null);
    }
  }, [children, pendingChildName]);

  const saveNewChild = () => {
    const name = newChildName.trim();
    if (!name) return;
    addChild(name);
    setPendingChildName(name);
    setNewChildName("");
    setShowNewChild(false);
    toast.success("Paciente adicionado", { description: name });
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          if (!endedRef.current) {
            endedRef.current = true;
            toast.success("Sessão de 50 min concluída", { description: "Tempo encerrado." });
            try {
              const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const o = ctx.createOscillator(); const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.value = 880; g.gain.value = 0.1;
              o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 400);
            } catch {}
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const startTimer = () => {
    if (remaining === 0) { setRemaining(SESSION_SECONDS); endedRef.current = false; }
    setRunning(true);
  };
  const pauseTimer = () => setRunning(false);
  const resetTimer = () => { setRunning(false); setRemaining(SESSION_SECONDS); endedRef.current = false; };
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = ((SESSION_SECONDS - remaining) / SESSION_SECONDS) * 100;

  const resetForm = () => {
    setAnt(null); setBeh(null); setCon(null);
    setCustomBeh(""); setShowCustom(false);
    setActivity(""); setCustomActivity(""); setActivityOpen(false);
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
    const activityLabel =
      activity === "__custom" ? customActivity.trim() : activity;
    add({
      child_id: childId || null,
      timestamp: new Date().toISOString(),
      phase,
      antecedent: ant.label,
      antecedentTags: [ant.tag],
      behavior: behaviorLabel,
      severity: 3,
      consequence: con.label,
      consequenceTags: [con.tag],
      environmentTags: activityLabel ? [`Atividade: ${activityLabel}`] : [],
      environmentNotes: null,
    });
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    toast.success("Ocorrência registrada", { description: `Função: ${inferFunctionFromTags(allTags)}` });
    resetForm();
  };

  const childMap = new Map(children.map((c) => [c.id, c] as const));

  return (
    <div className="relative -mx-4 -my-6 md:-mx-8 md:-my-10 min-h-[calc(100vh-1px)] flex flex-col bg-background">
      {flash && <div className="pointer-events-none fixed inset-0 z-50 bg-success/30 animate-[fade_350ms_ease-out]" />}

      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 py-3 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
              <Zap className="size-5 text-primary" />
            </div>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              className="flex-1 bg-background border border-input rounded-lg px-3 py-2.5 text-sm font-medium"
              disabled={childrenLoading}
            >
              <option value="">— Selecionar paciente —</option>
              {children.map((c: Child) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewChild((v) => !v)}
              className="shrink-0 h-10 px-3 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1 text-sm font-semibold"
              aria-label="Novo paciente"
            >
              {showNewChild ? "×" : "+ Novo"}
            </button>
          </div>
          {(showNewChild || (!childrenLoading && children.length === 0)) && (
            <div className="flex gap-2">
              <input
                ref={newChildRef}
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveNewChild(); }}
                placeholder="Nome do paciente"
                className="flex-1 bg-background border border-input rounded-lg px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={saveNewChild}
                disabled={!newChildName.trim()}
                className="px-4 rounded-lg bg-success text-success-foreground text-sm font-semibold disabled:opacity-50"
              >Salvar</button>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="rounded-xl border border-border bg-background p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Timer className="size-4" />
              </div>
              <div className="text-2xl font-semibold tabular-nums">{mm}:{ss}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {!running ? (
                <button type="button" onClick={startTimer} className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-semibold">
                  <Play className="size-3.5" /> {remaining === SESSION_SECONDS ? "Iniciar" : "Retomar"}
                </button>
              ) : (
                <button type="button" onClick={pauseTimer} className="inline-flex items-center gap-1 rounded-lg bg-secondary text-secondary-foreground border border-border px-2.5 py-1.5 text-xs font-semibold">
                  <Pause className="size-3.5" /> Pausar
                </button>
              )}
              <button type="button" onClick={resetTimer} className="inline-flex items-center gap-1 rounded-lg bg-secondary text-secondary-foreground border border-border px-2.5 py-1.5 text-xs font-semibold">
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Atividade em execução (colapsível) */}
        <div className="rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setActivityOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Activity className="size-3.5" /> Atividade
            </div>
            <div className="flex items-center gap-1.5">
              {activity ? (
                <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 max-w-[140px] truncate">
                  {activity === "__custom" ? (customActivity || "Especificar") : (ATIVIDADES.find((a) => a.label === activity)?.emoji ? `${ATIVIDADES.find((a) => a.label === activity)?.emoji} ${activity}` : activity)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground/70">Selecionar</span>
              )}
              <span className={cn("text-muted-foreground/60 transition-transform", activityOpen && "rotate-180")}>▾</span>
            </div>
          </button>
          {activityOpen && (
            <div className="px-2.5 pb-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {ATIVIDADES.map((a) => {
                  const selected = activity === a.label || (a.label === "Especificar" && activity === "__custom");
                  return (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => setActivity(a.label === "Especificar" ? "__custom" : a.label)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all text-left",
                        selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span className="text-base">{a.emoji}</span> <span className="leading-tight">{a.label}</span>
                    </button>
                  );
                })}
              </div>
              {activity === "__custom" && (
                <div className="space-y-2">
                  {savedActivities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {savedActivities.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setCustomActivity(a)}
                          className={cn(
                            "group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                            customActivity === a
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card hover:border-primary/40"
                          )}
                        >
                          <span>{a}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); removeSavedActivity(a); if (customActivity === a) setCustomActivity(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); removeSavedActivity(a); if (customActivity === a) setCustomActivity(""); } }}
                            className="ml-0.5 text-muted-foreground/60 hover:text-destructive"
                            aria-label={`Remover ${a}`}
                          >×</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={customActivity}
                      onChange={(e) => setCustomActivity(e.target.value)}
                      placeholder="Especificar a atividade..."
                      className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const v = customActivity.trim();
                        if (!v) return;
                        addSavedActivity(v);
                        toast.success("Atividade salva", { description: v });
                      }}
                      disabled={!customActivity.trim()}
                      className="px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                    >Salvar</button>
                  </div>
                </div>
              )}
            </div>
          )}
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
          <button
            type="button"
            onClick={() => setShowMoreBeh(true)}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-background py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <span className="text-base">➕</span> Mais Opções
          </button>
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

        {showMoreBeh && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMoreBeh(false)} />
            <div className="relative w-full sm:max-w-md max-h-[80vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-2xl p-4 pb-6 animate-[fade_200ms_ease-out]">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-base font-bold tracking-tight">Mais Comportamentos</div>
                  <div className="text-[11px] text-muted-foreground">Opções específicas</div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreBeh(false)}
                  className="size-9 rounded-full grid place-items-center bg-muted text-muted-foreground hover:text-foreground"
                  aria-label="Fechar"
                >✕</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {MAIS_COMPORTAMENTOS.map((b) => (
                  <TapCard key={b.label} emoji={b.emoji} label={b.label}
                    selected={beh?.label === b.label}
                    onClick={() => { pickBeh(b); setShowMoreBeh(false); }} />
                ))}
              </div>
            </div>
          </div>
        )}

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
