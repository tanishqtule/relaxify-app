
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';

interface ShoulderShrugExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
}

export const ShoulderShrugExercise: React.FC<ShoulderShrugExerciseProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Waiting for camera...");
  const [tensionLevel, setTensionLevel] = useState(0);

  const stateRef = useRef({
    isShrugging: false,
    history: [] as number[],
    baselineRatio: 0,
    framesProcessed: 0,
    calibrationFrames: 30, // Fast 1-second calibration
  });

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    // @ts-ignore
    const pose = new window.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: any) => {
      const canvasCtx = canvasRef.current!.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      if (results.poseLandmarks) {
        // @ts-ignore
        window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#38F9D7', lineWidth: 3 });
        // @ts-ignore
        window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2 });

        const landmarks = results.poseLandmarks;
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        if (nose && leftShoulder && rightShoulder) {
          // 1. Vertical gap between Nose and Shoulder line
          const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
          const verticalGap = shoulderY - nose.y;

          // 2. Normalize by shoulder width (handles zoom/distance)
          const sWidth = Math.abs(rightShoulder.x - leftShoulder.x);
          const currentRatio = verticalGap / sWidth;

          const { history } = stateRef.current;
          history.push(currentRatio);
          if (history.length > 5) history.shift();
          const smoothRatio = history.reduce((a, b) => a + b, 0) / history.length;

          // 3. Calibration: Capture 'Relaxed' baseline
          if (stateRef.current.framesProcessed < stateRef.current.calibrationFrames) {
            stateRef.current.framesProcessed++;
            stateRef.current.baselineRatio = ((stateRef.current.baselineRatio * (stateRef.current.framesProcessed - 1)) + smoothRatio) / stateRef.current.framesProcessed;
            setFeedback(`Calibrating... Relax your shoulders (${Math.round((stateRef.current.framesProcessed / stateRef.current.calibrationFrames) * 100)}%)`);
            return;
          }

          // 4. Rep Logic
          const baseline = stateRef.current.baselineRatio;
          // Thresholds: Shrug is a 20% reduction in nose-shoulder distance
          const shrugPoint = baseline * 0.80; 
          const releasePoint = baseline * 0.95; 

          // Gauge mapping (Visual only)
          const progress = ((baseline - smoothRatio) / (baseline - shrugPoint)) * 100;
          setTensionLevel(Math.min(Math.max(progress, 0), 100));

          if (smoothRatio < shrugPoint) {
            if (!stateRef.current.isShrugging) {
              stateRef.current.isShrugging = true;
              setFeedback("LIFTED! Now drop them.");
            }
          } else if (smoothRatio > releasePoint) {
            if (stateRef.current.isShrugging) {
              setCounter(prev => prev + 1);
              setReward(prev => prev + 15);
              stateRef.current.isShrugging = false;
              setFeedback("Perfect! Keep going.");
            }
          }
        }
      } else {
        setFeedback("Please stand where the camera can see your shoulders.");
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (isRunning) {
          await pose.send({ image: videoRef.current! });
        }
      },
      width: 640,
      height: 480,
    });

    if (isRunning) {
      camera.start();
    }

    return () => {
      camera.stop();
      pose.close();
    };
  }, [isRunning]);

  const reset = () => {
    stateRef.current.framesProcessed = 0;
    stateRef.current.baselineRatio = 0;
    stateRef.current.isShrugging = false;
    setTensionLevel(0);
    setCounter(0);
    setReward(0);
    setFeedback("Recalibrating...");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="flex-1 flex flex-col">
        <div className="relative bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 aspect-video flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          
          {isRunning && (
            <div className="absolute top-8 right-8 flex flex-col items-center gap-4">
              <div className="w-6 h-48 bg-gray-200/40 backdrop-blur-md rounded-full overflow-hidden border border-white/30 p-1">
                <div 
                  className="w-full rounded-full transition-all duration-150 ease-out"
                  style={{ 
                    height: `${tensionLevel}%`, 
                    marginTop: `${100 - tensionLevel}%`,
                    background: tensionLevel > 90 ? '#38F9D7' : '#43E97B',
                    boxShadow: tensionLevel > 90 ? '0 0 15px #38F9D7' : 'none'
                  }}
                />
              </div>
            </div>
          )}

          {!isRunning && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white z-20">
              <div className="w-24 h-24 premium-gradient rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </div>
              <h3 className="text-4xl font-black mb-4">Shoulder Shrugs</h3>
              <p className="opacity-90 max-w-sm mb-10 text-lg leading-relaxed">
                Relieve heavy shoulder tension. Calibrate while relaxed, then lift shoulders high to count reps.
              </p>
              <button 
                onClick={() => setIsRunning(true)}
                className="px-12 py-5 premium-gradient text-white rounded-full font-black text-xl shadow-[0_20px_50px_rgba(56,249,215,0.3)] hover:scale-105 transition-all"
              >
                Start Training
              </button>
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl px-8 py-4 rounded-full premium-shadow flex items-center gap-4 border border-teal-100">
            <div className={`w-4 h-4 rounded-full ${isRunning ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-base font-bold text-gray-800">{feedback}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => onComplete({ exercise: ExerciseType.SHOULDER_SHRUG, counter, reward })}
            className="flex-1 py-5 bg-[#2C3E50] text-white rounded-3xl font-black text-lg hover:bg-black transition-all"
          >
            Finish Exercise
          </button>
          <button 
            onClick={reset}
            className="px-8 py-5 bg-white text-gray-600 border-2 border-gray-100 rounded-3xl font-bold hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={onCancel}
            className="px-8 py-5 bg-white text-gray-400 border border-gray-100 rounded-3xl font-bold hover:text-red-500"
          >
            Exit
          </button>
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Live Session</p>
          <div className="space-y-4">
            <StatRow label="Reps" value={counter} icon="✅" />
            <StatRow label="Intensity" value={`${Math.round(tensionLevel)}%`} icon="🔥" />
            <StatRow label="Points" value={reward} icon="⭐" />
          </div>
        </div>

        <div className="bg-teal-50 p-8 rounded-[40px] border border-teal-100">
          <h4 className="font-bold text-teal-900 mb-2">Trainer Tip:</h4>
          <p className="text-sm text-teal-800 leading-relaxed font-medium">
            Let your shoulders drop completely for the rep to register. Don't hold the tension!
          </p>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-gray-500">{label}</span>
    </div>
    <span className="text-xl font-black text-[#2C3E50]">{value}</span>
  </div>
);
