import type { Lang } from "./i18n";

/** Lista controlli predefiniti (etichetta IT, pulita).  La traduzione vive in CONTROL_TRANSLATIONS. */
export const DEFAULT_CONTROLS: string[] = [
  // ── Documenti / Certificati richiesti ───────────────────────────────────
  "Certificazioni e attestazioni del costruttore (ISO 9001, ISO 14001, ecc.)",
  "Certificati dei materiali – EN 10204 3.1 (virola, fondo, coperchio)",
  "Qualifica procedimenti di saldatura (WPS/PQR)",
  "Qualifica saldatori / operatori (WPQ)",
  "Rapporto verifica spessori",
  "Esame visivo e dimensionale",
  "Esame visivo saldature",
  "Rugosità interna – dichiarazione + metodo lucidatura",
  "Decappaggio e passivazione – certificato + sostanze utilizzate",
  "Dye check / Liquidi penetranti (LP)",
  "Rapporto NDT (VT, PT, RT, UT, MT)",
  "Prova idraulica – certificato",
  "Prova pneumatica (piastre di rinforzo)",
  "Prova drenaggio e lavaggio",
  "Sistema di lavaggio (sprayballs) – test fluoresceina/riboflavina",
  "Prova funzionale agitatore (ove presente)",
  "Certificato ispezione visiva (SAT/FAT)",
  "Dichiarazione art. 4.3 PED",
  "Dichiarazione CE PED finale dell'apparecchiatura",
  "Dichiarazione \u201C-0,5 bar\u201D (resistenza al vuoto)",
  "Dichiarazione ATEX (se applicabile)",
  "Dichiarazione di incorporazione tipo A (macchina completa)",
  "Dichiarazione di incorporazione tipo B (quasi macchina)",
  "Dichiarazione di prestazione asservimento EN 1090",
  "Dichiarazione di prestazione EN 1090 (DoP)",
  "Dichiarazione MOCA / Food contact",
  "Certificazioni materiali plastici/elastomeri – FDA 21 CFR 177",
  "Conformità alle normative di progettazione utilizzate",
  "Dichiarazione codici di calcolo impiegati",
  "Conformità alla specifica tecnica e al datasheet",
  "Rispondenza al disegno costruttivo",
  "Disegno costruttivo \u201CAs Built\u201D",
  "Corrispondenza con ordine di acquisto",
  "Conformità della fornitura",
  "Conformità alle procedure di fabbricazione",
  "Manuale di istruzioni (uso, installazione, manutenzione)",
  "Elenco connessioni",
  "Calibrazioni strumenti",
  "Guarnizioni – dichiarazioni materiali MOCA",
  "Elenco oli lubrificanti e fluidi di servizio",
  "Procedura conservazione attrezzature pre-installazione",
  "Targhetta identificativa – dati obbligatori (verifica)",
  "Presenza accessori – check list",
  "Dichiarazione di installazione a regola d'arte",
  "Imballo e pulizia",
  "Mezzi di sollevamento e carico/scarico",
  "Requisiti di trasporto, mezzi e personale per lo scarico",
  "Pianificazione spedizione",
  // ── Ultime righe fisse (sempre selezionate, non disattivabili) ──────────
  "Varie – allegati tecnici",
  "Elenco deviazioni / non conformità",
  "Azioni correttive",
];

/** Etichette degli ultimi 3 controlli che devono SEMPRE essere selezionati. */
export const FINAL_LOCKED_LABELS: ReadonlySet<string> = new Set([
  "Varie – allegati tecnici",
  "Elenco deviazioni / non conformità",
  "Azioni correttive",
]);

/**
 * Traduzioni delle etichette dei controlli.  Chiave = etichetta IT esatta
 * di DEFAULT_CONTROLS.  Se manca una lingua, fallback su EN, poi su IT.
 */
