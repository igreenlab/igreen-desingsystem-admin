import { useMemo, useState } from "react";
import { Archive, Clock, Eye, Pencil, Trash2 } from "lucide-react";
import { Kanban } from "../../components/ui/Kanban";
import type { KanbanCardData, KanbanColumn, KanbanMenuItem } from "../../components/ui/Kanban";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/Avatar";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "preview", label: "Preview" },
  { id: "menus", label: "Menus padronizados" },
  { id: "dnd", label: "Drag-and-Drop" },
  { id: "render-card", label: "Render custom" },
  { id: "api", label: "API Reference" },
];

const KANBAN_PROPS = [
  { name: "columns", type: "KanbanColumn[]", defaultVal: "—" },
  { name: "cards", type: "KanbanCardData[]", defaultVal: "—" },
  { name: "selectedIds", type: "Set<string>", defaultVal: "—" },
  { name: "onToggleSelect", type: "(id: string) => void", defaultVal: "—" },
  { name: "openCardId", type: "string", defaultVal: "—" },
  { name: "onOpenCard", type: "(id: string) => void", defaultVal: "—" },
  { name: "onAddCard", type: "(columnId: string) => void (botão + no head)", defaultVal: "—" },
  { name: "onColumnMenu", type: "(columnId: string, anchor: HTMLElement) => void (manual)", defaultVal: "—" },
  { name: "getColumnMenuItems", type: "(column) => KanbanMenuItem[] (auto)", defaultVal: "—" },
  { name: "onAddInFooter", type: "(columnId: string) => void (botão + Adicionar no rodapé)", defaultVal: "—" },
  { name: "hideFooterAdd", type: "boolean", defaultVal: "false" },
  { name: "onCardMenu", type: "(cardId: string, anchor: HTMLElement) => void (manual)", defaultVal: "—" },
  { name: "getCardMenuItems", type: "(card) => KanbanMenuItem[] (auto)", defaultVal: "—" },
  { name: "renderCard", type: "({ card, selected, open }) => ReactNode", defaultVal: "—" },
  { name: "enableDnD", type: "boolean", defaultVal: "false" },
  { name: "onCardMove", type: "(cardId, from, to) => void | Promise<unknown>", defaultVal: "—" },
  { name: "emptyLabel", type: "string", defaultVal: '"Nenhum item neste estágio"' },
  { name: "addLabel", type: "string", defaultVal: '"Adicionar"' },
];

const COLUMN_PROPS = [
  { name: "id", type: "string", defaultVal: "—" },
  { name: "label", type: "string", defaultVal: "—" },
  { name: "dotColor", type: "string (CSS var ou cor)", defaultVal: "—" },
  { name: "count", type: "number (override; default = cards.length)", defaultVal: "—" },
  { name: "canReceiveDrop", type: "boolean (false = coluna terminal/locked)", defaultVal: "true" },
  { name: "canDragFrom", type: "boolean (false = cards não-arrastáveis)", defaultVal: "true" },
];

const MENU_ITEM_PROPS = [
  { name: "label", type: "string (ignorado se separator)", defaultVal: "—" },
  { name: "icon", type: "ReactNode (ex: <Pencil />)", defaultVal: "—" },
  { name: "onClick", type: "() => void", defaultVal: "—" },
  { name: "destructive", type: "boolean (tom vermelho)", defaultVal: "false" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "separator", type: "boolean (renderiza divider)", defaultVal: "false" },
];

const CARD_PROPS = [
  { name: "id", type: "string", defaultVal: "—" },
  { name: "columnId", type: "string (deve bater com KanbanColumn.id)", defaultVal: "—" },
  { name: "title", type: "ReactNode", defaultVal: "—" },
  { name: "subtitle", type: "ReactNode (ex: ID)", defaultVal: "—" },
  { name: "description", type: "ReactNode (line-clamp 2)", defaultVal: "—" },
  { name: "avatar", type: "ReactNode (ex: <Avatar>)", defaultVal: "—" },
  { name: "chip", type: "ReactNode (ex: <Chip>)", defaultVal: "—" },
  { name: "value", type: "ReactNode (ex: R$ 4.800,00)", defaultVal: "—" },
  { name: "footerLeft", type: "ReactNode (ex: agente)", defaultVal: "—" },
  { name: "footerRight", type: "ReactNode (ex: data)", defaultVal: "—" },
];

