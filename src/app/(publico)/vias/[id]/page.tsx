import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso } from "@/componentes/Aviso";
import { AVISO_DEMONSTRATIVO, Secao } from "@/componentes/Secao";
import { Selo } from "@/componentes/Selo";
import { SeloSituacao } from "@/componentes/SeloSituacao";
import { hojeNoBrasil } from "@/lib/datas";
import { ehUuid } from "@/lib/formato";
import { obterUsuario } from "@/lib/sessao";
import { Comentarios, EnvioFotos, Galeria } from "@/modulos/comunidade";
import { FormReporte } from "@/modulos/moderacao";
import { Avaliar, BotaoFavoritar, FormAscensao } from "@/modulos/escaladas";
import { estadoDaViaParaUsuario } from "@/modulos/escaladas/consultas";
import { FichaTecnica } from "@/modulos/vias";
import { obterVia } from "@/modulos/vias/consultas";

async function carregar(id: string) {
  return ehUuid(id) ? obterVia(id) : null;
}

export async function generateMetadata({ params }: PageProps<"/vias/[id]">): Promise<Metadata> {
  const via = await carregar((await params).id);
  return via ? { title: `${via.nome} (${via.grau}) · ${via.area_nome}` } : {};
}

export default async function PaginaVia({ params }: PageProps<"/vias/[id]">) {
  const via = await carregar((await params).id);
  if (!via) notFound();
  const [usuario, estado] = await Promise.all([obterUsuario(), estadoDaViaParaUsuario(via.id)]);
  const logado = Boolean(usuario);

  return (
    <article className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <header className="space-y-3">
        <nav aria-label="Você está em" className="text-sm text-grafite-600">
          <Link href={`/areas/${via.area_slug}`} className="font-medium text-terracota-700 underline-offset-2 hover:underline">
            {via.area_nome}
          </Link>{" "}
          /{" "}
          <Link href={`/areas/${via.area_slug}/${via.setor_slug}`} className="font-medium text-terracota-700 underline-offset-2 hover:underline">
            {via.setor_nome}
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Selo origem={via.origem} />
          <SeloSituacao situacao={via.situacao} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{via.nome}</h1>
        <p className="text-grafite-600">
          {via.area_municipio} · {via.area_estado}
        </p>
        {via.origem === "demonstrativo" && <Aviso tom="alerta">{AVISO_DEMONSTRATIVO}</Aviso>}
      </header>

      <div className="flex flex-wrap items-start gap-3">
        <BotaoFavoritar viaId={via.id} favoritada={estado.favoritada} logado={logado} />
        <FormAscensao viaId={via.id} modalidade={via.modalidade} ascensoes={estado.ascensoes} logado={logado} hoje={hojeNoBrasil()} />
      </div>

      <FichaTecnica via={via} />

      <Avaliar key={`${estado.minhaNota}`} viaId={via.id} minhaNota={estado.minhaNota} media={via.nota_media} total={via.total_avaliacoes} logado={logado} />

      {via.descricao && (
        <Secao titulo="Descrição">
          <p className="whitespace-pre-line leading-relaxed text-grafite-800">{via.descricao}</p>
        </Secao>
      )}

      <Secao titulo="Fotos e croquis">
        <div className="space-y-4">
          <Galeria fotos={via.fotos} usuarioId={usuario?.id} />
          <EnvioFotos alvo={{ via_id: via.id }} usuarioId={usuario?.id ?? null} />
        </div>
      </Secao>

      <Secao titulo="Comentários">
        <Comentarios alvo={{ via_id: via.id }} usuarioId={usuario?.id ?? null} retorno={`/vias/${via.id}`} />
      </Secao>

      <FormReporte alvo={{ via_id: via.id }} logado={logado} retorno={`/vias/${via.id}`} />
    </article>
  );
}
