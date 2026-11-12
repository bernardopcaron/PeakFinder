"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { calcularEnquadramento, type Enquadramento } from "../enquadrar";

type Estado = "carregando" | "pronto" | "erro";

const FOV = 45;

function liberar(objeto: THREE.Object3D) {
  objeto.traverse((item) => {
    const malha = item as THREE.Mesh;
    malha.geometry?.dispose();
    const materiais = Array.isArray(malha.material) ? malha.material : malha.material ? [malha.material] : [];
    for (const material of materiais) {
      for (const valor of Object.values(material)) if (valor instanceof THREE.Texture) valor.dispose();
      material.dispose();
    }
  });
}

const formatar = (v: THREE.Vector3) => [v.x, v.y, v.z].map((n) => Number(n.toFixed(2))).join(",");

export default function Cena({
  url,
  nome,
  demonstrativo,
  fotosReserva = [],
}: {
  url: string;
  nome: string;
  demonstrativo: boolean;
  fotosReserva?: string[];
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const suporte = useRef<HTMLDivElement>(null);
  const reenquadrar = useRef<() => void>(() => {});
  const [estado, setEstado] = useState<Estado>("carregando");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const alvo = suporte.current;
    const marca = raiz.current;
    if (!alvo || !marca) return;
    let ativo = true;
    let quadro = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // Sem WebGL (aparelho antigo ou aceleração desligada): mostramos o aviso e as fotos.
      queueMicrotask(() => ativo && setEstado("erro"));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    alvo.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-label", `Modelo 3D: ${nome}. Arraste para girar, use dois dedos ou a roda do mouse para aproximar.`);
    renderer.domElement.setAttribute("role", "img");
    // O canvas acompanha o tamanho do suporte; sem isso, em telas de alta densidade ele empurra o layout e cresce sem parar.
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%", touchAction: "none" });

    const cena = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 5000);
    cena.add(new THREE.HemisphereLight(0xffffff, 0x54504a, 1.6));
    const sol = new THREE.DirectionalLight(0xfff2dd, 2.2);
    sol.position.set(0.6, 1, 0.8);
    cena.add(sol);

    const controles = new OrbitControls(camera, renderer.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.12;
    const registrarCamera = () => {
      marca.dataset.camera = formatar(camera.position);
    };
    controles.addEventListener("change", registrarCamera);

    const ajustarTamanho = () => {
      const { clientWidth: largura, clientHeight: altura } = alvo;
      if (largura === 0 || altura === 0) return;
      renderer.setSize(largura, altura, false);
      camera.aspect = largura / altura;
      camera.updateProjectionMatrix();
    };
    const observador = new ResizeObserver(ajustarTamanho);
    observador.observe(alvo);
    ajustarTamanho();

    const aplicar = (e: Enquadramento) => {
      // Descarrega a inércia de um arrasto anterior antes de posicionar, para a câmera parar exatamente no enquadramento.
      controles.enableDamping = false;
      controles.update();
      camera.position.set(...e.posicao);
      controles.target.set(...e.alvo);
      camera.near = Math.max(e.distancia / 500, 0.01);
      camera.far = e.distancia * 20;
      camera.updateProjectionMatrix();
      controles.minDistance = e.distancia * 0.08;
      controles.maxDistance = e.distancia * 4;
      controles.update();
      controles.enableDamping = true;
      registrarCamera();
    };

    let modelo: THREE.Object3D | null = null;
    new GLTFLoader().load(
      url,
      (gltf) => {
        if (!ativo) {
          liberar(gltf.scene);
          return;
        }
        modelo = gltf.scene;
        cena.add(modelo);
        const caixa = new THREE.Box3().setFromObject(modelo);
        if (caixa.isEmpty()) {
          setEstado("erro");
          return;
        }
        const enquadramento = calcularEnquadramento({ min: caixa.min.toArray(), max: caixa.max.toArray() }, FOV);
        reenquadrar.current = () => aplicar(enquadramento);
        aplicar(enquadramento);
        setEstado("pronto");
      },
      undefined,
      () => ativo && setEstado("erro"),
    );

    const animar = () => {
      quadro = requestAnimationFrame(animar);
      controles.update();
      renderer.render(cena, camera);
    };
    animar();

    return () => {
      ativo = false;
      cancelAnimationFrame(quadro);
      observador.disconnect();
      controles.removeEventListener("change", registrarCamera);
      controles.dispose();
      if (modelo) liberar(modelo);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      reenquadrar.current = () => {};
    };
  }, [url, nome, tentativa]);

  const tentarDeNovo = () => {
    setEstado("carregando");
    setTentativa((t) => t + 1);
  };

  return (
    <div ref={raiz} data-testid="visualizador-3d" data-estado={estado} className="relative overflow-hidden rounded-xl bg-gradient-to-b from-grafite-700 to-grafite-900 ring-1 ring-grafite-800">
      <div ref={suporte} className={`h-80 w-full md:h-[28rem] ${estado === "erro" ? "hidden" : ""}`} />

      {estado === "carregando" && (
        <p role="status" className="absolute inset-0 grid place-items-center text-sm font-medium text-areia-50">
          Carregando o modelo 3D…
        </p>
      )}

      {estado === "pronto" && (
        <>
          {demonstrativo && (
            <span className="absolute left-3 top-3 rounded-full bg-areia-100 px-3 py-1 text-xs font-semibold text-areia-900">Modelo demonstrativo</span>
          )}
          <button
            type="button"
            onClick={() => reenquadrar.current()}
            className="absolute right-3 top-3 min-h-11 rounded-lg bg-white/95 px-4 text-sm font-semibold text-grafite-900 shadow hover:bg-white"
          >
            Reenquadrar
          </button>
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-pedra-200">Arraste para girar · pinça ou roda do mouse para aproximar</p>
        </>
      )}

      {estado === "erro" && (
        <div className="space-y-3 p-5 text-areia-50">
          <p role="alert" className="font-semibold">
            Não foi possível carregar o modelo 3D
          </p>
          <p className="text-sm text-pedra-200">O arquivo pode estar indisponível ou este aparelho pode não ter suporte a gráficos 3D.</p>
          <button type="button" onClick={tentarDeNovo} className="min-h-11 rounded-lg bg-white px-4 text-sm font-semibold text-grafite-900 hover:bg-pedra-100">
            Tentar de novo
          </button>
          {fotosReserva.length > 0 && (
            <ul className="grid grid-cols-3 gap-2 pt-2">
              {fotosReserva.slice(0, 6).map((foto) => (
                <li key={foto}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={foto} alt="Foto do local" loading="lazy" className="aspect-square w-full rounded object-cover" />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
