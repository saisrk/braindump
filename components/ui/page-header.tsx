import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-8 flex items-start justify-between ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-dark-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
