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
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card-strong px-4 py-2 text-sm text-foreground">
            <UserRound size={16} />
            {session.adminName}
          </div>
          <button
            onClick={onToggleSession}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-on-primary"
          >
            {session.adminLoggedIn ? <LogOut size={16} /> : <LogIn size={16} />}
            {session.adminLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      </div>
    </header>
  );
}
