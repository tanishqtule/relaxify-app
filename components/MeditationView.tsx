
import React, { useState, useEffect } from 'react';
import { speak } from './VoiceCoach';

export const MeditationView: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;

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
      <div
        className="h-full flex items-center justify-center"
        style={{ animation: 'entrance 0.7s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div
          className="text-center p-12 rounded-[56px] premium-shadow max-w-sm"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
          }}
        >
          <h3
            className="text-4xl font-black mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Find Your Center
          </h3>
          <p
            className="mb-10 font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Follow the coach's voice for a balanced breathing cycle.
          </p>
          <button
            onClick={() => setIsReady(true)}
            className="px-12 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-2xl btn-ripple"
            style={{ transition: 'transform 0.2s ease' }}
          >
            Start Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ animation: 'entrance 1s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      <div className="text-center">
        <div className="relative mb-16">
          <div
            className={`w-64 h-64 rounded-full flex items-center justify-center breathing-circle shadow-[0_0_80px_rgba(56,249,215,0.2)] transition-all duration-[4000ms] ${
              phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-75' : 'scale-110'
            }`}
            style={{ background: 'rgba(56,249,215,0.08)', border: '1px solid rgba(56,249,215,0.15)' }}
          >
            <div className="w-48 h-48 premium-gradient rounded-full flex items-center justify-center text-white premium-shadow">
              <span className="text-4xl font-black">{seconds}</span>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-full scale-110 animate-pulse"
            style={{ background: 'rgba(56,249,215,0.06)' }}
          />
        </div>

        <h2
          className="text-5xl font-black mb-4 tracking-tight uppercase"
          style={{ color: 'var(--text-primary)' }}
        >
          {phase}
        </h2>
        <p
          className="font-bold uppercase tracking-[0.4em]"
          style={{ color: 'var(--text-muted)' }}
        >
          Let the sound guide you
        </p>

        <div className="mt-16 flex gap-2 justify-center">
          {['Inhale', 'Hold', 'Exhale'].map((p) => (
            <div
              key={p}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: phase === p ? 48 : 16,
                background: phase === p ? '#38F9D7' : 'var(--border-card)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
