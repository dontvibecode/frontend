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

export interface ApiResponse {
  breakdown: string;
  explanation: string;
  recommendedReadings: RecommendedReading[];
  exercises: Exercise[];
}

export interface SubmitRequest {
  message: string;
}

export interface RecentSession extends ApiResponse {
  id: string;
  title: string;
  prompt: string;
  timestamp: string;
  language?: string;
  status: 'completed' | 'in-progress' | 'failed';
}