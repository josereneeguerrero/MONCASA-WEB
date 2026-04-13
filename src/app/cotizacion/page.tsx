'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import SiteHeader from '@/components/site-header';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function QuotationPage() {
  const { items, replaceItems, removeItem, updateQuantity, clearCart, total } = useCart();

  useEffect(() => {
    const syncCartPrices = async () => {
      if (!isSupabaseConfigured || !supabase || items.length === 0) {
        return;
      }

      const productsTable = process.env.NEXT_PUBLIC_SUPABASE_PRODUCTS_TABLE ?? 'productos';
      const ids = items.map((item) => item.id);

      const { data } = await supabase
        .from(productsTable)
        .select('id,nombre,categoria,precio,activo')
        .in('id', ids as never[]);

      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      const currentById = new Map(
        data
          .filter((row) => String(row.activo ?? true).toLowerCase() !== 'false')
          .map((row) => [String(row.id), row]),
      );

      const nextItems = items
        .map((item) => {
          const latest = currentById.get(String(item.id));
          if (!latest) {
            return item;
          }

          return {
            ...item,
            nombre: String(latest.nombre ?? item.nombre),
            categoria: String(latest.categoria ?? item.categoria),
            precio: String(latest.precio ?? item.precio),
          };
        })
        .filter((item) => currentById.has(String(item.id)));

      const changed =
        nextItems.length !== items.length ||
        nextItems.some((item, index) => {
          const original = items[index];
          return (
            !original ||
            original.nombre !== item.nombre ||
            original.categoria !== item.categoria ||
            original.precio !== item.precio
          );
        });

      if (changed) {
        replaceItems(nextItems);
      }
    };

    void syncCartPrices();
  }, [items, replaceItems]);

  const whatsappMessage = encodeURIComponent(
    `Hola, me gustaría una cotización para:\n\n${items
      .map((item) => `• ${item.nombre} (${item.categoria})\n  Cantidad: ${item.cantidad}\n  Precio unitario: L ${item.precio}`)
      .join('\n\n')}\n\nTotal estimado: L ${total.toFixed(2)}\n\nPor favor, confirma disponibilidad y envía el presupuesto final.`,
  );

  const whatsappUrl = `https://wa.me/50432184060?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] shadow-[0_18px_60px_var(--color-moncasa-shadow)]">
        <SiteHeader />

        <section className="px-5 py-8 sm:px-8 sm:py-10">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#FE9A01]">Cotización</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--color-moncasa-text)] sm:text-5xl">Tu presupuesto personalizado</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-moncasa-muted)]">
            Recopila los productos que necesitas y envía tu cotización directa a nuestro equipo por WhatsApp.
          </p>

          {items.length === 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-6 py-12 text-center">
              <p className="text-lg text-[var(--color-moncasa-muted)]">No hay productos en tu cotización aún.</p>
              <Link
                href="/productos"
                className="mt-6 inline-block rounded-full bg-[#FE9A01] px-6 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.35fr]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FE9A01]">{item.categoria}</p>
                        <h3 className="mt-2 text-xl font-black text-[var(--color-moncasa-text)]">{item.nombre}</h3>
                        <p className="mt-2 text-lg font-bold text-[#FE9A01]">L {item.precio}</p>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            className="h-6 w-6 rounded text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            className="h-6 w-6 rounded text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-600/30"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 border-t border-[var(--color-moncasa-border)] pt-4 text-lg font-bold text-[var(--color-moncasa-text)]">
                      Subtotal: L {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="sticky top-4 rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Resumen</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--color-moncasa-text)]">Cotización</h2>

                <div className="mt-6 space-y-3 border-t border-[var(--color-moncasa-border)] pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-moncasa-muted)]">Productos</span>
                    <span className="font-semibold text-[var(--color-moncasa-text)]">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-moncasa-muted)]">Cantidad total</span>
                    <span className="font-semibold text-[var(--color-moncasa-text)]">
                      {items.reduce((sum, item) => sum + item.cantidad, 0)} unidades
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--color-moncasa-border)] pt-4">
                  <p className="text-sm text-[var(--color-moncasa-muted)]">Total estimado</p>
                  <p className="mt-2 text-3xl font-black text-[#FE9A01]">L {total.toFixed(2)}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-full bg-[#25D366] px-4 py-3 text-center font-bold text-white transition hover:brightness-95"
                  >
                    💬 Enviar por WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="w-full rounded-full border border-red-400/30 bg-red-400/10 px-4 py-3 font-bold text-red-600 transition hover:bg-red-400/20"
                  >
                    Limpiar cotización
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
