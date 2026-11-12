import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./ambiente";
import type { Database } from "./tipos-banco";

/** Cliente Supabase para componentes de servidor, Server Actions e rotas. Usa a sessão do usuário. */
export async function criarClienteServidor() {
  const armazenamento = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => armazenamento.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) armazenamento.set(name, value, options);
        } catch {
          // Componentes de servidor não podem gravar cookies; o proxy renova a sessão.
        }
      },
    },
  });
}
