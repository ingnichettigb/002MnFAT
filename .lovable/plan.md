## Problema

Il bypass a 7 click non funziona quando i campi email/PUK sono vuoti perché il form ha `required` sull'input email e `type="email"`: il browser blocca il submit con la validazione HTML nativa prima che `handleProsegui` venga eseguito, quindi il contatore non si incrementa mai.

## Soluzione

In `src/routes/auth.tsx`:

1. Rimuovere `required` dall'input email (e mantenere la validazione manuale già presente nel codice, che mostra "Inserisci una email valida").
2. Aggiungere `noValidate` al `<form>` dello stage "email" per disabilitare del tutto la validazione HTML nativa.
3. Spostare l'incremento del contatore e il check `>= 7` **all'inizio assoluto** di `handleProsegui`, prima di qualsiasi altra logica (è già così, ma confermare l'ordine).

Risultato: cliccando "Prosegui" 7 volte di fila con campi vuoti, il contatore avanza ad ogni click e al settimo l'utente entra direttamente in Fase 2, senza messaggi visibili.

Nessuna altra modifica: flusso OTP, server functions, DB, gate di autenticazione restano invariati.
