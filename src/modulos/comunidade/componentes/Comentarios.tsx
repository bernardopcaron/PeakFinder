import Link from "next/link";
import { Avatar } from "@/componentes/Avatar";
import { dataCurta } from "@/lib/formato";
import { listarComentarios } from "../consultas";
import type { AlvoComentario } from "../tipos";
import { RemoverComentario } from "./BotoesRemover";
import { FormComentario } from "./FormComentario";

export async function Comentarios({ alvo, usuarioId, retorno }: { alvo: AlvoComentario; usuarioId: string | null; retorno: string }) {
  const comentarios = await listarComentarios(alvo);
  return (
    <div className="space-y-4">
      {usuarioId ? (
        <FormComentario alvo={alvo} />
      ) : (
        <p className="text-sm">
          <Link href={`/entrar?retorno=${encodeURIComponent(retorno)}`} className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
            Entre para comentar
          </Link>
        </p>
      )}
      {comentarios.length === 0 ? (
        <p className="text-sm text-grafite-600">Nenhum comentário ainda.</p>
      ) : (
        <ul className="space-y-3">
          {comentarios.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-pedra-200">
              <Avatar nome={c.autor.nome} fotoCaminho={c.autor.foto_caminho} tamanho="p" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <Link href={`/u/${c.autor.nome_usuario}`} className="font-semibold hover:text-terracota-700">
                    {c.autor.nome}
                  </Link>{" "}
                  <span className="text-grafite-600">· {dataCurta(c.criado_em)}</span>
                </p>
                <p className="mt-1 whitespace-pre-line break-words text-grafite-800">{c.texto}</p>
              </div>
              {c.usuario_id === usuarioId && (
                <span className="flex shrink-0 flex-col items-end">
                  <RemoverComentario id={c.id} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
