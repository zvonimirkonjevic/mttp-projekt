import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import PageTransitionProvider from "./components/PageTransitionProvider";
import { UserProvider } from "./contexts/UserContext";
import QueryProvider from "./providers/QueryProvider";
import { Toaster } from 'sonner';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlashSlides.ai - AI-Powered Financial Presentations for Investment Banks, Startups & Businesses",
  description: "Create professional PowerPoint presentations with AI for hedge funds, investment banks, consulting firms, and startups. Generate pitch decks, financial reports, and investment presentations in minutes.",
  keywords: "AI presentations, PowerPoint generation, financial presentations, pitch decks, investment banks, hedge funds, consulting firms, McKinsey, BCG, Bain, startup pitch decks",
  authors: [{ name: "FlashSlides.ai" }],
  creator: "FlashSlides.ai",
  publisher: "FlashSlides.ai",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://flashslides.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "FlashSlides.ai - AI-Powered Financial Presentations for Investment Banks, Startups & Businesses",
    description: "Create professional PowerPoint presentations with AI for financial institutions. Generate pitch decks and investment presentations in minutes.",
    url: 'https://flashslides.ai',
    siteName: 'FlashSlides.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "FlashSlides.ai - AI-Powered Financial Presentations for Investment Banks, Startups & Businesses",
    description: "Create professional PowerPoint presentations with AI for financial institutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-signin-client_id" content="51273915248-7g9btn2cgofi6kfrqutvdab6q32221k2.apps.googleusercontent.com" />
        <meta name="google-signin-scope" content="profile email" />
        <meta name="google-signin-ux_mode" content="popup" />
        <meta name="google-signin-locale" content="en" />
        <Script
          src="https://accounts.google.com/gsi/client?hl=en&gl=US"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <UserProvider>
          <QueryProvider>
            <PageTransitionProvider>
              <Suspense fallback={<div />}>{children}</Suspense>
              <Toaster />
            </PageTransitionProvider>
          </QueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
