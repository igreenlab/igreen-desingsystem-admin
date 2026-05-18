import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedView, SavedViewsService } from "../services/saved-views.types";
import { savedViewsMockService } from "../services/saved-views-mock-service";

export type UseDataTableSavedViewsParams = {
  persistId: string | undefined;
  service?: SavedViewsService;
};

export type SaveViewOptions = {
  /** Default false (privada). Quando true, view eh marcada como publica. */
  isPublic?: boolean;
};

export type UseDataTableSavedViewsResult = {
  views: SavedView[];
  isLoading: boolean;
  currentViewId: string | null;
  /** Salva o snapshot atual com o nome dado. Gera id novo. */
  saveView: (
    name: string,
    snapshot: SavedView["state"],
    opts?: SaveViewOptions,
  ) => Promise<SavedView | null>;
  /** Remove view do servico. */
  deleteView: (id: string) => Promise<void>;
  /** Marca uma view como atualmente aplicada (logica de aplicacao fica fora do hook). */
  setCurrentViewId: (id: string | null) => void;
};

function generateId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Gerencia views salvas via service (default: localStorage mock).
 * O hook lista no mount, expoe save/delete, e mantem qual view esta "ativa" (apenas marker).
 * Aplicacao do estado de uma view eh feita pelo controller (chama setters dos hooks SRP).
 */
export function useDataTableSavedViews({
  persistId,
  service = savedViewsMockService,
}: UseDataTableSavedViewsParams): UseDataTableSavedViewsResult {
  const [views, setViews] = useState<SavedView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const warnedRef = useRef(false);

  // Warning em prod quando service nao foi customizado (spec §risks)
  useEffect(() => {
    if (warnedRef.current || !persistId) return;
    const isProd = import.meta.env?.MODE === "production";
    const isMock = service === savedViewsMockService;
    if (isProd && isMock) {
      // eslint-disable-next-line no-console
      console.warn(
        "[DataTable] Saved Views mock service em production. Substitua via prop `savedViewsService` por adapter de backend persistente.",
      );
      warnedRef.current = true;
    }
  }, [persistId, service]);

  // Carrega lista no mount (quando persistId esta presente)
  useEffect(() => {
    if (!persistId) return;
    let cancelled = false;
    setIsLoading(true);
    service.list(persistId)
      .then((list) => {
        if (cancelled) return;
        setViews(list);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [persistId, service]);

  const saveView = useCallback(
    async (
      name: string,
      snapshot: SavedView["state"],
      opts?: SaveViewOptions,
    ): Promise<SavedView | null> => {
      if (!persistId) return null;
      const view: SavedView = {
        id: generateId(),
        name: name.trim(),
        isPublic: opts?.isPublic ?? false,
        state: snapshot,
        createdAt: new Date().toISOString(),
      };
      const saved = await service.save(persistId, view);
      setViews((prev) => [...prev, saved]);
      setCurrentViewId(saved.id);
      return saved;
    },
    [persistId, service],
  );

  const deleteView = useCallback(
    async (id: string): Promise<void> => {
      if (!persistId) return;
      await service.delete(persistId, id);
      setViews((prev) => prev.filter((v) => v.id !== id));
      setCurrentViewId((curr) => (curr === id ? null : curr));
    },
    [persistId, service],
  );

  return { views, isLoading, currentViewId, saveView, deleteView, setCurrentViewId };
}
