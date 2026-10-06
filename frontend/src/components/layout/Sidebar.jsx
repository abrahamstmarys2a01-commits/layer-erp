import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  IndianRupee,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Scale,
  ShieldCheck,
  X
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/juniors', label: 'Juniors', icon: Users },
    { to: '/cases', label: 'Cases', icon: Briefcase },
    { to: '/amounts', label: 'Amount Entry', icon: IndianRupee },
    { to: '/hearings', label: 'Hearing Entry', icon: Calendar },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy-900 text-slate-300 select-none">
      {/* Top Brand Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md">
            <img
              src={logoImg}
              alt="Layer ERP"
              className="w-full h-full object-contain rounded-full ring-1 ring-amber-400/40"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-wide flex items-center gap-1.5">
                Layer ERP
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                  Legal
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                Case Management ERP
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                }`
              }
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom User / Profile Card */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/40 shrink-0">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-navy-800 ring-2 ring-blue-500/40 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Adv. Jayaraman'}</p>
                <p className="text-[11px] text-slate-400 truncate">Senior Advocate</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition-colors group relative ${
              isCollapsed ? 'mt-2' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-red-950 text-red-200 text-xs rounded-md shadow-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-screen sticky top-0 z-30 shadow-md`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
