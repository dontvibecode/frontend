export interface MessageData {
  id?: number;
  text: string | null;
  conversation: number;
  fromUser?: boolean;
  modelUsed: string;
  isSending?: boolean;
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
  tab_size?: number; // 1-8, default 2
}

export interface User {
  id: number;
  username: string;
  email: string;
  preferences?: UserPreferences;
  tokens?: number;
}