# Spec — Componente `List` (iGreen DS)

**Data:** 2026-06-20
**Status:** aprovado pelo design gate; pendente revisão da spec escrita
**Branch:** `feat/list-component`
**Autor:** DS Dev (via brainstorming)

---

## 1. Contexto e objetivo

Criar um componente de **listagem em cards** no iGreen DS, onde cada row é um card
e o conjunto suporta múltiplos cenários de layout. É a contraparte vertical-card-first
do `DataTable` (tabela) e do `Kanban` (colunas horizontais).

Decisão de fronteira (espelha `Table` → `DataTable`):

- **v1 (esta spec):** `List` = **primitivo de apresentação** (burro). Renderiza os 3
  layouts, com DnD e seleção/colapso como estado controlado/não-controlado (idioma
  React). **Sem TableToolbar, sem controller de dados.**
- **Passo 2 (fora desta spec):** `DataList` = componente "inteligente" que adiciona
  TableToolbar + busca/filtros/views/server/persistência (mesma ideia do `DataTable`),
  consumindo o `List` por baixo.

## 2. Cenários (validados pelas referências)

1. **Standard** — lista plana de cards (Supabase "List Patterns" / Team Members).
2. **Grouped** — seções por status/seção, com **DnD entre grupos e reorder dentro**
   (To Do / In Progress / Done com drag handle).
3. **Hierarchical** — árvore-como-lista colapsável, com **linhas de conexão** que
   deixam clara a relação de dependência; **entidades mistas por nível** (Org:
   empresa → manager → user; ou usuário premium → sub-usuários → vinculados).

### Cenários/melhorias previstos na API (bench analysis)

- Metadados em "colunas" alinhadas dentro do card (ROLE · STATUS · LAST SEEN).
- Densidades/variantes de card (compacto · padrão · rico via `renderItem`).
- Seleção + estados (`selected`/`open`), click-row → detail panel.
- Reorder dentro do grupo (handle), não só entre grupos.
- Row actions (kebab `getMenuItems`, mesmo padrão do Kanban).
- Estados: empty · loading/skeleton.
- Hierarquia: expand/collapse por nó, conectores, indent, badges por nível.
- A11y de DnD (KeyboardSensor) + click preservado (distance:5).

**Reservado pra fase 2 (não implementar agora, só prever na API):** virtualização
(listas longas), async/server, lazy-load de filhos (`onLoadChildren`).

## 3. Decisões de design (do gate)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Modelo de controle | **Primitivo burro** (controlado/não-controlado de UI). Controller "smart" → `DataList` (passo 2). |
| 2 | Conteúdo do card | **Slots + `renderItem`** (override do miolo; wrapper sempre do List). |
| 3 | Arquitetura | **A — `List` standalone**, card-first, reusando `@dnd-kit` + tokens + padrão de slots; **espelha** (não acopla) group/tree. |
| 4 | Escopo v1 | **Núcleo + DnD client-side**; 3 layouts; seleção/colapso; estados. Toolbar/controller/virtualização/server = depois. |

**Princípio anti-duplicação:** lógica genérica vira **util puro testável**
(`group-items`, `flatten-tree`) e **hook isolado** (`use-list-dnd` espelhando
`useKanbanDnD`). NÃO criar uma lib `_shared` acoplando 3 componentes grandes por
antecipação — extrair só com evidência futura.

## 4. Estrutura de arquivos

```
src/components/ui/List/
  index.ts
  list.tsx                  # <List> raiz — escolhe layout por `layout`; provê contexto de DnD
  list-item.tsx             # <ListItem> — wrapper do card + slots default + renderItem override
  list.types.ts             # ListItemData · ListGroup · ListMenuItem · ListProps · render params
  list.styles.ts            # tv() com slots
  layouts/
    standard-layout.tsx     # lista plana (+ reorder opcional)
    grouped-layout.tsx      # seções + DnD (entre grupos e reorder dentro)
    hierarchical-layout.tsx # árvore-como-lista + colapso + linhas de conexão
  hooks/
    use-list-dnd.ts         # encapsula @dnd-kit (sensors + handlers) — espelha useKanbanDnD
    use-disclosure-set.ts   # Set de expandidos (controlado/não-controlado)
    use-selection-set.ts    # Set de selecionados (controlado/não-controlado)
  utils/
    group-items.ts          # itens planos → grupos (puro)
    flatten-tree.ts         # árvore → linhas com depth + flags de conector (puro)
  USAGE.md
```

