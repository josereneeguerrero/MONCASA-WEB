"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useConfig } from '@/lib/useConfig';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function Footer() {
  const { get } = useConfig();
  const telefono = get('telefono', '+504 3218-4060');
  const telefonoHref = `tel:${telefono.replace(/[^\d+]/g, '')}`;
  const ubicacion = get('ubicacion', 'San Lorenzo, Valle 02501, Honduras');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [savingNewsletter, setSavingNewsletter] = useState(false);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterStatus('');

    const normalizedEmail = newsletterEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setNewsletterStatus('Ingresa un correo valido para suscribirte.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setNewsletterStatus('No se pudo conectar para guardar el correo.');
      return;
    }

    setSavingNewsletter(true);

    try {
      const contactosTable = process.env.NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE ?? 'contactos';
      const { data: existingRows, error: findError } = await supabase
        .from(contactosTable)
        .select('email')
        .eq('email', normalizedEmail)
        .eq('asunto', 'Newsletter')
        .limit(1);

      if (findError) {
        throw findError;
      }

      if (existingRows && existingRows.length > 0) {
        setNewsletterStatus('Este correo ya esta suscrito.');
        return;
      }

      const { error } = await supabase.from(contactosTable).insert({
        nombre: 'Suscriptor Newsletter',
        email: normalizedEmail,
        telefono: null,
        asunto: 'Newsletter',
        mensaje: 'Suscripcion a noticias desde el footer',
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setNewsletterEmail('');
      setNewsletterStatus('Suscripcion completada. Te avisaremos de novedades.');
    } catch (error) {
      console.error('Error al guardar suscripcion newsletter:', error);
      setNewsletterStatus('No se pudo guardar tu correo. Intenta de nuevo.');
    } finally {
      setSavingNewsletter(false);
    }
  };

  return (
    <footer className="border-t border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-inverse-surface)] px-6 py-12 text-[var(--color-moncasa-inverse-text)] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Información de contacto */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Contactanos</p>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm text-[var(--color-moncasa-inverse-muted)]">Teléfono</p>
                <a href={telefonoHref} className="text-lg font-bold text-[#FE9A01] hover:underline transition">
                  {telefono}
                </a>
              </div>
              <div>
                <p className="text-sm text-[var(--color-moncasa-inverse-muted)]">Ubicación</p>
                <p className="text-base font-semibold text-[var(--color-moncasa-inverse-text)]">{ubicacion}</p>
              </div>
            </div>

            {/* Redes sociales con logos */}
            <div className="mt-8 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-moncasa-inverse-muted)]">Siguenos en redes</p>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/MoncasaHN" 
                  target="_blank" 
                  rel="noreferrer"
                  title="Facebook"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/5 hover:border-[#FE9A01]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.youtube.com/@MoncasaHN" 
                  target="_blank" 
                  rel="noreferrer"
                  title="YouTube"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/5 hover:border-[#FE9A01]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/50432184060" 
                  target="_blank" 
                  rel="noreferrer"
                  title="WhatsApp"
                  className="rounded-lg border border-white/10 p-3 transition hover:bg-white/5 hover:border-[#FE9A01]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.868 1.168l-.358.214-3.709-.973.992 3.63-.235.374a9.86 9.86 0 00-1.51 5.26c.001 5.45 4.436 9.884 9.888 9.884 2.64 0 5.122-1.03 6.988-2.898 1.866-1.869 2.893-4.351 2.893-6.994 0-5.452-4.436-9.887-9.887-9.887m8.589-5.474c-.805-.789-1.793-1.26-2.887-1.26-2.137 0-3.875 1.738-3.875 3.875 0 1.094.471 2.082 1.259 2.887L1.906 24l8.236-2.675c1.8.97 3.991.882 5.691-.819 1.699-1.701 2.786-4.217 2.786-6.973 0-2.757-1.087-5.273-2.786-6.974"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#FE9A01]">Enlaces útiles</p>
            <ul className="mt-6 space-y-3 text-[var(--color-moncasa-inverse-muted)]">
              <li>
                <Link href="/" className="transition hover:text-[#FE9A01] hover:underline">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="transition hover:text-[#FE9A01] hover:underline">
                  Catálogo de productos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="transition hover:text-[#FE9A01] hover:underline">
                  Formulario de contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Llamada a la acción + newsletter */}
          <div className="space-y-4 rounded-xl border border-[#FE9A01]/30 bg-[#FE9A01]/10 p-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#FE9A01]">Solicita una cotización</p>
              <p className="mt-3 text-sm text-[var(--color-moncasa-inverse-muted)]">
                Contáctanos para conocer precios especiales y disponibilidad de productos
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-block rounded-lg bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95"
              >
                Contactanos ahora
              </Link>
            </div>

            <div className="border-t border-[#FE9A01]/25 pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE9A01]">Recibe noticias y ofertas</p>
              <form onSubmit={handleNewsletterSubmit} className="mt-3 flex flex-col gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-white/20 bg-[#0A1116]/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#FE9A01]"
                />
                <button
                  type="submit"
                  disabled={savingNewsletter}
                  className="rounded-lg border border-[#FE9A01]/60 bg-[#FE9A01]/20 px-3 py-2 text-sm font-semibold text-[#FE9A01] transition hover:bg-[#FE9A01]/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNewsletter ? 'Guardando...' : 'Suscribirme'}
                </button>
              </form>
              {newsletterStatus ? (
                <p className="mt-2 text-xs text-[var(--color-moncasa-inverse-muted)]">{newsletterStatus}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="mt-12 border-t border-white/10" />

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--color-moncasa-inverse-muted)]">
            © 2026 Ferretería Moncasa. Todos los derechos reservados. Desarrollada por Renee Guerrero.
          </p>
        </div>
      </div>
    </footer>
  );
}
