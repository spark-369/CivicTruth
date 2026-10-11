import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

function HomeIconSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}

const PageHeader = forwardRef(function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  sx = {},
}, ref) {
  return (
    <div ref={ref} className="mb-6 sm:mb-8" role="banner" style={sx}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 mb-3" aria-label="Breadcrumb">
          <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <HomeIconSVG className="text-gray-400" />
            <span className="font-medium">Home</span>
          </Link>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <span key={index} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400" aria-current="page">
                {item.label}
              </span>
            ) : (
              <span key={index} className="flex items-center gap-1 text-sm text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                <Link to={item.path || '#'} className="text-gray-500 no-underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <span className="font-medium">{item.label}</span>
                </Link>
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="self-stretch sm:self-auto flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
});

export default PageHeader;