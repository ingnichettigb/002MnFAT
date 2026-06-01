import * as React from "react";
import { DEFAULT_CONTROLS } from "./fat-defaults";

export type Party = {
  ragioneSociale: string;
  indirizzo: string;
  referente: string;
  email: string;
  telefono: string;
};

export type Attendee = {
  id: string;
  nome: string;
  ruolo: string;
  azienda: string;
};

export type Conclusioni = {
  accettato: "" | "si" | "no";
  motivoNonAccettazione: string;
  note: string;
  azioniCorrettive: "" | "si" | "no";
  dataIspezione: string;
  ispettoreEsterno: string;
  controlloInterno: string;
  dopoAzioni: "" | "si" | "no" | "na";
  dataFinale: string;
  firma: string;
};

export type GeneralData = {
  produttore: Party;
  cliente: Party;
  numeroDisegno: string;
  numeroMatricola: string;
  tagNumber: string;
  commessa: string;
  dataCollaudo: string;
  luogoCollaudo: string;
  descrizione: string;
  presenti: Attendee[];
  conclusioni: Conclusioni;
};

export type ControlItem = {
  id: string;
  label: string;
  selected: boolean;
  custom?: boolean;
};

export type FatState = {
  general: GeneralData;
  controls: ControlItem[];
};

export type FatStatus = "todo" | "in_progress" | "done";

export type SavedFat = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: FatStatus;
  state: FatState;
};

const STORAGE_KEY = "mini-fat:v2"; // legacy single-state (used for migration)
const ARCHIVE_KEY = "mini-fat:archive:v1";
const ACTIVE_KEY = "mini-fat:active:v1";

const emptyParty: Party = {
  ragioneSociale: "",
  indirizzo: "",
  referente: "",
  email: "",
  telefono: "",
};

const newAttendee = (): Attendee => ({
  id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nome: "",
  ruolo: "",
});

const emptyConclusioni: Conclusioni = {
  accettato: "",
  motivoNonAccettazione: "",
  note: "",
  azioniCorrettive: "",
  dataIspezione: "",
  ispettoreEsterno: "",
  controlloInterno: "",
  dopoAzioni: "",
  dataFinale: "",
  firma: "",
};

const emptyGeneral = (): GeneralData => ({
  produttore: { ...emptyParty },
  cliente: { ...emptyParty },
  numeroDisegno: "",
  numeroMatricola: "",
  tagNumber: "",
  commessa: "",
  dataCollaudo: "",
  luogoCollaudo: "",
  descrizione: "",
  presenti: [newAttendee(), newAttendee()],
  conclusioni: { ...emptyConclusioni },
});

const initialControls = (): ControlItem[] =>
  DEFAULT_CONTROLS.map((label, i) => ({
    id: `default-${i}`,
    label,
    selected: false,
  }));

const emptyState = (): FatState => ({
  general: emptyGeneral(),
  controls: initialControls(),
});

