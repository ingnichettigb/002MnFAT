import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FatState, Party } from "./fat-context";
import type { Lang } from "./i18n";

const D: Record<string, { it: string; en: string }> = {
  title: { it: "VERBALE DI COLLAUDO", en: "TEST REPORT" },
  subtitle: { it: "FACTORY ACCEPTANCE TEST", en: "FACTORY ACCEPTANCE TEST" },
  manufacturer: { it: "Ditta Produttrice", en: "Manufacturer" },
  customer: { it: "Ditta Cliente", en: "Customer" },
  testData: { it: "Dati del Collaudo", en: "Test Data" },
  attendees: { it: "Presenti al FAT", en: "FAT Attendees" },
  companyName: { it: "Ragione Sociale", en: "Company Name" },
  address: { it: "Indirizzo", en: "Address" },
  contact: { it: "Referente", en: "Contact" },
  email: { it: "Email", en: "Email" },
  phone: { it: "Telefono", en: "Phone" },
  drawingNo: { it: "N° Disegno", en: "Drawing No." },
  serialNo: { it: "N° Matricola", en: "Serial No." },
  tagNo: { it: "Tag Cliente", en: "Customer Tag" },
  commessa: { it: "Commessa", en: "Job No." },
  testDate: { it: "Data Collaudo", en: "Test Date" },
  testPlace: { it: "Luogo Collaudo", en: "Test Location" },
  descrizione: { it: "Descrizione", en: "Description" },
  attName: { it: "Nome e Cognome", en: "Full Name" },
  attRole: { it: "Ruolo / Azienda", en: "Role / Company" },
  chapter: { it: "Controllo", en: "Check" },
  outcome: { it: "Esito", en: "Outcome" },
  notes: { it: "Note / Rilievi", en: "Notes / Findings" },
  inspectorSign: { it: "Firma Ispettore", en: "Inspector Signature" },
  page: { it: "Pagina", en: "Page" },
  of: { it: "di", en: "of" },
  deviazioni: { it: "DEVIAZIONI", en: "DEVIATIONS" },
  deviazioniDesc: {
    it: "Elenco delle deviazioni rilevate durante il collaudo.",
    en: "List of deviations observed during the test.",
  },
  azioniCorrettive: { it: "AZIONI CORRETTIVE", en: "CORRECTIVE ACTIONS" },
  azioniCorrettiveDesc: {
    it: "Azioni correttive da intraprendere e relativa verifica.",
    en: "Corrective actions to be taken and related verification.",
  },
  num: { it: "N°", en: "No." },
  description: { it: "Descrizione", en: "Description" },
  responsible: { it: "Responsabile", en: "Responsible" },
  dueDate: { it: "Data prevista", en: "Due date" },
  status: { it: "Stato", en: "Status" },
  signature: { it: "Firma", en: "Signature" },
  date: { it: "Data", en: "Date" },
};

const tr = (key: keyof typeof D, lang: Lang) => D[key][lang];

const fmtDate = (iso: string, lang: Lang) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "it" ? "it-IT" : "en-GB");
};

