import { describe, expect, it } from "vitest";
import { geojsonParaLinha, gpxParaLinha } from "./gpx";

const GPX = `<?xml version="1.0"?>
<gpx version="1.1"><trk><trkseg>
  <trkpt lat="-22.6800" lon="-45.6500"><ele>1500</ele></trkpt>
  <trkpt lon="-45.6510" lat="-22.6810"></trkpt>
  <trkpt lat="-22.6820" lon="-45.6520"/>
</trkseg></trk></gpx>`;

describe("gpxParaLinha", () => {
  it("devolve coordenadas [lng, lat] na ordem do arquivo", () => {
    const r = gpxParaLinha(GPX);
    expect(r.coordenadas).toEqual([
      [-45.65, -22.68],
      [-45.651, -22.681],
      [-45.652, -22.682],
    ]);
  });

  it("calcula a distância em metros", () => {
    const r = gpxParaLinha(GPX);
    expect(r.distancia_m).toBeGreaterThan(250);
    expect(r.distancia_m).toBeLessThan(350);
  });

  it("recusa GPX sem pontos", () => {
    expect(() => gpxParaLinha('<gpx version="1.1"><trk><trkseg></trkseg></trk></gpx>')).toThrow("Arquivo sem traçado.");
  });

  it("recusa GPX com um único ponto", () => {
    expect(() => gpxParaLinha('<gpx><trk><trkseg><trkpt lat="-22" lon="-45"/></trkseg></trk></gpx>')).toThrow("Arquivo sem traçado.");
  });

  it("recusa conteúdo que não é GPX", () => {
    expect(() => gpxParaLinha("isto não é xml")).toThrow("Arquivo GPX inválido.");
    expect(() => gpxParaLinha("<gpx><trk>")).toThrow("Arquivo GPX inválido.");
  });

  it("recusa coordenadas fora da faixa válida", () => {
    expect(() => gpxParaLinha('<gpx><trkpt lat="-122" lon="-45"/><trkpt lat="-22" lon="-45"/></gpx>')).toThrow("Arquivo GPX inválido.");
  });
});

describe("geojsonParaLinha", () => {
  it("aceita LineString, Feature e FeatureCollection", () => {
    const linha = { type: "LineString", coordinates: [[-45.65, -22.68], [-45.651, -22.681]] };
    for (const entrada of [linha, { type: "Feature", geometry: linha, properties: {} }, { type: "FeatureCollection", features: [{ type: "Feature", geometry: linha }] }]) {
      expect(geojsonParaLinha(JSON.stringify(entrada)).coordenadas).toEqual(linha.coordinates);
    }
  });

  it("recusa GeoJSON sem LineString e JSON inválido", () => {
    expect(() => geojsonParaLinha(JSON.stringify({ type: "Point", coordinates: [-45, -22] }))).toThrow("Arquivo sem traçado.");
    expect(() => geojsonParaLinha("{")).toThrow("Arquivo GeoJSON inválido.");
  });
});
