import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function EmptyState({ title, description, actionLabel, actionPath, actionIcon, icon: Icon }) {
  const actionRef = useRef(null);

  useEffect(() => {
    if (actionPath && actionPath.startsWith('#') && actionRef.current) {
      actionRef.current.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(actionPath);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [actionPath]);

  const isAnchor = actionPath && actionPath.startsWith('#');

  return (
    <div
      role="status"
      aria-label={title || 'No data available'}
      className="p-8 sm:p-12 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <div
        className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-indigo-50 dark:bg-indigo-500/10 mb-6 transition-transform duration-300 hover:scale-105"
        role="img"
        aria-hidden="true"
      >
        {Icon ? <Icon className="text-indigo-500" style={{ width: 36, height: 36 }} /> : (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        )}
      </div>
      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">
        {title || 'No Data Found'}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
        {description || 'There are no items to display at this time.'}
      </p>
      {actionLabel && actionPath && (
        isAnchor ? (
          <a
            ref={actionRef}
            href={actionPath}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-500/30 hover:bg-indigo-600 transition-colors no-underline"
          >
            {actionLabel}
          </a>
        ) : (
          <Link
            to={actionPath}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-500/30 hover:bg-indigo-600 transition-colors no-underline"
          >
            {actionLabel}
          </Link>
        )
      )}
    </div>
  );
}