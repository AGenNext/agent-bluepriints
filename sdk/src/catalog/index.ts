// OM Catalog - Data Catalog & Discovery

import { useState, useEffect, useCallback } from 'react';

// ===== Types =====

export interface OMTable {
  id: string;
  name: string;
  fullyQualifiedName: string;
  tableType: 'regular' | 'external' | 'view' | 'materialized';
  database: string;
  schema: string;
  description?: string;
  owner?: string;
  tags?: string[];
  columns?: OMColumn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OMColumn {
  name: string;
  dataType: string;
  dataTypeDisplay?: string;
  description?: string;
  nullable?: boolean;
  schemaIsInheritable?: boolean;
  customProperties?: Record<string, any>;
}

export interface OMService {
  id: string;
  name: string;
  serviceType: string;
  description?: string;
  owner?: string;
  tags?: string[];
}

export interface OM Glossary {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  tags?: string[];
  terms?: OMGlossaryTerm[];
}

export interface OMGlossaryTerm {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  synonyms?: string[];
  relatedTerms?: string[];
  references?: { id: string; type: string }[];
}

export interface OMSearchResult {
  id: string;
  name: string;
  fullyQualifiedName: string;
  type: 'table' | 'column' | 'service' | 'dashboard' | 'pipeline';
  description?: string;
  highlighted?: string;
  _score?: number;
}

// ===== Catalog Hooks =====

export function useTables(config?: { endpoint?: string; service?: string }) {
  const [tables, setTables] = useState<OMTable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const params = new URLSearchParams();
      if (config?.service) params.set('service', config.service);
      const res = await fetch(`${config?.endpoint || '/api/tables'}${params ? '?' + params : ''}`);
      const data = await res.json();
      setTables(data.tables || data || []);
    } catch (e) { console.error('Failed to fetch tables:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const getTable = async (tableId: string): Promise<OMTable> => {
    const res = await fetch(`${config?.endpoint || '/api/tables'}/${tableId}`);
    return res.json();
  };

  return { tables, loading, getTable, refresh: fetchTables };
}

export function useServices(config?: { endpoint?: string; type?: string }) {
  const [services, setServices] = useState<OMService[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (config?.type) params.set('type', config.type);
      const res = await fetch(`${config?.endpoint || '/api/services'}${params ? '?' + params : ''}`);
      const data = await res.json();
      setServices(data.services || data || []);
    } catch (e) { console.error('Failed to fetch services:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const createService = async (service: Partial<OMService>) => {
    const res = await fetch(config?.endpoint || '/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    });
    const newService = await res.json();
    setServices(prev => [...prev, newService]);
    return newService;
  };

  return { services, loading, createService, refresh: fetchServices };
}

export function useGlossaries(config?: { endpoint?: string }) {
  const [glossaries, setGlossaries] = useState<OMGlossary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlossaries = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/glossaries');
      const data = await res.json();
      setGlossaries(data.glossaries || data || []);
    } catch (e) { console.error('Failed to fetch glossaries:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGlossaries(); }, [fetchGlossaries]);

  const createGlossary = async (glossary: Partial<OMGlossary>) => {
    const res = await fetch(config?.endpoint || '/api/glossaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(glossary),
    });
    return res.json();
  };

  const addTerm = async (glossaryId: string, term: Partial<OMGlossaryTerm>) => {
    const res = await fetch(`${config?.endpoint || '/api/glossaries'}/${glossaryId}/terms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(term),
    });
    return res.json();
  };

  return { glossaries, loading, createGlossary, addTerm, refresh: fetchGlossaries };
}

// ===== Search =====

export function useSearch(config?: { endpoint?: string }) {
  const [results, setResults] = useState<OMSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const search = async (q: string, filters?: Record<string, string>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => params.set(k, v));
      }
      const res = await fetch(`${config?.endpoint || '/api/search'}?${params}`);
      const data = await res.json();
      setResults(data.hits || data || []);
    } catch (e) { console.error('Search failed:', e); }
    finally { setLoading(false); }
  };

  const indexForSearch = async (entityType: string, entityId: string) => {
    const res = await fetch(config?.endpoint || '/api/search/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId }),
    });
    return res.json();
  };

  return { results, loading, query, search, setQuery, indexForSearch };
}