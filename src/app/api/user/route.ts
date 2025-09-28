import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const mockUserPreferences: Record<string, any> = {};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('GET /api/user - Loading user preferences for user:', session?.user?.email);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const token = session.accessToken;

    // Get user preferences from mock database or use defaults
    const savedPreferences = mockUserPreferences[userEmail];
    
    const defaultPreferences: any = {
      name: session.user.name || '',
      theme: 'light',
      accentColor: '000000',
      language: 'en',
      lastUpdated: new Date().toISOString()
    };

    // Only include profileImage if it exists
    if (session.user.image) {
      defaultPreferences.profileImage = session.user.image;
    }

    const preferences = savedPreferences || defaultPreferences;

    console.log('Loaded preferences for user:', userEmail, preferences);

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to load preferences' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('POST /api/user - Saving preferences for user:', session?.user?.email);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const preferences = await request.json();
    const token = session.accessToken;

    console.log('Saving preferences for user:', userEmail, preferences);

    // Validate preferences data
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data' }, 
        { status: 400 }
      );
    }
  
    // const backendResponse = await fetch('/api/user/preferences', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ preferences, token })
    // });

    const updatedPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
      userEmail: userEmail
    };

    // Save to mock database
    mockUserPreferences[userEmail] = updatedPreferences;

    console.log(`Successfully saved preferences for user: ${userEmail}`, updatedPreferences);

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    
    delete mockUserPreferences[userEmail];

    console.log(`Cleared preferences for user: ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Preferences cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to clear preferences' }, 
      { status: 500 }
    );
  }
}
