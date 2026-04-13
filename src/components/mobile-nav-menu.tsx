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
        className="inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-3 text-[var(--color-moncasa-text)] shadow-[0_8px_24px_var(--color-moncasa-shadow)] transition hover:bg-[var(--color-moncasa-hover)]"
        aria-label="Abrir menú de navegación"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="flex flex-col items-center gap-1.5">
            <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition-transform ${isOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
          <span className="hidden sm:inline">Menú</span>
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="fixed inset-0 z-40 cursor-default bg-black/35 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_24px_80px_var(--color-moncasa-shadow)]">
            <div className="flex items-center justify-between border-b border-[var(--color-moncasa-border)] px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Navegación</p>
                <p className="mt-1 text-xs text-[var(--color-moncasa-muted)]">Accesos rápidos</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[var(--color-moncasa-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
              >
                Cerrar
              </button>
            </div>

            <nav className="grid gap-2 p-3">
              <Link
                href="/"
                className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-hover)]/40 px-4 py-3 text-sm font-semibold text-[#FE9A01] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                INICIO
              </Link>
              <Link
                href="/productos"
                className="rounded-2xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                PRODUCTOS
              </Link>
              <Link
                href="/nosotros"
                className="rounded-2xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                NOSOTROS
              </Link>
              <Link
                href="/contacto"
                className="rounded-2xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]"
                onClick={() => setIsOpen(false)}
              >
                CONTACTO
              </Link>

              <div className="mt-1 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-3">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-moncasa-text-weak)]">
                  Cuenta
                </p>
                <AuthControls variant="stacked" />
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
