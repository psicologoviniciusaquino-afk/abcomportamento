import { useEffect, useState } from "react";

export interface PdfHistoryEntry {
  id: string;
  fileName: string;
  createdAt: string;
  childName: string;
  logs: number;
  sessions: number;
}

const KEY = "aba_pdf_history";
const EVENT = "aba_pdf_history_change";

function read(): PdfHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PdfHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: PdfHistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 50)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function recordPdf(entry: Omit<PdfHistoryEntry, "id" | "createdAt">) {
  const full: PdfHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  write([full, ...read()]);
}

export function clearPdfHistory() {
  write([]);
}

export function usePdfHistory() {
  const [entries, setEntries] = useState<PdfHistoryEntry[]>([]);

  useEffect(() => {
    const sync = () => setEntries(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { entries, clear: clearPdfHistory };
}
