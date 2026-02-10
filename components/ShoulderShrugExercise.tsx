
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';
import { SuccessModal } from './SuccessModal';
import { speak } from './VoiceCoach';

interface ShoulderShrugExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
  onNext: () => void;
}

const REP_GOAL = 20;

export const ShoulderShrugExercise: React.FC<ShoulderShrugExerciseProps> = ({ onComplete, onCancel, onNext }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Initializing sensors...");
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [tensionLevel, setTensionLevel] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const stateRef = useRef({ isShrugging: false, history: [] as number[], baselineRatio: 0, framesProcessed: 0, calibrationFrames: 30 });

  const triggerFeedback = (msg: string, vocalize = false) => {
    setFeedback(msg);
    setFeedbackKey(prev => prev + 1);
    if (vocalize) speak(msg);
  };

  useEffect(() => {
    if (counter >= REP_GOAL && !showSuccess) {
      setShowSuccess(true);
      speak("Shoulders released. Session complete.");
    }
  }, [counter, showSuccess]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isRunning || showSuccess) return;
    
    let isClosed = false;

    // @ts-ignore
    const pose = new window.Pose({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
    pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    
    pose.onResults((results: any) => {
      if (isClosed || showSuccess) return;
      const canvasCtx = canvasRef.current!.getContext('2d');
      if (!canvasCtx || !results.poseLandmarks) return;
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
      const landmarks = results.poseLandmarks;
      const nose = landmarks[0];
      const leftS = landmarks[11];
      const rightS = landmarks[12];
      if (nose && leftS && rightS) {
        const shoulderY = (leftS.y + rightS.y) / 2;
        const currentRatio = (shoulderY - nose.y) / Math.abs(rightS.x - leftS.x);
        const { history } = stateRef.current;
        history.push(currentRatio);
        if (history.length > 5) history.shift();
        const smoothRatio = history.reduce((a, b) => a + b, 0) / history.length;
        if (stateRef.current.framesProcessed < stateRef.current.calibrationFrames) {
          stateRef.current.framesProcessed++;
          stateRef.current.baselineRatio = ((stateRef.current.baselineRatio * (stateRef.current.framesProcessed - 1)) + smoothRatio) / stateRef.current.framesProcessed;
          setFeedback(`Calibrating sensors...`);
          return;
        }
        const baseline = stateRef.current.baselineRatio;
        const shrugPoint = baseline * 0.80;
        const releasePoint = baseline * 0.95;
        const progress = ((baseline - smoothRatio) / (baseline - shrugPoint)) * 100;
        setTensionLevel(Math.min(Math.max(progress, 0), 100));
        
        if (smoothRatio < shrugPoint) {
          if (!stateRef.current.isShrugging) { 
            stateRef.current.isShrugging = true; 
            triggerFeedback("Hold that tension. Now drop slowly.", true); 
          }
        } else if (smoothRatio > releasePoint) {
          if (stateRef.current.isShrugging) { 
            setCounter(p => p + 1); 
            setReward(p => p + 15); 
            stateRef.current.isShrugging = false; 
            triggerFeedback("Perfect release.", true); 
          }
        }
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => { 
        if (isRunning && !showSuccess && !isClosed) {
          try {
            await pose.send({ image: videoRef.current! }); 
          } catch (e) {
            console.warn("Pose send failed", e);
          }
        }
      },
      width: 640, height: 480,
    });
    camera.start();

    return () => { isClosed = true; camera.stop(); pose.close(); };
  }, [isRunning, showSuccess]);

  const progressPercentage = Math.min((counter / REP_GOAL) * 100, 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full relative animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col">
        <div className="relative bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 aspect-video flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted /><canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          {isRunning && (
            <div className="absolute top-8 right-8 flex flex-col items-center gap-4 z-10">
              <div className="w-6 h-48 bg-white/20 backdrop-blur-md rounded-full overflow-hidden border border-white/30 p-1">
                <div className="w-full rounded-full transition-all duration-300 ease-out" style={{ height: `${tensionLevel}%`, marginTop: `${100 - tensionLevel}%`, background: tensionLevel > 80 ? '#43E97B' : '#38F9D7' }} />
              </div>
              <span className="text-[10px] font-black text-white/60 tracking-widest uppercase vertical-text">Tension</span>
            </div>
          )}
          {!isRunning && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-white z-20 text-center">
              <h3 className="text-4xl font-black mb-2 tracking-tighter">Shoulder Release</h3>
              <p className="text-gray-300 font-medium mb-10 max-w-xs">Lift your shoulders to your ears, hold, and drop completely.</p>
              <button onClick={() => { setIsRunning(true); speak("Ready to release some tension? Let's shrug."); }} className="px-12 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all">Begin Calibration</button>
            </div>
          )}
          {isRunning && (
            <div key={feedbackKey} className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 px-8 py-4 rounded-full flex items-center gap-4 border border-teal-100 shadow-xl">
              <span className="text-base font-black text-gray-800 tracking-tight">{feedback}</span>
            </div>
          )}
          {isRunning && (
            <div className="absolute top-6 left-6 right-1/4">
               <div className="h-2 bg-white/20 backdrop-blur-md rounded-full overflow-hidden">
                  <div className="h-full bg-teal-400 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
               </div>
            </div>
          )}
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={() => setShowSuccess(true)} className="flex-1 py-5 bg-[#2C3E50] text-white rounded-3xl font-black text-lg shadow-xl hover:bg-gray-700 transition-all">Complete Session</button>
          <button onClick={onCancel} className="px-8 py-5 bg-white text-gray-500 border border-gray-100 rounded-3xl font-bold">Exit</button>
        </div>
      </div>
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 premium-shadow">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Reps</h4>
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between p-4 bg-teal-50 rounded-2xl border border-teal-100">
                <span className="text-2xl">✅</span>
                <span className="text-2xl font-black text-teal-600">{counter} <span className="text-xs text-teal-300">/ {REP_GOAL}</span></span>
             </div>
          </div>
        </div>
      </div>
      {showSuccess && (
        <SuccessModal message={`Outstanding! You've successfully completed ${counter} shrugs.`} onSave={() => onComplete({ exercise: ExerciseType.SHOULDER_SHRUG, counter, reward })} onNext={() => { onComplete({ exercise: ExerciseType.SHOULDER_SHRUG, counter, reward }); onNext(); }} />
      )}
    </div>
  );
};
