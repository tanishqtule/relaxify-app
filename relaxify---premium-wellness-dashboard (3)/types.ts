
export enum ExerciseType {
  NECK_TILT = 'neck_tilt',
  HEAD_MOVEMENT = 'head_movement',
  SHOULDER_SHRUG = 'shoulder_shrug'
}

export interface ExerciseSession {
  id: string;
  exercise: ExerciseType;
  counter: number;
  reward: number;
  timestamp: string;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}
