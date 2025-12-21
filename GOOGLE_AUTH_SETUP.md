# Google Authentication Setup

## 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)

## 2. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_here

# API Configuration
NEXT_PUBLIC_API_URL=https://dontvibecode.uc.r.appspot.com/
    
# Generate a secret with: openssl rand -base64 32
```

## 3. How It Works

- User clicks "Continue with Google" button
- NextAuth redirects to Google OAuth
- After authentication, user is redirected back to your app
- Session is managed automatically
- User is redirected to the home page (`/`) after successful login

## 4. Features Implemented

✅ Google OAuth login  
✅ Session management  
✅ Automatic redirect after login  
✅ Loading states  
✅ Error handling  
✅ Animated login button with mouse-following fill effect

## 5. Usage

The login page will:
1. Show a loading spinner while checking authentication status
2. Redirect to home page if user is already logged in
3. Display the login form with Google authentication
4. Handle the OAuth flow automatically
