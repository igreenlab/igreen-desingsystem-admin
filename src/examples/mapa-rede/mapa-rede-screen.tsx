import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, UserMinus, UserPlus, Eye } from "lucide-react";
import { DataList } from "@/components/ui/DataList";
import type { ListItemData } from "@/components/ui/List";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertModal } from "@/components/ui/AlertModal";
import {
  GRADUACAO,
  NETWORK,
  countNetwork,
  findConsultor,
  formatNum,
  subtreeLabel,
} from "./mapa-de-rede-mocks";
import type { Consultor } from "./mapa-de-rede.types";
import { ConsultorDetailPanel } from "./components/ConsultorDetailPanel";

/* ── Card do consultor (renderItem do DataList hierárquico) ───────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hidden w-[84px] shrink-0 flex-col gap-gp-2xs md:flex">
      <span className="text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </span>
      <span className="text-body-sm text-fg-default [font-variant-numeric:tabular-nums]">
        {value}
      </span>
    </div>
  );
}

function renderConsultorCard(item: ListItemData) {
  const c = item.data as Consultor;
  const grad = GRADUACAO[c.graduacao];
  return (
    <div className="flex w-full items-center gap-gp-xl">
      <div className="flex min-w-0 flex-1 items-center gap-gp-sm">
        <span className="truncate text-body-md font-semibold text-fg-default">
          {c.name}
        </span>
        <Chip color="neutral" variant="soft" size="sm" shape="pill">
          {c.level}
        </Chip>
      </div>

      <div className="hidden w-[110px] shrink-0 md:block">
        <Chip color={grad.color} variant="soft" size="sm" shape="pill">
          {grad.label}
        </Chip>
      </div>

      <Stat label="GP próprio" value={formatNum(c.gpProprio)} />
      <Stat label="Clientes" value={formatNum(c.clientes)} />

      <div className="hidden w-[260px] shrink-0 flex-col gap-gp-2xs lg:flex">
        <span className="text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle">
          Subárvore
        </span>
        <span className="truncate text-body-sm text-fg-muted">
          {subtreeLabel(c)}
        </span>
      </div>

      <div className="hidden w-[52px] shrink-0 justify-end sm:flex">
        {c.pro ? (
          <Chip color="success" variant="soft" size="sm" shape="pill">
            PRO
          </Chip>
        ) : (
          <span className="text-body-sm text-fg-subtle">—</span>
        )}
      </div>
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
 * (árvore de consultores por níveis) + painel de detalhe + modal de remoção.
 * Renderize `<MapaDeRedeScreen />` dentro do seu shell.
 */
export function MapaDeRedeScreen() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Consultor | null>(null);

  const items = useMemo(() => NETWORK.map(toItem), []);
  const total = useMemo(() => countNetwork(NETWORK), []);
  const detail = detailId ? findConsultor(NETWORK, detailId) : null;

  const expanded = useMemo(
    () => new Set(["voce", ...(NETWORK[0].children?.map((c) => c.id) ?? [])]),
    [],
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-gp-2xl">
      <PageHeader
        title="Mapa de Rede"
        description="Navegue a rede de consultores por níveis (Você → N1 → N2…). Cada card mostra graduação, GP próprio, clientes e o agregado da subárvore. Clique para expandir um ramo ou ver o detalhe do consultor."
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
        branchHighlight="block"
        defaultExpandedIds={expanded}
        renderItem={renderConsultorCard}
        searchable
        searchPlaceholder="Buscar consultor..."
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
