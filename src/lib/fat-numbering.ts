// =============================================================================
// REGISTRO UNICO DI NUMERAZIONE per "mini FAT"
// -----------------------------------------------------------------------------
// Ogni etichetta dell'app (titoli pagina, header sezione, label di campo,
// pulsanti, step) ha qui un id numerico UNIVOCO.  Lo usiamo come apice
// accanto al testo. Chiunque guardi la UI può poi cercare il numero in una
// tabella esterna (es. Excel) per vederne la traduzione in qualunque lingua.
//
// Schema dei blocchi (numeri ordinati, senza buchi rilevanti, senza duplicati):
//
//   1  ..  10  → Chrome globale: stepper, pulsanti comuni
//   11 ..  19  → Sezione Ditta Produttrice (header + 5 campi)
//   21 ..  29  → Sezione Ditta Cliente     (header + 5 campi)
//   31 ..  39  → Sezione Dati del Collaudo (header + 5 campi)
//   41         → Header "Presenti al FAT"
//   50 ..  99  → Righe presenti (2 numeri per riga: nome + ruolo)
//                row 0 → 50, 51   row 1 → 52, 53   ...   (max ~25 presenti)
//   100        → Header "Lista Controlli" (Step 2)
//   101 .. ∞   → Singoli controlli (numero stabile per indice nella lista)
//
// =============================================================================

export type LabelEntry = {
  /** Numero univoco mostrato come apice. Usalo come chiave nella tabella Excel. */
  id: number;
  /** Chiave i18n in `src/lib/i18n.tsx` per recuperare il testo tradotto. */
  i18nKey: string;
  /** Descrizione tecnica (solo per documentazione/CSV). */
  desc: string;
};

/** Registro statico delle etichette con id fisso. */
export const LABELS = {
  // ── 1..10 — UI globale ────────────────────────────────────────────────────
  stepGeneral:    { id: 1,  i18nKey: "stepGeneral",    desc: "Stepper · step 1 (Dati Generali)" },
  stepControls:   { id: 2,  i18nKey: "stepControls",   desc: "Stepper · step 2 (Controlli)" },
  stepReport:     { id: 3,  i18nKey: "stepReport",     desc: "Stepper · step 3 (Report PDF)" },
  back:           { id: 4,  i18nKey: "back",           desc: "Pulsante Indietro" },
  next:           { id: 5,  i18nKey: "next",           desc: "Pulsante Avanti" },
  addAttendee:    { id: 6,  i18nKey: "addAttendee",    desc: "Pulsante Aggiungi presente" },
  addCustom:      { id: 7,  i18nKey: "addCustom",      desc: "Pulsante Aggiungi controllo personalizzato" },
  generatePdf:    { id: 8,  i18nKey: "generatePdf",    desc: "Pulsante Genera PDF" },
  restart:        { id: 9,  i18nKey: "restart",        desc: "Pulsante Ricomincia / Reset" },
  modifyControls: { id: 10, i18nKey: "modifyControls", desc: "Pulsante Modifica controlli" },

  // ── 11..19 — Ditta Produttrice ────────────────────────────────────────────
  manufacturerTitle: { id: 11, i18nKey: "manufacturerTitle", desc: "Sezione Ditta Produttrice (header)" },
  mfgCompanyName:    { id: 12, i18nKey: "companyName", desc: "Produttrice · Ragione sociale" },
  mfgAddress:        { id: 13, i18nKey: "address",     desc: "Produttrice · Indirizzo" },
  mfgContact:        { id: 14, i18nKey: "contact",     desc: "Produttrice · Referente" },
  mfgEmail:          { id: 15, i18nKey: "email",       desc: "Produttrice · Email" },
  mfgPhone:          { id: 16, i18nKey: "phone",       desc: "Produttrice · Telefono" },

  // ── 21..29 — Ditta Cliente ────────────────────────────────────────────────
  customerTitle: { id: 21, i18nKey: "customerTitle", desc: "Sezione Ditta Cliente (header)" },
  cliCompanyName:{ id: 22, i18nKey: "companyName",   desc: "Cliente · Ragione sociale" },
  cliAddress:    { id: 23, i18nKey: "address",       desc: "Cliente · Indirizzo" },
  cliContact:    { id: 24, i18nKey: "contact",       desc: "Cliente · Referente" },
  cliEmail:      { id: 25, i18nKey: "email",         desc: "Cliente · Email" },
  cliPhone:      { id: 26, i18nKey: "phone",         desc: "Cliente · Telefono" },

  // ── 31..39 — Dati del Collaudo ────────────────────────────────────────────
  commonTitle:     { id: 31, i18nKey: "commonTitle", desc: "Sezione Dati del Collaudo (header)" },
  drawingNo:       { id: 32, i18nKey: "drawingNo",   desc: "N° Disegno / Specifica" },
  serialNo:        { id: 33, i18nKey: "serialNo",    desc: "N° Fabbrica / Matricola" },
  tagNo:           { id: 34, i18nKey: "tagNo",       desc: "Tag Number Cliente" },
  testDate:        { id: 35, i18nKey: "testDate",    desc: "Data del Collaudo" },
  testPlace:       { id: 36, i18nKey: "testPlace",   desc: "Luogo del Collaudo" },

  // ── 41 — Presenti al FAT (header) ─────────────────────────────────────────
  attendeesTitle:  { id: 41, i18nKey: "attendeesTitle", desc: "Sezione Presenti al FAT (header)" },

  // ── 100 — Lista Controlli (header) ────────────────────────────────────────
  controlsTitle:   { id: 100, i18nKey: "controlsTitle", desc: "Sezione Lista Controlli (header)" },
} as const satisfies Record<string, LabelEntry>;

export type LabelKey = keyof typeof LABELS;

// ── Numeri dinamici (presenti / controlli) ───────────────────────────────────

/** Base degli identificativi delle righe "presenti": riserva 50..99. */
export const ATTENDEES_BASE = 50;
/** Base degli identificativi dei controlli: 101, 102, 103, … */
export const CONTROLS_BASE = 101;

/** Restituisce i numeri univoci per la riga presente all'indice indicato. */
export function attendeeNumbers(index: number): { nome: number; ruolo: number } {
  return {
    nome: ATTENDEES_BASE + index * 2,
    ruolo: ATTENDEES_BASE + index * 2 + 1,
  };
}

/** Numero univoco per il controllo all'indice indicato. */
export function controlNumber(index: number): number {
  return CONTROLS_BASE + index;
}

// ── Esportazione tabella per Excel ───────────────────────────────────────────

/**
 * Restituisce la tabella `[ id, key, descrizione ]` di TUTTE le etichette
 * statiche del registro.  I testi tradotti vanno aggiunti dal chiamante
 * (vedi `src/lib/export-labels.ts`) leggendoli dal dizionario i18n.
 */
export function getStaticLabelTable(): LabelEntry[] {
  return Object.values(LABELS).slice().sort((a, b) => a.id - b.id);
}

// ── Garanzia di unicità a runtime (dev only) ─────────────────────────────────
// Se due voci avessero lo stesso id, qui esplodiamo subito.
(() => {
  const seen = new Map<number, string>();
  for (const [key, entry] of Object.entries(LABELS)) {
    const prev = seen.get(entry.id);
    if (prev) {
      throw new Error(
        `[fat-numbering] Duplicate label id ${entry.id}: "${prev}" and "${key}"`,
      );
    }
    seen.set(entry.id, key);
  }
})();
