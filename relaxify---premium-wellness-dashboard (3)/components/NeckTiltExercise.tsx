
import React, { useRef, useEffect, useState } from 'react';
import { ExerciseType } from '../types';

interface NeckTiltExerciseProps {
  onComplete: (session: { exercise: ExerciseType; counter: number; reward: number }) => void;
  onCancel: () => void;
}

export const NeckTiltExercise: React.FC<NeckTiltExerciseProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [reward, setReward] = useState(0);
  const [feedback, setFeedback] = useState("Position yourself in the frame to start.");

  // Game state
  const stateRef = useRef({
    lastTilt: null as 'left' | 'right' | null,
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
        // @ts-ignore
        window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, { color: '#38F9D7', lineWidth: 2 });
        // @ts-ignore
        window.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FFFFFF', lineWidth: 1, radius: 2 });

        const landmarks = results.poseLandmarks;
        const leftShoulder = landmarks[11]; // POSE_LANDMARKS.LEFT_SHOULDER
        const rightShoulder = landmarks[12]; // POSE_LANDMARKS.RIGHT_SHOULDER

        if (leftShoulder && rightShoulder) {
          // Logic mirror from the Python code: arctan2(dy, dx)
          const tiltAngle = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
          const tiltAngleDeg = tiltAngle * (180 / Math.PI);
          
          const { history } = stateRef.current;
          history.push(tiltAngleDeg);
          if (history.length > 10) history.shift();
          const smoothTilt = history.reduce((a, b) => a + b, 0) / history.length;

          // Process exercise
          if (smoothTilt > 15) {
            if (stateRef.current.lastTilt !== 'right' && stateRef.current.neutralMaintained) {
              setCounter(prev => prev + 1);
              setReward(prev => prev + 10);
              stateRef.current.lastTilt = 'right';
              stateRef.current.neutralMaintained = false;
              setFeedback("Great! Tilted right.");
            }
          } else if (smoothTilt < -15) {
            if (stateRef.current.lastTilt !== 'left' && stateRef.current.neutralMaintained) {
              setCounter(prev => prev + 1);
              setReward(prev => prev + 10);
              stateRef.current.lastTilt = 'left';
              stateRef.current.neutralMaintained = false;
              setFeedback("Great! Tilted left.");
            }
          } else if (Math.abs(smoothTilt) <= 10) {
            stateRef.current.neutralMaintained = true;
            stateRef.current.lastTilt = null;
            setFeedback("Keep steady in neutral position.");
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
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold mb-2">Ready to Start?</h3>
              <p className="opacity-80 max-w-sm mb-8">Ensure your face and shoulders are clearly visible in the frame.</p>
              <button 
                onClick={() => setIsRunning(true)}
                className="px-10 py-4 premium-gradient text-white rounded-full font-bold shadow-xl hover:scale-105 transition-transform"
              >
                Launch Exercise
              </button>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full premium-shadow flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-bold text-gray-700">{feedback}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => onComplete({ exercise: ExerciseType.NECK_TILT, counter, reward })}
            className="flex-1 py-4 bg-[#2C3E50] text-white rounded-[20px] font-bold hover:bg-black transition-colors"
          >
            Finish & Save
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Real-time Stats</p>
          <div className="space-y-4">
            <StatRow label="Tilts Completed" value={counter} icon="🔄" />
            <StatRow label="Reward Points" value={reward} icon="💎" />
            <StatRow label="Duration" value="02:14" icon="⏱️" />
          </div>
        </div>

        <div className="bg-teal-50 p-6 rounded-[35px] border border-teal-100">
          <h4 className="font-bold text-teal-800 mb-2">How to perform:</h4>
          <ul className="text-xs text-teal-700 space-y-2 leading-relaxed">
            <li>• Sit straight with shoulders relaxed.</li>
            <li>• Slowly tilt your head towards your right shoulder.</li>
            <li>• Return to center, then tilt towards the left.</li>
            <li>• Keep your eyes forward, don't look down.</li>
          </ul>
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
