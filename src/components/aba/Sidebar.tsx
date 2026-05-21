import { LayoutDashboard, ClipboardList, FlaskConical, BookOpen, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "dashboard" | "logger" | "simulator" | "education";

const items: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Painel", icon: LayoutDashboard },
  { key: "logger", label: "Registro ABC", icon: ClipboardList },
  { key: "simulator", label: "Simulador AF", icon: FlaskConical },
  { key: "education", label: "Aprender", icon: BookOpen },
];

export function Sidebar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <>
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur px-4 py-6 gap-2 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="size-9 rounded-xl bg-primary/10 grid place-items-center">
            <Brain className="size-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Rastreador ABC</div>
            <div className="text-xs text-muted-foreground">Simulador AF</div>
          </div>
        </div>
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
              active === key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
        <div className="mt-auto text-[11px] text-muted-foreground px-2 leading-relaxed">
          Para uso clínico e treinamento. Dados salvos localmente.
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur grid grid-cols-4">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium",
              active === key ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
