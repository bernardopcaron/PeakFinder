import { urlPublica } from "@/lib/arquivos";
import type { Foto } from "@/modulos/areas/tipos";
import { RemoverFoto } from "./BotoesRemover";

export function Galeria({ fotos, usuarioId = null, vazio = "Ainda não há fotos." }: { fotos: Foto[]; usuarioId?: string | null; vazio?: string }) {
  if (fotos.length === 0) return <p className="text-sm text-grafite-600">{vazio}</p>;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="galeria">
      {fotos.map((foto) => (
        <li key={foto.id}>
          <figure className="overflow-hidden rounded-lg bg-white ring-1 ring-pedra-200">
            <a href={urlPublica("fotos", foto.caminho)} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlPublica("fotos", foto.caminho)}
                alt={foto.legenda || (foto.tipo === "croqui" ? "Croqui" : "Foto enviada pela comunidade")}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </a>
            <figcaption className="flex items-center gap-2 px-2 py-1.5 text-xs text-grafite-700">
              {foto.tipo === "croqui" && <span className="rounded bg-grafite-800 px-1.5 py-0.5 font-semibold text-white">Croqui</span>}
              <span className="truncate">{foto.legenda}</span>
            </figcaption>
            {foto.enviado_por === usuarioId && usuarioId && (
              <div className="border-t border-pedra-200 px-1">
                <RemoverFoto id={foto.id} />
              </div>
            )}
          </figure>
        </li>
      ))}
    </ul>
  );
}
