"use client";

import clsx from "clsx";
import { BellRing, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { SidebarItem } from "@/features/admin/config/sidebar";

type AdminSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  groups: SidebarItem[];
  activeView: string;
  onSelectView: (viewId: string) => void;
};

export function AdminSidebar({
  isOpen,
  onToggle,
  groups,
  activeView,
  onSelectView,
}: AdminSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["productos"]));

  const toggleMenu = (itemId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedMenus(newExpanded);
  };

  const handleSelectView = (viewId: string) => {
    onSelectView(viewId);
  };

  const renderMenuItem = (item: SidebarItem, depth: number = 0) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    const isExpanded = expandedMenus.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              handleSelectView(item.id);
            }
          }}
          className={clsx(
            "group w-full flex items-center rounded-2xl px-3 py-2.5 text-sm transition",
            depth === 0 && "border",
            isActive && !hasChildren
              ? "bg-accent-soft border-accent text-accent"
              : "border-transparent hover:border-line hover:bg-card-strong text-foreground",
            depth > 0 && "pl-11 text-xs font-medium text-muted hover:text-foreground",
          )}
          title={item.title}
        >
          {depth === 0 && (
            <span
              className={clsx(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition shrink-0",
                isActive
                  ? "border-accent bg-white/10"
                  : "border-line bg-card-strong group-hover:bg-background",
              )}
            >
              <Icon size={17} />
            </span>
          )}

          {isOpen && depth === 0 ? (
            <span className="ml-3 flex-1 text-left">
              <span className="block font-medium ">{item.title}</span>
              <span className="text-muted block text-xs">{item.description}</span>
            </span>
          ) : isOpen && depth > 0 ? (
            <span className="flex-1 text-left">
              <span className="block font-medium">{item.title}</span>
            </span>
          ) : null}

          {hasChildren && isOpen && (
            <ChevronDown
              size={14}
              className={clsx(
                "text-muted ml-auto transition",
                isExpanded ? "rotate-180" : "",
              )}
            />
          )}
        </button>

        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1 border-l border-line/40 pl-2 ml-4">
            {item.children!.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="glass-panel sticky top-4 h-[calc(100vh-2rem)] rounded-[30px] border border-line/70 px-3 py-4 transition-all duration-300 overflow-y-auto">
      <div className={clsx("flex items-center", isOpen ? "justify-between" : "justify-center")}>
        {isOpen ? (
          <div className="px-2">
            <p className="text-muted text-[10px] uppercase tracking-[0.35em]">Administracion</p>
            <h1 className="admin-title mt-1 text-xl">Maison Canvas</h1>
          </div>
        ) : null}

        <button
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-card-strong text-foreground transition hover:bg-background shrink-0"
          title={isOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {isOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="mt-6 space-y-1">
        {groups.map((group) => renderMenuItem(group))}
      </nav>

      {isOpen ? (
        <div className="mt-6 border-t border-line px-2 pt-4">
          <div className="flex items-start gap-2">
            <BellRing size={16} className="mt-0.5 text-accent shrink-0" />
            <p className="text-muted text-xs leading-6">
              Sincronizacion automatica cada 60 segundos.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 border-t border-line pt-4 text-center text-accent">
          <BellRing size={16} className="mx-auto" />
        </div>
      )}
    </aside>
  );
}
