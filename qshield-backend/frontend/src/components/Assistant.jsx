import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import aiBot from '../assets/aibot.png';

const QUICK_PROMPTS = [
  'Summarize the latest scan',
  'What are the top risks?',
  'Show vulnerable domains',
  'Any threat surface issues?',
];

const markdownComponents = {
  h1: ({ children }) => <h1 className="text-2xl font-black text-on-surface mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-bold text-on-surface mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-bold text-on-surface mb-2">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-7 text-sm text-on-surface-variant">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-3 text-sm text-on-surface-variant">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-3 text-sm text-on-surface-variant">{children}</ol>,
  li: ({ children }) => <li className="leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-on-surface">{children}</strong>,
  br: () => <br />,
  code: ({ children }) => (
    <code className="rounded bg-surface-container-high px-1.5 py-0.5 text-[12px] font-mono text-on-surface">
      {children}
    </code>
  ),
};

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const streamAbortRef = useRef(null);

  const canSend = useMemo(() => Boolean(query.trim()) && !sending, [query, sending]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const sendQuery = async (overrideQuery) => {
    const trimmed = (overrideQuery ?? query).trim();
    if (!trimmed || sending) return;

    setQuery('');
    setSending(true);
    setCopiedIndex(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '' },
    ]);

    try {
      const controller = new AbortController();
      streamAbortRef.current = controller;

      const res = await fetch('http://localhost:8000/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          history: messages.slice(-5).map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'AI chat failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstToken = false;

      const appendAssistant = (text) => {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === 'assistant') {
            next[lastIndex] = {
              ...next[lastIndex],
              content: (next[lastIndex].content || '') + text,
            };
          }
          return next;
        });
      };

      const processEvent = (payload) => {
        if (payload.chunk !== undefined) {
          if (!firstToken) {
            firstToken = true;
          }
          appendAssistant(payload.chunk);
        }
        if (payload.error) {
          appendAssistant(payload.error);
        }
      };

      if (!reader) {
        throw new Error('AI chat failed');
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n').map((line) => line.trim()).filter(Boolean);
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const raw = line.slice(5).trim();
            if (!raw) continue;
            try {
              const payload = JSON.parse(raw);
              processEvent(payload);
            } catch {
              appendAssistant(raw);
            }
          }
        }
      }

      if (!firstToken) {
        appendAssistant('AI service unavailable');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          const lastIndex = next.length - 1;
          if (lastIndex >= 0 && next[lastIndex].role === 'assistant' && !next[lastIndex].content) {
            next[lastIndex] = {
              ...next[lastIndex],
              content: 'AI service unavailable',
            };
            return next;
          }
          return [...prev, { role: 'assistant', content: 'AI service unavailable' }];
        });
      }
    } finally {
      setSending(false);
      streamAbortRef.current = null;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCopiedIndex(null);
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;
  };

  const copyMessage = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1200);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="fixed bottom-5 right-5 z-[1100] bg-transparent p-0 border-0 shadow-none hover:scale-105 transition-transform duration-200"
          aria-label="Open assistant"
        >
          <img
            src={aiBot}
            alt="Open assistant"
            className="block h-[160px] w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)] select-none pointer-events-none"
            draggable="false"
          />
        </button>
      )}

      <section
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[42vw] lg:w-[38vw] xl:w-[34vw] min-w-[380px] max-w-[720px] bg-surface text-on-surface border-l border-outline-variant/30 shadow-2xl shadow-black/20 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="AI assistant panel"
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-surface via-surface to-surface-container-low">
          <div className="px-6 py-5 border-b border-outline-variant/30 bg-surface/90 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.25em] mb-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  AI Assistant
                </div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Requiem Intelligence</h3>
                <p className="text-sm text-on-surface-variant mt-1">Ask questions about the latest scan context.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearChat}
                  className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                  aria-label="Close assistant"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendQuery(item)}
                  className="min-h-[42px] rounded-xl bg-surface-container-high border border-outline-variant/30 px-3 py-2 text-left text-xs leading-snug font-semibold text-on-surface-variant hover:text-on-surface hover:border-primary/40 hover:shadow-sm hover:scale-[1.01] transition-all whitespace-normal"
                  disabled={sending}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-outline-variant/30 bg-surface-container-low p-5 shadow-sm">
                <p className="text-sm text-on-surface-variant leading-7">
                  Ask a question about assets, threat surface, vulnerabilities, or CBOM. Responses will appear here in readable markdown.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <article
                    key={`${msg.role}-${index}`}
                    className={[
                      'group rounded-3xl border shadow-sm',
                      isUser
                        ? 'ml-auto max-w-[90%] bg-primary text-on-primary border-primary/10'
                        : 'mr-auto max-w-full bg-surface-container-low text-on-surface border-outline-variant/30',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3 px-5 pt-4">
                      <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isUser ? 'text-on-primary/70' : 'text-on-surface-variant/70'}`}>
                        {isUser ? 'You' : 'AI'}
                      </span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => copyMessage(msg.content, index)}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg bg-surface border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                        >
                          {copiedIndex === index ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>

                    <div className="px-5 pb-4 pt-3">
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-7 text-on-primary/95">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:text-on-surface prose-p:text-on-surface-variant prose-li:text-on-surface-variant prose-strong:text-on-surface prose-ul:my-3 prose-ol:my-3 prose-li:my-1">
                          <ReactMarkdown components={markdownComponents}>
                            {msg.content || (sending && index === messages.length - 1 ? 'Thinking...' : '')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="sticky bottom-0 border-t border-outline-variant/30 bg-surface/95 backdrop-blur-md px-6 py-4">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery();
                  }
                }}
                placeholder="Ask about assets, threats, vulnerabilities..."
                rows={2}
                className="flex-1 resize-none rounded-2xl bg-surface-container-high border border-outline-variant/30 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 min-h-[64px]"
              />
              <button
                type="button"
                onClick={() => sendQuery()}
                disabled={!canSend}
                className="h-[64px] px-5 rounded-2xl bg-primary text-on-primary text-sm font-black uppercase tracking-wider shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-[11px] text-on-surface-variant/60">
              Press Enter to send, Shift+Enter for a new line.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
