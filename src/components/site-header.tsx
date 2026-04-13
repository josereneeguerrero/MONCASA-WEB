'use client';

import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import AuthControls from '@/components/auth-controls';
import MobileNavMenu from '@/components/mobile-nav-menu';

type SiteHeaderProps = {
  active?: 'inicio' | 'productos' | 'contacto';
};

export default function SiteHeader({ active = 'inicio' }: SiteHeaderProps) {
  const getNavClassName = (key: 'inicio' | 'productos' | 'contacto') => {
    if (active === key) {
      return 'rounded-full bg-[#FE9A01] px-3 py-2 text-[#0A1116] lg:px-4';
    }

    return 'rounded-full px-3 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)] lg:px-4';
  };
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/95 px-5 py-3 shadow-[0_2px_8px_var(--color-moncasa-shadow)] backdrop-blur transition sm:px-8">
      <div className="grid items-center gap-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
          <BrandLogo className="h-11 w-11 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
          <p className="hidden text-[10px] font-bold tracking-[0.35em] text-[#FE9A01] lg:block xl:text-[11px]">
            FERRETERIA MONCASA
          </p>
        </Link>

        <div className="justify-self-end lg:hidden">
          <MobileNavMenu />
        </div>

        <nav aria-label="Principal" className="hidden items-center justify-center gap-1 overflow-x-auto whitespace-nowrap text-xs font-semibold lg:flex lg:gap-2 lg:text-sm">
          <Link href="/" className={getNavClassName('inicio')}>INICIO</Link>
          <Link href="/productos" className={getNavClassName('productos')}>PRODUCTOS</Link>
          <Link href="/contacto" className={getNavClassName('contacto')}>CONTACTO</Link>
        </nav>

        <div className="hidden justify-self-end lg:flex">
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
