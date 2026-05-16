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

const STORAGE_KEY = "mini-fat:v2";

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

const emptyGeneral: GeneralData = {
  produttore: { ...emptyParty },
  cliente: { ...emptyParty },
  numeroDisegno: "",
  numeroMatricola: "",
  tagNumber: "",
  dataCollaudo: "",
  luogoCollaudo: "",
  presenti: [
    { id: "att-default-1", nome: "", ruolo: "" },
    { id: "att-default-2", nome: "", ruolo: "" },
  ],
};

const initialControls = (): ControlItem[] =>
  DEFAULT_CONTROLS.map((label, i) => ({
    id: `default-${i}`,
    label,
    selected: false,
  }));

const initialState: FatState = {
  general: emptyGeneral,
  controls: initialControls(),
};

type Ctx = {
  state: FatState;
  setGeneral: (g: GeneralData) => void;
  toggleControl: (id: string) => void;
  addCustomControl: (label: string) => void;
  removeControl: (id: string) => void;
  reset: () => void;
};

const FatContext = React.createContext<Ctx | null>(null);

export function FatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FatState>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FatState;
        if (parsed?.general && Array.isArray(parsed.controls)) {
          setState(parsed);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const value: Ctx = React.useMemo(
    () => ({
      state,
      setGeneral: (g) => setState((s) => ({ ...s, general: g })),
      toggleControl: (id) =>
        setState((s) => ({
          ...s,
          controls: s.controls.map((c) =>
            c.id === id ? { ...c, selected: !c.selected } : c,
          ),
        })),
      addCustomControl: (label) =>
        setState((s) => ({
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
        setState((s) => ({
          ...s,
          controls: s.controls.filter((c) => c.id !== id),
        })),
      reset: () =>
        setState({
          general: {
            ...emptyGeneral,
            produttore: { ...emptyParty },
            cliente: { ...emptyParty },
            presenti: [newAttendee(), newAttendee()],
          },
          controls: initialControls(),
        }),
    }),
    [state],
  );

  return <FatContext.Provider value={value}>{children}</FatContext.Provider>;
}

export function useFat() {
  const ctx = React.useContext(FatContext);
  if (!ctx) throw new Error("useFat must be used within FatProvider");
  return ctx;
}

export { newAttendee };
