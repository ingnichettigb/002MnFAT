import jsPDF from "jspdf";
import * as JsPdfNS from "jspdf";
import autoTable from "jspdf-autotable";
// TextField (AcroForm) è esportato a runtime da jspdf ma non è tipizzato.
const TextField: any = (JsPdfNS as any).TextField;
import type { FatState, Party } from "./fat-context";
import type { Lang } from "./i18n";

const D = {
  title: { it: "VERBALE DI COLLAUDO", en: "TEST REPORT", de: "PRÜFBERICHT", es: "INFORME DE PRUEBA" },
  subtitle: { it: "FACTORY ACCEPTANCE TEST", en: "FACTORY ACCEPTANCE TEST", de: "FACTORY ACCEPTANCE TEST", es: "FACTORY ACCEPTANCE TEST" },
  manufacturer: { it: "Ditta Produttrice", en: "Manufacturer", de: "Hersteller", es: "Fabricante" },
  customer: { it: "Ditta Cliente", en: "Customer", de: "Kunde", es: "Cliente" },
  testData: { it: "Dati del Collaudo", en: "Test Data", de: "Prüfdaten", es: "Datos de la prueba" },
  attendees: { it: "Presenti al FAT", en: "FAT Attendees", de: "FAT-Teilnehmer", es: "Asistentes al FAT" },
  companyName: { it: "Ragione Sociale", en: "Company Name", de: "Firmenname", es: "Razón social" },
  address: { it: "Indirizzo", en: "Address", de: "Adresse", es: "Dirección" },
  contact: { it: "Referente", en: "Contact", de: "Ansprechpartner", es: "Contacto" },
  email: { it: "Email", en: "Email", de: "E-Mail", es: "Correo" },
  phone: { it: "Telefono", en: "Phone", de: "Telefon", es: "Teléfono" },
  drawingNo: { it: "N° Disegno", en: "Drawing No.", de: "Zeichnungsnr.", es: "N.º Plano" },
  serialNo: { it: "N° Matricola", en: "Serial No.", de: "Seriennr.", es: "N.º de serie" },
  tagNo: { it: "Tag Cliente", en: "Customer Tag", de: "Kunden-Tag", es: "Tag Cliente" },
  commessa: { it: "Commessa", en: "Job No.", de: "Auftragsnr.", es: "N.º Pedido" },
  testDate: { it: "Data Collaudo", en: "Test Date", de: "Prüfdatum", es: "Fecha Prueba" },
  testPlace: { it: "Luogo Collaudo", en: "Test Location", de: "Prüfort", es: "Lugar Prueba" },
  descrizione: { it: "Descrizione", en: "Description", de: "Beschreibung", es: "Descripción" },
  attName: { it: "Nome e Cognome", en: "Full Name", de: "Name", es: "Nombre y Apellido" },
  attRole: { it: "Ruolo", en: "Role", de: "Rolle", es: "Rol" },
  attCompany: { it: "Azienda", en: "Company", de: "Firma", es: "Empresa" },
  chapter: { it: "Controllo", en: "Check", de: "Prüfung", es: "Control" },
  outcome: { it: "Esito", en: "Outcome", de: "Ergebnis", es: "Resultado" },
  notes: { it: "Note / Rilievi", en: "Notes / Findings", de: "Anmerkungen", es: "Notas / Observaciones" },
  inspectorSign: { it: "Firma Ispettore", en: "Inspector Signature", de: "Unterschrift Prüfer", es: "Firma Inspector" },
  page: { it: "Pagina", en: "Page", de: "Seite", es: "Página" },
  of: { it: "di", en: "of", de: "von", es: "de" },
  deviazioni: { it: "DEVIAZIONI", en: "DEVIATIONS", de: "ABWEICHUNGEN", es: "DESVIACIONES" },
  deviazioniDesc: {
    it: "Elenco delle deviazioni rilevate durante il collaudo.",
    en: "List of deviations observed during the test.",
    de: "Liste der während der Prüfung festgestellten Abweichungen.",
    es: "Lista de las desviaciones detectadas durante la prueba.",
  },
  azioniCorrettive: { it: "AZIONI CORRETTIVE", en: "CORRECTIVE ACTIONS", de: "KORREKTURMASSNAHMEN", es: "ACCIONES CORRECTIVAS" },
  azioniCorrettiveDesc: {
    it: "Azioni correttive da intraprendere e relativa verifica.",
    en: "Corrective actions to be taken and related verification.",
    de: "Zu ergreifende Korrekturmaßnahmen und zugehörige Überprüfung.",
    es: "Acciones correctivas a tomar y verificación correspondiente.",
  },
  num: { it: "N°", en: "No.", de: "Nr.", es: "N.º" },
  description: { it: "Descrizione", en: "Description", de: "Beschreibung", es: "Descripción" },
  responsible: { it: "Responsabile", en: "Responsible", de: "Verantwortlich", es: "Responsable" },
  dueDate: { it: "Data prevista", en: "Due date", de: "Fälligkeitsdatum", es: "Fecha prevista" },
  status: { it: "Stato", en: "Status", de: "Status", es: "Estado" },
  signature: { it: "Firma", en: "Signature", de: "Unterschrift", es: "Firma" },
  date: { it: "Data", en: "Date", de: "Datum", es: "Fecha" },
} as const;

