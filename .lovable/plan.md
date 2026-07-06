Correggerò la verifica OTP in modo che il codice appena inviato resti valido per 10 minuti reali.

Piano:
1. Cambiare la logica di scadenza in `verifyOtp`: non userà più `created_at` della riga, perché quella data può essere vecchia se la stessa riga viene riutilizzata per inviare un nuovo codice.
2. Usare invece `otp_window_start` come timestamp dell’ultimo codice inviato, così la validità decorre dall’invio effettivo appena fatto.
3. Aggiornare la query di verifica per leggere anche `otp_window_start`.
4. Se il codice è sbagliato, mostrare esattamente: `Codice non corretto, riprova`.
5. Lasciare invariato il limite di 3 invii ogni 24 ore.

Risultato atteso: un codice appena ricevuto non risulterà più scaduto dopo pochi secondi; scadrà solo dopo 10 minuti dall’ultimo invio.