/**
 * Centralized API Service
 * All API calls should go through this file for consistency and maintainability
 */

import {
  InstructorResponse,
  MessageData,
  SpeechClipResult,
  SpeechScope,
  SpeechVoicesResponse,
  UserPreferences,
} from "@/types";
import { triggerTokenWarning } from "@/app/components/TokenWarningModal";
import { notifyTokenBalanceChanged } from "@/lib/tokenBalanceEvents";

// Call sites below append `api/...`, so normalise to exactly one trailing slash
// regardless of how NEXT_PUBLIC_API_URL happens to be set.
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = API_ORIGIN.endsWith('/') ? API_ORIGIN : API_ORIGIN + '/';

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = (idToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // "Access-Control-Request-Headers": "*",
  };

  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  return headers;
};

/**
 * Check if response contains insufficient tokens warning
 * Shows the modal and returns true if warning detected
 */
const checkForTokenWarning = (data: any): boolean => {
  if (data && data.warning === "Insufficient tokens") {
    triggerTokenWarning();
    return true;
  }
  return false;
};

/**
 * Parse JSON response and check for token warning
 * Returns null if token warning detected (caller should handle gracefully)
 */
const parseJsonWithWarningCheck = async (response: Response): Promise<any> => {
  const data = await response.json();
  if (checkForTokenWarning(data)) {
    return null;
  }
  return data;
};

/**
 * Helper function to handle API errors
 * Returns true if it was a token warning (no error thrown), throws otherwise
 */
const handleApiError = async (response: Response, context: string): Promise<boolean> => {
  const errorData = await response.json().catch(() => ({}));
  
  if (checkForTokenWarning(errorData)) {
    // Don't throw - just show modal and return true to indicate token warning
    return true;
  }
  
  const error: any = new Error(`${context}: ${response.status}`);
  error.response = { data: errorData };
  error.status = response.status;
  throw error;
};

/**
 * Transform user preferences from snake_case (backend) to camelCase (frontend)
 */
const transformPreferencesToCamelCase = (prefs: any): UserPreferences | undefined => {
  if (!prefs) return undefined;
  return {
    theme: prefs.theme,
    accentColor: prefs.accent_color,
    language: prefs.language,
    profileImage: prefs.profile_image,
    email_notifications: prefs.email_notifications,
    push_notifications: prefs.push_notifications,
    in_app_notifications: prefs.in_app_notifications,
    profileVisible: prefs.profile_visible,
    shareData: prefs.share_data,
    fontSize: prefs.font_size,
    compactMode: prefs.compact_mode,
    tab_size: prefs.tab_size,
    voiceEnabled: prefs.voice_enabled,
    voiceId: prefs.voice_id,
    speechRate: prefs.speech_rate,
  };
};

/**
 * Transform user preferences from camelCase (frontend) to snake_case (backend)
 */
const transformPreferencesToSnakeCase = (prefs: UserPreferences | undefined): any => {
  if (!prefs) return undefined;
  return {
    theme: prefs.theme,
    accent_color: prefs.accentColor,
    language: prefs.language,
    profile_image: prefs.profileImage,
    email_notifications: prefs.email_notifications,
    push_notifications: prefs.push_notifications,
    in_app_notifications: prefs.in_app_notifications,
    profile_visible: prefs.profileVisible,
    share_data: prefs.shareData,
    font_size: prefs.fontSize,
    compact_mode: prefs.compactMode,
    tab_size: prefs.tab_size,
    voice_enabled: prefs.voiceEnabled,
    voice_id: prefs.voiceId,
    speech_rate: prefs.speechRate,
  };
};

/**
 * Transform user response from backend to frontend format
 */
