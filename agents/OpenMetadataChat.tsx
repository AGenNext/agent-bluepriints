import React, { useState, useEffect, createContext, useContext } from 'react';
import { Bot, LogIn, User, LogOut, Shield } from 'lucide-react';

// Auth Context
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// SSO Providers
const ssoProviders = {
  google: { name: 'Google', color: '#4285f4' },
  github: { name: 'GitHub', color: '#333' },
  azure: { name: 'Azure AD', color: '#0078d4' },
  okta: { name: 'Okta', color: '#007dc1' },
  saml: { name: 'SAML / Enterprise SSO', color: '#6366f1' },
};

// Login Page with SSO
function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(null);

  const handleSSOLogin = async (provider) => {
    setLoading(provider);
    // In production, redirect to IdP or call SSO endpoint
    setTimeout(() => {
      setLoading(null);
      onLogin({ 
        provider, 
        name: 'Demo User', 
        email: 'user@example.com',
        role: 'admin' 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center">
            <Bot className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">OpenMetadata Manager</h1>
          <p className="mt-2 text-muted-foreground">Sign in to manage your data</p>
        </div>

        <div className="space-y-3">
          {Object.entries(ssoProviders).map(([key, provider]) => (
            <button
              key={key}
              onClick={() => handleSSOLogin(key)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading === key ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Shield className="w-5 h-5" style={{ color: provider.color }} />
              )}
              Continue with {provider.name}
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Protected by enterprise-grade SSO
        </p>
      </div>
    </div>
  );
}

// Main Chat Component
function ChatInterface({ user, onLogout }) {
  const [messages, setMessages] = useState([
    { role: 'system', content: '👋 Hi! I\'m the OpenMetadata Manager.\n\nI can help you with:\n• Data platforms (Snowflake, BigQuery, Deltalake)\n• Data governance & lineage\n• AI/ML integration (LlamaIndex, RAG)\n• System architecture & optimization\n\nWhat would you like to do?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Processing your request: "${userMessage}"\n\nDelegating to @openmetadata-manager agent...` 
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b bg-card">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">OpenMetadata Manager</h1>
          <p className="text-xs text-muted-foreground">Connected as {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground capitalize bg-secondary px-2 py-1 rounded">
            {user.provider}
          </span>
          <button onClick={onLogout} className="p-2 hover:bg-accent rounded-lg">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' :
              msg.role === 'system' ? 'bg-muted text-muted-foreground text-sm' :
              'bg-card border'
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Describe your data task..."
            className="flex-1 rounded-lg border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App with NextAuth - Auto preload
export default function OpenMetadataApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-preload session on mount
  useEffect(() => {
    async function preloadSession() {
      try {
        // Try NextAuth session
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const session = await res.json();
          if (session?.user) {
            setUser({
              name: session.user.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              provider: session.provider || 'oauth'
            });
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log('No NextAuth session, checking localStorage...');
      }
      
      // Fallback: check localStorage (demo mode)
      const saved = localStorage.getItem('om-user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
      setLoading(false);
    }
    preloadSession();
  }, []);

  const handleLogin = (provider: string) => {
    // NextAuth/oauth redirect
    window.location.href = `/api/auth/signin/${provider}`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('om-user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? (
    <ChatInterface user={user} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}