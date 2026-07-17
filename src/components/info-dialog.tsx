import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n, type Lang } from "@/lib/i18n";

/* ─────────────────────────────────────────────────────────────
   Guida allineata al comportamento reale dell'app:
   - Header con LangSwitcher (primaria/secondaria) + pulsante info
   - Toolbar: Archivio, Salva bozza, Nuovo FAT
   - Stepper: Dati Generali → Controlli → Report
   - Dati Generali: Ente Costruttore, Ente Verificatore, Dati Collaudo,
     Presenti (blocco Costruttore + blocco Cliente)
   - Controlli: preset + personalizzati, selezione
   - Report: riepilogo + Genera Report FAT (produce PDF e marca "completato")
   - Archivio: filtri stato + apri/duplica/elimina, salvataggio in localStorage
   La guida usa SOLO la lingua primaria per leggibilità.
   ───────────────────────────────────────────────────────────── */

type Section = {
  title: string;
  intro?: string;
  bullets?: string[];
};

type GuideContent = {
  dialogTitle: string;
  dialogDescription: string;
  langNote: string;
  sections: Section[];
};

const GUIDE: Record<Lang, GuideContent> = {
  it: {
    dialogTitle: "Mini F.A.T. — Guida all'uso",
    dialogDescription:
      "Come funziona il generatore di verbali di Factory Acceptance Test.",
    langNote:
      "Questa guida segue la lingua primaria selezionata in alto (bandiera con badge 1).",
    sections: [
      {
        title: "1. Cos'è Mini F.A.T.",
        intro:
          "Applicazione web per compilare e generare in PDF i verbali di Factory Acceptance Test. I dati sono salvati localmente nel browser (localStorage); il PDF viene generato sul dispositivo, senza invio a server esterni.",
      },
      {
        title: "2. Barra lingue",
        intro:
          "In alto a destra ci sono quattro bandiere (IT / EN / DE / ES). Cliccando una bandiera diventa la lingua primaria (badge 1); un secondo click su una bandiera diversa la rende secondaria (badge 2). I campi mostrano allora le etichette affiancate nel formato \"primaria / secondaria\" (es. \"Costruttore / Manufacturer\"). Cliccando di nuovo la primaria si rimuove la secondaria.",
      },
      {
        title: "3. Pulsante Informazioni",
        intro:
          "Il pulsante con l'icona (i) accanto alle bandiere apre questa guida. Il testo cambia automaticamente in base alla lingua primaria.",
      },
      {
        title: "4. Toolbar del FAT attivo",
        intro:
          "Sotto l'header è mostrato il FAT attivo (Commessa · Matricola · Cliente) con tre pulsanti:",
        bullets: [
          "Archivio — apre l'elenco di tutti i FAT salvati.",
          "Salva bozza — salva lo stato corrente come bozza (\"In lavorazione\").",
          "Nuovo FAT — crea un nuovo FAT vuoto (l'attuale resta salvato in archivio).",
        ],
      },
      {
        title: "5. Stepper — i 3 passi",
        intro:
          "Un indicatore in alto mostra a che punto sei. Puoi passare da un passo all'altro anche cliccando sul numero.",
        bullets: [
          "1. Dati Generali — anagrafiche e dati del collaudo.",
          "2. Controlli — lista dei controlli da includere nel verbale.",
          "3. Report — riepilogo e generazione del PDF.",
        ],
      },
      {
        title: "6. Passo 1 — Dati Generali",
        intro:
          "Compila queste sezioni (i campi contrassegnati con * sono obbligatori):",
        bullets: [
          "Ente Costruttore — ragione sociale, indirizzo, referente, email, telefono.",
          "Ente Verificatore — stessi campi per il cliente/ente verificatore.",
          "Dati del Collaudo — descrizione, N° disegno, N° matricola, Tag, N° ordine cliente, commessa, luogo e data del collaudo.",
          "Presenti al FAT — due blocchi separati (lato Costruttore e lato Cliente): aggiungi nome, ruolo; l'azienda viene compilata automaticamente dalla ragione sociale della relativa sezione.",
        ],
      },
      {
        title: "7. Passo 2 — Controlli",
        intro:
          "Elenco dei controlli (meccanici, elettrici, software) da includere nel verbale.",
        bullets: [
          "Seleziona/deseleziona i controlli dalla lista.",
          "Puoi aggiungere controlli personalizzati dal campo dedicato.",
          "Puoi riordinare i controlli con il trascinamento.",
          "In fondo alla pagina un contatore mostra quanti controlli sono selezionati.",
        ],
      },
      {
        title: "8. Passo 3 — Report",
        intro:
          "Riepilogo dei dati generali e dei controlli selezionati.",
        bullets: [
          "Ogni controllo selezionato diventerà un capitolo dedicato nel PDF.",
          "Il pulsante \"Genera Report FAT\" produce il PDF e marca il FAT come \"Completato\" nell'archivio.",
          "Il pulsante \"Ricomincia\" azzera tutti i dati del FAT attivo (chiede conferma).",
        ],
      },
      {
        title: "9. Archivio FAT",
        intro:
          "Elenco di tutti i FAT salvati, con filtri per stato: Da lavorare, In lavorazione, Completati, Tutti. Per ciascun FAT sono disponibili le azioni:",
        bullets: [
          "Apri — carica il FAT come attivo e torna alla compilazione.",
          "Duplica — crea una copia indipendente del FAT.",
          "Elimina — rimuove definitivamente il FAT (con conferma).",
        ],
      },
      {
        title: "10. Note tecniche",
        bullets: [
          "Tutti i dati sono salvati nel browser (localStorage), non su un server.",
          "Il PDF è generato interamente sul dispositivo.",
          "Cambiando lingua i testi già inseriti (descrizioni, note) non vengono tradotti: cambiano solo le etichette dell'interfaccia.",
          "Pulendo i dati del browser si perde l'archivio: esporta i PDF importanti.",
        ],
      },
    ],
  },
  en: {
    dialogTitle: "Mini F.A.T. — User guide",
    dialogDescription:
      "How the Factory Acceptance Test report generator works.",
    langNote:
      "This guide follows the primary language selected at the top (flag with badge 1).",
    sections: [
      {
        title: "1. What is Mini F.A.T.",
        intro:
          "Web app to fill in and generate Factory Acceptance Test reports as PDF. Data is stored locally in the browser (localStorage); the PDF is generated on the device, without sending anything to an external server.",
      },
      {
        title: "2. Language bar",
        intro:
          "Top right you have four flags (IT / EN / DE / ES). Clicking a flag makes it the primary language (badge 1); a second click on a different flag makes it the secondary (badge 2). Fields then show the labels side by side as \"primary / secondary\" (e.g. \"Manufacturer / Costruttore\"). Clicking the primary again removes the secondary.",
      },
      {
        title: "3. Info button",
        intro:
          "The (i) button next to the flags opens this guide. The text follows the primary language automatically.",
      },
      {
        title: "4. Active FAT toolbar",
        intro:
          "Below the header the active FAT is shown (Job · Serial · Customer) with three buttons:",
        bullets: [
          "Archive — opens the list of all saved FATs.",
          "Save draft — saves the current state as a draft (\"In progress\").",
          "New FAT — creates a new empty FAT (the current one stays in the archive).",
        ],
      },
      {
        title: "5. Stepper — the 3 steps",
        intro:
          "A top indicator shows where you are. You can jump between steps by clicking the number.",
        bullets: [
          "1. General Data — parties and test details.",
          "2. Checks — list of checks to include in the report.",
          "3. Report — summary and PDF generation.",
        ],
      },
      {
        title: "6. Step 1 — General Data",
        intro:
          "Fill in these sections (fields marked with * are required):",
        bullets: [
          "Manufacturer — company name, address, contact person, email, phone.",
          "Verifying Body — same fields for the customer / verifying body.",
          "Test Data — description, drawing no., serial no., tag, customer order no., job no., test location and date.",
          "FAT Attendees — two separate blocks (Manufacturer side and Customer side): add name and role; the company is auto-filled from the relevant section's company name.",
        ],
      },
      {
        title: "7. Step 2 — Checks",
        intro:
          "List of checks (mechanical, electrical, software) to include in the report.",
        bullets: [
          "Select/deselect checks from the list.",
          "You can add custom checks using the dedicated field.",
          "You can reorder checks by dragging.",
          "A counter at the bottom of the page shows how many are selected.",
        ],
      },
      {
        title: "8. Step 3 — Report",
        intro:
          "Summary of general data and selected checks.",
        bullets: [
          "Each selected check becomes a dedicated chapter in the PDF.",
          "The \"Generate FAT Report\" button produces the PDF and marks the FAT as \"Completed\" in the archive.",
          "The \"Restart\" button clears all data of the active FAT (asks for confirmation).",
        ],
      },
      {
        title: "9. FAT Archive",
        intro:
          "List of all saved FATs, filtered by status: To do, In progress, Completed, All. For each FAT:",
        bullets: [
          "Open — loads the FAT as active and returns to editing.",
          "Duplicate — creates an independent copy of the FAT.",
          "Delete — permanently removes the FAT (with confirmation).",
        ],
      },
      {
        title: "10. Technical notes",
        bullets: [
          "All data is stored in the browser (localStorage), not on a server.",
          "The PDF is generated entirely on the device.",
          "Changing language does not translate already entered text (descriptions, notes): only interface labels change.",
          "Clearing browser data wipes the archive: export important PDFs.",
        ],
      },
    ],
  },
  de: {
    dialogTitle: "Mini F.A.T. — Bedienungsanleitung",
    dialogDescription:
      "So funktioniert der Generator für Factory-Acceptance-Test-Berichte.",
    langNote:
      "Diese Anleitung folgt der oben ausgewählten primären Sprache (Flagge mit Abzeichen 1).",
    sections: [
      {
        title: "1. Was ist Mini F.A.T.",
        intro:
          "Web-App zum Ausfüllen und Erstellen von Factory-Acceptance-Test-Berichten als PDF. Die Daten werden lokal im Browser gespeichert (localStorage); das PDF wird auf dem Gerät erstellt, ohne Übertragung an einen externen Server.",
      },
      {
        title: "2. Sprachleiste",
        intro:
          "Oben rechts gibt es vier Flaggen (IT / EN / DE / ES). Ein Klick auf eine Flagge macht sie zur primären Sprache (Abzeichen 1); ein zweiter Klick auf eine andere Flagge macht sie zur sekundären (Abzeichen 2). Die Felder zeigen dann die Beschriftungen nebeneinander als \"primär / sekundär\" (z. B. \"Hersteller / Manufacturer\"). Ein erneuter Klick auf die primäre entfernt die sekundäre.",
      },
      {
        title: "3. Info-Schaltfläche",
        intro:
          "Die (i)-Schaltfläche neben den Flaggen öffnet diese Anleitung. Der Text wechselt automatisch mit der primären Sprache.",
      },
      {
        title: "4. Toolbar des aktiven FAT",
        intro:
          "Unter dem Header wird der aktive FAT angezeigt (Auftrag · Seriennummer · Kunde) mit drei Schaltflächen:",
        bullets: [
          "Archiv — öffnet die Liste aller gespeicherten FATs.",
          "Entwurf speichern — speichert den aktuellen Zustand als Entwurf (\"In Bearbeitung\").",
          "Neues FAT — erstellt ein leeres FAT (das aktuelle bleibt im Archiv).",
        ],
      },
      {
        title: "5. Stepper — die 3 Schritte",
        intro:
          "Ein Indikator oben zeigt, wo Sie sich befinden. Sie können durch Klick auf die Nummer zwischen den Schritten wechseln.",
        bullets: [
          "1. Allgemeine Daten — Stammdaten und Prüfdetails.",
          "2. Prüfungen — Liste der im Bericht enthaltenen Prüfungen.",
          "3. Bericht — Zusammenfassung und PDF-Erstellung.",
        ],
      },
      {
        title: "6. Schritt 1 — Allgemeine Daten",
        intro:
          "Füllen Sie diese Abschnitte aus (mit * markierte Felder sind Pflichtfelder):",
        bullets: [
          "Hersteller — Firmenname, Adresse, Ansprechpartner, E-Mail, Telefon.",
          "Prüfstelle — gleiche Felder für den Kunden / die Prüfstelle.",
          "Prüfdaten — Beschreibung, Zeichnungsnr., Seriennummer, Tag, Kunden-Bestellnr., Auftragsnr., Prüfort und -datum.",
          "FAT-Teilnehmer — zwei getrennte Blöcke (Hersteller- und Kundenseite): Name und Rolle eingeben; die Firma wird automatisch aus dem Firmennamen des jeweiligen Abschnitts übernommen.",
        ],
      },
      {
        title: "7. Schritt 2 — Prüfungen",
        intro:
          "Liste der Prüfungen (mechanisch, elektrisch, Software), die im Bericht enthalten sein sollen.",
        bullets: [
          "Prüfungen in der Liste aus- oder abwählen.",
          "Über das Feld können eigene Prüfungen hinzugefügt werden.",
          "Die Reihenfolge lässt sich per Drag & Drop ändern.",
          "Ein Zähler unten auf der Seite zeigt die Anzahl der ausgewählten Prüfungen.",
        ],
      },
      {
        title: "8. Schritt 3 — Bericht",
        intro:
          "Zusammenfassung der allgemeinen Daten und der ausgewählten Prüfungen.",
        bullets: [
          "Jede ausgewählte Prüfung erhält ein eigenes Kapitel im PDF.",
          "Die Schaltfläche \"FAT-Bericht erstellen\" erzeugt das PDF und markiert das FAT im Archiv als \"Abgeschlossen\".",
          "Die Schaltfläche \"Neu starten\" löscht alle Daten des aktiven FAT (mit Bestätigung).",
        ],
      },
      {
        title: "9. FAT-Archiv",
        intro:
          "Liste aller gespeicherten FATs, gefiltert nach Status: Zu erledigen, In Bearbeitung, Abgeschlossen, Alle. Für jedes FAT:",
        bullets: [
          "Öffnen — lädt das FAT als aktives und kehrt zur Bearbeitung zurück.",
          "Duplizieren — erstellt eine unabhängige Kopie des FAT.",
          "Löschen — entfernt das FAT endgültig (mit Bestätigung).",
        ],
      },
      {
        title: "10. Technische Hinweise",
        bullets: [
          "Alle Daten werden im Browser gespeichert (localStorage), nicht auf einem Server.",
          "Das PDF wird vollständig auf dem Gerät erstellt.",
          "Ein Sprachwechsel übersetzt bereits eingegebenen Text (Beschreibungen, Notizen) nicht: nur die Oberflächenbeschriftungen ändern sich.",
          "Beim Löschen der Browserdaten geht das Archiv verloren: wichtige PDFs exportieren.",
        ],
      },
    ],
  },
  es: {
    dialogTitle: "Mini F.A.T. — Guía de uso",
    dialogDescription:
      "Cómo funciona el generador de informes Factory Acceptance Test.",
    langNote:
      "Esta guía sigue el idioma principal seleccionado arriba (bandera con distintivo 1).",
    sections: [
      {
        title: "1. Qué es Mini F.A.T.",
        intro:
          "Aplicación web para rellenar y generar en PDF los informes de Factory Acceptance Test. Los datos se guardan localmente en el navegador (localStorage); el PDF se genera en el dispositivo, sin envío a servidores externos.",
      },
      {
        title: "2. Barra de idiomas",
        intro:
          "Arriba a la derecha hay cuatro banderas (IT / EN / DE / ES). Al pulsar una bandera se convierte en el idioma principal (distintivo 1); un segundo clic en otra bandera la convierte en secundaria (distintivo 2). Los campos muestran entonces las etiquetas juntas como \"principal / secundaria\" (p. ej. \"Fabricante / Manufacturer\"). Pulsando de nuevo la principal se quita la secundaria.",
      },
      {
        title: "3. Botón Información",
        intro:
          "El botón con el icono (i) junto a las banderas abre esta guía. El texto cambia automáticamente según el idioma principal.",
      },
      {
        title: "4. Barra del FAT activo",
        intro:
          "Bajo la cabecera se muestra el FAT activo (Pedido · N.º de serie · Cliente) con tres botones:",
        bullets: [
          "Archivo — abre la lista de todos los FAT guardados.",
          "Guardar borrador — guarda el estado actual como borrador (\"En curso\").",
          "Nuevo FAT — crea un FAT vacío (el actual queda guardado en el archivo).",
        ],
      },
      {
        title: "5. Stepper — los 3 pasos",
        intro:
          "Un indicador superior muestra en qué paso estás. Puedes cambiar de paso pulsando el número.",
        bullets: [
          "1. Datos Generales — datos de las partes y de la prueba.",
          "2. Controles — lista de controles a incluir en el informe.",
          "3. Informe — resumen y generación del PDF.",
        ],
      },
      {
        title: "6. Paso 1 — Datos Generales",
        intro:
          "Rellena estas secciones (los campos marcados con * son obligatorios):",
        bullets: [
          "Fabricante — razón social, dirección, persona de contacto, correo, teléfono.",
          "Organismo Verificador — mismos campos para el cliente / organismo verificador.",
          "Datos de la prueba — descripción, n.º de plano, n.º de serie, tag, n.º de pedido cliente, n.º de trabajo, lugar y fecha de la prueba.",
          "Asistentes al FAT — dos bloques separados (lado Fabricante y lado Cliente): añade nombre y rol; la empresa se rellena automáticamente con la razón social de la sección correspondiente.",
        ],
      },
      {
        title: "7. Paso 2 — Controles",
        intro:
          "Lista de controles (mecánicos, eléctricos, software) a incluir en el informe.",
        bullets: [
          "Selecciona/deselecciona los controles de la lista.",
          "Puedes añadir controles personalizados con el campo dedicado.",
          "Puedes reordenar los controles arrastrándolos.",
          "Al pie de la página un contador indica cuántos hay seleccionados.",
        ],
      },
      {
        title: "8. Paso 3 — Informe",
        intro:
          "Resumen de los datos generales y de los controles seleccionados.",
        bullets: [
          "Cada control seleccionado será un capítulo dedicado en el PDF.",
          "El botón \"Generar informe FAT\" produce el PDF y marca el FAT como \"Completado\" en el archivo.",
          "El botón \"Reiniciar\" borra todos los datos del FAT activo (pide confirmación).",
        ],
      },
      {
        title: "9. Archivo FAT",
        intro:
          "Lista de todos los FAT guardados, filtrada por estado: Por hacer, En curso, Completados, Todos. Para cada FAT:",
        bullets: [
          "Abrir — carga el FAT como activo y vuelve a la edición.",
          "Duplicar — crea una copia independiente del FAT.",
          "Eliminar — quita definitivamente el FAT (con confirmación).",
        ],
      },
      {
        title: "10. Notas técnicas",
        bullets: [
          "Todos los datos se guardan en el navegador (localStorage), no en un servidor.",
          "El PDF se genera íntegramente en el dispositivo.",
          "Cambiar de idioma no traduce el texto ya introducido (descripciones, notas): solo cambian las etiquetas de la interfaz.",
          "Si borras los datos del navegador se pierde el archivo: exporta los PDF importantes.",
        ],
      },
    ],
  },
};

const ARIA_LABEL: Record<Lang, string> = {
  it: "Guida",
  en: "Guide",
  de: "Anleitung",
  es: "Guía",
};

export function InfoDialog() {
  const { primary } = useI18n();
  const g = GUIDE[primary];
  const ariaLabel = ARIA_LABEL[primary];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={ariaLabel}
          title={ariaLabel}
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{g.dialogTitle}</DialogTitle>
          <DialogDescription>{g.dialogDescription}</DialogDescription>
        </DialogHeader>

        <p className="mt-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          {g.langNote}
        </p>

        <div className="space-y-6 pt-4 text-sm leading-relaxed text-foreground">
          {g.sections.map((s) => (
            <section key={s.title}>
              <h3 className="mb-1 text-base font-semibold">{s.title}</h3>
              {s.intro && (
                <p className="text-muted-foreground">{s.intro}</p>
              )}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="ml-4 mt-1 list-disc space-y-1 text-muted-foreground">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
