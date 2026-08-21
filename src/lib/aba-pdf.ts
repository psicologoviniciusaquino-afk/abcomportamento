import { ABCLog, FASession, Child } from "./aba-store";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { recordPdf } from "./pdf-history";

function childName(child: Child | null | undefined, fallback = "—"): string {
  return child?.name ?? fallback;
}

const PALETTE: [number, number, number][] = [
  [38, 110, 130],
  [214, 138, 70],
  [104, 158, 100],
  [176, 88, 110],
  [120, 110, 180],
  [200, 170, 60],
  [90, 150, 170],
  [150, 120, 90],
];

function lastY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40;
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

/** Draws a pie chart with a legend using triangle approximation. */
function drawPie(
  doc: jsPDF,
  data: { label: string; value: number }[],
  cx: number,
  cy: number,
  r: number,
  title: string,
) {
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 14, cy - r - 6);

  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Sem dados suficientes.", 14, cy);
    doc.setTextColor(30, 30, 30);
    return;
  }

  let angle = -Math.PI / 2;
  data.forEach((d, i) => {
    const sweep = (d.value / total) * Math.PI * 2;
    const color = PALETTE[i % PALETTE.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.setDrawColor(color[0], color[1], color[2]);
    const steps = Math.max(2, Math.ceil((sweep / (Math.PI * 2)) * 90));
    for (let s = 0; s < steps; s++) {
      const a1 = angle + (sweep * s) / steps;
      const a2 = angle + (sweep * (s + 1)) / steps;
      doc.triangle(
        cx,
        cy,
        cx + r * Math.cos(a1),
        cy + r * Math.sin(a1),
        cx + r * Math.cos(a2),
        cy + r * Math.sin(a2),
        "F",
      );
    }
    angle += sweep;
  });

  // Legend
  let ly = cy - r;
  doc.setFontSize(8);
  data.forEach((d, i) => {
    const color = PALETTE[i % PALETTE.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(cx + r + 8, ly - 2.5, 3.5, 3.5, "F");
    doc.setTextColor(50, 50, 50);
    const pct = Math.round((d.value / total) * 100);
    const label = d.label.length > 26 ? `${d.label.slice(0, 25)}…` : d.label;
    doc.text(`${label} — ${d.value} (${pct}%)`, cx + r + 14, ly);
    ly += 5;
  });
  doc.setTextColor(30, 30, 30);
}

function countBy(logs: ABCLog[], pick: (l: ABCLog) => string | undefined | null) {
  const counts: Record<string, number> = {};
  logs.forEach((l) => {
    const key = pick(l);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
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

  const filteredLogs = selectedChild ? logs.filter((l) => l.child_id === selectedChild.id) : logs;
  const filteredSessions = selectedChild ? sessions.filter((s) => s.child_id === selectedChild.id) : sessions;

  const counts: Record<string, number> = {};
  filteredLogs.forEach((l) => {
    if (l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente") {
      counts[l.hypothesizedFunction] = (counts[l.hypothesizedFunction] ?? 0) + 1;
    }
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const pending = filteredLogs.filter((l) => !l.hypothesizedFunction || l.hypothesizedFunction === "Pendente").length;

  // Group by patient
  const groups = new Map<string, ABCLog[]>();
  filteredLogs.forEach((l) => {
    const name = childName(l.child_id ? childMap.get(l.child_id) : undefined, l.childName ?? "Sem paciente");
    const arr = groups.get(name) ?? [];
    arr.push(l);
    groups.set(name, arr);
  });
  const groupNames = [...groups.keys()].sort((a, b) => a.localeCompare(b, "pt-BR"));

  doc.setFontSize(13);
  doc.text("Resumo Clínico", 14, 40);
  doc.setFontSize(10);
  doc.text(`Paciente: ${childName(selectedChild, "Todos os pacientes")}`, 14, 48);
  doc.text(`Pacientes no relatório: ${groupNames.length}`, 14, 54);
  doc.text(`Total de comportamentos registrados: ${filteredLogs.length}`, 14, 60);
  doc.text(`Função mais frequente: ${top}`, 14, 66);
  doc.text(`Hipóteses pendentes: ${pending}`, 14, 72);

  let cursor = 84;

  // --- One section per patient ---
  groupNames.forEach((name, idx) => {
    const list = groups.get(name)!;
    if (idx > 0) doc.addPage();
    const startY = idx === 0 ? cursor : 20;

    doc.setFontSize(13);
    doc.text(`Paciente: ${name}`, 14, startY);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${list.length} registro(s)`, 14, startY + 5);
    doc.setTextColor(30, 30, 30);

    autoTable(doc, {
      startY: startY + 9,
      head: [["Data/Hora", "Alvo", "Fase", "Ambiente", "Antecedente", "Comportamento", "Consequência", "Sev.", "Função"]],
      body: list.map((l) => [
        new Date(l.timestamp).toLocaleString("pt-BR"),
        l.targetBehavior ?? "—",
        l.phase === "intervention" ? "Intervenção" : l.phase === "baseline" ? "Linha de Base" : "—",
        [l.environmentTags?.join(", "), l.environmentNotes].filter(Boolean).join(" — ") || "—",
        [l.antecedent, l.antecedentTags.join(", ")].filter(Boolean).join(" — "),
        l.behavior,
        [l.consequence, l.consequenceTags.join(", ")].filter(Boolean).join(" — "),
        String(l.severity),
        l.hypothesizedFunction ?? "Pendente",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [38, 110, 130], textColor: 255 },
      columnStyles: { 0: { cellWidth: 22 }, 7: { cellWidth: 9, halign: "center" } },
    });

    // Baseline vs Intervention for this patient
    const baseline = list.filter((l) => l.phase === "baseline");
    const intervention = list.filter((l) => l.phase === "intervention");
    let y = ensureSpace(doc, lastY(doc) + 10, 40);
    doc.setFontSize(11);
    doc.text("Comparativo Baseline vs Intervenção", 14, y);

    autoTable(doc, {
      startY: y + 4,
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

    // Pie of functions for this patient
    const fnData = countBy(list, (l) =>
      l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente" ? l.hypothesizedFunction : "Pendente",
    );
    y = lastY(doc) + 30;
    if (y + 35 > 280) {
      doc.addPage();
      y = 50;
    }
    drawPie(doc, fnData, 45, y, 22, `Funções — ${name}`);
    cursor = y + 40;
  });

  if (groupNames.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Nenhum registro ABC no período.", 14, cursor);
    doc.setTextColor(30, 30, 30);
  }

  // --- FA Sessions ---
  doc.addPage();
  doc.setFontSize(13);
  doc.text("Sessões de Análise Funcional", 14, 20);

  const grouped: Record<string, { dur: number; freq: number; n: number }> = {};
  filteredSessions.forEach((s) => {
    if (!grouped[s.condition]) grouped[s.condition] = { dur: 0, freq: 0, n: 0 };
    grouped[s.condition].dur += s.durationMin;
    grouped[s.condition].freq += s.frequency;
    grouped[s.condition].n += 1;
  });

  autoTable(doc, {
    startY: 24,
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

  // --- Final charts page ---
  doc.addPage();
  doc.setFontSize(14);
  doc.text("Síntese Gráfica", 14, 20);

  drawPie(
    doc,
    countBy(filteredLogs, (l) =>
      l.hypothesizedFunction && l.hypothesizedFunction !== "Pendente" ? l.hypothesizedFunction : "Pendente",
    ),
    45,
    55,
    26,
    "Distribuição por função",
  );

  drawPie(doc, countBy(filteredLogs, (l) => l.behavior || "—").slice(0, 8), 45, 130, 26, "Distribuição por comportamento");

  drawPie(
    doc,
    groupNames.map((n) => ({ label: n, value: groups.get(n)!.length })),
    45,
    205,
    26,
    "Registros por paciente",
  );

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Página ${i} de ${pageCount} • Rastreador ABC & Simulador FA`, 14, 290);
  }

  const fileName = `relatorio-aba-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);

  recordPdf({
    fileName,
    childName: childName(selectedChild, "Todos os pacientes"),
    logs: filteredLogs.length,
    sessions: filteredSessions.length,
  });
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
