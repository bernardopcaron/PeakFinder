"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { type Map as MapaLibre, type Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { CENTRO_BRASIL, ZOOM_BRASIL, criarMapa } from "../base";

export type Ponto = { lat: number; lng: number };

export default function SeletorPontoCliente({ valor, onChange }: { valor: Ponto | null; onChange: (p: Ponto) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MapaLibre | null>(null);
  const marcador = useRef<Marker | null>(null);
  const aoMudar = useRef(onChange);
  useEffect(() => {
    aoMudar.current = onChange;
  });
  const [estado, setEstado] = useState<"carregando" | "pronto" | "falhou">("carregando");

  useEffect(() => {
    if (!container.current) return;
    const limpar = criarMapa(
      { container: container.current, center: CENTRO_BRASIL, zoom: ZOOM_BRASIL, attributionControl: { compact: true } },
      (mapa) => {
        mapaRef.current = mapa;
        mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        mapa.on("click", (evento) => {
          aoMudar.current({ lat: Number(evento.lngLat.lat.toFixed(6)), lng: Number(evento.lngLat.lng.toFixed(6)) });
        });
        setEstado("pronto");
      },
      () => setEstado("falhou"),
    );
    return () => {
      mapaRef.current = null;
      marcador.current = null;
      limpar();
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (estado !== "pronto" || !mapa) return;
    const valido = valor && Number.isFinite(valor.lat) && Number.isFinite(valor.lng) && Math.abs(valor.lat) <= 90 && Math.abs(valor.lng) <= 180;
    if (!valido) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    if (!marcador.current) marcador.current = new maplibregl.Marker({ color: "#b94a22" }).setLngLat([valor.lng, valor.lat]).addTo(mapa);
    else marcador.current.setLngLat([valor.lng, valor.lat]);
    if (!mapa.getBounds().contains([valor.lng, valor.lat])) mapa.easeTo({ center: [valor.lng, valor.lat], zoom: Math.max(mapa.getZoom(), 10) });
  }, [valor, estado]);

  if (estado === "falhou") {
    return <p className="rounded-lg bg-pedra-100 p-4 text-sm text-grafite-700">Mapa indisponível. Informe a latitude e a longitude nos campos abaixo.</p>;
  }
  return <div ref={container} className="h-64 w-full overflow-hidden rounded-lg bg-pedra-100 ring-1 ring-pedra-300" role="application" aria-label="Toque no mapa para marcar o ponto" />;
}
