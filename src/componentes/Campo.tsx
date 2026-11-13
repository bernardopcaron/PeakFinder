import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

const CLASSES_INPUT =
  "mt-1 block w-full rounded-lg border border-pedra-300 bg-white px-3 py-2.5 text-base text-grafite-900 shadow-sm placeholder:text-pedra-500 aria-[invalid=true]:border-terracota-600";

function Moldura({ id, rotulo, erro, ajuda, children }: { id: string; rotulo: string; erro?: string; ajuda?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-grafite-800">
        {rotulo}
      </label>
      {children}
      {ajuda && !erro && (
        <p id={`${id}-ajuda`} className="mt-1 text-sm text-grafite-600">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} role="alert" className="mt-1 text-sm font-medium text-terracota-700">
          {erro}
        </p>
      )}
    </div>
  );
}

type Comum = { rotulo: string; erro?: string; ajuda?: string; name: string };

function descricao(id: string, erro?: string, ajuda?: string) {
  return erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined;
}

export function Campo({ rotulo, erro, ajuda, ...props }: Comum & InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id ?? `campo-${props.name}`;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda}>
      <input {...props} id={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao(id, erro, ajuda)} className={CLASSES_INPUT} />
    </Moldura>
  );
}

export function CampoTexto({ rotulo, erro, ajuda, ...props }: Comum & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = props.id ?? `campo-${props.name}`;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda}>
      <textarea rows={4} {...props} id={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao(id, erro, ajuda)} className={CLASSES_INPUT} />
    </Moldura>
  );
}

export function CampoSelecao({ rotulo, erro, ajuda, children, ...props }: Comum & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = props.id ?? `campo-${props.name}`;
  return (
    <Moldura id={id} rotulo={rotulo} erro={erro} ajuda={ajuda}>
      {/* O React limpa o formulário após uma ação; a chave faz o select voltar ao valor devolvido pelo servidor. */}
      <select key={props.value === undefined ? String(props.defaultValue ?? "") : undefined} {...props} id={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao(id, erro, ajuda)} className={CLASSES_INPUT}>
        {children}
      </select>
    </Moldura>
  );
}
