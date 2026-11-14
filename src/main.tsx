import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LiquiThemeProvider, defaultGlassTheme } from "@liqui-design/glass";
import { usePrefs } from "@/settings";
import "./globals.css";
import { applyUI, useUI } from "@/theme";
import { useApp } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider, Toaster } from "@/components/ui/toast";
import Shell, { Ambient } from "@/components/Shell";
import Overview from "@/pages/Overview";
import Cafe from "@/pages/Cafe";
import Stock from "@/pages/Stock";
import Finance from "@/pages/Finance";
import Members from "@/pages/Members";
import Monitoring from "@/pages/Monitoring";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

function App() {
  const appearance = useUI((s) => s.appearance);
  const fontId = useUI((s) => s.fontId);
  const themeId = useUI((s) => s.themeId);
  const tick = useApp((s) => s.tick);

  useEffect(() => {
    applyUI({ appearance, fontId, themeId });
    if (appearance !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyUI({ appearance, fontId, themeId });
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [appearance, fontId, themeId]);

  const telemetryMs = usePrefs((s) => s.telemetryMs);
  const ambient = usePrefs((s) => s.ambient);
  const compact = usePrefs((s) => s.compact);
  useEffect(() => {
    const id = setInterval(tick, telemetryMs);
    return () => clearInterval(id);
  }, [tick, telemetryMs]);

  useEffect(() => {
    document.documentElement.style.setProperty("--orb-alpha-scale", ambient ? "1" : "0");
    document.documentElement.dataset.density = compact ? "compact" : "comfy";
  }, [ambient, compact]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Ambient />
      <Shell>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/cafe" element={<Cafe />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/members" element={<Members />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
      <Toaster />
    </BrowserRouter>
  );
}

function Root() {
  const material = usePrefs((s) => s.material);
  const refractionScale = usePrefs((s) => s.refractionScale);
  const specular = usePrefs((s) => s.specular);
  return (
    <LiquiThemeProvider theme={{ glass: { ...defaultGlassTheme, material, refractionScale, specular } }}>
      <TooltipProvider delay={250}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </TooltipProvider>
    </LiquiThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
