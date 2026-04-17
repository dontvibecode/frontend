"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./components/ThemeProvider";
import { TokenWarningProvider } from "./components/TokenWarningModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="light">
        <TokenWarningProvider>
          {children}
        </TokenWarningProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
