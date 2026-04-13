import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-api';

type InviteBody = {
  email?: string;
};

export async function POST(request: Request) {
  const access = await requireAdminAccess(request);

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          'No está configurada SUPABASE_SERVICE_ROLE_KEY. Actívala para enviar invitaciones de acceso.',
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
  const redirectTo = `${siteUrl.replace(/\/$/, '')}/login`;

  const { error } = await access.client.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          'No se pudo enviar la invitación. Verifica si el correo ya existe o si Auth SMTP está configurado.',
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
