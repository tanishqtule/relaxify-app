
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MoodState, ExerciseType } from '../types';

interface ProactiveChatbotProps {
  userMood: MoodState;
  isIdle: boolean;
  onStartExercise: (type: ExerciseType) => void;
  userName?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const SUGGESTIONS = [
  { label: 'Breathing exercise', icon: '🌬️', prompt: 'Guide me through a quick breathing exercise' },
  { label: 'Posture tips', icon: '🧘', prompt: 'Give me tips to improve my posture while working' },
  { label: 'Eye care', icon: '👁️', prompt: 'How can I reduce eye strain from screen time?' },
  { label: 'Stress relief', icon: '✨', prompt: 'I am feeling stressed, help me relax' },
];

export const ProactiveChatbot: React.FC<ProactiveChatbotProps> = ({ userMood, isIdle, onStartExercise, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lastProactiveRef = useRef({ idle: 0, stress: 0, hydrate: Date.now() });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text: string, isSystem = false) => {
    if (!text.trim()) return;

    if (!isSystem) {
      setMessages(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
      setInputValue('');
    }

    setIsTyping(true);
    if (isSystem) setIsOpen(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are Relaxify AI, a warm and knowledgeable wellness assistant inside a digital wellness app.
The user's current mood is: ${userMood}.
${userName ? `The user's name is ${userName}.` : ''}
${isSystem ? 'This is a proactive wellness nudge. Be brief and caring.' : 'The user is asking for help.'}

User message: "${text}"

Respond in a friendly, empathetic, and helpful tone. Keep it concise (under 60 words). Use natural language. If relevant, suggest a specific exercise or tip. Do not use markdown formatting.`,
        config: { temperature: 0.7 }
      });

      const botResponse = response.text || "I'm here for you. Take a deep breath and remember — you're doing great.";
      setMessages(prev => [...prev, { role: 'model', text: botResponse, timestamp: Date.now() }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm having trouble connecting right now. In the meantime, try this: close your eyes, take 3 deep breaths, and relax your shoulders. I'll be back shortly!",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Proactive Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      if (now - lastProactiveRef.current.hydrate > 1200000) {
        sendMessage("SYSTEM: Hey! Time for a quick water break. Hydration keeps the brain sharp.", true);
        lastProactiveRef.current.hydrate = now;
      }

      if (isIdle && now - lastProactiveRef.current.idle > 300000) {
        sendMessage("SYSTEM: I noticed you've been sitting for a while. How about 10 shoulder shrugs to boost energy?", true);
        lastProactiveRef.current.idle = now;
      }

      if (userMood === 'stressed' && now - lastProactiveRef.current.stress > 600000) {
        sendMessage("SYSTEM: You look a bit tense. Let's try 1 minute of guided breathing together?", true);
        lastProactiveRef.current.stress = now;
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [userMood, isIdle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const hasMessages = messages.length > 0;
  const greeting = userName ? `Hello, ${userName}` : 'Hello there';

  return (
    <>
      {/* Full-screen AI chat overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{
            background: 'var(--bg-page)',
            animation: 'fade-scale-in 0.35s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {/* Header */}
          <header
            className="flex items-center justify-between px-6 h-16 shrink-0"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid var(--border-card)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 8.25 4.09c0 .796.082 1.573.24 2.322" />
                  <path d="M16 3l0 4" />
                  <path d="M18 5l-4 0" />
                </svg>
              </div>
              <div>
                <h1
                  className="text-sm font-black tracking-tight uppercase"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Relaxify AI
                </h1>
                <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--clr-primary)' }}>
                  Wellness Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                  }}
                  title="New chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                }}
              >
                <svg className="w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Chat body */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-6 py-8 flex flex-col min-h-full">
              {!hasMessages ? (
                /* Empty state — Gemini-style greeting */
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div
                    className="text-center mb-12"
                    style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) both' }}
                  >
                    {/* Sparkle icon */}
                    <div
                      className="w-20 h-20 mx-auto mb-8 premium-gradient rounded-3xl flex items-center justify-center premium-shadow-lg"
                      style={{ animation: 'float 6s ease-in-out infinite' }}
                    >
                      <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
                      </svg>
                    </div>

                    <h2
                      className="fluid-title font-black tracking-tight mb-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {greeting}
                    </h2>
                    <p
                      className="text-lg font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      How can I help with your wellness today?
                    </p>
                  </div>

                  {/* Suggestion chips */}
                  <div
                    className="grid grid-cols-2 gap-3 w-full max-w-lg"
                    style={{ animation: 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}
                  >
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s.prompt)}
                        className="p-4 rounded-2xl text-left transition-all hover:scale-[1.03] group"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-card)',
                          boxShadow: 'var(--shadow-card)',
                        }}
                      >
                        <span className="text-2xl block mb-2">{s.icon}</span>
                        <span
                          className="text-sm font-bold block group-hover:text-[#38F9D7] transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {s.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages */
                <div className="flex-1 flex flex-col gap-6 pb-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      style={{
                        animation: `slide-up 0.35s cubic-bezier(0.16,1,0.3,1) both`,
                      }}
                    >
                      {m.role === 'model' && (
                        <div
                          className="w-8 h-8 premium-gradient rounded-xl flex items-center justify-center shrink-0 mr-3 mt-1"
                        >
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed ${
                          m.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                        }`}
                        style={
                          m.role === 'user'
                            ? {
                                background: 'linear-gradient(135deg, #38F9D7 0%, #20C997 100%)',
                                color: '#071220',
                              }
                            : {
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-card)',
                              }
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start" style={{ animation: 'slide-up 0.3s ease both' }}>
                      <div
                        className="w-8 h-8 premium-gradient rounded-xl flex items-center justify-center shrink-0 mr-3 mt-1"
                      >
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
                        </svg>
                      </div>
                      <div
                        className="px-5 py-4 rounded-2xl rounded-bl-md"
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-card)',
                        }}
                      >
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--clr-primary)', animation: 'breathe 1.4s ease-in-out infinite' }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--clr-primary)', animation: 'breathe 1.4s ease-in-out 0.2s infinite' }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--clr-primary)', animation: 'breathe 1.4s ease-in-out 0.4s infinite' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div
            className="shrink-0 px-6 py-4"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid var(--border-card)',
            }}
          >
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }}
                className="flex items-end gap-3"
              >
                <div
                  className="flex-1 rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about wellness..."
                    rows={1}
                    className="w-full px-5 py-4 text-sm font-medium resize-none outline-none bg-transparent"
                    style={{
                      color: 'var(--text-primary)',
                      maxHeight: '120px',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-12 h-12 premium-gradient rounded-xl flex items-center justify-center text-white shrink-0 transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{ boxShadow: inputValue.trim() ? '0 4px 20px rgba(56,249,215,0.4)' : 'none' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
              <p
                className="text-center text-[10px] font-medium mt-2 tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Relaxify AI may make mistakes. Your wellness matters to us.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-[100] w-16 h-16 premium-gradient rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all animate-float"
          style={{
            boxShadow: '0 8px 40px rgba(56,249,215,0.4), 0 2px 10px rgba(0,0,0,0.15)',
          }}
          aria-label="Open Wellness AI chat"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {isIdle && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
          )}
        </button>
      )}
    </>
  );
};
