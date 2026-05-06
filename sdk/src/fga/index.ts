// OM FGA - Fine-Grained Authorization (Zanzibar-style)
import { useState, useEffect, useCallback } from 'react';

// ===== Types =====

export interface OMPermission {
  resource: string;
  resourceId: string;
  relation: string;
  subject: string;
  subjectId: string;
  allowed: boolean;
}

export interface OMRelation {
  subject: string;
  subjectId: string;
  relation: string;
  createdAt: Date;
}

export interface OMAccessPolicy {
  id: string;
  name: string;
  description?: string;
  resource: string;
  relation: string;
  subject: {
    type: string;
    filter?: Record<string, any>;
  };
  condition?: string;
  roles: string[];
  createdAt: Date;
}

export interface OMBulkCheckResult {
  results: { resource: string; resourceId: string; allowed: boolean }[];
}

// ===== FGA Hooks =====

export function usePermissions(config?: { endpoint?: string }) {
  const [permissions, setPermissions] = useState<OMPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/permissions');
      const data = await res.json();
      setPermissions(data.permissions || data || []);
    } catch (e) { console.error('Failed to fetch permissions:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const check = async (resource: string, resourceId: string, action: string): Promise<boolean> => {
    const res = await fetch(config?.endpoint || '/api/permissions/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, resourceId, action }),
    });
    const data = await res.json();
    return data.allowed ?? false;
  };

  const bulkCheck = async (checks: { resource: string; resourceId: string; action: string }[]): Promise<OMBulkCheckResult> => {
    const res = await fetch(config?.endpoint || '/api/permissions/bulk-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checks }),
    });
    return res.json();
  };

  const grant = async (perm: OMPermission) => {
    const res = await fetch(config?.endpoint || '/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perm),
    });
    const newPerm = await res.json();
    setPermissions(prev => [...prev, newPerm]);
    return newPerm;
  };

  const revoke = async (resource: string, resourceId: string, subject: string, subjectId: string) => {
    await fetch(config?.endpoint || '/api/permissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, resourceId, subject, subjectId }),
    });
    setPermissions(prev => prev.filter(p => 
      !(p.resource === resource && p.resourceId === resourceId && p.subject === subject && p.subjectId === subjectId)
    ));
  };

  return { permissions, loading, check, bulkCheck, grant, revoke, refresh: fetchPermissions };
}

export function useRelations(config?: { endpoint?: string }) {
  const [relations, setRelations] = useState<OMRelation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRelations = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/relations');
      const data = await res.json();
      setRelations(data.relations || data || []);
    } catch (e) { console.error('Failed to fetch relations:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRelations(); }, [fetchRelations]);

  const addRelation = async (rel: OMRelation) => {
    const res = await fetch(config?.endpoint || '/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rel),
    });
    const newRel = await res.json();
    setRelations(prev => [...prev, newRel]);
    return newRel;
  };

  const removeRelation = async (subject: string, subjectId: string, relation: string) => {
    await fetch(config?.endpoint || '/api/relations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, subjectId, relation }),
    });
    setRelations(prev => prev.filter(r => 
      !(r.subject === subject && r.subjectId === subjectId && r.relation === relation)
    ));
  };

  return { relations, loading, addRelation, removeRelation, refresh: fetchRelations };
}

export function usePolicies(config?: { endpoint?: string }) {
  const [policies, setPolicies] = useState<OMAccessPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/policies');
      const data = await res.json();
      setPolicies(data.policies || data || []);
    } catch (e) { console.error('Failed to fetch policies:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const createPolicy = async (policy: Partial<OMAccessPolicy>) => {
    const res = await fetch(config?.endpoint || '/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    const newPolicy = await res.json();
    setPolicies(prev => [...prev, newPolicy]);
    return newPolicy;
  };

  const deletePolicy = async (policyId: string) => {
    await fetch(`${config?.endpoint || '/api/policies'}/${policyId}`, { method: 'DELETE' });
    setPolicies(prev => prev.filter(p => p.id !== policyId));
  };

  return { policies, loading, createPolicy, deletePolicy, refresh: fetchPolicies };
}

// ===== Zanzibar-style Client =====

export class OMFGAClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || '/api/fga';
  }

  async check(request: {
    resource: string;
    resourceId: string;
    relation: string;
    subject: string;
    subjectId: string;
  }): Promise<boolean> {
    const res = await fetch(`${this.endpoint}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await res.json();
    return data.allowed ?? false;
  }

  async expand(request: {
    resource: string;
    resourceId: string;
    relation: string;
  }): Promise<string[]> {
    const res = await fetch(`${this.endpoint}/expand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    const data = await res.json();
    return data.users || [];
  }

  async write(request: {
    relation_tuples: {
      resource: string;
      resourceId: string;
      relation: string;
      subject: string;
      subjectId: string;
    }[];
    deletions?: {
      resource: string;
      resourceId: string;
      relation: string;
      subject: string;
      subjectId: string;
    }[];
  }): Promise<void> {
    await fetch(`${this.endpoint}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  }

  async read(request?: {
    resource?: string;
    resourceId?: string;
    subject?: string;
    subjectId?: string;
  }): Promise<OMPermission[]> {
    const params = new URLSearchParams(request as any);
    const res = await fetch(`${this.endpoint}/read?${params}`);
    const data = await res.json();
    return data.relation_tuples || [];
  }
}