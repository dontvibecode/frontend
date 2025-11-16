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
