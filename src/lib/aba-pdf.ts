import { ABCLog, FASession } from "./aba-store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPdf(logs: ABCLog[], sessions: FASession[]) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");

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
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const pending = logs.filter((l) => !l.hypothesizedFunction || l.hypothesizedFunction === "Pendente").length;

  doc.setFontSize(13);
  doc.text("Resumo Clínico", 14, 40);
  doc.setFontSize(10);
  doc.text(`Total de comportamentos registrados: ${logs.length}`, 14, 48);
  doc.text(`Função mais frequente: ${top}`, 14, 54);
  doc.text(`Hipóteses pendentes: ${pending}`, 14, 60);

  // ABC logs table
  doc.setFontSize(13);
  doc.text("Registros ABC", 14, 72);
  autoTable(doc, {
    startY: 76,
    head: [["Data/Hora", "Antecedente", "Comportamento", "Consequência", "Sev.", "Função"]],
    body: logs.map((l) => [
      new Date(l.timestamp).toLocaleString("pt-BR"),
      [l.antecedent, l.antecedentTags.join(", ")].filter(Boolean).join(" — "),
      l.behavior,
      [l.consequence, l.consequenceTags.join(", ")].filter(Boolean).join(" — "),
      String(l.severity),
      l.hypothesizedFunction ?? "Pendente",
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [38, 110, 130], textColor: 255 },
    columnStyles: { 0: { cellWidth: 28 }, 4: { cellWidth: 10, halign: "center" } },
  });

  // FA Sessions
  const after = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.text("Sessões de Análise Funcional", 14, after);

  const grouped: Record<string, { dur: number; freq: number; n: number }> = {};
  sessions.forEach((s) => {
    if (!grouped[s.condition]) grouped[s.condition] = { dur: 0, freq: 0, n: 0 };
    grouped[s.condition].dur += s.durationMin;
    grouped[s.condition].freq += s.frequency;
    grouped[s.condition].n += 1;
  });

  autoTable(doc, {
    startY: after + 4,
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
