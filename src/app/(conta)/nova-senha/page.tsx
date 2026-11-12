import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/sessao";
import { FormNovaSenha } from "@/modulos/perfil/componentes/FormulariosAuth";
import { MolduraConta } from "../MolduraConta";

export const metadata: Metadata = { title: "Nova senha" };

export default async function PaginaNovaSenha() {
  await exigirUsuario("/nova-senha");
  return (
    <MolduraConta titulo="Nova senha" subtitulo="Escolha a senha que você usará daqui em diante.">
      <FormNovaSenha />
    </MolduraConta>
  );
}
