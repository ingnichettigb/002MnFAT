import * as JsPDFmod from "jspdf";
import { jsPDF, AcroFormTextField, AcroFormCheckBox, AcroFormRadioButton } from "jspdf";
import autoTable from "jspdf-autotable";
// AcroForm constructors per campi editabili.
const TextField: any = AcroFormTextField;
const CheckBox: any = AcroFormCheckBox;
const RadioButton: any = AcroFormRadioButton;
const Appearance: any = (JsPDFmod as any).AcroFormAppearance;
import type { FatState, Party } from "./fat-context";
import type { Lang } from "./i18n";
import { translateControl } from "./fat-defaults";

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
  orderNo: { it: "Nr Ordine Cliente", en: "Customer Order No.", de: "Kunden-Bestellnummer", es: "N.º Pedido Cliente" },
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
  inspectorSign: { it: "Firma", en: "Signature", de: "Unterschrift", es: "Firma" },
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
  accettato: { it: "ACCETTATO", en: "ACCEPTED", de: "AKZEPTIERT", es: "ACEPTADO" },
  nonAccettato: { it: "NON ACCETTATO", en: "NOT ACCEPTED", de: "NICHT AKZEPTIERT", es: "NO ACEPTADO" },
  nonApplicabile: { it: "NON APPLICABILE", en: "NOT APPLICABLE", de: "NICHT ANWENDBAR", es: "NO APLICABLE" },
  daCompletare: { it: "DA COMPLETARE", en: "TO BE COMPLETED", de: "ZU VERVOLLSTÄNDIGEN", es: "POR COMPLETAR" },
  definitivo: { it: "DEFINITIVO", en: "FINAL", de: "ENDGÜLTIG", es: "DEFINITIVO" },
  provvisorio: { it: "PROVVISORIO", en: "PROVISIONAL", de: "VORLÄUFIG", es: "PROVISIONAL" },
  daDefinire: { it: "DA DEFINIRE", en: "TO BE DEFINED", de: "ZU DEFINIEREN", es: "POR DEFINIR" },
  pendingCA: {
    it: "IN ATTESA DEL COMPLETAMENTO DELLE AZIONI CORRETTIVE",
    en: "PENDING COMPLETION OF CORRECTIVE ACTIONS",
    de: "AUSSTEHEND BIS ABSCHLUSS DER KORREKTURMASSNAHMEN",
    es: "A LA ESPERA DE COMPLETAR LAS ACCIONES CORRECTIVAS",
  },
  caCompleted: {
    it: "COMPLETATE LE AZIONI CORRETTIVE",
    en: "CORRECTIVE ACTIONS COMPLETED",
    de: "KORREKTURMASSNAHMEN ABGESCHLOSSEN",
    es: "ACCIONES CORRECTIVAS COMPLETADAS",
  },
  clientFatAttendees: {
    it: "Ditta Cliente",
    en: "Customer",
    de: "Kunde",
    es: "Cliente",
  },
  constructorSign: {
    it: "Firma costruttore",
    en: "Manufacturer signature",
    de: "Unterschrift Hersteller",
    es: "Firma fabricante",
  },
} as const;

type DKey = keyof typeof D;

/**
 * Etichetta bilingue. Regola:
 *  - lang === "en"  → "EN / IT"
 *  - altrimenti     → "<lang> / EN"
 * Se le due stringhe coincidono mostra una sola volta.
 */
const blParts = (
  key: DKey,
  lang: Lang,
  secondary?: Lang | null,
): { p: string; s: string | null } => {
  const p = D[key][lang];
  const s = secondary
    ? D[key][secondary]
    : lang === "en"
      ? D[key].it
      : D[key].en;
  return { p, s: p === s ? null : s };
};

