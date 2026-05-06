// OM Query - Query Engine & SQL

import { useState, useCallback } from 'react';

export interface OMQuery {
  id: string;
  query: string;
  database?: string;
  status?: 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface OMQueryResult {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  total: number;
}

export function useQuery(config?: { endpoint?: string }) {
  const [results, setResults] = useState<OMQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (query: string, database?: string, params?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(config?.endpoint || '/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, database, params }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setResults(data);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const explain = async (query: string) => {
    const res = await fetch(`${config?.endpoint || '/api/query'}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  };

  return { results, loading, error, execute, explain };
}

// Query Builder
export function buildQuery(config: {
  select: string[];
  from: string;
  where?: Record<string, any>;
  orderBy?: string[];
  groupBy?: string[];
  limit?: number;
}): string {
  const parts = ['SELECT', config.select.join(', '), 'FROM', config.from];
  
  if (config.where?.length) {
    const conditions = Object.entries(config.where).map(([k, v]) => {
      if (typeof v === 'string') return `${k} = '${v}'`;
      if (Array.isArray(v)) return `${k} IN (${v.map(x => `'${x}'`).join(', ')})`;
      return `${k} = ${v}`;
    });
    parts.push('WHERE', conditions.join(' AND '));
  }
  
  if (config.groupBy?.length) parts.push('GROUP BY', config.groupBy.join(', '));
  if (config.orderBy?.length) parts.push('ORDER BY', config.orderBy.join(', '));
  if (config.limit) parts.push('LIMIT', String(config.limit));
  
  return parts.join(' ');
}