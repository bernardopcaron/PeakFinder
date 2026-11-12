import Link from "next/link";
import { classesBotao } from "@/componentes/Botao";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-terracota-700">Erro 404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Página não encontrada</h1>
      <p className="mt-2 text-grafite-600">O endereço não existe ou o conteúdo ainda não está disponível.</p>
      <Link href="/" className={`${classesBotao()} mt-6`}>
        Voltar para Explorar
      </Link>
    </div>
  );
}
