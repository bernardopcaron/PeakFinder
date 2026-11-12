import { urlPublica } from "@/lib/arquivos";

const PALETAS = [
  ["#3a4047", "#857d70", "#d2b47b"],
  ["#233f29", "#544f47", "#c39d5c"],
  ["#272b30", "#6b6459", "#e17a4d"],
  ["#2a5032", "#3d3a34", "#bdb7ad"],
  ["#463623", "#5f6872", "#ecdfc4"],
];

function semente(texto: string): number {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** Curvas de nível geradas a partir do slug: dão a cada área uma capa própria enquanto não há fotografia. */
function CapaGerada({ slug }: { slug: string }) {
  const s = semente(slug);
  const [fundo, meio, linha] = PALETAS[s % PALETAS.length];
  const cristas = Array.from({ length: 7 }, (_, i) => {
    const base = 30 + i * 13;
    const a = 6 + ((s >> (i * 3)) & 7);
    const fase = ((s >> (i + 5)) & 15) * 9;
    const pontos = Array.from({ length: 9 }, (_, k) => {
      const x = k * 50;
      const y = base - Math.sin((x + fase) / 55) * a - Math.cos((x * (i + 2)) / 170) * (a / 2);
      return `${x},${y.toFixed(1)}`;
    });
    return `M${pontos.join(" L")}`;
  });
  return (
    <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${slug}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={fundo} />
          <stop offset="1" stopColor={meio} />
        </linearGradient>
      </defs>
      <rect width="400" height="120" fill={`url(#g-${slug})`} />
      {cristas.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={linha} strokeWidth={i === 2 ? 1.4 : 0.7} opacity={0.25 + i * 0.07} />
      ))}
    </svg>
  );
}

export function CapaArea({ slug, capaCaminho, nome, className = "" }: { slug: string; capaCaminho: string | null; nome: string; className?: string }) {
  return (
    <div className={`overflow-hidden bg-grafite-800 ${className}`}>
      {capaCaminho ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlPublica("fotos", capaCaminho)} alt={`Foto de ${nome}`} className="h-full w-full object-cover" />
      ) : (
        <CapaGerada slug={slug} />
      )}
    </div>
  );
}
