// OM Ingestion - Data Ingestion Pipelines

import { useState, useEffect, useCallback } from 'react';

export interface OMIngestionPipeline {
  id: string;
  name: string;
  source: string;
  sink: string;
  schedule?: string;
  concurrency?: number;
  enableDebugMode?: boolean;
  workflowId?: string;
  sourceConfig?: Record<string, any>;
  sinkConfig?: Record<string, any>;
  status?: 'pending' | 'queued' | 'running' | 'disabled' | 'failed';
}

export interface OMPipelineStatus {
  pipelineId: string;
  status: 'pending' | 'queued' | 'running' | 'disabled' | 'failed';
  lastRunAt?: Date;
  nextRunAt?: Date;
  error?: string;
}

export function useIngestionPipelines(config?: { endpoint?: string }) {
  const [pipelines, setPipelines] = useState<OMIngestionPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipelines = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/ingestion/pipelines');
      const data = await res.json();
      setPipelines(data.pipelines || data || []);
    } catch (e) { console.error('Failed to fetch pipelines:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPipelines(); }, [fetchPipelines]);

  const createPipeline = async (pipeline: Partial<OMIngestionPipeline>) => {
    const res = await fetch(config?.endpoint || '/api/ingestion/pipelines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline),
    });
    const newP = await res.json();
    setPipelines(prev => [...prev, newP]);
    return newP;
  };

  const triggerPipeline = async (pipelineId: string) => {
    const res = await fetch(`${config?.endpoint || '/api/ingestion/pipelines'}/${pipelineId}/trigger`, {
      method: 'POST',
    });
    return res.json();
  };

  const deletePipeline = async (pipelineId: string) => {
    await fetch(`${config?.endpoint || '/api/ingestion/pipelines'}/${pipelineId}`, { method: 'DELETE' });
    setPipelines(prev => prev.filter(p => p.id !== pipelineId));
  };

  return { pipelines, loading, createPipeline, triggerPipeline, deletePipeline, refresh: fetchPipelines };
}