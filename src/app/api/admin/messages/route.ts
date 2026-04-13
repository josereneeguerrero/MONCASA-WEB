import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-api';

export async function DELETE(request: Request) {
  const access = await requireAdminAccess();

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = (await request.json().catch(() => null)) as { id?: string | number } | null;
  const contactsTable = process.env.NEXT_PUBLIC_SUPABASE_CONTACTS_TABLE ?? 'contactos';
  const query = body?.id ? access.client.from(contactsTable).delete().eq('id', body.id) : access.client.from(contactsTable).delete().neq('id', -1);
  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: `No se pudieron borrar los mensajes: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
