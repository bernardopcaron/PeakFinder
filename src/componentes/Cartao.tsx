import type { HTMLAttributes } from "react";

export function Cartao({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded-xl bg-white shadow-sm ring-1 ring-pedra-200 ${className}`} />;
}
