import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import ThemeScript from "@/components/theme-script";
import ThemeToggle from "@/components/theme-toggle";
import FloatingCartVisibility from "@/components/floating-cart-visibility";
import WhatsAppFloat from "@/components/whatsapp-float";
import GoogleAnalytics from "@/components/google-analytics";
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-moncasa-page-bg)] text-[var(--color-moncasa-text)]">
        {clerkReady ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <header className="sticky top-0 z-50 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <Show when="signed-out">
                  <SignInButton>
                    <button className="rounded-full border border-[var(--color-moncasa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-moncasa-surface-soft)]">
                      Iniciar sesión
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95">
                      Crear cuenta
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </header>
            <CartProvider>
              {children}
              <FloatingCartVisibility />
              <WhatsAppFloat />
            </CartProvider>
            <ThemeToggle />
          </ClerkProvider>
        ) : (
          <>
            <header className="sticky top-0 z-50 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-end gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <a className="rounded-full border border-[var(--color-moncasa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--color-moncasa-surface-soft)]" href="/login">
                  Iniciar sesión
                </a>
                <a className="rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95" href="/login">
                  Crear cuenta
                </a>
              </div>
            </header>
            <CartProvider>
              {children}
              <FloatingCartVisibility />
              <WhatsAppFloat />
            </CartProvider>
            <ThemeToggle />
          </>
        )}
        <Suspense fallback={null}>
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        </Suspense>
      </body>
    </html>
  );
}
