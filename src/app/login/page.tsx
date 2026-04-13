'use client';

import { SignIn } from '@clerk/nextjs';
import BrandLogo from '@/components/brand-logo';

export default function LoginPage() {
  const clerkReady = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
              Si eres propietario o administrador, usa tu correo invitado. Si no recuerdas la contraseña, Clerk te permite recuperarla desde el mismo flujo de acceso.
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--color-moncasa-border)] bg-[var(--color-moncasa-surface-soft)] p-4 sm:p-6">
            {clerkReady ? (
              <SignIn routing="path" path="/login" appearance={{ elements: { cardBox: 'shadow-none border-0' } }} />
            ) : (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm text-[var(--color-moncasa-text)]">
                Clerk no está configurado en este entorno. Revisa NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY y CLERK_SECRET_KEY en Vercel.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
