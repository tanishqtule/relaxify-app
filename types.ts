
export enum ExerciseType {
  NECK_TILT = 'neck_tilt',
  HEAD_MOVEMENT = 'head_movement',
  SHOULDER_SHRUG = 'shoulder_shrug',
  MEDITATION = 'meditation',
  EYE_FOCUS = 'eye_focus',
  ERGO_SCAN = 'ergo_scan'
}

export type MoodState = 'happy' | 'stressed' | 'neutral' | 'tired';

export type AppTab = 'dashboard' | 'exercise' | 'history' | 'meditation' | 'ergo_scan';

export interface UserMonitoring {
  mood: MoodState;
  blinkRate: number; // blinks per minute
  isStrained: boolean;
  lastBlinkTimestamp: number;
  sessionBlinks: number;
  eyeClosureScore: number;
}

export interface ExerciseSession {
  id: string;
  exercise: ExerciseType;
  counter: number;
  reward: number;
  timestamp: string;
  zenArtUrl?: string;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
