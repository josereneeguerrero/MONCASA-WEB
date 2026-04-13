'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center gap-1.5 rounded-lg p-2 hover:bg-[var(--color-moncasa-hover)] transition"
        aria-label="Menú de navegación"
        aria-expanded={isOpen}
      >
        <span className={`h-0.5 w-6 bg-[var(--color-moncasa-text)] transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`h-0.5 w-6 bg-[var(--color-moncasa-text)] transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`h-0.5 w-6 bg-[var(--color-moncasa-text)] transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-lg z-50">
          <nav className="flex flex-col divide-y divide-[var(--color-moncasa-border)]">
            <Link
              href="/"
              className="px-4 py-3 text-sm font-semibold text-[#FE9A01] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              INICIO
            </Link>
            <Link
              href="/productos"
              className="px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              PRODUCTOS
            </Link>
            <Link
              href="/nosotros"
              className="px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              NOSOTROS
            </Link>
            <Link
              href="/contacto"
              className="px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text-weak)] hover:bg-[var(--color-moncasa-hover)] transition"
              onClick={() => setIsOpen(false)}
            >
              CONTACTO
            </Link>
          </nav>
        </div>
      )}

      {/* Backdrop to close menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
