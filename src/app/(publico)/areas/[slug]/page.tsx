import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Aviso } from "@/componentes/Aviso";
import { AVISO_DEMONSTRATIVO, Secao } from "@/componentes/Secao";
import { Selo } from "@/componentes/Selo";
import { SeloSituacao } from "@/componentes/SeloSituacao";
import { urlPublica } from "@/lib/arquivos";
import { Visualizador3D } from "@/modulos/visualizador3d";
import { texto } from "@/lib/formato";
import { AlertaAcesso, CapaArea, ListaSetores } from "@/modulos/areas";
import { obterAreaPorSlug } from "@/modulos/areas/consultas";
import { Galeria } from "@/modulos/comunidade/componentes/Galeria";
import { MiniMapa } from "@/modulos/mapa";
import { TabelaVias } from "@/modulos/vias";
import { listarViasDaArea } from "@/modulos/vias/consultas";

export async function generateMetadata({ params }: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const area = await obterAreaPorSlug((await params).slug);
  return area ? { title: area.nome, description: area.descricao?.slice(0, 160) } : {};
}

export default async function PaginaArea({ params }: PageProps<"/areas/[slug]">) {
  const area = await obterAreaPorSlug((await params).slug);
  if (!area) notFound();
  const vias = await listarViasDaArea(area.id);

  return (
    <article>
      <CapaArea slug={area.slug} capaCaminho={area.capa_caminho} nome={area.nome} className="h-40 md:h-56" />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Selo origem={area.origem} />
            <SeloSituacao situacao={area.situacao} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{area.nome}</h1>
          <p className="text-grafite-600">
            {area.municipio} · {area.estado}
          </p>
          {area.origem === "demonstrativo" && <Aviso tom="alerta">{AVISO_DEMONSTRATIVO}</Aviso>}
          <AlertaAcesso alertas={area.alertas} />
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {area.descricao && <p className="whitespace-pre-line leading-relaxed text-grafite-800">{area.descricao}</p>}
            {area.modelo && (
              <Secao titulo="Modelo 3D">
                <Visualizador3D
                  url={urlPublica("modelos", area.modelo.caminho)}
                  nome={area.modelo.nome}
                  demonstrativo={area.modelo.demonstrativo}
                  fotosReserva={area.fotos.filter((f) => f.tipo === "foto").map((f) => urlPublica("fotos", f.caminho))}
                />
                {area.modelo.descricao && <p className="mt-2 text-sm text-grafite-600">{area.modelo.descricao}</p>}
              </Secao>
            )}
            <Secao titulo="Setores">
              <ListaSetores areaSlug={area.slug} setores={area.setores} />
            </Secao>
            <Secao titulo="Vias">
              <TabelaVias vias={vias} />
            </Secao>
            <Secao titulo="Fotos e croquis">
              <Galeria fotos={area.fotos} />
            </Secao>
          </div>
          <aside className="space-y-6">
            <div className="space-y-2">
              <MiniMapa lat={area.lat} lng={area.lng} />
              <Link href={`/mapa?area=${area.slug}`} className="inline-flex min-h-11 items-center font-semibold text-terracota-700 underline-offset-2 hover:underline">
                Ver no mapa
              </Link>
            </div>
            <dl className="divide-y divide-pedra-200 rounded-xl bg-white ring-1 ring-pedra-200">
              {[
                ["Tipo de rocha", texto(area.tipo_rocha)],
                ["Melhor época", texto(area.melhor_epoca)],
                ["Condições de acesso", texto(area.condicoes_acesso)],
              ].map(([termo, valor]) => (
                <div key={termo} className="p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">{termo}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{valor}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </article>
  );
}
