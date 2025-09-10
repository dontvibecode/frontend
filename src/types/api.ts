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
  breakdown: string;
  explanation: string;
  recommendedReadings: RecommendedReading[];
  exercises: Exercise[];
}

export interface SubmitRequest {
  message: string;
}

//TODO: required id and title string to save
export interface Session {
  id: string;
  title: string;
  lastActive: string;
}
