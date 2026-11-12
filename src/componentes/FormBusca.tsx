export function FormBusca({ valor = "", grande = false }: { valor?: string; grande?: boolean }) {
  return (
    <form action="/buscar" role="search" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={valor}
        aria-label="Buscar áreas, vias ou municípios"
        placeholder="Buscar áreas, vias ou municípios"
        minLength={2}
        required
        className={`min-w-0 flex-1 rounded-lg border border-pedra-300 bg-white px-4 text-base text-grafite-900 shadow-sm placeholder:text-pedra-500 ${grande ? "min-h-13 py-3" : "min-h-11"}`}
      />
      <button type="submit" className="min-h-11 shrink-0 rounded-lg bg-terracota-600 px-5 text-sm font-semibold text-white hover:bg-terracota-700">
        Buscar
      </button>
    </form>
  );
}
