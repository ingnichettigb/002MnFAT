import * as React from "react";
import { DEFAULT_CONTROLS } from "./fat-defaults";

export type GeneralData = {
  ragioneSociale: string;
  compilatore: string;
  dataCollaudo: string;
  luogoCollaudo: string;
  numeroDisegno: string;
  numeroMatricola: string;
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

const STORAGE_KEY = "mini-fat:v1";

const emptyGeneral: GeneralData = {
  ragioneSociale: "",
  compilatore: "",
  dataCollaudo: "",
  luogoCollaudo: "",
  numeroDisegno: "",
  numeroMatricola: "",
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
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
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
      reset: () => setState({ general: emptyGeneral, controls: initialControls() }),
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
