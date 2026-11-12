import type { Metadata } from "next";
import Link from "next/link";
import { FormRecuperar } from "@/modulos/perfil/componentes/FormulariosAuth";
import { MolduraConta } from "../MolduraConta";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function PaginaRecuperarSenha() {
  return (
    <MolduraConta
      titulo="Recuperar senha"
      subtitulo="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      rodape={
        <Link href="/entrar" className="font-semibold text-terracota-700 underline-offset-2 hover:underline">
          Voltar para entrar
        </Link>
      }
    >
      <FormRecuperar />
    </MolduraConta>
  );
}
