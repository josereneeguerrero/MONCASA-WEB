'use client';

import { shouldHideWhatsAppFloat } from '@/lib/ui-routes';
import { usePathname } from 'next/navigation';

export default function WhatsAppFloat() {
  const pathname = usePathname();

  if (shouldHideWhatsAppFloat(pathname)) {
    return null;
  }

  return (
    <a
      href="https://wa.me/50432184060?text=Hola%20Ferreter%C3%ADa%20Moncasa,%20quiero%20informaci%C3%B3n"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_40px_rgba(0,0,0,0.25)] transition hover:scale-105 sm:bottom-6 sm:right-6"
      aria-label="Abrir WhatsApp"
      title="WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
        <path d="M19.05 4.94A9.9 9.9 0 0 0 12 2a9.93 9.93 0 0 0-8.58 15l-1.3 4.74 4.86-1.27A9.92 9.92 0 0 0 12 22h.01c5.5 0 9.99-4.48 9.99-9.99a9.9 9.9 0 0 0-2.95-7.07ZM12 20.2a8.1 8.1 0 0 1-4.13-1.13l-.3-.17-2.88.75.77-2.8-.2-.3A8.12 8.12 0 1 1 12 20.2Zm4.45-6.08c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.17-1.39-1.3-1.63-.14-.24-.01-.37.1-.5.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.5.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