export function generateFatPdf(state: FatState, lang: Lang = "it") {
  const { general, controls } = state;
  const selected = controls.filter((c) => c.selected);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const HEADER_H = 22; // altezza riservata all'intestazione di pagina

  // ── Helper: intestazione comune in alto su OGNI pagina ──
  const drawPageHeader = () => {
    const y = 8;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, y + HEADER_H - 4, pageW - margin, y + HEADER_H - 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.text(
      `${general.cliente.ragioneSociale || general.produttore.ragioneSociale || "—"}`,
      margin,
      y + 2,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60);
    const items: [string, string][] = [
      [tr("commessa", lang), general.commessa || "—"],
      [tr("drawingNo", lang), general.numeroDisegno || "—"],
      [tr("serialNo", lang), general.numeroMatricola || "—"],
      [tr("tagNo", lang), general.tagNumber || "—"],
      [tr("testDate", lang), fmtDate(general.dataCollaudo, lang)],
    ];
    const colW = (pageW - margin * 2) / items.length;
    items.forEach(([k, v], i) => {
      const x = margin + colW * i;
      doc.setFont("helvetica", "bold");
      doc.text(k + ":", x, y + 9);
      doc.setFont("helvetica", "normal");
      doc.text(String(v), x, y + 14, { maxWidth: colW - 2 });
    });
    doc.setTextColor(0);
  };

  // jsPDF non ha un hook nativo per "ogni nuova pagina"; applichiamo l'header
  // a tutte le pagine in chiusura. Tutto il contenuto parte sotto HEADER_H.
  const TOP = HEADER_H + 6;

  // ── PAGINA 1: dati generali ─────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(tr("title", lang), pageW / 2, TOP, { align: "center" });
  doc.setFontSize(11);
  doc.text(tr("subtitle", lang), pageW / 2, TOP + 6, { align: "center" });

  let cursorY = TOP + 12;

  const partyRows = (p: Party): [string, string][] => [
    [tr("companyName", lang), p.ragioneSociale || "—"],
    [tr("address", lang), p.indirizzo || "—"],
    [tr("contact", lang), p.referente || "—"],
    [tr("email", lang), p.email || "—"],
    [tr("phone", lang), p.telefono || "—"],
  ];

  const sectionTable = (title: string, body: any[]) => {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[title, ""]],
      body,
      styles: { fontSize: 9, cellPadding: 1.8 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { cellWidth: "auto" },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 3;
  };

  sectionTable(tr("manufacturer", lang), partyRows(general.produttore));
  sectionTable(tr("customer", lang), partyRows(general.cliente));
  sectionTable(tr("testData", lang), [
    [tr("commessa", lang), general.commessa || "—"],
    [tr("drawingNo", lang), general.numeroDisegno || "—"],
    [tr("serialNo", lang), general.numeroMatricola || "—"],
    [tr("tagNo", lang), general.tagNumber || "—"],
    [tr("testDate", lang), fmtDate(general.dataCollaudo, lang)],
    [tr("testPlace", lang), general.luogoCollaudo || "—"],
    [tr("descrizione", lang), general.descrizione || "—"],
  ]);

  const attRows = general.presenti
    .filter((a) => a.nome || a.ruolo)
    .map((a) => [a.nome || "—", a.ruolo || "—"]);
  if (attRows.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[tr("attendees", lang), ""]],
      body: [
        [
          { content: tr("attName", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: tr("attRole", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
        ] as any,
        ...attRows,
      ],
      styles: { fontSize: 9, cellPadding: 1.8 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: "auto" } },
    });
  }

  // ── Una pagina per ogni controllo selezionato ───────────
  selected.forEach((ctrl, idx) => {
    doc.addPage();

    // Titolo del controllo BEN evidenziato, appena sotto l'header
    const titleY = TOP;
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    const title = `${tr("chapter", lang)} ${idx + 1} — ${ctrl.label}`;
    doc.text(title, margin + 3, titleY + 4, { maxWidth: pageW - margin * 2 - 6 });
    doc.setTextColor(0);

    autoTable(doc, {
      startY: titleY + 14,
      margin: { left: margin, right: margin, top: TOP },
      body: [
        [tr("outcome", lang), "[ ] PASS        [ ] FAIL        [ ] N/A"],
        [tr("notes", lang), ""],
        [tr("inspectorSign", lang), ""],
      ],
      styles: { fontSize: 11, cellPadding: 3, valign: "top" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          if (data.row.index === 0) data.cell.styles.minCellHeight = 14;
          if (data.row.index === 1) data.cell.styles.minCellHeight = 150;
          if (data.row.index === 2) data.cell.styles.minCellHeight = 30;
        }
      },
      didDrawCell: (data) => {
        if (data.section === "body" && data.row.index === 1 && data.column.index === 1) {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(210);
          doc.setLineWidth(0.2);
          const step = 8;
          for (let yy = y + step; yy < y + height - 2; yy += step) {
            doc.line(x + 2, yy, x + width - 2, yy);
          }
          doc.setDrawColor(0);
        }
        if (data.section === "body" && data.row.index === 2 && data.column.index === 1) {
          const { x, y, width, height } = data.cell;
          doc.setDrawColor(120);
          doc.line(x + 4, y + height - 6, x + width - 4, y + height - 6);
          doc.setDrawColor(0);
        }
      },
    });
  });

  // ── Pagina DEVIAZIONI ───────────────────────────────────
  doc.addPage();
  {
    const titleY = TOP;
    doc.setFillColor(120, 30, 30);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    doc.text(tr("deviazioni", lang), margin + 3, titleY + 4);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(tr("deviazioniDesc", lang), margin, titleY + 14);

    const emptyRows = Array.from({ length: 10 }, (_, i) => [String(i + 1), "", "", ""]);
    autoTable(doc, {
      startY: titleY + 18,
      margin: { left: margin, right: margin, top: TOP },
      head: [[tr("num", lang), tr("description", lang), tr("notes", lang), tr("status", lang)]],
      body: emptyRows,
      styles: { fontSize: 10, cellPadding: 2.5, minCellHeight: 14, valign: "top" },
      headStyles: { fillColor: [120, 30, 30], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 90 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 30 },
      },
    });
  }

  // ── Pagina AZIONI CORRETTIVE ────────────────────────────
  doc.addPage();
  {
    const titleY = TOP;
    doc.setFillColor(30, 80, 30);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    doc.text(tr("azioniCorrettive", lang), margin + 3, titleY + 4);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(tr("azioniCorrettiveDesc", lang), margin, titleY + 14);

    const emptyRows = Array.from({ length: 10 }, (_, i) => [String(i + 1), "", "", "", ""]);
    autoTable(doc, {
      startY: titleY + 18,
      margin: { left: margin, right: margin, top: TOP },
      head: [[
        tr("num", lang),
        tr("description", lang),
        tr("responsible", lang),
        tr("dueDate", lang),
        tr("status", lang),
      ]],
      body: emptyRows,
      styles: { fontSize: 10, cellPadding: 2.5, minCellHeight: 14, valign: "top" },
      headStyles: { fillColor: [30, 80, 30], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 40 },
        3: { cellWidth: 28 },
        4: { cellWidth: 24 },
      },
    });

    // riga firma in fondo
    const fy = pageH - 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(tr("date", lang) + ":", margin, fy);
    doc.line(margin + 18, fy, margin + 70, fy);
    doc.text(tr("signature", lang) + ":", margin + 90, fy);
    doc.line(margin + 115, fy, pageW - margin, fy);
  }

  // ── Header + footer su OGNI pagina ──────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawPageHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `${tr("page", lang)} ${i} ${tr("of", lang)} ${pageCount}`,
      pageW - margin,
      pageH - 8,
      { align: "right" },
    );
    doc.setTextColor(0);
  }

  const safe = (s: string) =>
    (s || "report").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 40);
  const filename = `mini-fat_${safe(general.numeroMatricola)}_${
    general.dataCollaudo || new Date().toISOString().slice(0, 10)
  }.pdf`;

  doc.save(filename);
}
