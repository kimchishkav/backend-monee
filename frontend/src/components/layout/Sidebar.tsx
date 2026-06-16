import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import moneeLogo from "../../assets/monee-logo.svg";

const NAV_ITEMS = [
  { to: "/", label: "Главная", icon: HomeIcon },
  { to: "/accounts", label: "Счета", icon: WalletIcon },
  { to: "/transactions", label: "Операции", icon: ListIcon },
  { to: "/statistics", label: "Статистика", icon: ChartIcon },
];

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { user, logout } = useAuth();
  const initials = user?.name?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#1a1825]">
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
          className="absolute -right-3 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm hover:text-gray-600 lg:flex dark:border-white/10 dark:bg-[#1a1825] dark:text-gray-500 dark:hover:text-gray-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? (
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      )}

      <div className={`flex items-center py-6 ${collapsed ? "justify-center px-2" : "px-6"}`}>
        {collapsed ? <span className="text-3xl">🐑</span> : <img src={moneeLogo} alt="monee" className="h-14" />}
      </div>

      <NavLink
        to="/profile"
        onClick={onNavigate}
        className={({ isActive }) =>
          `mx-3 mb-4 flex items-center gap-3 rounded-2xl p-3 transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive
              ? "bg-gradient-to-r from-brand-100 to-violet-100 dark:from-brand-500/20 dark:to-violet-500/20"
              : "bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10"
          }`
        }
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-400 text-sm font-semibold text-white">
            {initials}
          </span>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Мой профиль</p>
          </div>
        )}
      </NavLink>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
              }`
            }
          >
            <item.icon />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        title={collapsed ? "Выйти" : undefined}
        className={`mx-3 mb-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <LogoutIcon />
        {!collapsed && "Выйти"}
      </button>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18M16 14h2" strokeLinecap="round" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M7 16v-4M12 16V8M17 16v-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
