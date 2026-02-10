
import React, { useEffect, useRef } from 'react';
import { UserMonitoring, MoodState } from '../types';

interface MoodTrackerProps {
  onUpdate: (data: UserMonitoring) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const lastBlinkRef = useRef(Date.now());
  const totalBlinksRef = useRef(0);
  const blinkBuffer = useRef<number[]>([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
    let isClosed = false;

    // @ts-ignore
    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    faceMesh.onResults((results: any) => {
      if (isClosed) return;
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // standard EAR-like calculation
        // Left eye: 159 (top), 145 (bottom), 33 (outer), 133 (inner)
        const leftTop = landmarks[159];
        const leftBot = landmarks[145];
        const leftOuter = landmarks[33];
        const leftInner = landmarks[133];
        
        const earL = Math.abs(leftTop.y - leftBot.y) / Math.abs(leftOuter.x - leftInner.x);
        
        // Right eye: 386 (top), 374 (bottom), 263 (outer), 362 (inner)
        const rightTop = landmarks[386];
        const rightBot = landmarks[374];
        const rightOuter = landmarks[263];
        const rightInner = landmarks[362];
        
        const earR = Math.abs(rightTop.y - rightBot.y) / Math.abs(rightOuter.x - rightInner.x);
        const avgEar = (earL + earR) / 2;

        const isBlinking = avgEar < 0.12; 

        if (isBlinking && (Date.now() - lastBlinkRef.current > 300)) {
          totalBlinksRef.current++;
          blinkBuffer.current.push(Date.now());
          lastBlinkRef.current = Date.now();
        }

        // Clean up old blinks (older than 60 seconds)
        const now = Date.now();
        blinkBuffer.current = blinkBuffer.current.filter(t => now - t < 60000);

        frameCountRef.current++;
        if (frameCountRef.current > 30) { // Update stats every secondish
          const browInnerDist = Math.abs(landmarks[55].y - landmarks[1].y) + Math.abs(landmarks[285].y - landmarks[1].y);
          const lipCurvature = landmarks[14].y - (landmarks[61].y + landmarks[291].y) / 2;
          
          let mood: MoodState = 'neutral';
          if (browInnerDist < 0.042) mood = 'stressed';
          else if (lipCurvature < -0.012) mood = 'happy';

          // Strain logic: average blinks per minute for adults is 15-20. 
          // If < 8, likely staring/strained.
          const currentBPM = blinkBuffer.current.length;
          const isStrained = currentBPM < 8 && (now - lastBlinkRef.current > 8000);
          
          onUpdate({
            mood,
            blinkRate: currentBPM,
            isStrained,
            lastBlinkTimestamp: lastBlinkRef.current,
            sessionBlinks: totalBlinksRef.current,
            eyeClosureScore: Math.round(avgEar * 100)
          });
          
          frameCountRef.current = 0;
        }
      }
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (!isClosed) {
          try {
            await faceMesh.send({ image: videoRef.current });
          } catch (e) {}
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    return () => {
      isClosed = true;
      camera.stop();
      faceMesh.close();
    };
  }, []);

  return null; 
};
