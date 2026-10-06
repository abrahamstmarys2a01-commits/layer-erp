import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumb = ({ customCrumbs }) => {
  const location = useLocation();

  if (customCrumbs) {
    return (
      <nav className="flex items-center text-xs font-semibold text-slate-400 space-x-1.5">
        <Link to="/dashboard" className="hover:text-navy-900 transition-colors">
          Home
        </Link>
        {customCrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-slate-300">/</span>
            {crumb.path ? (
              <Link to={crumb.path} className="hover:text-navy-900 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-navy-900 font-bold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNames = {
    dashboard: 'Dashboard',
    juniors: 'Juniors',
    cases: 'Cases',
    amounts: 'Amount Entry',
    hearings: 'Hearing Entry',
    settings: 'Settings'
  };

  return (
    <nav className="flex items-center text-xs font-semibold text-slate-400 space-x-1.5">
      <Link to="/dashboard" className="hover:text-navy-900 transition-colors">
        Home
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name;

        return (
          <React.Fragment key={name}>
            <span className="text-slate-300">/</span>
            {isLast ? (
              <span className="text-navy-900 font-bold">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-navy-900 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
