"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SessionAuthModal } from "@/components/session-auth-modal";
import { getDefaultSession, readSession, updateSession } from "@/lib/storage";

export default function AdminLoginPage() {
  const router = useRouter();
  const [session, setSession] = useState(getDefaultSession());

  useEffect(() => {
    const currentSession = readSession();
    setSession(currentSession);

    if (currentSession.adminLoggedIn) {
      router.replace("/admin");
    }
  }, [router]);

  function handleAdminLoginSuccess(payload: {
    token: string;
    role: string;
    fullName: string;
  }) {
    const nextSession = {
      ...session,
      adminLoggedIn: true,
      adminName: payload.fullName,
      adminRole: payload.role,
      adminToken: payload.token,
    };

    setSession(nextSession);
    updateSession(nextSession);
    toast.success("Sesión administrativa iniciada.");
    router.push("/admin");
  }

  return (
    <main className="grain relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-[rgba(14,116,144,0.2)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[rgba(20,184,166,0.18)] blur-3xl" />

      <div className="absolute left-4 top-4 z-10 sm:left-8 sm:top-8">
        <Link
          href="/"
          className="rounded-full border border-line bg-card-strong px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-card"
        >
          Volver a la tienda
        </Link>
      </div>

      <SessionAuthModal
        isOpen
        title="Ingreso administrativo"
        subtitle="Accede con perfil ADMIN o SUPERADMIN para entrar al panel."
        requireAdmin
        showCloseButton={false}
        onClose={() => router.push("/")}
        onSuccess={handleAdminLoginSuccess}
      />
    </main>
  );
}
