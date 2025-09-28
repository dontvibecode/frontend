import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: "352646028482-ft8i5564ic08pmnh2u2flb55c4ls0hdm.apps.googleusercontent.com", // process.env.GOOGLE_CLIENT_ID!,
      clientSecret: "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", // process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      (session as any).accessToken = token.accessToken
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Initialize user preferences when they first sign in
      if (user.email) {
        try {
          /*
           * TODO: Check if user preferences already exist by making a request to our API
           * This will create default preferences if they don't exist
           * The GET endpoint will automatically create default preferences if none exist
           */
          const response = await fetch('/api/user');
          if (response.ok) {
            const preferences = await response.json();
            console.log('User preferences loaded in auth route:', preferences);
          }
        } catch (error) {
          console.error('Error during sign in callback:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
