// Secondary Supabase client pointing to an EXTERNAL project (not Lovable Cloud).
// Reads EXTERNAL_SUPABASE_URL / EXTERNAL_SUPABASE_SERVICE_ROLE_KEY so the
// Cloud-managed SUPABASE_* env vars cannot override it.
// SECURITY: service-role client - server-only. Do not import from client code.
// Load inside server handlers: const { supabaseExternal } = await import("@/integrations/supabase/client.external");
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseExternalClient() {
  const URL = process.env.EXTERNAL_SUPABASE_URL;
  const KEY = process.env.EXTERNAL_SUPABASE_SERVICE_ROLE_KEY;

  if (!URL || !KEY) {
    const missing = [
      ...(!URL ? ['EXTERNAL_SUPABASE_URL'] : []),
      ...(!KEY ? ['EXTERNAL_SUPABASE_SERVICE_ROLE_KEY'] : []),
    ];
    const message = `Missing external Supabase environment variable(s): ${missing.join(', ')}.`;
    console.error(`[SupabaseExternal] ${message}`);
    throw new Error(message);
  }

  return createClient<Database>(URL, KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseExternal: ReturnType<typeof createSupabaseExternalClient> | undefined;

export const supabaseExternal = new Proxy({} as ReturnType<typeof createSupabaseExternalClient>, {
  get(_, prop, receiver) {
    if (!_supabaseExternal) _supabaseExternal = createSupabaseExternalClient();
    return Reflect.get(_supabaseExternal, prop, receiver);
  },
});
