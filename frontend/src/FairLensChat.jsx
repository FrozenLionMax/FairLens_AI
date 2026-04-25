import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Shield, RotateCcw, ChevronDown, Copy, Check } from 'lucide-react';


// Quick question suggestions
const QUICK_QUESTIONS = [
  "Why is gender bias so high?",
  "What is disparate impact?",
  "How do I fix proxy features?",
  "Is my model EEOC compliant?",
  "Explain bias in simple terms",
  "What should I do first?",
];

// Typing animation
const TypingDots = () => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
        }}
      />
    ))}
  </div>
);

// Message bubble component
const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        alignItems: 'flex-end',
        marginBottom: 18,
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          border: '2px solid rgba(99,102,241,0.4)',
        }}>
          <Shield size={15} color="#fff" />
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        {/* Label */}
        <span style={{
          fontSize: 10,
          color: '#475569',
          fontWeight: 600,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          paddingLeft: isUser ? 0 : 4,
          paddingRight: isUser ? 4 : 0,
        }}>
          {isUser ? 'You' : 'FairLens AI'}
        </span>

        {/* Message bubble */}
        <div style={{
          background: isUser ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'rgba(17,25,52,0.95)',
          border: isUser ? 'none' : '1px solid rgba(99,102,241,0.2)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
          boxShadow: isUser
            ? '0 4px 20px rgba(99,102,241,0.35)'
            : '0 2px 16px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {msg.typing ? (
            <TypingDots />
          ) : (
            <p style={{
              color: isUser ? '#fff' : '#cbd5e1',
              fontSize: 14,
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {msg.content}
            </p>
          )}
        </div>

        {/* Copy button for AI messages */}
        {!isUser && !msg.typing && msg.content && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#475569',
              fontSize: 11,
              padding: '2px 4px',
            }}
          >
            {copied ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          flexShrink: 0,
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          border: '2px solid rgba(99,102,241,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}>
          👤
        </div>
      )}
    </motion.div>
  );
};

