"use client";

import { LogIn, LogOut, RefreshCw, UserRound } from "lucide-react";
import Link from "next/link";
import { SessionState } from "@/lib/storage";
import { ThemeToggle } from "@/components/theme-toggle";

type AdminHeaderProps = {
  session: SessionState;
  lastSync: string;
  onRefresh: () => void;
  onToggleSession: () => void;
};

export function AdminHeader({ session, lastSync, onRefresh, onToggleSession }: AdminHeaderProps) {
  return (
    <header className="border-b border-line px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-muted text-xs uppercase tracking-[0.35em]">Administracion</p>
          <h2 className="section-title mt-2 text-4xl">Centro de control comercial</h2>
          <p className="text-muted mt-2 text-sm">Ultima sincronizacion: {lastSync || "pendiente"}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <ThemeToggle />
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card-strong px-4 py-2 text-sm text-foreground transition hover:bg-background"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <Link href="/" className="rounded-full border border-line bg-card-strong px-4 py-2 text-sm text-foreground">
            Ver tienda
          </Link>
          {session.adminLoggedIn ? (
            <details className="relative">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-card-strong px-4 py-2 text-sm text-foreground">
                <UserRound size={16} />
                {session.adminName}
              </summary>
              <div className="absolute right-0 z-10 mt-2 min-w-[220px] rounded-2xl border border-line bg-card p-2 shadow-xl">
                <p className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted">Sesión activa</p>
                <div className="rounded-xl bg-card-strong px-3 py-2 text-sm text-foreground">
                  <p className="font-semibold">{session.adminName}</p>
                  <p className="text-xs text-muted">Rol: {session.adminRole || "N/A"}</p>
                </div>
                <button
                  onClick={onToggleSession}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm text-on-primary"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </details>
          ) : (
            <button
              onClick={onToggleSession}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-on-primary"
            >
              <LogIn size={16} />
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
