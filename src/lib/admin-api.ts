import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

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

function getSupabaseSessionClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno públicas de Supabase para validar sesión.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export type AdminAccessResult =
  | {
      client: SupabaseClient;
      email: string;
    }
  | {
      error: string;
      status: number;
    };

export async function requireAdminAccess(request: Request): Promise<AdminAccessResult> {
  const authorizationHeader = request.headers.get('authorization');
  const accessToken = authorizationHeader?.replace(/^Bearer\s+/i, '').trim();

  if (!accessToken) {
    return { error: 'No autorizado.', status: 401 };
  }

  const supabaseSession = getSupabaseSessionClient(accessToken);
  const serviceRoleEnabled = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const dbClient = serviceRoleEnabled ? getSupabaseAdminClient() : supabaseSession;

  const { data, error } = await supabaseSession.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase();

  if (error || !email) {
    return { error: 'Sesión inválida.', status: 401 };
  }

  const { data: rawRoleRecord, error: roleError } = await supabaseSession
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

  return { client: dbClient, email };
}
