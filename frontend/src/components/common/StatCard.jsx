import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  icon: Icon,
  value,
  label,
  change,
  changeType = 'up', // up, down, neutral
  iconBg = 'bg-navy-50 text-navy-900',
  className = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover card-transition ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-navy-900 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          {changeType === 'up' ? (
            <span className="flex items-center gap-0.5 font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              {change}
            </span>
          ) : changeType === 'down' ? (
            <span className="flex items-center gap-0.5 font-semibold text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
              {change}
            </span>
          ) : (
            <span className="font-medium text-slate-500">{change}</span>
          )}
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
