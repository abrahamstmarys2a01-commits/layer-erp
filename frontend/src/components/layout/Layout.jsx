import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';

export const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full max-w-full bg-[#F7F8FA] overflow-hidden">
      {/* Sidebar (Desktop Fixed + Mobile Slide-Out Drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
        {/* Top Responsive Header */}
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        {/* Dynamic Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
