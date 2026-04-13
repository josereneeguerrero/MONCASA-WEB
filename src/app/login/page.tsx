'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandLogo from '@/components/brand-logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Inicia sesión para acceder al panel.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace('/admin');
    };

    checkSession();
  }, [router]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Verificando credenciales...');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage('Error al iniciar sesión.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] text-[var(--color-moncasa-text)]">
      <section className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <div className="w-full rounded-3xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#FE9A01]">
              Ferretería Moncasa
            </p>
          </div>
          <h1 className="text-3xl font-semibold">Acceso administrativo</h1>
          <p className="mt-3 text-sm text-[var(--color-moncasa-muted)]">{message}</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-4 py-3 outline-none placeholder:text-[var(--color-moncasa-muted-strong)] focus:border-[#FE9A01]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] px-4 py-3 outline-none placeholder:text-[var(--color-moncasa-muted-strong)] focus:border-[#FE9A01]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#FE9A01] px-4 py-3 font-semibold text-[#0A1116] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}