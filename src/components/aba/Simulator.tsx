import { useState } from "react";
import { FASession, useFASessions } from "@/lib/aba-store";
import { toast } from "sonner";
import { FlaskConical, Play, Trash2, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";

const CONDITIONS: { key: FASession["condition"]; label: string; desc: string; color: string }[] = [
  { key: "Attention", label: "Attention", desc: "Therapist withholds attention; delivers attention contingent on behavior.", color: "var(--chart-1)" },
  { key: "Demand", label: "Demand / Escape", desc: "Present academic/task demands; remove demand contingent on behavior.", color: "var(--chart-2)" },
  { key: "Tangible", label: "Tangible", desc: "Preferred item restricted; delivered contingent on behavior.", color: "var(--chart-3)" },
  { key: "Play", label: "Control / Play", desc: "Free access to attention & items; no demands. Baseline.", color: "var(--chart-4)" },
];

export function Simulator() {
  const { sessions, add, clear } = useFASessions();
  const [condition, setCondition] = useState<FASession["condition"]>("Attention");
  const [duration, setDuration] = useState(10);
  const [frequency, setFrequency] = useState(5);

  const run = () => {
    const s: FASession = {
      id: crypto.randomUUID(),
      condition, durationMin: duration, frequency,
      createdAt: new Date().toISOString(),
    };
    add(s);
    toast.success(`${condition} session recorded`, {
      description: `Rate: ${(frequency / duration).toFixed(2)} responses/min`,
    });
  };

  const grouped = CONDITIONS.map((c) => {
    const matching = sessions.filter((s) => s.condition === c.key);
    const totalDur = matching.reduce((a, s) => a + s.durationMin, 0);
    const totalFreq = matching.reduce((a, s) => a + s.frequency, 0);
    return {
      condition: c.label.split(" ")[0],
      rate: totalDur > 0 ? Number((totalFreq / totalDur).toFixed(2)) : 0,
      color: c.color,
      sessions: matching.length,
    };
  });

  const elevated = grouped.filter((g) => g.condition !== "Control" && g.condition !== "Play");
  const maxRate = Math.max(...elevated.map((g) => g.rate), 0);
  const winner = maxRate > 0 ? elevated.find((g) => g.rate === maxRate)?.condition : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Functional Analysis Simulator</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          The experimental "gold standard" (Iwata et al., 1982/1994): systematically manipulate
          antecedents and consequences across conditions to identify the variable that maintains behavior.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <h2 className="font-semibold">Run a Condition Session</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.key} onClick={() => setCondition(c.key)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  condition === c.key
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="text-sm font-medium">{c.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{c.desc}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Duration: {duration} min
            </label>
            <input type="range" min={1} max={30} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[var(--primary)] mt-2" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Observed Frequency: {frequency} responses
            </label>
            <input type="range" min={0} max={60} value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-[var(--primary)] mt-2" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Rate: <span className="font-medium text-foreground">{(frequency / duration).toFixed(2)}</span> /min
            </div>
            <button onClick={run} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              <Play className="size-4" /> Run Session
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Response Rate Across Conditions</h2>
            {sessions.length > 0 && (
              <button onClick={() => { clear(); toast.success("Sessions cleared"); }}
                className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                <Trash2 className="size-3" /> Clear
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
                Highest rate observed in <strong className="text-foreground">{winner}</strong>.
                If elevated vs. Play, the behavior is likely maintained by this consequence.
              </span>
            ) : (
              <span>Run sessions across all four conditions to identify the maintaining variable.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
