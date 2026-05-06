// OM Storage - Storage & Lake Operations

import { useState, useEffect, useCallback } from 'react';

export interface OMBucket {
  id: string;
  name: string;
  service: string;
  prefix?: string;
  storageClass?: string;
  region?: string;
}

export interface OMObject {
  key: string;
  size?: number;
  lastModified?: Date;
  contentType?: string;
  metadata?: Record<string, any>;
}

export interface OMStoragePolicy {
  id: string;
  name: string;
  rules: {
    prefix?: string;
    storageClass?: string;
    transition_days?: number;
    expiration_days?: number;
  }[];
}

export function useBuckets(config?: { endpoint?: string }) {
  const [buckets, setBuckets] = useState<OMBucket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBuckets = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/storage/buckets');
      const data = await res.json();
      setBuckets(data.buckets || data || []);
    } catch (e) { console.error('Failed to fetch buckets:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBuckets(); }, [fetchBuckets]);

  const createBucket = async (bucket: Partial<OMBucket>) => {
    const res = await fetch(config?.endpoint || '/api/storage/buckets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bucket),
    });
    return res.json();
  };

  return { buckets, loading, createBucket, refresh: fetchBuckets };
}

export function useStoragePolicies(config?: { endpoint?: string }) {
  const [policies, setPolicies] = useState<OMStoragePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/storage/policies');
      const data = await res.json();
      setPolicies(data || []);
    } catch (e) { console.error('Failed to fetch policies:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const createPolicy = async (policy: Partial<OMStoragePolicy>) => {
    const res = await fetch(config?.endpoint || '/api/storage/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return res.json();
  };

  return { policies, loading, createPolicy, refresh: fetchPolicies };
}