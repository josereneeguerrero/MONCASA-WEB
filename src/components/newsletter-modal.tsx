'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const LS_SUBSCRIBED = 'moncasa-newsletter-subscribed';
const LS_NEXT_PROMPT_AT = 'moncasa-newsletter-next-prompt-at';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function NewsletterModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const isBlockedSurface = useMemo(() => {
    return pathname?.startsWith('/admin') || pathname === '/login';
  }, [pathname]);

  useEffect(() => {
    if (isBlockedSurface) {
      setOpen(false);
      return;
    }

    const subscribed = typeof window !== 'undefined' ? localStorage.getItem(LS_SUBSCRIBED) === '1' : false;
    if (subscribed) {
      setOpen(false);
      return;
    }

    const nextPromptRaw = typeof window !== 'undefined' ? localStorage.getItem(LS_NEXT_PROMPT_AT) : null;
    const nextPromptAt = nextPromptRaw ? Number.parseInt(nextPromptRaw, 10) : 0;

    if (nextPromptAt && Date.now() < nextPromptAt) {
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 7000);

    return () => window.clearTimeout(timer);
  }, [isBlockedSurface]);

  const postponeModal = (days: number) => {
    localStorage.setItem(LS_NEXT_PROMPT_AT, String(Date.now() + days * ONE_DAY_MS));
    setOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setMessage('Ingresa un correo valido para continuar.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessage('No pudimos conectar para guardar el correo.');
      return;
    }

    setSaving(true);

    try {
      const contactsTable = process.env.NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE ?? 'contactos';
      const { data: existingRows, error: existingError } = await supabase
        .from(contactsTable)
        .select('email')
        .eq('email', normalizedEmail)
        .eq('asunto', 'Newsletter')
        .limit(1);

      if (existingError) {
        throw existingError;
      }

      if (existingRows && existingRows.length > 0) {
        localStorage.setItem(LS_SUBSCRIBED, '1');
        setMessage('Este correo ya estaba suscrito.');
        setOpen(false);
        return;
      }

      const { error } = await supabase.from(contactsTable).insert({
        nombre: 'Suscriptor Newsletter',
        email: normalizedEmail,
        telefono: null,
        asunto: 'Newsletter',
        mensaje: 'Suscripcion a noticias desde popup',
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      localStorage.setItem(LS_SUBSCRIBED, '1');
      setEmail('');
      setOpen(false);
    } catch (submitError) {
      console.error('Error newsletter modal:', submitError);
      setMessage('No se pudo guardar el correo. Intenta otra vez.');
    } finally {
      setSaving(false);
    }
  };

  if (!open || isBlockedSurface) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A1116]/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#FE9A01]/30 bg-[var(--color-moncasa-surface)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FE9A01]">Noticias Moncasa</p>
        <h3 className="mt-2 text-2xl font-black leading-tight text-[var(--color-moncasa-text)]">
          Recibe ofertas y novedades antes que todos
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-moncasa-muted)]">
          Dejanos tu correo y te enviaremos promociones y avisos importantes de productos.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-page-bg)] px-4 py-3 text-sm text-[var(--color-moncasa-text)] outline-none placeholder:text-[var(--color-moncasa-muted)] focus:border-[#FE9A01]"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#FE9A01] px-4 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Quiero recibir noticias'}
          </button>
        </form>

        <div className="mt-3 flex justify-end text-xs">
          <button
            type="button"
            onClick={() => postponeModal(7)}
            className="rounded-lg border border-[var(--color-moncasa-border)] px-3 py-1.5 font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]"
          >
            Recordarmelo luego
          </button>
        </div>

        {message ? (
          <p className="mt-3 text-xs font-medium text-[#FE9A01]">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
