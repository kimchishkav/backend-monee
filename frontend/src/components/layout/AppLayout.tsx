import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");

  function toggleCollapsed() {
    setCollapsed((prev) => {
      localStorage.setItem("sidebarCollapsed", prev ? "0" : "1");
      return !prev;
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f7fb] lg:flex dark:bg-[#0f0d17]">
      <aside className={`hidden shrink-0 border-r border-gray-100 transition-all duration-200 lg:block dark:border-white/10 ${collapsed ? "w-20" : "w-64"}`}>
        <div className="sticky top-0 h-screen">
          <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-[#1a1825]">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 lg:hidden dark:border-white/10 dark:bg-[#1a1825]">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10" aria-label="Меню">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">🐰💕 monee</span>
          <div className="h-9 w-9 rounded-full bg-violet-200" />
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
