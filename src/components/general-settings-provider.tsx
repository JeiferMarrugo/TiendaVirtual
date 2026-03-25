"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type GeneralSettings = {
  companyName: string;
  nit: string | null;
  logoUrl: string | null;
  accentColor: string;
};

type SettingsContextValue = {
  settings: GeneralSettings;
  refreshSettings: () => Promise<void>;
};

const DEFAULT_SETTINGS: GeneralSettings = {
  companyName: "Maison Canvas",
  nit: null,
  logoUrl: null,
  accentColor: "#0e7490",
};

const GeneralSettingsContext = createContext<SettingsContextValue | null>(null);

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function GeneralSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GeneralSettings>(DEFAULT_SETTINGS);

  async function refreshSettings() {
    try {
      const response = await fetch("/api/settings/general", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.ok && data.settings) {
        setSettings({
          companyName: data.settings.companyName || DEFAULT_SETTINGS.companyName,
          nit: data.settings.nit || null,
          logoUrl: data.settings.logoUrl || null,
          accentColor: data.settings.accentColor || DEFAULT_SETTINGS.accentColor,
        });
      }
    } catch {
      // Keep defaults if settings are not reachable.
    }
  }

  useEffect(() => {
    void refreshSettings();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", settings.accentColor);
    document.documentElement.style.setProperty("--accent-soft", hexToRgba(settings.accentColor, 0.15));
  }, [settings.accentColor]);

  const value = useMemo(
    () => ({
      settings,
      refreshSettings,
    }),
    [settings],
  );

  return <GeneralSettingsContext.Provider value={value}>{children}</GeneralSettingsContext.Provider>;
}

export function useGeneralSettings() {
  const context = useContext(GeneralSettingsContext);
  if (!context) {
    throw new Error("useGeneralSettings debe usarse dentro de GeneralSettingsProvider");
  }
  return context;
}
