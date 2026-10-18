import type { Lang } from "@/lib/i18n";

export type TermsContent = {
  langLabel: string;
  pageTitle: string;
  stepLabel: string;
  intro: string;
  checkboxLabel: string;
  acceptButton: string;
  acceptingButton: string;
  errorGeneric: string;
  content: {
    heading: string;
    subheading: string;
    sections: Array<{ title: string; body: string }>;
    footer: string;
  };
};

export const TERMS: Record<Lang, TermsContent> = {
  it: {
    langLabel: "Italiano",
    pageTitle: "Condizioni d'Uso",
    stepLabel: "Passaggio 3 di 3",
    intro:
      "Per completare l'attivazione, leggi e accetta le condizioni d'uso del software.",
    checkboxLabel: "Ho letto e accetto le condizioni d'uso",
    acceptButton: "Accetta e continua",
    acceptingButton: "Salvataggio…",
    errorGeneric:
      "Impossibile registrare il consenso. Riprova tra qualche istante.",
    content: {
      heading: "CONDIZIONI D'USO DEL SOFTWARE",
      subheading: "{{APP_NAME}} — Versione 1.0",
      sections: [
        {
          title: "1. OGGETTO",
          body:
            "Le presenti condizioni regolano l'utilizzo del software {{APP_NAME}} (\"Software\"), fornito da Dott. Ing. Nichetti Gian Battista, P.IVA IT01235350194, con sede in Soresina (CR), Italia, tramite il brand CorporateBoostService (\"Fornitore\").",
        },
        {
          title: "2. LICENZA D'USO",
          body:
            "Il Fornitore concede all'Utente una licenza d'uso non esclusiva, non trasferibile e limitata nel tempo, secondo i termini di validità associati alla licenza acquistata. La licenza non costituisce cessione di proprietà intellettuale sul Software, che resta di esclusiva proprietà del Fornitore.",
        },
        {
          title: "3. MODALITÀ DI ACQUISTO E FATTURAZIONE",
          body:
            "I pagamenti sono gestiti da Paddle.com Market Limited in qualità di Merchant of Record. Per dettagli consultare la pagina /pagamenti-merchant-of-record.",
        },
        {
          title: "4. USO CONSENTITO",
          body:
            "L'Utente si impegna a utilizzare il Software esclusivamente per le finalità previste, a non tentare di decompilare, modificare o distribuire il Software, e a non condividere le proprie credenziali di accesso.",
        },
        {
          title: "5. DATI E PRIVACY",
          body:
            "Il trattamento dei dati personali è disciplinato dalla Privacy Policy disponibile sul sito, in conformità al Regolamento (UE) 2016/679 (GDPR).",
        },
        {
          title: "6. LIMITAZIONE DI RESPONSABILITÀ",
          body:
            "Il Software è fornito \"così com'è\". Il Fornitore non garantisce l'assenza di errori o interruzioni del servizio e non risponde di danni indiretti, salvo dolo o colpa grave.",
        },
        {
          title: "7. GESTIONE E DISINSTALLAZIONE DELL'APP",
          body:
            "L'icona installata può chiamarsi Mini F.A.T., 002mnfat, 002-mnfat o Smart Launcher.\n\n• Google Chrome (computer): scrivi chrome://apps nella barra degli indirizzi e premi Invio, poi clic destro sull'icona > \"Rimuovi da Chrome\" / \"Disinstalla\". In alternativa: apri l'app, menu a 3 puntini in alto > \"Disinstalla Mini F.A.T.\".\n• Microsoft Edge (computer): scrivi edge://apps e premi Invio, poi clic sui 3 puntini accanto all'app > \"Disinstalla\". In alternativa: menu ... > App > Gestisci app.\n• Brave: scrivi brave://apps e premi Invio, poi clic destro sull'icona > \"Rimuovi da Brave\".\n• Opera / Vivaldi: scrivi opera://apps oppure vivaldi://apps e rimuovi l'icona con clic destro.\n• Safari (Mac, macOS Sonoma o successivi): apri il Finder > cartella Applicazioni (o Applicazioni utente), trascina l'icona nel Cestino.\n• Mozilla Firefox: non installa app su computer; se hai creato un segnalibro o un collegamento, eliminalo con clic destro > \"Elimina\".\n• Windows (qualsiasi browser): Impostazioni > App > App installate, cerca il nome dell'app > \"Disinstalla\".\n• Android (Chrome / Samsung Internet): tieni premuta l'icona nella schermata Home > \"Disinstalla\" (oppure Impostazioni > App).\n• iPhone / iPad (Safari): tieni premuta l'icona nella schermata Home > \"Rimuovi app\" > \"Elimina dalla schermata Home\".\n\nNota: la disinstallazione rimuove solo l'icona; la licenza e i verbali F.A.T. restano salvati nel browser e non vengono cancellati.",
        },
        {
          title: "8. DURATA E RISOLUZIONE",
          body:
            "La licenza ha validità secondo quanto indicato al momento dell'acquisto. Il Fornitore si riserva il diritto di sospendere l'accesso in caso di violazione delle presenti condizioni.",
        },
        {
          title: "9. MODIFICHE ALLE CONDIZIONI",
          body: "In caso di modifiche sostanziali, sarà richiesta nuova accettazione.",
        },
        {
          title: "10. LEGGE APPLICABILE E FORO COMPETENTE",
          body:
            "Legge italiana. Foro di Cremona, salvo diversa disposizione inderogabile a tutela del consumatore.",
        },
      ],
      footer: "Versione: v1 — Ultimo aggiornamento: 18 ottobre 2026",
    },
  },
  en: {
    langLabel: "English",
    pageTitle: "Terms of Use",
    stepLabel: "Step 3 of 3",
    intro:
      "To complete activation, please read and accept the software terms of use.",
    checkboxLabel: "I have read and accept the terms of use",
    acceptButton: "Accept and continue",
    acceptingButton: "Saving…",
    errorGeneric: "Unable to record your consent. Please try again shortly.",
    content: {
      heading: "SOFTWARE TERMS OF USE",
      subheading: "{{APP_NAME}} — Version 1.0",
      sections: [
        {
          title: "1. SUBJECT",
          body:
            "These terms govern the use of the software {{APP_NAME}} (\"Software\"), provided by Dott. Ing. Nichetti Gian Battista, VAT No. IT01235350194, with registered office in Soresina (CR), Italy, under the CorporateBoostService brand (\"Supplier\").",
        },
        {
          title: "2. LICENCE OF USE",
          body:
            "The Supplier grants the User a non-exclusive, non-transferable licence to use the Software, limited in time according to the validity terms associated with the purchased licence. The licence does not constitute a transfer of intellectual property rights over the Software, which remain the exclusive property of the Supplier.",
        },
        {
          title: "3. PURCHASE AND BILLING",
          body:
            "Payments are handled by Paddle.com Market Limited acting as Merchant of Record. For details see the page /pagamenti-merchant-of-record.",
        },
        {
          title: "4. PERMITTED USE",
          body:
            "The User undertakes to use the Software solely for its intended purposes, not to attempt to decompile, modify or distribute the Software, and not to share their access credentials.",
        },
        {
          title: "5. DATA AND PRIVACY",
          body:
            "The processing of personal data is governed by the Privacy Policy available on the website, in compliance with Regulation (EU) 2016/679 (GDPR).",
        },
        {
          title: "6. LIMITATION OF LIABILITY",
          body:
            "The Software is provided \"as is\". The Supplier does not warrant that it will be free from errors or service interruptions and shall not be liable for indirect damages, save for wilful misconduct or gross negligence.",
        },
        {
          title: "7. APP MANAGEMENT AND UNINSTALLATION",
          body:
            "The installed icon may be named Mini F.A.T., 002mnfat, 002-mnfat, or Smart Launcher.\n\n• Google Chrome (desktop): type chrome://apps in the address bar and press Enter, then right-click the icon > \"Remove from Chrome\" / \"Uninstall\". Alternatively: open the app, 3-dots menu at the top > \"Uninstall Mini F.A.T.\".\n• Microsoft Edge (desktop): type edge://apps and press Enter, then click the 3 dots next to the app > \"Uninstall\". Alternatively: menu ... > Apps > Manage apps.\n• Brave: type brave://apps and press Enter, then right-click the icon > \"Remove from Brave\".\n• Opera / Vivaldi: type opera://apps or vivaldi://apps and remove the icon via right-click.\n• Safari (Mac, macOS Sonoma or later): open Finder > Applications folder (or User Applications), drag the icon to the Trash.\n• Mozilla Firefox: does not install desktop apps; if you created a bookmark or desktop shortcut, right-click > \"Delete\".\n• Windows (any browser): Settings > Apps > Installed apps, search for the app name > \"Uninstall\".\n• Android (Chrome / Samsung Internet): tap and hold the icon on the Home screen > \"Uninstall\" (or Settings > Apps).\n• iPhone / iPad (Safari): tap and hold the icon on the Home screen > \"Remove App\" > \"Delete from Home Screen\".\n\nNote: uninstalling only removes the icon; your licence and F.A.T. reports remain safely stored and are not deleted.",
        },
        {
          title: "8. DURATION AND TERMINATION",
          body:
            "The licence is valid for the period indicated at the time of purchase. The Supplier reserves the right to suspend access in the event of a breach of these terms.",
        },
        {
          title: "9. CHANGES TO THE TERMS",
          body: "In the event of material changes, renewed acceptance will be required.",
        },
        {
          title: "10. APPLICABLE LAW AND JURISDICTION",
          body:
            "Italian law shall apply. The Court of Cremona shall have jurisdiction, without prejudice to any mandatory consumer-protection provisions.",
        },
      ],
      footer: "Version: v1 — Last updated: 18 October 2026",
    },
  },
  de: {
    langLabel: "Deutsch",
    pageTitle: "Nutzungsbedingungen",
    stepLabel: "Schritt 3 von 3",
    intro:
      "Um die Aktivierung abzuschließen, lesen und akzeptieren Sie bitte die Nutzungsbedingungen der Software.",
    checkboxLabel: "Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie",
    acceptButton: "Akzeptieren und fortfahren",
    acceptingButton: "Speichern…",
    errorGeneric:
      "Die Einwilligung konnte nicht gespeichert werden. Bitte versuchen Sie es in Kürze erneut.",
    content: {
      heading: "NUTZUNGSBEDINGUNGEN DER SOFTWARE",
      subheading: "{{APP_NAME}} — Version 1.0",
      sections: [
        {
          title: "1. GEGENSTAND",
          body:
            "Diese Bedingungen regeln die Nutzung der Software {{APP_NAME}} (\"Software\"), die von Dott. Ing. Nichetti Gian Battista, USt-IdNr. IT01235350194, mit Sitz in Soresina (CR), Italien, unter der Marke CorporateBoostService (\"Anbieter\") bereitgestellt wird.",
        },
        {
          title: "2. NUTZUNGSLIZENZ",
          body:
            "Der Anbieter gewährt dem Nutzer eine nicht ausschließliche, nicht übertragbare und zeitlich begrenzte Nutzungslizenz gemäß den mit der erworbenen Lizenz verbundenen Gültigkeitsbedingungen. Die Lizenz stellt keine Übertragung der geistigen Eigentumsrechte an der Software dar, die im ausschließlichen Eigentum des Anbieters verbleiben.",
        },
        {
          title: "3. KAUF- UND ABRECHNUNGSMODALITÄTEN",
          body:
            "Die Zahlungen werden von Paddle.com Market Limited als Merchant of Record abgewickelt. Einzelheiten finden Sie auf der Seite /pagamenti-merchant-of-record.",
        },
        {
          title: "4. ZULÄSSIGE NUTZUNG",
          body:
            "Der Nutzer verpflichtet sich, die Software ausschließlich für die vorgesehenen Zwecke zu verwenden, nicht zu versuchen, sie zu dekompilieren, zu verändern oder zu verbreiten, und seine Zugangsdaten nicht weiterzugeben.",
        },
        {
          title: "5. DATEN UND DATENSCHUTZ",
          body:
            "Die Verarbeitung personenbezogener Daten unterliegt der auf der Website verfügbaren Datenschutzerklärung, in Übereinstimmung mit der Verordnung (EU) 2016/679 (DSGVO).",
        },
        {
          title: "6. HAFTUNGSBESCHRÄNKUNG",
          body:
            "Die Software wird \"wie besehen\" bereitgestellt. Der Anbieter übernimmt keine Gewähr für Fehlerfreiheit oder ununterbrochene Verfügbarkeit und haftet nicht für indirekte Schäden, außer bei Vorsatz oder grober Fahrlässigkeit.",
        },
        {
          title: "7. VERWALTUNG UND DEINSTALLATION DER APP",
          body:
            "Das installierte Symbol kann Mini F.A.T., 002mnfat, 002-mnfat oder Smart Launcher heißen.\n\n• Google Chrome (Computer): Geben Sie chrome://apps in die Adressleiste ein und drücken Sie die Eingabetaste, dann Rechtsklick auf das Symbol > \"Aus Chrome entfernen\" / \"Deinstallieren\". Alternativ: App öffnen, 3-Punkte-Menü oben > \"Mini F.A.T. deinstallieren\".\n• Microsoft Edge (Computer): Geben Sie edge://apps ein und drücken Sie die Eingabetaste, dann auf die 3 Punkte neben der App klicken > \"Deinstallieren\". Alternativ: Menü ... > Apps > Apps verwalten.\n• Brave: Geben Sie brave://apps ein und drücken Sie die Eingabetaste, dann Rechtsklick auf das Symbol > \"Aus Brave entfernen\".\n• Opera / Vivaldi: Geben Sie opera://apps oder vivaldi://apps ein und entfernen Sie das Symbol per Rechtsklick.\n• Safari (Mac, macOS Sonoma oder neuer): Öffnen Sie den Finder > Ordner Programme, ziehen Sie das Symbol in den Papierkorb.\n• Mozilla Firefox: Installiert keine Desktop-Apps; wenn Sie ein Lesezeichen oder eine Verknüpfung erstellt haben, Rechtsklick > \"Löschen\".\n• Windows (beliebiger Browser): Einstellungen > Apps > Installierte Apps, nach dem App-Namen suchen > \"Deinstallieren\".\n• Android (Chrome / Samsung Internet): Symbol auf dem Startbildschirm gedrückt halten > \"Deinstallieren\" (oder Einstellungen > Apps).\n• iPhone / iPad (Safari): Symbol auf dem Startbildschirm gedrückt halten > \"App entfernen\" > \"Vom Home-Bildschirm löschen\".\n\nHinweis: Die Deinstallation entfernt nur das Symbol; Ihre Lizenz und die F.A.T.-Berichte bleiben gespeichert und gehen nicht verloren.",
        },
        {
          title: "8. LAUFZEIT UND KÜNDIGUNG",
          body:
            "Die Lizenz gilt für den zum Zeitpunkt des Kaufs angegebenen Zeitraum. Der Anbieter behält sich das Recht vor, den Zugang bei Verstoß gegen diese Bedingungen zu sperren.",
        },
        {
          title: "9. ÄNDERUNGEN DER BEDINGUNGEN",
          body:
            "Bei wesentlichen Änderungen ist eine erneute Zustimmung erforderlich.",
        },
        {
          title: "10. ANWENDBARES RECHT UND GERICHTSSTAND",
          body:
            "Es gilt italienisches Recht. Gerichtsstand ist Cremona, vorbehaltlich zwingender verbraucherschützender Bestimmungen.",
        },
      ],
      footer: "Version: v1 — Letzte Aktualisierung: 18. Oktober 2026",
    },
  },
  es: {
    langLabel: "Español",
    pageTitle: "Condiciones de Uso",
    stepLabel: "Paso 3 de 3",
    intro:
      "Para completar la activación, lee y acepta las condiciones de uso del software.",
    checkboxLabel: "He leído y acepto las condiciones de uso",
    acceptButton: "Aceptar y continuar",
    acceptingButton: "Guardando…",
    errorGeneric:
      "No se ha podido registrar el consentimiento. Inténtalo de nuevo en unos instantes.",
    content: {
      heading: "CONDICIONES DE USO DEL SOFTWARE",
      subheading: "{{APP_NAME}} — Versión 1.0",
      sections: [
        {
          title: "1. OBJETO",
          body:
            "Las presentes condiciones regulan el uso del software {{APP_NAME}} (\"Software\"), suministrado por Dott. Ing. Nichetti Gian Battista, NIF IT01235350194, con sede en Soresina (CR), Italia, a través de la marca CorporateBoostService (\"Proveedor\").",
        },
        {
          title: "2. LICENCIA DE USO",
          body:
            "El Proveedor concede al Usuario una licencia de uso no exclusiva, no transferible y limitada en el tiempo, según los términos de validez asociados a la licencia adquirida. La licencia no constituye una cesión de la propiedad intelectual sobre el Software, que sigue siendo propiedad exclusiva del Proveedor.",
        },
        {
          title: "3. FORMA DE COMPRA Y FACTURACIÓN",
          body:
            "Los pagos son gestionados por Paddle.com Market Limited en calidad de Merchant of Record. Para más detalles consulta la página /pagamenti-merchant-of-record.",
        },
        {
          title: "4. USO PERMITIDO",
          body:
            "El Usuario se compromete a utilizar el Software exclusivamente para los fines previstos, a no intentar descompilar, modificar o distribuir el Software y a no compartir sus credenciales de acceso.",
        },
        {
          title: "5. DATOS Y PRIVACIDAD",
          body:
            "El tratamiento de los datos personales se rige por la Política de Privacidad disponible en el sitio web, de conformidad con el Reglamento (UE) 2016/679 (RGPD).",
        },
        {
          title: "6. LIMITACIÓN DE RESPONSABILIDAD",
          body:
            "El Software se suministra \"tal cual\". El Proveedor no garantiza la ausencia de errores o interrupciones del servicio y no responde de los daños indirectos, salvo dolo o culpa grave.",
        },
        {
          title: "7. GESTIÓN Y DESINSTALACIÓN DE LA APLICACIÓN",
          body:
            "El icono instalado puede llamarse Mini F.A.T., 002mnfat, 002-mnfat o Smart Launcher.\n\n• Google Chrome (ordenador): escribe chrome://apps en la barra de direcciones y pulsa Intro, luego clic derecho en el icono > \"Eliminar de Chrome\" / \"Desinstalar\". Alternativamente: abre la app, menú de 3 puntos arriba > \"Desinstalar Mini F.A.T.\".\n• Microsoft Edge (ordenador): escribe edge://apps e Intro, luego clic en los 3 puntos junto a la app > \"Desinstalar\". Alternativamente: menú ... > Aplicaciones > Administrar aplicaciones.\n• Brave: escribe brave://apps e Intro, luego clic derecho en el icono > \"Eliminar de Brave\".\n• Opera / Vivaldi: escribe opera://apps o vivaldi://apps y elimina el icono con clic derecho.\n• Safari (Mac, macOS Sonoma o posterior): abre Finder > carpeta Aplicaciones, arrastra el icono a la Papelera.\n• Mozilla Firefox: no instala aplicaciones en ordenador; si creaste un marcador o acceso directo, clic derecho > \"Eliminar\".\n• Windows (cualquier navegador): Configuración > Aplicaciones > Aplicaciones instaladas, busca el nombre de la app > \"Desinstalar\".\n• Android (Chrome / Samsung Internet): mantén presionado el icono en la pantalla de inicio > \"Desinstalar\" (o Ajustes > Aplicaciones).\n• iPhone / iPad (Safari): mantén presionado el icono en la pantalla de inicio > \"Eliminar app\" > \"Eliminar de la pantalla de inicio\".\n\nNota: la desinstalación elimina únicamente el icono; la licencia y los informes F.A.T. permanecen guardados.",
        },
        {
          title: "8. DURACIÓN Y RESOLUCIÓN",
          body:
            "La licencia tiene la validez indicada en el momento de la compra. El Proveedor se reserva el derecho a suspender el acceso en caso de incumplimiento de estas condiciones.",
        },
        {
          title: "9. MODIFICACIONES DE LAS CONDICIONES",
          body:
            "En caso de modificaciones sustanciales, será necesaria una nueva aceptación.",
        },
        {
          title: "10. LEY APLICABLE Y JURISDICCIÓN",
          body:
            "Se aplica la ley italiana. Fuero de Cremona, salvo disposición imperativa distinta en protección del consumidor.",
        },
      ],
      footer: "Versión: v1 — Última actualización: 18 de octubre de 2026",
    },
  },
};
