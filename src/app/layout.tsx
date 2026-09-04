import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dontvibecode.com"),
  title: {
    default: "dontvibecode - Learn coding without vibe coding",
    template: "%s | dontvibecode",
  },
  description:
    "dontvibecode helps developers stop vibe coding and learn real programming skills with structured, hands-on coding lessons.",
  keywords: [
    "dont vibe code",
    "don't vibe code",
    "dontvibecode",
    "vibe coding",
    "learn programming",
    "coding lessons",
    "coding practice",
    "ai coding assistant",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.dontvibecode.com",
    siteName: "dontvibecode",
    title: "dontvibecode - Learn coding without vibe coding",
    description:
      "Stop vibe coding. Build real coding skills with guided lessons and practical exercises.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "dontvibecode logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "dontvibecode - Learn coding without vibe coding",
    description:
      "Stop vibe coding and learn programming with focused, practical lessons.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apply the persisted theme before React hydrates. Without this, every full
  // load briefly paints the light variables before ThemeProvider's effect runs.
  const themeInitScript = `
    try {
      const savedTheme = localStorage.getItem("theme") || "light";
      const resolvedTheme = savedTheme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : savedTheme;
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(resolvedTheme);
    } catch (_) {}
  `;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "dontvibecode",
    url: "https://www.dontvibecode.com",
    description:
      "dontvibecode helps developers stop vibe coding and learn real programming skills.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.dontvibecode.com/chat",
      "query-input": "required name=search_term",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ce69d12a-d4b9-4fcb-bb36-33afde1e738b"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
