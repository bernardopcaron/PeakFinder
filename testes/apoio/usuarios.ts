import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./ambiente";

const SEM_SESSAO = { auth: { persistSession: false, autoRefreshToken: false } };

export function clienteServico(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEM_SESSAO);
}

export function clienteAnonimo(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, SEM_SESSAO);
}
