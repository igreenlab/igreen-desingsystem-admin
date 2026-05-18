import type { SavedView, SavedViewsService } from "./saved-views.types";

const STORAGE_PREFIX = "igreen-datatable-views:";

function storageKey(persistId: string): string {
  return `${STORAGE_PREFIX}${persistId}`;
}

function readAll(persistId: string): SavedView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(persistId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(persistId: string, views: SavedView[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(persistId), JSON.stringify(views));
  } catch {
    // localStorage cheio / disabled — silencioso
  }
}

/**
 * Service mock — persiste em localStorage via key separada de state-persistence.
 * Para producao: substituir por adapter que chama API. Mesma interface, comportamento assincrono.
 */
export const savedViewsMockService: SavedViewsService = {
  list: async (persistId) => {
    return readAll(persistId);
  },
  save: async (persistId, view) => {
    const all = readAll(persistId);
    const idx = all.findIndex((v) => v.id === view.id);
    if (idx >= 0) {
      all[idx] = view;
    } else {
      all.push(view);
    }
    writeAll(persistId, all);
    return view;
  },
  delete: async (persistId, id) => {
    const all = readAll(persistId);
    writeAll(persistId, all.filter((v) => v.id !== id));
  },
};
