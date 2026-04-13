import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { auth, clerkClient } from '@clerk/nextjs/server';

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
      client: SupabaseClient;
      email: string;
    }
  | {
      error: string;
      status: number;
    };

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const session = await auth();
  const { userId } = session;

  if (!userId) {
    return { error: 'No autorizado.', status: 401 };
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email =
    user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ??
    user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ??
    '';

  if (!email) {
    return { error: 'Sesión inválida.', status: 401 };
  }

  const dbClient = getSupabaseAdminClient();

  const { data: rawRoleRecord, error: roleError } = await dbClient
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