// Main chat component
export default function FairLensChat({ auditResults }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your **FairLens AI Assistant**.

I can help you understand your bias audit results, explain fairness metrics in plain English, and tell you exactly what to do next.

${auditResults ? `I can see your latest audit: **${auditResults.filename}** with an overall bias score of **${auditResults.bias_scores?.overall}%**. Ask me anything about it!` : 'Upload a dataset first to get personalized insights, or ask me anything about AI fairness!'}`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Unread badge
  useEffect(() => {
    if (!open && messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && !lastMsg.typing) setUnread(u => u + 1);
    }
  }, [messages, open]);

  // Focus input
  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  // Build system prompt
  const buildSystemPrompt = () => {
    let context = `You are FairLens AI Assistant — an expert AI fairness and bias detection advisor.

Role:
- Explain AI bias, EEOC compliance, and fairness metrics in SIMPLE, beginner-friendly language
- Give SPECIFIC, actionable advice based on audit results
- Be encouraging, professional, and clear
- Use emojis sparingly
- Keep answers SHORT (3-5 sentences max unless asked for detail)
- Never use heavy ML jargon without explaining it simply

Key terms to simplify:
- Disparate Impact Ratio → Fairness Ratio
- Statistical Parity Difference → Selection Rate Gap
- Protected Attribute → Sensitive Personal Factor (like gender, race, age)
- Proxy Feature → Hidden Bias Field`;

    if (auditResults?.bias_scores) {
      const b = auditResults.bias_scores;
      context += `

CURRENT AUDIT:
- File: ${auditResults.filename}
- Overall Score: ${b.overall}/100
- Gender Bias: ${b.gender}%
- Ethnicity Bias: ${b.ethnicity}%
- Age Bias: ${b.age}%
- Disparate Impact: ${b.disparate_impact_ratio} (${b.disparate_impact_ratio >= 0.80 ? 'PASS ✅' : 'FAIL ❌'})

Use these exact numbers when answering.`;
    }

    return context;
  };

  // Send message
  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: userText };
    const typingMsg = { role: 'assistant', content: '', typing: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);

    try {
      // Build message history
      const history = [...messages, userMsg]
        .filter(m => !m.typing && m.content)
        .map(m => ({ role: m.role, content: m.content }));

      // Call Claude API
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: buildSystemPrompt(),
          messages: history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I couldn't generate a response. Try again.";

      // Replace typing with real response
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = err.message.includes('401')
        ? '⚠️ **API Key Error** - Please check your Anthropic API key.\n\nGet a free key at: console.anthropic.com'
        : `⚠️ **Error**: ${err.message}\n\nTry again in a moment.`;

      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        content: errorMsg,
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle enter key
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset chat
  const resetChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Chat reset! Ready to help with your bias audit results.',
    }]);
    setInput('');
  };

  const chatWidth = expanded ? 520 : 380;
  const chatHeight = expanded ? 680 : 540;

  return (
    <>
      {/* Floating bubble */}
      <motion.div
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1000 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulse */}
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.35)',
              pointerEvents: 'none',
            }}
          />
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: open
              ? 'linear-gradient(135deg,#ef4444,#dc2626)'
              : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            boxShadow: open
              ? '0 6px 28px rgba(239,68,68,0.5)'
              : '0 6px 28px rgba(99,102,241,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={open ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              {open ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
            </motion.div>
          </AnimatePresence>

          {/* Unread badge */}
          <AnimatePresence>
            {!open && unread > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #080e1f',
                }}
              >
                {unread}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 28,
              width: chatWidth,
              height: chatHeight,
              zIndex: 999,
              borderRadius: 24,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(8,14,31,0.97)',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              backdropFilter: 'blur(24px)',
              fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.15))',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexShrink: 0,
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(99,102,241,0.6)',
                }}>
                  <Shield size={18} color="#fff" />
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #080e1f',
                }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700, margin: 0 }}>
                    FairLens AI
                  </h3>
                  <span style={{
                    background: 'rgba(99,102,241,0.25)',
                    color: '#a5b4fc',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(99,102,241,0.3)',
                    letterSpacing: '.04em',
                  }}>
                    ✦ POWERED BY CLAUDE
                  </span>
                </div>
                <p style={{
                  color: '#22c55e',
                  fontSize: 11,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                  }} />
                  Online · Bias Audit Expert
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={resetChat}
                  title="Reset chat"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  title="Expand"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 8,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Audit context banner */}
            {auditResults && (
              <div style={{
                background: 'rgba(99,102,241,0.08)',
                borderBottom: '1px solid rgba(99,102,241,0.12)',
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Sparkles size={12} color="#a5b4fc" />
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  Analyzing: <strong style={{ color: '#a5b4fc' }}>{auditResults.filename}</strong>
                  <span style={{
                    marginLeft: 8,
                    color: auditResults.bias_scores?.overall >= 70 ? '#ef4444' : auditResults.bias_scores?.overall >= 40 ? '#f97316' : '#22c55e',
                    fontWeight: 700,
                  }}>
                    {auditResults.bias_scores?.overall}% bias
                  </span>
                </span>
              </div>
            )}

            {/* Messages */}
            <div
              ref={chatBodyRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 16px 8px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99,102,241,0.2) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick questions */}
            <div style={{
              padding: '8px 16px',
              borderTop: '1px solid rgba(99,102,241,0.08)',
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              flexShrink: 0,
            }}>
              {QUICK_QUESTIONS.map((q, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.04, background: 'rgba(99,102,241,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 20,
                    padding: '5px 12px',
                    color: '#a5b4fc',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all .15s',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <div style={{
              padding: '12px 16px 16px',
              borderTop: '1px solid rgba(99,102,241,0.1)',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-end',
                background: 'rgba(17,25,52,0.9)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 16,
                padding: '10px 14px',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                transition: 'border-color .2s',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about your bias results…"
                  rows={1}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#e2e8f0',
                    fontSize: 14,
                    lineHeight: 1.5,
                    resize: 'none',
                    fontFamily: 'inherit',
                    maxHeight: 100,
                    overflowY: 'auto',
                    scrollbarWidth: 'none',
                  }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    border: 'none',
                    background: input.trim() && !loading
                      ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                      : 'rgba(99,102,241,0.15)',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: input.trim() && !loading ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                    transition: 'all .2s',
                  }}
                >
                  {loading
                    ? <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                      }}
                    />
                    : <Send size={15} color={input.trim() ? '#fff' : '#475569'} />
                  }
                </motion.button>
              </div>

              <p style={{
                color: '#334155',
                fontSize: 10,
                textAlign: 'center',
                margin: '8px 0 0',
              }}>
                Powered by Claude AI · Press Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}