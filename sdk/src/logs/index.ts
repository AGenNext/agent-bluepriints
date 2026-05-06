// OM Logs - Logging, Events & Audit Trail

import { useState, useEffect, useCallback, useRef } from 'react';

// ===== Types =====

export interface OMLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  source?: string;
  metadata?: Record<string, any>;
}

export interface OMEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  payload: Record<string, any>;
}

export interface OMAuditEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: Date;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
}

// ===== Logger =====

export class OMLogger {
  private endpoint: string;
  private buffer: OMLog[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(endpoint?: string, flushMs = 5000) {
    this.endpoint = endpoint || '/api/logs';
    this.flushInterval = setInterval(() => this.flush(), flushMs);
  }

  log(level: OMLog['level'], message: string, metadata?: Record<string, any>) {
    const log: OMLog = {
      id: crypto.randomUUID(),
      level,
      message,
      timestamp: new Date(),
      metadata,
    };
    this.buffer.push(log);
    
    // Also log to console in dev
    if (typeof console !== 'undefined') {
      console[level === 'debug' ? 'log' : level](message, metadata);
    }

    // Auto-flush on error
    if (level === 'error') {
      this.flush();
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log('error', message, metadata);
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      });
    } catch (e) {
      // Re-add to buffer on failure
      this.buffer.unshift(...logs);
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// ===== Event Bus =====

export class OMEventBus {
  private handlers: Map<string, ((event: OMEvent) => void)[]> = new Map();

  subscribe(type: string, handler: (event: OMEvent) => void) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);

    return () => {
      const h = this.handlers.get(type) || [];
      this.handlers.set(type, h.filter(x => x !== handler));
    };
  }

  publish(event: OMEvent) {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(h => {
      try {
        h(event);
      } catch (e) {
        console.error('Event handler error:', e);
      }
    });

    // Also publish to wildcard
    const wildcard = this.handlers.get('*') || [];
    wildcard.forEach(h => {
      try {
        h(event);
      } catch (e) {
        console.error('Event handler error:', e);
      }
    });
  }

  async emit(type: string, payload: Record<string, any>) {
    const event: OMEvent = {
      id: crypto.randomUUID(),
      type,
      source: 'client',
      timestamp: new Date(),
      payload,
    };
    this.publish(event);
    
    // Optionally send to server
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (e) {
      console.error('Failed to emit event:', e);
    }
  }
}

// ===== Audit Trail =====

export function useAudit(config?: { endpoint?: string }) {
  const [entries, setEntries] = useState<OMAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async (filters?: Record<string, string>) => {
    try {
      const params = new URLSearchParams(filters as any);
      const res = await fetch(`${config?.endpoint || '/api/audit'}?${params}`);
      const data = await res.json();
      setEntries(data.entries || data || []);
    } catch (e) { console.error('Failed to fetch audit:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const log = async (entry: Partial<OMAuditEntry>) => {
    const res = await fetch(config?.endpoint || '/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    return res.json();
  };

  const search = async (query: string) => {
    const res = await fetch(`${config?.endpoint || '/api/audit'}/search?q=${encodeURIComponent(query)}`);
    return res.json();
  };

  return { entries, loading, log, search, refresh: fetchEntries };
}

// ===== Log Viewer Hook =====

export function useLogs(config?: { endpoint?: string; level?: string; limit?: number }) {
  const [logs, setLogs] = useState<OMLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (config?.level) params.set('level', config.level);
      if (config?.limit) params.set('limit', String(config.limit));
      
      const res = await fetch(`${config?.endpoint || '/api/logs'}?${params}`);
      const data = await res.json();
      setLogs(data.logs || data || []);
    } catch (e) { console.error('Failed to fetch logs:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const clear = async () => {
    await fetch(config?.endpoint || '/api/logs', { method: 'DELETE' });
    setLogs([]);
  };

  return { logs, loading, clear, refresh: fetchLogs };
}

// ===== Event Hook =====

export function useEvents(config?: { endpoint?: string; types?: string[] }) {
  const [events, setEvents] = useState<OMEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      config?.types?.forEach(t => params.append('type', t));
      
      const res = await fetch(`${config?.endpoint || '/api/events'}?${params}`);
      const data = await res.json();
      setEvents(data.events || data || []);
    } catch (e) { console.error('Failed to fetch events:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, refresh: fetchEvents };
}

// ===== Pre-built Log Formats =====

export const LogFormats = {
  json: (log: OMLog) => JSON.stringify(log),
  logfmt: (log: OMLog) => {
    let fmt = `${log.timestamp.toISOString()} ${log.level.toUpperCase()} ${log.message}`;
    if (log.metadata) {
      Object.entries(log.metadata).forEach(([k, v]) => {
        fmt += ` ${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`;
      });
    }
    return fmt;
  },
  syslog: (log: OMLog) => {
    const pri = log.level === 'error' ? 3 : log.level === 'warn' ? 4 : log.level === 'debug' ? 7 : 6;
    return `<${pri}>1 ${log.timestamp.toISOString()} - - - ${log.message}`;
  },
};

// Default logger instance
export const logger = new OMLogger();
export const eventBus = new OMEventBus();