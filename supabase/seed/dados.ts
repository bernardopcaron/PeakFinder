// Conteúdo demonstrativo do PeakFinder.
// As áreas existem, mas setores, vias, graus, proteções e trilhas abaixo são ILUSTRATIVOS:
// servem para demonstrar o produto e não devem ser usados para planejar uma escalada real.
import type { Modalidade } from "../../src/lib/graus";

export type ViaSeed = {
  nome: string;
  modalidade: Modalidade;
  grau: string;
  altura_m?: number;
  extensao_m?: number;
  costuras?: number;
  protecao: string;
  crux: string;
  descricao: string;
};

export type SetorSeed = {
  nome: string;
  descricao: string;
  deslocamento: [number, number]; // [lat, lng] em relação à área
  orientacao: string;
  tempo_aproximacao_min: number;
  vias: ViaSeed[];
};

export type AreaSeed = {
  nome: string;
  estado: string;
  municipio: string;
  lat: number;
  lng: number;
  tipo_rocha: string | null;
  melhor_epoca: string;
  descricao: string;
  condicoes_acesso: string;
  destaque: boolean;
  modelo: "parede-vertical.glb" | "parede-negativa.glb" | "bloco-boulder.glb" | null;
  setores: SetorSeed[];
};

const AVISO = "Conteúdo demonstrativo: confirme as informações com fontes locais antes de escalar.";

const esportiva = (nome: string, grau: string, altura: number, costuras: number, crux: string): ViaSeed => ({
  nome,
  modalidade: "esportiva",
  grau,
  altura_m: altura,
  extensao_m: altura + 2,
  costuras,
  protecao: "Chapeletas e parada dupla com argola (ilustrativo).",
  crux,
  descricao: `Via esportiva de exemplo com ${costuras} costuras. ${AVISO}`,
});

const tradicional = (nome: string, grau: string, altura: number, extensao: number, crux: string): ViaSeed => ({
  nome,
  modalidade: "tradicional",
  grau,
  altura_m: altura,
  extensao_m: extensao,
  protecao: "Proteção móvel; jogo de friends e nuts (ilustrativo).",
  crux,
  descricao: `Via tradicional de exemplo em várias enfiadas. ${AVISO}`,
});

const mista = (nome: string, grau: string, altura: number, extensao: number, costuras: number, crux: string): ViaSeed => ({
  nome,
  modalidade: "mista",
  grau,
  altura_m: altura,
  extensao_m: extensao,
  costuras,
  protecao: "Chapeletas espaçadas complementadas com proteção móvel (ilustrativo).",
  crux,
  descricao: `Via mista de exemplo. ${AVISO}`,
});

const boulder = (nome: string, grau: string, altura: number, crux: string): ViaSeed => ({
  nome,
  modalidade: "boulder",
  grau,
  altura_m: altura,
  protecao: "Crash pads e segurança de solo (ilustrativo).",
  crux,
  descricao: `Problema de boulder de exemplo. ${AVISO}`,
});

