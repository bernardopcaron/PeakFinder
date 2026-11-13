"use server";

import { falha, falhaDeValidacao, sucesso, valoresDe, type EstadoFormulario, type ResultadoAcao } from "@/lib/acoes";
import { obterUsuario } from "@/lib/sessao";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaReporte } from "./esquemas";

export async function reportar(_anterior: EstadoFormulario, form: FormData): Promise<ResultadoAcao> {
  const usuario = await obterUsuario();
  if (!usuario) return falha("Entre na sua conta para continuar.", { valores: valoresDe(form) });
  const validado = esquemaReporte.safeParse(Object.fromEntries(form.entries()));
  if (!validado.success) return falhaDeValidacao(validado.error, form);
  const { area_id, setor_id, via_id, tipo, descricao } = validado.data;
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("reportes").insert({ usuario_id: usuario.id, area_id: area_id ?? null, setor_id: setor_id ?? null, via_id: via_id ?? null, tipo, descricao });
  if (error) return falha(undefined, { valores: valoresDe(form) });
  return sucesso(undefined, "Reporte enviado para análise.");
}
