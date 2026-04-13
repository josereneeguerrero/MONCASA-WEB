'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cotizacion"
      className="fixed bottom-4 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#FE9A01] text-[#0A1116] shadow-[0_16px_50px_rgba(254,154,1,0.4)] transition hover:-translate-y-0.5 hover:brightness-110 sm:bottom-6 sm:left-6"
      title="Ver cotización"
    >
      <div className="relative">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </div>
    </Link>
  );
}
