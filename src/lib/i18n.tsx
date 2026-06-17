import * as React from "react";

export type Lang = "it" | "en" | "de" | "es";

type Entry = { it: string; en: string; de: string; es: string };

export const dict = {
  // Header
  appSubtitle: {
    it: "Generatore di verbali di Factory Acceptance Test",
    en: "Factory Acceptance Test report generator",
    de: "Generator für Factory-Acceptance-Test-Berichte",
    es: "Generador de informes Factory Acceptance Test",
  },

  // Stepper
  stepGeneral: { it: "Dati Generali", en: "General Data", de: "Allgemeine Daten", es: "Datos Generales" },
  stepControls: { it: "Controlli", en: "Checks", de: "Prüfungen", es: "Controles" },
  stepReport: { it: "Report PDF", en: "PDF Report", de: "PDF-Bericht", es: "Informe PDF" },

  // Common
  back: { it: "← Indietro", en: "← Back", de: "← Zurück", es: "← Atrás" },
  next: { it: "Avanti →", en: "Next →", de: "Weiter →", es: "Siguiente →" },
  add: { it: "Aggiungi", en: "Add", de: "Hinzufügen", es: "Añadir" },
  remove: { it: "Rimuovi", en: "Remove", de: "Entfernen", es: "Eliminar" },

  // Step 1
  generalTitle: {
    it: "Dati Generali del Collaudo",
    en: "General Test Data",
    de: "Allgemeine Prüfdaten",
    es: "Datos generales de la prueba",
  },
  generalDesc: {
    it: "Inserisci le informazioni che compariranno nel frontespizio del verbale.",
    en: "Enter the information that will appear on the report cover page.",
    de: "Geben Sie die Informationen ein, die auf dem Deckblatt erscheinen.",
    es: "Introduce la información que aparecerá en la portada del informe.",
  },
  manufacturerTitle: { it: "Ente Costruttore", en: "Manufacturer", de: "Hersteller", es: "Fabricante" },
  customerTitle: { it: "Ente Verificatore", en: "Verifying Body", de: "Prüfstelle", es: "Organismo Verificador" },
  commonTitle: { it: "Dati del Collaudo", en: "Test Data", de: "Prüfdaten", es: "Datos de la prueba" },
  attendeesTitle: { it: "Presenti al FAT", en: "FAT Attendees", de: "FAT-Teilnehmer", es: "Asistentes al FAT" },
  attendeesDesc: {
    it: "Elenca le persone presenti al collaudo. Puoi aggiungerne altre.",
    en: "List the people attending the test. You can add more.",
    de: "Listen Sie die Teilnehmer der Prüfung auf. Sie können weitere hinzufügen.",
    es: "Enumera las personas presentes en la prueba. Puedes añadir más.",
  },
  addAttendee: { it: "Aggiungi presente", en: "Add attendee", de: "Teilnehmer hinzufügen", es: "Añadir asistente" },

  // Field labels
  companyName: { it: "Ragione Sociale", en: "Company Name", de: "Firmenname", es: "Razón social" },
  address: { it: "Indirizzo", en: "Address", de: "Adresse", es: "Dirección" },
  contact: { it: "Referente", en: "Contact Person", de: "Ansprechpartner", es: "Persona de contacto" },
  email: { it: "Email", en: "Email", de: "E-Mail", es: "Correo electrónico" },
  phone: { it: "Telefono", en: "Phone", de: "Telefon", es: "Teléfono" },
  drawingNo: {
    it: "N° Disegno / Specifica",
    en: "Drawing / Specification No.",
    de: "Zeichnungs-/Spezifikationsnr.",
    es: "N.º Plano / Especificación",
  },
  serialNo: { it: "N° Fabbrica / Matricola", en: "Serial No.", de: "Seriennummer", es: "N.º de serie" },
  tagNo: { it: "Tag Number Cliente", en: "Customer Tag Number", de: "Kunden-Tag-Nummer", es: "N.º de Tag cliente" },
  orderNo: { it: "Nr Ordine Cliente", en: "Customer Order No.", de: "Kunden-Bestellnummer", es: "N.º Pedido Cliente" },
  testDate: { it: "Data del Collaudo", en: "Test Date", de: "Prüfdatum", es: "Fecha de la prueba" },
  testPlace: { it: "Luogo del Collaudo", en: "Test Location", de: "Prüfort", es: "Lugar de la prueba" },
  commessa: { it: "Commessa", en: "Job Number", de: "Auftragsnummer", es: "Número de pedido" },
  attendeeName: { it: "Nome e Cognome", en: "Full Name", de: "Vor- und Nachname", es: "Nombre y apellido" },
  attendeeRole: { it: "Ruolo", en: "Role", de: "Rolle", es: "Rol" },
  attendeeCompany: { it: "Azienda", en: "Company", de: "Firma", es: "Empresa" },
  companyOther: { it: "Altro…", en: "Other…", de: "Andere…", es: "Otro…" },
  companyOtherPlaceholder: {
    it: "Specifica azienda",
    en: "Specify company",
    de: "Firma angeben",
    es: "Especifica empresa",
  },
  descrizione: { it: "Descrizione", en: "Description", de: "Beschreibung", es: "Descripción" },
  descrizionePlaceholder: {
    it: "Oggetto del collaudo, descrizione dell'apparecchiatura, riferimenti…",
    en: "Test object, equipment description, references…",
    de: "Prüfgegenstand, Gerätebeschreibung, Referenzen…",
    es: "Objeto de la prueba, descripción del equipo, referencias…",
  },

  // Conclusioni / Final results
  conclusioniTitle: { it: "Conclusioni", en: "Final results", de: "Schlussfolgerungen", es: "Conclusiones" },
  serbAccettato: { it: "Serb. accettato", en: "Tank accepted", de: "Behälter akzeptiert", es: "Depósito aceptado" },
  motivoNonAccettazione: {
    it: "Motivo della non-accettazione",
    en: "Reason for non-acceptance",
    de: "Grund der Ablehnung",
    es: "Motivo del rechazo",
  },
  noteRilievi: { it: "Note / Rilievi", en: "Notes / Remarks", de: "Anmerkungen", es: "Notas / Observaciones" },
  azioniCorrettive: {
    it: "Azioni correttive da intraprendere",
    en: "Corrective actions to be taken",
    de: "Zu ergreifende Korrekturmaßnahmen",
    es: "Acciones correctivas a tomar",
  },
  dataIspezione: { it: "Data", en: "Date", de: "Datum", es: "Fecha" },
  ispettoreEsterno: {
    it: "Ispettore esterno / cliente",
    en: "External / client inspector",
    de: "Externer / Kunden-Inspektor",
    es: "Inspector externo / cliente",
  },
  controlloInterno: { it: "Controllo interno", en: "Internal control", de: "Interne Kontrolle", es: "Control interno" },
  dopoAzioni: {
    it: "Dopo azioni correttive il serbatoio è stato accettato",
    en: "After corrective actions the tank was accepted",
    de: "Nach Korrekturmaßnahmen wurde der Behälter akzeptiert",
    es: "Tras las acciones correctivas, el depósito fue aceptado",
  },
  dataFinale: { it: "Data finale", en: "Final date", de: "Enddatum", es: "Fecha final" },
  firma: { it: "Firma", en: "Signature", de: "Unterschrift", es: "Firma" },
  optYes: { it: "SI", en: "YES", de: "JA", es: "SÍ" },
  optNo: { it: "NO", en: "NO", de: "NEIN", es: "NO" },
  optNa: { it: "NA", en: "NA", de: "N/A", es: "N/D" },

  required: { it: "Campo obbligatorio", en: "Required field", de: "Pflichtfeld", es: "Campo obligatorio" },

  // Step 2
  controlsTitle: { it: "Lista Controlli", en: "Check List", de: "Prüfliste", es: "Lista de controles" },
  controlsDesc: {
    it: "Seleziona i controlli (meccanici, elettrici, software) che faranno parte del verbale.",
    en: "Select the checks (mechanical, electrical, software) to include in the report.",
    de: "Wählen Sie die Prüfungen (mechanisch, elektrisch, Software) für den Bericht.",
    es: "Selecciona los controles (mecánicos, eléctricos, software) a incluir en el informe.",
  },
  customLabel: { it: "personalizzato", en: "custom", de: "benutzerdefiniert", es: "personalizado" },
  addCustom: {
    it: "Aggiungi controllo personalizzato",
    en: "Add custom check",
    de: "Eigene Prüfung hinzufügen",
    es: "Añadir control personalizado",
  },
  customPlaceholder: {
    it: "Descrivi il controllo da aggiungere…",
    en: "Describe the check to add…",
    de: "Beschreiben Sie die hinzuzufügende Prüfung…",
    es: "Describe el control a añadir…",
  },
  selectedCount: { it: "selezionati", en: "selected", de: "ausgewählt", es: "seleccionados" },

  // Step 3
  reportSubtitle: {
    it: "Riepilogo e generazione del PDF",
    en: "Summary and PDF generation",
    de: "Zusammenfassung und PDF-Erstellung",
    es: "Resumen y generación del PDF",
  },
  generatePdf: { it: "Genera Report FAT", en: "Generate FAT Report", de: "FAT-Bericht erstellen", es: "Generar informe FAT" },
  restart: { it: "Ricomincia", en: "Restart", de: "Neu starten", es: "Reiniciar" },
  restartConfirm: {
    it: "Vuoi davvero ricominciare? Tutti i dati verranno cancellati.",
    en: "Do you really want to restart? All data will be cleared.",
    de: "Wirklich neu starten? Alle Daten werden gelöscht.",
    es: "¿Seguro que quieres reiniciar? Se borrarán todos los datos.",
  },
  summaryGeneral: { it: "Dati Generali", en: "General Data", de: "Allgemeine Daten", es: "Datos generales" },
  summaryControls: { it: "Controlli selezionati", en: "Selected checks", de: "Ausgewählte Prüfungen", es: "Controles seleccionados" },
  summaryControlsDesc: {
    it: "Ogni controllo avrà un capitolo dedicato nel PDF.",
    en: "Each check will have a dedicated chapter in the PDF.",
    de: "Jede Prüfung hat ein eigenes Kapitel im PDF.",
    es: "Cada control tendrá un capítulo dedicado en el PDF.",
  },
  noneSelected: { it: "Nessun controllo selezionato.", en: "No check selected.", de: "Keine Prüfung ausgewählt.", es: "Ningún control seleccionado." },
  goBack: { it: "Torna indietro", en: "Go back", de: "Zurück", es: "Volver" },
  modifyControls: { it: "← Modifica controlli", en: "← Edit checks", de: "← Prüfungen bearbeiten", es: "← Editar controles" },

  // PDF
  pdfTitle: { it: "VERBALE DI COLLAUDO", en: "TEST REPORT", de: "PRÜFBERICHT", es: "INFORME DE PRUEBA" },
  pdfSubtitle: {
    it: "FACTORY ACCEPTANCE TEST",
    en: "FACTORY ACCEPTANCE TEST",
    de: "FACTORY ACCEPTANCE TEST",
    es: "FACTORY ACCEPTANCE TEST",
  },

  // Archivio FAT
  archiveTitle: { it: "Archivio FAT", en: "FAT Archive", de: "FAT-Archiv", es: "Archivo FAT" },
  archiveDesc: {
    it: "Tutti i FAT salvati, suddivisi per stato. Puoi aprirli, duplicarli o eliminarli.",
    en: "All saved FATs grouped by status. Open, duplicate or delete them.",
    de: "Alle gespeicherten FATs nach Status gruppiert. Öffnen, duplizieren oder löschen.",
    es: "Todos los FAT guardados agrupados por estado. Abrir, duplicar o eliminar.",
  },
  archiveOpen: { it: "Archivio", en: "Archive", de: "Archiv", es: "Archivo" },
  saveDraft: { it: "Salva bozza", en: "Save draft", de: "Entwurf speichern", es: "Guardar borrador" },
  newFat: { it: "Nuovo FAT", en: "New FAT", de: "Neues FAT", es: "Nuevo FAT" },
  open: { it: "Apri", en: "Open", de: "Öffnen", es: "Abrir" },
  duplicate: { it: "Duplica", en: "Duplicate", de: "Duplizieren", es: "Duplicar" },
  deleteAction: { it: "Elimina", en: "Delete", de: "Löschen", es: "Eliminar" },
  status: { it: "Stato", en: "Status", de: "Status", es: "Estado" },
  lastUpdated: { it: "Ultima modifica", en: "Last updated", de: "Zuletzt geändert", es: "Última modificación" },
  statusTodo: { it: "Da lavorare", en: "To do", de: "Zu erledigen", es: "Por hacer" },
  statusInProgress: { it: "In lavorazione", en: "In progress", de: "In Bearbeitung", es: "En curso" },
  statusDone: { it: "Completati", en: "Completed", de: "Abgeschlossen", es: "Completados" },
  statusAll: { it: "Tutti", en: "All", de: "Alle", es: "Todos" },
  noFats: { it: "Nessun FAT in questa categoria.", en: "No FAT in this category.", de: "Keine FAT in dieser Kategorie.", es: "Ningún FAT en esta categoría." },
  confirmDelete: {
    it: "Eliminare definitivamente questo FAT?",
    en: "Permanently delete this FAT?",
    de: "Diesen FAT endgültig löschen?",
    es: "¿Eliminar definitivamente este FAT?",
  },
  draftSaved: { it: "Bozza salvata.", en: "Draft saved.", de: "Entwurf gespeichert.", es: "Borrador guardado." },
  reportGeneratedDone: {
    it: "Report generato — FAT completato.",
    en: "Report generated — FAT marked as done.",
    de: "Bericht erstellt — FAT als abgeschlossen markiert.",
    es: "Informe generado — FAT marcado como completado.",
  },
  untitledFat: { it: "FAT senza titolo", en: "Untitled FAT", de: "FAT ohne Titel", es: "FAT sin título" },
  activeFat: { it: "FAT attivo", en: "Active FAT", de: "Aktiver FAT", es: "FAT activo" },
  viewReport: { it: "Apri report", en: "Open report", de: "Bericht öffnen", es: "Abrir informe" },
} satisfies Record<string, Entry>;

