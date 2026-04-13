'use client';

import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import FloatingCartVisibility from '@/components/floating-cart-visibility';
import ThemeToggle from '@/components/theme-toggle';
import WhatsAppFloat from '@/components/whatsapp-float';
import { CartProvider } from '@/lib/cart-context';

type AppShellWithClerkProps = {
  children: React.ReactNode;
};

export default function AppShellWithClerk({ children }: AppShellWithClerkProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdminSurface = pathname?.startsWith('/admin') || pathname === '/login';
  const storageKey = user?.id ? `moncasa-cart:${user.id}` : 'moncasa-cart:guest';

  return (
    <>
      {!isAdminSurface ? (
        <div className="fixed right-18 top-4 z-[70] flex justify-end sm:right-20 sm:top-6 lg:right-24 lg:top-6">
          <div className="flex h-12 max-w-full items-center gap-2 rounded-full border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/92 px-2 shadow-[0_8px_24px_var(--color-moncasa-shadow)] backdrop-blur">
            <Show when="signed-out">
              <SignInButton>
                <button className="whitespace-nowrap rounded-full border border-[var(--color-moncasa-border)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--color-moncasa-surface-soft)]">
                  Iniciar sesión
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="whitespace-nowrap rounded-full bg-[#FE9A01] px-3 py-1.5 text-xs font-bold text-[#0A1116] transition hover:brightness-95">
                  Crear cuenta
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </div>
        </div>
      ) : null}

      <CartProvider storageKey={storageKey}>
        {children}
        <FloatingCartVisibility />
        <WhatsAppFloat />
      </CartProvider>
      <ThemeToggle />
    </>
  );
}