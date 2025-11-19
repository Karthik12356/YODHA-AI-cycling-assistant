
export enum ScreenMode {
  DASHBOARD = 'DASHBOARD',
  MAP = 'MAP',
  STATS = 'STATS',
  ASSISTANT = 'ASSISTANT',
  SETTINGS = 'SETTINGS'
}

export interface RideData {
  startTime: number | null;
  duration: number; // seconds
  distance: number; // km
  currentSpeed: number; // km/h
  maxSpeed: number;
  calories: number;
  isPaused: boolean;
}

export interface BatteryState {
  level: number; // 0-100
  isCharging: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'yodha';
  text: string;
  timestamp: number;
}

export enum VoiceGender {
  MALE = 'male',
  FEMALE = 'female'
}

export interface UserSettings {
  speedLimit: number; // km/h
  enableFallDetection: boolean;
  emergencyContact: string;
  userName: string;
}
