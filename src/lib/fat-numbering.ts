// Schema unico di numerazione "in apice" per tutti i campi/voci dell'app.
// Garantisce numeri univoci tra Step 1 (Dati Generali) e Step 2 (Controlli).
//
// 1..5   → Ditta Produttrice (5 campi)
// 6..10  → Ditta Cliente     (5 campi)
// 11..15 → Dati del Collaudo (5 campi)
// 16..   → Presenti al FAT   (2 campi per presente: nome + ruolo)
// dopo   → Lista Controlli   (parte da: 16 + presenti * 2)

export const N_MANUFACTURER_BASE = 1; // 1..5
export const N_CUSTOMER_BASE = 6; // 6..10
export const N_COMMON_BASE = 11; // 11..15
export const N_ATTENDEES_BASE = 16; // 16, 17, 18, 19, ...

export const partyFieldNumbers = (base: number) => ({
  ragioneSociale: base,
  indirizzo: base + 1,
  referente: base + 2,
  email: base + 3,
  telefono: base + 4,
});

export const commonFieldNumbers = () => ({
  numeroDisegno: N_COMMON_BASE,
  numeroMatricola: N_COMMON_BASE + 1,
  tagNumber: N_COMMON_BASE + 2,
  dataCollaudo: N_COMMON_BASE + 3,
  luogoCollaudo: N_COMMON_BASE + 4,
});

export const attendeeFieldNumbers = (index: number) => ({
  nome: N_ATTENDEES_BASE + index * 2,
  ruolo: N_ATTENDEES_BASE + index * 2 + 1,
});

/** Numero del primo controllo, calcolato in modo che non collida con i presenti. */
export const controlsBase = (attendeesCount: number) =>
  N_ATTENDEES_BASE + attendeesCount * 2;