export const AREAS_SEED: AreaSeed[] = [
  {
    nome: "Pedra do Baú",
    estado: "SP",
    municipio: "São Bento do Sapucaí",
    lat: -22.6847,
    lng: -45.6417,
    tipo_rocha: "Gnaisse",
    melhor_epoca: "Abril a setembro",
    descricao: `Complexo rochoso na Serra da Mantiqueira, com paredes longas e vias de diferentes estilos. ${AVISO}`,
    condicoes_acesso: "Acesso por estrada de terra e trilha sinalizada. Verifique regras do monumento natural e horários de visitação.",
    destaque: true,
    modelo: "parede-vertical.glb",
    setores: [
      {
        nome: "Face Norte",
        descricao: "Parede principal, de inclinação vertical, com vias longas.",
        deslocamento: [0.0012, 0.0008],
        orientacao: "Norte",
        tempo_aproximacao_min: 40,
        vias: [
          tradicional("Aresta do Sol", "IVsup", 180, 220, "Diedro da terceira enfiada."),
          mista("Linha do Horizonte", "VIsup", 150, 190, 12, "Passagem de aderência acima do platô."),
          esportiva("Granito Quente", "7b", 30, 11, "Sequência de regletes na metade da via."),
        ],
      },
      {
        nome: "Bauzinho",
        descricao: "Setor de vias curtas e bem protegidas, bom para aquecer.",
        deslocamento: [-0.0015, 0.0021],
        orientacao: "Leste",
        tempo_aproximacao_min: 15,
        vias: [
          esportiva("Primeiro Passo", "IV", 18, 6, "Saída do chão."),
          esportiva("Vento Sul", "V", 22, 8, "Barriga na metade."),
          esportiva("Mantiqueira", "VI", 25, 9, "Travessia para a direita."),
        ],
      },
    ],
  },
  {
    nome: "Serra do Cipó",
    estado: "MG",
    municipio: "Santana do Riacho",
    lat: -19.3447,
    lng: -43.6217,
    tipo_rocha: "Calcário",
    melhor_epoca: "Maio a setembro",
    descricao: `Região de falésias com grande concentração de vias esportivas, de aquecimentos a projetos difíceis. ${AVISO}`,
    condicoes_acesso: "Setores em propriedades particulares. Respeite as regras de cada proprietário e as áreas de estacionamento.",
    destaque: true,
    modelo: "parede-negativa.glb",
    setores: [
      {
        nome: "Grupo 3",
        descricao: "Falésia negativa com vias de resistência.",
        deslocamento: [0.0009, -0.0011],
        orientacao: "Oeste",
        tempo_aproximacao_min: 20,
        vias: [
          esportiva("Calcário Vivo", "7c", 20, 9, "Saída do teto."),
          esportiva("Estalactite", "8a", 22, 10, "Bote para a agarra em pinça."),
          esportiva("Colmeia", "8c", 25, 12, "Sequência de monodedos no negativo."),
          esportiva("Lapa Doce", "9a", 25, 12, "Dinâmico longo no último terço."),
        ],
      },
      {
        nome: "Sala de Justiça",
        descricao: "Setor sombreado com vias verticais de dificuldade moderada.",
        deslocamento: [-0.0013, 0.0007],
        orientacao: "Sul",
        tempo_aproximacao_min: 25,
        vias: [
          esportiva("Veredito", "VIsup", 18, 7, "Regletes pequenos na saída."),
          esportiva("Testemunha", "7a", 20, 8, "Passo de equilíbrio na aresta."),
          esportiva("Apelação", "7b", 20, 8, "Cruzada longa."),
        ],
      },
    ],
  },
  {
    nome: "Itatiaia",
    estado: "RJ",
    municipio: "Itatiaia",
    lat: -22.3839,
    lng: -44.6617,
    tipo_rocha: "Nefelina-sienito",
    melhor_epoca: "Maio a agosto",
    descricao: `Parte alta do parque nacional, com escaladas em altitude, fendas e caneluras características. ${AVISO}`,
    condicoes_acesso: "Dentro de parque nacional: há controle de entrada, limite de visitantes e horário de saída. Consulte o parque antes de ir.",
    destaque: true,
    modelo: null,
    setores: [
      {
        nome: "Prateleiras",
        descricao: "Maciço com vias clássicas de proteção móvel.",
        deslocamento: [0.0011, 0.0014],
        orientacao: "Nordeste",
        tempo_aproximacao_min: 60,
        vias: [
          tradicional("Canaleta Central", "III", 120, 150, "Chaminé final."),
          tradicional("Fenda do Frio", "V", 140, 170, "Fenda de mão na segunda enfiada."),
          tradicional("Travessia das Nuvens", "IIIsup", 100, 180, "Passagem exposta na crista."),
        ],
      },
      {
        nome: "Agulhas",
        descricao: "Paredes de caneluras com escalada de aderência.",
        deslocamento: [-0.002, -0.0016],
        orientacao: "Sul",
        tempo_aproximacao_min: 75,
        vias: [
          tradicional("Caneluras do Sul", "IV", 160, 200, "Lance de aderência sem proteção próxima."),
          mista("Altitude", "VI", 130, 160, 6, "Placa lisa antes da parada."),
        ],
      },
    ],
  },
  {
    nome: "Morro do Anhangava",
    estado: "PR",
    municipio: "Quatro Barras",
    lat: -25.3872,
    lng: -49.0036,
    tipo_rocha: "Granito",
    melhor_epoca: "Abril a outubro",
    descricao: `Morro na Serra da Baraitava, próximo a Curitiba, com vias esportivas e tradicionais em granito. ${AVISO}`,
    condicoes_acesso: "Trilha a partir da base do morro. Há controle de acesso em alguns períodos; confirme antes de ir.",
    destaque: true,
    modelo: null,
    setores: [
      {
        nome: "Paredão Principal",
        descricao: "Parede de aderência e regletes.",
        deslocamento: [0.0007, 0.0009],
        orientacao: "Norte",
        tempo_aproximacao_min: 35,
        vias: [
          esportiva("Aderência Pura", "V", 28, 9, "Placa lisa no meio."),
          esportiva("Cristal", "VIsup", 30, 10, "Reglete de cristal para a mão esquerda."),
          esportiva("Geada", "7a", 30, 11, "Sequência final em regletes."),
          tradicional("Fissura Velha", "IVsup", 60, 75, "Entalamento de punho."),
          esportiva("Neblina", "8b", 25, 10, "Bloqueio de um braço no negativo."),
        ],
      },
    ],
  },
  {
    nome: "Pão de Açúcar",
    estado: "RJ",
    municipio: "Rio de Janeiro",
    lat: -22.9492,
    lng: -43.1545,
    tipo_rocha: "Gnaisse",
    melhor_epoca: "Maio a setembro",
    descricao: `Escalada urbana em paredes longas com vista para a Baía de Guanabara. ${AVISO}`,
    condicoes_acesso: "Acesso pela Pista Cláudio Coutinho, na Urca, com horário de funcionamento. Descida pela trilha ou pelo bondinho, conforme as regras vigentes.",
    destaque: false,
    modelo: null,
    setores: [
      {
        nome: "Face Oeste",
        descricao: "Vias longas de aderência.",
        deslocamento: [0.0006, -0.0012],
        orientacao: "Oeste",
        tempo_aproximacao_min: 25,
        vias: [
          tradicional("Baía Aberta", "IV", 250, 300, "Lance de aderência na quarta enfiada."),
          mista("Costão Claro", "V", 200, 260, 10, "Saída da segunda parada."),
          mista("Maresia", "VIsup", 220, 270, 14, "Placa técnica antes do cume."),
        ],
      },
      {
        nome: "Morro da Babilônia",
        descricao: "Setor vizinho com vias esportivas curtas.",
        deslocamento: [-0.0036, -0.006],
        orientacao: "Sul",
        tempo_aproximacao_min: 15,
        vias: [
          esportiva("Urca", "VI", 25, 9, "Passo de equilíbrio."),
          esportiva("Bondinho", "7a", 28, 10, "Travessia em regletes."),
        ],
      },
    ],
  },
  {
    nome: "Salinas",
    estado: "RJ",
    municipio: "Nova Friburgo",
    lat: -22.335,
    lng: -42.728,
    tipo_rocha: "Granito",
    melhor_epoca: "Maio a setembro",
    descricao: `Vale cercado por grandes paredes, com vias longas e ambiente de montanha. ${AVISO}`,
    condicoes_acesso: "Dentro de parque estadual. Estrada de terra até o vale e aproximações longas; informe-se sobre cadastro de visitantes.",
    destaque: false,
    modelo: null,
    setores: [
      {
        nome: "Capacete",
        descricao: "Parede com vias de várias enfiadas.",
        deslocamento: [0.0018, 0.0012],
        orientacao: "Leste",
        tempo_aproximacao_min: 90,
        vias: [
          tradicional("Vale Aberto", "V", 300, 380, "Diedro da quinta enfiada."),
          mista("Três Picos", "VIsup", 280, 350, 16, "Placa de aderência longa."),
          tradicional("Madrugada", "IVsup", 240, 300, "Chaminé larga."),
          mista("Friburgo", "7a", 200, 250, 18, "Teto pequeno na terceira enfiada."),
        ],
      },
    ],
  },
  {
    nome: "Itacolomi",
    estado: "RS",
    municipio: "Gravataí",
    lat: -29.866,
    lng: -50.917,
    tipo_rocha: null,
    melhor_epoca: "Março a novembro",
    descricao: `Morro na região metropolitana de Porto Alegre, com falésia e blocos. ${AVISO}`,
    condicoes_acesso: "Área em propriedade particular. O acesso depende de autorização; confirme a situação antes de ir.",
    destaque: false,
    modelo: "bloco-boulder.glb",
    setores: [
      {
        nome: "Falésia",
        descricao: "Vias esportivas curtas.",
        deslocamento: [0.0006, 0.0005],
        orientacao: "Norte",
        tempo_aproximacao_min: 20,
        vias: [
          esportiva("Minuano", "V", 15, 6, "Saída em agarras pequenas."),
          esportiva("Pampa", "VIsup", 16, 6, "Bote para o buraco."),
          esportiva("Geada Negra", "7b", 18, 7, "Regletes no negativo."),
        ],
      },
      {
        nome: "Blocos",
        descricao: "Problemas de boulder com boa zona de queda.",
        deslocamento: [-0.0008, 0.0011],
        orientacao: "Variada",
        tempo_aproximacao_min: 10,
        vias: [
          boulder("Chimarrão", "V1", 3, "Saída sentada."),
          boulder("Bergamota", "V3", 4, "Mantel final."),
          boulder("Tropeiro", "V5", 4, "Cruzada para a pinça."),
          boulder("Querência", "V8", 4, "Dinâmico da reglete para a borda."),
        ],
      },
    ],
  },
];
