import { useCallback, useMemo, useState } from "react";

/**
 * Filtro genérico — mantém o shape mínimo necessário pra UI/lógica.
 * O consumer pode estender via generics se precisar de campos custom.
 */
export type ToolbarFilterEntry = {
  id: string;
  columnKey: string;
  op: string;
  value: unknown;
};

export type UseToolbarFiltersOptions<T extends ToolbarFilterEntry = ToolbarFilterEntry> = {
  /** Filtros iniciais */
  initial?: T[];
  /** Gerador de ID — default usa crypto.randomUUID() ou timestamp fallback */
  generateId?: () => string;
};

export type UseToolbarFiltersResult<T extends ToolbarFilterEntry = ToolbarFilterEntry> = {
  list: T[];
  add: (entry: Omit<T, "id"> & { id?: string }) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<T>) => void;
  clear: () => void;
  replaceAll: (next: T[]) => void;
  /** Total de filtros com `value` truthy (válidos pra aplicar). */
  count: number;
};

function defaultId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * useToolbarFilters — helper opcional **standalone** pra gerenciar estado de
 * filtros num `<TableToolbar>` montado à mão (fora do DataTable).
 *
 * ⚠️ **Fronteira**: NÃO é usado pelo DataTable — ele tem seu próprio pipeline
 * (`useDataTableFilters` + `FilterModel` + adapters). Use este apenas em toolbars
 * custom standalone. (`ToolbarFilterEntry` aqui ≠ `FilterItem` do DataTable.)
 *
 * Retorna:
 *   - `list`: array de filtros
 *   - `add(entry)`: adiciona um filtro (gera id automático se omitido)
 *   - `remove(id)`: remove por id
 *   - `update(id, patch)`: atualiza parcialmente
 *   - `clear()`: zera tudo
 *   - `replaceAll(next)`: substitui array completo
 *   - `count`: total de filtros com `value` truthy (válidos pra aplicar)
 *
 * Uso (opcional — vc pode usar useState direto também):
 *
 *   const filters = useToolbarFilters({ initial: [...] });
 *   filters.add({ columnKey: "status", op: "equals", value: "active" });
 *   filters.remove("f_abc");
 */
export function useToolbarFilters<T extends ToolbarFilterEntry = ToolbarFilterEntry>(
  options?: UseToolbarFiltersOptions<T>,
): UseToolbarFiltersResult<T> {
  const { initial = [], generateId = defaultId } = options ?? {};
  const [list, setList] = useState<T[]>(initial as T[]);

  const add = useCallback(
    (entry: Omit<T, "id"> & { id?: string }) => {
      setList((prev) => [
        ...prev,
        { ...entry, id: entry.id ?? generateId() } as T,
      ]);
    },
    [generateId],
  );

  const remove = useCallback((id: string) => {
    setList((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const update = useCallback((id: string, patch: Partial<T>) => {
    setList((prev) =>
      prev.map((f) => (f.id === id ? ({ ...f, ...patch } as T) : f)),
    );
  }, []);

  const clear = useCallback(() => setList([]), []);
  const replaceAll = useCallback((next: T[]) => setList(next), []);

  const count = useMemo(
    () =>
      list.filter((f) => {
        if (f.value === null || f.value === undefined) return false;
        if (typeof f.value === "string") return f.value.length > 0;
        if (Array.isArray(f.value)) return f.value.length > 0;
        return true;
      }).length,
    [list],
  );

  return { list, add, remove, update, clear, replaceAll, count };
}
