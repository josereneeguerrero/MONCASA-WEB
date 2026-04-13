'use client';

import { usePathname } from 'next/navigation';
import CartButton from '@/components/cart-button';
import { shouldHideFloatingCart } from '@/lib/ui-routes';

export default function FloatingCartVisibility() {
  const pathname = usePathname();
  const shouldHideCart = shouldHideFloatingCart(pathname);

  if (shouldHideCart) {
    return null;
  }

  return <CartButton />;
}