const transformUserResponse = (data: any): import("@/types").User => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    preferences: transformPreferencesToCamelCase(data.preferences),
    membership: data.membership,
    subscriptionActive: data.subscription_active,
    membershipExpiresAt: data.membership_expires_at,
  };
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
   * Get the authenticated user
   */
  getUser: async (idToken?: string): Promise<import("@/types").User> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/user/`,
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

    const data = await response.json();
    return transformUserResponse(data);
  },

  /**
   * Update the authenticated user
   */
  updateUser: async (
    updatedUserData: {
      username?: string;
      preferences?: UserPreferences;
    },
    idToken?: string
  ): Promise<import("@/types").User> => {
    // Transform preferences to snake_case for the backend
    const backendData = {
      ...updatedUserData,
      preferences: transformPreferencesToSnakeCase(updatedUserData.preferences),
    };

    const response = await fetch(
      `${API_BASE_URL}api/chat/user/`,
      {
        method: "PUT",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(backendData),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to update user");
      if (isTokenWarning) return null as any;
    }

    const data = await response.json();
    return transformUserResponse(data);
  },

  /**
   * Get the authenticated user's token balance
   */
  getTokenBalance: async (idToken?: string): Promise<{ token_used: number; token_limit: number } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/token/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get token usage");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },
};

// ============================================================================
// CONVERSATION API
// ============================================================================

export const conversationAPI = {
  /**
   * Get all conversations for the authenticated user
   */
  getConversations: async (idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/conversations/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get conversations");
      if (isTokenWarning) return [];
    }

    return parseJsonWithWarningCheck(response) ?? [];
  },

  /**
   * Get all bookmarked exercises for the authenticated user
   */
  getBookmarkedExercises: async (idToken?: string) => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/bookmarks/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get bookmarked exercises");
      if (isTokenWarning) return [];
    }

    return parseJsonWithWarningCheck(response) ?? [];
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
      const isTokenWarning = await handleApiError(response, "Failed to get conversation messages");
      if (isTokenWarning) return [];
    }

    const responseJson = await response.json();
    if (checkForTokenWarning(responseJson)) return [];
    
    return responseJson.map((msg: any) => ({
      id: msg.id,
      created_at: msg.created_at,
      text: msg.text,
      conversation: msg.conversation,
      fromUser: msg.from_user,
      modelUsed: msg.model_used,
      thought: msg.thought,
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
      const isTokenWarning = await handleApiError(response, "Failed to delete conversation");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
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
      const isTokenWarning = await handleApiError(response, "Failed to pin conversation");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },
};

// ============================================================================
// MESSAGE API
// ============================================================================

export const messageAPI = {
  /**
   * Send a message with real-time streaming of AI thoughts
   */
  sendMessageStreaming: async (
    messageData: {
      text: string;
      conversation: number | null;
      experience_level: string;
    },
    onEvent: (event: StreamEvent) => void,
    idToken?: string
  ): Promise<MessageData | null> => {
    const response = await fetch(`${API_BASE_URL}api/chat/message/stream/`, {
      method: 'POST',
      headers: getAuthHeaders(idToken),
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to send message");
      if (isTokenWarning) return null;
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
              
              // Check for token warning in stream data - return null silently
              if (event.data && typeof event.data === 'object' && (event.data as any).warning === 'Insufficient tokens') {
                triggerTokenWarning();
                notifyTokenBalanceChanged();
                return null;
              }
              
              onEvent(event);

              if (event.stage === 'complete' && event.data) {
                const responseJson = event.data as any;
                const instructorData = responseJson.json
                  ? {
                      lessonTitle: responseJson.json.lesson_title,
                      thought: responseJson.json.thought,
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
                  thought: responseJson.thought,
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

    notifyTokenBalanceChanged();
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

// ============================================================================
// UPLOAD API
// ============================================================================

export interface UploadUrlResponse {
  upload_url: string;
  public_url: string;
  filename: string;
  expires_in: number;
}

export const uploadAPI = {
  /**
   * Get a signed URL for uploading a profile image
   */
  getProfileImageUploadUrl: async (
    contentType: string,
    idToken?: string
  ): Promise<UploadUrlResponse | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/upload/profile-image-url/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify({ content_type: contentType }),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get upload URL");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },

  /**
   * Upload a file directly to object storage using a signed URL
   */
  uploadToSignedUrl: async (uploadUrl: string, file: File): Promise<void> => {
    let response: Response;
    try {
      response = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
    } catch (error) {
      // This PUT goes straight to the storage bucket, so fetch rejecting means
      // the browser never got a usable response: almost always the bucket's
      // CORS policy not listing this origin. "Failed to fetch" alone sends
      // people looking at the backend, which is not involved in this step.
      console.error(
        `Direct upload to storage failed. Check that the bucket's CORS policy allows ${window.location.origin}.`,
        error,
      );
      throw new Error("Couldn't reach image storage from this site.");
    }

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.status}`);
    }
  },

  /**
   * Confirm the profile image upload and update user preferences
   */
  confirmProfileImageUpload: async (
    publicUrl: string,
    idToken?: string
  ): Promise<{ profile_image: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/upload/profile-image-confirm/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify({ public_url: publicUrl }),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to confirm upload");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },
};

// ============================================================================
// EXERCISE API
// ============================================================================

export const exerciseAPI = {
  /**
   * Get all exercises for a message
   */
  getExercises: async (
    messageId: number,
    idToken?: string
  ): Promise<GetExercisesResponse | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/${messageId}/`,
      {
        method: "GET",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get exercises");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },

  /**
   * Get new exercises for a message
   */
  getNewExercise: async (
    messageId: number,
    abilityLevel: string,
    idToken?: string
  ): Promise<NewExerciseResponse | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/new/${messageId}/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify({ ability_level: abilityLevel }),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to get new exercise");
      if (isTokenWarning) return null;
    }

    const data = await parseJsonWithWarningCheck(response);
    notifyTokenBalanceChanged();
    return data;
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
  ): Promise<ExerciseSubmissionResponse | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/submit/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(submissionData),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to submit exercise");
      if (isTokenWarning) return null;
    }

    const data = await parseJsonWithWarningCheck(response);
    notifyTokenBalanceChanged();
    return data;
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
      const isTokenWarning = await handleApiError(response, "Failed to save code progress");
      if (isTokenWarning) return;
    }

    await parseJsonWithWarningCheck(response);
  },

  /**
   * Bookmark an exercise
   */
  bookmarkExercise: async (
    exerciseId: number,
    idToken?: string
  ): Promise<BookmarkExerciseResponse | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/exercise/bookmark/${exerciseId}/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to bookmark exercise");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },
}
// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentAPI = {
  /**
   * Create a subscription and get the client_secret for Stripe Elements
   */
  createSubscription: async (
    idToken?: string
  ): Promise<{ subscription_id: string; client_secret: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/subscribe/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to create subscription:", errorData);
      const isTokenWarning = await handleApiError(response, "Failed to create subscription");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },

  /**
   * Create a one-time token purchase and get the client_secret for Stripe Elements
   */
  buyTokens: async (
    data: { token_amount: 200000 },
    idToken: string
  ): Promise<{ client_secret: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/tokens/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to create token purchase");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },

  /**
   * Cancel the user's Pro subscription at period end
   */
  cancelSubscription: async (
    idToken?: string
  ): Promise<{ status: string; message: string; active_until: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/cancel/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to cancel subscription");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  },

  /**
   * Resume a cancelled Pro subscription (if still within the current billing period)
   */
  resumeSubscription: async (
    idToken?: string
  ): Promise<{ status: string; message: string; active_until: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/resume/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to resume subscription");
      if (isTokenWarning) return null;
    }
    return parseJsonWithWarningCheck(response);
  },

  /**
   * Create a SetupIntent to save a new payment method
   */
  createSetupIntent: async (
    idToken?: string
  ): Promise<{ client_secret: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/setup-intent/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to create setup intent");
      if (isTokenWarning) return null;
    }
    return parseJsonWithWarningCheck(response);
  },

  /**
   * Update the subscription's default payment method
   */
  updatePaymentMethod: async (
    paymentMethodId: string,
    idToken?: string
  ): Promise<{ status: string; message: string } | null> => {
    const response = await fetch(
      `${API_BASE_URL}api/chat/payments/update-method/`,
      {
        method: "POST",
        headers: getAuthHeaders(idToken),
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
      }
    );

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to update payment method");
      if (isTokenWarning) return null;
    }
    return parseJsonWithWarningCheck(response);
  },
};

