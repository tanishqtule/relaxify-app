
import React, { useState, useEffect } from 'react';
import { ExerciseType } from '../types';
import { speak } from './VoiceCoach';
import { SuccessModal } from './SuccessModal';

interface EyeFocusExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
}

export const EyeFocusExercise: React.FC<EyeFocusExerciseProps> = ({ onComplete, onCancel }) => {
  const [phase, setPhase] = useState<'near' | 'far'>('near');
  const [seconds, setSeconds] = useState(20);
  const [isStarted, setIsStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isStarted || showSuccess) return;

    if (seconds === 20) {
      if (phase === 'near') {
        speak("Now, look at something 20 feet away for 20 seconds.", true);
      } else {
        speak("Rest your eyes. Look back at your screen now.", true);
      }
    }

    const timer = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (phase === 'near') {
            setPhase('far');
            return 20;
          } else {
            setShowSuccess(true);
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, phase, seconds, showSuccess]);

  if (showSuccess) {
    return (
      <SuccessModal 
        message="Your vision is refreshed! Remember to take breaks every 20 minutes."
        onSave={() => onComplete({ exercise: ExerciseType.EYE_FOCUS, counter: 1, reward: 50 })}
        onNext={() => onComplete({ exercise: ExerciseType.EYE_FOCUS, counter: 1, reward: 50 })}
      />
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
      {!isStarted ? (
        <div className="text-center p-12 bg-white rounded-[56px] premium-shadow border border-gray-100 max-w-md">
          <div className="w-20 h-20 bg-teal-50 rounded-[24px] flex items-center justify-center text-3xl mx-auto mb-8">👁️</div>
          <h3 className="text-4xl font-black text-gray-800 mb-6">20-20-20 Rule</h3>
          <p className="text-gray-400 mb-10 font-medium">Every 20 minutes, look at something 20 feet away for 20 seconds. This prevents digital eye strain.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsStarted(true)}
              className="flex-1 px-8 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Start Reset
            </button>
            <button 
              onClick={onCancel}
              className="px-8 py-5 bg-gray-50 text-gray-400 rounded-full font-bold hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-12">
          <div className="relative">
            <div className={`w-80 h-80 rounded-full flex items-center justify-center transition-all duration-1000 shadow-2xl ${
              phase === 'near' ? 'bg-teal-50 scale-100' : 'bg-blue-50 scale-110'
            }`}>
              <div className="text-6xl font-black text-gray-800">{seconds}s</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#2C3E50] text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
              {phase === 'near' ? 'Focus Far Away' : 'Almost Done'}
            </div>
          </div>
          
          <div className="max-w-xs mx-auto">
            <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tighter uppercase">
              {phase === 'near' ? 'Look Away' : 'Hold Focus'}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm">
              Focus on a distant object across the room or out a window.
            </p>
          </div>

          <button onClick={onCancel} className="text-gray-300 font-black uppercase text-[10px] tracking-widest hover:text-gray-500 transition-colors">
            Cancel Session
          </button>
        </div>
      )}
    </div>
  );
};
