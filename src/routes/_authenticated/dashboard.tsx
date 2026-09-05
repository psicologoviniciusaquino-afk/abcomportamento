import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar, TabKey } from "@/components/aba/Sidebar";
import { Dashboard } from "@/components/aba/Dashboard";
import { Logger } from "@/components/aba/Logger";
import { QuickLogger } from "@/components/aba/QuickLogger";
import { Simulator } from "@/components/aba/Simulator";
import { Education } from "@/components/aba/Education";
import { FunctionFinder } from "@/components/aba/FunctionFinder";
import { FastTool } from "@/components/aba/FastTool";
import { Toaster } from "@/components/ui/sonner";
import { useFASessions, useLogs } from "@/lib/aba-store";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Painel — Rastreador ABC" },
      { name: "description", content: "Registre observações ABC e simule análises funcionais para prática e ensino em ABA." },
    ],
  }),
});

function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("quick");
  const { logs } = useLogs();
  const { sessions } = useFASessions();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar active={tab} onChange={setTab} />
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        {tab === "dashboard" && <Dashboard logs={logs} sessions={sessions} />}
        {tab === "quick" && <QuickLogger />}
        {tab === "logger" && <Logger />}
        {tab === "functions" && <FunctionFinder />}
        {tab === "fast" && <FastTool />}
        {tab === "simulator" && <Simulator />}
        {tab === "education" && <Education />}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
