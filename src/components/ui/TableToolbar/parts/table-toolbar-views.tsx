import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { ToolbarDivider } from "./toolbar-divider";
import { ToolbarTabs } from "./toolbar-tabs";
import { ToolbarSaveButton } from "./toolbar-tool-button";
import { ViewsPopover, type ViewsPopoverView } from "../popovers/views-popover";
import {
  AddViewModal,
  type AddViewModalSubmit,
} from "../popovers/add-view-modal";
import { AlertModal } from "../../AlertModal";

/** ID fixo da tab "Default" — virtual (nao tem entrada no storage). */
export const DEFAULT_VIEW_ID = "__default__";

export type TableToolbarViewsItem = ViewsPopoverView;

export type TableToolbarViewsProps = {
  /** Lista completa de views salvas (sem Default — esse e injetado internamente). */
  views: TableToolbarViewsItem[];
  /** ID da view atualmente aplicada. `null`/`undefined` ⇒ tab Default ativa. */
  activeViewId?: string | null;
  /** Aplicar uma view (click numa tab OU click num item do popover). */
  onApply: (id: string) => void;
  /** Resetar pra "Default" (limpar filtros, sort, cols, density). */
  onApplyDefault: () => void;
  /**
   * Excluir PERMANENTEMENTE uma view do storage. So eh chamado apos
   * confirmacao via AlertModal danger — disparado pelo lixinho no popover.
   *
   * X em tab NAO chama isso (apenas remove da barra — view continua salva).
   */
  onDelete: (id: string) => void | Promise<void>;
  /** Disparado quando user salva uma nova view via modal. */
  onSave: (data: AddViewModalSubmit) => void | Promise<void>;
  /** Quantas tabs ficam visiveis (incluindo Default). Default 3 — Default + ate 2 views customizadas. */
  maxTabs?: number;
  /** Key que identifica views "minhas" (default `"me"`). Controla X em tab e delete no popover. */
  myOwnerKey?: string;
  /** Slot opcional pra divider antes das tabs (default renderiza um ToolbarDivider). */
  divider?: ReactNode;
  /** Esconde o divider default — usado quando ja ha um divider adjacente. */
  hideDivider?: boolean;
  /**
   * Permite o usuário criar/salvar novas visões (botão "+" / popover de views).
   * Default `true`. Passe `false` pra exibir SÓ as visões pré-definidas (sem o
   * "+") — read-only views.
   */
  allowCreate?: boolean;
  /**
   * Label da tab Default **quando ela é a única** (sem nenhuma view pré-definida
   * nem salva). Evita a barra "vazia" mostrando só "Default" — troque por um
   * título genérico do contexto (ex: "Lista de Clientes"). Default `"Default"`.
   * Assim que houver ≥ 1 outra view, a tab volta a se chamar "Default" pra
   * distinguir das views nomeadas.
   */
  soloLabel?: string;
};

