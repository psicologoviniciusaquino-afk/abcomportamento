import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sidebar, TabKey } from "@/components/aba/Sidebar";
import { Dashboard } from "@/components/aba/Dashboard";
import { Logger } from "@/components/aba/Logger";
import { Simulator } from "@/components/aba/Simulator";
import { Education } from "@/components/aba/Education";
import { Toaster } from "@/components/ui/sonner";
import { useFASessions, useLogs } from "@/lib/aba-store";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ABC Behavior Tracker & FA Simulator" },
      { name: "description", content: "Log ABC observations and run simulated functional analyses for ABA practice and training." },
    ],
  }),
});

function Index() {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { logs } = useLogs();
  const { sessions } = useFASessions();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar active={tab} onChange={setTab} />
      <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        {tab === "dashboard" && <Dashboard logs={logs} sessions={sessions} />}
        {tab === "logger" && <Logger />}
        {tab === "simulator" && <Simulator />}
        {tab === "education" && <Education />}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
