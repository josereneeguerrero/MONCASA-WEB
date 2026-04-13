'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BrandLogo from '@/components/brand-logo';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Inicia sesión para acceder al panel.');
  const [loading, setLoading] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace('/admin');
    };

    void checkSession();
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

  const onSendReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMessage('Ingresa tu correo para enviar el enlace de recuperación.');
      return;
    }

    setSendingReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setMessage(`No se pudo enviar el correo: ${error.message}`);
      setSendingReset(false);
      return;
    }

    setMessage('Revisa tu correo para definir o restablecer la contraseña.');
    setSendingReset(false);
  };

  return (
    <main className="min-h-screen bg-[var(--color-moncasa-page-bg)] px-4 py-4 text-[var(--color-moncasa-text)] sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center justify-center rounded-[2rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] px-6 py-10 shadow-[0_20px_70px_var(--color-moncasa-shadow)]">
        <div className="grid w-full gap-8 lg:max-w-5xl lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BrandLogo className="h-12 w-12 rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface)] object-cover p-1 shadow-[0_8px_24px_var(--color-moncasa-shadow)]" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.35em] text-[#FE9A01]">FERRETERIA MONCASA</p>
                <p className="text-sm text-[var(--color-moncasa-muted)]">Acceso administrativo</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight">Inicia sesión</h1>
              <p className="max-w-md text-lg leading-8 text-[var(--color-moncasa-muted)]">
                Accede al panel para administrar productos, mensajes, roles y configuración del sitio.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 text-sm text-[var(--color-moncasa-muted)]">
              {message}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 sm:p-6">
            <form className="space-y-4" onSubmit={onSubmit}>
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
              <button
                type="button"
                onClick={() => void onSendReset()}
                disabled={sendingReset}
                className="w-full rounded-xl border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingReset ? 'Enviando enlace...' : 'Definir o recuperar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
