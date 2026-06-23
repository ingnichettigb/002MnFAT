## Come vedere la schermata di login

Al momento la schermata con **email + PUK + Prosegui** esiste già ma è montata sulla rotta `/auth`, non sulla home `/` (che mostra ancora direttamente l'app FAT). Per questo non la vedi aprendo il preview.

Hai due opzioni:

### Opzione A — Apri direttamente l'URL (nessuna modifica al codice)
Vai a:
- Preview: `https://id-preview--85d49123-e4a9-4e52-b510-892b92a852ea.lovable.app/auth`
- Published: `https://piccolo-fat-report.lovable.app/auth`
- Dominio: `https://002mnfat.corporateboostservice.eu/auth`

Utile per testare subito il flusso OTP senza toccare il routing.

### Opzione B — Rendere `/auth` la vera schermata iniziale (gate di accesso)
Trasformiamo `/auth` nel "cancello" dell'app:

1. La home `/` (e tutte le altre rotte tipo `/archivio`, `/controlli`, `/report`, `/fase2`) controllano se l'utente ha già una email verificata.
2. Se **non** è verificata → redirect automatico a `/auth`.
3. Se **sì** → l'utente entra nell'app FAT come adesso.
4. Lo stato "email verificata" viene salvato in `localStorage` (chiave `002MnFAT:verifiedEmail`) al completamento dell'OTP (o al bypass dei 7 click), così la verifica persiste tra refresh finché l'utente non fa logout / pulisce il browser.
5. Aggiungiamo un piccolo link "Esci" in alto che cancella la chiave e riporta a `/auth`.

Nessuna modifica a database, server functions o flusso OTP: cambia solo il routing client-side.

### Quale preferisci?
- **A** se vuoi solo testare la Fase 1 senza ancora "blindare" l'app.
- **B** se la Fase 1 deve essere obbligatoria per usare l'app FAT.

Fammi sapere quale scegli (o se vuoi una variante, es. gate solo su `/` ma lasciando libere altre rotte) e procedo.
