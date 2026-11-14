import { create } from "zustand";

export interface Prefs {
  material: "auto" | "frost" | "clear";
  refractionScale: number;
  specular: number;
  ambient: boolean;
  telemetryMs: number;
  compact: boolean;
  sound: boolean;
  autoLock: boolean;
  lowStockAlerts: boolean;
}

const DEFAULTS: Prefs = {
  material: "auto",
  refractionScale: 1,
  specular: 1,
  ambient: true,
  telemetryMs: 1800,
  compact: false,
  sound: true,
  autoLock: true,
  lowStockAlerts: true,
};

const KEY = "lq-prefs";
const load = (): Prefs => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
};

interface PrefState extends Prefs {
  set: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
  reset: () => void;
}

export const usePrefs = create<PrefState>((set, get) => ({
  ...load(),
  set: (k, v) => {
    set({ [k]: v } as Partial<PrefState>);
    try {
      const { set: _s, reset: _r, ...rest } = get();
      void _s;
      void _r;
      localStorage.setItem(KEY, JSON.stringify(rest));
    } catch {
      /* storage unavailable */
    }
  },
  reset: () => {
    set({ ...DEFAULTS });
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
  },
}));
