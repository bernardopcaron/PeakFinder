import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { retornoSeguro } from "@/lib/retorno";
import { obterUsuario } from "@/lib/sessao";
import { FormCadastrar } from "@/modulos/perfil/componentes/FormulariosAuth";
import { MolduraConta } from "../MolduraConta";

export const metadata: Metadata = { title: "Criar conta" };

export default async function PaginaCadastrar({ searchParams }: PageProps<"/cadastrar">) {
  const parametros = await searchParams;
  const retorno = retornoSeguro(typeof parametros.retorno === "string" ? parametros.retorno : null);
  if (await obterUsuario()) redirect(retorno);
  const sufixo = retorno === "/" ? "" : `?retorno=${encodeURIComponent(retorno)}`;
  return (
    <MolduraConta
      titulo="Criar conta"
      subtitulo="Leva menos de um minuto."
      rodape={
        <>
          Já tem conta?{" "}
          <Link href={`/entrar${sufixo}`} className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <FormCadastrar retorno={retorno} />
    </MolduraConta>
  );
}
