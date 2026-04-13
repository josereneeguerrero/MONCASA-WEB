'use client';

import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
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
      <CartProvider storageKey={storageKey}>
        {children}
        <FloatingCartVisibility />
        <WhatsAppFloat />
      </CartProvider>
      <ThemeToggle />
    </>
  );
}