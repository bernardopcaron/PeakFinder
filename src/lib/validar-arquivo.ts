export type TipoArquivo = "foto" | "avatar" | "modelo";

const MB = 1024 * 1024;
const IMAGENS = ["image/jpeg", "image/png", "image/webp"];

export const LIMITES_MB: Record<TipoArquivo, number> = { foto: 5, avatar: 2, modelo: 50 };

export const ACEITA: Record<TipoArquivo, string> = {
  foto: IMAGENS.join(","),
  avatar: IMAGENS.join(","),
  modelo: ".glb,.gltf",
};

export function extensaoDe(nome: string): string {
  const ponto = nome.lastIndexOf(".");
  return ponto === -1 ? "" : nome.slice(ponto + 1).toLowerCase();
}

export function validarArquivo(
  arquivo: { type: string; size: number; name: string },
  tipo: TipoArquivo,
): { ok: true } | { ok: false; erro: string } {
  const formatoOk =
    tipo === "modelo" ? ["glb", "gltf"].includes(extensaoDe(arquivo.name)) : IMAGENS.includes(arquivo.type);
  if (!formatoOk) return { ok: false, erro: "Formato não aceito." };
  if (arquivo.size === 0) return { ok: false, erro: "Arquivo vazio." };
  if (arquivo.size > LIMITES_MB[tipo] * MB) {
    return { ok: false, erro: `Arquivo muito grande (máx. ${LIMITES_MB[tipo]} MB).` };
  }
  return { ok: true };
}
