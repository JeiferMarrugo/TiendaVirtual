"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Building2, Palette, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGeneralSettings } from "@/components/general-settings-provider";

type GeneralSettingsViewProps = {
  token: string | null;
};

export function GeneralSettingsView({ token }: GeneralSettingsViewProps) {
  const { settings, refreshSettings } = useGeneralSettings();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [nit, setNit] = useState(settings.nit || "");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "");
  const [accentColor, setAccentColor] = useState(settings.accentColor || "#0e7490");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    setCompanyName(settings.companyName);
    setNit(settings.nit || "");
    setLogoUrl(settings.logoUrl || "");
    setAccentColor(settings.accentColor || "#0e7490");
  }, [settings]);

  async function uploadLogoFile(file: File) {
    setIsUploadingLogo(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/uploads/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataUrl,
          fileName: `logo-${companyName || "empresa"}`,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message || "No se pudo subir el logo");
      }

      setLogoUrl(data.url);
      toast.success("Logo subido correctamente. Guarda para aplicar cambios.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error subiendo logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!token) {
      toast.error("Debes iniciar sesión como administrador para guardar.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/settings/general", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName,
          nit,
          logoUrl,
          accentColor,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar la configuración");
      }

      await refreshSettings();
      toast.success("Configuración general actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando configuración");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 px-5 py-8 sm:px-7">
      <div>
        <p className="text-muted text-xs uppercase tracking-[0.3em]">Ajustes</p>
        <h3 className="admin-title mt-2 text-3xl">Configuración general</h3>
        <p className="text-muted mt-2 text-sm">Personaliza la identidad de tu empresa y el color base de la interfaz.</p>
      </div>

      <form onSubmit={saveSettings} className="space-y-4 rounded-3xl border border-line bg-card-strong p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-background p-4">
            <label className="text-muted inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
              <Building2 size={14} />
              Nombre de empresa
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
              placeholder="Ej: Tienda Virtual S.A.S"
              required
            />
          </div>

          <div className="rounded-2xl border border-line bg-background p-4">
            <label className="text-muted text-xs uppercase tracking-[0.25em]">NIT</label>
            <input
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
              placeholder="900123456-7"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-line bg-background p-4">
            <label className="text-muted text-xs uppercase tracking-[0.25em]">Logo URL</label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm"
              placeholder="https://.../logo.png"
            />

            <div className="mt-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-card-strong">
                <Upload size={14} />
                {isUploadingLogo ? "Subiendo logo..." : "Subir logo desde imagen"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingLogo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void uploadLogoFile(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <p className="text-muted mt-2 text-xs">
                La imagen se reajusta automaticamente a 400x400 px para mantener consistencia, aunque el archivo original sea grande.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-background p-4">
            <label className="text-muted inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em]">
              <Palette size={14} />
              Color base
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-12 rounded border border-line"
              />
              <input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-28 rounded-xl border border-line bg-card px-3 py-2 text-sm"
                placeholder="#0e7490"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-line p-4">
          <p className="text-muted text-xs uppercase tracking-[0.25em]">Vista previa</p>
          <div className="mt-3 flex items-center gap-3">
            {logoUrl ? (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-line bg-card p-2 shadow-sm">
                <Image src={logoUrl} alt="Logo" width={64} height={64} className="h-full w-full object-contain" unoptimized />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-2xl" style={{ background: accentColor }} />
            )}
            <div>
              <p className="text-lg font-semibold">{companyName || "Nombre de empresa"}</p>
              <p className="text-muted text-sm">{nit || "Sin NIT configurado"}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-70"
        >
          <Save size={16} />
          {isSaving ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
}
