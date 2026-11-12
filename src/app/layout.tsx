import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import { BarraSuperior } from "@/componentes/BarraSuperior";
import { NavInferior } from "@/componentes/NavInferior";
import { MenuUsuario } from "@/componentes/MenuUsuario";
import { obterUsuario } from "@/lib/sessao";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PeakFinder", template: "%s · PeakFinder" },
  description: "Conheça a parede antes de chegar até ela: áreas, setores e vias de escalada no Brasil.",
};

export const viewport: Viewport = { themeColor: "#17191c", viewportFit: "cover" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const usuario = await obterUsuario();
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <BarraSuperior>
          <MenuUsuario usuario={usuario} />
        </BarraSuperior>
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <NavInferior />
      </body>
    </html>
  );
}
