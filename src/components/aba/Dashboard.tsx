import { ABCLog, FASession } from "@/lib/aba-store";
import { Activity, Target, HelpCircle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function Dashboard({ logs, sessions }: { logs: ABCLog[]; sessions: FASession[] }) {
  const total = logs.length;
  const pending = logs.filter((l) => !l.hypothesizedFunction || l.hypothesizedFunction === "Pending").length;
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pending") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const mostFrequent =
    Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const conditionTotals: Record<string, { condition: string; rate: number }> = {};
  sessions.forEach((s) => {
    const rate = s.frequency / Math.max(s.durationMin, 1);
    if (!conditionTotals[s.condition]) conditionTotals[s.condition] = { condition: s.condition, rate: 0 };
    conditionTotals[s.condition].rate = Math.max(conditionTotals[s.condition].rate, rate);
  });
  const chartData = ["Attention", "Demand", "Tangible", "Play"].map((c) => ({
    condition: c,
    rate: Number((conditionTotals[c]?.rate ?? 0).toFixed(2)),
  }));

  const stats = [
    { label: "Behaviors Logged", value: total, icon: Activity, tone: "text-chart-1 bg-chart-1/10" },
    { label: "Most Frequent Function", value: mostFrequent, icon: Target, tone: "text-chart-3 bg-chart-3/10" },
    { label: "Pending Hypotheses", value: pending, icon: HelpCircle, tone: "text-chart-2 bg-chart-2/10" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Clinical Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A quick snapshot of observation and experimental data.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className={`size-10 rounded-xl grid place-items-center ${tone}`}>
                <Icon className="size-5" />
              </div>
            </div>
            <div className="mt-4 text-2xl font-semibold">{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="font-semibold">FA Conditions — Peak Response Rate (per min)</h2>
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
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Run sessions in the FA Simulator to populate this chart.
          </p>
        )}
      </div>
    </div>
  );
}
