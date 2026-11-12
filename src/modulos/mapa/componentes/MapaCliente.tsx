"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { type GeoJSONSource, type Map as MapaLibre, type Marker } from "maplibre-gl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Supercluster from "supercluster";
import { plural } from "@/lib/formato";
import { CENTRO_BRASIL, ZOOM_BRASIL, criarMapa, criarPino } from "../base";
import { filtrarAreas, temFiltro } from "../filtros";
import { SEM_FILTROS, type ColecaoMapa, type FeatureMapa, type FiltrosMapa, type PropsArea } from "../tipos";
import { CartaoMarcador } from "./CartaoMarcador";
import { PainelFiltros } from "./PainelFiltros";

const ZOOM_DETALHE = 11;

type Estado = "carregando" | "pronto" | "falhou";

const doTipo = (colecao: ColecaoMapa, tipos: string[]) => ({
  type: "FeatureCollection" as const,
  features: colecao.features.filter((f) => tipos.includes(f.properties.tipo)),
});

export default function MapaCliente({ colecao, areaInicial }: { colecao: ColecaoMapa; areaInicial?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MapaLibre | null>(null);
  const marcadores = useRef<Marker[]>([]);
  const [estado, setEstado] = useState<Estado>("carregando");
  const [filtros, setFiltros] = useState<FiltrosMapa>(SEM_FILTROS);
  const [painelAberto, setPainelAberto] = useState(false);
  const [escolhida, setSelecionada] = useState<PropsArea | null>(null);

  const filtrada = useMemo(() => filtrarAreas(colecao, filtros), [colecao, filtros]);
  const areas = useMemo(
    () => filtrada.features.filter((f): f is Extract<FeatureMapa, { properties: PropsArea }> => f.properties.tipo === "area"),
    [filtrada],
  );
  const indice = useMemo(() => {
    const sc = new Supercluster<PropsArea>({ radius: 60, maxZoom: 13 });
    sc.load(areas.map((f) => ({ type: "Feature" as const, geometry: f.geometry, properties: f.properties })));
    return sc;
  }, [areas]);

  // A área escolhida deixa de valer quando um filtro a remove do mapa.
  const selecionada = escolhida && areas.some((a) => a.properties.slug === escolhida.slug) ? escolhida : null;

  // Guardados em refs para os ouvintes do mapa enxergarem sempre os valores atuais.
  const indiceRef = useRef(indice);
  const selecionadaRef = useRef(selecionada);
  useEffect(() => {
    indiceRef.current = indice;
    selecionadaRef.current = selecionada;
  });

  const desenharMarcadores = useRef(() => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    for (const m of marcadores.current) m.remove();
    marcadores.current = [];
    const b = mapa.getBounds();
    const grupos = indiceRef.current.getClusters([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()], Math.floor(mapa.getZoom()));
    for (const grupo of grupos) {
      const [lng, lat] = grupo.geometry.coordinates as [number, number];
      const props = grupo.properties as PropsArea & { cluster?: boolean; cluster_id?: number; point_count?: number };
      let elemento: HTMLButtonElement;
      if (props.cluster) {
        const id = props.cluster_id!;
        const nomes = indiceRef.current.getLeaves(id, Infinity).map((folha) => folha.properties.nome);
        elemento = criarPino(`${props.point_count} áreas — aproximar`, "grupo");
        elemento.textContent = String(props.point_count);
        elemento.dataset.areas = nomes.join("|");
        elemento.addEventListener("click", () => {
          mapa.easeTo({ center: [lng, lat], zoom: Math.min(indiceRef.current.getClusterExpansionZoom(id) + 0.5, 15), duration: 500 });
        });
      } else {
        elemento = criarPino(props.nome);
        elemento.setAttribute("aria-pressed", String(selecionadaRef.current?.slug === props.slug));
        elemento.addEventListener("click", () => setSelecionada(props));
      }
      marcadores.current.push(new maplibregl.Marker({ element: elemento }).setLngLat([lng, lat]).addTo(mapa));
    }
  });

  useEffect(() => {
    if (!container.current) return;
    const inicial = areaInicial ? colecao.features.find((f) => f.properties.tipo === "area" && f.properties.slug === areaInicial) : undefined;
    const limpar = criarMapa(
      {
        container: container.current,
        center: inicial ? (inicial.geometry.coordinates as [number, number]) : CENTRO_BRASIL,
        zoom: inicial ? 12.5 : ZOOM_BRASIL,
        attributionControl: { compact: true },
      },
      (mapa) => {
        mapaRef.current = mapa;
        mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
        mapa.addSource("trilhas", { type: "geojson", data: doTipo(colecao, ["trilha"]) });
        mapa.addSource("setores", { type: "geojson", data: doTipo(colecao, ["setor"]) });
        mapa.addLayer({
          id: "trilhas",
          type: "line",
          source: "trilhas",
          minzoom: ZOOM_DETALHE,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#33643c", "line-width": 3, "line-dasharray": [1.5, 1.5] },
        });
        mapa.addLayer({
          id: "setores",
          type: "circle",
          source: "setores",
          minzoom: ZOOM_DETALHE,
          paint: { "circle-radius": 6, "circle-color": "#17191c", "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 },
        });
        mapa.addLayer({
          id: "setores-rotulos",
          type: "symbol",
          source: "setores",
          minzoom: ZOOM_DETALHE + 1,
          layout: { "text-field": ["get", "nome"], "text-size": 12, "text-offset": [0, 1.2], "text-anchor": "top", "text-font": ["Noto Sans Regular"] },
          paint: { "text-color": "#17191c", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
        });
        mapa.on("moveend", () => desenharMarcadores.current());
        if (inicial) setSelecionada(inicial.properties as PropsArea);
        desenharMarcadores.current();
        setEstado("pronto");
        (window as unknown as { __mapaPronto?: boolean }).__mapaPronto = true;
      },
      () => setEstado("falhou"),
    );
    return () => {
      for (const m of marcadores.current) m.remove();
      marcadores.current = [];
      mapaRef.current = null;
      (window as unknown as { __mapaPronto?: boolean }).__mapaPronto = false;
      limpar();
    };
    // O mapa é criado uma única vez; os dados mudam pelos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (estado !== "pronto" || !mapa) return;
    (mapa.getSource("trilhas") as GeoJSONSource | undefined)?.setData(doTipo(filtrada, ["trilha"]));
    (mapa.getSource("setores") as GeoJSONSource | undefined)?.setData(doTipo(filtrada, ["setor"]));
    desenharMarcadores.current();
  }, [filtrada, estado, selecionada]);

  const irPara = (area: (typeof areas)[number]) => {
    setSelecionada(area.properties);
    setPainelAberto(false);
    mapaRef.current?.easeTo({ center: area.geometry.coordinates, zoom: Math.max(mapaRef.current.getZoom(), 12), duration: 600 });
  };

  const listaAreas = (
    <ul data-testid="lista-areas" className="divide-y divide-pedra-200">
      {areas.map((area) => (
        <li key={area.properties.slug} className="flex items-center gap-2">
          {estado === "pronto" ? (
            <button type="button" onClick={() => irPara(area)} className="min-h-12 flex-1 py-2 text-left hover:text-terracota-700">
              <span className="block font-medium">{area.properties.nome}</span>
              <span className="block text-sm text-grafite-600">
                {area.properties.municipio} · {area.properties.estado} · {plural(area.properties.total_vias, "via", "vias")}
              </span>
            </button>
          ) : (
            <Link href={`/areas/${area.properties.slug}`} className="min-h-12 flex-1 py-2 hover:text-terracota-700">
              <span className="block font-medium">{area.properties.nome}</span>
              <span className="block text-sm text-grafite-600">
                {area.properties.municipio} · {area.properties.estado} · {plural(area.properties.total_vias, "via", "vias")}
              </span>
            </Link>
          )}
        </li>
      ))}
      {areas.length === 0 && <li className="py-4 text-sm text-grafite-600">Nenhuma área com esses filtros.</li>}
    </ul>
  );

  return (
    <div className="relative flex h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-3.5rem)]" data-testid="mapa" data-estado={estado}>
      <aside
        className={`${painelAberto ? "block" : "hidden"} absolute inset-x-0 bottom-0 z-20 max-h-[75%] overflow-y-auto rounded-t-2xl bg-areia-50 p-4 shadow-2xl md:static md:block md:max-h-none md:w-80 md:shrink-0 md:rounded-none md:border-r md:border-pedra-200 md:shadow-none`}
        aria-label="Filtros e áreas"
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <h2 className="text-lg font-bold">Filtros</h2>
          <button type="button" onClick={() => setPainelAberto(false)} className="min-h-11 px-3 font-semibold text-terracota-700">
            Concluir
          </button>
        </div>
        <PainelFiltros filtros={filtros} onChange={setFiltros} />
        <div className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-grafite-600">Áreas</h2>
          {listaAreas}
        </div>
      </aside>

      <div className="relative min-w-0 flex-1">
        {estado === "falhou" ? (
          <div className="h-full overflow-y-auto p-4">
            <div role="alert" className="rounded-lg border border-areia-400 bg-areia-100 px-4 py-3 text-sm text-areia-900">
              <p className="font-semibold">Não foi possível carregar o mapa</p>
              <p className="mt-1">Você ainda pode abrir as áreas pela lista.</p>
            </div>
            <div className="mt-4 md:hidden">{listaAreas}</div>
          </div>
        ) : (
          <div ref={container} className="h-full w-full bg-pedra-100" role="application" aria-label="Mapa de áreas de escalada" />
        )}

        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-center gap-2">
          <span data-testid="contador-areas" className="pointer-events-auto rounded-full bg-white px-4 py-2 text-sm font-semibold shadow ring-1 ring-pedra-200">
            {plural(areas.length, "área", "áreas")}
          </span>
          <button
            type="button"
            onClick={() => setPainelAberto(true)}
            className="pointer-events-auto min-h-11 rounded-full bg-grafite-900 px-4 text-sm font-semibold text-white shadow md:hidden"
          >
            Filtros{temFiltro(filtros) ? ` (${filtros.modalidades.length + filtros.faixas.length})` : ""}
          </button>
        </div>

        {estado === "carregando" && (
          <p role="status" className="absolute inset-x-0 top-16 z-10 mx-auto w-fit rounded-full bg-white px-4 py-2 text-sm shadow">
            Carregando o mapa…
          </p>
        )}

        {selecionada && estado === "pronto" && (
          <div className="absolute inset-x-3 bottom-3 z-10 md:left-auto md:right-14 md:w-80">
            <CartaoMarcador area={selecionada} aoFechar={() => setSelecionada(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