const makeId = () =>
  `fat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const newSavedFat = (state?: FatState): SavedFat => {
  const now = Date.now();
  return {
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    status: "todo",
    state: state ?? emptyState(),
  };
};

/** Heuristica per capire se un FAT è "in lavorazione" (almeno un campo compilato). */
function hasMeaningfulData(s: FatState): boolean {
  const g = s.general;
  if (
    g.produttore.ragioneSociale ||
    g.cliente.ragioneSociale ||
    g.numeroDisegno ||
    g.numeroMatricola ||
    g.tagNumber ||
    g.commessa ||
    g.dataCollaudo ||
    g.luogoCollaudo ||
    g.descrizione
  ) {
    return true;
  }
  if (g.presenti.some((p) => p.nome || p.ruolo)) return true;
  if (s.controls.some((c) => c.selected)) return true;
  return false;
}

type Ctx = {
  state: FatState;
  archive: SavedFat[];
  activeId: string | null;
  activeFat: SavedFat | null;
  setGeneral: (g: GeneralData) => void;
  toggleControl: (id: string) => void;
  addCustomControl: (label: string) => void;
  removeControl: (id: string) => void;
  reset: () => void;
  // Archivio
  saveDraft: () => void;
  markDone: () => void;
  loadFat: (id: string) => void;
  duplicateFat: (id: string) => void;
  deleteFat: (id: string) => void;
  newFat: () => void;
  setStatus: (id: string, status: FatStatus) => void;
};

const FatContext = React.createContext<Ctx | null>(null);

export function FatProvider({ children }: { children: React.ReactNode }) {
  const [archive, setArchive] = React.useState<SavedFat[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate from localStorage (with legacy migration)
  React.useEffect(() => {
    try {
      const rawArchive = localStorage.getItem(ARCHIVE_KEY);
      const rawActive = localStorage.getItem(ACTIVE_KEY);
      let arch: SavedFat[] = [];
      if (rawArchive) {
        const parsed = JSON.parse(rawArchive);
        if (Array.isArray(parsed)) arch = parsed as SavedFat[];
      }
      // Migrazione da mini-fat:v2
      if (arch.length === 0) {
        const legacy = localStorage.getItem(STORAGE_KEY);
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy) as FatState;
            if (parsed?.general && Array.isArray(parsed.controls)) {
              const rec = newSavedFat(parsed);
              rec.status = hasMeaningfulData(parsed) ? "in_progress" : "todo";
              arch = [rec];
            }
          } catch {}
        }
      }
      if (arch.length === 0) {
        arch = [newSavedFat()];
      }
      let active = rawActive && arch.find((f) => f.id === rawActive)?.id;
      if (!active) active = arch[0].id;
      setArchive(arch);
      setActiveId(active);
    } catch {
      const rec = newSavedFat();
      setArchive([rec]);
      setActiveId(rec.id);
    }
    setHydrated(true);
  }, []);

  // Persist
  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
      if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    } catch {}
  }, [archive, activeId, hydrated]);

  const activeFat = React.useMemo(
    () => archive.find((f) => f.id === activeId) ?? null,
    [archive, activeId],
  );

  const state: FatState = activeFat?.state ?? emptyState();

  // Aggiorna lo stato del FAT attivo, e bumpa status->in_progress se serve
  const updateActiveState = React.useCallback(
    (updater: (s: FatState) => FatState) => {
      setArchive((arr) =>
        arr.map((f) => {
          if (f.id !== activeId) return f;
          const next = updater(f.state);
          const nextStatus: FatStatus =
            f.status === "done"
              ? "done"
              : hasMeaningfulData(next)
                ? "in_progress"
                : "todo";
          return {
            ...f,
            state: next,
            updatedAt: Date.now(),
            status: nextStatus,
          };
        }),
      );
    },
    [activeId],
  );

  const value: Ctx = React.useMemo(
    () => ({
      state,
      archive,
      activeId,
      activeFat,
      setGeneral: (g) => updateActiveState((s) => ({ ...s, general: g })),
      toggleControl: (id) =>
        updateActiveState((s) => ({
          ...s,
          controls: s.controls.map((c) =>
            c.id === id ? { ...c, selected: !c.selected } : c,
          ),
        })),
      addCustomControl: (label) =>
        updateActiveState((s) => ({
          ...s,
          controls: [
            ...s.controls,
            {
              id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              label,
              selected: true,
              custom: true,
            },
          ],
        })),
      removeControl: (id) =>
        updateActiveState((s) => ({
          ...s,
          controls: s.controls.filter((c) => c.id !== id),
        })),
      reset: () => updateActiveState(() => emptyState()),

      saveDraft: () => {
        // Touch updatedAt; status già gestito dall'updater
        setArchive((arr) =>
          arr.map((f) =>
            f.id === activeId ? { ...f, updatedAt: Date.now() } : f,
          ),
        );
      },
      markDone: () => {
        setArchive((arr) =>
          arr.map((f) =>
            f.id === activeId
              ? { ...f, status: "done", updatedAt: Date.now() }
              : f,
          ),
        );
      },
      loadFat: (id) => {
        if (archive.some((f) => f.id === id)) setActiveId(id);
      },
      duplicateFat: (id) => {
        const src = archive.find((f) => f.id === id);
        if (!src) return;
        const copy: SavedFat = {
          ...newSavedFat(JSON.parse(JSON.stringify(src.state)) as FatState),
          status: hasMeaningfulData(src.state) ? "in_progress" : "todo",
        };
        setArchive((arr) => [copy, ...arr]);
        setActiveId(copy.id);
      },
      deleteFat: (id) => {
        setArchive((arr) => {
          const next = arr.filter((f) => f.id !== id);
          if (next.length === 0) {
            const fresh = newSavedFat();
            setActiveId(fresh.id);
            return [fresh];
          }
          if (id === activeId) setActiveId(next[0].id);
          return next;
        });
      },
      newFat: () => {
        const rec = newSavedFat();
        setArchive((arr) => [rec, ...arr]);
        setActiveId(rec.id);
      },
      setStatus: (id, status) => {
        setArchive((arr) =>
          arr.map((f) =>
            f.id === id ? { ...f, status, updatedAt: Date.now() } : f,
          ),
        );
      },
    }),
    [state, archive, activeId, activeFat, updateActiveState],
  );

  return <FatContext.Provider value={value}>{children}</FatContext.Provider>;
}

export function useFat() {
  const ctx = React.useContext(FatContext);
  if (!ctx) throw new Error("useFat must be used within FatProvider");
  return ctx;
}

export { newAttendee };
