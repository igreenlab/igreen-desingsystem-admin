import type {
  DataTableViewMode,
  GridRowId,
  SortModel,
} from "../data-table.types";
import type { ColumnPinned, TableDensity } from "../../Table";

const STORAGE_PREFIX = "igreen-datatable:";
const SCHEMA_VERSION = 3; // v3: adicionado viewMode/groupBy/expandedRowIds (Default workspace completo)

/** Subset persistido — exclui filters, search, page (volátil entre sessões). */
export type PersistedDataTableState = {
  version: number;
  density?: TableDensity;
  /** Multi-sort: array. Migrado de single object pra array em v2. */
  sortModel?: SortModel[] | null;
  pageSize?: number;
  columnWidths?: Record<string, number>;
  pinnedColumns?: Record<string, ColumnPinned>;
  hiddenColumns?: string[];
  columnOrder?: string[];
  /** Modo de visualização (table OR kanban). Persistido em v3. */
  viewMode?: DataTableViewMode;
  /** Field de agrupamento (Fase F.4). Persistido em v3. */
  groupBy?: string;
  /** Rows expandidas (Fase F.4b). Persistido em v3. */
  expandedRowIds?: GridRowId[];
  /** Ultima view ativa (preset id, saved view id, ou null pra Default). */
  lastActiveViewId?: string | null;
};

export type LoadedPersistedState = Omit<PersistedDataTableState, "version">;

function storageKey(persistId: string): string {
  return `${STORAGE_PREFIX}${persistId}`;
}

/** Le do localStorage. Retorna null se vazio, schema antigo, ou parse falhou. */
export function loadPersistedState(
  persistId: string | undefined,
): LoadedPersistedState | null {
  if (!persistId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(persistId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedDataTableState;
    if (parsed.version !== SCHEMA_VERSION) return null;
    const { version: _v, ...state } = parsed;
    return state;
  } catch {
    return null;
  }
}

/** Salva no localStorage. Inclui version pro schema. */
export function savePersistedState(
  persistId: string | undefined,
  state: LoadedPersistedState,
): void {
  if (!persistId || typeof window === "undefined") return;
  try {
    const payload: PersistedDataTableState = { version: SCHEMA_VERSION, ...state };
    window.localStorage.setItem(storageKey(persistId), JSON.stringify(payload));
  } catch {
    // localStorage cheio / disabled / quota — silencioso, persist é best-effort.
  }
}

/** Remove entry do localStorage (usado pelo reset). */
export function clearPersistedState(persistId: string | undefined): void {
  if (!persistId || typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey(persistId));
  } catch {
    // ignore
  }
}
