import { create } from "zustand";

export type Appearance = "light" | "dark" | "system";

export interface FontPreset {
  id: string;
  name: string;
  blurb: string;
  display: string;
  sans: string;
  mono: string;
}

const APPLE = `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif`;
const q = (f: string, fb = "sans-serif") => `"${f}", ${fb}`;

export const FONTS: FontPreset[] = [
  { id: "apple", name: "Apple Native", blurb: "San Francisco", display: APPLE, sans: APPLE, mono: `"SF Mono", ui-monospace, Menlo, monospace` },
  { id: "neo", name: "Neo-Grotesque", blurb: "Space Grotesk", display: q("Space Grotesk"), sans: q("Plus Jakarta Sans"), mono: q("IBM Plex Mono", "ui-monospace, monospace") },
  { id: "swiss", name: "Swiss Technical", blurb: "Archivo", display: q("Archivo"), sans: q("Archivo"), mono: q("Space Mono", "ui-monospace, monospace") },
  { id: "editorial", name: "Modern Editorial", blurb: "Outfit", display: q("Outfit"), sans: q("DM Sans"), mono: q("Fira Code", "ui-monospace, monospace") },
  { id: "cyber", name: "Cyber Kinetic", blurb: "Chakra Petch", display: q("Chakra Petch"), sans: q("Exo 2"), mono: q("Share Tech Mono", "ui-monospace, monospace") },
  { id: "humanist", name: "Humanist Precision", blurb: "Figtree", display: q("Figtree"), sans: q("Figtree"), mono: q("Azeret Mono", "ui-monospace, monospace") },
];

export interface ThemePreset {
  id: string;
  name: string;
  group: "Theme Colors" | "Curated Palettes";
  primary: string; // dark-mode primary
  primaryLight?: string; // optional light-mode primary override
  secondary: string;
  tintDark: string;
  tintLight: string;
}

export const THEMES: ThemePreset[] = [
  { id: "liqui", name: "Liqui", group: "Theme Colors", primary: "#6F9DFF", secondary: "#93B4FF", tintDark: "#1E202E", tintLight: "#EEF2FF" },
  { id: "arctic", name: "Arctic", group: "Theme Colors", primary: "#38BDF8", secondary: "#7DD3FC", tintDark: "#162232", tintLight: "#E0F2FE" },
  { id: "graphite", name: "Graphite", group: "Theme Colors", primary: "#94A3B8", secondary: "#CBD5E1", tintDark: "#1C1E24", tintLight: "#F1F5F9" },
  { id: "aurora", name: "Aurora", group: "Theme Colors", primary: "#34D399", secondary: "#A78BFA", tintDark: "#12262A", tintLight: "#ECFDF5" },
  { id: "noir", name: "Noir", group: "Theme Colors", primary: "#F5F6FF", primaryLight: "#27272A", secondary: "#71717A", tintDark: "#121318", tintLight: "#E4E4E7" },
  { id: "crystal", name: "Crystal", group: "Theme Colors", primary: "#22D3EE", secondary: "#F472B6", tintDark: "#1B2432", tintLight: "#F0FDFA" },
  { id: "nordic", name: "Nordic Cobalt", group: "Curated Palettes", primary: "#3B82F6", secondary: "#38BDF8", tintDark: "#1E293B", tintLight: "#DBEAFE" },
  { id: "tokyo", name: "Tokyo Dusk", group: "Curated Palettes", primary: "#F43F5E", secondary: "#F59E0B", tintDark: "#311042", tintLight: "#FFE4E6" },
  { id: "emerald", name: "Emerald Lounge", group: "Curated Palettes", primary: "#10B981", secondary: "#2DD4BF", tintDark: "#064E3B", tintLight: "#D1FAE5" },
  { id: "solar", name: "Solar Sand", group: "Curated Palettes", primary: "#EA580C", secondary: "#EAB308", tintDark: "#291D18", tintLight: "#FFEDD5" },
  { id: "velvet", name: "Velvet Iris", group: "Curated Palettes", primary: "#8B5CF6", secondary: "#D946EF", tintDark: "#1E1B4B", tintLight: "#EDE9FE" },
  { id: "titanium", name: "Monochrome Titanium", group: "Curated Palettes", primary: "#E2E8F0", primaryLight: "#18181B", secondary: "#94A3B8", tintDark: "#18181B", tintLight: "#E4E4E7" },
  { id: "cyberpulse", name: "Cyber Pulse", group: "Curated Palettes", primary: "#06B6D4", secondary: "#EC4899", tintDark: "#1E1035", tintLight: "#FCE7F3" },
  { id: "synthwave", name: "Synthwave Prism", group: "Curated Palettes", primary: "#22D3EE", secondary: "#A855F7", tintDark: "#17153B", tintLight: "#F3E8FF" },
  { id: "arcade", name: "Arcade Volt", group: "Curated Palettes", primary: "#2563EB", secondary: "#FACC15", tintDark: "#0F172A", tintLight: "#FEF9C3" },
  { id: "apex", name: "Apex Racing", group: "Curated Palettes", primary: "#3B82F6", secondary: "#EF4444", tintDark: "#111827", tintLight: "#FEE2E2" },
];

