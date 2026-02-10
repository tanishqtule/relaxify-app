
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface SuccessModalProps {
  message: string;
  onSave: () => void;
  onNext: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ message, onSave, onNext }) => {
  const [zenArt, setZenArt] = useState<string | null>(null);
  const [loadingArt, setLoadingArt] = useState(true);

  useEffect(() => {
    async function generateArt() {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: "A premium, minimalist abstract wallpaper for a wellness app. Colors: mint, teal, soft blue. Subject: a peaceful lotus flower made of digital glass. High resolution, 4k, artistic." }]
          },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setZenArt(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } catch (err) {
        console.error("Art gen failed", err);
      } finally {
        setLoadingArt(false);
      }
    }
    generateArt();
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-xl animate-in fade-in">
      <div className="max-w-md w-full bg-white rounded-[56px] p-8 text-center premium-shadow border border-white/50 animate-in zoom-in-95 duration-500 overflow-hidden relative">
        <div className="relative z-10">
          <div className="w-full aspect-square rounded-[40px] bg-gray-50 mb-8 overflow-hidden premium-shadow border-4 border-white relative group">
            {loadingArt ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-teal-50/50">
                <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Generating Zen Art...</p>
              </div>
            ) : zenArt ? (
              <img src={zenArt} className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" alt="Zen Reward" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 font-black text-3xl">✨</div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full text-[9px] font-black uppercase text-teal-600 shadow-xl">New Artifact</div>
          </div>
          
          <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tighter">Session Mastered</h3>
          <p className="text-gray-400 font-medium leading-relaxed mb-10 px-4">{message}</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onNext}
              className="w-full py-5 premium-gradient text-white rounded-[24px] font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continue Journey
            </button>
            <button 
              onClick={onSave}
              className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors text-sm"
            >
              Return to Sanctuary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
