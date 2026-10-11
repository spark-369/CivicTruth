import { useState, useEffect } from "react";
import {
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { useThemeMode } from "./shared/ThemeModeContext";
import { getRoleFromToken, getUserInfoFromToken } from "../utils/auth";
import { useSettings } from "./shared/SettingsContext";

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 72;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function BellIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }

const navItems = [
  { label: "Home", path: "/", icon: HomeIcon, roles: ["admin", "participant"] },
  { label: "Blockchain", path: "/blockchain", icon: BlockchainIcon, roles: ["admin", "participant"] },
  { label: "Verify", path: "/verify", icon: VerifyIcon, roles: ["admin", "participant"] },
  { label: "Notifications", path: "/notifications", icon: BellIcon, roles: ["admin", "participant"] },
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon, roles: ["admin"] },
  { label: "Participants", path: "/participants", icon: ProfileIcon, roles: ["admin"] },
  { label: "Settings", path: "/settings", icon: SettingsIcon, roles: ["admin"] },
  { label: "Profile", path: "/profile", icon: ProfileIcon, roles: ["admin", "participant"] },
];

function HomeIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function DashboardIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function BlockchainIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>; }
function VerifyIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function ProfileIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SettingsIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function LogoutIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
function CollapseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>; }
function ExpandIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>; }
function MenuIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function CloseIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ProfileIconSm() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function SettingsIconSm() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }

export default function Layout({ handleLogout }) {
  const location = useLocation();
  const { mode } = useThemeMode();
  const { settings, loading: settingsLoading } = useSettings();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);
  const role = getRoleFromToken();
  const user = getUserInfoFromToken();
  const siteName = settingsLoading ? 'CivicTruth' : (settings['site.name'] || 'CivicTruth');

  const notificationsEnabled = settings['enable.notifications'] === 'true';
  const filteredNav = navItems.filter(
    (item) => {
      if (!role || !item.roles.includes(role)) return false;
      if (item.path === '/notifications' && !notificationsEnabled) return false;
      return true;
    },
  );

  const currentLabel =
    filteredNav.find((item) => item.path === location.pathname)?.label ||
    siteName;

  const drawerContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-2 min-h-[48px]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-2 w-full`}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-lg shadow-indigo-500/30 tracking-tight">
            CT
          </div>
          {!collapsed && (
            <span className="font-extrabold text-[1.15rem] text-gray-800 dark:text-gray-100 whitespace-nowrap tracking-tight">
              {siteName}
            </span>
          )}
        </div>
      </div>
      <hr className="mx-3 border-gray-200 dark:border-gray-700" />
      <nav className="flex-1 px-2 py-3 relative" aria-label="Main navigation">
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <div key={item.path} className="mb-1 relative">
              {collapsed && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
              <Link
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                className={`group flex items-center min-h-[48px] rounded-xl px-3 transition-all duration-250 no-underline
                  ${isActive
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-400'
                  }
                  ${collapsed ? 'justify-center px-2' : 'gap-3'}
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <IconComponent
                  className={`flex-shrink-0 transition-all duration-250`}
                  style={{ width: 20, height: 20, strokeWidth: 2 }}
                />
                {!collapsed && (
                  <span className={`text-[0.925rem] font-semibold ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight">{user.name}</div>
              {user.identifier && (
                <div className="text-[0.7rem] text-gray-400 dark:text-gray-500 block overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.identifier}...
                </div>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/30" title={user.name}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/92 dark:bg-gray-900/92 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300"
        style={{
          width: `calc(100% - ${isMobile ? 0 : collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px)`,
          marginLeft: isMobile ? 0 : `${collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px`,
        }}
      >
        <div className="flex items-center justify-between px-4 min-h-[48px]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="mr-2 md:hidden p-1 rounded-lg text-gray-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </button>
            <h1 className="font-bold text-sm sm:text-[1.05rem] md:text-[1.1rem] text-gray-800 dark:text-gray-100 tracking-tight">
              {currentLabel}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isMobile ? (
              <>
                <button
                  onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                  className="p-1 rounded-full"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={Boolean(profileMenuAnchor)}
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {profileMenuAnchor && (
                  <div className="absolute top-full right-4 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link to="/profile" onClick={() => setProfileMenuAnchor(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <ProfileIconSm /><span>Profile</span>
                    </Link>
                    <Link to="/settings" onClick={() => setProfileMenuAnchor(null)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <SettingsIconSm /><span>Settings</span>
                    </Link>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button onClick={() => { setProfileMenuAnchor(null); handleLogout(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <LogoutIcon /><span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="hidden md:flex p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                aria-label="Logout"
              >
                <LogoutIcon />
              </button>
            )}
          </div>
        </div>
      </header>

      <aside className="fixed top-0 left-0 bottom-0 z-30 hidden md:block overflow-hidden"
        style={{ width: collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {drawerContent}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="font-extrabold text-lg text-gray-800 dark:text-gray-100">{siteName}</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close menu"><CloseIcon /></button>
            </div>
            {drawerContent}
          </aside>
        </div>
      )}

      <main
        id="main-content"
        className="flex-1 min-h-screen pt-[48px] transition-all duration-300"
        style={{
          width: `calc(100% - ${isMobile ? 0 : collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px)`,
          marginLeft: isMobile ? 0 : `${collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px`,
        }}
        tabIndex={-1}
      >
        <div id="main-content-top" />
        <Outlet />
      </main>
    </div>
  );
}