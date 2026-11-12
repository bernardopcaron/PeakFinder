import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) throw new Error(`Variável de ambiente ausente: ${nome}`);
  return valor;
}

export const SUPABASE_URL = exigir("NEXT_PUBLIC_SUPABASE_URL");
export const SUPABASE_ANON_KEY = exigir("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = exigir("SUPABASE_SERVICE_ROLE_KEY");
