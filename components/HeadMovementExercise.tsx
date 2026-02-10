
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';
import { SuccessModal } from './SuccessModal';
import { speak } from './VoiceCoach';

interface HeadMovementExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
  onNext: () => void;
}

const REP_GOAL = 10;

export const HeadMovementExercise: React.FC<HeadMovementExerciseProps> = ({ onComplete, onCancel, onNext }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Calibrating face...");
  const [showSuccess, setShowSuccess] = useState(false);

  const stateRef = useRef({
    lastTurn: null as 'left' | 'right' | null,
    isNeutral: true,
    history: [] as number[],
    lastVocalTime: 0
  });

  const triggerFeedback = (msg: string, vocalize = false) => {
    setFeedback(msg);
    const now = Date.now();
    if (vocalize && (now - stateRef.current.lastVocalTime > 3000)) {
      speak(msg);
      stateRef.current.lastVocalTime = now;
    }
  };

  useEffect(() => {
    if (counter >= REP_GOAL && !showSuccess) {
      setShowSuccess(true);
      speak("Smooth rotations. Your mobility is much better now.", true);
    }
  }, [counter, showSuccess]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isRunning || showSuccess) return;
    let isClosed = false;

    // @ts-ignore
    const pose = new window.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    
    pose.onResults((results: any) => {
      if (isClosed || showSuccess) return;
      const canvasCtx = canvasRef.current!.getContext('2d');
      if (!canvasCtx || !results.poseLandmarks) return;
      
      canvasCtx.clearRect(0, 0, 640, 480);
      canvasCtx.drawImage(results.image, 0, 0, 640, 480);
      
      const landmarks = results.poseLandmarks;
      const nose = landmarks[0];
      const leftEar = landmarks[7];
      const rightEar = landmarks[8];
      
      if (nose && leftEar && rightEar) {
        const nosePosRatio = (nose.x - leftEar.x) / (rightEar.x - leftEar.x);
        stateRef.current.history.push(nosePosRatio);
        if (stateRef.current.history.length > 6) stateRef.current.history.shift();
        const smoothRatio = stateRef.current.history.reduce((a, b) => a + b, 0) / stateRef.current.history.length;
        
        // Detection
        const leftTurnBound = 0.35;
        const rightTurnBound = 0.65;
        const centerLow = 0.42;
        const centerHigh = 0.58;

        if (smoothRatio < leftTurnBound && stateRef.current.isNeutral && stateRef.current.lastTurn !== 'left') {
          setCounter(prev => prev + 1);
          setReward(prev => prev + 15);
          stateRef.current.lastTurn = 'left';
          stateRef.current.isNeutral = false;
          triggerFeedback("Turned left. Excellent range.", true);
        } else if (smoothRatio > rightTurnBound && stateRef.current.isNeutral && stateRef.current.lastTurn !== 'right') {
          setCounter(prev => prev + 1);
          setReward(prev => prev + 15);
          stateRef.current.lastTurn = 'right';
          stateRef.current.isNeutral = false;
          triggerFeedback("Turned right. Keep it smooth.", true);
        } else if (smoothRatio > centerLow && smoothRatio < centerHigh && !stateRef.current.isNeutral) {
          stateRef.current.isNeutral = true;
          stateRef.current.lastTurn = null;
          setFeedback("Center reached.");
        }
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => { if (isRunning && !showSuccess && !isClosed) await pose.send({ image: videoRef.current! }); },
      width: 640, height: 480,
    });
    camera.start();

    return () => { isClosed = true; camera.stop(); pose.close(); };
  }, [isRunning, showSuccess]);

  const progressPercentage = Math.min((counter / REP_GOAL) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full relative animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col">
        <div className="relative bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 aspect-video flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted /><canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          {!isRunning && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center text-white z-20">
               <h3 className="text-4xl font-black mb-4 tracking-tight">Head Rotation</h3>
               <p className="text-gray-300 font-medium mb-10 max-w-sm">Rotate your face fully to the left, then fully to the right.</p>
               <button onClick={() => { setIsRunning(true); speak("Head rotations starting. Move slowly.", true); }} className="px-14 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">Launch Training</button>
            </div>
          )}
          {isRunning && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 px-10 py-4 rounded-full flex items-center gap-3 shadow-2xl border border-teal-50">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-sm font-black text-gray-800 tracking-tight">{feedback}</span>
            </div>
          )}
          {isRunning && (
            <div className="absolute top-6 left-6 right-6">
              <div className="h-2.5 bg-white/20 backdrop-blur-md rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={() => setShowSuccess(true)} className="flex-1 py-5 bg-[#2C3E50] text-white rounded-3xl font-black text-lg shadow-xl hover:bg-gray-700 transition-all">Finish Now</button>
          <button onClick={onCancel} className="px-8 py-5 bg-white text-gray-400 border border-gray-100 rounded-3xl font-bold hover:bg-gray-50">Exit</button>
        </div>
      </div>
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 premium-shadow">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Session Progress</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-5 bg-teal-50 rounded-2xl border border-teal-100">
               <span className="text-3xl font-black text-teal-600">{counter} <span className="text-xs text-teal-300">/ {REP_GOAL}</span></span>
               <span className="text-[10px] font-black text-teal-400 uppercase">Reps</span>
            </div>
          </div>
        </div>
      </div>
      {showSuccess && <SuccessModal message={`You finished ${counter} rotations! Fantastic progress today.`} onSave={() => onComplete({ exercise: ExerciseType.HEAD_MOVEMENT, counter, reward })} onNext={() => { onComplete({ exercise: ExerciseType.HEAD_MOVEMENT, counter, reward }); onNext(); }} />}
    </div>
  );
};
