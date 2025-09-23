import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import ClerkErrorBoundary from "@/components/ClerkErrorBoundary";
import PaddleProvider from "@/components/PaddleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexio AI - Smart Notes & Study Assistant",
  description: "Transform your learning with AI-powered notes, smart organization, and personalized study tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider 
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bWFueS1wZWxpY2FuLTY3LmNsZXJrLmFjY291bnRzLmRldiQ"}
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#8b5cf6',
            }
          }}
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
        >
          <ClerkErrorBoundary>
            <ConvexClientProvider>
              <PaddleProvider>
                {children}
              </PaddleProvider>
            </ConvexClientProvider>
          </ClerkErrorBoundary>
        </ClerkProvider>
      </body>
    </html>
  );
}
