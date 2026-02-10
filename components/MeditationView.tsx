
import React, { useState, useEffect } from 'react';
import { speak } from './VoiceCoach';

export const MeditationView: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    
    // Vocalize current phase on change
    speak(phase, true);

    const timer = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (phase === 'Inhale') { setPhase('Hold'); return 4; }
          if (phase === 'Hold') { setPhase('Exhale'); return 4; }
          setPhase('Inhale'); return 4;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isReady]);

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center animate-in fade-in duration-700">
        <div className="text-center p-12 bg-white rounded-[56px] premium-shadow border border-gray-100 max-w-sm">
          <h3 className="text-4xl font-black text-gray-800 mb-6">Find Your Center</h3>
          <p className="text-gray-400 mb-10 font-medium">Follow the coach's voice for a balanced breathing cycle.</p>
          <button 
            onClick={() => setIsReady(true)}
            className="px-12 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">
      <div className="text-center">
        <div className="relative mb-16">
          <div className={`w-64 h-64 bg-teal-100 rounded-full flex items-center justify-center breathing-circle shadow-[0_0_80px_rgba(56,249,215,0.2)] transition-all duration-[4000ms] ${phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-75' : 'scale-110'}`}>
            <div className="w-48 h-48 premium-gradient rounded-full flex items-center justify-center text-white premium-shadow">
              <span className="text-4xl font-black">{seconds}</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-teal-400 rounded-full scale-110 opacity-10 animate-pulse" />
        </div>

        <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tight uppercase">
          {phase}
        </h2>
        <p className="text-gray-400 font-bold uppercase tracking-[0.4em]">
          Let the sound guide you
        </p>

        <div className="mt-16 flex gap-2 justify-center">
          {['Inhale', 'Hold', 'Exhale'].map((p) => (
            <div 
              key={p}
              className={`h-2 rounded-full transition-all duration-500 ${
                phase === p ? 'w-12 bg-teal-500' : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