/**
 * TableToolbarViews — **compound component** (smart) de Saved Views.
 *
 * ⚠️ **Pattern compound smart** — este é um dos POUCOS componentes do TableToolbar
 * que mantém estado interno (`tabViewIds`, `addModalOpen`, `confirmDeleteView`).
 * É uma exceção consciente ao princípio dumb do toolbar: orquestra 4 filhos
 * (ToolbarTabs + ViewsPopover + AddViewModal + AlertModal) como "bloco pronto".
 *
 * **Quando usar este compound**: caso de uso saved views completo (CRM admin).
 * **Quando NÃO usar**: se precisar reordenar/customizar a interação entre os
 * 4 filhos, COMPONHA OS PARTS DIRETAMENTE — ToolbarTabs + ViewsPopover +
 * AddViewModal + AlertModal são exportados standalone pelo TableToolbar. Você
 * controla os 4 states (open, deleting, etc) e a ordem visual.
 *
 * Renderiza no slot esquerdo do TableToolbar:
 *   1. ToolbarDivider
 *   2. ToolbarTabs com "Default" + ate (maxTabs - 1) views como tabs
 *      - Default sem X (custom: false)
 *      - Views minhas com X — X apenas remove da barra (view continua salva)
 *   3. ViewsPopover via ToolbarSaveButton "+"
 *      - Click no item: pina como tab + aplica + fecha popover
 *      - Lixinho no item: abre AlertModal danger pra exclusao definitiva
 *      - Footer "Salvar visao atual": abre AddViewModal mode create
 *   4. AddViewModal (estado interno) — disparado pelo footer do popover
 *   5. AlertModal danger (estado interno) — confirma exclusao definitiva
 *
 * Distinção crítica:
 *   - X em tab            → unpin (cosmetico, view fica no popover/storage)
 *   - Lixinho no popover  → confirm + delete permanente (chama onDelete)
 *
 * Comportamento de pin (push-out):
 *   - `tabViewIds` eh um state local com as view IDs que ocupam slots de tab.
 *   - Inicializa com as (maxTabs - 1) primeiras views.
 *   - Click numa view que NAO esta como tab: pina (push out da ultima se cheio).
 *   - X em tab: remove o ID daqui (sem promover proxima).
 *   - View deletada permanente: remove o ID daqui (se estiver).
 *   - View nova criada: anexa se ha slot livre.
 *   - Re-mount (reload) reseta — pega as N-1 primeiras de novo.
 */
