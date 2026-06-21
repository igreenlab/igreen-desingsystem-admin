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
import { DataList } from "@/components/ui/DataList";
import type { ListItemData } from "@/components/ui/List";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertModal } from "@/components/ui/AlertModal";
import {
  FILTER_FIELDS,
  GRADUACAO,
  NETWORK,
  REGIAO,
  VIEWS,
  countNetwork,
  findConsultor,
  formatNum,
  initials,
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

function renderConsultorCard(item: ListItemData) {
  const c = item.data as Consultor;
  const grad = GRADUACAO[c.graduacao];
  return (
    <div className="flex w-full items-start gap-gp-lg">
      <Avatar
        size="md"
        colorHex={c.avatarColor}
        className="shrink-0 text-caption-md font-bold"
      >
        {initials(c.name)}
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-gp-xs">
        <div className="flex flex-wrap items-center gap-gp-sm">
          <span className="truncate text-body-md font-semibold text-fg-default">
            {c.name}
          </span>
          <Chip color="neutral" variant="soft" size="sm" shape="pill">
            {c.level}
          </Chip>
          <Chip color={grad.color} variant="soft" size="sm" shape="pill">
            {grad.label}
          </Chip>
          {c.pro && (
            <Chip color="success" variant="soft" size="sm" shape="pill">
              PRO
            </Chip>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-gp-xl gap-y-gp-2xs">
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

      <span className="hidden shrink-0 items-center gap-gp-xs whitespace-nowrap pt-[2px] text-caption-sm text-fg-subtle md:inline-flex [&>svg]:size-icon-xs">
        <Clock />
        {c.lastActive}
      </span>
    </div>
  );
}

function toItem(c: Consultor): ListItemData {
  return {
    id: c.id,
    title: c.name,
    data: c,
    children: c.children?.map(toItem),
  };
}

/**
 * Mapa de Rede — exemplo de tela (conteúdo, sem AppShell). DataList hierárquico
 * (árvore de consultores por níveis, conectores) + card rico + filtros/abas/
 * refresh + painel de detalhe + modal de remoção. Renderize `<MapaDeRedeScreen />`.
 */
export function MapaDeRedeScreen() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Consultor | null>(null);

  const items = useMemo(() => NETWORK.map(toItem), []);
  const total = useMemo(() => countNetwork(NETWORK), []);
  const detail = detailId ? findConsultor(NETWORK, detailId) : null;

  const expanded = useMemo(
    () =>
      new Set(
        NETWORK.flatMap((r) => [r.id, ...(r.children?.map((c) => c.id) ?? [])]),
      ),
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-gp-2xl">
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
        defaultExpandedIds={expanded}
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
    </div>
  );
}

export default MapaDeRedeScreen;
