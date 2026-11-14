# Liqui Lounge — Gaming Lounge OS

A liquid-glass admin interface for a gaming lounge. React + Vite + TypeScript + Tailwind CSS v4, built on [liqui](https://liqui.design) (Base UI primitives + `@liqui-design/glass` optics).

**Live:** https://jmaatouk97.github.io/liqui-gaming-lounge/

## Run

```bash
npm install
npm run dev      # http://127.0.0.1:5174
npm run build
```

## Modules

Overview · Cafe & Floor (POS + station map) · Stock · Finance · Members · Monitoring (live telemetry) · Shift Reports · Settings

## Global controls (topbar)

- **Appearance** — Light / Dark / System (toggles `.dark` on `<html>`)
- **Typography** — 6 presets driving `--font-display`, `--font-sans`, `--font-mono`
- **Theme colors** — 16 presets mapped onto `--theme-*` and `--lq-accent / --lq-tint / --lq-tint-deep` for both modes

All choices persist in `localStorage`. Chromium renders true refraction; Safari and Firefox fall back to frosted blur.