export const feedbackAPI = {
  /**
   * Send user feedback to the backend
   **/
  sendFeedback: async (
    email: string,
    message: string,
    idToken?: string,
  ): Promise<{ message: string } | null> => {
    const response = await fetch(`${API_BASE_URL}api/chat/feedback/`, {
      method: "POST",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({ email, message }),
    })

    if (!response.ok) {
      const isTokenWarning = await handleApiError(response, "Failed to cancel subscription");
      if (isTokenWarning) return null;
    }

    return parseJsonWithWarningCheck(response);
  }
}
// ============================================================================
// SPEECH API
// ============================================================================

export const speechAPI = {
  /**
   * Voices the picker may offer, and whether premium voices work at all
   */
  getVoices: async (idToken?: string): Promise<SpeechVoicesResponse> => {
    const response = await fetch(`${API_BASE_URL}api/chat/speech/voices/`, {
      method: "GET",
      headers: getAuthHeaders(idToken),
    });

    if (!response.ok) {
      throw new Error(`Failed to get voices: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Narration for one message. Resolves to playable audio or, when premium
   * audio can't be served (no key, allowance used up, text too long), to the
   * prepared text for the browser's own voice. Throws for anything else.
   */
  getClip: async (
    messageId: number,
    scope: SpeechScope,
    idToken?: string
  ): Promise<SpeechClipResult> => {
    const response = await fetch(`${API_BASE_URL}api/chat/speech/${messageId}/`, {
      method: "POST",
      headers: getAuthHeaders(idToken),
      body: JSON.stringify({ scope }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      return {
        kind: "audio",
        url: data.url,
        duration: data.duration,
        marks: data.marks ?? [],
        voiceId: data.voice_id,
        cached: data.cached,
      };
    }
    if (Array.isArray(data.units) && data.units.length > 0) {
      return { kind: "browser", reason: data.error, units: data.units };
    }

    const error: any = new Error(`Failed to get narration: ${response.status}`);
    error.response = { data };
    error.status = response.status;
    throw error;
  },
};

// ============================================================================
// COMBINED API OBJECT (for convenience)
// ============================================================================

const api = {
  user: userAPI,
  conversation: conversationAPI,
  message: messageAPI,
  exercise: exerciseAPI,
  upload: uploadAPI,
  payment: paymentAPI,
  feedback: feedbackAPI,
  speech: speechAPI,
};

export default api;
