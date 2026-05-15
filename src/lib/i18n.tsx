import * as React from "react";

export type Lang = "it" | "en";

type Dict = Record<string, { it: string; en: string }>;

const dict: Dict = {
  // Header
  appSubtitle: {
    it: "Generatore di verbali di Factory Acceptance Test",
    en: "Factory Acceptance Test report generator",
  },

  // Stepper
  stepGeneral: { it: "Dati Generali", en: "General Data" },
  stepControls: { it: "Controlli", en: "Checks" },
  stepReport: { it: "Report PDF", en: "PDF Report" },

  // Common
  back: { it: "← Indietro", en: "← Back" },
  next: { it: "Avanti →", en: "Next →" },
  add: { it: "Aggiungi", en: "Add" },
  remove: { it: "Rimuovi", en: "Remove" },

  // Step 1
  generalTitle: { it: "Dati Generali del Collaudo", en: "General Test Data" },
  generalDesc: {
    it: "Inserisci le informazioni che compariranno nel frontespizio del verbale.",
    en: "Enter the information that will appear on the report cover page.",
  },
  manufacturerTitle: { it: "Ditta Produttrice", en: "Manufacturer" },
  customerTitle: { it: "Ditta Cliente", en: "Customer" },
  commonTitle: { it: "Dati del Collaudo", en: "Test Data" },
  attendeesTitle: { it: "Presenti al FAT", en: "FAT Attendees" },
  attendeesDesc: {
    it: "Elenca le persone presenti al collaudo. Puoi aggiungerne altre.",
    en: "List the people attending the test. You can add more.",
  },
  addAttendee: { it: "Aggiungi presente", en: "Add attendee" },

  // Field labels
  companyName: { it: "Ragione Sociale", en: "Company Name" },
  address: { it: "Indirizzo", en: "Address" },
  contact: { it: "Referente", en: "Contact Person" },
  email: { it: "Email", en: "Email" },
  phone: { it: "Telefono", en: "Phone" },
  drawingNo: { it: "N° Disegno / Specifica", en: "Drawing / Specification No." },
  serialNo: { it: "N° Fabbrica / Matricola", en: "Serial No." },
  tagNo: { it: "Tag Number Cliente", en: "Customer Tag Number" },
  testDate: { it: "Data del Collaudo", en: "Test Date" },
  testPlace: { it: "Luogo del Collaudo", en: "Test Location" },
  attendeeName: { it: "Nome e Cognome", en: "Full Name" },
  attendeeRole: { it: "Ruolo / Azienda", en: "Role / Company" },

  required: { it: "Campo obbligatorio", en: "Required field" },

  // Step 2
  controlsTitle: { it: "Lista Controlli", en: "Check List" },
  controlsDesc: {
    it: "Seleziona i controlli (meccanici, elettrici, software) che faranno parte del verbale.",
    en: "Select the checks (mechanical, electrical, software) to include in the report.",
  },
  customLabel: { it: "personalizzato", en: "custom" },
  addCustom: {
    it: "Aggiungi controllo personalizzato",
    en: "Add custom check",
  },
  customPlaceholder: {
    it: "Descrivi il controllo da aggiungere…",
    en: "Describe the check to add…",
  },
  selectedCount: {
    it: "selezionati",
    en: "selected",
  },

  // Step 3
  reportSubtitle: {
    it: "Riepilogo e generazione del PDF",
    en: "Summary and PDF generation",
  },
  generatePdf: { it: "Genera Report FAT", en: "Generate FAT Report" },
  restart: { it: "Ricomincia", en: "Restart" },
  restartConfirm: {
    it: "Vuoi davvero ricominciare? Tutti i dati verranno cancellati.",
    en: "Do you really want to restart? All data will be cleared.",
  },
  summaryGeneral: { it: "Dati Generali", en: "General Data" },
  summaryControls: { it: "Controlli selezionati", en: "Selected checks" },
  summaryControlsDesc: {
    it: "Ogni controllo avrà un capitolo dedicato nel PDF.",
    en: "Each check will have a dedicated chapter in the PDF.",
  },
  noneSelected: { it: "Nessun controllo selezionato.", en: "No check selected." },
  goBack: { it: "Torna indietro", en: "Go back" },
  modifyControls: { it: "← Modifica controlli", en: "← Edit checks" },

  // PDF
  pdfTitle: { it: "VERBALE DI COLLAUDO", en: "TEST REPORT" },
  pdfSubtitle: {
    it: "FACTORY ACCEPTANCE TEST",
    en: "FACTORY ACCEPTANCE TEST",
  },
  pdfManufacturer: { it: "Ditta Produttrice", en: "Manufacturer" },
  pdfCustomer: { it: "Ditta Cliente", en: "Customer" },
  pdfCommon: { it: "Dati del Collaudo", en: "Test Data" },
  pdfAttendees: { it: "Presenti al FAT", en: "FAT Attendees" },
  pdfField: { it: "Campo", en: "Field" },
  pdfValue: { it: "Valore", en: "Value" },
  pdfRole: { it: "Ruolo / Azienda", en: "Role / Company" },
  pdfName: { it: "Nome e Cognome", en: "Full Name" },
  pdfSignatures: { it: "FIRME", en: "SIGNATURES" },
  pdfForManufacturer: { it: "Per il Costruttore", en: "For the Manufacturer" },
  pdfForCustomer: { it: "Per il Cliente", en: "For the Customer" },
  pdfSignName: { it: "Nome e Cognome:", en: "Full Name:" },
  pdfSignDate: { it: "Data:", en: "Date:" },
  pdfSignSignature: { it: "Firma:", en: "Signature:" },
  pdfChapter: { it: "Controllo", en: "Check" },
  pdfOutcome: { it: "Esito", en: "Outcome" },
  pdfNotes: { it: "Note / Rilievi", en: "Notes / Findings" },
  pdfInspectorSign: { it: "Firma Ispettore", en: "Inspector Signature" },
  pdfPage: { it: "Pagina", en: "Page" },
  pdfOf: { it: "di", en: "of" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
};

const I18nContext = React.createContext<Ctx | null>(null);

const STORAGE = "mini-fat:lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("it");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved === "it" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {}
  };

  const t = React.useCallback(
    (key: keyof typeof dict) => dict[key]?.[lang] ?? String(key),
    [lang],
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function LangSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const btn =
    "h-8 w-9 rounded-md border text-base leading-none transition-all hover:scale-110";
  return (
    <div className={"flex items-center gap-1 " + (className ?? "")}>
      <button
        type="button"
        aria-label="Italiano"
        onClick={() => setLang("it")}
        className={
          btn +
          (lang === "it"
            ? " border-primary ring-2 ring-primary/30"
            : " border-border opacity-60 hover:opacity-100")
        }
        title="Italiano"
      >
        🇮🇹
      </button>
      <button
        type="button"
        aria-label="English"
        onClick={() => setLang("en")}
        className={
          btn +
          (lang === "en"
            ? " border-primary ring-2 ring-primary/30"
            : " border-border opacity-60 hover:opacity-100")
        }
        title="English"
      >
        🇬🇧
      </button>
    </div>
  );
}
