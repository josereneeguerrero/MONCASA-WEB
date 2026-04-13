'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthControls from '@/components/auth-controls';

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] text-[var(--color-moncasa-text)] shadow-[0_6px_18px_var(--color-moncasa-shadow)] transition hover:bg-[var(--color-moncasa-hover)]"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-[18rem] overflow-hidden rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_45px_var(--color-moncasa-shadow)]">
            <nav className="grid gap-1 p-2">
              <Link
                href="/"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[#FE9A01] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                INICIO
              </Link>
              <Link
                href="/productos"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                PRODUCTOS
              </Link>
              <Link
                href="/nosotros"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                NOSOTROS
              </Link>
              <Link
                href="/contacto"
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                CONTACTO
              </Link>

              <div className="mt-2 border-t border-[var(--color-moncasa-border)] px-1 pt-3">
                <AuthControls variant="stacked" />
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
