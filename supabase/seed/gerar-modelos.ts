// Gera paredes rochosas demonstrativas em GLB, sem dependências: malha com relevo por ruído e cor por vértice.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Malha = { posicoes: Float32Array; normais: Float32Array; cores: Float32Array; indices: Uint32Array };

export const MODELOS_DEMO = [
  { arquivo: "parede-vertical.glb", nome: "Parede vertical (demonstrativa)" },
  { arquivo: "parede-negativa.glb", nome: "Parede negativa (demonstrativa)" },
  { arquivo: "bloco-boulder.glb", nome: "Bloco de boulder (demonstrativo)" },
] as const;

export const PASTA_MODELOS = path.join(path.dirname(fileURLToPath(import.meta.url)), "modelos");

function acaso(x: number, y: number, semente: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + semente * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function ruido(x: number, y: number, semente: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = acaso(xi, yi, semente), b = acaso(xi + 1, yi, semente);
  const c = acaso(xi, yi + 1, semente), d = acaso(xi + 1, yi + 1, semente);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Ruído fractal em [0, 1]. */
function relevo(x: number, y: number, semente: number): number {
  let total = 0, amplitude = 0.5, frequencia = 1;
  for (let i = 0; i < 5; i++) {
    total += ruido(x * frequencia, y * frequencia, semente + i) * amplitude;
    amplitude *= 0.5;
    frequencia *= 2.1;
  }
  return total / 0.96875;
}

function calcularNormais(posicoes: Float32Array, indices: Uint32Array): Float32Array {
  const normais = new Float32Array(posicoes.length);
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
    const e1 = [posicoes[b] - posicoes[a], posicoes[b + 1] - posicoes[a + 1], posicoes[b + 2] - posicoes[a + 2]];
    const e2 = [posicoes[c] - posicoes[a], posicoes[c + 1] - posicoes[a + 1], posicoes[c + 2] - posicoes[a + 2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    for (const v of [a, b, c]) for (let k = 0; k < 3; k++) normais[v + k] += n[k];
  }
  for (let i = 0; i < normais.length; i += 3) {
    const tamanho = Math.hypot(normais[i], normais[i + 1], normais[i + 2]) || 1;
    for (let k = 0; k < 3; k++) normais[i + k] /= tamanho;
  }
  return normais;
}

function corDaRocha(tom: number, base: [number, number, number]): [number, number, number] {
  const f = 0.55 + tom * 0.6;
  return [Math.min(1, base[0] * f), Math.min(1, base[1] * f), Math.min(1, base[2] * f)];
}

function grade(colunas: number, linhas: number, ponto: (u: number, v: number) => { p: [number, number, number]; tom: number }, base: [number, number, number]): Malha {
  const posicoes = new Float32Array((colunas + 1) * (linhas + 1) * 3);
  const cores = new Float32Array(posicoes.length);
  const indices = new Uint32Array(colunas * linhas * 6);
  let n = 0;
  for (let j = 0; j <= linhas; j++) {
    for (let i = 0; i <= colunas; i++) {
      const { p, tom } = ponto(i / colunas, j / linhas);
      posicoes.set(p, n * 3);
      cores.set(corDaRocha(tom, base), n * 3);
      n++;
    }
  }
  let k = 0;
  for (let j = 0; j < linhas; j++) {
    for (let i = 0; i < colunas; i++) {
      const a = j * (colunas + 1) + i, b = a + 1, c = a + colunas + 1, d = c + 1;
      indices.set([a, b, c, b, d, c], k);
      k += 6;
    }
  }
  return { posicoes, normais: calcularNormais(posicoes, indices), cores, indices };
}

/** Parede de `largura` x `altura` metros. `inclinacao` > 0 projeta o topo para a frente (negativo). */
function parede(largura: number, altura: number, inclinacao: number, semente: number, base: [number, number, number]): Malha {
  return grade(96, 128, (u, v) => {
    const r = relevo(u * 6, v * 9, semente);
    const fissuras = Math.pow(Math.abs(Math.sin(u * 23 + relevo(u * 2, v * 3, semente + 9) * 6)), 14) * 0.6;
    const profundidade = (r - 0.5) * 3.2 - fissuras + Math.sin(v * Math.PI) * 0.8;
    return {
      p: [(u - 0.5) * largura, v * altura, profundidade + v * v * altura * inclinacao],
      tom: r * 0.8 + (1 - fissuras) * 0.2,
    };
  }, base);
}

function bloco(raio: number, semente: number, base: [number, number, number]): Malha {
  return grade(72, 48, (u, v) => {
    const theta = u * Math.PI * 2, phi = v * Math.PI;
    const dir: [number, number, number] = [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
    const r = relevo(dir[0] * 2.2 + 5, dir[1] * 2.2 + dir[2] * 2.2 + 5, semente);
    const escala = raio * (0.78 + r * 0.45);
    // Base achatada, como um bloco apoiado no chão.
    const y = Math.max(dir[1] * escala * 0.85, -raio * 0.45);
    return { p: [dir[0] * escala * 1.25, y + raio * 0.45, dir[2] * escala], tom: r };
  }, base);
}

/** Monta um arquivo GLB (glTF 2.0 binário) com uma malha de cores por vértice. */
export function malhaParaGlb(malha: Malha, nome: string): Buffer {
  const partes = [malha.posicoes, malha.normais, malha.cores, malha.indices].map((a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength));
  const deslocamentos: number[] = [];
  let total = 0;
  for (const parte of partes) {
    deslocamentos.push(total);
    total += parte.length;
  }
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < malha.posicoes.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], malha.posicoes[i + k]);
      max[k] = Math.max(max[k], malha.posicoes[i + k]);
    }
  }
  const vertices = malha.posicoes.length / 3;
  const gltf = {
    asset: { version: "2.0", generator: "PeakFinder seed" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: nome }],
    meshes: [{ name: nome, primitives: [{ attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 }, indices: 3, material: 0 }] }],
    materials: [{ name: "Rocha", pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.95 }, doubleSided: true }],
    buffers: [{ byteLength: total }],
    bufferViews: [
      { buffer: 0, byteOffset: deslocamentos[0], byteLength: partes[0].length, target: 34962 },
      { buffer: 0, byteOffset: deslocamentos[1], byteLength: partes[1].length, target: 34962 },
      { buffer: 0, byteOffset: deslocamentos[2], byteLength: partes[2].length, target: 34962 },
      { buffer: 0, byteOffset: deslocamentos[3], byteLength: partes[3].length, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: vertices, type: "VEC3", min, max },
      { bufferView: 1, componentType: 5126, count: vertices, type: "VEC3" },
      { bufferView: 2, componentType: 5126, count: vertices, type: "VEC3" },
      { bufferView: 3, componentType: 5125, count: malha.indices.length, type: "SCALAR" },
    ],
  };
  let json = Buffer.from(JSON.stringify(gltf), "utf8");
  if (json.length % 4) json = Buffer.concat([json, Buffer.alloc(4 - (json.length % 4), 0x20)]);
  const bin = Buffer.concat(partes); // todos os arrays têm elementos de 4 bytes: já alinhado
  const cabecalho = Buffer.alloc(12);
  cabecalho.writeUInt32LE(0x46546c67, 0);
  cabecalho.writeUInt32LE(2, 4);
  cabecalho.writeUInt32LE(12 + 8 + json.length + 8 + bin.length, 8);
  const cabecalhoJson = Buffer.alloc(8);
  cabecalhoJson.writeUInt32LE(json.length, 0);
  cabecalhoJson.writeUInt32LE(0x4e4f534a, 4);
  const cabecalhoBin = Buffer.alloc(8);
  cabecalhoBin.writeUInt32LE(bin.length, 0);
  cabecalhoBin.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([cabecalho, cabecalhoJson, json, cabecalhoBin, bin]);
}

export function gerarModelos(): void {
  mkdirSync(PASTA_MODELOS, { recursive: true });
  const malhas: Record<(typeof MODELOS_DEMO)[number]["arquivo"], Malha> = {
    "parede-vertical.glb": parede(24, 36, 0, 3, [0.62, 0.58, 0.53]),
    "parede-negativa.glb": parede(20, 24, 0.012, 11, [0.7, 0.62, 0.5]),
    "bloco-boulder.glb": bloco(2.6, 21, [0.56, 0.55, 0.54]),
  };
  for (const { arquivo, nome } of MODELOS_DEMO) {
    const glb = malhaParaGlb(malhas[arquivo], nome);
    writeFileSync(path.join(PASTA_MODELOS, arquivo), glb);
    console.log(`${arquivo}: ${(glb.length / 1024).toFixed(0)} KB`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) gerarModelos();