## 5. Modelo de dados + slots

```ts
type ListItemData = {
  id: string;
  // slots comuns (layout default do card):
  leading?: ReactNode;          // avatar / ícone / icon-chip
  title: ReactNode;
  subtitle?: ReactNode;         // segunda linha (ex: e-mail)
  description?: ReactNode;      // line-clamp
  meta?: { label: ReactNode; value: ReactNode; align?: "start" | "end" }[]; // colunas no card
  trailing?: ReactNode;         // valor/badge à direita
  // estrutura:
  groupId?: string;             // layout grouped
  children?: ListItemData[];    // layout hierarchical (árvore aninhada canônica)
  // dnd:
  canDrag?: boolean;            // default true
  canDrop?: boolean;            // default true (alvo de drop)
  // passthrough:
  data?: unknown;               // disponível em renderItem (card rico)
};

type ListGroup = {
  id: string;
  label: ReactNode;
  color?: string;               // dot/realce; ideal var de token DS
  count?: number;               // override; senão calculado
  canReceiveDrop?: boolean;     // default true
};

type ListMenuItem = {           // mesmo shape do KanbanMenuItem
  label?: ReactNode; icon?: ReactNode; onClick?: () => void;
  destructive?: boolean; disabled?: boolean; separator?: boolean;
};
```

- **Caso comum** → slots. **Card rico** (progress, avatars empilhados — Rechain) →
  `renderItem(item, state)` substitui só o **miolo**; o wrapper (card, selected/open,
  drag handle, checkbox, indent, conectores) é **sempre** do List (consistência).

## 6. Organização de hooks (a espinha)

- **`<List>` burro** — recebe estado resolvido (expanded Set, selected Set, ordem) +
  callbacks; delega pro layout component.
- **`use-disclosure-set` / `use-selection-set`** — idioma controlado/não-controlado:
  `defaultExpandedIds` OU `expandedIds` + `onExpandedChange` (idem seleção). Estado de
  UI puro — **não** é o controller de dados (esse é o `DataList`).
- **`use-list-dnd`** — isola `@dnd-kit` (reorder vertical + mover entre grupos),
  espelhando `useKanbanDnD`: `PointerSensor { distance: 5 }` (preserva click),
  `KeyboardSensor` (a11y), `over.id` namespaced (`group:`/`item:`), move otimista
  (consumer commita; sem revert automático).
- **utils puros** — `group-items` (flat → grupos na ordem de `groups`), `flatten-tree`
  (árvore → linhas com `depth` + flags `isLast`/`hasChildren` pros conectores).

Separação: **render** (list + layouts + item) · **estado de UI** (2 hooks) · **DnD**
(1 hook) · **dados** (2 utils). Cada unidade compreensível e testável isolada.

## 7. API de props

```ts
type ListProps = {
  layout?: "standard" | "grouped" | "hierarchical";   // default "standard"
  items: ListItemData[];
  groups?: ListGroup[];                                 // grouped

  renderItem?: (item: ListItemData, state: {
    selected: boolean; open: boolean; dragging: boolean; depth: number;
  }) => ReactNode;
  getMenuItems?: (item: ListItemData) => ListMenuItem[];
  onItemClick?: (id: string) => void;
  openId?: string;                                      // realce "aberto" (detail panel)

  // seleção (controlado/não-controlado):
  selectable?: boolean;
  selectedIds?: Set<string>; defaultSelectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;

  // hierarquia:
  expandedIds?: Set<string>; defaultExpandedIds?: Set<string>;
  onExpandedChange?: (ids: Set<string>) => void;
  showConnectors?: boolean;                             // default true no hierarchical
  indentSize?: number;                                  // px por nível

  // dnd:
  enableDnD?: boolean;                                  // default false
  onReorder?: (id: string, toIndex: number, groupId?: string) => void;
  onMove?: (id: string, from: string, to: string, index: number) => void; // grouped

  // estados + visual:
  loading?: boolean; skeletonCount?: number;
  emptyState?: ReactNode;
  density?: "comfortable" | "compact";                  // default "comfortable"
  className?: string;

  // reservado fase 2 (NÃO implementar agora):
  // virtualized?: boolean; onLoadChildren?: (id: string) => Promise<ListItemData[]>;
};
```

