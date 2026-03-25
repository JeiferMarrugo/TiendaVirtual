"use client";

import { useEffect, useState } from "react";
import { LogIn, ShieldCheck, UserCircle2, WifiOff, X } from "lucide-react";

type LoginResponse = {
  ok: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    avatar?: string | null;
    bio?: string | null;
    profile?: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
    } | null;
  };
};

type SessionAuthModalProps = {
  isOpen: boolean;
  title: string;
  subtitle: string;
  requireAdmin?: boolean;
  allowRegister?: boolean;
  initialMode?: "login" | "register";
  showCloseButton?: boolean;
  onClose: () => void;
  onSuccess: (payload: { token: string; role: string; fullName: string }) => void;
};

export function SessionAuthModal({
  isOpen,
  title,
  subtitle,
  requireAdmin,
  allowRegister,
  initialMode = "login",
  showCloseButton = true,
  onClose,
  onSuccess,
}: SessionAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  async function submitLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Nombre y apellido son obligatorios.");
        return;
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    setIsSubmitting(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const isRegisterFlow = mode === "register";
      const response = await fetch(isRegisterFlow ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegisterFlow
            ? {
                email,
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
              }
            : { email, password },
        ),
        signal: controller.signal,
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.ok || !data.token || !data.user) {
        setError(data.message || (isRegisterFlow ? "No se pudo crear la cuenta." : "No se pudo iniciar sesión."));
        return;
      }

      const profileName = data.user.profile?.name || "";
      const isElevated = profileName === "ADMIN" || profileName === "SUPERADMIN";

      if (requireAdmin && !isElevated) {
        setError("Este acceso requiere un perfil ADMIN o SUPERADMIN.");
        return;
      }

      const resolvedFirstName = data.user.firstName || data.user.email;
      const resolvedLastName = data.user.lastName || "";
      const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();

      onSuccess({ token: data.token, role: profileName, fullName });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMode(initialMode);
      onClose();
    } catch (caughtError) {
      if (!navigator.onLine) {
        setError("No tienes conexión a internet en este momento.");
        return;
      }

      if (caughtError instanceof Error && caughtError.name === "AbortError") {
        setError("El servidor tardó demasiado en responder. Reintenta en unos segundos.");
        return;
      }

      setError("No se pudo conectar con el servidor. Verifica que esté activo con npm run dev.");
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.55),rgba(2,6,23,0.85))] p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-card shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="relative border-b border-line bg-[linear-gradient(120deg,rgba(14,116,144,0.15),rgba(20,184,166,0.08)_45%,transparent)] px-6 py-5">
          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="absolute -bottom-10 left-8 h-20 w-20 rounded-full bg-teal-300/15 blur-2xl" />

          <div className="relative mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted">
              <ShieldCheck size={14} />
              {mode === "register" ? "Crear Cuenta" : "Acceso Seguro"}
            </span>
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-line bg-card-strong p-2 text-foreground"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>

          <div>
            <p className="text-muted text-xs uppercase tracking-[0.3em]">Autenticación</p>
            <h3 className="section-title mt-2 text-3xl">{title}</h3>
            <p className="text-muted mt-2 text-sm leading-6">{subtitle}</p>
          </div>
        </div>

        <form className="space-y-4 px-6 py-5" onSubmit={submitLogin}>
          {mode === "register" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-card-strong p-3">
                <label className="text-muted text-[11px] uppercase tracking-[0.25em]">Nombre</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="rounded-2xl border border-line bg-card-strong p-3">
                <label className="text-muted text-[11px] uppercase tracking-[0.25em]">Apellido</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-line bg-card-strong p-3">
            <label className="text-muted inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em]">
              <UserCircle2 size={14} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="admin@tienda.local"
              required
            />
          </div>

          <div className="rounded-2xl border border-line bg-card-strong p-3">
            <label className="text-muted text-[11px] uppercase tracking-[0.25em]">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent"
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "register" ? (
            <div className="rounded-2xl border border-line bg-card-strong p-3">
              <label className="text-muted text-[11px] uppercase tracking-[0.25em]">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none transition focus:border-accent"
                placeholder="••••••••"
                required
              />
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <p className="inline-flex items-center gap-2">
                <WifiOff size={15} />
                {error}
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:opacity-70"
          >
            <LogIn size={16} />
            {isSubmitting
              ? mode === "register"
                ? "Creando cuenta..."
                : "Validando..."
              : mode === "register"
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </button>

          {allowRegister ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode((current) => (current === "login" ? "register" : "login"));
              }}
              className="inline-flex w-full items-center justify-center rounded-full border border-line bg-card-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-card"
            >
              {mode === "login" ? "No tienes cuenta? Registrate" : "Ya tienes cuenta? Inicia sesión"}
            </button>
          ) : null}

          <p className="text-muted text-xs leading-6">
            Consejo: si aparece error de red, confirma que el servidor esté activo ejecutando
            <span className="mx-1 rounded bg-card-strong px-2 py-0.5">npm run dev</span>
            en la raíz del proyecto.
          </p>
        </form>
      </div>
    </div>
  );
}
