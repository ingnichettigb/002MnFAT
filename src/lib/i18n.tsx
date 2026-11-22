import * as React from "react";

export type Lang = "it" | "en" | "de" | "es" | "fr";

type Entry = { it: string; en: string; de: string; es: string; fr: string };

export const dict = {
  // Header
  appSubtitle: {
    it: "Generatore di verbali di Factory Acceptance Test",
    en: "Factory Acceptance Test report generator",
    de: "Generator für Factory-Acceptance-Test-Berichte",
    es: "Generador de informes Factory Acceptance Test", fr: "Générateur de procès-verbaux de Factory Acceptance Test",
  },

  // Stepper
  stepGeneral: { it: "Dati Generali", en: "General Data", de: "Allgemeine Daten", es: "Datos Generales", fr: "Données générales" },
  stepControls: { it: "Controlli", en: "Checks", de: "Prüfungen", es: "Controles", fr: "Contrôles" },
  stepReport: { it: "Report PDF", en: "PDF Report", de: "PDF-Bericht", es: "Informe PDF", fr: "Rapport PDF" },
  currentPhase: { it: "Fase di lavorazione", en: "Work in progress", de: "In Bearbeitung", es: "En elaboración", fr: "En cours" },
  stepPrintPdf: { it: "Stampa PDF", en: "Print PDF", de: "PDF drucken", es: "Imprimir PDF", fr: "Imprimer PDF" },

  // Common
  back: { it: "← Indietro", en: "← Back", de: "← Zurück", es: "← Atrás", fr: "← Retour" },
  next: { it: "Avanti →", en: "Next →", de: "Weiter →", es: "Siguiente →", fr: "Suivant →" },
  add: { it: "Aggiungi", en: "Add", de: "Hinzufügen", es: "Añadir", fr: "Ajouter" },
  remove: { it: "Rimuovi", en: "Remove", de: "Entfernen", es: "Eliminar", fr: "Supprimer" },

  // Step 1
  generalTitle: {
    it: "Dati Generali del Collaudo",
    en: "General Test Data",
    de: "Allgemeine Prüfdaten",
    es: "Datos generales de la prueba", fr: "Données générales de l'essai",
  },
  generalDesc: {
    it: "Inserisci le informazioni che compariranno nel frontespizio del verbale.",
    en: "Enter the information that will appear on the report cover page.",
    de: "Geben Sie die Informationen ein, die auf dem Deckblatt erscheinen.",
    es: "Introduce la información que aparecerá en la portada del informe.", fr: "Saisissez les informations qui figureront sur la page de garde du procès-verbal.",
  },
  manufacturerTitle: { it: "Ente Costruttore", en: "Manufacturer", de: "Hersteller", es: "Fabricante", fr: "Fabricant" },
  customerTitle: { it: "Ente Verificatore", en: "Verifying Body", de: "Prüfstelle", es: "Organismo Verificador", fr: "Organisme vérificateur" },
  commonTitle: { it: "Dati del Collaudo", en: "Test Data", de: "Prüfdaten", es: "Datos de la prueba", fr: "Données de l'essai" },
  attendeesTitle: { it: "Presenti al F.A.T.", en: "F.A.T. Attendees", de: "F.A.T.-Teilnehmer", es: "Asistentes al F.A.T.", fr: "Participants au F.A.T." },
  attendeesDesc: {
    it: "Elenca le persone presenti al collaudo. Puoi aggiungerne altre.",
    en: "List the people attending the test. You can add more.",
    de: "Listen Sie die Teilnehmer der Prüfung auf. Sie können weitere hinzufügen.",
    es: "Enumera las personas presentes en la prueba. Puedes añadir más.", fr: "Indiquez les personnes présentes à l'essai. Vous pouvez en ajouter d'autres.",
  },
  addAttendee: { it: "Aggiungi presente", en: "Add attendee", de: "Teilnehmer hinzufügen", es: "Añadir asistente", fr: "Ajouter un participant" },

  // Field labels
  companyName: { it: "Ragione Sociale", en: "Company Name", de: "Firmenname", es: "Razón social", fr: "Raison sociale" },
  address: { it: "Indirizzo", en: "Address", de: "Adresse", es: "Dirección", fr: "Adresse" },
  contact: { it: "Referente", en: "Contact Person", de: "Ansprechpartner", es: "Persona de contacto", fr: "Interlocuteur" },
  email: { it: "Email", en: "Email", de: "E-Mail", es: "Correo electrónico", fr: "E-mail" },
  phone: { it: "Telefono", en: "Phone", de: "Telefon", es: "Teléfono", fr: "Téléphone" },
  drawingNo: {
    it: "N° Disegno / Specifica",
    en: "Drawing / Specification No.",
    de: "Zeichnungs-/Spezifikationsnr.",
    es: "N.º Plano / Especificación", fr: "N° de plan / spécification",
  },
  serialNo: { it: "N° Fabbrica / Matricola", en: "Serial No.", de: "Seriennummer", es: "N.º de serie", fr: "N° de série" },
  tagNo: { it: "Tag Number Cliente", en: "Customer Tag Number", de: "Kunden-Tag-Nummer", es: "N.º de Tag cliente", fr: "N° de repère client" },
  orderNo: { it: "Nr Ordine Cliente", en: "Customer Order No.", de: "Kunden-Bestellnummer", es: "N.º Pedido Cliente", fr: "N° de commande client" },
  testDate: { it: "Data del Collaudo", en: "Test Date", de: "Prüfdatum", es: "Fecha de la prueba", fr: "Date de l'essai" },
  testPlace: { it: "Luogo del Collaudo", en: "Test Location", de: "Prüfort", es: "Lugar de la prueba", fr: "Lieu de l'essai" },
  commessa: { it: "Commessa", en: "Job Number", de: "Auftragsnummer", es: "Número de pedido", fr: "N° d'affaire" },
  attendeeName: { it: "Nome e Cognome", en: "Full Name", de: "Vor- und Nachname", es: "Nombre y apellido", fr: "Nom et prénom" },
  attendeeRole: { it: "Ruolo", en: "Role", de: "Rolle", es: "Rol", fr: "Fonction" },
  attendeeCompany: { it: "Azienda", en: "Company", de: "Firma", es: "Empresa", fr: "Société" },
  companyOther: { it: "Altro…", en: "Other…", de: "Andere…", es: "Otro…", fr: "Autre…" },
  companyOtherPlaceholder: {
    it: "Specifica azienda",
    en: "Specify company",
    de: "Firma angeben",
    es: "Especifica empresa", fr: "Préciser la société",
  },
  descrizione: { it: "Descrizione", en: "Description", de: "Beschreibung", es: "Descripción", fr: "Description" },
  descrizionePlaceholder: {
    it: "Oggetto del collaudo, descrizione dell'apparecchiatura, riferimenti…",
    en: "Test object, equipment description, references…",
    de: "Prüfgegenstand, Gerätebeschreibung, Referenzen…",
    es: "Objeto de la prueba, descripción del equipo, referencias…", fr: "Objet de l'essai, description de l'équipement, références…",
  },

  // Conclusioni / Final results
  conclusioniTitle: { it: "Conclusioni", en: "Final results", de: "Schlussfolgerungen", es: "Conclusiones", fr: "Résultats finaux" },
  serbAccettato: { it: "Serb. accettato", en: "Tank accepted", de: "Behälter akzeptiert", es: "Depósito aceptado", fr: "Réservoir accepté" },
  motivoNonAccettazione: {
    it: "Motivo della non-accettazione",
    en: "Reason for non-acceptance",
    de: "Grund der Ablehnung",
    es: "Motivo del rechazo", fr: "Motif de non-acceptation",
  },
  noteRilievi: { it: "Note / Rilievi", en: "Notes / Remarks", de: "Anmerkungen", es: "Notas / Observaciones", fr: "Notes / Observations" },
  azioniCorrettive: {
    it: "Azioni correttive da intraprendere",
    en: "Corrective actions to be taken",
    de: "Zu ergreifende Korrekturmaßnahmen",
    es: "Acciones correctivas a tomar", fr: "Actions correctives à mettre en œuvre",
  },
  dataIspezione: { it: "Data", en: "Date", de: "Datum", es: "Fecha", fr: "Date" },
  ispettoreEsterno: {
    it: "Ispettore esterno / cliente",
    en: "External / client inspector",
    de: "Externer / Kunden-Inspektor",
    es: "Inspector externo / cliente", fr: "Inspecteur externe / client",
  },
  controlloInterno: { it: "Controllo interno", en: "Internal control", de: "Interne Kontrolle", es: "Control interno", fr: "Contrôle interne" },
  dopoAzioni: {
    it: "Dopo azioni correttive il serbatoio è stato accettato",
    en: "After corrective actions the tank was accepted",
    de: "Nach Korrekturmaßnahmen wurde der Behälter akzeptiert",
    es: "Tras las acciones correctivas, el depósito fue aceptado", fr: "Après actions correctives, le réservoir a été accepté",
  },
  dataFinale: { it: "Data finale", en: "Final date", de: "Enddatum", es: "Fecha final", fr: "Date finale" },
  firma: { it: "Firma", en: "Signature", de: "Unterschrift", es: "Firma", fr: "Signature" },
  optYes: { it: "SI", en: "YES", de: "JA", es: "SÍ", fr: "OUI" },
  optNo: { it: "NO", en: "NO", de: "NEIN", es: "NO", fr: "NON" },
  optNa: { it: "NA", en: "NA", de: "N/A", es: "N/D", fr: "NA" },

  required: { it: "Campo obbligatorio", en: "Required field", de: "Pflichtfeld", es: "Campo obligatorio", fr: "Champ obligatoire" },

  // Step 2
  controlsTitle: { it: "Lista Controlli", en: "Check List", de: "Prüfliste", es: "Lista de controles", fr: "Liste des contrôles" },
  controlsDesc: {
    it: "Seleziona i controlli (meccanici, elettrici, software) che faranno parte del verbale.",
    en: "Select the checks (mechanical, electrical, software) to include in the report.",
    de: "Wählen Sie die Prüfungen (mechanisch, elektrisch, Software) für den Bericht.",
    es: "Selecciona los controles (mecánicos, eléctricos, software) a incluir en el informe.", fr: "Sélectionnez les contrôles (mécaniques, électriques, logiciels) à inclure dans le procès-verbal.",
  },
  customLabel: { it: "personalizzato", en: "custom", de: "benutzerdefiniert", es: "personalizado", fr: "personnalisé" },
  addCustom: {
    it: "Aggiungi controllo personalizzato",
    en: "Add custom check",
    de: "Eigene Prüfung hinzufügen",
    es: "Añadir control personalizado", fr: "Ajouter un contrôle personnalisé",
  },
  customPlaceholder: {
    it: "Descrivi il controllo da aggiungere…",
    en: "Describe the check to add…",
    de: "Beschreiben Sie die hinzuzufügende Prüfung…",
    es: "Describe el control a añadir…", fr: "Décrivez le contrôle à ajouter…",
  },
  selectedCount: { it: "selezionati", en: "selected", de: "ausgewählt", es: "seleccionados", fr: "sélectionnés" },

  // Step 3
  reportSubtitle: {
    it: "Riepilogo e generazione del PDF",
    en: "Summary and PDF generation",
    de: "Zusammenfassung und PDF-Erstellung",
    es: "Resumen y generación del PDF", fr: "Récapitulatif et génération du PDF",
  },
  generatePdf: { it: "Genera Report F.A.T.", en: "Generate F.A.T. Report", de: "F.A.T.-Bericht erstellen", es: "Generar informe F.A.T.", fr: "Générer le rapport F.A.T." },
  restart: { it: "Ricomincia", en: "Restart", de: "Neu starten", es: "Reiniciar", fr: "Recommencer" },
  restartConfirm: {
    it: "Vuoi davvero ricominciare? Tutti i dati verranno cancellati.",
    en: "Do you really want to restart? All data will be cleared.",
    de: "Wirklich neu starten? Alle Daten werden gelöscht.",
    es: "¿Seguro que quieres reiniciar? Se borrarán todos los datos.", fr: "Voulez-vous vraiment recommencer ? Toutes les données seront effacées.",
  },
  summaryGeneral: { it: "Dati Generali", en: "General Data", de: "Allgemeine Daten", es: "Datos generales", fr: "Données générales" },
  summaryControls: { it: "Controlli selezionati", en: "Selected checks", de: "Ausgewählte Prüfungen", es: "Controles seleccionados", fr: "Contrôles sélectionnés" },
  summaryControlsDesc: {
    it: "Ogni controllo avrà un capitolo dedicato nel PDF.",
    en: "Each check will have a dedicated chapter in the PDF.",
    de: "Jede Prüfung hat ein eigenes Kapitel im PDF.",
    es: "Cada control tendrá un capítulo dedicado en el PDF.", fr: "Chaque contrôle aura un chapitre dédié dans le PDF.",
  },
  noneSelected: { it: "Nessun controllo selezionato.", en: "No check selected.", de: "Keine Prüfung ausgewählt.", es: "Ningún control seleccionado.", fr: "Aucun contrôle sélectionné." },
  goBack: { it: "Torna indietro", en: "Go back", de: "Zurück", es: "Volver", fr: "Revenir" },
  modifyControls: { it: "← Modifica controlli", en: "← Edit checks", de: "← Prüfungen bearbeiten", es: "← Editar controles", fr: "← Modifier les contrôles" },

  // PDF
  pdfTitle: { it: "VERBALE DI COLLAUDO", en: "TEST REPORT", de: "PRÜFBERICHT", es: "INFORME DE PRUEBA", fr: "PROCÈS-VERBAL D'ESSAI" },
  pdfSubtitle: {
    it: "FACTORY ACCEPTANCE TEST",
    en: "FACTORY ACCEPTANCE TEST",
    de: "FACTORY ACCEPTANCE TEST",
    es: "FACTORY ACCEPTANCE TEST", fr: "FACTORY ACCEPTANCE TEST",
  },

  // Archivio F.A.T.
  archiveTitle: { it: "Archivio F.A.T.", en: "F.A.T. Archive", de: "F.A.T.-Archiv", es: "Archivo F.A.T.", fr: "Archives F.A.T." },
  archiveDesc: {
    it: "Tutti i F.A.T. salvati, suddivisi per stato. Puoi aprirli, duplicarli o eliminarli. L'archivio è salvato nel localStorage del browser (sorgente: src/lib/fat-context.tsx).",
    en: "All saved F.A.T. grouped by status. Open, duplicate or delete them. The archive is stored in the browser's localStorage (source: src/lib/fat-context.tsx).",
    de: "Alle gespeicherten F.A.T. nach Status gruppiert. Öffnen, duplizieren oder löschen. Das Archiv wird im localStorage des Browsers gespeichert (Quelle: src/lib/fat-context.tsx).",
    es: "Todos los F.A.T. guardados agrupados por estado. Abrir, duplicar o eliminar. El archivo se guarda en el localStorage del navegador (fuente: src/lib/fat-context.tsx).", fr: "Tous les F.A.T. enregistrés, classés par état. Ouvrez-les, dupliquez-les ou supprimez-les. Les archives sont enregistrées dans le navigateur.",
  },
  archiveOpen: { it: "Archivio", en: "Archive", de: "Archiv", es: "Archivo", fr: "Archives" },
  saveDraft: { it: "Salva bozza", en: "Save draft", de: "Entwurf speichern", es: "Guardar borrador", fr: "Enregistrer le brouillon" },
  newFat: { it: "Nuovo F.A.T.", en: "New F.A.T.", de: "Neues F.A.T.", es: "Nuevo F.A.T.", fr: "Nouveau F.A.T." },
  open: { it: "Apri", en: "Open", de: "Öffnen", es: "Abrir", fr: "Ouvrir" },
  duplicate: { it: "Duplica", en: "Duplicate", de: "Duplizieren", es: "Duplicar", fr: "Dupliquer" },
  saveFile: { it: "Salva file", en: "Save file", de: "Datei speichern", es: "Guardar archivo", fr: "Enregistrer le fichier" },
  deleteAction: { it: "Elimina", en: "Delete", de: "Löschen", es: "Eliminar", fr: "Supprimer" },
  status: { it: "Stato", en: "Status", de: "Status", es: "Estado", fr: "État" },
  lastUpdated: { it: "Ultima modifica", en: "Last updated", de: "Zuletzt geändert", es: "Última modificación", fr: "Dernière modification" },
  statusTodo: { it: "Da lavorare", en: "To do", de: "Zu erledigen", es: "Por hacer", fr: "À traiter" },
  statusInProgress: { it: "In lavorazione", en: "In progress", de: "In Bearbeitung", es: "En curso", fr: "En cours" },
  statusDone: { it: "Completati", en: "Completed", de: "Abgeschlossen", es: "Completados", fr: "Terminés" },
  statusAll: { it: "Tutti", en: "All", de: "Alle", es: "Todos", fr: "Tous" },
  loadFile: { it: "Carica file", en: "Load file", de: "Datei laden", es: "Cargar archivo", fr: "Charger un fichier" },
  loadFileTitle: {
    it: "Carica un F.A.T. salvato",
    en: "Load a saved F.A.T.",
    de: "Gespeichertes F.A.T. laden",
    es: "Cargar un F.A.T. guardado", fr: "Charger un F.A.T. enregistré",
  },
  loadFileDesc: {
    it: "Scegli uno dei F.A.T. salvati in precedenza per aprirlo e continuare la compilazione.",
    en: "Choose one of the previously saved F.A.T. to open it and continue filling it in.",
    de: "Wählen Sie eines der zuvor gespeicherten F.A.T., um es zu öffnen und weiterzubearbeiten.",
    es: "Elige uno de los F.A.T. guardados anteriormente para abrirlo y continuar.", fr: "Choisissez un F.A.T. enregistré pour l'ouvrir et poursuivre la saisie.",
  },
  noFats: { it: "Nessun F.A.T. in questa categoria.", en: "No F.A.T. in this category.", de: "Keine F.A.T. in dieser Kategorie.", es: "Ningún F.A.T. en esta categoría.", fr: "Aucun F.A.T. dans cette catégorie." },
  confirmDelete: {
    it: "Eliminare definitivamente questo F.A.T.?",
    en: "Permanently delete this F.A.T.?",
    de: "Diesen F.A.T. endgültig löschen?",
    es: "¿Eliminar definitivamente este F.A.T.?", fr: "Supprimer définitivement ce F.A.T. ?",
  },
  draftSaved: { it: "Bozza salvata.", en: "Draft saved.", de: "Entwurf gespeichert.", es: "Borrador guardado.", fr: "Brouillon enregistré." },
  exit: { it: "Esci", en: "Exit", de: "Beenden", es: "Salir", fr: "Quitter" },
  exitEraseAll: { it: "Esci e cancella tutto", en: "Exit and erase all", de: "Beenden und alles löschen", es: "Salir y borrar todo", fr: "Quitter et tout effacer" },
  reportGeneratedDone: {
    it: "Report generato — F.A.T. completato.",
    en: "Report generated — F.A.T. marked as done.",
    de: "Bericht erstellt — F.A.T. als abgeschlossen markiert.",
    es: "Informe generado — F.A.T. marcado como completado.", fr: "Rapport généré — F.A.T. terminé.",
  },
  untitledFat: { it: "F.A.T. senza titolo", en: "Untitled F.A.T.", de: "F.A.T. ohne Titel", es: "F.A.T. sin título", fr: "F.A.T. sans titre" },
  activeFat: { it: "F.A.T. attivo", en: "Active F.A.T.", de: "Aktiver F.A.T.", es: "F.A.T. activo", fr: "F.A.T. actif" },
  viewReport: { it: "Apri report", en: "Open report", de: "Bericht öffnen", es: "Abrir informe", fr: "Ouvrir le rapport" },
  pdfSavedTitle: { it: "PDF generato", en: "PDF generated", de: "PDF erstellt", es: "PDF generado", fr: "PDF généré" },
  pdfSavedBody: { it: "Il file è stato salvato nella cartella Download del tuo browser (o nella cartella predefinita per i download).", en: "The file has been saved to your browser's Downloads folder (or your default download folder).", de: "Die Datei wurde im Download-Ordner Ihres Browsers (oder Ihrem Standard-Download-Ordner) gespeichert.", es: "El archivo se ha guardado en la carpeta Descargas del navegador (o en tu carpeta de descargas predeterminada).", fr: "Le fichier a été enregistré dans le dossier Téléchargements de votre navigateur (ou votre dossier de téléchargement par défaut)." },
  clickToContinue: { it: "Clicca per proseguire", en: "Click to continue", de: "Klicken Sie, um fortzufahren", es: "Haz clic para continuar", fr: "Cliquez pour continuer" },
  exhaustedTitle: { it: "Generazioni esaurite", en: "No PDF generations left", de: "Keine PDF-Erstellungen mehr", es: "Generaciones agotadas", fr: "Générations épuisées" },
  exhaustedBody: { it: "Hai esaurito le generazioni PDF disponibili per questa licenza. Per continuare, rinnova la licenza oppure acquista una nuova licenza a uso singolo.", en: "You have used all PDF generations available for this licence. To continue, renew the licence or purchase a new single-use licence.", de: "Sie haben alle für diese Lizenz verfügbaren PDF-Erstellungen aufgebraucht. Verlängern Sie die Lizenz oder erwerben Sie eine neue Einzellizenz.", es: "Has agotado las generaciones PDF disponibles para esta licencia. Para continuar, renueva la licencia o compra una nueva licencia de uso único.", fr: "Vous avez épuisé les générations PDF disponibles pour cette licence. Pour continuer, renouvelez la licence ou achetez une nouvelle licence à usage unique." },
  understood: { it: "Ho capito", en: "I understand", de: "Verstanden", es: "Entendido", fr: "J'ai compris" },
  lastExportTitle: { it: "Attenzione: questa è l'ultima generazione PDF disponibile per questa licenza.", en: "Warning: this is the last PDF generation available for this licence.", de: "Achtung: Dies ist die letzte verfügbare PDF-Erstellung für diese Lizenz.", es: "Atención: esta es la última generación PDF disponible para esta licencia.", fr: "Attention : il s'agit de la dernière génération PDF disponible pour cette licence." },
  lastExportBody: { it: "Dopo non potrai più generarne altri, fino al rinnovo della licenza o all'acquisto di una nuova licenza.", en: "After this you won't be able to generate more until the licence is renewed or a new one is purchased.", de: "Danach können Sie keine weiteren erstellen, bis die Lizenz verlängert oder eine neue erworben wird.", es: "Después no podrás generar más hasta renovar la licencia o comprar una nueva.", fr: "Ensuite, vous ne pourrez plus en générer jusqu'au renouvellement de la licence ou à l'achat d'une nouvelle licence." },
  pdfExportsRemaining: { it: "Export PDF rimanenti", en: "PDF exports remaining", de: "Verbleibende PDF-Exporte", es: "Exportaciones PDF restantes", fr: "Exportations PDF restantes" },
  fixedPosition: { it: "Posizione fissa", en: "Fixed position", de: "Feste Position", es: "Posición fija", fr: "Position fixe" },
  dragToReorder: { it: "Trascina per riordinare", en: "Drag to reorder", de: "Zum Neuordnen ziehen", es: "Arrastra para reordenar", fr: "Faites glisser pour réorganiser" },
  resetDefaultList: { it: "Aggiorna lista predefinita", en: "Refresh default list", de: "Standardliste aktualisieren", es: "Actualizar lista predeterminada", fr: "Actualiser la liste par défaut" },
  authTitle: { it: "Accesso", en: "Sign in", de: "Anmeldung", es: "Acceso", fr: "Connexion" },
  authStepEmail: { it: "Passaggio 1 di 3 — Verifica email.", en: "Step 1 of 3 — Email verification.", de: "Schritt 1 von 3 — E-Mail-Bestätigung.", es: "Paso 1 de 3 — Verificación del correo.", fr: "Étape 1 sur 3 — Vérification de l'e-mail." },
  authStepOtp: { it: "Inserisci il codice ricevuto per email.", en: "Enter the code you received by email.", de: "Geben Sie den per E-Mail erhaltenen Code ein.", es: "Introduce el código recibido por correo.", fr: "Saisissez le code reçu par e-mail." },
  authVerified: { it: "Email verificata con successo.", en: "Email successfully verified.", de: "E-Mail erfolgreich bestätigt.", es: "Correo verificado correctamente.", fr: "E-mail vérifié avec succès." },
  authRedirecting: { it: "Reindirizzamento…", en: "Redirecting…", de: "Weiterleitung…", es: "Redirigiendo…", fr: "Redirection…" },
  pleaseWait: { it: "Attendere…", en: "Please wait…", de: "Bitte warten…", es: "Espera…", fr: "Veuillez patienter…" },
  sendCode: { it: "Invia codice", en: "Send code", de: "Code senden", es: "Enviar código", fr: "Envoyer le code" },
  codeLabel: { it: "Codice (6 cifre)", en: "Code (6 digits)", de: "Code (6 Ziffern)", es: "Código (6 dígitos)", fr: "Code (6 chiffres)" },
  verify: { it: "Verifica", en: "Verify", de: "Bestätigen", es: "Verificar", fr: "Vérifier" },
  verifying: { it: "Verifica…", en: "Verifying…", de: "Wird geprüft…", es: "Verificando…", fr: "Vérification…" },
  resend: { it: "Reinvia", en: "Resend", de: "Erneut senden", es: "Reenviar", fr: "Renvoyer" },
  changeEmail: { it: "Cambia email", en: "Change email", de: "E-Mail ändern", es: "Cambiar correo", fr: "Changer d'e-mail" },
  codeSentTo: { it: "Abbiamo inviato il codice a", en: "We sent the code to", de: "Wir haben den Code gesendet an", es: "Hemos enviado el código a", fr: "Nous avons envoyé le code à" },
  newCodeSentTo: { it: "Nuovo codice inviato a", en: "New code sent to", de: "Neuer Code gesendet an", es: "Nuevo código enviado a", fr: "Nouveau code envoyé à" },
  errEmailInvalid: { it: "Inserisci una email valida.", en: "Enter a valid email.", de: "Geben Sie eine gültige E-Mail ein.", es: "Introduce un correo válido.", fr: "Saisissez un e-mail valide." },
  errCode6: { it: "Il codice deve essere di 6 cifre.", en: "The code must be 6 digits.", de: "Der Code muss 6 Ziffern haben.", es: "El código debe tener 6 dígitos.", fr: "Le code doit comporter 6 chiffres." },
  errRateLimit: { it: "Hai già ricevuto 3 codici di verifica. Riprova tra 24 ore.", en: "You have already received 3 verification codes. Try again in 24 hours.", de: "Sie haben bereits 3 Bestätigungscodes erhalten. Versuchen Sie es in 24 Stunden erneut.", es: "Ya has recibido 3 códigos de verificación. Inténtalo de nuevo en 24 horas.", fr: "Vous avez déjà reçu 3 codes de vérification. Réessayez dans 24 heures." },
  errSendFail: { it: "Impossibile inviare il codice. Verifica l'indirizzo email.", en: "Unable to send the code. Check the email address.", de: "Code konnte nicht gesendet werden. Prüfen Sie die E-Mail-Adresse.", es: "No se ha podido enviar el código. Comprueba el correo.", fr: "Impossible d'envoyer le code. Vérifiez l'adresse e-mail." },
  errOtpInvalid: { it: "Codice non corretto. Riprova o richiedi un nuovo invio.", en: "Incorrect code. Try again or request a new one.", de: "Falscher Code. Versuchen Sie es erneut oder fordern Sie einen neuen an.", es: "Código incorrecto. Inténtalo de nuevo o solicita otro.", fr: "Code incorrect. Réessayez ou demandez un nouvel envoi." },
  errOtpSave: { it: "Errore tecnico durante la verifica. Riprova.", en: "Technical error during verification. Try again.", de: "Technischer Fehler bei der Prüfung. Bitte erneut versuchen.", es: "Error técnico durante la verificación. Inténtalo de nuevo.", fr: "Erreur technique lors de la vérification. Réessayez." },
  actTitle: { it: "Attivazione licenza", en: "Licence activation", de: "Lizenzaktivierung", es: "Activación de licencia", fr: "Activation de la licence" },
  actDesc: { it: "Passaggio 2 di 3 — Inserisci il codice licenza e il PUK ricevuti via email al momento dell'acquisto.", en: "Step 2 of 3 — Enter the licence code and PUK received by email at purchase.", de: "Schritt 2 von 3 — Geben Sie den Lizenzcode und den PUK aus der Kauf-E-Mail ein.", es: "Paso 2 de 3 — Introduce el código de licencia y el PUK recibidos por correo al comprar.", fr: "Étape 2 sur 3 — Saisissez le code de licence et le PUK reçus par e-mail lors de l'achat." },
  verifiedEmail: { it: "Email verificata", en: "Verified email", de: "Bestätigte E-Mail", es: "Correo verificado", fr: "E-mail vérifié" },
  licenseCode: { it: "Codice licenza", en: "Licence code", de: "Lizenzcode", es: "Código de licencia", fr: "Code de licence" },
  pukCode: { it: "Codice PUK", en: "PUK code", de: "PUK-Code", es: "Código PUK", fr: "Code PUK" },
  errorCode: { it: "Codice errore", en: "Error code", de: "Fehlercode", es: "Código de error", fr: "Code d'erreur" },
  activate: { it: "Attiva", en: "Activate", de: "Aktivieren", es: "Activar", fr: "Activer" },
  activating: { it: "Attivazione…", en: "Activating…", de: "Aktivierung…", es: "Activando…", fr: "Activation…" },
  errFillBoth: { it: "Compila entrambi i campi.", en: "Fill in both fields.", de: "Füllen Sie beide Felder aus.", es: "Rellena ambos campos.", fr: "Remplissez les deux champs." },
  E001: { it: "La tua email non risulta ancora verificata. Torna al passaggio precedente e completa la verifica con il codice ricevuto via email.", en: "Your email is not verified yet. Go back and complete verification with the code received by email.", de: "Ihre E-Mail ist noch nicht bestätigt. Gehen Sie zurück und schließen Sie die Bestätigung mit dem erhaltenen Code ab.", es: "Tu correo aún no está verificado. Vuelve al paso anterior y completa la verificación con el código recibido.", fr: "Votre e-mail n'est pas encore vérifié. Revenez à l'étape précédente et terminez la vérification avec le code reçu." },
  E101: { it: "Il codice licenza inserito non è valido. Controlla di averlo copiato correttamente dall'email di acquisto (senza spazi iniziali o finali).", en: "The licence code is not valid. Check you copied it correctly from the purchase email (no leading or trailing spaces).", de: "Der Lizenzcode ist ungültig. Prüfen Sie, ob Sie ihn korrekt aus der Kauf-E-Mail kopiert haben (ohne Leerzeichen).", es: "El código de licencia no es válido. Comprueba que lo has copiado bien del correo de compra (sin espacios).", fr: "Le code de licence n'est pas valide. Vérifiez qu'il a été copié correctement depuis l'e-mail d'achat (sans espaces)." },
  E103: { it: "Questa licenza risulta scaduta. Contatta il supporto per verificare il rinnovo o l'acquisto di una nuova licenza.", en: "This licence has expired. Contact support about renewal or a new licence.", de: "Diese Lizenz ist abgelaufen. Wenden Sie sich an den Support für Verlängerung oder eine neue Lizenz.", es: "Esta licencia ha caducado. Contacta con soporte para renovarla o comprar una nueva.", fr: "Cette licence a expiré. Contactez le support pour un renouvellement ou une nouvelle licence." },
  E201: { it: "Il codice PUK (numero ebook) inserito non è valido. Verifica di averlo copiato correttamente dall'email di acquisto.", en: "The PUK code (ebook number) is not valid. Check you copied it correctly from the purchase email.", de: "Der PUK-Code (E-Book-Nummer) ist ungültig. Prüfen Sie die Kauf-E-Mail.", es: "El código PUK (número de ebook) no es válido. Compruébalo en el correo de compra.", fr: "Le code PUK (numéro d'ebook) n'est pas valide. Vérifiez-le dans l'e-mail d'achat." },
  E203: { it: "Questo codice PUK non è valido per questa applicazione. Verifica di aver inserito il codice corretto per il prodotto che stai attivando.", en: "This PUK code is not valid for this application. Check you entered the code for the right product.", de: "Dieser PUK-Code gilt nicht für diese Anwendung. Prüfen Sie den Code für das richtige Produkt.", es: "Este código PUK no es válido para esta aplicación. Comprueba el código del producto correcto.", fr: "Ce code PUK n'est pas valable pour cette application. Vérifiez le code du bon produit." },
  E204: { it: "Questo codice PUK non risulta associato alla licenza inserita. Verifica che entrambi i codici provengano dalla stessa email di acquisto.", en: "This PUK code is not linked to the licence entered. Check both codes come from the same purchase email.", de: "Dieser PUK-Code ist nicht mit der Lizenz verknüpft. Prüfen Sie, ob beide Codes aus derselben Kauf-E-Mail stammen.", es: "Este código PUK no está asociado a la licencia. Comprueba que ambos códigos vienen del mismo correo de compra.", fr: "Ce code PUK n'est pas associé à la licence saisie. Vérifiez que les deux codes proviennent du même e-mail d'achat." },
  E202: { it: "Questo codice PUK è già stato attivato da un altro utente. Ogni codice PUK è personale e può essere usato una sola volta. Se la licenza prevede più utenti, contatta chi ha effettuato l'acquisto per ricevere un codice PUK non ancora utilizzato.", en: "This PUK code has already been activated by another user. Each PUK is personal and single-use. If the licence covers several users, ask the purchaser for an unused PUK.", de: "Dieser PUK-Code wurde bereits von einem anderen Nutzer aktiviert. Jeder PUK ist persönlich und einmalig. Bei Mehrplatzlizenzen erhalten Sie beim Käufer einen unbenutzten PUK.", es: "Este código PUK ya ha sido activado por otro usuario. Cada PUK es personal y de un solo uso. Si la licencia incluye varios usuarios, pide al comprador un PUK sin usar.", fr: "Ce code PUK a déjà été activé par un autre utilisateur. Chaque PUK est personnel et à usage unique. Si la licence prévoit plusieurs utilisateurs, demandez un PUK inutilisé à l'acheteur." },
  E500: { it: "Si è verificato un errore tecnico imprevisto. Riprova tra qualche minuto o contattaci indicando il codice errore.", en: "An unexpected technical error occurred. Try again in a few minutes or contact us quoting the error code.", de: "Ein unerwarteter technischer Fehler ist aufgetreten. Versuchen Sie es später erneut oder kontaktieren Sie uns mit dem Fehlercode.", es: "Se ha producido un error técnico inesperado. Inténtalo en unos minutos o contáctanos indicando el código de error.", fr: "Une erreur technique inattendue s'est produite. Réessayez dans quelques minutes ou contactez-nous en indiquant le code d'erreur." },
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
  v === "it" || v === "en" || v === "de" || v === "es" || v === "fr";

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
    { code: "fr", flag: "🇫🇷", label: "Français" },
  ];
  return (
    <div className={"flex flex-wrap items-center gap-1.5 " + (className ?? "")}>
      {opts.map((o) => {
        const isPrimary = primary === o.code;
        const isSecondary = secondary === o.code;
        const order = isPrimary ? 1 : isSecondary ? 2 : null;
        const base =
          "relative flex h-8 items-center gap-1 rounded-md border px-1.5 text-base leading-none transition-all hover:scale-105";
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
            <span aria-hidden>{o.flag}</span>
            <span className="text-[11px] font-semibold uppercase">{o.code}</span>
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
