
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MoodState, ExerciseType } from '../types';

interface ProactiveChatbotProps {
  userMood: MoodState;
  isIdle: boolean;
  onStartExercise: (type: ExerciseType) => void;
}

export const ProactiveChatbot: React.FC<ProactiveChatbotProps> = ({ userMood, isIdle, onStartExercise }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Welcome to Relaxify! I'm your wellness guide. How are you feeling?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const lastProactiveRef = useRef({ idle: 0, stress: 0, hydrate: Date.now() });

  const sendMessage = async (text: string, isSystem = false) => {
    if (!text.trim()) return;
    
    if (!isSystem) {
      setMessages(prev => [...prev, { role: 'user', text }]);
      setInputValue('');
    }
    
    setIsTyping(true);
    setIsOpen(true);

    try {
      // Create a new instance right before the call as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: User is using a wellness app called Relaxify. Mood: ${userMood}. User said: "${text}". Provide a short, friendly, empathetic wellness tip or answer. Under 30 words.`,
        config: { temperature: 0.7 }
      });
      
      const botResponse = response.text || "I'm here for you. Take a deep breath.";
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  // Proactive Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      
      // Hydration Reminder every 20 mins
      if (now - lastProactiveRef.current.hydrate > 1200000) {
        sendMessage("SYSTEM: Hey! Time for a quick water break. Hydration keeps the brain sharp.", true);
        lastProactiveRef.current.hydrate = now;
      }

      // Idle Trigger
      if (isIdle && now - lastProactiveRef.current.idle > 300000) {
        sendMessage("SYSTEM: I noticed you've been sitting for a while. How about 10 shoulder shrugs to boost energy?", true);
        lastProactiveRef.current.idle = now;
      }

      // Stress Trigger
      if (userMood === 'stressed' && now - lastProactiveRef.current.stress > 600000) {
        sendMessage("SYSTEM: You look a bit tense. Let's try 1 minute of guided breathing together?", true);
        lastProactiveRef.current.stress = now;
      }

    }, 30000); // Check every 30s
    
    return () => clearInterval(timer);
  }, [userMood, isIdle]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="w-80 h-96 glass-card rounded-[30px] premium-shadow border border-white mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 premium-gradient text-white flex justify-between items-center">
            <span className="font-black text-sm uppercase tracking-widest">Wellness AI</span>
            <button onClick={() => setIsOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-medium ${
                  m.role === 'user' ? 'bg-[#2C3E50] text-white' : 'bg-white text-gray-700 shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-gray-400 italic">Relaxify is thinking...</div>}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(inputValue); }} className="p-4 bg-white/50 border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-white px-4 py-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button type="submit" className="w-8 h-8 premium-gradient rounded-xl flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 premium-gradient rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-all animate-float"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        {isIdle && !isOpen && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}
      </button>
    </div>
  );
};
