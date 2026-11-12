export type Linha = { coordenadas: [number, number][]; distancia_m: number };

const RAIO_TERRA_M = 6371008.8;

function distanciaMetros(coordenadas: [number, number][]): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < coordenadas.length; i++) {
    const [lng1, lat1] = coordenadas[i - 1];
    const [lng2, lat2] = coordenadas[i];
    const a =
      Math.sin(rad(lat2 - lat1) / 2) ** 2 +
      Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
    total += 2 * RAIO_TERRA_M * Math.asin(Math.sqrt(a));
  }
  return Math.round(total);
}

function coordenadaValida([lng, lat]: [number, number]): boolean {
  return Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function montar(coordenadas: [number, number][], erroInvalido: string): Linha {
  if (!coordenadas.every(coordenadaValida)) throw new Error(erroInvalido);
  if (coordenadas.length < 2) throw new Error("Arquivo sem traçado.");
  return { coordenadas, distancia_m: distanciaMetros(coordenadas) };
}

/** Extrai o traçado (pontos de trilha ou de rota) de um arquivo GPX. */
export function gpxParaLinha(conteudo: string): Linha {
  const invalido = "Arquivo GPX inválido.";
  if (!/<gpx[\s>]/i.test(conteudo) || !/<\/gpx>/i.test(conteudo)) throw new Error(invalido);
  const coordenadas: [number, number][] = [];
  for (const ponto of conteudo.matchAll(/<(?:trkpt|rtept)\b([^>]*)>/gi)) {
    const lat = /\blat\s*=\s*["']([^"']+)["']/i.exec(ponto[1]);
    const lon = /\blon\s*=\s*["']([^"']+)["']/i.exec(ponto[1]);
    if (!lat || !lon) throw new Error(invalido);
    coordenadas.push([Number(lon[1]), Number(lat[1])]);
  }
  return montar(coordenadas, invalido);
}

type Geo = { type?: string; coordinates?: unknown; geometry?: Geo; features?: Geo[] };

function acharLinha(geo: Geo | undefined): unknown {
  if (!geo) return undefined;
  if (geo.type === "LineString") return geo.coordinates;
  if (geo.type === "Feature") return acharLinha(geo.geometry);
  if (geo.type === "FeatureCollection") {
    for (const f of geo.features ?? []) {
      const linha = acharLinha(f);
      if (linha) return linha;
    }
  }
  return undefined;
}

/** Extrai a primeira LineString de um GeoJSON (geometria, Feature ou FeatureCollection). */
export function geojsonParaLinha(conteudo: string): Linha {
  const invalido = "Arquivo GeoJSON inválido.";
  let geo: Geo;
  try {
    geo = JSON.parse(conteudo);
  } catch {
    throw new Error(invalido);
  }
  const linha = acharLinha(geo);
  if (!Array.isArray(linha)) throw new Error("Arquivo sem traçado.");
  const coordenadas = linha.map((c) => {
    if (!Array.isArray(c) || c.length < 2) throw new Error(invalido);
    return [Number(c[0]), Number(c[1])] as [number, number];
  });
  return montar(coordenadas, invalido);
}

/** WKT aceito pelo PostGIS para gravar o traçado. */
export function linhaParaWkt(coordenadas: [number, number][]): string {
  return `SRID=4326;LINESTRING(${coordenadas.map(([lng, lat]) => `${lng} ${lat}`).join(",")})`;
}
