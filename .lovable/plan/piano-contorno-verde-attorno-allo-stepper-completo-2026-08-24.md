# Piano: contorno verde attorno allo stepper completo

## Cosa si vuole ottenere
Racchiudere l’intera barra delle fasi (tutti e tre i bottoni 1-2-3) in un riquadro con bordo verde chiaro. In alto a sinistra del riquadro, mostrare l’etichetta "FASE DI LAVORAZIONE" (tradotta nelle 4 lingue). I tre bottoni devono restare cliccabili per navigare tra le fasi.

## Modifiche previste

### 1. `src/components/fat-stepper.tsx`
- Avvolgere il `<nav>` esistente in un contenitore relativo con:
  - `border border-green-500/60` (verde chiaro/sottile)
  - `rounded-xl` e padding interno adeguato
  - sfondo leggermente differenziato se necessario
- Aggiungere in alto a sinistra, dentro il riquadro, una `<span>` assoluta o in negativo margine che mostri `dict.currentPhase[primary]`:
  - testo maiuscolo, piccolo (`text-[10px]` / `text-xs`)
  - sfondo `bg-background` per coprire la linea del bordo
  - padding orizzontale per leggibilità
- Mantenere il `<nav>` con i tre `<Link>` funzionanti e la logica di stato attivo/completato già presente.
- Rimuovere l’etichetta "FASE DI LAVORAZIONE" dal singolo bottone attivo (quella attuale è posizionata sopra il solo step corrente).

### 2. `src/lib/i18n.tsx`
- Verificare che `currentPhase` contenga le traduzioni corrette in IT, EN, DE, ES.
- Se necessario, aggiustare le voci per essere coerenti con l’indicazione di "area di lavorazione".

### 3. Verifica visiva
- Catturare uno screenshot della pagina `/` per confermare che:
  - il bordo verde racchiuda tutti e tre gli step
  - l’etichetta sia leggibile in alto a sinistra
  - i bottoni 1, 2, 3 siano ancora cliccabili

## Non in scope
- Non modificare i testi delle condizioni d’uso.
- Non cambiare la logica di navigazione o lo stato del form.
- Non disabilitare alcun link dello stepper.
