
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';

interface HeadMovementExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
}

export const HeadMovementExercise: React.FC<HeadMovementExerciseProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Align your face in the center to begin.");

  // Game state
  const stateRef = useRef({
    lastTurn: null as 'left' | 'right' | null,
    neutralMaintained: true,
    history: [] as number[],
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
        // Drawing connectors for visual feedback
        // @ts-ignore
        window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#38F9D7', lineWidth: 2 });
        // @ts-ignore
        window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2 });

        const landmarks = results.poseLandmarks;
        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];

        if (nose && leftEar && rightEar) {
          // Calculate head turn ratio: how far is the nose between the two ears
          // In mirrored video: 0.5 is center, < 0.3 is turn one way, > 0.7 is turn other way
          const earDist = Math.abs(rightEar.x - leftEar.x);
          const nosePosRatio = (nose.x - leftEar.x) / (rightEar.x - leftEar.x);
          
          const { history } = stateRef.current;
          history.push(nosePosRatio);
          if (history.length > 5) history.shift();
          const smoothRatio = history.reduce((a, b) => a + b, 0) / history.length;

          // Logic for turns
          // Note: Because it's mirrored, logic depends on camera orientation
          if (smoothRatio < 0.35) { // Turned Left
            if (stateRef.current.lastTurn !== 'left' && stateRef.current.neutralMaintained) {
              setCounter(prev => prev + 1);
              setReward(prev => prev + 15); // Higher reward for turns
              stateRef.current.lastTurn = 'left';
              stateRef.current.neutralMaintained = false;
              setFeedback("Great! Head turned left.");
            }
          } else if (smoothRatio > 0.65) { // Turned Right
            if (stateRef.current.lastTurn !== 'right' && stateRef.current.neutralMaintained) {
              setCounter(prev => prev + 1);
              setReward(prev => prev + 15);
              stateRef.current.lastTurn = 'right';
              stateRef.current.neutralMaintained = false;
              setFeedback("Great! Head turned right.");
            }
          } else if (smoothRatio > 0.45 && smoothRatio < 0.55) { // Neutral center
            stateRef.current.neutralMaintained = true;
            stateRef.current.lastTurn = null;
            setFeedback("Now slowly turn your head...");
          }
        }
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="flex-1 flex flex-col">
        <div className="relative bg-white rounded-[40px] overflow-hidden premium-shadow border border-gray-100 aspect-video flex items-center justify-center">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas ref={canvasRef} className="w-full h-full object-cover" width={640} height={480} />
          
          {!isRunning && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white">
              <div className="w-20 h-20 premium-gradient rounded-full flex items-center justify-center mb-6 animate-pulse">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-2">Head Rotation Flow</h3>
              <p className="opacity-80 max-w-sm mb-8">Slowly rotate your head left and right. Keep your shoulders steady.</p>
              <button 
                onClick={() => setIsRunning(true)}
                className="px-10 py-4 premium-gradient text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
              >
                Start Training
              </button>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full premium-shadow flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-bold text-gray-700">{feedback}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => onComplete({ exercise: ExerciseType.HEAD_MOVEMENT, counter, reward })}
            className="flex-1 py-4 bg-[#2C3E50] text-white rounded-[20px] font-bold hover:bg-black transition-colors"
          >
            Finish Session
          </button>
          <button 
            onClick={onCancel}
            className="px-8 py-4 bg-white text-gray-500 border border-gray-200 rounded-[20px] font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white p-6 rounded-[35px] premium-shadow border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Performance</p>
          <div className="space-y-4">
            <StatRow label="Turns" value={counter} icon="↔️" />
            <StatRow label="XP Earned" value={reward} icon="⭐" />
            <StatRow label="Range" value="85%" icon="📈" />
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">Trainer's Advice:</h4>
          <p className="text-xs text-blue-700 leading-relaxed italic">
            "Don't rush. The goal is a controlled stretch. Imagine you are trying to look behind your shoulder without moving your torso."
          </p>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-semibold text-gray-500">{label}</span>
    </div>
    <span className="text-lg font-bold text-[#2C3E50]">{value}</span>
  </div>
);