export function TableToolbarViews({
  views,
  activeViewId,
  onApply,
  onApplyDefault,
  onDelete,
  onSave,
  maxTabs = 3,
  myOwnerKey = "me",
  divider,
  hideDivider,
  soloLabel = "Default",
  allowCreate = true,
}: TableToolbarViewsProps) {
  const maxCustomTabs = Math.max(0, maxTabs - 1);

  /* ── State: tabs pinadas (IDs) ─────────────────────────────────── */

  const initialIds = useMemo(
    // Só auto-pina views do próprio usuário (owner === myOwnerKey). As de outros
    // (públicas) só viram tab quando explicitamente aplicadas (via activeViewId).
    () =>
      views
        .filter((v) => v.owner === myOwnerKey)
        .slice(0, maxCustomTabs)
        .map((v) => v.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [tabViewIds, setTabViewIds] = useState<string[]>(initialIds);

  // Sync: quando uma view some, tira do state; quando nova chega, anexa se tem slot
  const prevIdsRef = useRef<string[]>(views.map((v) => v.id));
  useEffect(() => {
    const currentIds = views.map((v) => v.id);
    const removedIds = prevIdsRef.current.filter((id) => !currentIds.includes(id));
    const addedIds = currentIds.filter((id) => !prevIdsRef.current.includes(id));
    prevIdsRef.current = currentIds;

    if (removedIds.length === 0 && addedIds.length === 0) return;

    setTabViewIds((prev) => {
      let next = prev.filter((id) => !removedIds.includes(id));
      for (const id of addedIds) {
        if (next.length >= maxCustomTabs) break;
        // Só auto-pina views do próprio usuário; as de outros não viram atalho.
        const v = views.find((vv) => vv.id === id);
        if (v && v.owner !== myOwnerKey) continue;
        next = [...next, id];
      }
      return next;
    });
  }, [views, maxCustomTabs, myOwnerKey]);

  /* ── State: modal create + popover open + confirm delete ──────── */

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmDeleteView, setConfirmDeleteView] =
    useState<TableToolbarViewsItem | null>(null);

  /* ── Tabs effective: Default + views pinadas ────────────────────── */

  const tabs = useMemo(() => {
    // Garante que a view ATIVA sempre apareça como tab — mesmo que não esteja
    // pinada (ex: reload restaura uma view salva fora das N primeiras, ou a barra
    // estava cheia). Sem isso, a tab ativa some e nenhuma fica destacada (a view
    // aplicada fica "invisível"). Inclusão é só visual (não muta tabViewIds).
    const renderIds =
      activeViewId &&
      activeViewId !== DEFAULT_VIEW_ID &&
      !tabViewIds.includes(activeViewId) &&
      views.some((v) => v.id === activeViewId)
        ? [...tabViewIds, activeViewId]
        : tabViewIds;
    const customTabs = renderIds
      .map((id) => views.find((v) => v.id === id))
      .filter((v): v is TableToolbarViewsItem => !!v)
      .map((v) => ({
        id: v.id,
        name: typeof v.name === "string" ? v.name : String(v.name),
        // Mostra o "X" (desfixar/fechar) nas views do usuário E na view ATIVA no
        // momento — assim dá pra fechar uma view pública de outro que foi aplicada
        // (o X só desfixa/deseleciona; não deleta a view de ninguém).
        custom: v.owner === myOwnerKey || v.id === activeViewId,
      }));
    // Tab Default sozinha (sem views) → label genérico configurável (soloLabel),
    // pra barra não ficar com um único "Default" solto. Com ≥ 1 outra view,
    // volta a "Default" pra distinguir das nomeadas.
    const defaultName = customTabs.length === 0 ? soloLabel : "Default";
    return [{ id: DEFAULT_VIEW_ID, name: defaultName, custom: false }, ...customTabs];
  }, [tabViewIds, views, myOwnerKey, soloLabel, activeViewId]);

  const effectiveActiveId = activeViewId ?? DEFAULT_VIEW_ID;

  /* ── Handlers ──────────────────────────────────────────────────── */

  const handleTabSelect = (id: string) => {
    if (id === DEFAULT_VIEW_ID) {
      onApplyDefault();
    } else {
      onApply(id);
    }
  };

  /** X em tab — APENAS remove da barra de tabs. Nao deleta a view. */
  const handleTabUnpin = (id: string) => {
    setTabViewIds((prev) => prev.filter((x) => x !== id));
    if (id === activeViewId) onApplyDefault();
  };

  /**
   * Click no item da lista do popover: pina como tab (push-out da ultima
   * se ja estiver cheio) + aplica como ativa + fecha popover.
   */
  const handlePopoverItemClick = (v: ViewsPopoverView) => {
    setTabViewIds((prev) => {
      if (prev.includes(v.id)) return prev;
      const next = [...prev, v.id];
      if (next.length > maxCustomTabs) next.shift();
      return next;
    });
    onApply(v.id);
    setPopoverOpen(false);
  };

  const handleCreateClick = () => {
    setPopoverOpen(false);
    setTimeout(() => setAddModalOpen(true), 0);
  };

  /** Lixinho na lista do popover — pede confirmacao. */
  const handleAskDelete = (id: string) => {
    const view = views.find((v) => v.id === id);
    if (!view) return;
    setConfirmDeleteView(view);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteView) return;
    await onDelete(confirmDeleteView.id);
    setConfirmDeleteView(null);
  };

  return (
    <>
      {hideDivider ? null : divider ?? <ToolbarDivider />}

      <ToolbarTabs
        tabs={tabs}
        activeId={effectiveActiveId}
        onSelect={handleTabSelect}
        onClose={handleTabUnpin}
        ariaLabel="Visões salvas"
      />

      {allowCreate && (
        <ViewsPopover
          open={popoverOpen}
          onOpenChange={setPopoverOpen}
          trigger={
            <ToolbarSaveButton aria-label="Visões salvas">
              <Plus strokeWidth={2.4} />
            </ToolbarSaveButton>
          }
          views={views}
          activeViewId={activeViewId ?? undefined}
          myOwnerKey={myOwnerKey}
          onApply={handlePopoverItemClick}
          onDelete={handleAskDelete}
          onCreate={handleCreateClick}
        />
      )}

      {allowCreate && (
        <AddViewModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={onSave}
        />
      )}

      <AlertModal
        tone="danger"
        open={!!confirmDeleteView}
        onOpenChange={(o) => !o && setConfirmDeleteView(null)}
        title="Excluir visão"
        description={
          confirmDeleteView
            ? `Tem certeza que deseja excluir a visão "${typeof confirmDeleteView.name === "string" ? confirmDeleteView.name : String(confirmDeleteView.name)}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
