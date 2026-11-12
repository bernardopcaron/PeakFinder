"use client";

import dynamic from "next/dynamic";

const MiniMapaCliente = dynamic(() => import("./MiniMapaCliente"), { ssr: false });

export function MiniMapa({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div data-testid="minimapa" className="h-48 overflow-hidden rounded-xl ring-1 ring-pedra-200">
      <MiniMapaCliente lat={lat} lng={lng} />
    </div>
  );
}
