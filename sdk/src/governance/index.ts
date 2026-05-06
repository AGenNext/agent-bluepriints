// OM Governance - Data Governance & Policies

import { useState, useEffect, useCallback } from 'react';

export interface OMClassification {
  id: string;
  name: string;
  description?: string;
  provider?: string;
}

export interface OMTag {
  id: string;
  name: string;
  description?: string;
  classification?: string;
  fullyQualifiedName?: string;
}

export interface OMAccessPolicy {
  id: string;
  name: string;
  description?: string;
  policyType: 'allow' | 'deny';
  resources: string[];
  resourceRegex?: string;
  subjects: { type: string; id: string }[];
  operations: string[];
  deleteInDays?: number;
}

export interface OMDataQuality {
  id: string;
  name: string;
  description?: string;
  qualityType: 'column' | 'table' | ' freshness';
  config: Record<string, any>;
  schedule?: string;
}

export interface OMRetention {
  id: string;
  name: string;
  description?: string;
  entityTypes: string[];
  retentionDays: number;
  deleteAfterDays?: number;
}

export function useClassifications(config?: { endpoint?: string }) {
  const [classifications, setClassifications] = useState<OMClassification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassifications = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/governance/classifications');
      const data = await res.json();
      setClassifications(data || []);
    } catch (e) { console.error('Failed to fetch classifications:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClassifications(); }, [fetchClassifications]);

  const createClassification = async (c: Partial<OMClassification>) => {
    const res = await fetch(config?.endpoint || '/api/governance/classifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c),
    });
    const newC = await res.json();
    setClassifications(prev => [...prev, newC]);
    return newC;
  };

  return { classifications, loading, createClassification, refresh: fetchClassifications };
}

export function useTags(config?: { endpoint?: string }) {
  const [tags, setTags] = useState<OMTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/governance/tags');
      const data = await res.json();
      setTags(data || []);
    } catch (e) { console.error('Failed to fetch tags:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const createTag = async (t: Partial<OMTag>) => {
    const res = await fetch(config?.endpoint || '/api/governance/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t),
    });
    const newT = await res.json();
    setTags(prev => [...prev, newT]);
    return newT;
  };

  const applyTag = async (entityType: string, entityId: string, tagId: string) => {
    await fetch(`${config?.endpoint || '/api/governance/tags'}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, entityId, tagId }),
    });
  };

  return { tags, loading, createTag, applyTag, refresh: fetchTags };
}

export function useAccessPolicies(config?: { endpoint?: string }) {
  const [policies, setPolicies] = useState<OMAccessPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/governance/policies');
      const data = await res.json();
      setPolicies(data || []);
    } catch (e) { console.error('Failed to fetch policies:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const createPolicy = async (p: Partial<OMAccessPolicy>) => {
    const res = await fetch(config?.endpoint || '/api/governance/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    const newP = await res.json();
    setPolicies(prev => [...prev, newP]);
    return newP;
  };

  return { policies, loading, createPolicy, refresh: fetchPolicies };
}

export function useRetention(config?: { endpoint?: string }) {
  const [retentions, setRetentions] = useState<OMRetention[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRetentions = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/governance/retention');
      const data = await res.json();
      setRetentions(data || []);
    } catch (e) { console.error('Failed to fetch retention:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRetentions(); }, [fetchRetentions]);

  const createRetention = async (r: Partial<OMRetention>) => {
    const res = await fetch(config?.endpoint || '/api/governance/retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r),
    });
    return res.json();
  };

  return { retentions, loading, createRetention, refresh: fetchRetentions };
}