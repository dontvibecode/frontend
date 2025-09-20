export interface MessageData {
  text: string | null;
  conversation: number;
  fromUser: boolean;
  modelUsed: string;
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
  offTopic?: boolean;
  offTopicMessage?: string;
  breakdown?: string;
  explanation?: string;
  recommendedReadings?: RecommendedReading[];
  exercises?: Exercise[];
}

export interface SubmitRequest {
  message: string;
}

export interface Session {
  id: string;
  title: string;
  lastActive: string;
}

export interface UserPreferences {
  name?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  language?: string;
  profileImage?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
  };
  privacy?: {
    profileVisible?: boolean;
    shareData?: boolean;
  };
  display?: {
    fontSize?: 'small' | 'medium' | 'large';
    compactMode?: boolean;
  };
}