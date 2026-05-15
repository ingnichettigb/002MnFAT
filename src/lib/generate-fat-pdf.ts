import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FatState } from "./fat-context";

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("it-IT");
};

export function generateFatPdf(state: FatState) {
  const { general, controls } = state;
  const selected = controls.filter((c) => c.selected);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ── Frontespizio ────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VERBALE DI COLLAUDO", pageW / 2, 30, { align: "center" });
  doc.setFontSize(13);
  doc.text("FACTORY ACCEPTANCE TEST", pageW / 2, 38, { align: "center" });

  doc.setDrawColor(150);
  doc.line(margin, 44, pageW - margin, 44);

  autoTable(doc, {
    startY: 55,
    margin: { left: margin, right: margin },
    head: [["Campo", "Valore"]],
    body: [
      ["Ragione Sociale Cliente", general.ragioneSociale || "—"],
      ["Compilatore / Ispettore", general.compilatore || "—"],
      ["Data del Collaudo", fmtDate(general.dataCollaudo)],
      ["Luogo del Collaudo", general.luogoCollaudo || "—"],
      ["N° Disegno / Specifica", general.numeroDisegno || "—"],
      ["N° Fabbrica / Matricola", general.numeroMatricola || "—"],
      ["Numero Controlli Eseguiti", String(selected.length)],
    ],
    styles: { fontSize: 11, cellPadding: 3 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 65 },
      1: { cellWidth: "auto" },
    },
  });

  // Firme in fondo al frontespizio
  const signY = pageH - 55;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FIRME", pageW / 2, signY - 6, { align: "center" });

  const colW = (pageW - margin * 2 - 10) / 2;
  const drawSignBlock = (x: number, title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, x, signY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Nome e Cognome:", x, signY + 8);
    doc.line(x + 35, signY + 8, x + colW, signY + 8);
    doc.text("Data:", x, signY + 18);
    doc.line(x + 35, signY + 18, x + colW, signY + 18);
    doc.text("Firma:", x, signY + 32);
    doc.line(x + 35, signY + 32, x + colW, signY + 32);
  };
  drawSignBlock(margin, "Per il Costruttore");
  drawSignBlock(margin + colW + 10, "Per il Cliente");

  // ── Capitoli per ogni controllo selezionato ────────────────
  selected.forEach((ctrl, idx) => {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const title = `Controllo ${idx + 1}: ${ctrl.label}`;
    const wrapped = doc.splitTextToSize(title, pageW - margin * 2);
    doc.text(wrapped, margin, 25);

    const startY = 25 + wrapped.length * 7 + 5;

    autoTable(doc, {
      startY,
      margin: { left: margin, right: margin },
      body: [
        ["Esito", "[ ] PASS        [ ] FAIL        [ ] N/A"],
        ["Note / Rilievi", ""],
        ["Firma Ispettore", ""],
      ],
      styles: { fontSize: 11, cellPadding: 3, valign: "top" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          if (data.row.index === 0) data.cell.styles.minCellHeight = 14;
          if (data.row.index === 1) data.cell.styles.minCellHeight = 110;
          if (data.row.index === 2) data.cell.styles.minCellHeight = 25;
        }
      },
      didDrawCell: (data) => {
        // Righe orizzontali nella cella "Note / Rilievi"
        if (
          data.section === "body" &&
          data.row.index === 1 &&
          data.column.index === 1
        ) {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(210);
          doc.setLineWidth(0.2);
          const step = 8;
          for (let yy = y + step; yy < y + height - 2; yy += step) {
            doc.line(x + 2, yy, x + width - 2, yy);
          }
          doc.setDrawColor(0);
        }
        // Linea per la firma
        if (
          data.section === "body" &&
          data.row.index === 2 &&
          data.column.index === 1
        ) {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(120);
          doc.line(x + 4, y + height - 6, x + width - 4, y + height - 6);
          doc.setDrawColor(0);
        }
      },
    });
  });

  // ── Footer su tutte le pagine ──────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    const left = `${general.ragioneSociale || ""}${
      general.numeroMatricola ? " — Matr. " + general.numeroMatricola : ""
    }`;
    doc.text(left, margin, pageH - 8);
    doc.text(`Pagina ${i} di ${pageCount}`, pageW - margin, pageH - 8, {
      align: "right",
    });
    doc.setTextColor(0);
  }

  const safe = (s: string) =>
    (s || "report").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 40);
  const filename = `mini-fat_${safe(general.numeroMatricola)}_${
    general.dataCollaudo || new Date().toISOString().slice(0, 10)
  }.pdf`;

  doc.save(filename);
}
