import { NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin-api';

export async function DELETE(request: Request) {
  const access = await requireAdminAccess();

  if ('error' in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const body = (await request.json().catch(() => null)) as { id?: string | number } | null;
  const query = body?.id
    ? access.client.from('admin_audit_logs').delete().eq('id', body.id)
    : access.client.from('admin_audit_logs').delete().neq('id', -1);

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: `No se pudo borrar la auditoría: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
