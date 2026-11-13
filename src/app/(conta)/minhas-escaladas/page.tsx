import type { Metadata } from "next";
import { Aviso } from "@/componentes/Aviso";
import { Secao } from "@/componentes/Secao";
import { exigirUsuario } from "@/lib/sessao";
import { MinhasContribuicoes } from "@/modulos/comunidade";
import { listarMinhasContribuicoes } from "@/modulos/comunidade/consultas";
import { ListaAscensoes, ListaFavoritos, ResumoEscaladas, calcularResumo } from "@/modulos/escaladas";
import { listarMeusFavoritos, listarMinhasAscensoes } from "@/modulos/escaladas/consultas";

export const metadata: Metadata = { title: "Minhas escaladas" };

const AVISOS: Record<string, string> = {
  area: "Enviado para análise. Você verá aqui quando for aprovado.",
  setor: "Enviado para análise. Você verá aqui quando for aprovado.",
  via: "Enviado para análise. Você verá aqui quando for aprovado.",
  edicao: "Alterações salvas.",
};

export default async function PaginaMinhasEscaladas({ searchParams }: PageProps<"/minhas-escaladas">) {
  const { enviado } = await searchParams;
  const aviso = typeof enviado === "string" ? AVISOS[enviado] : undefined;
  await exigirUsuario("/minhas-escaladas");
  const [ascensoes, favoritos, contribuicoes] = await Promise.all([listarMinhasAscensoes(), listarMeusFavoritos(), listarMinhasContribuicoes()]);
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Minhas escaladas</h1>
      {aviso && <Aviso tom="sucesso">{aviso}</Aviso>}
      <Secao titulo="Resumo">
        <ResumoEscaladas resumo={calcularResumo(ascensoes)} />
      </Secao>
      <Secao titulo="Ascensões">
        <ListaAscensoes ascensoes={ascensoes} />
      </Secao>
      <Secao titulo="Vias favoritas">
        <ListaFavoritos favoritos={favoritos} />
      </Secao>
      <Secao titulo="Minhas contribuições">
        <MinhasContribuicoes contribuicoes={contribuicoes} />
      </Secao>
    </div>
  );
}
