"use client";

import { useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { TokenWarningProvider } from "./components/TokenWarningModal";

// How often an open tab re-reads its session. Each read lets the server swap
// an ID token that is close to expiring, so it must be shorter than
// REFRESH_MARGIN_SECONDS in the NextAuth route.
const SESSION_REFETCH_SECONDS = 5 * 60;

/**
 * If Google refuses to refresh (access revoked, or a session from before
 * refresh tokens), end the session so every page sees the user as logged out
 * instead of sending an expired token to the backend.
 */
function SignOutWhenRefreshFails() {
  const { data: session } = useSession();
  useEffect(() => {
    if ((session as any)?.error === "RefreshTokenError") {
      signOut({ redirect: false });
    }
  }, [session]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={SESSION_REFETCH_SECONDS}>
      <SignOutWhenRefreshFails />
      <ThemeProvider defaultTheme="light">
        <TokenWarningProvider>
          {children}
        </TokenWarningProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
