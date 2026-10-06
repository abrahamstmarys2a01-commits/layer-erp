import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings as SettingsIcon,
  LogOut,
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Breadcrumb } from './Breadcrumb';

export const Header = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { hearings, cases, resetToMockData, showToast } = useERP();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick Global Search across Cases
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const results = cases
        .filter(
          (c) =>
            c.id.toLowerCase().includes(q) ||
            c.clientName.toLowerCase().includes(q) ||
            c.caseType.toLowerCase().includes(q) ||
            c.court.toLowerCase().includes(q)
        )
        .slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, cases]);

  // Page title mapping
  const getPageInfo = () => {
    const p = location.pathname;
    if (p.startsWith('/cases/')) return { title: 'Case Details', subtitle: 'Comprehensive case history and record' };
    switch (p) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of your legal practice' };
      case '/juniors':
        return { title: 'Juniors', subtitle: 'Manage junior advocates and assigned cases' };
      case '/cases':
        return { title: 'Case Management', subtitle: 'Track litigation, files, status and briefs' };
      case '/amounts':
        return { title: 'Amount Entry', subtitle: 'Track fee retainers, payments and receipts' };
      case '/hearings':
        return { title: 'Hearing Management', subtitle: 'Court hearings schedule and automated client reminders' };
      case '/settings':
        return { title: 'Settings', subtitle: 'System preferences, practice profile and security' };
      default:
        return { title: 'Layer ERP', subtitle: 'Legal Practice Management' };
    }
  };

  const pageInfo = getPageInfo();

  // Upcoming notifications
  const upcomingHearings = hearings
    .filter((h) => h.status === 'Upcoming' || h.status === 'Today')
    .slice(0, 4);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title / Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <Breadcrumb />
            <h1 className="text-lg sm:text-xl font-extrabold text-navy-900 tracking-tight leading-tight mt-0.5">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Center/Right: Quick Search */}
        <div ref={searchRef} className="hidden lg:block relative max-w-xs w-full">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search cases, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600/20 transition-all"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-dropdown border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Cases
              </div>
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    navigate(`/cases/${c.id}`);
                    setSearchFocused(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-navy-900">{c.id}</span> –{' '}
                    <span className="text-slate-700 font-medium">{c.clientName}</span>
                    <p className="text-[11px] text-slate-400">{c.court}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {c.caseType}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {upcomingHearings.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-navy-900">Upcoming Hearing Alerts</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {upcomingHearings.length} Active
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {upcomingHearings.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        navigate('/hearings');
                        setNotificationOpen(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-navy-900">
                          {h.caseId} – {h.clientName}
                        </p>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                          {h.hearingType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {h.hearingDate} at {h.time}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{h.court}</p>
                    </div>
                  ))}
                  {upcomingHearings.length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No upcoming hearings scheduled.
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      navigate('/hearings');
                      setNotificationOpen(false);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All Hearings →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="p-0.5 rounded-full hover:ring-2 hover:ring-navy-900/30 transition-all focus:outline-none cursor-pointer"
              title="Touch to view Admin Profile"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-navy-800 ring-2 ring-slate-200 shadow-xs hover:ring-blue-600 transition-all">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Dropdown Card */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-dropdown border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                {/* Profile Card Header */}
                <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-navy-900 truncate">
                      {user?.name || 'Senior Adv. R. Jayaraman'}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold bg-navy-900 text-white px-2 py-0.2 rounded-full">
                      Chamber Admin
                    </span>
                  </div>
                </div>

                {/* Contact Information (Name, Phone, Mail) */}
                <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <span className="text-blue-600 font-bold">📞</span>
                    <span>+91 {user?.mobile || '9840011223'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-semibold truncate">
                    <span className="text-blue-600 font-bold">✉️</span>
                    <span className="truncate">{user?.email || 'admin@layererp.legal'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Practice Settings
                  </button>
                  <button
                    onClick={() => {
                      resetToMockData();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-400" />
                    Reset Sample ERP Data
                  </button>
                </div>

                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-bold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
