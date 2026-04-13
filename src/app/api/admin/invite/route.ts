import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdminAccess } from '@/lib/admin-api';
import { sendInvitationEmail } from '@/lib/resend';

type InviteBody = {
  email?: string;
};

export async function POST(request: Request) {
  const access = await requireAdminAccess();

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return NextResponse.json(
      {
        error:
          'No están configuradas RESEND_API_KEY y RESEND_FROM_EMAIL. Actívalas para enviar invitaciones.',
      },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as InviteBody | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Debes enviar un correo válido.' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const loginUrl = `${siteUrl.replace(/\/$/, '')}/login`;
  const clerk = await clerkClient();

  const invitation = await clerk.invitations.createInvitation({
    emailAddress: email,
    notify: false,
    ignoreExisting: true,
    redirectUrl: loginUrl,
  });

  if (!invitation.url) {
    return NextResponse.json(
      {
        error: 'No se pudo generar el enlace de invitación.',
      },
      { status: 400 },
    );
  }

  try {
    await sendInvitationEmail({
      to: email,
      invitationUrl: invitation.url,
      invitedBy: access.email,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo enviar el correo de invitación.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
