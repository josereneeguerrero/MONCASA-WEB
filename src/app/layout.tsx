import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import GoogleAnalytics from "@/components/google-analytics";
import AppShellWithClerk from "@/components/app-shell-with-clerk";
import FloatingCartVisibility from "@/components/floating-cart-visibility";
import WhatsAppFloat from "@/components/whatsapp-float";
import NewsletterModal from "@/components/newsletter-modal";
import { CartProvider } from "@/lib/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://moncasa-web.vercel.app"),
  title: {
    default: "Ferretería Moncasa",
    template: "%s | Ferretería Moncasa",
  },
  description: "Tu aliado confiable en San Lorenzo, Valle para cada proyecto de construcción y hogar.",
  openGraph: {
    type: "website",
    siteName: "Ferretería Moncasa",
    title: "Ferretería Moncasa",
    description: "Tu aliado confiable en San Lorenzo, Valle para cada proyecto de construcción y hogar.",
    locale: "es_HN",
    images: [{ url: "/moncasa-logo.png", width: 1200, height: 630, alt: "Ferretería Moncasa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferretería Moncasa",
    description: "Tu aliado confiable en San Lorenzo, Valle para cada proyecto de construcción y hogar.",
    images: ["/moncasa-logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkReady = Boolean(clerkPublishableKey);

  return (
    <html lang="es" data-theme="light" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head />
      <body className="min-h-full flex flex-col bg-[var(--color-moncasa-page-bg)] text-[var(--color-moncasa-text)]">
        {clerkReady ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <AppShellWithClerk>{children}</AppShellWithClerk>
          </ClerkProvider>
        ) : (
          <>
            <CartProvider>
              {children}
              <FloatingCartVisibility />
              <WhatsAppFloat />
            </CartProvider>
          </>
        )}
        <NewsletterModal />
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </Suspense>
      </body>
    </html>
  );
}
