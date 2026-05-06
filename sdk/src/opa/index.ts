// OM OPA - Open Policy Agent Integration
// Rego policy management and evaluation

import { useState, useEffect, useCallback } from 'react';

// ===== Types =====

export interface OMPolicy {
  id: string;
  name: string;
  module: string; // Rego code
  version?: string;
  scope: 'system' | 'tenant' | 'service';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OMInput {
  resource?: string;
  action?: string;
  subject?: {
    type: string;
    id: string;
    roles?: string[];
    attributes?: Record<string, any>;
  };
  object?: {
    type: string;
    id: string;
    attributes?: Record<string, any>;
  };
  context?: Record<string, any>;
}

export interface OMEvaluation {
  result: 'allow' | 'deny';
  queries?: { expressions: string[] }[];
 的解释: string[];
  metrics?: {
    timer_rego_query_eval_ns: number;
    timer_rego_external_ns: number;
  };
}

export interface OMBundle {
  name: string;
  version: string;
  hash: string;
  services: { name: string; url: string }[];
  roots: string[];
}

// ===== OPA Hooks =====

export function usePolicies(config?: { endpoint?: string }) {
  const [policies, setPolicies] = useState<OMPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/opa/policies');
      const data = await res.json();
      setPolicies(data.policies || data || []);
    } catch (e) { console.error('Failed to fetch policies:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const createPolicy = async (policy: Partial<OMPolicy>) => {
    const res = await fetch(config?.endpoint || '/api/opa/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    const newPolicy = await res.json();
    setPolicies(prev => [...prev, newPolicy]);
    return newPolicy;
  };

  const updatePolicy = async (policyId: string, updates: Partial<OMPolicy>) => {
    const res = await fetch(`${config?.endpoint || '/api/opa/policies'}/${policyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setPolicies(prev => prev.map(p => p.id === policyId ? updated : p));
    return updated;
  };

  const deletePolicy = async (policyId: string) => {
    await fetch(`${config?.endpoint || '/api/opa/policies'}/${policyId}`, { method: 'DELETE' });
    setPolicies(prev => prev.filter(p => p.id !== policyId));
  };

  return { policies, loading, createPolicy, updatePolicy, deletePolicy, refresh: fetchPolicies };
}

export function useBundles(config?: { endpoint?: string }) {
  const [bundles, setBundles] = useState<OMBundle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBundles = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/opa/bundles');
      const data = await res.json();
      setBundles(data.bundles || data || []);
    } catch (e) { console.error('Failed to fetch bundles:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBundles(); }, [fetchBundles]);

  const uploadBundle = async (bundle: File) => {
    const formData = new FormData();
    formData.append('bundle', bundle);
    const res = await fetch(config?.endpoint || '/api/opa/bundles', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  };

  const deleteBundle = async (bundleName: string) => {
    await fetch(`${config?.endpoint || '/api/opa/bundles'}/${bundleName}`, { method: 'DELETE' });
    setBundles(prev => prev.filter(b => b.name !== bundleName));
  };

  return { bundles, loading, uploadBundle, deleteBundle, refresh: fetchBundles };
}

// ===== OPA Client =====

export class OPAClient {
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || '/api/opa';
  }

  // Evaluate input against policies
  async evaluate(input: OMInput): Promise<OMEvaluation> {
    const res = await fetch(`${this.endpoint}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    return res.json();
  }

  // Simple allow/deny check
  async check(input: OMInput): Promise<boolean> {
    const eval = await this.evaluate(input);
    return eval.result === 'allow';
  }

  // Get policy decision
  async getDecision(input: OMInput, decisionId: string): Promise<any> {
    const res = await fetch(`${this.endpoint}/data/${decisionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    return res.json();
  }

  // Bulk check multiple inputs
  async bulkCheck(inputs: OMInput[]): Promise<{ results: { input: OMInput; allowed: boolean }[] }> {
    const res = await fetch(`${this.endpoint}/bulk-eval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs }),
    });
    return res.json();
  }

  // Get policy status
  async getStatus(): Promise<{
    mode: string;
    version: string;
    bundles: OMBundle[];
  }> {
    const res = await fetch(`${this.endpoint}/status`);
    return res.json();
  }
}

// ===== Pre-built Rego Policies =====

export const defaultPolicies = {
  // Allow only authenticated users
  authUser: `package auth

default allow = false

allow {
  input.subject
  input.subject.type == "user"
}`,

  // Admin only
  adminOnly: `package auth

default allow = false

allow {
  input.subject.roles[_] == "admin"
}`,

  // Owner can delete
  ownerDelete: `package auth

default allow = false

allow {
  input.action == "delete"
  input.object.owner == input.subject.id
}`,

  // Role-based access
  roleBased: `package auth

default allow = false

allow {
  input.subject.roles[_] = input.object.requiredRoles[_]
}`,

  // Resource quota
  quotaCheck: `package quota

default allow = true

allow = false {
  input.subject.usedQuota[input.resource] >= input.resource.quota
}`,
};