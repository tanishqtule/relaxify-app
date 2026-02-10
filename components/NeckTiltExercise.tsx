
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';
import { SuccessModal } from './SuccessModal';
import { speak } from './VoiceCoach';

const REP_GOAL = 10; // Reduced for testing, can be set back to 20

export const NeckTiltExercise: React.FC<NeckTiltExerciseProps> = ({ onComplete, onCancel, onNext }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Align your head in the center.");
  const [showSuccess, setShowSuccess] = useState(false);

  const stateRef = useRef({ 
    lastSide: null as 'left' | 'right' | null, 
    isNeutral: true, 
    history: [] as number[],
    lastVocalTime: 0 
  });

  const triggerFeedback = (msg: string, vocalize = false) => {
    setFeedback(msg);
    const now = Date.now();
    if (vocalize && (now - stateRef.current.lastVocalTime > 2500)) {
      speak(msg);
      stateRef.current.lastVocalTime = now;
    }
  };

  useEffect(() => {
    if (counter >= REP_GOAL && !showSuccess) {
      setShowSuccess(true);
      speak("Great job! Your neck flexibility is improving.", true);
    }
  }, [counter, showSuccess]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isRunning || showSuccess) return;
    let isClosed = false;
    
    // @ts-ignore
    const pose = new window.Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    
    pose.onResults((results: any) => {
      if (isClosed || showSuccess) return;
      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx || !results.poseLandmarks) return;
      
      ctx.clearRect(0, 0, 640, 480);
      ctx.drawImage(results.image, 0, 0, 640, 480);
      
      const landmarks = results.poseLandmarks;
      const leftEar = landmarks[7];
      const rightEar = landmarks[8];
      
      if (leftEar && rightEar) {
        // Calculate angle between ears (0 is level)
        // MediaPipe Y is inverted (top is 0)
        const rawAngle = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x) * (180 / Math.PI);
        
        // Smoothing
        stateRef.current.history.push(rawAngle);
        if (stateRef.current.history.length > 8) stateRef.current.history.shift();
        const angle = stateRef.current.history.reduce((a, b) => a + b, 0) / stateRef.current.history.length;
        
        // DETECTION LOGIC:
        // angle ~ 0: level head
        // angle > 15: tilt right
        // angle < -15: tilt left
        const threshold = 16;
        const resetThreshold = 10;

        if (angle > threshold && stateRef.current.isNeutral && stateRef.current.lastSide !== 'right') {
          setCounter(c => c + 1);
          setReward(r => r + 10);
          stateRef.current.lastSide = 'right';
          stateRef.current.isNeutral = false;
          triggerFeedback("Tilted right. Good stretch!", true);
        } else if (angle < -threshold && stateRef.current.isNeutral && stateRef.current.lastSide !== 'left') {
          setCounter(c => c + 1);
          setReward(r => r + 10);
          stateRef.current.lastSide = 'left';
          stateRef.current.isNeutral = false;
          triggerFeedback("Tilted left. Keep going!", true);
        } else if (Math.abs(angle) < resetThreshold && !stateRef.current.isNeutral) {
          stateRef.current.isNeutral = true;
          stateRef.current.lastSide = null;
          setFeedback("Back to center. Get ready for the next one.");
        }
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, { 
      onFrame: async () => { if (!isClosed) await pose.send({ image: videoRef.current! }); }, 
      width: 640, height: 480 
    });
    camera.start();
    return () => { isClosed = true; camera.stop(); pose.close(); };
  }, [isRunning, showSuccess]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full relative animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col">
        <div className="relative bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 aspect-video flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted /><canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          {!isRunning && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-white z-20">
              <h3 className="text-4xl font-black mb-6 tracking-tight">Neck Tilt Flow</h3>
              <p className="text-gray-300 text-center mb-10 max-w-sm font-medium">Tilt your head slowly toward your shoulder, then return to center.</p>
              <button onClick={() => { setIsRunning(true); speak("Ready? Let's begin the Neck Tilt Flow.", true); }} className="px-14 py-5 premium-gradient text-white rounded-full font-black shadow-2xl hover:scale-105 transition-all">Start Workout</button>
            </div>
          )}
          {isRunning && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 px-8 py-4 rounded-full shadow-2xl border border-teal-50 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-sm font-black text-gray-800 tracking-tight">{feedback}</span>
            </div>
          )}
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={() => setShowSuccess(true)} className="flex-1 py-5 bg-[#2C3E50] text-white rounded-3xl font-black shadow-xl hover:bg-gray-700 transition-all">End Session</button>
          <button onClick={onCancel} className="px-8 py-5 bg-white text-gray-400 border border-gray-100 rounded-3xl font-bold hover:bg-gray-50">Exit</button>
        </div>
      </div>
      <div className="w-full lg:w-80">
        <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100">
           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Exercise Metrics</h4>
           <div className="flex items-center justify-between p-5 bg-teal-50/50 rounded-2xl border border-teal-100 mb-4">
              <span className="text-3xl font-black text-teal-600">{counter} <span className="text-sm opacity-30">/ {REP_GOAL}</span></span>
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-tighter">Reps Done</span>
           </div>
           <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">XP Gained</p>
              <p className="text-2xl font-black text-gray-800">+{reward}</p>
           </div>
        </div>
      </div>
      {showSuccess && <SuccessModal message={`Well done! You completed ${counter} reps and earned ${reward} points.`} onSave={() => onComplete({ exercise: ExerciseType.NECK_TILT, counter, reward })} onNext={() => { onComplete({ exercise: ExerciseType.NECK_TILT, counter, reward }); onNext(); }} />}
    </div>
  );
};
interface NeckTiltExerciseProps { onComplete: (s: any) => void; onCancel: () => void; onNext: () => void; }
