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
import { AlertaAcesso } from "@/modulos/areas";
import { obterSetor } from "@/modulos/areas/consultas";
import { classesBotao } from "@/componentes/Botao";
import { obterUsuario } from "@/lib/sessao";
import { EnvioFotos, Galeria } from "@/modulos/comunidade";
import { FormReporte } from "@/modulos/moderacao";
import { TabelaVias } from "@/modulos/vias";
import { listarViasDoSetor } from "@/modulos/vias/consultas";

export async function generateMetadata({ params }: PageProps<"/areas/[slug]/[setor]">): Promise<Metadata> {
  const { slug, setor: setorSlug } = await params;
  const setor = await obterSetor(slug, setorSlug);
  return setor ? { title: `${setor.nome} · ${setor.area.nome}` } : {};
}

export default async function PaginaSetor({ params }: PageProps<"/areas/[slug]/[setor]">) {
  const { slug, setor: setorSlug } = await params;
  const setor = await obterSetor(slug, setorSlug);
  if (!setor) notFound();
  const [vias, usuario] = await Promise.all([listarViasDoSetor(setor.id), obterUsuario()]);
  const caminho = `/areas/${setor.area.slug}/${setor.slug}`;

  return (
    <article className="mx-auto max-w-6xl space-y-8 px-4 py-6">
      <header className="space-y-3">
        <nav aria-label="Você está em" className="text-sm text-grafite-600">
          <Link href={`/areas/${setor.area.slug}`} className="font-medium text-terracota-700 underline-offset-2 hover:underline">
            {setor.area.nome}
          </Link>{" "}
          / Setor
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Selo origem={setor.origem} />
          <SeloSituacao situacao={setor.situacao} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{setor.nome}</h1>
        {setor.origem === "demonstrativo" && <Aviso tom="alerta">{AVISO_DEMONSTRATIVO}</Aviso>}
        <AlertaAcesso alertas={setor.alertas} />
      </header>

      {setor.descricao && <p className="whitespace-pre-line leading-relaxed text-grafite-800">{setor.descricao}</p>}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-pedra-200 ring-1 ring-pedra-200 sm:max-w-md">
        <div className="bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">Orientação</dt>
          <dd className="mt-1 font-medium">{texto(setor.orientacao)}</dd>
        </div>
        <div className="bg-white p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-grafite-600">Aproximação</dt>
          <dd className="mt-1 font-medium">{setor.tempo_aproximacao_min == null ? "—" : `${setor.tempo_aproximacao_min} min`}</dd>
        </div>
      </dl>

      {setor.modelo && (
        <Secao titulo="Modelo 3D">
          <Visualizador3D
            url={urlPublica("modelos", setor.modelo.caminho)}
            nome={setor.modelo.nome}
            demonstrativo={setor.modelo.demonstrativo}
            fotosReserva={setor.fotos.filter((f) => f.tipo === "foto").map((f) => urlPublica("fotos", f.caminho))}
          />
          {setor.modelo.descricao && <p className="mt-2 text-sm text-grafite-600">{setor.modelo.descricao}</p>}
        </Secao>
      )}
      <Secao
        titulo="Vias"
        acao={
          <Link href={`/contribuir/via?setor=${setor.id}`} className={classesBotao("fantasma")}>
            Adicionar via
          </Link>
        }
      >
        <TabelaVias vias={vias} mostrarSetor={false} />
      </Secao>
      <Secao titulo="Fotos e croquis">
        <div className="space-y-4">
          <Galeria fotos={setor.fotos} usuarioId={usuario?.id} />
          <EnvioFotos alvo={{ setor_id: setor.id }} usuarioId={usuario?.id ?? null} />
        </div>
      </Secao>
      <FormReporte alvo={{ setor_id: setor.id }} logado={Boolean(usuario)} retorno={caminho} />
    </article>
  );
}
