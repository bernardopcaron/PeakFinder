import Link from "next/link";
import type { Usuario } from "@/lib/sessao";
import { sair } from "@/modulos/perfil/acoes-auth";

export function MenuUsuario({ usuario }: { usuario: Usuario | null }) {
  if (!usuario) {
    return (
      <Link href="/entrar" className="flex min-h-11 items-center rounded-md bg-terracota-600 px-4 font-semibold text-white hover:bg-terracota-500">
        Entrar
      </Link>
    );
  }
  return (
    <>
      <Link href="/perfil" data-testid="usuario-nome" className="flex min-h-11 max-w-36 items-center truncate font-medium text-areia-50 hover:underline">
        {usuario.perfil.nome.split(" ")[0]}
      </Link>
      <form action={sair}>
        <button type="submit" className="min-h-11 rounded-md px-3 text-pedra-200 hover:bg-grafite-800 hover:text-white">
          Sair
        </button>
      </form>
    </>
  );
}
