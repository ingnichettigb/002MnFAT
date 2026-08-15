# Rimozione del bypass sviluppatore

## Cosa ho capito

Vuoi eliminare completamente la scorciatoia di sviluppo che permette di entrare nell'app senza verificare email, licenza e PUK. Oggi in fondo alla pagina `/auth` c'è un bottone rosso "Sviluppatore — bypass" che scrive in localStorage un'email finta (`dev@bypass.local`) e il flag di attivazione, poi porta direttamente alla home saltando tutti i controlli. Dopo la modifica l'unico modo di entrare sarà il funnel reale: OTP email → licenza + PUK → condizioni d'uso.

## Modifiche

1. `src/routes/auth.tsx` — rimuovo il blocco finale con il bottone rosso "Sviluppatore — bypass" (il `<div className="mt-6 border-t pt-4">` con il `Button` e le due scritture in localStorage). Nessun'altra logica della pagina viene toccata.

2. `FLUSSO-INGRESSO-README.md` — aggiorno le due righe che documentano il bottone: la descrizione nella sezione del passaggio 1 e il punto 9 della checklist di replica ("Rimuovi il bottone rosso…"), che non ha più senso.

## Cosa NON toccherò

- Le occorrenze della parola "bypass" che non riguardano lo sviluppatore: i commenti tecnici in `src/lib/license.functions.ts` e `src/integrations/supabase/client.server.ts` (RLS/service role) e i riferimenti in `AUTENTICAZIONE-MULTISEAT-README.md` che parlano di *impedire* il bypass degli step.
- OTP, attivazione, condizioni, AuthGate, chiavi localStorage.

## Verifica

Typecheck e controllo che `/auth` mostri solo il form di verifica email, senza il bottone rosso.