/* ── Mock data alinhado com sandbox ────────────────────────────── */

const COLUMNS: KanbanColumn[] = [
  { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
  { id: "pending",  label: "Pendente", dotColor: "var(--color-fg-warning)" },
  { id: "paused",   label: "Pausado",  dotColor: "var(--color-fg-info)" },
  { id: "inactive", label: "Inativo",  dotColor: "var(--color-fg-muted)" },
];

type CardEntry = {
  id: string;
  status: "active" | "pending" | "paused" | "inactive";
  name: string;
  initials: string;
  avatarHex: string;
  category: "royal" | "licenciado" | "lead";
  value: number;
  agent: { initials: string; name: string; hex: string };
  date: string;
  note: string;
};

const CARDS_RAW: CardEntry[] = [
  { id: "CLI-2401", status: "active",   name: "Maria Silva",     initials: "MS", avatarHex: "#f59e0b", category: "royal",      value: 4800,  agent: { initials: "VC", name: "Você",          hex: "#0a3a2e" }, date: "13 abr", note: "Cliente Royal ativo com renovação prevista para o próximo trimestre." },
  { id: "CLI-2403", status: "active",   name: "Carlos Oliveira", initials: "CO", avatarHex: "#8754ec", category: "lead",       value: 2150,  agent: { initials: "CS", name: "Carlos Souza",  hex: "#8754ec" }, date: "14 abr", note: "Lead qualificado em fase final de negociação comercial." },
  { id: "CLI-2406", status: "active",   name: "Lúcia Almeida",   initials: "LA", avatarHex: "#f9a47a", category: "licenciado", value: 6750,  agent: { initials: "AC", name: "Aline Castro",  hex: "#f59e0b" }, date: "12 abr", note: "Licenciado em operação estável, acompanhamento mensal de performance." },
  { id: "CLI-2408", status: "active",   name: "Fernanda Lima",   initials: "FL", avatarHex: "#e1306c", category: "lead",       value: 3400,  agent: { initials: "ML", name: "Maria Lima",    hex: "#ef4444" }, date: "14 abr", note: "Lead qualificado em fase final de negociação comercial." },
  { id: "CLI-2410", status: "active",   name: "Camila Ribeiro",  initials: "CR", avatarHex: "#8754ec", category: "royal",      value: 9800,  agent: { initials: "AC", name: "Aline Castro",  hex: "#f59e0b" }, date: "15 abr", note: "Cliente Royal ativo com renovação prevista para o próximo trimestre." },
  { id: "CLI-2402", status: "pending",  name: "João Santos",     initials: "JS", avatarHex: "#0a3a2e", category: "licenciado", value: 12300, agent: { initials: "AC", name: "Aline Castro",  hex: "#f59e0b" }, date: "10 abr", note: "Licenciado pendente de envio da documentação assinada." },
  { id: "CLI-2407", status: "pending",  name: "Roberto Souza",   initials: "RS", avatarHex: "#0088cc", category: "royal",      value: 15200, agent: { initials: "CS", name: "Carlos Souza",  hex: "#8754ec" }, date: "08 abr", note: "Royal aguardando aprovação interna de proposta especial." },
  { id: "CLI-2404", status: "paused",   name: "Ana Costa",       initials: "AC", avatarHex: "#1cb280", category: "royal",      value: 8900,  agent: { initials: "ML", name: "Maria Lima",    hex: "#ef4444" }, date: "03 abr", note: "Atendimento pausado a pedido do cliente até nova solicitação." },
  { id: "CLI-2409", status: "paused",   name: "Bruno Rodrigues", initials: "BR", avatarHex: "#70c748", category: "licenciado", value: 5600,  agent: { initials: "VC", name: "Você",          hex: "#0a3a2e" }, date: "09 abr", note: "Licenciado em pausa contratual temporária." },
  { id: "CLI-2405", status: "inactive", name: "Pedro Pereira",   initials: "PP", avatarHex: "#ef4444", category: "lead",       value: 1100,  agent: { initials: "VC", name: "Você",          hex: "#0a3a2e" }, date: "16 mar", note: "Lead frio — avaliar nova campanha de reaproximação." },
];

const CATEGORY_LABEL: Record<CardEntry["category"], string> = {
  royal: "Royal",
  licenciado: "Licenciado",
  lead: "Lead",
};

const CATEGORY_COLOR: Record<CardEntry["category"], "warning" | "info" | "success"> = {
  royal: "warning",
  licenciado: "info",
  lead: "success",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Mapeia raw entries → KanbanCardData consumindo componentes do DS. */
function buildCards(): KanbanCardData[] {
  return CARDS_RAW.map((r) => ({
    id: r.id,
    columnId: r.status,
    title: r.name,
    subtitle: r.id,
    description: r.note,
    avatar: <Avatar size="sm" colorHex={r.avatarHex}>{r.initials}</Avatar>,
    chip: (
      <Chip color={CATEGORY_COLOR[r.category]} variant="soft" size="sm" shape="pill">
        {CATEGORY_LABEL[r.category]}
      </Chip>
    ),
    value: formatCurrency(r.value),
    footerLeft: (
      <span className="inline-flex items-center gap-gp-sm min-w-0 flex-1">
        <Avatar size="xs" colorHex={r.agent.hex}>{r.agent.initials}</Avatar>
        <span className="text-body-sm font-normal text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis">
          {r.agent.name}
        </span>
      </span>
    ),
    footerRight: (
      <span className="inline-flex items-center gap-gp-xs text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums] shrink-0">
        <Clock size={11} strokeWidth={1.8} aria-hidden />
        {r.date}
      </span>
    ),
  }));
}

const ALL_CARDS = buildCards();

export function KanbanDoc() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["CLI-2407", "CLI-2409"]));
  const [openCardId, setOpenCardId] = useState<string | undefined>(undefined);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Estado pra exemplo DnD (optimistic update via columnId) ─────────── */
  const [dndCards, setDndCards] = useState<KanbanCardData[]>(() => buildCards());

  const handleCardMove = (cardId: string, _from: string, to: string) => {
    setDndCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, columnId: to } : c)),
    );
  };

  /** Colunas com `canReceiveDrop=false` em "inactive" pra demonstrar coluna locked. */
  const DND_COLUMNS = useMemo<KanbanColumn[]>(() => [
    { id: "active",   label: "Ativo",    dotColor: "var(--color-fg-success)" },
    { id: "pending",  label: "Pendente", dotColor: "var(--color-fg-warning)" },
    { id: "paused",   label: "Pausado",  dotColor: "var(--color-fg-info)" },
    { id: "inactive", label: "Inativo",  dotColor: "var(--color-fg-muted)", canReceiveDrop: false },
  ], []);

  /* ── Menu items padronizados (auto-renderizados via DropdownMenu DS) ──── */
  const cardMenuItems = (card: KanbanCardData): KanbanMenuItem[] => [
    { label: "Ver detalhes", icon: <Eye />, onClick: () => console.log("ver", card.id) },
    { label: "Editar", icon: <Pencil />, onClick: () => console.log("editar", card.id) },
    { separator: true },
    { label: "Arquivar", icon: <Archive />, onClick: () => console.log("arquivar", card.id) },
    { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => console.log("excluir", card.id) },
  ];

  const columnMenuItems = (col: KanbanColumn): KanbanMenuItem[] => [
    { label: "Renomear coluna", icon: <Pencil />, onClick: () => console.log("renomear", col.id) },
    { separator: true },
    { label: "Limpar coluna", icon: <Archive />, destructive: true, onClick: () => console.log("limpar", col.id) },
  ];

  /* ── renderCard custom (override total do miolo, primitive mantém wrapper) ──── */
  const renderCardCompact = ({ card }: { card: KanbanCardData }) => (
    <>
      <div className="flex items-center gap-gp-md">
        {card.avatar}
        <div className="flex-1 min-w-0">
          <div className="text-body-md font-medium text-fg-default whitespace-nowrap overflow-hidden text-ellipsis">
            {card.title}
          </div>
          <div className="flex items-center gap-gp-sm mt-sp-2xs">
            {card.chip}
            <span className="text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]">
              {card.value}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="Kanban"
        description="Quadro horizontal de colunas (estágios) com cards distribuídos. Componente dumb — recebe colunas e cards via props, seleção e detail-open controlados externamente. Visual alinhado com o sandbox /design-and-table-v2 consumindo tokens DS (bg-muted, bg-surface, shadow-sh-sm, radius-xl/lg, fg-default/muted)."
      />

      <DocSeparator />

      <SectionH2 id="preview" title="Preview" />

      <ExampleSection
        id="ex-preview"
        title="4 colunas × 10 cards (clientes por status)"
        description={
          'Hover em um card mostra o checkbox (top-left) e o menu "⋯" (top-right). ' +
          "Click no card abre a visão de detalhes (toggle). Botão + no header de cada coluna " +
          'cria card naquela coluna. "+ Adicionar" no rodapé tem a mesma ação.'
        }
        code={`<Kanban
  columns={COLUMNS}                    // [{ id, label, dotColor }]
  cards={CARDS}                        // [{ id, columnId, title, ... }]
  selectedIds={selectedIds}
  onToggleSelect={toggleSelect}
  openCardId={openCardId}
  onOpenCard={setOpenCardId}
  onAddCard={(colId) => console.log("+ no header", colId)}
  onColumnMenu={(colId) => console.log("⋯ coluna", colId)}
  onAddInFooter={(colId) => console.log("+ adicionar", colId)}
  onCardMenu={(cardId, anchor) => openMenu(cardId, anchor)}
/>`}
      >
        <div className="h-[640px] w-full flex">
          <Kanban
            columns={COLUMNS}
            cards={ALL_CARDS}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            openCardId={openCardId}
            onOpenCard={(id) => setOpenCardId((cur) => (cur === id ? undefined : id))}
            onAddCard={(colId) => console.log("+ header", colId)}
            onColumnMenu={(colId) => console.log("⋯ coluna", colId)}
            onAddInFooter={(colId) => console.log("+ rodapé", colId)}
            onCardMenu={(cardId) => console.log("⋯ card", cardId)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="menus" title="Menus padronizados (auto via DropdownMenu DS)" />

      <ExampleSection
        id="ex-menus"
        title="Items padronizados — primitive monta o menu automaticamente"
        description={
          'Quando `getCardMenuItems` ou `getColumnMenuItems` retorna um array de items, ' +
          'o primitive renderiza um `<DropdownMenu>` DS automático com suporte a ícone, ' +
          'separator e variant destrutivo. Reduz boilerplate vs. construir o menu manualmente.'
        }
        code={`const cardMenuItems = (card) => [
  { label: "Ver detalhes", icon: <Eye />,    onClick: () => ... },
  { label: "Editar",       icon: <Pencil />, onClick: () => ... },
  { separator: true },
  { label: "Arquivar",     icon: <Archive />, onClick: () => ... },
  { label: "Excluir",      icon: <Trash2 />,  destructive: true, onClick: () => ... },
];

<Kanban
  columns={COLUMNS}
  cards={CARDS}
  getCardMenuItems={cardMenuItems}
  getColumnMenuItems={columnMenuItems}
/>`}
      >
        <div className="h-[640px] w-full flex">
          <Kanban
            columns={COLUMNS}
            cards={ALL_CARDS}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            getCardMenuItems={cardMenuItems}
            getColumnMenuItems={columnMenuItems}
            onAddCard={(colId) => console.log("+ header", colId)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="dnd" title="Drag-and-Drop entre colunas" />

      <ExampleSection
        id="ex-dnd"
        title="Move cards arrastando — coluna 'Inativo' tem canReceiveDrop=false"
        description={
          'Habilite com `enableDnD` + `onCardMove`. O primitive não gerencia estado de cards — ' +
          'o consumer faz optimistic update (ou async commit) atualizando `cards` props. ' +
          'Constraints por coluna: `canReceiveDrop: false` bloqueia drop, `canDragFrom: false` ' +
          'impede arrastar. A coluna "Inativo" desta demo rejeita drops (tente arrastar pra ela).'
        }
        code={`<Kanban
  columns={[
    { id: "active",   label: "Ativo" },
    { id: "pending",  label: "Pendente" },
    { id: "inactive", label: "Inativo", canReceiveDrop: false },
  ]}
  cards={cards}
  enableDnD
  onCardMove={(cardId, from, to) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: to } : c
    ));
  }}
/>`}
      >
        <div className="h-[640px] w-full flex">
          <Kanban
            columns={DND_COLUMNS}
            cards={dndCards}
            enableDnD
            onCardMove={handleCardMove}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="render-card" title="Render custom do card" />

      <ExampleSection
        id="ex-render-card"
        title="renderCard substitui o miolo — primitive mantém wrapper/focus/checkbox/menu"
        description={
          'Quando você precisa de um layout completamente diferente (timeline, checklist, ' +
          'compact, etc), forneça `renderCard`. O wrapper externo (border, shadow, focus ring, ' +
          'checkbox positioning, menu positioning, acessibilidade) continua sob controle do ' +
          'primitive — garante consistência visual entre boards customizados.'
        }
        code={`<Kanban
  columns={COLUMNS}
  cards={CARDS}
  renderCard={({ card }) => (
    <div className="flex items-center gap-gp-md">
      {card.avatar}
      <div className="flex-1 min-w-0">
        <div className="text-body-md font-medium">{card.title}</div>
        <div className="flex items-center gap-gp-sm mt-sp-2xs">
          {card.chip}
          <span>{card.value}</span>
        </div>
      </div>
    </div>
  )}
/>`}
      >
        <div className="h-[640px] w-full flex">
          <Kanban
            columns={COLUMNS}
            cards={ALL_CARDS}
            renderCard={renderCardCompact}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            getCardMenuItems={cardMenuItems}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Kanban</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Dumb data-driven. Recebe <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">columns</code> e <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">cards</code> e renderiza. Sem state interno de domínio.
        </p>
        <PropsTable items={KANBAN_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">KanbanColumn</h3>
        <PropsTable items={COLUMN_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">KanbanCardData</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Cada slot (<code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">avatar</code>,{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">chip</code>,{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">value</code>,{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">footerLeft/Right</code>) é{" "}
          <strong>ReactNode</strong> — o consumer monta usando componentes do DS (<code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">{"<Avatar>"}</code>,{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">{"<Chip>"}</code>, etc) sem o Kanban ditar visual interno.
        </p>
        <PropsTable items={CARD_PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">KanbanMenuItem</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Item padronizado de menu (card ou coluna). Usado em{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">getCardMenuItems</code> e{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">getColumnMenuItems</code>.
          O primitive renderiza o <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">{"<DropdownMenu>"}</code> DS automaticamente.
        </p>
        <PropsTable items={MENU_ITEM_PROPS} />
      </div>
    </DocLayout>
  );
}

export default KanbanDoc;
