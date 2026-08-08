import { ABCLog, FASession, Child } from "./aba-store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function childName(child: Child | null | undefined, fallback = "—"): string {
  return child?.name ?? fallback;
}

export function exportPdf(
  logs: ABCLog[],
  sessions: FASession[],
  children: Child[] = [],
  selectedChild?: Child | null,
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");
  const childMap = new Map(children.map((c) => [c.id, c]));

  // Header
  doc.setFillColor(38, 110, 130);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("Relatório ABC & Análise Funcional", 14, 13);
  doc.setFontSize(10);
  doc.text(`Gerado em ${now}`, 14, 21);

  doc.setTextColor(30, 30, 30);

  // Summary
  const filteredLogs = selectedChild ? logs.filter((l) => l.child_id === selectedChild.id) : logs;
  const counts: Record<string, number> = {};
  filteredLogs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const pending = filteredLogs.filter((l) => !l.hypothesizedFunction || l.hypothesizedFunction === "Pendente").length;

  doc.setFontSize(13);
  doc.text("Resumo Clínico", 14, 40);
  doc.setFontSize(10);
  doc.text(`Paciente: ${childName(selectedChild, "Todos os pacientes")}`, 14, 48);
  doc.text(`Total de comportamentos registrados: ${filteredLogs.length}`, 14, 54);
  doc.text(`Função mais frequente: ${top}`, 14, 60);
  doc.text(`Hipóteses pendentes: ${pending}`, 14, 66);

  // ABC logs table
  doc.setFontSize(13);
  doc.text("Registros ABC", 14, 78);
  autoTable(doc, {
    startY: 82,
    head: [["Data/Hora", "Criança", "Alvo", "Fase", "Ambiente", "Antecedente", "Comportamento", "Consequência", "Sev.", "Função"]],
    body: filteredLogs.map((l) => {
      const child = l.child_id ? childMap.get(l.child_id) : undefined;
      return [
        new Date(l.timestamp).toLocaleString("pt-BR"),
        childName(child),
        l.targetBehavior ?? "—",
        l.phase === "intervention" ? "Intervenção" : l.phase === "baseline" ? "Linha de Base" : "—",
        [l.environmentTags?.join(", "), l.environmentNotes].filter(Boolean).join(" — ") || "—",
        [l.antecedent, l.antecedentTags.join(", ")].filter(Boolean).join(" — "),
        l.behavior,
        [l.consequence, l.consequenceTags.join(", ")].filter(Boolean).join(" — "),
        String(l.severity),
        l.hypothesizedFunction ?? "Pendente",
      ];
    }),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [38, 110, 130], textColor: 255 },
    columnStyles: { 0: { cellWidth: 22 }, 8: { cellWidth: 9, halign: "center" } },
  });

  // Baseline vs Intervention comparison
  const baseline = filteredLogs.filter((l) => l.phase === "baseline");
  const intervention = filteredLogs.filter((l) => l.phase === "intervention");
  const afterAbc = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text("Comparativo Baseline vs Intervenção", 14, afterAbc);

  autoTable(doc, {
    startY: afterAbc + 4,
    head: [["Fase", "Registros", "Sev. Média", "Top Antecedente", "Top Consequência", "Hipótese"]],
    body: [
      [
        "Linha de Base",
        String(baseline.length),
        baseline.length ? (baseline.reduce((a, l) => a + l.severity, 0) / baseline.length).toFixed(1) : "—",
        topTag(baseline, "antecedentTags"),
        topTag(baseline, "consequenceTags"),
        topFunction(baseline),
      ],
      [
        "Intervenção",
        String(intervention.length),
        intervention.length ? (intervention.reduce((a, l) => a + l.severity, 0) / intervention.length).toFixed(1) : "—",
        topTag(intervention, "antecedentTags"),
        topTag(intervention, "consequenceTags"),
        topFunction(intervention),
      ],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [38, 110, 130], textColor: 255 },
  });

  // FA Sessions
  const filteredSessions = selectedChild ? sessions.filter((s) => s.child_id === selectedChild.id) : sessions;
  const afterComp = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text("Sessões de Análise Funcional", 14, afterComp);

  const grouped: Record<string, { dur: number; freq: number; n: number }> = {};
  filteredSessions.forEach((s) => {
    if (!grouped[s.condition]) grouped[s.condition] = { dur: 0, freq: 0, n: 0 };
    grouped[s.condition].dur += s.durationMin;
    grouped[s.condition].freq += s.frequency;
    grouped[s.condition].n += 1;
  });

  autoTable(doc, {
    startY: afterComp + 4,
    head: [["Condição", "Sessões", "Duração total (min)", "Respostas", "Taxa (resp/min)"]],
    body: ["Atenção", "Demanda", "Tangível", "Brincar"].map((label, i) => {
      const key = (["Attention", "Demand", "Tangible", "Play"] as const)[i];
      const g = grouped[key];
      return [
        label,
        String(g?.n ?? 0),
        String(g?.dur ?? 0),
        String(g?.freq ?? 0),
        g && g.dur > 0 ? (g.freq / g.dur).toFixed(2) : "—",
      ];
    }),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [38, 110, 130], textColor: 255 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Página ${i} de ${pageCount} • Rastreador ABC & Simulador FA`, 14, 290);
  }

  doc.save(`relatorio-aba-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function topTag(logs: ABCLog[], key: "antecedentTags" | "consequenceTags"): string {
  const counts: Record<string, number> = {};
  logs.forEach((l) => l[key].forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "—";
}

function topFunction(logs: ABCLog[]): string {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "Pendente";
}
