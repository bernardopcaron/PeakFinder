import { urlPublica } from "@/lib/arquivos";

const TAMANHOS = { p: "h-10 w-10 text-sm", m: "h-16 w-16 text-xl", g: "h-24 w-24 text-3xl" };

export function Avatar({ nome, fotoCaminho, tamanho = "m" }: { nome: string; fotoCaminho: string | null; tamanho?: keyof typeof TAMANHOS }) {
  const classes = `${TAMANHOS[tamanho]} shrink-0 rounded-full ring-2 ring-white`;
  if (fotoCaminho) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={urlPublica("avatares", fotoCaminho)} alt={`Foto de ${nome}`} className={`${classes} object-cover`} />;
  }
  const iniciais = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  return (
    <span aria-hidden="true" className={`${classes} grid place-items-center bg-mata-700 font-bold text-white`}>
      {iniciais || "?"}
    </span>
  );
}
