"use client";

import { useState, useEffect, type ReactNode } from "react";
import { 
  LayoutDashboard, ShoppingBag, Users, FolderTree, Package, Image, Settings,
  Menu, LogOut, ExternalLink, Inbox, PanelLeftClose, PanelLeftOpen, GalleryThumbnails 
} from "lucide-react";
import { Link, useLocation } from "../../lib/router-compat";
import { useAuth } from "../../hooks/useAuth";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Orders", path: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Categories", path: "/admin/categories", icon: FolderTree },
  { name: "Categories Image", path: "/admin/categoryimages", icon: GalleryThumbnails },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Contact", path: "/admin/contact", icon: Inbox },
  { name: "Media", path: "/admin/media", icon: Image },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logoutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsOpen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileNav = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const userInitials = `${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.toUpperCase() || "AD";

  return (
    <div className="h-dvh w-full flex overflow-hidden bg-[var(--color-bg-light)] text-[var(--color-text-dark)] font-sans">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[var(--color-card-bg)] text-[var(--color-text-dark)] flex flex-col justify-between transition-all duration-300 border-r border-[var(--color-border)] ${
          isOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        <div>
          {/* Header Branding */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border)]">
            {isOpen && (
             <h2 className="font-display text-xl font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)] transition-colors group-hover:text-[var(--color-accent)]">
                Bambotia
              </h2>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-light)] ml-auto text-[var(--gold)] hover:text-[var(--color-text-dark)] cursor-pointer transition-colors"
              aria-label="Toggle Sidebar"
            >
              {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-140px)]">
            {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={name}
                  to={path}
                  onClick={closeMobileNav}
                  title={!isOpen ? name : ""}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--gold)] text-[var(--color-primary-foreground)] shadow-md font-bold"
                      : "text-[var(--color-text-dark)]/80 hover:bg-[var(--color-bg-light)] hover:text-[var(--gold)]"
                  } ${!isOpen ? "justify-center" : ""}`}
                >
                  <Icon size={20} className="shrink-0" />
                  {isOpen && <span className="truncate">{name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[var(--color-border)] space-y-1">
          <Link
            to="/"
            onClick={closeMobileNav}
            title={!isOpen ? "Store View" : ""}
            className={`flex items-center gap-3.5 px-3 py-2.5 text-xs uppercase font-semibold text-[var(--gold)] rounded-xl hover:bg-[var(--gold)] hover:text-white transition-all ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <ExternalLink size={20} className="shrink-0" />
            {isOpen && <span>Store View</span>}
          </Link>

          <button
            onClick={() => {
              closeMobileNav();
              logoutUser(); // also revokes the refresh cookie on the server
            }}
            title={!isOpen ? "Logout" : ""}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 text-xs uppercase font-semibold text-rose-500 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer transition-all ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[var(--color-bg-light)] border-b border-[var(--color-border)] px-4 flex items-center justify-between shrink-0 z-30">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[var(--color-text-dark)] hover:text-[var(--gold)] cursor-pointer transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu size={24} />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] hidden sm:block">
            Admin Workspace
          </span>

          <div className="w-9 h-9 rounded-full bg-[var(--color-card-bg)] text-[var(--gold)] flex items-center justify-center font-bold text-xs border-2 border-[var(--gold)] ml-auto shadow-sm">
            {userInitials}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[var(--color-bg-light)]">
          {children}
        </main>
      </div>
    </div>
  );
}