import { useMemo, useState } from "react";
import {
  Clock,
  Coins,
  Eye,
  MapPin,
  MoreHorizontal,
  Network,
  Pencil,
  RefreshCw,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { DataList } from "@/components/ui/DataList";
import type { ListItemData, ListRenderState } from "@/components/ui/List";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertModal } from "@/components/ui/AlertModal";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../../mocks/app-shell-mocks";
import {
  FILTER_FIELDS,
  GRADUACAO,
  NETWORK,
  REGIAO,
  VIEWS,
  countNetwork,
  findConsultor,
  formatNum,
  subtreeLabel,
} from "./mapa-de-rede-mocks";
import type { Consultor } from "./mapa-de-rede.types";
import { ConsultorDetailPanel } from "./components/ConsultorDetailPanel";

/* ── Card rico do consultor (renderItem do DataList hierárquico) ──── */

function MetaInline({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-muted [&>svg]:size-icon-sm [&>svg]:text-fg-subtle">
      {icon}
      {children}
    </span>
  );
}

function renderConsultorCard(item: ListItemData, state: ListRenderState) {
  const c = item.data as Consultor;
  const grad = GRADUACAO[c.graduacao];
  return (
    <div className="flex w-full items-center gap-gp-xl">
      {/* nível por profundidade (N1 = líder), mesma cor pra todos —
          quadrado arredondado na altura de título + subtítulo (centralizado). */}
      <span className="grid size-form-md shrink-0 place-items-center rounded-radius-md bg-bg-muted text-caption-sm font-semibold text-fg-muted [font-variant-numeric:tabular-nums]">
        N{state.depth + 1}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-gp-sm">
        {/* identidade */}
        <div className="flex flex-wrap items-center gap-gp-sm">
          <span className="truncate text-body-md font-semibold text-fg-default">
            {c.name}
          </span>
          <Chip color={grad.color} variant="soft" size="sm" shape="pill">
            {grad.label}
          </Chip>
          {c.pro && (
            <Chip color="success" variant="soft" size="sm" shape="pill">
              PRO
            </Chip>
          )}
        </div>

        {/* métricas com ícones */}
        <div className="flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-2xs">
          <MetaInline icon={<Coins />}>
            <strong className="font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
              {formatNum(c.gpProprio)}
            </strong>{" "}
            GP
          </MetaInline>
          <MetaInline icon={<Users />}>
            <strong className="font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
              {formatNum(c.clientes)}
            </strong>{" "}
            clientes
          </MetaInline>
          <MetaInline icon={<Network />}>{subtreeLabel(c)}</MetaInline>
          <MetaInline icon={<MapPin />}>{REGIAO[c.regiao]}</MetaInline>
        </div>
      </div>

      <span className="hidden shrink-0 items-center gap-gp-xs whitespace-nowrap text-caption-sm text-fg-subtle md:inline-flex [&>svg]:size-icon-xs">
        <Clock />
        {c.lastActive}
      </span>
    </div>
  );
}

/* ── árvore Consultor → ListItemData ─────────────────────────────── */

function toItem(c: Consultor): ListItemData {
  return {
    id: c.id,
    title: c.name,
    data: c,
    children: c.children?.map(toItem),
  };
}

export default function MapaDeRedeShowcase() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<string>("fluid");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Consultor | null>(null);

  const items = useMemo(() => NETWORK.map(toItem), []);
  const total = useMemo(() => countNetwork(NETWORK), []);
  const detail = detailId ? findConsultor(NETWORK, detailId) : null;

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Rede" }, { label: "Mapa de Rede" }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => {},
        onMoreActions: () => {},
        onViewAll: () => {},
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => {},
        onExpand: () => {},
        onViewAll: () => {},
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
      user={APP_SHELL_USER}
      layout={layout}
      onLayoutChange={setLayout}
      layoutOptions={APP_SHELL_LAYOUT_OPTIONS}
      onSettings={() => {}}
      onLogout={() => {}}
    >
      <PageHeader
        title="Mapa de Rede"
        description="Navegue a rede de consultores por níveis (líderes → N1 → N2…). Cada card mostra graduação, GP próprio, clientes e o agregado da subárvore. Use as abas, a busca e os filtros pra recortar; clique no card pra ver o detalhe."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {total.toLocaleString("pt-BR")} consultores
          </Chip>
        }
        actions={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Mais ações"
            >
              <MoreHorizontal />
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="md"
              iconLeft={<UserPlus />}
            >
              Convidar consultor
            </Button>
          </>
        }
      />

      <DataList
        fillHeight
        className="flex-1 min-h-0"
        title="Consultores"
        items={items}
        layout="hierarchical"
        branchHighlight="none"
        renderItem={renderConsultorCard}
        searchable
        searchPlaceholder="Buscar consultor..."
        filterFields={FILTER_FIELDS}
        views={VIEWS}
        onRefresh={() => {}}
        persistKey="mapa-de-rede"
        onItemClick={(id) => setDetailId(id)}
        getMenuItems={(item) => {
          const c = item.data as Consultor;
          return [
            {
              label: "Ver detalhe",
              icon: <Eye />,
              onClick: () => setDetailId(c.id),
            },
            {
              label: "Editar",
              icon: <Pencil />,
              onClick: () => setDetailId(c.id),
            },
            { separator: true },
            {
              label: "Remover da rede",
              icon: <UserMinus />,
              destructive: true,
              onClick: () => setRemoving(c),
            },
          ];
        }}
        moreActions={[
          { label: "Atualizar rede", icon: <RefreshCw />, onClick: () => {} },
          { label: "Exportar CSV", onClick: () => {} },
        ]}
      />

      <ConsultorDetailPanel
        consultor={detail}
        onClose={() => setDetailId(null)}
        onEdit={() => {}}
        onRemove={(c) => {
          setDetailId(null);
          setRemoving(c);
        }}
      />

      <AlertModal
        open={removing !== null}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
        tone="danger"
        title={`Remover ${removing?.name ?? "consultor"} da rede?`}
        description="O consultor e toda a sua subárvore deixam de aparecer no mapa. Esta ação é apenas demonstrativa neste exemplo."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={() => setRemoving(null)}
      />
    </AppShell>
  );
}
