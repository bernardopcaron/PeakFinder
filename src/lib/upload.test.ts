import { describe, expect, it } from "vitest";
import { validarArquivo } from "./validar-arquivo";

const MB = 1024 * 1024;

describe("validarArquivo", () => {
  it("aceita JPEG de 4 MB como foto", () => {
    expect(validarArquivo({ type: "image/jpeg", size: 4 * MB, name: "a.jpg" }, "foto")).toEqual({ ok: true });
  });
  it("aceita PNG e WebP como foto", () => {
    expect(validarArquivo({ type: "image/png", size: MB, name: "a.png" }, "foto").ok).toBe(true);
    expect(validarArquivo({ type: "image/webp", size: MB, name: "a.webp" }, "foto").ok).toBe(true);
  });
  it("recusa foto de 6 MB", () => {
    expect(validarArquivo({ type: "image/jpeg", size: 6 * MB, name: "a.jpg" }, "foto")).toEqual({
      ok: false,
      erro: "Arquivo muito grande (máx. 5 MB).",
    });
  });
  it("recusa PDF como foto", () => {
    expect(validarArquivo({ type: "application/pdf", size: MB, name: "a.pdf" }, "foto")).toEqual({
      ok: false,
      erro: "Formato não aceito.",
    });
  });
  it("recusa avatar de 3 MB", () => {
    expect(validarArquivo({ type: "image/png", size: 3 * MB, name: "a.png" }, "avatar")).toEqual({
      ok: false,
      erro: "Arquivo muito grande (máx. 2 MB).",
    });
  });
  it("aceita .glb de 40 MB como modelo, mesmo sem tipo MIME", () => {
    expect(validarArquivo({ type: "", size: 40 * MB, name: "Parede.GLB" }, "modelo")).toEqual({ ok: true });
    expect(validarArquivo({ type: "model/gltf+json", size: MB, name: "p.gltf" }, "modelo").ok).toBe(true);
  });
  it("recusa .obj e modelo acima de 50 MB", () => {
    expect(validarArquivo({ type: "", size: MB, name: "p.obj" }, "modelo")).toEqual({ ok: false, erro: "Formato não aceito." });
    expect(validarArquivo({ type: "", size: 51 * MB, name: "p.glb" }, "modelo")).toEqual({
      ok: false,
      erro: "Arquivo muito grande (máx. 50 MB).",
    });
  });
  it("recusa arquivo vazio", () => {
    expect(validarArquivo({ type: "image/jpeg", size: 0, name: "a.jpg" }, "foto")).toEqual({ ok: false, erro: "Arquivo vazio." });
  });
});
