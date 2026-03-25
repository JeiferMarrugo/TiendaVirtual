"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon?: string | null;
  isActive?: boolean;
  order: number;
  parentId?: string | null;
};

type Menu = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  items: MenuItem[];
};

type MenusViewProps = {
  token: string | null;
};

type ItemDraft = {
  label: string;
  href: string;
  type: "parent" | "child";
  viewKey: string;
  parentId: string;
};

const DEFAULT_DRAFT: ItemDraft = {
  label: "",
  href: "",
  type: "parent",
  viewKey: "",
  parentId: "",
};

export function MenusView({ token }: MenusViewProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [menuDrafts, setMenuDrafts] = useState<Record<string, { name: string; isActive: boolean }>>({});
  const [itemDrafts, setItemDrafts] = useState<Record<string, ItemDraft>>({});
  const [itemEdits, setItemEdits] = useState<Record<string, { label: string; href: string }>>({});
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  const menuById = useMemo(() => new Map(menus.map((menu) => [menu.id, menu])), [menus]);

  function normalizeViewKey(raw: string) {
    return raw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function extractViewFromHref(href: string) {
    if (href === "/admin") return "dashboard";
    if (!href.includes("view=")) return "";
    return href.split("view=")[1]?.split("&")[0] || "";
  }

  function getDraft(menuId: string): ItemDraft {
    return itemDrafts[menuId] || DEFAULT_DRAFT;
  }

  function getTopLevelItems(menu: Menu) {
    return menu.items
      .filter((item) => !item.parentId)
      .sort((a, b) => a.order - b.order);
  }

  function getChildren(menu: Menu, parentId: string) {
    return menu.items
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  }

  function getParentOptions(menu: Menu) {
    return getTopLevelItems(menu).map((item) => ({
      id: item.id,
      label: item.label,
      view: extractViewFromHref(item.href),
    }));
  }

  function buildMainAdminHref(menuId: string) {
    const draft = getDraft(menuId);
    const key = normalizeViewKey(draft.viewKey || draft.label);

    if (!key) return "";
    if (draft.type === "parent") {
      return `/admin?view=${key}`;
    }

    const menu = menuById.get(menuId);
    const parent = menu?.items.find((item) => item.id === draft.parentId);
    const parentView = normalizeViewKey(extractViewFromHref(parent?.href || ""));

    if (!parentView) return "";
    return `/admin?view=${parentView}-${key}`;
  }

  function notifySidebarMenuUpdate() {
    window.dispatchEvent(new Event("tv:admin-menus-updated"));
  }

  async function fetchMenus() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/menus", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudieron cargar los menús");
      }

      const loadedMenus = (data.menus || []) as Menu[];
      setMenus(loadedMenus);
      setMenuDrafts(
        Object.fromEntries(
          loadedMenus.map((menu) => [menu.id, { name: menu.name, isActive: menu.isActive }]),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando menús");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchMenus();
  }, []);

  async function createMenu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug, items: [] }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear el menú");
      }

      setName("");
      setSlug("");
      toast.success("Menú creado correctamente.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creando menú");
    }
  }

  async function updateMenu(menuId: string) {
    if (!token) return;
    const draft = menuDrafts[menuId];
    if (!draft || !draft.name.trim()) {
      toast.error("El nombre del menú no puede estar vacío.");
      return;
    }

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: draft.name.trim(), isActive: draft.isActive }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar el menú");
      }

      toast.success("Menú actualizado.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error actualizando menú");
    }
  }

  async function deleteMenu(menuId: string) {
    if (!token) return;

    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo eliminar el menú");
      }

      setMenus((current) => current.filter((entry) => entry.id !== menuId));
      toast.success("Menú eliminado.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error eliminando menú");
    }
  }

  async function addMenuItem(menuId: string) {
    if (!token) return;

    const menu = menuById.get(menuId);
    if (!menu) return;

    const draft = getDraft(menuId);
    const isMainAdmin = menu.slug === "main-admin";
    const label = draft.label.trim();

    if (!label) {
      toast.error("La etiqueta es obligatoria.");
      return;
    }

    let href = draft.href.trim();
    let parentId: string | null = null;

    if (isMainAdmin) {
      href = buildMainAdminHref(menuId);
      if (!href) {
        toast.error("Completa correctamente la vista para principal o submenú.");
        return;
      }
      if (draft.type === "child") {
        if (!draft.parentId) {
          toast.error("Selecciona un menú principal para el submenú.");
          return;
        }
        parentId = draft.parentId;
      }
    } else {
      if (!href) {
        toast.error("La ruta (href) es obligatoria.");
        return;
      }
      if (draft.type === "child") {
        if (!draft.parentId) {
          toast.error("Selecciona un menú principal para el submenú.");
          return;
        }
        parentId = draft.parentId;
      }
    }

    try {
      const response = await fetch(`/api/menus/${menuId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label, href, parentId }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo crear item");
      }

      setItemDrafts((current) => ({ ...current, [menuId]: DEFAULT_DRAFT }));
      toast.success("Item agregado al menú.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error creando item");
    }
  }

  async function updateMenuItem(menuId: string, itemId: string) {
    if (!token) return;

    const edit = itemEdits[itemId];
    if (!edit || !edit.label.trim() || !edit.href.trim()) {
      toast.error("Etiqueta y ruta del item son obligatorias.");
      return;
    }

    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: edit.label.trim(),
          href: edit.href.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo actualizar el item");
      }

      toast.success("Item actualizado.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error actualizando item");
    }
  }

  async function deleteMenuItem(menuId: string, itemId: string) {
    if (!token) return;

    try {
      const response = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo eliminar el item");
      }

      toast.success("Item eliminado.");
      await fetchMenus();
      notifySidebarMenuUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error eliminando item");
    }
  }

  async function persistHierarchy(menuId: string, nextItems: MenuItem[]) {
    if (!token) return false;

    try {
      const response = await fetch(`/api/menus/${menuId}/items`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: nextItems.map((item) => ({
            id: item.id,
            parentId: item.parentId ?? null,
            order: item.order,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "No se pudo guardar el orden");
      }

      notifySidebarMenuUpdate();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando orden de menús");
      return false;
    }
  }

  function applyMove(
    menu: Menu,
    itemId: string,
    targetParentId: string | null,
    targetIndex: number,
  ) {
    const dragged = menu.items.find((item) => item.id === itemId);
    if (!dragged) return;

    const sourceParentId = dragged.parentId ?? null;
    const nextItems = menu.items.map((item) => ({ ...item }));

    const sourceSiblings = nextItems
      .filter((item) => (item.parentId ?? null) === sourceParentId && item.id !== itemId)
      .sort((a, b) => a.order - b.order);

    sourceSiblings.forEach((item, index) => {
      item.order = index;
    });

    const targetSiblings = nextItems
      .filter((item) => (item.parentId ?? null) === targetParentId && item.id !== itemId)
      .sort((a, b) => a.order - b.order);

    const draggedRef = nextItems.find((item) => item.id === itemId);
    if (!draggedRef) return;

    const boundedTargetIndex = Math.max(0, Math.min(targetIndex, targetSiblings.length));
    draggedRef.parentId = targetParentId;

    targetSiblings.splice(boundedTargetIndex, 0, draggedRef);
    targetSiblings.forEach((item, index) => {
      item.order = index;
    });

    setMenus((current) =>
      current.map((entry) =>
        entry.id === menu.id
          ? {
              ...entry,
              items: nextItems,
            }
          : entry,
      ),
    );

    void persistHierarchy(menu.id, nextItems).then(async (ok) => {
      if (ok) {
        toast.success("Orden y jerarquía actualizados.");
      }
      await fetchMenus();
    });
  }

  function onDropBefore(menu: Menu, target: MenuItem) {
    if (!draggingItemId || draggingItemId === target.id) return;

    const siblings = menu.items
      .filter((item) => (item.parentId ?? null) === (target.parentId ?? null) && item.id !== draggingItemId)
      .sort((a, b) => a.order - b.order);

    const targetIndex = siblings.findIndex((item) => item.id === target.id);
    const resolvedIndex = targetIndex < 0 ? siblings.length : targetIndex;
    applyMove(menu, draggingItemId, target.parentId ?? null, resolvedIndex);
    setDraggingItemId(null);
  }

  function onDropToParentEnd(menu: Menu, parentId: string | null) {
    if (!draggingItemId) return;

    const siblings = menu.items
      .filter((item) => (item.parentId ?? null) === parentId && item.id !== draggingItemId)
      .sort((a, b) => a.order - b.order);

    applyMove(menu, draggingItemId, parentId, siblings.length);
    setDraggingItemId(null);
  }

  return (
    <div className="space-y-6 px-5 py-8 sm:px-7">
      <div>
        <p className="text-muted text-xs uppercase tracking-[0.3em]">Navegación</p>
        <h3 className="admin-title mt-2 text-3xl">Menús dinámicos</h3>
      </div>

      <form onSubmit={createMenu} className="grid gap-3 rounded-3xl border border-line bg-card-strong p-5 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del menú"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug (ej: main-admin)"
          className="rounded-2xl border border-line bg-background px-3 py-2 text-sm"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
            <Plus size={14} />
            Crear
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-muted">Cargando menús...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {menus.map((menu) => {
            const parents = getTopLevelItems(menu);
            const draft = getDraft(menu.id);
            const isMainAdmin = menu.slug === "main-admin";

            return (
              <div key={menu.id} className="rounded-3xl border border-line bg-card-strong p-4">
                <div className="mb-3 space-y-2">
                  <p className="text-muted text-xs">/{menu.slug}</p>
                  <input
                    value={menuDrafts[menu.id]?.name ?? menu.name}
                    onChange={(e) =>
                      setMenuDrafts((current) => ({
                        ...current,
                        [menu.id]: {
                          name: e.target.value,
                          isActive: current[menu.id]?.isActive ?? menu.isActive,
                        },
                      }))
                    }
                    className="w-full rounded-2xl border border-line bg-background px-3 py-2 text-sm font-semibold"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <label className="text-muted inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={menuDrafts[menu.id]?.isActive ?? menu.isActive}
                        onChange={(e) =>
                          setMenuDrafts((current) => ({
                            ...current,
                            [menu.id]: {
                              name: current[menu.id]?.name ?? menu.name,
                              isActive: e.target.checked,
                            },
                          }))
                        }
                      />
                      Activo
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateMenu(menu.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs"
                      >
                        <Save size={12} /> Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMenu(menu.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-300/40 px-3 py-1 text-xs text-red-400"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2 rounded-2xl border border-line/70 bg-background/50 p-3">
                  <input
                    value={draft.label}
                    onChange={(e) =>
                      setItemDrafts((current) => ({
                        ...current,
                        [menu.id]: {
                          ...getDraft(menu.id),
                          label: e.target.value,
                        },
                      }))
                    }
                    placeholder="Etiqueta"
                    className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      value={draft.type}
                      onChange={(e) =>
                        setItemDrafts((current) => ({
                          ...current,
                          [menu.id]: {
                            ...getDraft(menu.id),
                            type: e.target.value as "parent" | "child",
                            parentId: e.target.value === "parent" ? "" : getDraft(menu.id).parentId,
                          },
                        }))
                      }
                      className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                    >
                      <option value="parent">Principal</option>
                      <option value="child">Submenú</option>
                    </select>

                    {draft.type === "child" ? (
                      <select
                        value={draft.parentId}
                        onChange={(e) =>
                          setItemDrafts((current) => ({
                            ...current,
                            [menu.id]: {
                              ...getDraft(menu.id),
                              parentId: e.target.value,
                            },
                          }))
                        }
                        className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Padre del submenú</option>
                        {getParentOptions(menu).map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-muted flex items-center rounded-xl border border-dashed border-line px-3 py-2 text-xs">
                        Se creará como menú principal
                      </div>
                    )}
                  </div>

                  {isMainAdmin ? (
                    <>
                      <input
                        value={draft.viewKey}
                        onChange={(e) =>
                          setItemDrafts((current) => ({
                            ...current,
                            [menu.id]: {
                              ...getDraft(menu.id),
                              viewKey: e.target.value,
                            },
                          }))
                        }
                        placeholder={draft.type === "parent" ? "Vista principal (ej: productos)" : "Vista submenú (ej: listado)"}
                        className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
                      />
                      <p className="text-muted text-xs">Ruta generada: {buildMainAdminHref(menu.id) || "(pendiente)"}</p>
                    </>
                  ) : (
                    <input
                      value={draft.href}
                      onChange={(e) =>
                        setItemDrafts((current) => ({
                          ...current,
                          [menu.id]: {
                            ...getDraft(menu.id),
                            href: e.target.value,
                          },
                        }))
                      }
                      placeholder="/ruta"
                      className="w-full rounded-xl border border-line bg-background px-3 py-2 text-sm"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => addMenuItem(menu.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-on-primary"
                  >
                    <Plus size={12} />
                    Agregar item
                  </button>
                </div>

                <div className="space-y-3">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropToParentEnd(menu, null)}
                    className="text-muted rounded-xl border border-dashed border-line px-3 py-2 text-xs"
                  >
                    Suelta aquí para mover como principal
                  </div>

                  {parents.length === 0 ? (
                    <p className="text-muted text-sm">Sin items</p>
                  ) : (
                    parents.map((parent) => {
                      const children = getChildren(menu, parent.id);
                      return (
                        <div key={parent.id} className="space-y-2 rounded-2xl border border-line/80 p-3">
                          <div
                            draggable
                            onDragStart={() => setDraggingItemId(parent.id)}
                            onDragEnd={() => setDraggingItemId(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDropBefore(menu, parent)}
                            className="grid cursor-grab gap-2 sm:grid-cols-[auto_1fr_1fr_auto]"
                          >
                            <span className="text-muted inline-flex items-center justify-center rounded-full border border-line px-2">
                              <GripVertical size={12} />
                            </span>
                            <input
                              value={itemEdits[parent.id]?.label ?? parent.label}
                              onChange={(e) =>
                                setItemEdits((current) => ({
                                  ...current,
                                  [parent.id]: {
                                    label: e.target.value,
                                    href: current[parent.id]?.href ?? parent.href,
                                  },
                                }))
                              }
                              className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                            />
                            <input
                              value={itemEdits[parent.id]?.href ?? parent.href}
                              onChange={(e) =>
                                setItemEdits((current) => ({
                                  ...current,
                                  [parent.id]: {
                                    label: current[parent.id]?.label ?? parent.label,
                                    href: e.target.value,
                                  },
                                }))
                              }
                              className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateMenuItem(menu.id, parent.id)}
                                className="inline-flex items-center justify-center rounded-full border border-line p-2"
                                title="Guardar item"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMenuItem(menu.id, parent.id)}
                                className="inline-flex items-center justify-center rounded-full border border-red-300/40 p-2 text-red-400"
                                title="Eliminar item"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => onDropToParentEnd(menu, parent.id)}
                            className="text-muted rounded-xl border border-dashed border-line px-3 py-2 text-xs"
                          >
                            Suelta aquí para convertir en submenú de {parent.label}
                          </div>

                          <div className="space-y-2 pl-4">
                            {children.map((child) => (
                              <div
                                key={child.id}
                                draggable
                                onDragStart={() => setDraggingItemId(child.id)}
                                onDragEnd={() => setDraggingItemId(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => onDropBefore(menu, child)}
                                className="grid cursor-grab gap-2 sm:grid-cols-[auto_1fr_1fr_auto]"
                              >
                                <span className="text-muted inline-flex items-center justify-center rounded-full border border-line px-2">
                                  <GripVertical size={12} />
                                </span>
                                <input
                                  value={itemEdits[child.id]?.label ?? child.label}
                                  onChange={(e) =>
                                    setItemEdits((current) => ({
                                      ...current,
                                      [child.id]: {
                                        label: e.target.value,
                                        href: current[child.id]?.href ?? child.href,
                                      },
                                    }))
                                  }
                                  className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                                />
                                <input
                                  value={itemEdits[child.id]?.href ?? child.href}
                                  onChange={(e) =>
                                    setItemEdits((current) => ({
                                      ...current,
                                      [child.id]: {
                                        label: current[child.id]?.label ?? child.label,
                                        href: e.target.value,
                                      },
                                    }))
                                  }
                                  className="rounded-xl border border-line bg-background px-3 py-2 text-sm"
                                />
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => updateMenuItem(menu.id, child.id)}
                                    className="inline-flex items-center justify-center rounded-full border border-line p-2"
                                    title="Guardar item"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteMenuItem(menu.id, child.id)}
                                    className="inline-flex items-center justify-center rounded-full border border-red-300/40 p-2 text-red-400"
                                    title="Eliminar item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
