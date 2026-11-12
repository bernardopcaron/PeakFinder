// Acesso à Management API do Supabase (HTTPS). Usado para aplicar migrações e gerar tipos,
// já que a conexão direta ao Postgres nem sempre está disponível.
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!url) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL em .env.local");
if (!token) throw new Error("Defina SUPABASE_ACCESS_TOKEN (token pessoal sbp_...) em .env.local");

export const ref = new URL(url).hostname.split(".")[0];

export async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`https://api.supabase.com/v1/projects/${ref}${caminho}`, {
    ...opcoes,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...opcoes.headers },
  });
  const texto = await resposta.text();
  if (!resposta.ok) throw new Error(`Supabase API ${resposta.status} em ${caminho}: ${texto}`);
  return texto ? JSON.parse(texto) : null;
}

export function sql(query) {
  return api("/database/query", { method: "POST", body: JSON.stringify({ query, read_only: false }) });
}
