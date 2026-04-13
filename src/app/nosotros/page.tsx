import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import Footer from '@/components/footer';

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
        <header className="sticky top-0 z-50 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
              <p className="text-[10px] font-bold tracking-[0.35em] text-[#FE9A01]">FERRETERIA MONCASA</p>
            </Link>

            <nav aria-label="Principal" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Link href="/" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">INICIO</Link>
              <Link href="/productos" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">PRODUCTOS</Link>
              <Link href="/nosotros" className="rounded-full bg-[#FE9A01] px-4 py-2 text-[#0A1116]">NOSOTROS</Link>
              <Link href="/contacto" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">CONTACTO</Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01]">Nosotros</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--color-moncasa-text)] sm:text-5xl">Servicio cercano, solución rápida.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-moncasa-muted)]">
              Ferretería Moncasa acompaña a clientes, maestros y contratistas en San Lorenzo, Valle con orientación práctica para construir, reparar y mejorar.
            </p>
            <p className="mt-4 max-w-2xl text-[var(--color-moncasa-muted)]">
              Nuestra prioridad es mantener la esencia de la maqueta: comunicación clara, identidad fuerte y una experiencia visual limpia con acentos naranjas sobre fondo blanco y oscuro.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
              <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Atención</p>
              <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Cercana</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
              <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Cobertura</p>
              <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">San Lorenzo</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
              <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Foco</p>
              <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Construcción</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
              <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Servicio</p>
              <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Hogar</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}