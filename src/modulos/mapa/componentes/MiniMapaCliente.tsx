"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { criarMapa } from "../base";

export default function MiniMapaCliente({ lat, lng }: { lat: number; lng: number }) {
  const container = useRef<HTMLDivElement>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    return criarMapa(
      { container: container.current, center: [lng, lat], zoom: 11, interactive: false, attributionControl: { compact: true } },
      (mapa) => {
        new maplibregl.Marker({ color: "#b94a22" }).setLngLat([lng, lat]).addTo(mapa);
      },
      () => setFalhou(true),
    );
  }, [lat, lng]);

  if (falhou) {
    return (
      <div className="grid h-full place-items-center bg-pedra-100 p-4 text-center text-sm text-grafite-700">
        Mapa indisponível. Coordenadas: {lat.toFixed(5)}, {lng.toFixed(5)}
      </div>
    );
  }
  return <div ref={container} className="h-full w-full bg-pedra-100" aria-label={`Localização: ${lat.toFixed(5)}, ${lng.toFixed(5)}`} role="img" />;
}