export const CONTROL_TRANSLATIONS: Record<string, Partial<Record<Lang, string>>> = {
  "Certificazioni e attestazioni del costruttore (ISO 9001, ISO 14001, ecc.)": {
    en: "Manufacturer certifications and attestations (ISO 9001, ISO 14001, etc.)",
    de: "Herstellerzertifizierungen und -bescheinigungen (ISO 9001, ISO 14001 usw.)",
    es: "Certificaciones y atestaciones del fabricante (ISO 9001, ISO 14001, etc.)",
  },
  "Certificati dei materiali – EN 10204 3.1 (virola, fondo, coperchio)": {
    en: "Material certificates – EN 10204 3.1 (shell, bottom, cover)",
    de: "Materialzertifikate – EN 10204 3.1 (Mantel, Boden, Deckel)",
    es: "Certificados de materiales – EN 10204 3.1 (virola, fondo, tapa)",
  },
  "Qualifica procedimenti di saldatura (WPS/PQR)": {
    en: "Welding procedure qualification (WPS/PQR)",
    de: "Qualifizierung der Schweißverfahren (WPS/PQR)",
    es: "Calificación de procedimientos de soldadura (WPS/PQR)",
  },
  "Qualifica saldatori / operatori (WPQ)": {
    en: "Welder / operator qualification (WPQ)",
    de: "Qualifizierung der Schweißer / Bediener (WPQ)",
    es: "Calificación de soldadores / operadores (WPQ)",
  },
  "Rapporto verifica spessori": {
    en: "Thickness test report",
    de: "Wandstärkenprüfbericht",
    es: "Informe de verificación de espesores",
  },
  "Esame visivo e dimensionale": {
    en: "Visual and dimensional examination",
    de: "Sicht- und Maßprüfung",
    es: "Examen visual y dimensional",
  },
  "Esame visivo saldature": {
    en: "Visual examination of welds",
    de: "Sichtprüfung der Schweißnähte",
    es: "Examen visual de soldaduras",
  },
  "Rugosità interna – dichiarazione + metodo lucidatura": {
    en: "Internal roughness – declaration + polishing method",
    de: "Innenrauheit – Erklärung + Polierverfahren",
    es: "Rugosidad interna – declaración + método de pulido",
  },
  "Decappaggio e passivazione – certificato + sostanze utilizzate": {
    en: "Pickling and passivation – certificate + substances used",
    de: "Beizen und Passivieren – Zertifikat + verwendete Stoffe",
    es: "Decapado y pasivación – certificado + sustancias utilizadas",
  },
  "Dye check / Liquidi penetranti (LP)": {
    en: "Dye check / Liquid penetrants (LP)",
    de: "Farbeindringprüfung / Eindringmittel (PT)",
    es: "Dye check / Líquidos penetrantes (LP)",
  },
  "Rapporto NDT (VT, PT, RT, UT, MT)": {
    en: "NDT report (VT, PT, RT, UT, MT)",
    de: "ZfP-Bericht (VT, PT, RT, UT, MT)",
    es: "Informe END (VT, PT, RT, UT, MT)",
  },
  "Prova idraulica – certificato": {
    en: "Hydraulic test – certificate",
    de: "Hydraulische Prüfung – Zertifikat",
    es: "Prueba hidráulica – certificado",
  },
  "Prova pneumatica (piastre di rinforzo)": {
    en: "Pneumatic test (reinforcement plates)",
    de: "Pneumatische Prüfung (Verstärkungsplatten)",
    es: "Prueba neumática (placas de refuerzo)",
  },
  "Prova drenaggio e lavaggio": {
    en: "Drainage and washing test",
    de: "Entleerungs- und Spülprüfung",
    es: "Prueba de drenaje y lavado",
  },
  "Sistema di lavaggio (sprayballs) – test fluoresceina/riboflavina": {
    en: "Washing system (sprayballs) – fluorescein/riboflavin test",
    de: "Reinigungssystem (Sprayballs) – Fluorescein-/Riboflavin-Test",
    es: "Sistema de lavado (sprayballs) – prueba fluoresceína/riboflavina",
  },
  "Prova funzionale agitatore (ove presente)": {
    en: "Agitator functional test (where present)",
    de: "Funktionsprüfung des Rührwerks (sofern vorhanden)",
    es: "Prueba funcional del agitador (si está presente)",
  },
  "Certificato ispezione visiva (SAT/FAT)": {
    en: "Visual inspection certificate (SAT/FAT)",
    de: "Sichtprüfungszertifikat (SAT/FAT)",
    es: "Certificado de inspección visual (SAT/FAT)",
  },
  "Dichiarazione art. 4.3 PED": {
    en: "PED Art. 4.3 declaration",
    de: "Erklärung gemäß Art. 4.3 PED",
    es: "Declaración art. 4.3 PED",
  },
  "Dichiarazione CE PED finale dell'apparecchiatura": {
    en: "Final CE PED declaration of the equipment",
    de: "Endgültige CE-PED-Erklärung des Geräts",
    es: "Declaración CE PED final del equipo",
  },
  "Dichiarazione \u201C-0,5 bar\u201D (resistenza al vuoto)": {
    en: "\u201C-0.5 bar\u201D declaration (vacuum resistance)",
    de: "Erklärung \u201E-0,5 bar\u201C (Vakuumbeständigkeit)",
    es: "Declaración \u201C-0,5 bar\u201D (resistencia al vacío)",
  },
  "Dichiarazione ATEX (se applicabile)": {
    en: "ATEX declaration (if applicable)",
    de: "ATEX-Erklärung (sofern zutreffend)",
    es: "Declaración ATEX (si aplica)",
  },
  "Dichiarazione di incorporazione tipo A (macchina completa)": {
    en: "Declaration of incorporation type A (complete machine)",
    de: "Einbauerklärung Typ A (vollständige Maschine)",
    es: "Declaración de incorporación tipo A (máquina completa)",
  },
  "Dichiarazione di incorporazione tipo B (quasi macchina)": {
    en: "Declaration of incorporation type B (partly completed machine)",
    de: "Einbauerklärung Typ B (unvollständige Maschine)",
    es: "Declaración de incorporación tipo B (cuasi máquina)",
  },
  "Dichiarazione di prestazione asservimento EN 1090": {
    en: "EN 1090 servicing performance declaration",
    de: "Leistungserklärung Zubehör EN 1090",
    es: "Declaración de prestaciones servidumbre EN 1090",
  },
  "Dichiarazione di prestazione EN 1090 (DoP)": {
    en: "EN 1090 declaration of performance (DoP)",
    de: "Leistungserklärung EN 1090 (DoP)",
    es: "Declaración de prestaciones EN 1090 (DoP)",
  },
  "Dichiarazione MOCA / Food contact": {
    en: "MOCA / Food contact declaration",
    de: "MOCA-/Lebensmittelkontakt-Erklärung",
    es: "Declaración MOCA / Contacto alimentario",
  },
  "Certificazioni materiali plastici/elastomeri – FDA 21 CFR 177": {
    en: "Plastic/elastomer material certifications – FDA 21 CFR 177",
    de: "Zertifizierungen Kunststoff-/Elastomerwerkstoffe – FDA 21 CFR 177",
    es: "Certificaciones de materiales plásticos/elastómeros – FDA 21 CFR 177",
  },
  "Conformità alle normative di progettazione utilizzate": {
    en: "Compliance with applicable design standards",
    de: "Konformität mit den angewandten Auslegungsnormen",
    es: "Conformidad con las normas de diseño utilizadas",
  },
  "Dichiarazione codici di calcolo impiegati": {
    en: "Declaration of calculation codes used",
    de: "Erklärung der verwendeten Berechnungscodes",
    es: "Declaración de códigos de cálculo empleados",
  },
  "Conformità alla specifica tecnica e al datasheet": {
    en: "Compliance with technical specification and datasheet",
    de: "Konformität mit technischer Spezifikation und Datenblatt",
    es: "Conformidad con la especificación técnica y la hoja de datos",
  },
  "Rispondenza al disegno costruttivo": {
    en: "Conformance with construction drawing",
    de: "Übereinstimmung mit der Konstruktionszeichnung",
    es: "Correspondencia con el plano constructivo",
  },
  "Disegno costruttivo \u201CAs Built\u201D": {
    en: "\u201CAs Built\u201D construction drawing",
    de: "Konstruktionszeichnung \u201EAs Built\u201C",
    es: "Plano constructivo \u201CAs Built\u201D",
  },
  "Corrispondenza con ordine di acquisto": {
    en: "Match with purchase order",
    de: "Übereinstimmung mit der Bestellung",
    es: "Correspondencia con la orden de compra",
  },
  "Conformità della fornitura": {
    en: "Supply conformity",
    de: "Konformität der Lieferung",
    es: "Conformidad del suministro",
  },
  "Conformità alle procedure di fabbricazione": {
    en: "Compliance with manufacturing procedures",
    de: "Konformität mit den Fertigungsverfahren",
    es: "Conformidad con los procedimientos de fabricación",
  },
  "Manuale di istruzioni (uso, installazione, manutenzione)": {
    en: "Instruction manual (use, installation, maintenance)",
    de: "Betriebsanleitung (Gebrauch, Installation, Wartung)",
    es: "Manual de instrucciones (uso, instalación, mantenimiento)",
  },
  "Elenco connessioni": {
    en: "Connection list",
    de: "Anschlussliste",
    es: "Lista de conexiones",
  },
  "Calibrazioni strumenti": {
    en: "Instrument calibrations",
    de: "Kalibrierungen der Instrumente",
    es: "Calibraciones de instrumentos",
  },
  "Guarnizioni – dichiarazioni materiali MOCA": {
    en: "Gaskets – MOCA material declarations",
    de: "Dichtungen – MOCA-Werkstofferklärungen",
    es: "Juntas – declaraciones de materiales MOCA",
  },
  "Elenco oli lubrificanti e fluidi di servizio": {
    en: "List of lubricating oils and service fluids",
    de: "Liste der Schmieröle und Betriebsflüssigkeiten",
    es: "Lista de aceites lubricantes y fluidos de servicio",
  },
  "Procedura conservazione attrezzature pre-installazione": {
    en: "Equipment pre-installation preservation procedure",
    de: "Verfahren zur Konservierung der Ausrüstung vor der Installation",
    es: "Procedimiento de conservación de equipos previo a la instalación",
  },
  "Targhetta identificativa – dati obbligatori (verifica)": {
    en: "Identification nameplate – mandatory data (verification)",
    de: "Typenschild – Pflichtangaben (Überprüfung)",
    es: "Placa de identificación – datos obligatorios (verificación)",
  },
  "Presenza accessori – check list": {
    en: "Accessories presence – check list",
    de: "Vorhandensein des Zubehörs – Checkliste",
    es: "Presencia de accesorios – check list",
  },
  "Dichiarazione di installazione a regola d'arte": {
    en: "Declaration of workmanlike installation",
    de: "Erklärung der fachgerechten Installation",
    es: "Declaración de instalación conforme a la regla del arte",
  },
  "Imballo e pulizia": {
    en: "Packing and cleaning",
    de: "Verpackung und Reinigung",
    es: "Embalaje y limpieza",
  },
  "Mezzi di sollevamento e carico/scarico": {
    en: "Lifting and loading/unloading equipment",
    de: "Hebe- sowie Be- und Entladegeräte",
    es: "Medios de elevación y carga/descarga",
  },
  "Requisiti di trasporto, mezzi e personale per lo scarico": {
    en: "Transport requirements, vehicles and unloading personnel",
    de: "Transportanforderungen, Fahrzeuge und Entladepersonal",
    es: "Requisitos de transporte, medios y personal para la descarga",
  },
  "Pianificazione spedizione": {
    en: "Shipping planning",
    de: "Versandplanung",
    es: "Planificación del envío",
  },
  "Varie – allegati tecnici": {
    en: "Miscellaneous – technical attachments",
    de: "Verschiedenes – technische Anlagen",
    es: "Varios – anexos técnicos",
  },
  "Elenco deviazioni / non conformità": {
    en: "List of deviations / non-conformities",
    de: "Liste der Abweichungen / Nichtkonformitäten",
    es: "Lista de desviaciones / no conformidades",
  },
  "Azioni correttive": {
    en: "Corrective actions",
    de: "Korrekturmaßnahmen",
    es: "Acciones correctivas",
  },
};

/** Restituisce la traduzione del controllo nella lingua richiesta (fallback EN, poi IT). */
export function translateControl(label: string, lang: Lang): string {
  if (lang === "it") return label;
  const tr = CONTROL_TRANSLATIONS[label];
  if (!tr) return label;
  return tr[lang] ?? tr.en ?? label;
}
