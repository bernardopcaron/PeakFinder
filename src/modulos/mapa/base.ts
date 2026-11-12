import * as maplibregl from "maplibre-gl";
import { type Map as MapaLibre, type MapOptions } from "maplibre-gl";

export const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/liberty";
export const CENTRO_BRASIL: [number, number] = [-51.9, -14.2];
export const ZOOM_BRASIL = 3.6;
const TEMPO_LIMITE_MS = 15000;

let workerConfigurado = false;

/**
 * Cria o mapa e avisa quando ele carregou ou quando o mapa-base não pôde ser carregado.
 * Devolve a função de limpeza.
 */
export function criarMapa(
  opcoes: Omit<MapOptions, "style">,
  aoCarregar: (mapa: MapaLibre) => void,
  aoFalhar: () => void,
): () => void {
  let carregado = false;
  let encerrado = false;
  let mapa: MapaLibre;
  const falhar = () => {
    if (!carregado && !encerrado) {
      encerrado = true;
      aoFalhar();
    }
  };
  try {
    if (!workerConfigurado) {
      maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");
      workerConfigurado = true;
    }
    mapa = new maplibregl.Map({ ...opcoes, style: ESTILO_MAPA });
  } catch {
    falhar();
    return () => {};
  }
  const limite = setTimeout(falhar, TEMPO_LIMITE_MS);
  mapa.on("load", () => {
    if (encerrado) return;
    carregado = true;
    clearTimeout(limite);
    aoCarregar(mapa);
  });
  mapa.on("error", falhar);
  return () => {
    encerrado = true;
    clearTimeout(limite);
    mapa.remove();
  };
}

export function criarPino(rotulo: string, classeExtra = ""): HTMLButtonElement {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.setAttribute("aria-label", rotulo);
  botao.className = `pino-mapa ${classeExtra}`;
  return botao;
}
