'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthControls from '@/components/auth-controls';

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] text-[var(--color-moncasa-text)] shadow-[0_8px_24px_var(--color-moncasa-shadow)] transition hover:bg-[var(--color-moncasa-hover)]"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <span className="sr-only">Menú</span>
        <span className="flex flex-col items-center gap-1.5">
          <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-3 w-[min(92vw,20rem)] overflow-hidden rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
            <div className="border-b border-[var(--color-moncasa-border)] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Menú</p>
            </div>
            <nav className="flex flex-col p-2">
            <Link
              href="/"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#FE9A01] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              INICIO
            </Link>
            <Link
              href="/productos"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              PRODUCTOS
            </Link>
            <Link
              href="/nosotros"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              NOSOTROS
            </Link>
            <Link
              href="/contacto"
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              CONTACTO
            </Link>
            <div className="mt-2 rounded-2xl bg-[var(--color-moncasa-hover)]/60 p-3">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-moncasa-text-weak)]">
                Cuenta
              </p>
              <AuthControls variant="stacked" />
            </div>
          </nav>
          </div>
        </>
      )}
    </div>
  );
}
