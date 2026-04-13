'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function AuthControls() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton>
            <button className="whitespace-nowrap rounded-full border border-[var(--color-moncasa-border)] px-4 py-2 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]">
              Iniciar sesión
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="whitespace-nowrap rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95">
              Crear cuenta
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
