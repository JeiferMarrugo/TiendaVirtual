"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
  isActive: boolean;
  profile: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  } | null;
};

type ProfileOption = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type UsersViewProps = {
  token: string | null;
};

export function UsersView({ token }: UsersViewProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileId, setProfileId] = useState("");

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch("/api/profiles", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar perfiles");
      }
      setProfiles(data.profiles || []);
      setProfileId((current) => current || data.profiles?.[0]?.id || "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando perfiles");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo cargar usuarios");
      }
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando usuarios");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchProfiles();
    void fetchUsers();
  }, [fetchProfiles, fetchUsers]);

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, firstName, lastName, profileId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear el usuario");
      }

      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setProfileId(profiles[0]?.id || "");
      toast.success("Usuario creado correctamente.");
      await fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creando usuario");
    }
  }

  async function toggleUserStatus(user: UserRow) {
    if (!token) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar usuario");
      }

      setUsers((current) =>
        current.map((entry) =>
          entry.id === user.id
            ? {
                ...entry,
                isActive: !user.isActive,
              }
            : entry,
        ),
      );

      toast.success("Estado de usuario actualizado.");
      await fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error actualizando usuario");
    }
  }

  return (
    <div className="space-y-6 px-5 py-8 sm:px-7">
      <div>
        <p className="text-muted text-xs uppercase tracking-[0.3em]">Administración</p>
        <h3 className="admin-title mt-2 text-3xl">Usuarios y perfiles</h3>
      </div>

      <form onSubmit={createUser} className="grid gap-3 rounded-3xl border border-line bg-card-strong p-5 md:grid-cols-5">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Nombre"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Apellido"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Contraseña"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <div className="flex gap-2">
          <select
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            className="flex-1 rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
          >
            <Plus size={14} />
            Crear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-card-strong">
              <th className="px-5 py-4 text-left">Nombre</th>
              <th className="px-5 py-4 text-left">Email</th>
              <th className="px-5 py-4 text-left">Rol</th>
              <th className="px-5 py-4 text-left">Estado</th>
              <th className="px-5 py-4 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">Cargando usuarios...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted">No hay usuarios disponibles.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-line">
                  <td className="px-5 py-3">{`${user.firstName || ""} ${user.lastName || ""}`.trim()}</td>
                  <td className="px-5 py-3">{user.email}</td>
                  <td className="px-5 py-3">{user.profile?.name || "Sin perfil"}</td>
                  <td className="px-5 py-3">{user.isActive ? "Activo" : "Inactivo"}</td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(user)}
                      className="rounded-full border border-line px-3 py-1 text-xs"
                    >
                      {user.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
