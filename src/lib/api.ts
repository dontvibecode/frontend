/**
 * Centralized API Service
 * All API calls should go through this file for consistency and maintainability
 */

import { InstructorResponse, MessageData, UserPreferences } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dontvibecode.uc.r.appspot.com/';

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = (idToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Request-Headers": "*",
  };

  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  return headers;
};

/**
 * Helper function to handle API errors
 */
const handleApiError = async (response: Response, context: string) => {
  const errorData = await response.json().catch(() => ({}));
  const error: any = new Error(`${context}: ${response.status}`);
  error.response = { data: errorData };
  error.status = response.status;
  throw error;
};

// Add this type above the messageAPI object
export type StreamStage = 
  | 'routing' 
  | 'routing_thought' 
  | 'instructor' 
  | 'instructor_thought' 
  | 'complete' 
  | 'error';

export interface StreamEvent {
  stage: StreamStage;
  data: string | MessageData | null;
}

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  /**
   * Get user by email
   */
  getUser: async (email: string, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/user/${email}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(`Failed to get user: ${response.status}`);
      error.response = { data: errorData };
      throw error;
    }

    return response.json();
  },

  /**
   * Create a new user
   */
  createUser: async (
    userData: {
      username: string;
      email: string;
      method: string;
    },
    idToken?: string
  ) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/user/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to create user");
    }

    return response.json();
  },

  /**
   * Update user
   */
  updateUser: async (
    email: string,
    updatedUserData: {
      username?: string;
      email?: string;
      method?: string;
      preferences?: UserPreferences;
    },
    idToken?: string
  ) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/user/${email}/`,
      {
        method: "PUT",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(updatedUserData),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to update user");
    }

    return response.json();
  },

  /**
   * Get user token usage
   */
  getTokenUsage: async (email: string, idToken?: string): Promise<{ token_used: number; token_limit: number }> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/token/${email}`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get token usage");
    }

    return response.json();
  },
};

// ============================================================================
// CONVERSATION API
// ============================================================================

export const conversationAPI = {
  /**
   * Get all conversations for a user
   */
  getConversations: async (email: string, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/${email}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get conversations");
    }

    return response.json();
  },

  /**
   * Get all bookmarked exercises for a user
   */
  getBookmarkedExercises: async (email: string, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/bookmark/${email}`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get bookmarked exercises");
    }

    return response.json();
  },

  /**
   * Get a specific conversation by ID
   */
  getConversationById: async (conversationId: string, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/${conversationId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get conversation");
    }

    return response.json();
  },

  /**
   * Get all messages in a conversation
   */
  getConversationMessages: async (
    conversationId: number,
    idToken?: string
  ): Promise<MessageData[]> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/messages/${conversationId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get conversation messages");
    }

    const responseJson = await response.json();
    
    return responseJson.map((msg: any) => ({
      id: msg.id,
      created_at: msg.created_at,
      text: msg.text,
      conversation: msg.conversation,
      fromUser: msg.from_user,
      modelUsed: msg.model_used,
      json: msg.json ? {
        lessonTitle: msg.json.lesson_title,
        breakdown: msg.json.breakdown,
        explanation: msg.json.explanation,
        recommendedReadings: msg.json.recommendedReadings,
        exercises: msg.json.exercises,
        tags: msg.json.tags,
      } as InstructorResponse : {},
    })) as MessageData[];
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId: number, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/delete/${conversationId}/`,
      {
        method: "DELETE",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to delete conversation");
    }

    return response.json();
  },

  /**
   * Pin a conversation
   */
  pinConversation: async (conversationId: number, idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/pin/${conversationId}/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to pin conversation");
    }

    return response.json();
  },
};

// ============================================================================
// MESSAGE API
// ============================================================================

