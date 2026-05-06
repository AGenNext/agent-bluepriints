// OM Chat - Chat UI Component with streaming support

import { useState, useRef, useEffect, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: Date;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  prompt: string;
}

interface ChatConfig {
  endpoint?: string;
  maxMessages?: number;
  placeholder?: string;
  quickActions?: QuickAction[];
}

interface ChatProps {
  config?: ChatConfig;
  onSend?: (message: string) => Promise<string>;
  header?: ReactNode;
  renderMessage?: (msg: ChatMessage) => ReactNode;
  children?: ReactNode;
}

export function useChat(config?: ChatConfig) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async (content?: string) => {
    const text = content || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setInput('');
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await (config?.onSend 
        ? await config.onSend(text)
        : await fetch(config?.endpoint || '/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        }).then(r => r.json())
      );

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: typeof response === 'string' ? response : response.message || response.response || JSON.stringify(response),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    loading,
    send,
    setMessages,
  };
}

export function ChatInterface({ 
  config, 
  onSend,
  header,
  renderMessage,
  children 
}: ChatProps) {
  const { messages, input, setInput, loading, send, setMessages } = useChat(config);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = config?.quickActions || [];
  const placeholder = config?.placeholder || 'Describe your task...';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      {header || (
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border, #333)',
          background: 'var(--surface, #1a1a1a)'
        }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'var(--primary, #286af0)', 
            borderRadius: 10, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontWeight: 600, fontSize: 16 }}>OpenMetadata Manager</h1>
            <p style={{ fontSize: 12, color: '#888' }}>AI Agent for Data Operations</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Ready
          </div>
        </header>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '12px 24px', borderBottom: '1px solid #333', background: '#1a1a1a' }}>
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setInput(action.prompt)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #333',
                background: 'transparent',
                color: '#888',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
            👋 Send a message to get started
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            display: 'flex', 
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
          }}>
            <div style={{ 
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: 12,
              background: msg.role === 'user' 
                ? 'var(--primary, #286af0)' 
                : msg.role === 'error'
                ? 'rgba(239, 68, 68, 0.2)'
                : 'var(--surface-2, #252525)',
              color: msg.role === 'error' ? '#ef4444' : 'inherit',
              fontSize: 14,
              whiteSpace: 'pre-wrap',
            }}>
              {renderMessage ? renderMessage(msg) : msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px 16px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#888',
                  animation: `bounce 1s infinite ${i * 0.15}s`
                }} />
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid #333', background: '#1a1a1a' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
              minHeight: 48,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #333',
              background: '#252525',
              color: 'inherit',
              fontSize: 15,
              resize: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary, #286af0)',
              color: 'white',
              fontWeight: 600,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !loading ? 1 : 0.5,
            }}
          >
            Send
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}