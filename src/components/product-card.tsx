'use client';

import Image from 'next/image';
import { useCart } from '@/lib/cart-context';

type ProductCardProps = {
  id?: string | number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: string;
  stock?: string;
  imagen_url?: string;
};

export function ProductCard({ id, nombre, categoria, descripcion, precio, stock, imagen_url }: ProductCardProps) {
  const { addItem } = useCart();
  const productId = id || `${categoria}-${nombre}`;
  const stockValue = Number.parseInt(stock ?? '0', 10);
  const normalizedStock = Number.isNaN(stockValue) ? 0 : stockValue;
  const isOutOfStock = normalizedStock <= 0;

  return (
    <article className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
      <div className="relative mb-4 h-40 overflow-hidden rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]">
        <Image
          src={imagen_url?.trim() || '/moncasa-logo.png'}
          alt={nombre}
          fill
          unoptimized
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FE9A01]">{categoria}</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">{nombre}</h2>
      <p className="mt-2 text-[var(--color-moncasa-muted)]">{descripcion}</p>
      {precio && <p className="mt-4 text-lg font-bold text-[#FE9A01]">L {precio}</p>}
      <p className={`mt-1 text-xs font-semibold ${isOutOfStock ? 'text-red-400' : 'text-[var(--color-moncasa-muted)]'}`}>
        {isOutOfStock ? 'Agotado' : `Disponibles: ${normalizedStock}`}
      </p>

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={() =>
          addItem(
            {
              id: productId,
              nombre,
              categoria,
              precio: precio || '0',
            },
            1,
          )
        }
        className="mt-4 w-full rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOutOfStock ? 'Sin inventario' : 'Agregar a cotización'}
      </button>
    </article>
  );
}
