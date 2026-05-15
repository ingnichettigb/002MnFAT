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
  field: { it: "Campo", en: "Field" },
  value: { it: "Valore", en: "Value" },
  companyName: { it: "Ragione Sociale", en: "Company Name" },
  address: { it: "Indirizzo", en: "Address" },
  contact: { it: "Referente", en: "Contact" },
  email: { it: "Email", en: "Email" },
  phone: { it: "Telefono", en: "Phone" },
  drawingNo: { it: "N° Disegno / Specifica", en: "Drawing No." },
  serialNo: { it: "N° Fabbrica / Matricola", en: "Serial No." },
  tagNo: { it: "Tag Number Cliente", en: "Customer Tag No." },
  testDate: { it: "Data Collaudo", en: "Test Date" },
  testPlace: { it: "Luogo Collaudo", en: "Test Location" },
  attName: { it: "Nome e Cognome", en: "Full Name" },
  attRole: { it: "Ruolo / Azienda", en: "Role / Company" },
  signatures: { it: "FIRME", en: "SIGNATURES" },
  forManufacturer: { it: "Per il Costruttore", en: "For the Manufacturer" },
  forCustomer: { it: "Per il Cliente", en: "For the Customer" },
  signName: { it: "Nome e Cognome:", en: "Full Name:" },
  signDate: { it: "Data:", en: "Date:" },
  signSignature: { it: "Firma:", en: "Signature:" },
  chapter: { it: "Controllo", en: "Check" },
  outcome: { it: "Esito", en: "Outcome" },
  notes: { it: "Note / Rilievi", en: "Notes / Findings" },
  inspectorSign: { it: "Firma Ispettore", en: "Inspector Signature" },
  page: { it: "Pagina", en: "Page" },
  of: { it: "di", en: "of" },
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

  // ── Title ───────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(tr("title", lang), pageW / 2, 22, { align: "center" });
  doc.setFontSize(13);
  doc.text(tr("subtitle", lang), pageW / 2, 30, { align: "center" });
  doc.setDrawColor(150);
  doc.line(margin, 34, pageW - margin, 34);

  let cursorY = 40;

  // ── Party tables (Manufacturer / Customer) side by side via two passes ──
  const partyRows = (p: Party): [string, string][] => [
    [tr("companyName", lang), p.ragioneSociale || "—"],
    [tr("address", lang), p.indirizzo || "—"],
    [tr("contact", lang), p.referente || "—"],
    [tr("email", lang), p.email || "—"],
    [tr("phone", lang), p.telefono || "—"],
  ];

  // Manufacturer
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [[tr("manufacturer", lang), ""]],
    body: partyRows(general.produttore),
    styles: { fontSize: 10, cellPadding: 2.2 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: "auto" },
    },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 4;

  // Customer
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [[tr("customer", lang), ""]],
    body: partyRows(general.cliente),
    styles: { fontSize: 10, cellPadding: 2.2 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45 },
      1: { cellWidth: "auto" },
    },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 4;

  // Common test data
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [[tr("testData", lang), ""]],
    body: [
      [tr("drawingNo", lang), general.numeroDisegno || "—"],
      [tr("serialNo", lang), general.numeroMatricola || "—"],
      [tr("tagNo", lang), general.tagNumber || "—"],
      [tr("testDate", lang), fmtDate(general.dataCollaudo, lang)],
      [tr("testPlace", lang), general.luogoCollaudo || "—"],
    ],
    styles: { fontSize: 10, cellPadding: 2.2 },
    headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: "auto" },
    },
  });
  cursorY = (doc as any).lastAutoTable.finalY + 4;

  // Attendees
  const attRows = general.presenti
    .filter((a) => a.nome || a.ruolo)
    .map((a) => [a.nome || "—", a.ruolo || "—"]);
  if (attRows.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [[tr("attendees", lang), ""]],
      body: [
        [
          { content: tr("attName", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: tr("attRole", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
        ] as any,
        ...attRows,
      ],
      styles: { fontSize: 10, cellPadding: 2.2 },
      headStyles: { fillColor: [40, 40, 40], textColor: 255, halign: "left" },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: "auto" },
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 4;
  }

  // Signatures: ensure room — if not enough, new page
  const SIGN_BLOCK_H = 50;
  if (cursorY + SIGN_BLOCK_H > pageH - 18) {
    doc.addPage();
    cursorY = margin + 5;
  }
  const signY = cursorY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(tr("signatures", lang), pageW / 2, signY, { align: "center" });

  const colW = (pageW - margin * 2 - 10) / 2;
  const drawSignBlock = (x: number, title: string, top: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, x, top);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(tr("signName", lang), x, top + 8);
    doc.line(x + 38, top + 8, x + colW, top + 8);
    doc.text(tr("signDate", lang), x, top + 18);
    doc.line(x + 38, top + 18, x + colW, top + 18);
    doc.text(tr("signSignature", lang), x, top + 32);
    doc.line(x + 38, top + 32, x + colW, top + 32);
  };
  drawSignBlock(margin, tr("forManufacturer", lang), signY + 8);
  drawSignBlock(margin + colW + 10, tr("forCustomer", lang), signY + 8);

  // ── Chapters ────────────────────────────────────────────
  selected.forEach((ctrl, idx) => {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const title = `${tr("chapter", lang)} ${idx + 1}: ${ctrl.label}`;
    const wrapped = doc.splitTextToSize(title, pageW - margin * 2);
    doc.text(wrapped, margin, 25);

    const startY = 25 + wrapped.length * 7 + 5;

    autoTable(doc, {
      startY,
      margin: { left: margin, right: margin },
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
          if (data.row.index === 1) data.cell.styles.minCellHeight = 110;
          if (data.row.index === 2) data.cell.styles.minCellHeight = 25;
        }
      },
      didDrawCell: (data) => {
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

  // ── Footer ──────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    const left = `${general.cliente.ragioneSociale || ""}${
      general.numeroMatricola ? " — " + tr("serialNo", lang) + " " + general.numeroMatricola : ""
    }${general.tagNumber ? " — Tag " + general.tagNumber : ""}`;
    doc.text(left, margin, pageH - 8);
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