/* ── colour helpers ── */
const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const toHex = (c: number[]) =>
  "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
/** Darkens pale colours until white button labels stay legible on them. */
const solidAccent = (hex: string) => {
  let c = hex;
  for (let i = 0; i < 14 && lum(c) > 0.3; i++) c = mix(c, "#000000", 0.12);
  return c;
};

export function buildThemeCss(t: ThemePreset): string {
  const lightPrimary = t.primaryLight ?? t.primary;
  const light = [
    `--theme-primary:${lightPrimary}`,
    `--theme-secondary:${mix(t.secondary, "#000000", 0.12)}`,
    `--theme-surface-tint:${t.tintLight}`,
    `--theme-ambient-1:${t.primaryLight ? mix(t.secondary, "#ffffff", 0.2) : lightPrimary}`,
    `--theme-ambient-2:${t.secondary}`,
    `--theme-ambient-3:${mix(t.tintLight, t.secondary, 0.35)}`,
    `--lq-accent:${solidAccent(t.primaryLight ? lightPrimary : mix(lightPrimary, "#000000", 0.14))}`,
    `--lq-tint:${rgba(mix(t.tintLight, "#ffffff", 0.45), 0.5)}`,
    `--lq-tint-deep:${rgba(mix(t.tintLight, "#ffffff", 0.2), 0.16)}`,
  ].join(";");
  const dark = [
    `--theme-primary:${t.primary}`,
    `--theme-secondary:${t.secondary}`,
    `--theme-surface-tint:${t.tintDark}`,
    `--theme-ambient-1:${t.primary}`,
    `--theme-ambient-2:${t.secondary}`,
    `--theme-ambient-3:${mix(t.tintDark, t.primary, 0.3)}`,
    `--lq-accent:${solidAccent(t.primary)}`,
    `--lq-tint:${rgba(t.tintDark, 0.62)}`,
    `--lq-tint-deep:${rgba(mix(t.tintDark, "#000000", 0.4), 0.4)}`,
  ].join(";");
  return `:root{${light}}:root.dark{${dark}}`;
}

interface UIState {
  appearance: Appearance;
  fontId: string;
  themeId: string;
  setAppearance: (a: Appearance) => void;
  setFont: (id: string) => void;
  setTheme: (id: string) => void;
}

const read = (k: string, d: string) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage unavailable */
  }
};

export const useUI = create<UIState>((set) => ({
  appearance: read("lq-appearance", "dark") as Appearance,
  fontId: read("lq-font", "apple"),
  themeId: read("lq-theme", "liqui"),
  setAppearance: (appearance) => {
    write("lq-appearance", appearance);
    set({ appearance });
  },
  setFont: (fontId) => {
    write("lq-font", fontId);
    set({ fontId });
  },
  setTheme: (themeId) => {
    write("lq-theme", themeId);
    set({ themeId });
  },
}));

export function applyUI(s: Pick<UIState, "appearance" | "fontId" | "themeId">) {
  const root = document.documentElement;
  const dark =
    s.appearance === "dark" || (s.appearance === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  const f = FONTS.find((x) => x.id === s.fontId) ?? FONTS[0];
  root.style.setProperty("--font-display", f.display);
  root.style.setProperty("--font-sans", f.sans);
  root.style.setProperty("--font-mono", f.mono);
  const t = THEMES.find((x) => x.id === s.themeId) ?? THEMES[0];
  let el = document.getElementById("theme-vars") as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = "theme-vars";
    document.head.appendChild(el);
  }
  el.textContent = buildThemeCss(t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0B0D12" : "#F4F6FA");
}