type DKey = keyof typeof D;

/**
 * Etichetta bilingue. Regola:
 *  - lang === "en"  → "EN / IT"
 *  - altrimenti     → "<lang> / EN"
 * Se le due stringhe coincidono mostra una sola volta.
 */
const blGlobal = (key: DKey, lang: Lang, secondary?: Lang | null): string => {
  const p = D[key][lang];
  const s = secondary
    ? D[key][secondary]
    : lang === "en"
      ? D[key].it
      : D[key].en;
  if (p === s) return p;
  return `${p} / ${s}`;
};

const fmtDate = (iso: string, lang: Lang) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const loc =
    lang === "it" ? "it-IT" : lang === "de" ? "de-DE" : lang === "es" ? "es-ES" : "en-GB";
  return d.toLocaleDateString(loc);
};

export function generateFatPdf(
  state: FatState,
  lang: Lang = "it",
  secondary: Lang | null = null,
) {
  const { general, controls } = state;
  const selected = controls.filter((c) => c.selected);
  // Shadow del bl() globale per includere la secondaria scelta dall'utente
  const bl = (key: DKey, _l?: Lang) => blGlobal(key, lang, secondary);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Helvetica nei PDF è metricamente equivalente ad Arial e viene
  // visualizzato come Arial nei lettori principali.
  doc.setFont("helvetica", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const HEADER_H = 26;

  // Counter per nomi univoci di field
  let fieldSeq = 0;
  const uid = (s: string) => `${s}_${++fieldSeq}`;

  /** Crea un TextField AcroForm posizionato in mm. */
  const addField = (opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    value?: string;
    name: string;
    multiline?: boolean;
    fontSize?: number;
  }) => {
    const f = new TextField();
    f.Rect = [opts.x, opts.y, opts.w, opts.h];
    f.value = opts.value ?? "";
    f.fontName = "helvetica";
    f.fontSize = opts.fontSize ?? 12;
    f.T = uid(opts.name);
    if (opts.multiline) f.multiline = true;
    doc.addField(f);
  };

  // ── Intestazione comune (senza nome cliente) ────────────
  const drawPageHeader = () => {
    const y = 8;
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, y + HEADER_H - 4, pageW - margin, y + HEADER_H - 4);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60);
    const items: [string, string][] = [
      [bl("commessa", lang), general.commessa || ""],
      [bl("drawingNo", lang), general.numeroDisegno || ""],
      [bl("serialNo", lang), general.numeroMatricola || ""],
      [bl("tagNo", lang), general.tagNumber || ""],
      [bl("testDate", lang), fmtDate(general.dataCollaudo, lang)],
    ];
    const colW = (pageW - margin * 2) / items.length;
    items.forEach(([k, v], i) => {
      const x = margin + colW * i;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(k + ":", x, y + 6, { maxWidth: colW - 2 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(String(v), x, y + 16, { maxWidth: colW - 2 });
    });
    doc.setTextColor(0);
  };

  // Lascia spazio sufficiente tra l'header e il titolo del documento
  const TOP = HEADER_H + 14;

  // ── PAGINA 1: dati generali ─────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(bl("title", lang), pageW / 2, TOP, { align: "center" });
  doc.setFontSize(12);
  doc.text(bl("subtitle", lang), pageW / 2, TOP + 7, { align: "center" });

  let cursorY = TOP + 14;

  /** Tabella con cella-valore editabile (campo AcroForm). */
  const partyTable = (title: string, p: Party, namePrefix: string) => {
    const rows: Array<{ label: string; value: string; key: string }> = [
      { label: bl("companyName", lang), value: p.ragioneSociale, key: "rag" },
      { label: bl("address", lang), value: p.indirizzo, key: "ind" },
      { label: bl("contact", lang), value: p.referente, key: "ref" },
      { label: bl("email", lang), value: p.email, key: "email" },
      { label: bl("phone", lang), value: p.telefono, key: "tel" },
    ];

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[title, ""]],
      body: rows.map((r) => [r.label, ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2 },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 12,
        fillColor: [40, 40, 40],
        textColor: 255,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index !== 1) return;
        const r = rows[data.row.index];
        if (!r) return;
        const { x, y, width, height } = data.cell;
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          value: r.value || "",
          name: `${namePrefix}_${r.key}`,
        });
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 3;
  };

  partyTable(bl("manufacturer", lang), general.produttore, "mfg");
  partyTable(bl("customer", lang), general.cliente, "cli");

  // ── Test data ──
  {
    const rows: Array<{ label: string; value: string; key: string; multi?: boolean; minH?: number }> = [
      { label: bl("commessa", lang), value: general.commessa, key: "commessa" },
      { label: bl("drawingNo", lang), value: general.numeroDisegno, key: "drawing" },
      { label: bl("serialNo", lang), value: general.numeroMatricola, key: "serial" },
      { label: bl("tagNo", lang), value: general.tagNumber, key: "tag" },
      { label: bl("testDate", lang), value: fmtDate(general.dataCollaudo, lang), key: "date" },
      { label: bl("testPlace", lang), value: general.luogoCollaudo, key: "place" },
      { label: bl("descrizione", lang), value: general.descrizione, key: "desc", multi: true, minH: 18 },
    ];
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[bl("testData", lang), ""]],
      body: rows.map((r) => [r.label, ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2 },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 12,
        fillColor: [40, 40, 40],
        textColor: 255,
        halign: "left",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70 },
        1: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const r = rows[data.row.index];
          if (r?.minH) data.cell.styles.minCellHeight = r.minH;
        }
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index !== 1) return;
        const r = rows[data.row.index];
        if (!r) return;
        const { x, y, width, height } = data.cell;
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          value: r.value || "",
          name: `td_${r.key}`,
          multiline: r.multi,
        });
      },
    });
    cursorY = (doc as any).lastAutoTable.finalY + 3;
  }

  // ── Attendees ──
  {
    // Sempre almeno 5 righe per scrivere a mano altri presenti
    const baseRows = general.presenti.map((a) => ({
      nome: a.nome || "",
      ruolo: a.ruolo || "",
      azienda: a.azienda || "",
    }));
    while (baseRows.length < 5) baseRows.push({ nome: "", ruolo: "", azienda: "" });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[bl("attendees", lang), "", ""]],
      body: [
        [
          { content: bl("attName", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: bl("attRole", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          { content: bl("attCompany", lang), styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
        ] as any,
        ...baseRows.map(() => ["", "", ""]),
      ],
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2, minCellHeight: 9 },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 12,
        fillColor: [40, 40, 40],
        textColor: 255,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 50 },
        2: { cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.row.index === 0) return;
        const dataRowIdx = data.row.index - 1; // riga 0 è l'header bilingue
        const row = baseRows[dataRowIdx];
        if (!row) return;
        const fields = ["nome", "ruolo", "azienda"] as const;
        const key = fields[data.column.index];
        const { x, y, width, height } = data.cell;
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          value: row[key],
          name: `att_${dataRowIdx}_${key}`,
        });
      },
    });
  }

  // ── Pagina per ogni controllo selezionato ───────────────
  selected.forEach((ctrl, idx) => {
    doc.addPage();

    const titleY = TOP;
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    const title = `${bl("chapter", lang)} ${idx + 1} — ${ctrl.label}`;
    doc.text(title, margin + 3, titleY + 4, { maxWidth: pageW - margin * 2 - 6 });
    doc.setTextColor(0);

    autoTable(doc, {
      startY: titleY + 14,
      margin: { left: margin, right: margin, top: TOP },
      body: [
        [bl("outcome", lang), ""],
        [bl("notes", lang), ""],
        [bl("inspectorSign", lang), ""],
      ],
      styles: { font: "helvetica", fontSize: 12, cellPadding: 3, valign: "top" },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [240, 240, 240] },
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
        if (data.section !== "body" || data.column.index !== 1) return;
        const { x, y, width, height } = data.cell;
        if (data.row.index === 0) {
          addField({
            x: x + 0.5,
            y: y + 0.5,
            w: width - 1,
            h: height - 1,
            name: `ctrl_${idx}_outcome`,
            value: "",
          });
        } else if (data.row.index === 1) {
          addField({
            x: x + 0.5,
            y: y + 0.5,
            w: width - 1,
            h: height - 1,
            name: `ctrl_${idx}_notes`,
            value: "",
            multiline: true,
          });
        } else if (data.row.index === 2) {
          addField({
            x: x + 0.5,
            y: y + 0.5,
            w: width - 1,
            h: height - 1,
            name: `ctrl_${idx}_sign`,
            value: "",
          });
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
    doc.text(bl("deviazioni", lang), margin + 3, titleY + 4);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(bl("deviazioniDesc", lang), margin, titleY + 14, {
      maxWidth: pageW - margin * 2,
    });

    const NUM_ROWS = 10;
    const headerRow = [
      bl("num", lang),
      bl("description", lang),
      bl("notes", lang),
      bl("status", lang),
    ];
    autoTable(doc, {
      startY: titleY + 22,
      margin: { left: margin, right: margin, top: TOP },
      head: [headerRow],
      body: Array.from({ length: NUM_ROWS }, (_, i) => [String(i + 1), "", "", ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2.5, minCellHeight: 14, valign: "top" },
      headStyles: { font: "helvetica", fontStyle: "bold", fontSize: 11, fillColor: [120, 30, 30], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 32 },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index === 0) return;
        const { x, y, width, height } = data.cell;
        const cols = ["num", "desc", "notes", "status"];
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          name: `dev_${data.row.index}_${cols[data.column.index]}`,
          value: "",
          multiline: data.column.index === 1 || data.column.index === 2,
        });
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
    doc.text(bl("azioniCorrettive", lang), margin + 3, titleY + 4);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(bl("azioniCorrettiveDesc", lang), margin, titleY + 14, {
      maxWidth: pageW - margin * 2,
    });

    const NUM_ROWS = 10;
    const headerRow = [
      bl("num", lang),
      bl("description", lang),
      bl("responsible", lang),
      bl("dueDate", lang),
      bl("status", lang),
    ];
    autoTable(doc, {
      startY: titleY + 22,
      margin: { left: margin, right: margin, top: TOP },
      head: [headerRow],
      body: Array.from({ length: NUM_ROWS }, (_, i) => [String(i + 1), "", "", "", ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2.5, minCellHeight: 14, valign: "top" },
      headStyles: { font: "helvetica", fontStyle: "bold", fontSize: 11, fillColor: [30, 80, 30], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 42 },
        3: { cellWidth: 30 },
        4: { cellWidth: 26 },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index === 0) return;
        const { x, y, width, height } = data.cell;
        const cols = ["num", "desc", "resp", "due", "status"];
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          name: `ac_${data.row.index}_${cols[data.column.index]}`,
          value: "",
          multiline: data.column.index === 1,
        });
      },
    });

    // riga firma in fondo (editabile)
    const fy = pageH - 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(bl("date", lang) + ":", margin, fy);
    addField({
      x: margin + 30,
      y: fy - 5,
      w: 55,
      h: 7,
      name: "final_date",
      value: "",
    });
    doc.text(bl("signature", lang) + ":", margin + 95, fy);
    addField({
      x: margin + 130,
      y: fy - 5,
      w: pageW - margin - (margin + 130),
      h: 7,
      name: "final_signature",
      value: "",
    });
  }

  // ── Header + footer su OGNI pagina ──────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawPageHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `${bl("page", lang)} ${i} ${bl("of", lang)} ${pageCount}`,
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
