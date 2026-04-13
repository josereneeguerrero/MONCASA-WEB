import Link from 'next/link';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import BrandLogo from '@/components/brand-logo';
import Footer from '@/components/footer';
import { ProductsClient } from '@/components/products-client';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explora el catálogo de Ferretería Moncasa y solicita tu cotización en lempiras.',
};

type ProductRow = Record<string, unknown>;

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
    const text = toText(row[key]);
    if (text) {
      return text;
    }
  }

  return '';
}

function getProducts(rows: ProductRow[]) {
  if (!rows.length) {
    return [];
  }

  return rows
    .map((row) => ({
      id: toText(row.id) || pickFirst(row, ['uuid']) || `${pickFirst(row, ['nombre', 'title'])}-${pickFirst(row, ['categoria', 'category'])}`,
      categoria: pickFirst(row, ['categoria', 'category', 'tipo', 'grupo']) || 'Producto',
      nombre: pickFirst(row, ['nombre', 'title', 'name', 'titulo']) || 'Producto sin nombre',
      descripcion:
        pickFirst(row, ['descripcion', 'description', 'detalle', 'details']) ||
        'Disponible en Ferretería Moncasa.',
      precio: pickFirst(row, ['precio', 'price', 'valor']) || '0',
      stock: pickFirst(row, ['stock', 'inventario', 'cantidad']) || '0',
      imagen_url: pickFirst(row, ['imagen_url', 'image_url', 'imagen']) || '',
      activo: toBoolean(row.activo ?? row.active ?? true, true),
      destacado: toBoolean(row.destacado ?? row.featured ?? false),
      orden: Number.parseInt(pickFirst(row, ['orden', 'sort_order']), 10) || 0,
    }))
    .filter((product) => product.activo)
    .sort((a, b) => {
      if (a.destacado !== b.destacado) {
        return a.destacado ? -1 : 1;
      }

      if (a.orden !== b.orden) {
        return a.orden - b.orden;
      }

      return a.nombre.localeCompare(b.nombre, 'es');
    });
}

type ProductosPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(params.page ?? '1') || 1);

  const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? 'productos';
  const { data } = await supabase.from(productsTable).select('*').limit(1000);

  const allProducts = getProducts((Array.isArray(data) ? data : []) as ProductRow[]);
  const totalItems = allProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const from = (safePage - 1) * PAGE_SIZE;
  const products = allProducts.slice(from, from + PAGE_SIZE);

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
              <Link href="/productos" className="rounded-full bg-[#FE9A01] px-4 py-2 text-[#0A1116]">PRODUCTOS</Link>
              <Link href="/nosotros" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">NOSOTROS</Link>
              <Link href="/contacto" className="rounded-full px-4 py-2 text-[var(--color-moncasa-text-weak)] transition hover:bg-[var(--color-moncasa-hover)]">CONTACTO</Link>
            </nav>
          </div>
        </header>

        <section className="px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01]">Productos</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--color-moncasa-text)] sm:text-5xl">Nuestro catálogo para tu proyecto</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-moncasa-muted)]">
            Consulta la oferta general de Ferretería Moncasa. Si tu base de datos ya tiene registros, esta vista los toma automáticamente.
          </p>

          <div className="mt-10">
            <ProductsClient products={products} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4">
            <p className="text-sm text-[var(--color-moncasa-muted)]">
              Página <span className="font-bold text-[var(--color-moncasa-text)]">{safePage}</span> de{' '}
              <span className="font-bold text-[var(--color-moncasa-text)]">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <Link
                href={`/productos?page=${Math.max(1, safePage - 1)}`}
                aria-disabled={safePage <= 1}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  safePage <= 1
                    ? 'pointer-events-none border border-[var(--color-moncasa-border)] text-[var(--color-moncasa-muted)] opacity-50'
                    : 'border border-[var(--color-moncasa-border)] text-[var(--color-moncasa-text)] hover:bg-[var(--color-moncasa-hover)]'
                }`}
              >
                Anterior
              </Link>
              <Link
                href={`/productos?page=${Math.min(totalPages, safePage + 1)}`}
                aria-disabled={safePage >= totalPages}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  safePage >= totalPages
                    ? 'pointer-events-none border border-[var(--color-moncasa-border)] text-[var(--color-moncasa-muted)] opacity-50'
                    : 'border border-[var(--color-moncasa-border)] text-[var(--color-moncasa-text)] hover:bg-[var(--color-moncasa-hover)]'
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}