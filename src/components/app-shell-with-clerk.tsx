'use client';

import { useUser } from '@clerk/nextjs';
import FloatingCartVisibility from '@/components/floating-cart-visibility';
import WhatsAppFloat from '@/components/whatsapp-float';
import { CartProvider } from '@/lib/cart-context';

type AppShellWithClerkProps = {
  children: React.ReactNode;
};

export default function AppShellWithClerk({ children }: AppShellWithClerkProps) {
  const { user } = useUser();

  const storageKey = user?.id ? `moncasa-cart:${user.id}` : 'moncasa-cart:guest';

  return (
    <>
      <CartProvider storageKey={storageKey}>
        {children}
        <FloatingCartVisibility />
        <WhatsAppFloat />
      </CartProvider>
    </>
  );
}