import { useState } from 'react';

function StatusBadge({ status, variant = 'outlined' }) {
  let label = 'Unknown';
  let color = 'default';

  if (typeof status === 'string') {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('valid') || s.includes('success') || s.includes('secure')) {
      label = status;
      color = 'success';
    } else if (s.includes('inactive') || s.includes('pending')) {
      label = status;
      color = 'default';
    } else if (s.includes('error') || s.includes('compromised') || s.includes('invalid') || s.includes('fabricated')) {
      label = status;
      color = 'error';
    } else if (s.includes('warn') || s.includes('partial') || s.includes('uncertain')) {
      label = status;
      color = 'warning';
    } else if (s.includes('info') || s.includes('exact') || s.includes('matched')) {
      label = status;
      color = 'info';
    } else {
      label = status;
    }
  }

  const colorClasses = {
    success: { bg: 'bg-green-100 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-500/20' },
    default: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600' },
    error: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
    warning: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
    info: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  };

  const cls = colorClasses[color] || colorClasses.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold leading-none
        ${variant === 'filled' ? cls.bg + ' ' + cls.text : cls.bg + ' ' + cls.text + ' ' + cls.border}
      `}
    >
      {label}
    </span>
  );
}

function ScoreBar({ value, max = 100, variant }) {
  const percentage = Math.min(Math.max(value / max * 100, 0), 100);
  const variantClasses = {
    success: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    error: 'bg-red-500 dark:bg-red-400',
    default: 'bg-indigo-500 dark:bg-indigo-400',
  };
  let barColor = variantClasses[variant] || variantClasses.default;
  if (!variant) {
    if (percentage >= 80) barColor = 'bg-emerald-500 dark:bg-emerald-400';
    else if (percentage >= 60) barColor = 'bg-amber-500 dark:bg-amber-400';
    else barColor = 'bg-red-500 dark:bg-red-400';
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-600 ease-in-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 min-w-[40px] text-right">
        {value}%
      </span>
    </div>
  );
}

function LoadingOverlay({ loading, children }) {
  if (!loading) return children;
  return (
    <div className="relative min-h-[200px]">
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-gray-900/70 z-10 rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 border-[3px] border-indigo-300 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
      {children}
    </div>
  );
}

export { StatusBadge, ScoreBar, LoadingOverlay };