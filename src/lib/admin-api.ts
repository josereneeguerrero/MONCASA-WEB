import 'server-only';

import { createClient } from '@supabase/supabase-js';

let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAdminClient() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan variables de entorno de Supabase para acciones de admin.');
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
}

export type AdminAccessResult =
  | {
      client: ReturnType<typeof getSupabaseAdminClient>;
      email: string;
    }
  | {
      error: string;
      status: number;
    };

export async function requireAdminAccess(request: Request): Promise<AdminAccessResult> {
  const authorizationHeader = request.headers.get('authorization');
  const accessToken = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();
  const supabaseAdmin = getSupabaseAdminClient();

  if (!accessToken) {
    return { error: 'No autorizado.', status: 401 };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  const email = data.user?.email?.trim().toLowerCase();

  if (error || !email) {
    return { error: 'Sesión inválida.', status: 401 };
  }

  const { data: rawRoleRecord, error: roleError } = await supabaseAdmin
    .from('admin_roles')
    .select('role,activo')
    .eq('email', email)
    .maybeSingle();

  const roleRecord = rawRoleRecord as { role?: string; activo?: boolean } | null;

  if (roleError || !roleRecord || !roleRecord.activo) {
    return { error: 'Acceso denegado.', status: 403 };
  }

  const role = String(roleRecord.role ?? 'admin').toLowerCase();

  if (!['owner', 'admin'].includes(role)) {
    return { error: 'Acceso insuficiente.', status: 403 };
  }

  return { client: supabaseAdmin, email };
}
