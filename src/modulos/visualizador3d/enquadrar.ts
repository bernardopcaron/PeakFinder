type Vetor = [number, number, number];

export type Enquadramento = { posicao: Vetor; alvo: Vetor; distancia: number };

const RAIO_MINIMO = 0.5;
const FOLGA = 1.15;
// Direção da câmera em relação ao alvo: de frente, um pouco acima e de lado.
const DIRECAO: Vetor = [0.35, 0.25, 1];

/** Posição de câmera que enquadra por inteiro a caixa envolvente do modelo. */
export function calcularEnquadramento(caixa: { min: Vetor; max: Vetor }, fovGraus: number): Enquadramento {
  const alvo = caixa.min.map((v, i) => (v + caixa.max[i]) / 2) as Vetor;
  const raio = Math.max(Math.hypot(...caixa.max.map((v, i) => v - caixa.min[i])) / 2, RAIO_MINIMO);
  const distancia = (raio / Math.sin((fovGraus * Math.PI) / 360)) * FOLGA;
  const norma = Math.hypot(...DIRECAO);
  const posicao = alvo.map((v, i) => v + (DIRECAO[i] / norma) * distancia) as Vetor;
  return { posicao, alvo, distancia };
}
