import type { Metadata } from "next";
import Link from "next/link";
import { Cartao } from "@/componentes/Cartao";
import { classesBotao } from "@/componentes/Botao";
import { exigirUsuario } from "@/lib/sessao";
import { EnvioAvatar, FormPerfil } from "@/modulos/perfil";
import { sair } from "@/modulos/perfil/acoes-auth";

export const metadata: Metadata = { title: "Perfil" };

export default async function PaginaPerfil() {
  const usuario = await exigirUsuario("/perfil");
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
      <Cartao className="space-y-6 p-6">
        <EnvioAvatar usuarioId={usuario.id} nome={usuario.perfil.nome} fotoCaminho={usuario.perfil.foto_caminho} />
        <FormPerfil perfil={usuario.perfil} />
      </Cartao>
      <Cartao className="space-y-3 p-6 text-sm">
        <p>
          <span className="text-grafite-600">E-mail da conta:</span> {usuario.email}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/u/${usuario.perfil.nome_usuario}`} className={classesBotao("secundario")}>
            Ver perfil público
          </Link>
          <Link href="/minhas-escaladas" className={classesBotao("secundario")}>
            Minhas escaladas
          </Link>
          {usuario.perfil.papel === "admin" && (
            <Link href="/admin" className={classesBotao("secundario")}>
              Painel administrativo
            </Link>
          )}
          <form action={sair}>
            <button type="submit" className={classesBotao("fantasma")}>
              Sair da conta
            </button>
          </form>
        </div>
      </Cartao>
    </div>
  );
}
