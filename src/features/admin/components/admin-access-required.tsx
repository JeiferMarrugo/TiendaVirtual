import { LogIn } from "lucide-react";

type AdminAccessRequiredProps = {
  onLogin: () => void;
};

export function AdminAccessRequired({ onLogin }: AdminAccessRequiredProps) {
  return (
    <div className="px-5 py-10 sm:px-7">
      <p className="text-muted text-xs uppercase tracking-[0.35em]">Acceso requerido</p>
      <h3 className="section-title mt-3 text-5xl">Inicia sesion para usar el panel</h3>
      <p className="text-muted mt-4 max-w-2xl text-base leading-8">
        Al iniciar sesion se mostraran las ventas capturadas desde la tienda publica en una vista unica y continua.
      </p>
      <button
        onClick={onLogin}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-line/70 bg-primary px-5 py-3 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-soft"
      >
        <LogIn size={16} />
        Entrar al panel
      </button>
    </div>
  );
}