const blGlobal = (key: DKey, lang: Lang, secondary?: Lang | null): string => {
  const { p, s } = blParts(key, lang, secondary);
  return s ? `${p} / ${s}` : p;
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
  // Escludo dalle pagine "controllo" le voci che hanno una pagina fissa dedicata
  // in fondo al report (Varie / Deviazioni / Azioni correttive), così non vengono
  // duplicate.
  const isFixedSection = (label: string) => {
    const s = (label || "").toLowerCase();
    return (
      /\bvarie\b/.test(s) ||
      /allegat[io]\s+tecnic/.test(s) ||
      /deviazion/.test(s) ||
      /deviation/.test(s) ||
      /azioni?\s+corretti/.test(s) ||
      /corrective\s+action/.test(s)
    );
  };
  const selected = controls.filter((c) => c.selected && !isFixedSection(c.label));
  // Shadow del bl() globale per includere la secondaria scelta dall'utente
  const bl = (key: DKey, _l?: Lang) => blGlobal(key, lang, secondary);
  const blP = (key: DKey) => blParts(key, lang, secondary);
  const normCompany = (value: string) => value.trim().toLocaleLowerCase();
  const sameCompany = (candidate: string, target: string) => {
    const c = normCompany(candidate);
    const t = normCompany(target);
    return !!c && !!t && (c === t || c.includes(t) || t.includes(c));
  };
  const customerAttendees = general.presenti.filter((a) => {
    if (!a.nome && !a.ruolo && !a.azienda) return false;
    if (sameCompany(a.azienda, general.produttore.ragioneSociale)) return false;
    return true;
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Helvetica nei PDF è metricamente equivalente ad Arial e viene
  // visualizzato come Arial nei lettori principali.
  doc.setFont("helvetica", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const HEADER_H = 22;

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
    if (opts.fontSize) {
      f.maxFontSize = opts.fontSize;
      const baseKeyValues = f.getKeyValueListForStream?.bind(f);
      f.getKeyValueListForStream = function (this: any) {
        const list = baseKeyValues ? baseKeyValues() : [];
        const fontKey = this.scope?.internal?.getFont(this.fontName, this.fontStyle).id || "F1";
        return [
          ...list.filter((entry: { key: string }) => entry.key !== "DA"),
          { key: "DA", value: `(/${fontKey} ${opts.fontSize} Tf 0 g)` },
        ];
      };
    }
    f.T = uid(opts.name);
    if (opts.multiline) f.multiline = true;
    doc.addField(f);
  };

  // ── Intestazione comune (senza data, testo più grande) ──
  const drawPageHeader = () => {
    const y = 8;
    // Cornice blu a doppia riga sottile attorno all'intestazione
    const frameX = margin;
    const frameY = y;
    const frameW = pageW - margin * 2;
    const frameH = HEADER_H - 2;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.3);
    doc.rect(frameX, frameY, frameW, frameH);
    doc.rect(frameX + 1, frameY + 1, frameW - 2, frameH - 2);
    // Separatori verticali tra i campi
    const items: Array<{ key: DKey; value: string }> = [
      { key: "commessa", value: general.commessa || "" },
      { key: "drawingNo", value: general.numeroDisegno || "" },
      { key: "serialNo", value: general.numeroMatricola || "" },
      { key: "tagNo", value: general.tagNumber || "" },
    ];
    const colW = frameW / items.length;
    for (let i = 1; i < items.length; i++) {
      const xs = frameX + colW * i;
      doc.line(xs, frameY + 1, xs, frameY + frameH - 1);
    }
    doc.setDrawColor(0);

    doc.setTextColor(60);
    items.forEach((it, i) => {
      const x = frameX + colW * i + 2;
      const { p, s } = blP(it.key);
      // Prima lingua: tondo (non grassetto)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(p + (s ? " /" : ":"), x, y + 3.2, { maxWidth: colW - 4 });
      // Seconda lingua: corsivo, sulla riga successiva ravvicinata
      if (s) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.text(s + ":", x, y + 6.4, { maxWidth: colW - 4 });
      }
      // Valore: grassetto, subito sotto l'etichetta
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(String(it.value), x, y + (s ? 12 : 9), { maxWidth: colW - 4 });
    });
    doc.setTextColor(0);
  };

  // Lascia spazio sufficiente tra l'header e il titolo del documento
  const TOP = HEADER_H + 14;

  /** Disegna un bordo blu visibile in stampa attorno al quadratino. */
  const drawCbBorder = (x: number, y: number, size: number) => {
    const prevDraw = (doc as any).getDrawColor?.() ?? "#000000";
    const prevLw = (doc as any).getLineWidth?.() ?? 0.2;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.35);
    doc.rect(x, y, size, size);
    // ripristina
    try { doc.setDrawColor(prevDraw as any); } catch { doc.setDrawColor(0); }
    doc.setLineWidth(prevLw as number);
  };

  /** Crea un CheckBox AcroForm posizionato in mm (con bordo blu stampabile). */
  const addCheckbox = (opts: { x: number; y: number; size: number; name: string }) => {
    drawCbBorder(opts.x, opts.y, opts.size);
    const c = new CheckBox();
    c.Rect = [opts.x, opts.y, opts.size, opts.size];
    c.T = uid(opts.name);
    c.fontName = "helvetica";
    c.fontSize = 10;
    c.value = "Off";
    c.AS = "/Off";
    doc.addField(c);
  };

  /** Crea un gruppo esclusivo di quadratini: una sola opzione, ricliccabile per tornare vuoto. */
  const addRadioGroup = (opts: {
    name: string;
    items: Array<{ x: number; y: number; size: number; value: string }>;
  }) => {
    const rg = new RadioButton();
    rg.T = uid(opts.name);
    // Campo Button multi-widget SENZA flag Radio: resta esclusivo per valore,
    // ma il quadratino già selezionato può tornare Off anche nei viewer che
    // ignorano il flag PDF noToggleToOff dei radio button.
    rg.radio = false;
    // Nessuna opzione preselezionata.
    rg.value = "Off";
    rg.AS = "/Off";
    // Permetti di deselezionare cliccando di nuovo sull'opzione attiva.
    try { (rg as any).noToggleToOff = false; } catch { /* ignore */ }
    doc.addField(rg);
    opts.items.forEach((it) => {
      drawCbBorder(it.x, it.y, it.size);
      const child = rg.createOption(it.value);
      child.Rect = [it.x, it.y, it.size, it.size];
      child.AS = "/Off";
    });
    // Usa apparenza a "X" (come un check) invece del pallino,
    // così quando NON è selezionato il quadratino resta vuoto
    // e quando lo selezioni compare una X visibile anche in stampa.
    try {
      if (Appearance?.RadioButton?.Cross) {
        rg.setAppearance(Appearance.RadioButton.Cross);
      }
    } catch {
      /* fallback al cerchio di default */
    }
  };


  // ── PAGINA 1: solo titolo + Dati del Collaudo ───────────
  // Titolo centrato, posizionato più in basso
  const titleY = TOP + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(bl("title", lang), pageW / 2, titleY, { align: "center" });
  doc.setFontSize(14);
  doc.text("F.A.T. — " + bl("subtitle", lang), pageW / 2, titleY + 10, { align: "center" });

  let cursorY = titleY + 25;

  // ── Test data (sulla prima pagina) ──
  {
    const rows: Array<{ label: string; value: string; key: string; multi?: boolean; minH?: number }> = [
      { label: bl("descrizione", lang), value: general.descrizione, key: "desc", multi: true, minH: 30 },
      { label: bl("commessa", lang), value: general.commessa, key: "commessa" },
      { label: bl("drawingNo", lang), value: general.numeroDisegno, key: "drawing" },
      { label: bl("serialNo", lang), value: general.numeroMatricola, key: "serial" },
      { label: bl("tagNo", lang), value: general.tagNumber, key: "tag" },
      { label: bl("orderNo", lang), value: general.numeroOrdineCliente, key: "order" },
      { label: bl("testPlace", lang), value: general.luogoCollaudo, key: "place" },
      { label: bl("testDate", lang), value: fmtDate(general.dataCollaudo, lang), key: "date" },
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
        fillColor: [30, 64, 175],
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
  }

  // ── Riquadro di accettazione in fondo alla prima pagina ──
  {
    const blockW = pageW - margin * 2;
    const rowH = 14;
    const sigHeadH = 7;
    const sigRowH = 8;
    const gap = 2;
    const dataColW = 55;
    const dataLblW = 18;

    // Presenti ditta cliente (massimo 3 per stare in pagina)
    const sigRowsRaw = customerAttendees.length
      ? customerAttendees
      : [
          { id: "blank-client-1", nome: "", ruolo: "", azienda: "" },
          { id: "blank-client-2", nome: "", ruolo: "", azienda: "" },
        ];
    const signRows = sigRowsRaw.slice(0, 3);
    const sigH = sigHeadH + sigRowH * signRows.length;

    const blockAH = rowH * 2;     // accettato/non + in_attesa+data
    const caH = rowH;             // completate + firma costruttore
    const blockBH = rowH;         // accettato/non + data finale

    const totalH = blockAH + gap + sigH + gap + caH + blockBH + gap + sigH;
    const x0 = margin;
    const y0 = pageH - margin - totalH;

    // helper testo bilingue (primaria sopra, secondaria sotto più piccola)
    const drawBl = (
      key: DKey,
      x: number,
      y: number,
      opts?: { align?: "left" | "center"; fontSize?: number },
    ) => {
      const { p, s } = blP(key);
      const fs = opts?.fontSize ?? 9;
      const align = opts?.align ?? "left";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(fs);
      doc.setTextColor(0);
      doc.text(p, x, y, { align });
      if (s) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(fs - 2);
        doc.setTextColor(80);
        doc.text(s, x, y + fs * 0.38, { align });
      }
      doc.setTextColor(0);
    };

    const cbSize = 4;
    const textPadX = 3;

    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.4);

    // ===== BLOCK A: esito iniziale (2 righe) =====
    const aY = y0;
    doc.rect(x0, aY, blockW, blockAH);
    doc.line(x0, aY + rowH, x0 + blockW, aY + rowH);
    // separatore verticale riga 1 (accettato | non accettato)
    doc.line(x0 + blockW / 2, aY, x0 + blockW / 2, aY + rowH);
    // colonna DATA su riga 2
    doc.line(x0 + blockW - dataColW, aY + rowH, x0 + blockW - dataColW, aY + rowH * 2);
    doc.line(
      x0 + blockW - dataColW + dataLblW,
      aY + rowH,
      x0 + blockW - dataColW + dataLblW,
      aY + rowH * 2,
    );

    const aTextY = (r: number) => aY + rowH * r + 6;
    addRadioGroup({
      name: "esito_iniziale",
      items: [
        { x: x0 + textPadX, y: aY + (rowH - cbSize) / 2, size: cbSize, value: "accettato" },
        {
          x: x0 + blockW / 2 + textPadX,
          y: aY + (rowH - cbSize) / 2,
          size: cbSize,
          value: "non_accettato",
        },
        {
          x: x0 + textPadX,
          y: aY + rowH + (rowH - cbSize) / 2,
          size: cbSize,
          value: "in_attesa",
        },
      ],
    });
    drawBl("accettato", x0 + textPadX + cbSize + 2, aTextY(0));
    drawBl("nonAccettato", x0 + blockW / 2 + textPadX + cbSize + 2, aTextY(0));
    drawBl("pendingCA", x0 + textPadX + cbSize + 2, aTextY(1), { fontSize: 8 });
    drawBl("date", x0 + blockW - dataColW + 2, aTextY(1), { fontSize: 9 });
    addField({
      x: x0 + blockW - dataColW + dataLblW + 0.5,
      y: aY + rowH + 1,
      w: dataColW - dataLblW - 1,
      h: rowH - 2,
      name: "data_attesa_ca",
      fontSize: 12,
    });

    // ===== SIG TABLE A (compatta: header + righe) =====
    const sigAY = aY + blockAH + gap;
    const sigNameW = 68;
    const sigRoleW = 42;
    const sigSignW = blockW - sigNameW - sigRoleW;
    const drawSigTable = (sy: number, fieldPrefix: string) => {
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.35);
      doc.rect(x0, sy, blockW, sigH);
      doc.line(x0, sy + sigHeadH, x0 + blockW, sy + sigHeadH);
      doc.line(x0 + sigNameW, sy, x0 + sigNameW, sy + sigH);
      doc.line(x0 + sigNameW + sigRoleW, sy, x0 + sigNameW + sigRoleW, sy + sigH);
      for (let i = 1; i < signRows.length; i++) {
        doc.line(x0, sy + sigHeadH + sigRowH * i, x0 + blockW, sy + sigHeadH + sigRowH * i);
      }
      // header row: "— Ditta Cliente — Nome e Cognome" | "Ruolo" | "Firma"
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(0);
      const clientLbl = bl("clientFatAttendees", lang);
      const nameLbl = bl("attName", lang);
      doc.text(`${clientLbl}  ·  ${nameLbl}`, x0 + 2, sy + 4.6, { maxWidth: sigNameW - 4 });
      doc.text(bl("attRole", lang), x0 + sigNameW + 2, sy + 4.6, { maxWidth: sigRoleW - 4 });
      doc.text(bl("signature", lang), x0 + sigNameW + sigRoleW + 2, sy + 4.6, {
        maxWidth: sigSignW - 4,
      });
      signRows.forEach((a, i) => {
        const ry = sy + sigHeadH + sigRowH * i;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(a.nome || "", x0 + 2, ry + 5.2, { maxWidth: sigNameW - 4 });
        doc.text(a.ruolo || "", x0 + sigNameW + 2, ry + 5.2, { maxWidth: sigRoleW - 4 });
        addField({
          x: x0 + sigNameW + sigRoleW + 0.5,
          y: ry + 0.5,
          w: sigSignW - 1,
          h: sigRowH - 1,
          name: `${fieldPrefix}_${i}`,
          fontSize: 8,
        });
      });
    };
    drawSigTable(sigAY, "client_signature_initial");

    // ===== CA HEADER: "COMPLETATE LE AZIONI CORRETTIVE" + Firma costruttore =====
    const caY = sigAY + sigH + gap;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.4);
    doc.rect(x0, caY, blockW, caH);
    const caTitleW = blockW * 0.45;
    doc.line(x0 + caTitleW, caY, x0 + caTitleW, caY + caH);
    drawBl("caCompleted", x0 + 3, caY + 6, { fontSize: 9 });
    // etichetta "Firma costruttore" + campo editabile
    const caSignLblW = 38;
    doc.line(x0 + caTitleW + caSignLblW, caY, x0 + caTitleW + caSignLblW, caY + caH);
    drawBl("constructorSign", x0 + caTitleW + 2, caY + 6, { fontSize: 8 });
    addField({
      x: x0 + caTitleW + caSignLblW + 0.5,
      y: caY + 1,
      w: blockW - caTitleW - caSignLblW - 1,
      h: caH - 2,
      name: "firma_costruttore",
      fontSize: 10,
    });

    // ===== BLOCK B: esito finale (1 riga) =====
    const bY = caY + caH;
    const accW = (blockW - dataColW) / 2;
    doc.rect(x0, bY, blockW, blockBH);
    doc.line(x0 + accW, bY, x0 + accW, bY + blockBH);
    doc.line(x0 + accW * 2, bY, x0 + accW * 2, bY + blockBH);
    doc.line(x0 + accW * 2 + dataLblW, bY, x0 + accW * 2 + dataLblW, bY + blockBH);

    addRadioGroup({
      name: "esito_finale",
      items: [
        { x: x0 + textPadX, y: bY + (rowH - cbSize) / 2, size: cbSize, value: "accettato" },
        {
          x: x0 + accW + textPadX,
          y: bY + (rowH - cbSize) / 2,
          size: cbSize,
          value: "non_accettato",
        },
      ],
    });
    drawBl("accettato", x0 + textPadX + cbSize + 2, bY + 6);
    drawBl("nonAccettato", x0 + accW + textPadX + cbSize + 2, bY + 6);
    drawBl("date", x0 + accW * 2 + 2, bY + 6, { fontSize: 9 });
    addField({
      x: x0 + accW * 2 + dataLblW + 0.5,
      y: bY + 1,
      w: blockW - accW * 2 - dataLblW - 1,
      h: blockBH - 2,
      name: "data_esito_finale",
      fontSize: 12,
    });

    // ===== SIG TABLE B =====
    const sigBY = bY + blockBH + gap;
    drawSigTable(sigBY, "client_signature_final");
  }


  // ── PAGINA 2: Produttore / Cliente / Presenti ───────────
  doc.addPage();
  cursorY = TOP;

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
        fillColor: [30, 64, 175],
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

  // ── Attendees ──
  {
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
        fillColor: [30, 64, 175],
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
        const dataRowIdx = data.row.index - 1;
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
    cursorY = (doc as any).lastAutoTable.finalY + 3;
  }

  // ── Luogo e Data FAT (subito dopo i presenti) ──
  {
    const rows: Array<{ label: string; value: string; key: string }> = [
      { label: bl("testPlace", lang), value: general.luogoCollaudo || "", key: "place" },
      { label: bl("testDate", lang), value: fmtDate(general.dataCollaudo, lang), key: "date" },
    ];
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin, top: TOP },
      head: [[`${bl("testPlace", lang)} / ${bl("testDate", lang)}`, ""]],
      body: rows.map((r) => [r.label, ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2 },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 12,
        fillColor: [30, 64, 175],
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
          name: `fat_${r.key}`,
        });
      },
    });
  }



  // ── Pagina per ogni controllo selezionato ───────────────
  // Tengo traccia del numero di pagina di ciascun controllo per l'indice finale.
  const ctrlPages: Array<{ primary: string; secondary: string | null; page: number }> = [];
  selected.forEach((ctrl, idx) => {
    doc.addPage();

    // Intestazione capitolo: blu, "Controllo N / Check N" sulla prima riga,
    // poi la descrizione IT (primaria) e la traduzione (secondaria) a seguire.
    const labelIt = String(ctrl.label || "");
    const secLang: Lang | null =
      secondary ?? (lang === "en" ? "it" : "en");
    const labelPrimary = lang === "it" ? labelIt : translateControl(labelIt, lang);
    const labelSecondary = secLang
      ? (secLang === "it" ? labelIt : translateControl(labelIt, secLang))
      : null;
    const showSecondary = !!labelSecondary && labelSecondary !== labelPrimary;

    ctrlPages.push({
      primary: labelPrimary,
      secondary: showSecondary ? labelSecondary : null,
      page: (doc as any).getCurrentPageInfo().pageNumber,
    });

    const titleY = TOP;
    const titleH = showSecondary ? 22 : 14;
    doc.setFillColor(30, 64, 175); // blu
    doc.rect(margin, titleY - 4, pageW - margin * 2, titleH, "F");
    doc.setTextColor(255);
    // Riga unica: "N Titolo del controllo" (lingua primaria)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`${idx + 1} ${labelPrimary}`, margin + 3, titleY + 3, {
      maxWidth: pageW - margin * 2 - 6,
    });
    // Riga secondaria (opzionale): traduzione in corsivo
    if (showSecondary) {
      doc.setFont("helvetica", "bolditalic");
      doc.setFontSize(11);
      doc.text(labelSecondary!, margin + 3, titleY + 11, {
        maxWidth: pageW - margin * 2 - 6,
      });
    }
    doc.setTextColor(0);

    // Etichette bilingui (primaria + secondaria in corsivo) per le righe della tabella
    const labelCell = (key: DKey) => {
      const { p, s } = blP(key);
      return s ? `${p}\n${s}` : p;
    };

    autoTable(doc, {
      startY: titleY + titleH + 2,
      margin: { left: margin, right: margin, top: TOP },
      body: [
        // Esito occupa tutta la larghezza (titolo + checkbox)
        [{ content: bl("outcome", lang), colSpan: 2, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } } as any],
        [labelCell("notes"), ""],
        [labelCell("inspectorSign"), ""],
      ],
      styles: { font: "helvetica", fontSize: 12, cellPadding: 3, valign: "top" },
      rowPageBreak: "avoid",
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55, fillColor: [240, 240, 240] },
        1: { cellWidth: "auto" },
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          if (data.row.index === 0) data.cell.styles.minCellHeight = 44;
          if (data.row.index === 1) data.cell.styles.minCellHeight = 95;
          if (data.row.index === 2) data.cell.styles.minCellHeight = 22;
        }
      },
      didDrawCell: (data) => {
        if (data.section !== "body") return;
        const { x, y, width, height } = data.cell;

        if (data.row.index === 0 && data.column.index === 0) {
          const optsTop: DKey[] = ["accettato", "nonAccettato", "nonApplicabile", "daCompletare"];
          const optsBot: DKey[] = ["definitivo", "provvisorio", "daDefinire"];
          const cbSize = 5;

          // Disegna etichette (primaria + secondaria) per ogni opzione.
          const drawLabels = (opts: DKey[], rowY: number) => {
            const cellW = (width - 6) / opts.length;
            opts.forEach((k, i) => {
              const cx = x + 3 + cellW * i;
              const { p, s } = blP(k);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.text(p, cx + cbSize + 2, rowY + cbSize - 1, {
                maxWidth: cellW - cbSize - 3,
              });
              if (s) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(7);
                doc.text(s, cx + cbSize + 2, rowY + cbSize + 4, {
                  maxWidth: cellW - cbSize - 3,
                });
              }
            });
          };

          // Esito: radio per accettato/nonAccettato/nonApplicabile,
          // checkbox indipendente per daCompletare.
          {
            const rowY = y + 14;
            const cellW = (width - 6) / optsTop.length;
            const radioKeys: DKey[] = ["accettato", "nonAccettato", "nonApplicabile"];
            const radioItems = radioKeys.map((k, i) => ({
              x: x + 3 + cellW * i,
              y: rowY,
              size: cbSize,
              value: k,
            }));
            addRadioGroup({ name: `ctrl_${idx}_esito`, items: radioItems });
            // daCompletare resta un checkbox sempre spuntabile.
            const dcIdx = optsTop.indexOf("daCompletare");
            addCheckbox({
              x: x + 3 + cellW * dcIdx,
              y: rowY,
              size: cbSize,
              name: `ctrl_${idx}_daCompletare`,
            });
            drawLabels(optsTop, rowY);
          }

          // Stato: radio (definitivo/provvisorio/daDefinire).
          {
            const rowY = y + 30;
            const cellW = (width - 6) / optsBot.length;
            const radioItems = optsBot.map((k, i) => ({
              x: x + 3 + cellW * i,
              y: rowY,
              size: cbSize,
              value: k,
            }));
            addRadioGroup({ name: `ctrl_${idx}_stato`, items: radioItems });
            drawLabels(optsBot, rowY);
          }
        } else if (data.row.index === 1 && data.column.index === 1) {
          addField({
            x: x + 0.5,
            y: y + 0.5,
            w: width - 1,
            h: height - 1,
            name: `ctrl_${idx}_notes`,
            value: "",
            multiline: true,
          });
        } else if (data.row.index === 2 && data.column.index === 1) {
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



  // ── Pagina VARIE — Allegati tecnici ─────────────────────
  doc.addPage();
  {
    const titleY = TOP;
    doc.setFillColor(80, 80, 80);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    const varieTitle =
      lang === "en"
        ? "MISCELLANEOUS — Technical attachments"
        : lang === "de"
          ? "VERSCHIEDENES — Technische Anlagen"
          : lang === "es"
            ? "VARIOS — Anexos técnicos"
            : "VARIE — Allegati tecnici";
    const varieSec =
      secondary === "it"
        ? "VARIE — Allegati tecnici"
        : secondary === "en"
          ? "MISCELLANEOUS — Technical attachments"
          : secondary === "de"
            ? "VERSCHIEDENES — Technische Anlagen"
            : secondary === "es"
              ? "VARIOS — Anexos técnicos"
              : lang === "it"
                ? "MISCELLANEOUS — Technical attachments"
                : "VARIE — Allegati tecnici";
    const varieNo = ctrlPages.length + 1;
    ctrlPages.push({
      primary: varieTitle,
      secondary: varieSec && varieSec !== varieTitle ? varieSec : null,
      page: (doc as any).getCurrentPageInfo().pageNumber,
    });
    doc.text(
      varieSec && varieSec !== varieTitle ? `${varieNo} ${varieTitle} / ${varieSec}` : `${varieNo} ${varieTitle}`,
      margin + 3,
      titleY + 4,
      { maxWidth: pageW - margin * 2 - 6 },
    );
    doc.setTextColor(0);

    const NUM_ROWS = 12;
    const headerRow = [
      bl("num", lang),
      lang === "en" ? "Attachment description" : "Descrizione allegato",
      "Rev.",
      bl("notes", lang),
    ];
    autoTable(doc, {
      startY: titleY + 14,
      margin: { left: margin, right: margin, top: TOP },
      head: [headerRow],
      body: Array.from({ length: NUM_ROWS }, (_, i) => [String(i + 1), "", "", ""]),
      styles: { font: "helvetica", fontSize: 12, cellPadding: 2.5, minCellHeight: 12, valign: "top" },
      headStyles: { font: "helvetica", fontStyle: "bold", fontSize: 12, fillColor: [80, 80, 80], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: "auto" },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index === 0) return;
        const { x, y, width, height } = data.cell;
        const cols = ["num", "desc", "rev", "notes"];
        addField({
          x: x + 0.5,
          y: y + 0.5,
          w: width - 1,
          h: height - 1,
          name: `var_${data.row.index}_${cols[data.column.index]}`,
          value: "",
          multiline: data.column.index === 1 || data.column.index === 3,
        });
      },
    });
  }

  // ── Pagina DEVIAZIONI ───────────────────────────────────
  doc.addPage();
  {
    const titleY = TOP;
    doc.setFillColor(120, 30, 30);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    let deviazioniNo = ctrlPages.length + 1;
    {
      const { p, s } = blP("deviazioni");
      ctrlPages.push({
        primary: p,
        secondary: s,
        page: (doc as any).getCurrentPageInfo().pageNumber,
      });
    }
    doc.text(`${deviazioniNo} ${bl("deviazioni", lang)}`, margin + 3, titleY + 4, {
      maxWidth: pageW - margin * 2 - 6,
    });
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
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
      headStyles: { font: "helvetica", fontStyle: "bold", fontSize: 12, fillColor: [120, 30, 30], textColor: 255 },
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
    let azioniNo = ctrlPages.length + 1;
    {
      const { p, s } = blP("azioniCorrettive");
      ctrlPages.push({
        primary: p,
        secondary: s,
        page: (doc as any).getCurrentPageInfo().pageNumber,
      });
    }
    doc.text(`${azioniNo} ${bl("azioniCorrettive", lang)}`, margin + 3, titleY + 4, {
      maxWidth: pageW - margin * 2 - 6,
    });
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
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
      headStyles: { font: "helvetica", fontStyle: "bold", fontSize: 12, fillColor: [30, 80, 30], textColor: 255 },
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

  // ── Pagina INDICE (in fondo) ────────────────────────────
  {
    doc.addPage();
    const titleY = TOP;
    doc.setFillColor(30, 64, 175);
    doc.rect(margin, titleY - 4, pageW - margin * 2, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    const idxTitle =
      lang === "en" ? "INDEX" : lang === "de" ? "INHALT" : lang === "es" ? "ÍNDICE" : "INDICE";
    const idxSec =
      secondary === "it"
        ? "INDICE"
        : secondary === "en"
          ? "INDEX"
          : secondary === "de"
            ? "INHALT"
            : secondary === "es"
              ? "ÍNDICE"
              : lang === "it"
                ? "INDEX"
                : "INDICE";
    const idxNo = ctrlPages.length + 1;
    doc.text(
      `${idxNo} ${idxSec && idxSec !== idxTitle ? `${idxTitle} / ${idxSec}` : idxTitle}`,
      margin + 3,
      titleY + 4,
    );
    doc.setTextColor(0);

    ctrlPages.push({
      primary: idxTitle,
      secondary: idxSec && idxSec !== idxTitle ? idxSec : null,
      page: (doc as any).getCurrentPageInfo().pageNumber,
    });

    autoTable(doc, {
      startY: titleY + 14,
      margin: { left: margin, right: margin, top: TOP },
      head: [[
        bl("num", lang),
        bl("chapter", lang) + (blP("chapter").s ? " / " + blP("chapter").s : ""),
        bl("page", lang),
      ]],
      body: ctrlPages.map((c, i) => [
        String(i + 1),
        c.secondary ? `${c.primary}\n${c.secondary}` : c.primary,
        String(c.page),
      ]),
      styles: { font: "helvetica", fontSize: 11, cellPadding: 2.5, valign: "top" },
      headStyles: {
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 11,
        fillColor: [30, 64, 175],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 14, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 22, halign: "center" },
      },
    });
  }


  const safe = (s: string) =>
    (s || "report").replace(/[^a-z0-9-_]+/gi, "_").slice(0, 40);
  const filename = `mini-fat_${safe(general.numeroMatricola)}_${
    general.dataCollaudo || new Date().toISOString().slice(0, 10)
  }.pdf`;

  // ── Header + footer su OGNI pagina ──────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawPageHeader();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    // Sinistra: nome del file
    doc.text(filename, margin, pageH - 8, {
      maxWidth: pageW - margin * 2 - 40,
    });
    // Destra: numero pagina
    doc.text(
      `${bl("page", lang)} ${i} ${bl("of", lang)} ${pageCount}`,
      pageW - margin,
      pageH - 8,
      { align: "right" },
    );
    doc.setTextColor(0);
  }

  doc.save(filename);
}