## 8. Layouts

- **standard** — cards empilhados (gap por token). Reorder opcional via `enableDnD`
  (drag handle no card).
- **grouped** — seções: header (label + cor/dot + contagem, colapsável) + lista de
  cards. DnD entre grupos (respeita `canReceiveDrop`) e reorder dentro. Move otimista.
- **hierarchical** — `flatten-tree` → linhas com `depth`; indent + **linhas de conexão**
  (guias verticais + ∟ no último filho); toggle de colapso por nó; entidades mistas por
  nível (o card é o mesmo `ListItem`, só muda o conteúdo via slots/`renderItem`).

## 9. Estilo (tv slots) e tokens

`list.styles.ts` com slots: `root · group · groupHeader · groupCount · item (card) ·
itemHandle · itemLeading · itemContent · itemTitle · itemSubtitle · itemMeta · itemMetaLabel
· itemMetaValue · itemTrailing · itemActions · checkbox · indentGuide · connector ·
dropIndicator`. Variants: `density` (comfortable/compact), `selected`, `open`, `dragging`,
`clickable`. Só tokens DS (gap-gp-_, p-pad-_, rounded-radius-_, shadow-sh-_, bg-bg-_,
text-fg-_, border-border-_). Card reusa a "receita" do `TableCardRow` (bg-surface +
border-default + estados selected/open com strip lateral brand). Connectors via
`bg-border-default`.

## 10. Acessibilidade

- DnD: `KeyboardSensor` + anúncios padrão do dnd-kit; `distance:5` preserva click.
- Hierarquia: toggle com `aria-expanded`; `role="treegrid"`/`treeitem` no hierarchical,
  `role="list"`/`listitem` nos demais.
- Card clicável: guard touch-safe (ignora click vindo de button/checkbox/menu/link —
  reusa o padrão do `TableCardRow`).
- Foco visível por token (`ring-ring-brand`).

## 11. Testes

- Utils puros: `group-items` e `flatten-tree` (unit, incl. depth/conector flags).
- `use-list-dnd`: resolução de `over.id`, bloqueio de `canReceiveDrop`, no-op quando
  `enabled=false` (espelha o teste do `use-kanban-dnd`).
- Render: os 3 layouts renderizam; colapso esconde filhos; seleção controlada/não-
  controlada; estados empty/loading. Validação visual no showcase (dark + light).

## 12. Definição de Pronto (L-042 — 7 superfícies)

1. Código (`ui/List/**`) · 2. `USAGE.md` · 3. `inventory.md` (+contador) ·
4. Showcase (`ListDoc.tsx` + `App.tsx` import/render/**`DOC_PAGES`** + `doc-nav-data`) ·
5. `registry.json` · 6. catálogo do CLI · 7. changelog.

**Cadência:** 1–4 no PR do componente; **5/6/7 no `/ds-release`** (anotar pendência no
PR body). Showcase com 3 exemplos (Standard/Grouped/Hierarchical) em segmented.

## 13. Fora de escopo (passo 2 — `DataList`)

TableToolbar (busca/segmented/bulk), filtros/sort/saved-views, server/async,
persistência (localStorage), virtualização, lazy-load de filhos.

## 14. Premissas (Assumption central)

- `@dnd-kit/core` (já dep do Kanban) cobre reorder vertical + cross-group sem lib nova.
- Árvore aninhada (`children`) como fonte canônica da hierarquia é suficiente (não
  precisa de `parentId` flat no v1).
- O card único (`ListItem`) com slots + `renderItem` cobre Supabase (meta-colunas) e
  Rechain (rico) sem um engine de colunas.

Se alguma quebrar (ex: precisar de `parentId` por causa de dados server flat), revisitar
o modelo de dados antes de implementar a hierarquia.
