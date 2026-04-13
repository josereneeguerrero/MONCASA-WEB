import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';

export const dynamic = 'force-dynamic';

type ProductRow = Record<string, unknown>;

const fallbackProducts = [
  {
    category: 'Herramientas',
    title: 'Taladros y accesorios',
    description: 'Para perforación, corte y montaje con precisión.',
  },
  {
    category: 'Construcción',
    title: 'Cemento, varilla y bloques',
    description: 'Materiales base para obra gris y estructuras.',
  },
  {
    category: 'Hogar',
    title: 'Pinturas y acabados',
    description: 'Soluciones para mantenimiento, decoración y protección.',
  },
];

function toText(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return '';
}

function toBoolean(value: unknown, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return ['true', '1', 't', 'yes', 'si'].includes(normalized);
  }

  return fallback;
}

function pickFirst(row: ProductRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    const text = toText(value);
    if (text) {
      return text;
    }
  }

  return '';
}

function resolveProducts(rows: ProductRow[]) {
  if (!rows.length) {
    return fallbackProducts;
  }

  return rows
    .map((row) => ({
      category: pickFirst(row, ['category', 'categoria', 'tipo', 'grupo']) || 'Producto',
      title: pickFirst(row, ['title', 'titulo', 'name', 'nombre']) || 'Producto sin nombre',
      description:
        pickFirst(row, ['description', 'descripcion', 'details', 'detalle']) ||
        'Disponible en Ferretería Moncasa.',
      active: toBoolean(row.activo ?? row.active ?? true, true),
      featured: toBoolean(row.destacado ?? row.featured ?? false),
      order: Number.parseInt(pickFirst(row, ['orden', 'sort_order']), 10) || 0,
    }))
    .filter((product) => product.active)
    .sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.title.localeCompare(b.title, 'es');
    })
    .slice(0, 6);
}

export default async function Home() {
  const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? 'productos';

  let products = fallbackProducts;

  const { data, error } = await supabase.from(productsTable).select('*').limit(6);

  if (!error && Array.isArray(data)) {
    products = resolveProducts(data as ProductRow[]);
  }

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
        <header className="border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
              <div className="leading-tight">
                <p className="text-[10px] font-bold tracking-[0.35em] text-[#FE9A01]">FERRETERIA MONCASA</p>
                <p className="text-sm text-[var(--color-moncasa-muted)]">San Lorenzo, Honduras</p>
              </div>
            </Link>

            <nav aria-label="Principal" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <Link href="/" className="rounded-full bg-[#FE9A01] px-4 py-2 text-[#0A1116]">INICIO</Link>
              <Link href="/productos" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">PRODUCTOS</Link>
              <Link href="/nosotros" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">NOSOTROS</Link>
              <Link href="/contacto" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">CONTACTO</Link>
            </nav>
          </div>
        </header>

        <main id="inicio" className="px-5 py-8 sm:px-8 sm:py-10">
          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01]">¡BIENVENIDO!</p>
              <h1 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight text-[var(--color-moncasa-text)] sm:text-6xl">
                Tu aliado confiable en San Lorenzo para cada proyecto de construcción y hogar.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-moncasa-muted)]">
                Calidad que construye, servicio que cumple.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/productos"
                  className="rounded-full bg-[#FE9A01] px-6 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95"
                >
                  Conoce nuestros productos
                </Link>
                <Link href="/contacto" className="rounded-full border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-3 text-sm font-bold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-surface-soft)]">
                  Habla con un asesor
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#0A1116] p-5 shadow-[0_18px_50px_rgba(10,17,22,0.18)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,154,1,0.22),transparent_40%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-white/70">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FE9A01]">Promociones</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs">Actualizado hoy</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-white">
                    <p className="text-sm text-white/60">Promo destacada</p>
                    <p className="mt-2 text-2xl font-black">Herramientas</p>
                    <p className="mt-1 text-sm text-white/70">Descuentos en taladros y accesorios.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-white">
                    <p className="text-sm text-white/60">Promo hogar</p>
                    <p className="mt-2 text-2xl font-black">Pinturas</p>
                    <p className="mt-1 text-sm text-white/70">Acabados, selladores y brochas.</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-[#FE9A01] via-[#ffb52d] to-[#ffd37a] p-4 text-[#0A1116]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">ENTÉRATE DE LAS ULTIMAS PROMOCIONES</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="aspect-square rounded-2xl bg-white/60" />
                    <div className="aspect-square rounded-2xl bg-white/30" />
                    <div className="aspect-square rounded-2xl bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="productos" className="mt-10 grid gap-4 md:grid-cols-3">
            {products.map((product) => (
                <div key={`${product.category}-${product.title}`} className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FE9A01]">{product.category}</p>
                  <h2 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">{product.title}</h2>
                  {'featured' in product && product.featured ? (
                    <p className="mt-2 inline-flex rounded-full bg-[#FE9A01]/20 px-3 py-1 text-xs font-bold text-[#FE9A01]">Destacado</p>
                  ) : null}
                  <p className="mt-2 text-[var(--color-moncasa-muted)]">{product.description}</p>
              </div>
            ))}
          </section>

            <section id="nosotros" className="mt-10 grid gap-6 rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Nosotros</p>
                <h2 className="mt-2 text-3xl font-black text-[var(--color-moncasa-text)]">Servicio cercano, solución rápida.</h2>
                <p className="mt-4 max-w-2xl text-[var(--color-moncasa-muted)]">
                Ofrecemos asesoría para proyectos de construcción y hogar con enfoque en disponibilidad,
                confianza y atención local en San Lorenzo.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--color-moncasa-surface-soft)] p-4">
                  <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Respuesta</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-moncasa-text)]">Asesoría directa</p>
              </div>
                <div className="rounded-2xl bg-[var(--color-moncasa-surface-soft)] p-4">
                  <p className="text-sm text-[var(--color-moncasa-muted-strong)]">Cobertura</p>
                  <p className="mt-1 text-lg font-bold text-[var(--color-moncasa-text)]">San Lorenzo</p>
              </div>
            </div>
          </section>
        </main>

          <footer id="contacto" className="border-t border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-inverse-surface)] px-5 py-8 text-[var(--color-moncasa-inverse-text)] sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Información de contacto</p>
                <p className="mt-3 text-lg text-[var(--color-moncasa-inverse-muted)]">Teléfono: +504 3218-4060</p>
            </div>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-moncasa-inverse-muted)]">
                <a href="https://www.facebook.com/MoncasaHN" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5">
                Facebook
              </a>
              <a href="https://www.youtube.com/@MoncasaHN" target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5">
                YouTube
              </a>
            </div>
          </div>

            <p className="mt-6 text-sm text-[var(--color-moncasa-inverse-muted)]">© 2026 Ferretería Moncasa. Todos los derechos reservados.</p>
        </footer>
      </div>
    </main>
  );
}