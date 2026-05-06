// OM UI - Layout Components

import { ReactNode } from 'react';

export interface LayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AppLayout({ sidebar, header, children, className }: LayoutProps) {
  return (
    <div className={`flex h-screen ${className || ''}`}>
      {sidebar && <aside className="w-64 border-r bg-surface">{sidebar}</aside>}
      <div className="flex-1 flex flex-col">
        {header && <header className="h-14 border-b bg-surface">{header}</header>}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}

export function Card({ children, className, title, actions }: { children: ReactNode; className?: string; title?: string; actions?: ReactNode }) {
  return (
    <div className={`border rounded-lg bg-surface ${className || ''}`}>
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Page({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted">{description}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Grid({ children, cols = 3, gap = 4 }: { children: ReactNode; cols?: number; gap?: number }) {
  return (
    <div className={`grid grid-cols-${cols} gap-${gap}`}>
      {children}
    </div>
  );
}

export function Stack({ children, gap = 4 }: { children: ReactNode; gap?: number }) {
  return (
    <div className={`flex flex-col gap-${gap}`}>
      {children}
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-2 border-b bg-surface">
      {children}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}