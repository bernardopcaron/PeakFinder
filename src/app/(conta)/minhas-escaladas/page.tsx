import type { Metadata } from "next";
import { Secao } from "@/componentes/Secao";
import { exigirUsuario } from "@/lib/sessao";
import { ListaAscensoes, ListaFavoritos, ResumoEscaladas, calcularResumo } from "@/modulos/escaladas";
import { listarMeusFavoritos, listarMinhasAscensoes } from "@/modulos/escaladas/consultas";

export const metadata: Metadata = { title: "Minhas escaladas" };

export default async function PaginaMinhasEscaladas() {
  await exigirUsuario("/minhas-escaladas");
  const [ascensoes, favoritos] = await Promise.all([listarMinhasAscensoes(), listarMeusFavoritos()]);
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Minhas escaladas</h1>
      <Secao titulo="Resumo">
        <ResumoEscaladas resumo={calcularResumo(ascensoes)} />
      </Secao>
      <Secao titulo="Ascensões">
        <ListaAscensoes ascensoes={ascensoes} />
      </Secao>
      <Secao titulo="Vias favoritas">
        <ListaFavoritos favoritos={favoritos} />
      </Secao>
    </div>
  );
}
