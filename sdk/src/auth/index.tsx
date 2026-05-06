// OM Auth - NextAuth SSO Provider
// Supports: Google, GitHub, Azure AD, Okta, SAML

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OMUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'google' | 'github' | 'azure' | 'okta' | 'saml';
  role: 'admin' | 'editor' | 'viewer';
}

export interface OMSession {
  user: OMUser;
  expires: string;
  accessToken?: string;
}

interface AuthConfig {
  providers: string[];
  sessionEndpoint?: string;
  signinEndpoint?: string;
  signoutEndpoint?: string;
}

interface AuthContextType {
  user: OMUser | null;
  loading: boolean;
  signIn: (provider: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  config?: AuthConfig;
  fallback?: ReactNode;
  children: ReactNode;
}

export function AuthProvider({ config, fallback, children }: AuthProviderProps) {
  const [user, setUser] = useState<OMUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async (): Promise<OMSession | null> => {
    try {
      const res = await fetch(config?.sessionEndpoint || '/api/auth/session');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const refreshSession = async () => {
    const session = await fetchSession();
    if (session?.user) {
      setUser(session.user as OMUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // Auto-preload on mount
  useEffect(() => {
    refreshSession();
  }, []);

  const signIn = (provider: string) => {
    const endpoint = config?.signinEndpoint || '/api/auth/signin';
    window.location.href = `${endpoint}/${provider}`;
  };

  const signOut = async () => {
    try {
      const endpoint = config?.signoutEndpoint || '/api/auth/signout';
      await fetch(endpoint, { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    // Refresh or redirect
    window.location.reload();
  };

  if (loading) {
    return <>{fallback || <LoadingSpinner />}</>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ 
        width: 32, 
        height: 32, 
        border: '2px solid var(--primary, #286af0)', 
        borderTopColor: 'transparent', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }} />
    </div>
  );
}

export function LoginPage({ 
  onLogin, 
  title = 'OpenMetadata Manager',
  subtitle = 'Sign in to continue',
  providers = ['google', 'github']
}: { 
  onLogin: (provider: string) => void;
  title?: string;
  subtitle?: string;
  providers?: string[];
}) {
  const providerStyles: Record<string, { name: string; color: string }> = {
    google: { name: 'Google', color: '#4285f4' },
    github: { name: 'GitHub', color: '#333' },
    azure: { name: 'Azure AD', color: '#0078d4' },
    okta: { name: 'Okta', color: '#007dc1' },
    saml: { name: 'Enterprise SSO', color: '#6366f1' },
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 16 
    }}>
      <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            background: 'linear-gradient(135deg, #286af0, #1a54b8)', 
            borderRadius: 16, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: '#888' }}>{subtitle}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {providers.map(key => {
            const provider = providerStyles[key] || { name: key, color: '#666' };
            return (
              <button
                key={key}
                onClick={() => onLogin(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderRadius: 8,
                  border: '1px solid #333',
                  background: 'transparent',
                  color: '#e5e5e5',
                  cursor: 'pointer',
                  fontSize: 15,
                  transition: 'background 0.2s',
                }}
              >
                {provider.name}
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: '#666' }}>
          Protected by enterprise-grade SSO
        </p>
      </div>
    </div>
  );
}