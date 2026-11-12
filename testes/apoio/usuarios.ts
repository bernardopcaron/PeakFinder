import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./ambiente";

const SEM_SESSAO = { auth: { persistSession: false, autoRefreshToken: false } };
const DOMINIO_TESTE = "@peakfinder.test";
const BUCKETS = ["fotos", "avatares", "modelos"];

export type UsuarioTeste = { cliente: SupabaseClient; id: string; email: string; senha: string };

export function clienteServico(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEM_SESSAO);
}

export function clienteAnonimo(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, SEM_SESSAO);
}

/** Cria um usuário de teste (e-mail e2e+...@peakfinder.test) já autenticado. */
export async function criarUsuarioTeste(papel: "usuario" | "admin" = "usuario", nome = "Usuário de Teste"): Promise<UsuarioTeste> {
  const servico = clienteServico();
  const email = `e2e+${papel}${Date.now()}${Math.random().toString(36).slice(2, 8)}${DOMINIO_TESTE}`;
  const senha = `Senha-${Math.random().toString(36).slice(2)}-9`;
  const { data, error } = await servico.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (error) throw error;
  const id = data.user.id;
  if (papel === "admin") {
    const { error: erroPapel } = await servico.from("perfis").update({ papel: "admin" }).eq("id", id);
    if (erroPapel) throw erroPapel;
  }
  const cliente = clienteAnonimo();
  const { error: erroLogin } = await cliente.auth.signInWithPassword({ email, password: senha });
  if (erroLogin) throw erroLogin;
  return { cliente, id, email, senha };
}

/** Remove os usuários de teste e tudo o que eles criaram (registros e arquivos). */
export async function limparDadosTeste(): Promise<void> {
  const servico = clienteServico();
  const ids: string[] = [];
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await servico.auth.admin.listUsers({ page: pagina, perPage: 200 });
    if (error) throw error;
    ids.push(...data.users.filter((u) => u.email?.startsWith("e2e+") && u.email.endsWith(DOMINIO_TESTE)).map((u) => u.id));
    if (data.users.length < 200) break;
  }
  if (ids.length === 0) return;
  for (const tabela of ["vias", "setores", "areas"]) {
    const { error } = await servico.from(tabela).delete().in("criado_por", ids);
    if (error) throw error;
  }
  for (const bucket of BUCKETS) {
    for (const id of ids) {
      const { data } = await servico.storage.from(bucket).list(id);
      if (data?.length) await servico.storage.from(bucket).remove(data.map((o) => `${id}/${o.name}`));
    }
  }
  for (const id of ids) {
    const { error } = await servico.auth.admin.deleteUser(id);
    if (error) throw error;
  }
}