type Ctx = {
  /** Primary language (alias for back-compat). */
  lang: Lang;
  primary: Lang;
  secondary: Lang | null;
  setLang: (l: Lang) => void;
  /** Cycle click logic: 1st click = primary, 2nd (different) = secondary, 3rd = reset. */
  cycleLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
};

const I18nContext = React.createContext<Ctx | null>(null);

const STORAGE_P = "mini-fat:lang:primary";
const STORAGE_S = "mini-fat:lang:secondary";
const STORAGE_LEGACY = "mini-fat:lang";

const isLang = (v: unknown): v is Lang =>
  v === "it" || v === "en" || v === "de" || v === "es";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [primary, setPrimary] = React.useState<Lang>("it");
  const [secondary, setSecondary] = React.useState<Lang | null>("en");

  React.useEffect(() => {
    try {
      const p = localStorage.getItem(STORAGE_P) ?? localStorage.getItem(STORAGE_LEGACY);
      const s = localStorage.getItem(STORAGE_S);
      if (isLang(p)) setPrimary(p);
      if (s === "" || s === "null") setSecondary(null);
      else if (isLang(s)) setSecondary(s);
    } catch {}
  }, []);

  const persist = (p: Lang, s: Lang | null) => {
    try {
      localStorage.setItem(STORAGE_P, p);
      localStorage.setItem(STORAGE_S, s ?? "");
    } catch {}
  };

  const setLang = (l: Lang) => {
    setPrimary(l);
    persist(l, secondary);
  };

  const cycleLang = (l: Lang) => {
    // Stato 1: click su lingua primaria → reset secondaria (resta solo primaria)
    if (l === primary && secondary) {
      setSecondary(null);
      persist(primary, null);
      return;
    }
    // Stato 2: nessuna secondaria e click su lingua diversa → diventa secondaria
    if (!secondary && l !== primary) {
      setSecondary(l);
      persist(primary, l);
      return;
    }
    // Stato 3: c'è già una secondaria e click su nuova lingua → ricomincia (nuova primaria)
    if (secondary && l !== primary && l !== secondary) {
      setPrimary(l);
      setSecondary(null);
      persist(l, null);
      return;
    }
    // Click su secondaria attuale → diventa la nuova primaria, swap
    if (l === secondary) {
      setPrimary(l);
      setSecondary(primary);
      persist(l, primary);
      return;
    }
    // Click su primaria senza secondaria → no-op
  };

  const t = React.useCallback(
    (key: keyof typeof dict) => {
      const entry = dict[key] as Entry | undefined;
      if (!entry) return String(key);
      const p = entry[primary];
      if (!secondary) return p;
      const s = entry[secondary];
      if (p === s) return p;
      return `${p} / ${s}`;
    },
    [primary, secondary],
  );

  const value = React.useMemo(
    () => ({ lang: primary, primary, secondary, setLang, cycleLang, t }),
    [primary, secondary, t],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LangSwitcher({ className }: { className?: string }) {
  const { primary, secondary, cycleLang } = useI18n();
  const opts: { code: Lang; flag: string; label: string }[] = [
    { code: "it", flag: "🇮🇹", label: "Italiano" },
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "de", flag: "🇩🇪", label: "Deutsch" },
    { code: "es", flag: "🇪🇸", label: "Español" },
  ];
  return (
    <div className={"flex items-center gap-1 " + (className ?? "")}>
      {opts.map((o) => {
        const isPrimary = primary === o.code;
        const isSecondary = secondary === o.code;
        const order = isPrimary ? 1 : isSecondary ? 2 : null;
        const base =
          "relative h-8 w-9 rounded-md border text-base leading-none transition-all hover:scale-110";
        const style = isPrimary
          ? " border-primary bg-primary/10 ring-2 ring-primary/40"
          : isSecondary
            ? " border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
            : " border-border opacity-60 hover:opacity-100";
        return (
          <button
            key={o.code}
            type="button"
            aria-label={o.label}
            title={`${o.label}${order ? ` (${order})` : ""}`}
            onClick={() => cycleLang(o.code)}
            className={base + style}
          >
            {o.flag}
            {order && (
              <span
                className={
                  "absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white " +
                  (isPrimary ? "bg-primary" : "bg-emerald-500")
                }
              >
                {order}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