export const messageAPI = {
  /**
   * Send a new message
   */
  sendMessage: async (
    messageData: {
      created_at: string;
      text: string;
      conversation: number | null;
      from_user: boolean;
      model_used: string;
      json: Record<string, any>;
      experience_level: string;
    },
    idToken?: string
  ): Promise<MessageData> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/message/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to send message");
    }

    const responseJson = await response.json();
    
    const instructorData = responseJson.json ? 
      {
        lessonTitle: responseJson.json.lesson_title,
        breakdown: responseJson.json.breakdown,
        explanation: responseJson.json.explanation,
        recommendedReadings: responseJson.json.recommendedReadings,
        exercises: responseJson.json.exercises,
        tags: responseJson.json.tags,
      } as InstructorResponse
    : {};

    // For the sake of consistency, we use CamelCase in the frontend and snake_case in the backend
    const message: MessageData = {
      id: responseJson.id,
      created_at: responseJson.created_at,
      text: responseJson.text,
      conversation: responseJson.conversation,
      fromUser: responseJson.from_user,
      modelUsed: responseJson.model_used,
      isSending: responseJson.is_sending,
      json: instructorData,
    }
    return message;
  },

  /**
   * Send a message with real-time streaming of AI thoughts
   */
  sendMessageStreaming: async (
    messageData: {
      created_at: string;
      text: string;
      conversation: number | null;
      from_user: boolean;
      model_used: string;
      json: Record<string, unknown>;
      experience_level: string;
    },
    onEvent: (event: StreamEvent) => void,
    idToken?: string
  ): Promise<MessageData> => {
    const response = await fetch(`${API_BASE_URL}api/chat/message/stream/`, {
      method: 'POST',
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      await handleApiError(response, "Failed to send message");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let finalMessage: MessageData | null = null;
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const eventText of events) {
        if (!eventText.trim()) continue;

        const lines = eventText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              onEvent(event);

              if (event.stage === 'complete' && event.data) {
                const responseJson = event.data as any;
                const instructorData = responseJson.json
                  ? {
                      lessonTitle: responseJson.json.lesson_title,
                      breakdown: responseJson.json.breakdown,
                      explanation: responseJson.json.explanation,
                      recommendedReadings: responseJson.json.recommendedReadings,
                      exercises: responseJson.json.exercises,
                      tags: responseJson.json.tags,
                    } as InstructorResponse
                  : {};

                finalMessage = {
                  id: responseJson.id,
                  created_at: responseJson.created_at,
                  text: responseJson.text,
                  conversation: responseJson.conversation,
                  fromUser: responseJson.from_user,
                  modelUsed: responseJson.model_used,
                  isSending: false,
                  json: instructorData,
                };
              }

              if (event.stage === 'error') {
                throw new Error(event.data as string);
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', line, e);
            }
          }
        }
      }
    }

    if (!finalMessage) {
      throw new Error('Stream ended without complete message');
    }

    return finalMessage;
  }, 
};

// ============================================================================
// EXERCISE API
// ============================================================================

export interface NewExerciseResponse {
  exercises: {
    filename: string;
    text: string;
    code: string;
  }[];
}

export interface ExerciseFile {
  exercise: string;
  filename: string;
  text: string;
  code: string;
  user_submission: string;
}

export interface ExerciseData {
  correctness: 0 | 1 | 2 | null;
  files: ExerciseFile[];
}

export interface GetExercisesResponse {
  [exerciseId: string]: ExerciseData;
}

export interface ExerciseSubmissionResponse {
  correctness: 0 | 1 | 2;
  heading: string;
  summary: string;
  corrections: {
    diffs: {
      headline: string;
      incorrect_code: string;
      correct_code: string;
      comment: string;
    }[];
    statements: string[];
  };
}

export interface BookmarkExerciseResponse {
  id: number;
  message: number;
  correctness: number;
  bookmarked: boolean;
  title: string;
  tags: string[];
}

export const exerciseAPI = {
  /**
   * Get all exercises for a message
   */
  getExercises: async (
    messageId: number,
    idToken?: string
  ): Promise<GetExercisesResponse> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/${messageId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get exercises");
    }

    return response.json();
  },

  /**
   * Get new exercises for a message
   */
  getNewExercise: async (
    messageId: number,
    abilityLevel: string,
    idToken?: string
  ): Promise<NewExerciseResponse> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/new/${messageId}`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify({ ability_level: abilityLevel }),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to get new exercise");
    }

    return response.json();
  },

  /**
   * Submit an exercise attempt for marking
   */
  submitExercise: async (
    submissionData: {
      ability_level: string;
      message_id: number;
      exercise_id: number;
      exercise_file_ids: number[];
      user_submissions: string[];
    },
    
    idToken?: string
  ): Promise<ExerciseSubmissionResponse> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/submit/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(submissionData),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to submit exercise");
    }

    return response.json();
  },

  /**
   * Save code progress
   */
  saveCodeProgress: async (submissionData: {
      user_submissions: string[];
      exercise_file_ids: number[];
    },
    idToken?: string
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/save/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(submissionData),
      })

    if (!response.ok) {
      await handleApiError(response, "Failed to save code progress");
    }

    return response.json();
  },

  /**
   * Bookmark an exercise
   */
  bookmarkExercise: async (
    exerciseId: number,
    idToken?: string
  ): Promise<BookmarkExerciseResponse> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/bookmark/${exerciseId}`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      await handleApiError(response, "Failed to bookmark exercise");
    }

    return response.json();
  },
}
// ============================================================================
// COMBINED API OBJECT (for convenience)
// ============================================================================

const api = {
  user: userAPI,
  conversation: conversationAPI,
  message: messageAPI,
  exercise: exerciseAPI,
};

export default api;

