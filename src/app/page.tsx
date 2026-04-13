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
        <header className="sticky top-0 z-40 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/95 backdrop-blur px-5 py-4 sm:px-8 shadow-[0_2px_8px_var(--color-moncasa-shadow)] transition">
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

        <main id="inicio" className="px-5 py-8 sm:px-8 sm:py-10 flex-1">
          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 moncasa-fade-in-up" style={{ animationDelay: '100ms' }}>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01] moncasa-fade-in" style={{ animationDelay: '200ms' }}>¡BIENVENIDO!</p>
              <h1 className="max-w-xl text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight text-[var(--color-moncasa-text)] moncasa-fade-in-up" style={{ animationDelay: '300ms' }}>
                Tu aliado confiable en San Lorenzo para cada proyecto de construcción y hogar.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-moncasa-muted)] moncasa-fade-in" style={{ animationDelay: '400ms' }}>
                Calidad que construye, servicio que cumple.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 moncasa-fade-in" style={{ animationDelay: '500ms' }}>
                <Link
                  href="/productos"
                  className="rounded-full bg-[#FE9A01] px-6 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95 hover:shadow-lg"
                >
                  🛒 Conoce nuestros productos
                </Link>
                <Link href="/contacto" className="rounded-full border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-3 text-sm font-bold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-surface-soft)] hover:border-[#FE9A01]/50">
                  💬 Habla con un asesor
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[#0A1116] p-5 shadow-[0_18px_50px_rgba(10,17,22,0.18)] moncasa-fade-in-down moncasa-float" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,154,1,0.22),transparent_40%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-white/70">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FE9A01]">✨ Promociones Destacadas</p>
                  <span className="rounded-full border border-[#FE9A01]/30 bg-[#FE9A01]/10 px-3 py-1 text-xs font-semibold text-[#FE9A01]">HOY</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-[#FE9A01]/30 bg-gradient-to-br from-[#FE9A01]/15 to-[#FE9A01]/5 p-4 text-white hover:border-[#FE9A01]/60 hover:bg-[#FE9A01]/10 transition">
                    <p className="text-sm text-white/60 font-medium">📌 Promo destacada</p>
                    <p className="mt-2 text-2xl font-black">Herramientas</p>
                    <p className="mt-1 text-sm text-white/70">Descuentos en taladros y accesorios.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-white hover:border-white/30 hover:bg-white/10 transition">
                    <p className="text-sm text-white/60 font-medium">🏠 Promo hogar</p>
                    <p className="mt-2 text-2xl font-black">Pinturas</p>
                    <p className="mt-1 text-sm text-white/70">Acabados, selladores y brochas.</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-[#FE9A01] via-[#ffb52d] to-[#ffd37a] p-4 text-[#0A1116] hover:shadow-lg transition">
                  <p className="text-sm font-bold uppercase tracking-[0.2em]">📢 Últimas ofertas</p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="aspect-square rounded-2xl bg-white/60 hover:bg-white/80 transition" />
                    <div className="aspect-square rounded-2xl bg-white/30 hover:bg-white/50 transition" />
                    <div className="aspect-square rounded-2xl bg-white/20 hover:bg-white/40 transition" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="productos" className="mt-16">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Nuestro inventario</p>
              <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Productos destacados</h2>
              <p className="mt-2 text-[var(--color-moncasa-muted)]">Conoce nuestras principales categorías</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {products.map((product, idx) => (
                <div 
                  key={`${product.category}-${product.title}`} 
                  className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6 transition hover:border-[#FE9A01]/50 hover:shadow-lg hover:-translate-y-1 moncasa-fade-in-up"
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FE9A01]">{product.category}</p>
                      <h3 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">{product.title}</h3>
                    </div>
                    <span className="text-3xl ml-2">
                      {product.category.includes('Herramienta') ? '🔧' : 
                       product.category.includes('Construcción') ? '🏗️' : 
                       product.category.includes('Hogar') ? '🏠' : '📦'}
                    </span>
                  </div>
                  {'featured' in product && product.featured ? (
                    <p className="mt-3 inline-flex rounded-full bg-[#FE9A01]/20 px-3 py-1 text-xs font-bold text-[#FE9A01]">⭐ Destacado</p>
                  ) : null}
                  <p className="mt-4 text-[var(--color-moncasa-muted)] leading-6">{product.description}</p>
                  <Link href="/productos" className="mt-4 inline-block rounded-lg bg-[#FE9A01]/10 px-4 py-2 text-sm font-bold text-[#FE9A01] transition hover:bg-[#FE9A01]/20">
                    Ver más →
                  </Link>
                </div>
              ))}
            </div>
          </section>

            <section id="nosotros" className="mt-16 rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-8 sm:p-10 moncasa-fade-in-up">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">¿Por qué nosotros?</p>
                  <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Servicio cercano, solución rápida.</h2>
                  <p className="mt-4 text-lg leading-8 text-[var(--color-moncasa-muted)]">
                    Ofrecemos asesoría integral para proyectos de construcción y hogar con enfoque en disponibilidad, confianza y atención local en San Lorenzo. Somos tu ferretería de confianza.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-2xl">🎯</p>
                      <p className="mt-2 font-bold text-[var(--color-moncasa-text)]">Precisión</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Productos selectos y asesoría exacta</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-2xl">⚡</p>
                      <p className="mt-2 font-bold text-[var(--color-moncasa-text)]">Rapidez</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Respuesta inmediata en San Lorenzo</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-2xl">🤝</p>
                      <p className="mt-2 font-bold text-[var(--color-moncasa-text)]">Confianza</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Relación de largo plazo con clientes</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-2xl">📍</p>
                      <p className="mt-2 font-bold text-[var(--color-moncasa-text)]">Local</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Presencia física en San Lorenzo</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-gradient-to-br from-[#FE9A01]/15 to-[#FE9A01]/5 p-8 flex flex-col justify-center moncasa-float">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">+15</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Años de trayectoria</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#FE9A01]/30 to-transparent" />
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">1000+</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Clientes satisfechos</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#FE9A01]/30 to-transparent" />
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">24/7</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Disponibles para ti</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </main>

          <footer id="contacto" className="mt-16 border-t border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-inverse-surface)] px-8 py-12 text-[var(--color-moncasa-inverse-text)]">
            <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
              {/* Información principal */}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">📞 Contáctanos</p>
                <p className="mt-4 text-lg font-bold">Teléfono</p>
                <a href="tel:+50432184060" className="text-[#FE9A01] hover:underline font-semibold">
                  +504 3218-4060
                </a>
                <p className="mt-4 text-lg font-bold">Ubicación</p>
                <p className="text-[var(--color-moncasa-inverse-muted)]">San Lorenzo, Honduras</p>
                <div className="mt-6 flex gap-3">
                  <a href="https://www.facebook.com/MoncasaHN" target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/5 hover:border-[#FE9A01]">
                    f
                  </a>
                  <a href="https://www.youtube.com/@MoncasaHN" target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/5 hover:border-[#FE9A01]">
                    ▶
                  </a>
                  <a href="https://wa.me/50432184060" target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/5 hover:border-[#FE9A01]">
                    W
                  </a>
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">🔗 Enlaces</p>
                <ul className="mt-4 space-y-3 text-[var(--color-moncasa-inverse-muted)]">
                  <li><Link href="/" className="hover:text-[#FE9A01]">Inicio</Link></li>
                  <li><Link href="/productos" className="hover:text-[#FE9A01]">Productos</Link></li>
                  <li><Link href="/nosotros" className="hover:text-[#FE9A01]">Nosotros</Link></li>
                  <li><Link href="/contacto" className="hover:text-[#FE9A01]">Contacto</Link></li>
                </ul>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-[#FE9A01]/30 bg-[#FE9A01]/10 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#FE9A01]">📧 Newsletter</p>
                <p className="mt-2 text-sm text-[var(--color-moncasa-inverse-muted)]">Entérate de nuestras últimas promociones</p>
                <Link href="/contacto" className="mt-4 inline-block rounded-lg bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95">
                  Contáctanos
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-[var(--color-moncasa-inverse-muted)]">© 2026 Ferretería Moncasa. Todos los derechos reservados. Hecho con ❤️ en Honduras.</p>
            </div>
          </footer>
      </div>
    </main>
  );
}