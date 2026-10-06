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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Breadcrumb } from './Breadcrumb';

export const Header = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const { hearings, cases, resetToMockData } = useERP();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

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
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
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
        return { title: 'Hearing Management', subtitle: 'Court hearings schedule and reminders' };
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
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger Menu (Mobile) & Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition-colors touch-target flex items-center justify-center cursor-pointer shrink-0"
            title="Open navigation menu"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="min-w-0">
            <div className="hidden sm:block">
              <Breadcrumb />
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-navy-900 tracking-tight leading-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Center/Right: Desktop Quick Search */}
        <div ref={searchRef} className="hidden md:block relative max-w-xs w-full">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search cases, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600/20 transition-all min-h-[38px]"
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
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-navy-900">{c.id}</span> –{' '}
                    <span className="text-slate-700 font-medium">{c.clientName}</span>
                    <p className="text-[11px] text-slate-400 truncate">{c.court}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                    {c.caseType}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Cluster: Mobile Search Button, Notifications, Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle Button */}
          <div className="md:hidden relative" ref={mobileSearchRef}>
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors touch-target flex items-center justify-center cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Expandable Search Bar */}
            {mobileSearchOpen && (
              <div className="fixed top-14 left-2 right-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 animate-in slide-in-from-top-2 duration-150">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search cases, clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-2 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          navigate(`/cases/${c.id}`);
                          setMobileSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left p-2.5 hover:bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-navy-900">{c.id} - {c.clientName}</p>
                          <p className="text-[11px] text-slate-500">{c.court}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {c.caseType}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors touch-target flex items-center justify-center cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {upcomingHearings.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown (Responsive Width, No Viewport Overflow) */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] sm:w-80 md:w-96 max-w-sm bg-white rounded-2xl shadow-dropdown border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="font-bold text-xs sm:text-sm text-navy-900">Upcoming Hearing Alerts</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {upcomingHearings.length} Active
                  </span>
                </div>
                <div className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100">
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
                        <p className="text-xs font-bold text-navy-900 truncate">
                          {h.caseId} – {h.clientName}
                        </p>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
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
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 py-1"
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
              className="p-1 rounded-full hover:ring-2 hover:ring-navy-900/20 transition-all focus:outline-none cursor-pointer touch-target flex items-center justify-center"
              title="Admin Profile"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-navy-800 ring-2 ring-slate-200 shadow-xs">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Profile Dropdown Card (Viewport Constrained) */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] sm:w-72 max-w-xs bg-white rounded-2xl shadow-dropdown border border-slate-200 py-3 z-50 animate-in fade-in duration-150">
                {/* Profile Card Header */}
                <div className="px-4 pb-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'}
                      alt="Admin"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-900 truncate">
                      {user?.name || 'Senior Adv. R. Jayaraman'}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold bg-navy-900 text-white px-2 py-0.2 rounded-full">
                      Chamber Admin
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span className="text-blue-600">📞</span>
                    <span>+91 {user?.mobile || '9840011223'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                    <span className="text-blue-600">✉️</span>
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
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer min-h-[38px]"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Practice Settings
                  </button>
                  <button
                    onClick={() => {
                      resetToMockData();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer min-h-[38px]"
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
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-bold cursor-pointer min-h-[38px]"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
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
