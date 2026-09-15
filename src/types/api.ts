export interface MessageData {
  id?: number;
  text: string | null;
  created_at: string;
  conversation: number;
  fromUser?: boolean;
  modelUsed: string;
  isSending?: boolean;
  thought?: string;
  json: InstructorResponse | null;
}

export interface RecommendedReading {
  title: string;
  Url: string;
  sourceDescription: string;
  readingTime: number;
}

export interface Exercise {
  filename: string;
  text: string;
  code: string;
}

export interface InstructorResponse {
  lessonTitle?: string;
  offTopic?: boolean;
  offTopicMessage?: string; 
  thought?: string;
  breakdown?: string;
  explanation?: string;
  recommendedReadings?: RecommendedReading[];
  exercises?: Exercise[];
  tags?: string[];
}

export interface SubmitRequest {
  message: string;
}

export interface Conversation {
  id: string;
  tags?: string[];
  title: string;
  lastActive: string;
  pinned: boolean;
  exercises_count?: number;
  exercises_almost_count?: number;
  exercises_correct_count?: number;
}
export const ExperienceLevels = ['Beginner', 'Novice', 'Junior', 'Senior'] as const;

export type ExperienceLevel = typeof ExperienceLevels[number];
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  language?: string;
  profileImage?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  in_app_notifications?: boolean;
  profileVisible?: boolean;
  shareData?: boolean;
  fontSize?: 'small' | 'medium' | 'large';    
  compactMode?: boolean;
  tab_size?: number; // 1-8
  voiceEnabled?: boolean;
  voiceId?: string;
  speechRate?: number;
}

/** Matches the `Preferences.tab_size` default in the Django model. */
export const DEFAULT_TAB_SIZE = 4;

export interface User {
  id: number;
  username: string;
  email: string;
  preferences?: UserPreferences;
  tokens?: number;
  membership: "free" | "pro";
  subscriptionActive?: boolean | null;
  membershipExpiresAt?: string | null;
}

export interface TokenData {
  token_used: number;
  token_limit: number;
}

export type SpeechScope = "summary" | "full";

/** When one spoken line starts, in seconds from the start of the audio. */
export interface SpeechMark {
  field: string;
  line: number;
  start: number;
}

/** One spoken line, for the browser's voice to read when ElevenLabs can't. */
export interface SpeechUnit {
  field: string;
  line: number;
  text: string;
}

export interface SpeechVoice {
  id: string;
  name: string;
  description: string;
  preview_url: string | null;
}

export interface SpeechVoicesResponse {
  available: boolean;
  voices: SpeechVoice[];
  default_voice_id: string | null;
}

export type SpeechClipResult =
  | {
      kind: "audio";
      url: string;
      duration: number | null;
      marks: SpeechMark[];
      voiceId: string;
      cached: boolean;
    }
  | { kind: "browser"; reason: string; units: SpeechUnit[] };
