/**
 * Centralized API Service
 * All API calls should go through this file for consistency and maintainability
 */

import { UserPreferences } from "@/types";

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
    conversationId: string,
    idToken?: string
  ) => {
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
      text: string;
      conversation: string | null;
      from_user: boolean;
      model_used: string;
      json: Record<string, any>;
      experience_level: string;
    },
    idToken?: string
  ) => {
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

    return response.json();
  },
};

// ============================================================================
// COMBINED API OBJECT (for convenience)
// ============================================================================

const api = {
  user: userAPI,
  conversation: conversationAPI,
  message: messageAPI,
};

export default api;

