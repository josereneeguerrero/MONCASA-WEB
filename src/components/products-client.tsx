'use client';

import { useMemo, useState } from 'react';
import { ProductCard } from './product-card';

type Product = {
  id: string | number;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  stock?: string;
  imagen_url?: string;
};

type ProductsClientProps = {
  products: Product[];
};

export function ProductsClient({ products }: ProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Extraer categorías únicas
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.categoria))].sort(),
    [products],
  );

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = parseFloat(product.precio) || 0;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;

      const matchesSearch =
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !selectedCategory || product.categoria === selectedCategory;
      const matchesPrice = price >= min && price <= max;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* FILTROS */}
      <div className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-black text-[var(--color-moncasa-text)]">Filtros</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* BÚSQUEDA */}
          <div className="lg:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-moncasa-muted)]">
              Buscar
            </label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre o descripción..."
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
            />
          </div>

          {/* CATEGORÍA */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-moncasa-muted)]">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none focus:border-[#FE9A01]/50"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* PRECIO MÍNIMO */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-moncasa-muted)]">
              Precio mín.
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
            />
          </div>

          {/* PRECIO MÁXIMO */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-[var(--color-moncasa-muted)]">
              Precio máx.
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="∞"
              min="0"
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-3 py-2 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]/50"
            />
          </div>
        </div>

        {/* RESULTADOS */}
        <p className="mt-4 text-xs text-[var(--color-moncasa-muted)]">
          <span className="font-semibold text-[var(--color-moncasa-text)]">{filteredProducts.length}</span> de{' '}
          <span className="font-semibold text-[var(--color-moncasa-text)]">{products.length}</span> producto
          {products.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              nombre={product.nombre}
              categoria={product.categoria}
              descripcion={product.descripcion}
              precio={product.precio}
              stock={product.stock}
              imagen_url={product.imagen_url}
            />
          ))
        ) : (
          <div className="col-span-full rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)]/50 px-6 py-12 text-center">
            <p className="text-[var(--color-moncasa-muted)]">
              {products.length === 0 ? 'Sin productos.' : 'Sin resultados.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
