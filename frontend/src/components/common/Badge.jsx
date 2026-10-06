import React from 'react';

export const Badge = ({ children, status, variant, className = '' }) => {
  const getVariantStyles = () => {
    const s = (status || children || '').toString().toLowerCase();

    if (variant) {
      const vMap = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-slate-50 text-slate-700 border-slate-200',
        purple: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
      return vMap[variant] || vMap.neutral;
    }

    switch (s) {
      // Case / Junior / Hearing Statuses
      case 'active':
      case 'paid':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'new':
      case 'upcoming':
      case 'today':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'pending':
      case 'partial':
      case 'adjourned':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'closed':
      case 'inactive':
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      // Case types
      case 'civil':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'criminal':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'corporate':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
      case 'family':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'property':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'labour':
      case 'consumer':
        return 'bg-teal-50 text-teal-700 border-teal-200/80';
      // Payment Modes
      case 'upi':
        return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'bank transfer':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'cash':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDotColor = () => {
    const s = (status || children || '').toString().toLowerCase();
    switch (s) {
      case 'active':
      case 'paid':
      case 'completed':
        return 'bg-emerald-500';
      case 'new':
      case 'upcoming':
      case 'today':
        return 'bg-blue-500';
      case 'pending':
      case 'partial':
      case 'adjourned':
        return 'bg-amber-500';
      case 'closed':
      case 'inactive':
      case 'cancelled':
        return 'bg-slate-400';
      default:
        return null;
    }
  };

  const dot = getDotColor();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVariantStyles()} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  );
};
