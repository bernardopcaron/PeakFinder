import { ERRO_GENERICO, type ResultadoAcao } from "./acoes";
import type { Bucket } from "./arquivos";
import { criarClienteNavegador } from "./supabase/navegador";
import { extensaoDe, validarArquivo, type TipoArquivo } from "./validar-arquivo";

export { validarArquivo } from "./validar-arquivo";
export { urlPublica } from "./arquivos";

const TIPO_DO_BUCKET: Record<Bucket, TipoArquivo> = { fotos: "foto", avatares: "avatar", modelos: "modelo" };
const MIME_MODELO: Record<string, string> = { glb: "model/gltf-binary", gltf: "model/gltf+json" };

/** Envia um arquivo do navegador direto ao Storage, na pasta do próprio usuário. */
export async function enviarArquivo(bucket: Bucket, arquivo: File, usuarioId: string): Promise<ResultadoAcao<{ caminho: string }>> {
  const validacao = validarArquivo(arquivo, TIPO_DO_BUCKET[bucket]);
  if (!validacao.ok) return validacao;
  const extensao = extensaoDe(arquivo.name) || "bin";
  const caminho = `${usuarioId}/${crypto.randomUUID()}.${extensao}`;
  const { error } = await criarClienteNavegador()
    .storage.from(bucket)
    .upload(caminho, arquivo, { contentType: bucket === "modelos" ? MIME_MODELO[extensao] : arquivo.type, cacheControl: "31536000" });
  if (error) return { ok: false, erro: /exceeded|too large/i.test(error.message) ? "Arquivo muito grande." : ERRO_GENERICO };
  return { ok: true, dados: { caminho } };
}
