import NextAuth from "next-auth"
import type { JWT } from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"

// Google ID tokens last an hour. Swap them a little early so a request sent
// just before expiry, or from a tab that last asked minutes ago, still passes.
const REFRESH_MARGIN_SECONDS = 10 * 60

async function refreshIdToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    })
    const refreshed = await response.json()
    if (!response.ok) throw refreshed

    return {
      ...token,
      idToken: refreshed.id_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      // Google usually keeps the same refresh token and omits it here.
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("Failed to refresh Google ID token:", error)
    return { ...token, error: "RefreshTokenError" }
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Google only hands out a refresh token for offline access, and only
      // reliably when the consent screen is shown.
      authorization: { params: { access_type: "offline", prompt: "consent" } },
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh session every 24 hours
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        }
      }

      if (token.error) return token

      const expiresAt = token.expiresAt as number | undefined
      if (expiresAt && Date.now() / 1000 < expiresAt - REFRESH_MARGIN_SECONDS) {
        return token
      }

      // Sessions from before refresh tokens were requested have none to use.
      if (!token.refreshToken) return { ...token, error: "RefreshTokenError" }

      return refreshIdToken(token)
    },
    async session({ session, token }) {
      (session as any).user.idToken = token.idToken;
      (session as any).error = token.error
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }
