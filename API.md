# API Documentation

This document provides a comprehensive reference for all available API endpoints.

> **Base URL**: All endpoints are prefixed with `BASE_URL/api/chat/`

---

## Table of Contents

- [Messages](#messages)
  - [Send Message (Streaming)](#send-message-streaming)
  - [Get Conversation Messages](#get-conversation-messages)
- [Conversations](#conversations)
  - [Get User Conversations](#get-user-conversations)
  - [Pin/Unpin Conversation](#pinunpin-conversation)
  - [Delete Conversation](#delete-conversation)
- [Users](#users)
  - [Get User](#get-user)
  - [Update User](#update-user)
- [Exercises](#exercises)
  - [Get Exercises](#get-exercises)
  - [Submit Exercise](#submit-exercise)
  - [Generate New Exercise](#generate-new-exercise)
  - [Save Exercise Progress](#save-exercise-progress)
  - [Get Bookmarked Exercises](#get-bookmarked-exercises)
  - [Toggle Exercise Bookmark](#toggle-exercise-bookmark)
  - [Get Exercise Aggregates](#get-exercise-aggregates)
- [Tokens](#tokens)
  - [Get Token Balance](#get-token-balance)
  - [Get Token Usage History](#get-token-usage-history)
- [File Upload](#file-upload)
  - [Get Profile Image Upload URL](#get-profile-image-upload-url)
  - [Confirm Profile Image Upload](#confirm-profile-image-upload)
- [Payments](#payments)
  - [Create Subscription](#create-subscription)
  - [Buy Tokens](#buy-tokens)
  - [Cancel Subscription](#cancel-subscription)
  - [Stripe Webhook](#stripe-webhook)
- [Type Definitions](#type-definitions)

---

## Messages

### Send Message (Streaming)

Sends a user message to the AI and streams back real-time progress updates including the AI's thought process. Unlike the non-streaming endpoint, this returns **multiple events over time** instead of a single response.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/message/stream/` |
| **Method** | `POST` |

**Request Body**

```typescript
{
  text: string;                                              // Content of user prompt
  conversation: number | null;                               // Existing conversation, or null to create one
  experience_level: "Beginner" | "Novice" | "Junior" | "Senior";
}
```

**Response**

If message count limit for conversation reached:

```json
{ "warning": "Conversation message count limit reached" }
```

If insufficient tokens left:

```json
{ "warning": "Insufficient tokens" }
```

Otherwise, a stream of newline-separated JSON events:

```
data: {"stage": "routing", "data": null}

data: {"stage": "routing_thought", "data": "Let me analyze this question..."}

data: {"stage": "routing_thought", "data": "The user wants to learn about React hooks..."}

data: {"stage": "instructor", "data": null}

data: {"stage": "instructor_thought", "data": "I should create an exercise about useState..."}

data: {"stage": "complete", "data": {MessageData object}}
```

**Event Schema**

```typescript
interface StreamEvent {
  stage: "routing" | "routing_thought" | "instructor" | "instructor_thought" | "complete" | "error";
  data: string | MessageData | null;
}
```

**Stage Reference**

| Stage | Description | Data Type |
|-------|-------------|-----------|
| `routing` | Router prompt started | `null` |
| `routing_thought` | AI's thought during routing | `string` (thought text) |
| `instructor` | Instructor prompt started | `null` |
| `instructor_thought` | AI's thought during lesson generation | `string` (thought text) |
| `complete` | Processing finished | `Message` object |
| `error` | An error occurred | `string` (error message) |

**Final Message Object** (same as non-streaming response)

```typescript
{
  id: number;
  text: string;
  conversation: number;
  from_user: boolean;
  model_used: string;
  json: InstructorResponse | null;
}
```

---

### Get Conversation Messages

Fetch a list of all messages in a given conversation.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/conversations/messages/<conversation_id>/` |
| **Method** | `GET` |

**Response**

```typescript
{
  id: number;
  text: string | null;
  conversation: number;
  from_user: boolean;
  model_used: string;
  json: {
    lesson_title: string;
    breakdown: string;
    explanation: string;
    recommendedReadings: {
      title: string;
      url: string;
      sourceDescription: string;
      readingTime: string;
    }[];
    exercise_title: string;
    exercise_tags: string;
    exercises: {
      filename: string;
      text: string;
      code: string;
    }[];
    tags: string[];
  } | null;
}[]
```

---

## Conversations

### Get User Conversations

Get all conversations owned by the authenticated user.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/conversations/` |
| **Method** | `GET` |

**Response**

```typescript
{
  id: string;
  user: string;
  title: string;
  last_active: string;
  pinned: boolean;
  created_at: string;
  tags: string[];
  exercises_count: number;
  exercises_almost_count: number;
  exercises_correct_count: number;
}[]
```

---

### Pin/Unpin Conversation

Toggle the `pinned` field for a conversation.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/conversations/pin/<id>/` |
| **Method** | `POST` |

**Response**

```typescript
{
  id: string;
  user: string;
  title: string;
  last_active: string;
  pinned: boolean;
  created_at: string;
  tags: string[];
  exercises_count: number;
  exercises_almost_count: number;
  exercises_correct_count: number;
}
```

---

### Delete Conversation

Delete a conversation.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/conversations/delete/<id>/` |
| **Method** | `DELETE` |

**Response**

```json
{
  "message": "Conversation deleted successfully."
}
```

---

## Users

### Get User

Fetch the authenticated user along with their preferences.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/user/` |
| **Method** | `GET` |

**Response**

```typescript
User
```

See [User](#user) type definition.

---

### Update User

Edit the authenticated user's username or preferences.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/user/` |
| **Method** | `PUT` |

**Request Body**

```typescript
{
  username?: string;                                         // New username for the user
  preferences?: {
    theme?: 'light' | 'dark' | 'system';                     // Default = 'light'
    accentColor?: string;                                    // Default = 'blue'
    language?: string;                                       // Default = 'en'
    profileImage?: string;                                   // URL for the profile image
    email_notifications?: boolean;                           // Default = true
    push_notifications?: boolean;                            // Default = true
    in_app_notifications?: boolean;                          // Default = true
    profileVisible?: boolean;                                // Default = true
    shareData?: boolean;                                     // Default = false
    fontSize?: 'small' | 'medium' | 'large';                 // Default = 'medium'
    compactMode?: boolean;                                   // Default = false
  };
}
```

**Response**

```typescript
User
```

See [User](#user) type definition.

---

## Exercises

### Get Exercises

Fetches all exercises and their related files for the given `message_id`.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/<message_id>/` |
| **Method** | `GET` |

**Response**

```typescript
{
  [exercise_id: string]: {
    correctness: number | null;                              // 0, 1 or 2, or null if not marked yet
    files: {
      exercise: string;                                      // ID of the exercise (redundant)
      filename: string;
      text: string;
      code: string;                                          // Original exercise code
      user_submission: string;                               // Most recent saved user response for this exercise file
    }[];
  };
}
```

---

### Submit Exercise

Submits an attempt at an exercise, so that the AI can mark it and give feedback.

> **Note**: `user_submissions` should be in the exact order matching `exercise_file_ids`.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/submit/` |
| **Method** | `POST` |

**Request Body**

```typescript
{
  ability_level: string;                                     // Whatever the user has it set to
  message_id: number;                                        // The ID of the AI message that contains the lesson content
  exercise_id: number;                                       // The ID of the exercise that has been attempted
  exercise_file_ids: number[];                               // Array of IDs for the exercise files in the submitted exercise
  user_submissions: string[];                                // Array of submitted code files as long strings, in the exact order corresponding to exercise_file_ids
}
```

**Response**

If insufficient tokens left:

```json
{ "warning": "Insufficient tokens" }
```

Otherwise:

```typescript
{
  correctness: number;                                       // Integer (0, 1, or 2). The assessment score: 0 for Incorrect (fundamental errors), 1 for Partially Correct (logic errors/incomplete), or 2 for Correct (working solution)
  heading: string;                                           // A short, engaging title displayed at the top of the feedback UI (e.g., 'You're on the right track!' or 'Excellent work!')
  summary: string;                                           // A comprehensive overview (1-3 paragraphs) acknowledging effort, explaining the assessment, and providing actionable next steps
  corrections: {
    diffs: {
      headline: string;                                      // A concise title for a specific localized error (e.g., 'Incorrect Loop Condition')
      incorrect_code: string;                                // The exact code snippet extracted from the user's submission that contains the error
      correct_code: string;                                  // The corrected version of the code snippet
      comment: string;                                       // A brief explanation (1-4 sentences) of why the code was incorrect and the concept behind the fix
    }[];
    statements: string[];                                    // Prose-based feedback for issues that cannot be shown as a simple code diff, such as missing files, architectural flaws, or missing logic
  };
}
```

---

### Generate New Exercise

Generates a new exercise based on the lesson and all previous exercises for that lesson.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/new/<message_id>/` |
| **Method** | `POST` |

**Request Body**

```typescript
{
  ability_level: string;                                     // Whatever the user has it set to
}
```

**Response**

If exercise limit per lesson reached for the user:

```json
{ "warning": "Exercise count limit reached." }
```

If insufficient tokens left:

```json
{ "warning": "Insufficient tokens" }
```

Otherwise:

```typescript
{
  [exercise_id: string]: {
    correctness: boolean;
    files: {
      filename: string;
      text: string;
      code: string;
    }[];
  };
}
```

---

### Save Exercise Progress

Saves the current state of all the code files for an exercise.

> **Note**: The submitted code for each file should be provided as an array via `user_submissions`, and the corresponding `exercise_files_ids` array should contain the corresponding exercise file IDs **in the exact order matching the `user_submissions` field**.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/save/` |
| **Method** | `POST` |

**Request Body**

```typescript
{
  user_submissions: string[];
  exercise_files_ids: number[];
}
```

**Response**

```json
{
  "status": "User submissions saved."
}
```

---

### Get Bookmarked Exercises

Fetches all bookmarked exercises for the authenticated user.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/bookmarks/` |
| **Method** | `GET` |

**Response**

```typescript
{
  id: number;
  message: number;
  correctness: number;
  bookmarked: boolean;
  title: string;
  tags: string[];
}[]
```

---

### Toggle Exercise Bookmark

Toggles the `bookmarked` field of an exercise.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/bookmark/<exercise_id>/` |
| **Method** | `POST` |

**Response**

```typescript
{
  id: number;
  message: number;
  correctness: number;
  bookmarked: boolean;
  title: string;
  tags: string[];
}
```

---

### Get Exercise Aggregates

Return the total number of exercises for a conversation, and also how many of those exercises are completed correctly or nearly correctly.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/exercise/aggregate/<conversation_id>/` |
| **Method** | `GET` |

**Response**

```typescript
{
  exercises_count: number;
  exercises_almost_count: number;
  exercises_correct_count: number;
}
```

---

## Tokens

### Get Token Balance

Return the authenticated user's token limit and tokens used.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/token/` |
| **Method** | `GET` |

**Response**

```typescript
{
  token_used: number;
  token_limit: number;
}
```

---

### Get Token Usage History

Return the authenticated user's TokenUsage history.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/token/usage/` |
| **Method** | `GET` |

**Response**

```typescript
{
  user: number;                                              // user_id
  timestamp: number;
  token_used: number;
  tokens_remaining: number;
  action: "router" | "instructor" | "exercise_evaluator" | "exercise_generator";
}[]
```

---

## File Upload

### Get Profile Image Upload URL

Generates a signed URL which can then be used to upload a profile image to object storage.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/upload/profile-image-url/` |
| **Method** | `GET` |

**Request Body**

```typescript
{
  content_type: string;                                      // Parsable MIME type e.g. image/jpeg, image/png etc
}
```

**Response**

```typescript
{
  upload_url: string;
  public_url: string;
  filename: string;
  expires_in: number;
}
```

---

### Confirm Profile Image Upload

Saves the `public_url` into the database, overwriting the old one if there is one. The previous object-storage image is deleted when it belongs to this app's bucket.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/upload/profile-image-confirm/` |
| **Method** | `GET` |

**Request Body**

```typescript
{
  public_url: string;                                        // Public URL of the uploaded image returned from the /profile-image-url/ endpoint
}
```

**Response**

```typescript
{
  profile_image: string;                                     // Returns the public_url
}
```

---

## Payments

### Create Subscription

Creates a Pro subscription for the authenticated user. Returns a `client_secret` for Stripe Elements confirmation on the frontend.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/payments/subscribe/` |
| **Method** | `POST` |

**Request Body**

No body required. User is identified via Bearer token authentication.

**Response**

```typescript
{
  subscription_id: string;
  client_secret: string;
}
```

---

### Buy Tokens

Creates a one-time PaymentIntent for purchasing tokens. Returns a `client_secret` for Stripe Elements confirmation.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/payments/tokens/` |
| **Method** | `POST` |

**Request Body**

```typescript
{
  token_amount: 200000;                                      // Only 200000 is currently supported
}
```

**Response**

```typescript
{
  client_secret: string;
}
```

---

### Cancel Subscription

Cancels the user's Pro subscription at the end of the current billing period. The user retains Pro access until the period ends.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/payments/cancel/` |
| **Method** | `POST` |

**Request Body**

No body required. User is identified via Bearer token authentication.

**Response**

```typescript
{
  status: "canceled";
  message: "Subscription will cancel at period end";
  active_until: string;                                      // ISO datetime string for when Pro access expires
}
```

**Error Responses**

```json
{ "error": "No subscription found" }
```

```json
{ "error": "No active subscription" }
```

---

### Stripe Webhook

Receives and processes Stripe webhook events. Verifies the payload signature via the `Stripe-Signature` header before processing. CSRF protection is disabled for this endpoint.

| Property | Value |
|----------|-------|
| **Endpoint** | `BASE_URL/api/chat/webhooks/stripe/` |
| **Method** | `POST` |

**Request Headers**

| Header | Description |
|--------|-------------|
| `Stripe-Signature` | Stripe webhook signature for payload verification |

**Supported Events**

| Event | Description |
|-------|-------------|
| `invoice.payment_succeeded` | Updates user membership to Pro on subscription payment |
| `payment_intent.succeeded` | Adds purchased tokens to user's token limit |
| `customer.subscription.deleted` | Downgrades user back to free tier (50k token limit) |

**Response**

```json
{
  "status": "success"
}
```

---

## Type Definitions

### User

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  preferences?: UserPreferences;
}
```

### UserPreferences

```typescript
interface UserPreferences {
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
}
```

### InstructorResponse

```typescript
interface InstructorResponse {
  lesson_title: string;
  breakdown: string;
  explanation: string;
  recommendedReadings: {
    title: string;
    url: string;
    sourceDescription: string;
    readingTime: string;
  }[];
  exercise_title: string;
  exercise_tags: string;
  exercises: {
    filename: string;
    text: string;
    code: string;
  }[];
  tags: string[];
}
```
