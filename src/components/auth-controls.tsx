'use client';

import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

type AuthControlsProps = {
  variant?: 'inline' | 'stacked';
};

export default function AuthControls({ variant = 'inline' }: AuthControlsProps) {
  const wrapperClassName =
    variant === 'stacked' ? 'flex w-full flex-col gap-2' : 'flex items-center gap-2';

  const signInButtonClassName =
    variant === 'stacked'
      ? 'w-full rounded-full border border-[var(--color-moncasa-border)] px-4 py-3 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]'
      : 'whitespace-nowrap rounded-full border border-[var(--color-moncasa-border)] px-4 py-2 text-sm font-semibold text-[var(--color-moncasa-text)] transition hover:bg-[var(--color-moncasa-hover)]';

  const signUpButtonClassName =
    variant === 'stacked'
      ? 'w-full rounded-full bg-[#FE9A01] px-4 py-3 text-sm font-bold text-[#0A1116] transition hover:brightness-95'
      : 'whitespace-nowrap rounded-full bg-[#FE9A01] px-4 py-2 text-sm font-bold text-[#0A1116] transition hover:brightness-95';

  return (
    <>
      <Show when="signed-out">
        <div className={wrapperClassName}>
          <SignInButton>
            <button className={signInButtonClassName}>
              Iniciar sesión
            </button>
          </SignInButton>
          <SignUpButton>
            <button className={signUpButtonClassName}>
              Crear cuenta
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className={variant === 'stacked' ? 'flex w-full justify-center' : ''}>
          <UserButton />
        </div>
      </Show>
    </>
  );
}
