import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Aviso } from "@/componentes/Aviso";
import { retornoSeguro } from "@/lib/retorno";
import { obterUsuario } from "@/lib/sessao";
import { FormEntrar } from "@/modulos/perfil/componentes/FormulariosAuth";
import { MolduraConta } from "../MolduraConta";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  const parametros = await searchParams;
  const retorno = retornoSeguro(typeof parametros.retorno === "string" ? parametros.retorno : null);
  if (await obterUsuario()) redirect(retorno);
  const sufixo = retorno === "/" ? "" : `?retorno=${encodeURIComponent(retorno)}`;
  return (
    <MolduraConta
      titulo="Entrar"
      subtitulo="Acesse sua conta para favoritar vias, registrar ascensões e contribuir."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link href={`/cadastrar${sufixo}`} className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      {parametros.erro === "link" && (
        <Aviso tom="erro" className="mb-4">
          O link é inválido ou expirou. Peça um novo.
        </Aviso>
      )}
      <FormEntrar retorno={retorno} />
    </MolduraConta>
  );
}
