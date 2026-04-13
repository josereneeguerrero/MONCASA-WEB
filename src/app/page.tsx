import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import Link from 'next/link';
import BrandLogo from '@/components/brand-logo';
import AuthControls from '@/components/auth-controls';
import MobileNavMenu from '@/components/mobile-nav-menu';
import Footer from '@/components/footer';

export const dynamic = 'force-dynamic';

type ProductRow = Record<string, unknown>;
type ConfigRow = { clave: string; valor: string };
type PromoRow = {
  tag: string;
  titulo: string;
  descripcion: string;
  badge: string;
  link: string;
};

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

function toConfigMap(rows: ConfigRow[]) {
  const map = new Map<string, string>();

  for (const row of rows) {
    map.set(String(row.clave ?? ''), String(row.valor ?? ''));
  }

  return map;
}

function parsePromos(value: string | undefined): PromoRow[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as PromoRow[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        tag: String(item.tag ?? 'Promoción'),
        titulo: String(item.titulo ?? 'Oferta especial'),
        descripcion: String(item.descripcion ?? 'Consulta más detalles de esta promoción.'),
        badge: String(item.badge ?? 'Disponible'),
        link: String(item.link ?? '/productos'),
      }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? 'productos';

  let products = fallbackProducts;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(productsTable).select('*').limit(6);

    if (!error && Array.isArray(data)) {
      products = resolveProducts(data as ProductRow[]);
    }
  }

  let config = new Map<string, string>();

  if (isSupabaseConfigured && supabase) {
    const { data: rawConfig } = await supabase
      .from('configuracion_sitio')
      .select('clave,valor')
      .in('clave', [
        'hero_subtitulo',
        'hero_titulo',
        'hero_cta_text',
        'hero_cta_link',
        'banner_activo',
        'banner_texto',
        'banner_tipo',
        'banner_link',
        'promos_home',
      ]);

    config = toConfigMap((Array.isArray(rawConfig) ? rawConfig : []) as ConfigRow[]);
  }

  const heroSubtitulo = config.get('hero_subtitulo') || 'Bienvenido';
  const heroTitulo = config.get('hero_titulo') || 'Tu aliado confiable en construcción y hogar';
  const heroCtaText = config.get('hero_cta_text') || 'Catálogo de productos';
  const heroCtaLink = config.get('hero_cta_link') || '/productos';
  const bannerTexto = config.get('banner_texto') || '';
  const bannerLink = config.get('banner_link') || '/contacto';
  const bannerTipo = (config.get('banner_tipo') || 'info').toLowerCase();
  const bannerActivo = toBoolean(config.get('banner_activo'), false);

  const promos = parsePromos(config.get('promos_home'));
  const promoRows = promos.length
    ? promos
    : [
        {
          tag: 'Oferta',
          titulo: 'Herramientas profesionales',
          descripcion: 'Precios especiales en combos de herramientas y accesorios.',
          badge: 'Disponible hoy',
          link: '/productos',
        },
        {
          tag: 'Temporada',
          titulo: 'Pinturas y acabados',
          descripcion: 'Líneas para interior y exterior con asesoría personalizada.',
          badge: 'Nuevo',
          link: '/productos',
        },
      ];

  const bannerStyleByType: Record<string, string> = {
    info: 'border-[#FE9A01]/30 bg-[#FE9A01]/10 text-[var(--color-moncasa-text)]',
    success: 'border-green-500/30 bg-green-500/10 text-[var(--color-moncasa-text)]',
    warning: 'border-amber-500/30 bg-amber-500/10 text-[var(--color-moncasa-text)]',
    error: 'border-red-500/30 bg-red-500/10 text-[var(--color-moncasa-text)]',
  };

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
        <header className="sticky top-0 z-40 border-b border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/95 backdrop-blur px-5 py-4 sm:px-8 shadow-[0_2px_8px_var(--color-moncasa-shadow)] transition">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4 lg:gap-8">
              <Link href="/" className="flex items-center gap-2">
                <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
                <p className="text-[10px] font-bold tracking-[0.35em] text-[#FE9A01]">FERRETERIA MONCASA</p>
              </Link>

              <nav aria-label="Principal" className="hidden md:flex flex-wrap items-center gap-2 text-sm font-semibold">
                <Link href="/" className="rounded-full bg-[#FE9A01] px-4 py-2 text-[#0A1116]">INICIO</Link>
                <Link href="/productos" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">PRODUCTOS</Link>
                <Link href="/nosotros" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">NOSOTROS</Link>
                <Link href="/contacto" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">CONTACTO</Link>
              </nav>
            </div>

            <div className="flex w-full items-center justify-end gap-4 md:w-auto lg:gap-4">
              <MobileNavMenu />
              <AuthControls />
            </div>
          </div>
        </header>

        <main id="inicio" className="px-5 py-8 sm:px-8 sm:py-10 flex-1">
          {bannerActivo && bannerTexto ? (
            <Link
              href={bannerLink}
              className={`mb-6 block rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:brightness-95 ${bannerStyleByType[bannerTipo] ?? bannerStyleByType.info}`}
            >
              {bannerTexto}
            </Link>
          ) : null}

          <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 moncasa-fade-in-up" style={{ animationDelay: '100ms' }}>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01] moncasa-fade-in" style={{ animationDelay: '200ms' }}>{heroSubtitulo}</p>
              <h1 className="max-w-xl text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight text-[var(--color-moncasa-text)] moncasa-fade-in-up" style={{ animationDelay: '300ms' }}>
                {heroTitulo}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--color-moncasa-muted)] moncasa-fade-in" style={{ animationDelay: '400ms' }}>
                Productos de calidad y asesoría profesional en San Lorenzo, Valle 02501, Honduras.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 moncasa-fade-in" style={{ animationDelay: '500ms' }}>
                <Link
                  href={heroCtaLink}
                  className="rounded-full bg-[#FE9A01] px-6 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95 hover:shadow-lg"
                >
                  {heroCtaText}
                </Link>
                <Link href="/contacto" className="rounded-full border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-3 text-sm font-bold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-surface-soft)] hover:border-[#FE9A01]/50">
                  Contactate con nosotros
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5 shadow-[0_18px_50px_var(--color-moncasa-shadow)] moncasa-fade-in-down moncasa-float" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,154,1,0.18),transparent_42%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-[var(--color-moncasa-muted)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#FE9A01]">Promociones destacadas</p>
                  <span className="rounded-full border border-[#FE9A01]/35 bg-[#FE9A01]/12 px-3 py-1 text-xs font-semibold text-[#FE9A01]">Actualizado desde admin</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {promoRows.slice(0, 2).map((promo, idx) => (
                    <Link
                      key={`${promo.titulo}-${idx}`}
                      href={promo.link || '/productos'}
                      className={`rounded-[1.5rem] p-4 transition ${
                        idx === 0
                          ? 'border border-[#FE9A01]/35 bg-gradient-to-br from-[#FE9A01]/16 to-[#FE9A01]/7 hover:border-[#FE9A01]/60 hover:from-[#FE9A01]/20 hover:to-[#FE9A01]/10'
                          : 'border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] hover:border-[#FE9A01]/45 hover:bg-[var(--color-moncasa-hover)]'
                      }`}
                    >
                      <p className="text-sm font-medium text-[var(--color-moncasa-muted)]">{promo.tag}</p>
                      <p className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">{promo.titulo}</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">{promo.descripcion}</p>
                    </Link>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-[#FE9A01]/35 bg-gradient-to-r from-[#FE9A01]/20 via-[#ffb52d]/20 to-[#ffd37a]/24 p-4 text-[var(--color-moncasa-text)] transition hover:shadow-lg">
                  <p className="text-sm font-bold uppercase tracking-[0.2em]">{promoRows[0]?.badge ?? 'Promociones activas'}</p>
                  <p className="mt-2 text-sm">Edita estas promociones desde Admin → Configuración → clave `promos_home`.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="productos" className="mt-16">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Catálogo</p>
              <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Productos principales</h2>
              <p className="mt-2 text-[var(--color-moncasa-muted)]">Descubre nuestras principales categorías de productos disponibles</p>
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
                  </div>
                  {'featured' in product && product.featured ? (
                    <p className="mt-3 inline-flex rounded-full bg-[#FE9A01]/20 px-3 py-1 text-xs font-bold text-[#FE9A01]">Destacado</p>
                  ) : null}
                  <p className="mt-4 text-[var(--color-moncasa-muted)] leading-6">{product.description}</p>
                  <Link href="/productos" className="mt-4 inline-block rounded-lg bg-[#FE9A01]/10 px-4 py-2 text-sm font-bold text-[#FE9A01] transition hover:bg-[#FE9A01]/20">
                    Más información
                  </Link>
                </div>
              ))}
            </div>
          </section>

            <section id="nosotros" className="mt-16 rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-8 sm:p-10 moncasa-fade-in-up">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Sobre nosotros</p>
                  <h2 className="mt-2 text-4xl font-black text-[var(--color-moncasa-text)]">Servicio confiable, soluciones rápidas</h2>
                  <p className="mt-4 text-lg leading-8 text-[var(--color-moncasa-muted)]">
                    Ofrecemos soluciones integrales para proyectos de construcción y mejoramiento del hogar con enfoque en disponibilidad, confianza y atención profesional. Somos tu ferretería de confianza en San Lorenzo.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-lg font-bold text-[var(--color-moncasa-text)]">Precisión</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Productos selectos y asesoría técnica exacta</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-lg font-bold text-[var(--color-moncasa-text)]">Rapidez</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Servicio rápido y atención inmediata</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-lg font-bold text-[var(--color-moncasa-text)]">Confianza</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Relaciones duraderas con nuestros clientes</p>
                    </div>
                    <div className="rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 hover:bg-[#FE9A01]/5 transition">
                      <p className="text-lg font-bold text-[var(--color-moncasa-text)]">Presencia Local</p>
                      <p className="mt-1 text-sm text-[var(--color-moncasa-muted)]">Ubicación física en San Lorenzo</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-gradient-to-br from-[#FE9A01]/15 to-[#FE9A01]/5 p-8 flex flex-col justify-center moncasa-float">
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">15+</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Años en el mercado</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#FE9A01]/30 to-transparent" />
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">1000+</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Clientes satisfechos</p>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#FE9A01]/30 to-transparent" />
                    <div className="text-center">
                      <p className="text-5xl font-black text-[#FE9A01]">24/7</p>
                      <p className="mt-2 text-sm text-[var(--color-moncasa-muted)]">Disponibilidad</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </main>

          <footer id="contacto" className="mt-16">
            <Footer />
          </footer>
      </div>
    </main>
  );
}