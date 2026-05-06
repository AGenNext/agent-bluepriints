// OM Lifecycle - Full lifecycle management for data operations
// Includes: Jobs, Tasks, Health, Metrics, Alerts, Rollback

import { useState, useEffect, useCallback, useRef } from 'react';

// ===== Types =====

export interface OMJob {
  id: string;
  name: string;
  type: 'ingest' | 'transform' | 'export' | 'backup' | 'restore' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata?: Record<string, any>;
}

export interface OMTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  parentId?: string;
}

export interface OMHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  lastCheck: Date;
  message?: string;
}

export interface OMMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface OMAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  acknowledged?: boolean;
}

export interface OMRollback {
  id: string;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  changes: Record<string, any>;
  user?: string;
}

// ===== Hooks =====

export function useJobs(config?: { endpoint?: string; pollInterval?: number }) {
  const [jobs, setJobs] = useState<OMJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<OMJob | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/jobs');
      const data = await res.json();
      setJobs(data.jobs || data || []);
    } catch (e) { console.error('Failed to fetch jobs:', e); }
    finally { setLoading(false); }
  }, [config?.endpoint]);

  useEffect(() => {
    fetchJobs();
    if (config?.pollInterval) {
      intervalRef.current = setInterval(fetchJobs, config.pollInterval);
    }
    return () => clearInterval(intervalRef.current);
  }, [fetchJobs, config?.pollInterval]);

  const createJob = async (job: Partial<OMJob>) => {
    const res = await fetch(config?.endpoint || '/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    const newJob = await res.json();
    setJobs(prev => [...prev, newJob]);
    return newJob;
  };

  const cancelJob = async (jobId: string) => {
    await fetch(`${config?.endpoint || '/api/jobs'}/${jobId}/cancel`, { method: 'POST' });
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'cancelled' } : j));
  };

  const retryJob = async (jobId: string) => {
    const res = await fetch(`${config?.endpoint || '/api/jobs'}/${jobId}/retry`, { method: 'POST' });
    const restarted = await res.json();
    setJobs(prev => prev.map(j => j.id === jobId ? restarted : j));
    return restarted;
  };

  return { jobs, loading, selectedJob, setSelectedJob, createJob, cancelJob, retryJob, refresh: fetchJobs };
}

export function useHealth(config?: { endpoint?: string; pollInterval?: number }) {
  const [health, setHealth] = useState<OMHealth[]>([]);
  const [overall, setOverall] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/health');
      const data = await res.json();
      const services = data.services || data || [];
      setHealth(services);
      setOverall(services.some(s => s.status === 'down') ? 'down' 
        : services.some(s => s.status === 'degraded') ? 'degraded' : 'healthy');
    } catch { setOverall('down'); }
    finally { setLoading(false); }
  }, [config?.endpoint]);

  useEffect(() => {
    fetchHealth();
    if (config?.pollInterval) intervalRef.current = setInterval(fetchHealth, config.pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchHealth, config?.pollInterval]);

  return { health, overall, loading, refresh: fetchHealth };
}

export function useMetrics(config?: { endpoint?: string; metrics?: string[]; pollInterval?: number }) {
  const [metrics, setMetrics] = useState<OMMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchMetrics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      config?.metrics?.forEach(m => params.append('metric', m));
      const res = await fetch(`${config?.endpoint || '/api/metrics'}${params ? '?' + params : ''}`);
      const data = await res.json();
      setMetrics(data.metrics || data || []);
    } catch (e) { console.error('Failed to fetch metrics:', e); }
    finally { setLoading(false); }
  }, [config?.endpoint, config?.metrics]);

  useEffect(() => {
    fetchMetrics();
    if (config?.pollInterval) intervalRef.current = setInterval(fetchMetrics, config.pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchMetrics, config?.pollInterval]);

  const getMetric = (name: string) => metrics.find(m => m.name === name);
  return { metrics, getMetric, loading, refresh: fetchMetrics };
}

export function useAlerts(config?: { endpoint?: string; pollInterval?: number }) {
  const [alerts, setAlerts] = useState<OMAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts || data || []);
    } catch (e) { console.error('Failed to fetch alerts:', e); }
    finally { setLoading(false); }
  }, [config?.endpoint]);

  useEffect(() => {
    fetchAlerts();
    if (config?.pollInterval) intervalRef.current = setInterval(fetchAlerts, config.pollInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchAlerts, config?.pollInterval]);

  const acknowledge = async (alertId: string) => {
    await fetch(`${config?.endpoint || '/api/alerts'}/${alertId}/acknowledge`, { method: 'POST' });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  const criticalCount = alerts.filter(a => a.level === 'critical' && !a.acknowledged).length;
  return { alerts, loading, acknowledge, criticalCount, refresh: fetchAlerts };
}

export function useTasks(config?: { endpoint?: string }) {
  const [tasks, setTasks] = useState<OMTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || data || []);
    } catch (e) { console.error('Failed to fetch tasks:', e); }
    finally { setLoading(false); }
  }, [config?.endpoint]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (task: Partial<OMTask>) => {
    const res = await fetch(config?.endpoint || '/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const newTask = await res.json();
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<OMTask>) => {
    const res = await fetch(`${config?.endpoint || '/api/tasks'}/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  };

  return { tasks, loading, createTask, updateTask, refresh: fetchTasks };
}

// ===== Rollback Functions =====

export async function rollbackResource(config: {
  resourceType: string;
  resourceId: string;
  version?: string;
  endpoint?: string;
}) {
  const res = await fetch(`${config.endpoint || '/api/rollback'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function getResourceHistory(config: {
  resourceType: string;
  resourceId: string;
  endpoint?: string;
  limit?: number;
}): Promise<OMRollback[]> {
  const params = new URLSearchParams({
    resourceType: config.resourceType,
    resourceId: config.resourceId,
  });
  if (config.limit) params.set('limit', String(config.limit));
  const res = await fetch(`${config.endpoint || '/api/history'}?${params}`);
  const data = await res.json();
  return data.history || data || [];
}