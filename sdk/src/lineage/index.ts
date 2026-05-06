// OM Lineage - Data Lineage Tracking

import { useState, useEffect, useCallback } from 'react';

export interface OMLineageNode {
  id: string;
  name: string;
  type: 'table' | 'view' | 'pipeline' | 'dashboard' | 'model';
  service?: string;
}

export interface OMLineageEdge {
  from: { id: string; name: string };
  to: { id: string; name: string };
  transform?: string;
}

export interface OMLineage {
  nodes: OMLineageNode[];
  edges: OMLineageEdge[];
  entities?: {
    upstream: string[];
    downstream: string[];
  };
}

export interface OMPipelineNode {
  id: string;
  name: string;
  type: 'source' | 'transform' | 'sink' | 'condition';
  config?: Record<string, any>;
}

export function useLineage(config?: { endpoint?: string }) {
  const [lineage, setLineage] = useState<OMLineage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLineage = async (entityType: string, entityId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${config?.endpoint || '/api/lineage'}?entityType=${entityType}&entityId=${entityId}`);
      const data = await res.json();
      setLineage(data);
      return data;
    } catch (e) { console.error('Failed to fetch lineage:', e); }
    finally { setLoading(false); }
  };

  const queryLineage = async (table: string, direction: 'upstream' | 'downstream' | 'both' = 'both') => {
    const res = await fetch(`${config?.endpoint || '/api/lineage/query'}?table=${table}&direction=${direction}`);
    return res.json();
  };

  const discoverLineage = async (service: string) => {
    const res = await fetch(config?.endpoint || '/api/lineage/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service }),
    });
    return res.json();
  };

  return { lineage, loading, fetchLineage, queryLineage, discoverLineage };
}