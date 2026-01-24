import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh session every 24 hours
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth id_token and or the user id to the token right after signin
      if (account) {
        token.idToken = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an id_token and user id from a provider.
      (session as any).user.idToken = token.idToken
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
