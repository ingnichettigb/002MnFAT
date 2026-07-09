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

export function InfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Informazioni"
          title="Come funziona mini FAT"
        >
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>mini FAT — Guida all'uso</DialogTitle>
          <DialogDescription>
            Factory Acceptance Test — Dossier documentale. Come utilizzare
            l'applicazione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2 text-sm leading-relaxed text-foreground">
          <section>
            <h3 className="mb-1 text-base font-semibold">1. Cos'è mini FAT</h3>
            <p className="text-muted-foreground">
              Applicazione mobile-first per creare, compilare e archiviare
              dossier documentali FAT (Factory Acceptance Test) in ambito
              industriale. Genera un fascicolo professionale completo con
              intestazioni bilingui, elenco documenti richiesti, copertina,
              indice e allegati — esportabile in PDF direttamente dal
              dispositivo.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              2. Schermata principale — Inserimento dati
            </h3>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                <b>Sezione 100 — Costruttore:</b> nome azienda produttrice,
                logo (URL immagine), sede legale, telefono, email.
              </li>
              <li>
                <b>Sezione 200 — Cliente:</b> stessi campi per l'azienda
                committente.
              </li>
              <li>
                <b>Sezione 300 — Oggetto FAT:</b> descrizione del bene
                collaudato, N° disegno costruttore, N° fabbrica, N° commessa,
                riferimenti cliente (TAG/Tavola, N° Disegno Cliente, N°
                Ordine, Data Ordine), note.
              </li>
              <li>
                <b>Sezione 400 — Conclusioni:</b> esito FAT (Accettato / Non
                Accettato), motivazione, note, azioni correttive, date, firme
                ispettori e accettazione finale.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              3. Selezione lingua (LANG)
            </h3>
            <p className="text-muted-foreground">
              Il pulsante lingua consente di impostare una o due lingue per il
              documento: la 1ª (evidenziata in giallo) è la principale, la 2ª
              (in ciano) è affiancata. Disponibili: Italiano (IT), Inglese
              (EN), Tedesco (DE), Spagnolo (ES). Esempio: IT + EN genera
              etichette bilingui "Costruttore / Manufacturer".
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">4. Template (TEMPL)</h3>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                <b>Salvare:</b> compilare sezioni 100 e 200, premere TEMPL,
                inserire un nome e Salva.
              </li>
              <li>
                <b>Caricare:</b> TEMPL → seleziona template → CARICA.
              </li>
              <li>
                <b>Eliminare:</b> icona cestino accanto al template.
              </li>
            </ul>
            <p className="mt-1 text-xs text-muted-foreground">
              I template sono salvati localmente sul dispositivo.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              5. Documenti richiesti (DOC)
            </h3>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>Selezionare/deselezionare i documenti dalla lista.</li>
              <li>
                DEVIAZIONI, AZIONI CORRETTIVE e VARIE sono sempre inclusi.
              </li>
              <li>
                È possibile aggiungere documenti personalizzati dal campo in
                fondo alla lista.
              </li>
              <li>Premere SALVA & CONTINUA per confermare.</li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              6. Anteprima e generazione PDF
            </h3>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                <b>Pagina 1 — Copertina:</b> dati costruttore, cliente,
                oggetto FAT e conclusioni con firme.
              </li>
              <li>
                <b>Pagina 2 — Indice:</b> elenco numerato documenti con blocchi
                firma.
              </li>
              <li>
                <b>Pagine successive:</b> una per ciascun documento
                (metadati + area allegato + firma ispettore/cliente).
              </li>
              <li>
                <b>Azioni:</b> SALVA (aggiorna il FAT nel cloud), SCARICA PDF
                (genera il file), frecce per sfogliare.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">7. Archivio FAT</h3>
            <p className="text-muted-foreground">
              Elenco di tutti i FAT salvati nel cloud con titolo, stato (In
              lavorazione / Completato) e data aggiornamento. Per ogni record:
              MODIFICA, DUPLICA (crea copia " — COPIA"), ELIMINA (con
              conferma).
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              8. Salvataggio dati (SALVA)
            </h3>
            <p className="text-muted-foreground">
              Salva tutti i dati nel cloud. Al primo salvataggio viene chiesto
              un titolo; i successivi aggiornano il record. Il pulsante
              diventa verde per 2,5 s a conferma. Vengono salvati: lingue,
              costruttore, cliente, oggetto FAT, conclusioni, lista documenti
              selezionati.
            </p>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">
              9. Flusso di lavoro consigliato
            </h3>
            <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
              <li>Compilare dati Costruttore (sezione 100).</li>
              <li>Compilare dati Cliente (sezione 200).</li>
              <li>Compilare Oggetto FAT (sezione 300).</li>
              <li>Impostare la lingua con LANG.</li>
              <li>SALVA per creare il record (inserire titolo).</li>
              <li>DOC → selezionare documenti → SALVA & CONTINUA.</li>
              <li>Compilare Conclusioni (sezione 400).</li>
              <li>PDF → anteprima e scarica.</li>
              <li>Stampare e allegare fisicamente i documenti.</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-1 text-base font-semibold">10. Note tecniche</h3>
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                Il PDF viene generato interamente sul dispositivo, senza
                invio a server esterni.
              </li>
              <li>
                I template costruttore/cliente sono salvati localmente
                (localStorage) e non sincronizzati.
              </li>
              <li>
                Il FAT è modificabile in qualsiasi momento dall'archivio.
              </li>
              <li>
                I loghi sono URL: inserire immagini pubblicamente
                accessibili.
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
