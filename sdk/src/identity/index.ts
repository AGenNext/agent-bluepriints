// OM Identity - Agent Identity & Authentication

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ===== Types =====

export interface OMIdentity {
  id: string;
  name: string;
  type: 'user' | 'agent' | 'service' | 'bot';
  email?: string;
  image?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  lastActive?: Date;
}

export interface OMCredentials {
  type: 'api_key' | 'oauth' | 'jwt' | 'service_account';
  provider?: string;
  expiresAt?: Date;
  scopes?: string[];
}

export interface OM session {
  identity: OMIdentity;
  credentials: OMCredentials;
  roles: string[];
  permissions: string[];
  expiresAt: Date;
}

// ===== Identity Management =====

export function useIdentity(config?: { endpoint?: string }) {
  const [identity, setIdentity] = useState<OMIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIdentity = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/identity');
      const data = await res.json();
      setIdentity(data);
    } catch (e) {
      console.error('Failed to fetch identity:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIdentity(); }, [fetchIdentity]);

  const updateIdentity = async (updates: Partial<OMIdentity>) => {
    const res = await fetch(config?.endpoint || '/api/identity', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setIdentity(updated);
    return updated;
  };

  return { identity, loading, updateIdentity, refresh: fetchIdentity };
}

// ===== Session Management =====

export function useSession(config?: { endpoint?: string }) {
  const [session, setSession] = useState<OMSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/auth/session');
      const data = await res.json();
      setSession(data);
    } catch (e) {
      console.error('Failed to fetch session:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSession(); }, [fetchSession]);

  const refreshSession = async () => {
    const res = await fetch(config?.endpoint || '/api/auth/refresh', { method: 'POST' });
    const data = await res.json();
    setSession(data);
    return data;
  };

  const logout = async () => {
    await fetch(config?.endpoint || '/api/auth/logout', { method: 'POST' });
    setSession(null);
  };

  return { session, loading, refreshSession, logout, refresh: fetchSession };
}

// ===== Token Management =====

export function useTokens(config?: { endpoint?: string }) {
  const [tokens, setTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = async () => {
    try {
      const res = await fetch(config?.endpoint || '/api/auth/tokens');
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch (e) {
      console.error('Failed to fetch tokens:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const createToken = async (name: string, scopes?: string[]) => {
    const res = await fetch(config?.endpoint || '/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scopes }),
    });
    const token = await res.json();
    setTokens(prev => [...prev, token.value]);
    return token;
  };

  const revokeToken = async (token: string) => {
    await fetch(config?.endpoint || '/api/auth/tokens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    setTokens(prev => prev.filter(t => t !== token));
  };

  return { tokens, loading, createToken, revokeToken, refresh: fetchTokens };
}