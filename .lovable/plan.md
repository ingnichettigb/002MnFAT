## Bypass sviluppatore con credenziali fisse

**Sostituire** il meccanismo dei 7 click con un bypass basato su credenziali fisse.

**Modifica in `src/routes/auth.tsx`**:

In `handleProsegui`, prima di ogni validazione/chiamata OTP, controllare:

```ts
if (email.trim().toLowerCase() === "xxx@xxx" && puk.trim() === "XXX") {
  goPhase2("Accesso sviluppatore");
  return;
}
```

- Rimuovere `clickCountRef` e la logica dei 7 click (non più necessaria).
- Mantenere invariato il resto del flusso (validazione email, invio OTP, verifica codice).
- Nessuna modifica ad altri file.

Risultato: inserendo `xxx@xxx` come email e `XXX` come PUK e cliccando "Prosegui" si entra direttamente in `/fase2`.
