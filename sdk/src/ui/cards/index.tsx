// OM UI - Card Components

import { ReactNode } from 'react';

// Stat Card
export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
}: {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="p-4 border rounded-lg bg-surface">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {icon && <div className="text-muted">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {change !== undefined && (
          <span
            className={`text-sm ${
              change >= 0 ? 'text-success' : 'text-error'
            }`}
          >
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      {changeLabel && <p className="text-xs text-muted mt-1">{changeLabel}</p>}
    </div>
  );
}

// List Card
export function ListCard<T>({
  items,
  keyField,
  render,
  empty,
  onItemClick,
}: {
  items: T[];
  keyField: keyof T;
  render: (item: T) => { title: string; subtitle?: string; description?: string; icon?: ReactNode; action?: ReactNode };
  empty?: string;
  onItemClick?: (item: T) => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {items.length === 0 ? (
        <div className="p-8 text-center text-muted">{empty || 'No items'}</div>
      ) : (
        <div className="divide-y">
          {items.map(item => {
            const { title, subtitle, description, icon, action } = render(item);
            const key = (item as any)[keyField];
            return (
              <div
                key={key}
                className={`flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors ${
                  onItemClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onItemClick?.(item)}
              >
                {icon && <div className="text-muted">{icon}</div>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{title}</p>
                  {subtitle && (
                    <p className="text-sm text-muted truncate">{subtitle}</p>
                  )}
                  {description && (
                    <p className="text-sm text-muted truncate">{description}</p>
                  )}
                </div>
                {action && <div>{action}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Empty State
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4 text-muted opacity-50">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Loading State
export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      {message && <p className="mt-4 text-muted">{message}</p>}
    </div>
  );
}

// Error State
export function ErrorState({
  title,
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium">{title || 'Error'}</h3>
      <p className="mt-1 text-sm text-muted max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Alert Card
export function AlertCard({
  variant = 'info',
  title,
  children,
  actions,
}: {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const variants = {
    info: 'border-info bg-info/10',
    success: 'border-success bg-success/10',
    warning: 'border-warning bg-warning/10',
    error: 'border-error bg-error/10',
  };
  const colors = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${variants[variant]}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-2">
          {title && <span className={`font-medium ${colors[variant]}`}>{title}</span>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}

// Badge
export function Badge({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}) {
  const variants = {
    default: 'bg-surface-2',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${variants[variant]}`}>
      {label}
    </span>
  );
}

// Avatar
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name
    .split(' ')
    .map(x => x[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizes[size]} rounded-full bg-primary/10 flex items-center justify-center overflow-hidden`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-primary font-medium">{initials}</span>
      )}
    </div>
  );
}