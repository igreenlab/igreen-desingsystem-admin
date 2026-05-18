# Tabela — réplica exata do sandbox `/design-and-table-v2`

> **Objetivo**: replicar **idêntico** o visual e comportamentos da tabela que está em
> `src/app/design-and-table-v2/page.js` (componente `<TblTable>`) dentro do DS
> `Modelo/`, consumindo os tokens do DS atual (incluindo `bg.table-row-hover`).
>
> **Fonte de verdade**: `src/app/design-and-table-v2/page.js`, linhas 1895-2377
> (componentes JSX) e 3350-3733 (CSS). Este documento é uma transcrição
> auditada — qualquer divergência aqui é bug do MD, não do sandbox.

---

## Sumário rápido — pontos onde o componente costuma errar

1. **Faltam ícones de tipo no header** — cada coluna tem um ícone (Hash, User, AtSign, Phone, CheckCircle2, Tag, Users, DollarSign, Calendar, Type) renderizado à esquerda do label com `opacity: 0.7` (vai pra `1` no hover/sorted).
2. **Faltam as 13 colunas** — não é uma tabela genérica de N colunas; o sandbox tem exatamente 13 colunas com larguras específicas (algumas fixas em px, outras flex com `minWidth`).
3. **Resize handle não projeta linha pra baixo** — quando o cursor está sobre o handle vertical (6px na borda direita do th), uma linha brand de 2px aparece projetada `top: 100%; height: 100vh` cobrindo o body inteiro. É isso que dá o feedback de "vou redimensionar essa coluna inteira".
4. **Linha de selected/open sem strip lateral** — row selecionada (checkbox) ou aberta (detail panel) tem um `::before` absoluto com `width: 3px` e `background: var(--bg-brand)` colado em `left: 0`.
5. **Hover row com bg sólido (não alpha)** — `--bg-table-row-hover` é sólido em ambos os temas. Isso garante que a célula sticky `.tbl-td-actions` (que tem bg próprio) mantenha exatamente a mesma cor do resto da row.
6. **Tipografia 13px** — body 13px, head 13px, ID e date `font-variant-numeric: tabular-nums` (alinhamento numérico), currency `font-weight: 600`.
7. **Alturas exatas por densidade** — compact 40px, comfortable 56px (default), spacious 64px. Head é **sempre 42px** independente da densidade.
8. **Cell borders toggle** — borda vertical entre células é controlada pela classe `.has-cell-borders` no `.tbl-table-wrap`. Última coluna antes de `actions` e a coluna `actions` ficam sem border-right.
9. **Sticky behavior** — head é `position: sticky; top: 0` (col actions = `position: sticky; right: 0`). Bg da actions cell adapta: `bg-surface` (default), `--bg-table-row-hover` (hover/menu-open), `bg-brand-subtle` (selected/open).

---

## 1. Estrutura DOM (árvore literal)

```
<div class="tbl-table-wrap tbl-density-comfortable has-cell-borders"
     role="region" aria-label="Tabela de clientes">

  <div class="tbl-table">

    <!-- HEAD -->
    <div class="tbl-thead" role="rowgroup">
      <div class="tbl-tr-head" role="row">

        <!-- Coluna 0: select (44px) -->
        <div class="tbl-th tbl-th-select" role="columnheader">
          <input type="checkbox" class="tbl-checkbox" />
        </div>

        <!-- Colunas 1..N: dados (Hash, User, AtSign, ...) -->
        <div class="tbl-th [is-sorted]" role="columnheader" style="width:X / minWidth:Y; flex:...">
          <TypeIcon class="tbl-th-type-icon" />        <!-- ícone do tipo -->
          <span class="tbl-th-label">Nome da coluna</span>
          {sorted ? (
            <span class="tbl-th-sort">
              <span class="tbl-th-sort-index">1</span>  <!-- chip brand com número -->
              <ArrowUpDown />
            </span>
          ) : (
            <span class="tbl-th-sort-hint"><ArrowUpDown /></span>  <!-- hint atenuado -->
          )}
          <button class="tbl-th-menu"><MoreVertical /></button>     <!-- "..." -->
          <span class="tbl-th-resize"></span>                       <!-- handle vertical -->
        </div>

        <!-- Coluna N+1: actions (44px, sticky right) -->
        <div class="tbl-th tbl-th-actions" role="columnheader" />

      </div>
    </div>

    <!-- BODY -->
    <div class="tbl-tbody" role="rowgroup">
      <div class="tbl-tr [is-selected] [is-open] [is-menu-open]"
           role="row" tabindex="0" onClick={openDetails}>

        <!-- Coluna select -->
        <div class="tbl-td tbl-td-select" role="cell" onClick={stopPropagation}>
          <input type="checkbox" class="tbl-checkbox" />
        </div>

        <!-- Colunas de dados -->
        <div class="tbl-td" role="cell" style={cellStyle}>
          <CellRenderer col={col} row={row} />
        </div>

        <!-- Coluna actions (44px, sticky right) -->
        <div class="tbl-td tbl-td-actions" role="cell" onClick={stopPropagation}>
          <button class="tbl-row-menu-btn"><MoreHorizontal /></button>
        </div>

      </div>
      <!-- ... mais rows -->
    </div>

  </div>

  <!-- Portais (renderizam em document.body, fora do wrap) -->
  <TblRowActionsMenu />    <!-- popover do "..." da row -->
  <TblConfirmDialog />     <!-- modal de confirmar delete -->
  <TblDetailsPanel />      <!-- slide-in da direita -->
</div>
```

---

## 2. Definição das 13 colunas (literal — copiar)

```ts
import {
  Hash, User, AtSign, Phone, CheckCircle2, Tag, Users,
  DollarSign, Calendar, Type
} from 'lucide-react';

const COLUMNS = [
  { key: 'select',      width: 44,                          type: 'select' },
  { key: 'id',          width: 120,    label: 'ID',             type: 'id',       icon: Hash },
  { key: 'name',        minWidth: 220, label: 'Nome',           type: 'person',   icon: User,         sorted: true },
  { key: 'email',       minWidth: 240, label: 'Email',          type: 'email',    icon: AtSign },
  { key: 'phone',       minWidth: 170, label: 'Telefone',       type: 'phone',    icon: Phone },
  { key: 'status',      minWidth: 140, label: 'Status',         type: 'status',   icon: CheckCircle2 },
  { key: 'category',    minWidth: 130, label: 'Categoria',      type: 'category', icon: Tag },
  { key: 'agent',       minWidth: 170, label: 'Atribuído',      type: 'agent',    icon: Users },
  { key: 'value',       width: 130,    label: 'Valor',          type: 'currency', icon: DollarSign },
  { key: 'createdAt',   width: 130,    label: 'Criado em',      type: 'date',     icon: Calendar },
  { key: 'lastContact', width: 150,    label: 'Último contato', type: 'date',     icon: Calendar },
  { key: 'location',    minWidth: 150, label: 'Localização',    type: 'text',     icon: Type },
  { key: 'actions',     width: 44,                          type: 'actions' },
];
```

**Regra `width` vs `minWidth`** — `width` = coluna fixa (não cresce nem encolhe).
`minWidth` = coluna flex que cresce pra preencher espaço sobrando (é o que faz a
tabela ocupar a viewport inteira em telas largas).

```ts
function getColCellStyle(col) {
  if (col.width)    return { width: col.width,    flex: `0 0 ${col.width}px` };
  if (col.minWidth) return { minWidth: col.minWidth, flex: `1 0 ${col.minWidth}px` };
  return {};
}
```

Head e body iteram o **mesmo array `COLUMNS`** → alinhamento garantido, sem
chance de divergência entre células.

---

## 3. Tipos de célula (renderers)

```tsx
function CellRenderer({ col, row }) {
  switch (col.type) {
    case 'id':       return <span className="tbl-cell-id">{row.id}</span>;
    case 'person':   return <PersonCell row={row} />;
    case 'email':    return (
      <a href={`mailto:${row.email}`} className="tbl-cell-link" onClick={(e) => e.stopPropagation()}>
        {row.email}
      </a>
    );
    case 'phone':    return <PhoneCell value={row.phone} />;
    case 'status':   return <StatusCell statusId={row.statusId} />;
    case 'category': return <CategoryCell categoryId={row.categoryId} />;
    case 'agent':    return <AgentCell agentId={row.agentId} />;
    case 'currency': return <span className="tbl-cell-currency">{formatCurrency(row.value)}</span>;
    case 'date':     return <DateCell value={row[col.key]} />;
    case 'text':     return row[col.key];
    default:         return null;
  }
}
```

### Sub-componentes

```tsx
function StatusCell({ statusId }) {
  const s = STATUSES[statusId];
  if (!s) return null;
  return (
    <span className="tbl-cell-status">
      <span className="tbl-dot" style={{ background: s.color }} aria-hidden />
      {s.label}
    </span>
  );
}

function CategoryCell({ categoryId }) {
  const c = CATEGORIES[categoryId];
  if (!c) return null;
  return <span className={`chip chip-${c.kind} chip-sm`}>{c.label}</span>;
}

function PersonCell({ row }) {
  return (
    <span className="tbl-cell-person" title={row.name}>
      <span className="tbl-avatar" style={{ background: row.avatarColor }}>
        {row.initials}
      </span>
      <span className="tbl-cell-person-name">{row.name}</span>
    </span>
  );
}

function AgentCell({ agentId }) {
  const a = AGENTS[agentId];
  if (!a) return <span className="tbl-muted">—</span>;
  return (
    <span className="tbl-cell-agent" title={a.name}>
      <span className="tbl-avatar tbl-avatar-sm" style={{ background: a.color }}>
        {a.initials}
      </span>
      <span>{a.name}</span>
    </span>
  );
}

function PhoneCell({ value }) {
  if (!value) return <span className="tbl-muted">—</span>;
  return (
    <a
      href={`tel:${value.replace(/\D/g, '')}`}
      className="tbl-cell-link"
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </a>
  );
}

function DateCell({ value }) {
  if (!value) return <span className="tbl-muted">—</span>;
  return <span className="tbl-cell-date">{formatDateShort(value)}</span>;
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 2
  });
}

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function formatDateShort(value) {
  if (!value) return '—';
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, '0');
  return `${day} de ${MONTHS_SHORT[d.getMonth()]}`;
}
```

---

## 4. Lookup tables (statuses, categorias, agentes)

```ts
const STATUSES = {
  active:   { label: 'Ativo',    color: 'var(--color-fg-success)' },
  pending:  { label: 'Pendente', color: 'var(--color-fg-warning)' },
  paused:   { label: 'Pausado',  color: 'var(--color-fg-info)' },
  inactive: { label: 'Inativo',  color: 'var(--color-fg-muted)' },
};

const CATEGORIES = {
  royal:      { label: 'Royal',      kind: 'warning' },
  licenciado: { label: 'Licenciado', kind: 'info' },
  lead:       { label: 'Lead',       kind: 'success' },
};

const AGENTS = {
  you:    { name: 'Você',         initials: 'VC', color: '#0a3a2e' },
  aline:  { name: 'Aline Castro', initials: 'AC', color: '#f59e0b' },
  carlos: { name: 'Carlos Souza', initials: 'CS', color: '#8754ec' },
  maria:  { name: 'Maria Lima',   initials: 'ML', color: '#ef4444' },
};
```

> **NOTA sobre cores de avatar**: são literais (`#f59e0b`, etc) — fakes de
> "cor do usuário", não vão pra tokens. Avatar é o único lugar onde se aceita
> hex direto (cor personalizada por entidade).

---

## 5. Mock data (10 rows determinísticas)

```ts
const BASE_DATE = new Date('2026-04-15T12:00:00Z').getTime();
const DAY_MS = 86400000;

const ROWS_MOCK = [
  { id: 'CLI-2401', name: 'Maria Silva',     initials: 'MS', avatarColor: '#f59e0b', email: 'maria.silva@example.com',     phone: '+55 11 91234-5678', statusId: 'active',   categoryId: 'royal',      city: 'São Paulo',      location: 'São Paulo, SP',      value: 4800,  agentId: 'you',    createdAt: BASE_DATE - 65 * DAY_MS, lastContact: BASE_DATE - 2 * DAY_MS  },
  { id: 'CLI-2402', name: 'João Santos',     initials: 'JS', avatarColor: '#0a3a2e', email: 'joao.santos@example.com',     phone: '+55 11 92345-6789', statusId: 'pending',  categoryId: 'licenciado', city: 'Rio de Janeiro', location: 'Rio de Janeiro, RJ', value: 12300, agentId: 'aline',  createdAt: BASE_DATE - 58 * DAY_MS, lastContact: BASE_DATE - 5 * DAY_MS  },
  { id: 'CLI-2403', name: 'Carlos Oliveira', initials: 'CO', avatarColor: '#8754ec', email: 'carlos.oliveira@example.com', phone: '+55 11 93456-7890', statusId: 'active',   categoryId: 'lead',       city: 'Belo Horizonte', location: 'Belo Horizonte, MG', value: 2150,  agentId: 'carlos', createdAt: BASE_DATE - 51 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: 'CLI-2404', name: 'Ana Costa',       initials: 'AC', avatarColor: '#1cb280', email: 'ana.costa@example.com',       phone: '+55 11 94567-8901', statusId: 'paused',   categoryId: 'royal',      city: 'Porto Alegre',   location: 'Porto Alegre, RS',   value: 8900,  agentId: 'maria',  createdAt: BASE_DATE - 44 * DAY_MS, lastContact: BASE_DATE - 12 * DAY_MS },
  { id: 'CLI-2405', name: 'Pedro Pereira',   initials: 'PP', avatarColor: '#ef4444', email: 'pedro.pereira@example.com',   phone: '+55 11 95678-9012', statusId: 'inactive', categoryId: 'lead',       city: 'Curitiba',       location: 'Curitiba, PR',       value: 1100,  agentId: 'you',    createdAt: BASE_DATE - 37 * DAY_MS, lastContact: BASE_DATE - 30 * DAY_MS },
  { id: 'CLI-2406', name: 'Lúcia Almeida',   initials: 'LA', avatarColor: '#f9a47a', email: 'lucia.almeida@example.com',   phone: '+55 11 96789-0123', statusId: 'active',   categoryId: 'licenciado', city: 'Recife',         location: 'Recife, PE',         value: 6750,  agentId: 'aline',  createdAt: BASE_DATE - 30 * DAY_MS, lastContact: BASE_DATE - 3 * DAY_MS  },
  { id: 'CLI-2407', name: 'Roberto Souza',   initials: 'RS', avatarColor: '#0088cc', email: 'roberto.souza@example.com',   phone: '+55 11 97890-1234', statusId: 'pending',  categoryId: 'royal',      city: 'São Paulo',      location: 'São Paulo, SP',      value: 15200, agentId: 'carlos', createdAt: BASE_DATE - 23 * DAY_MS, lastContact: BASE_DATE - 7 * DAY_MS  },
  { id: 'CLI-2408', name: 'Fernanda Lima',   initials: 'FL', avatarColor: '#e1306c', email: 'fernanda.lima@example.com',   phone: '+55 11 98901-2345', statusId: 'active',   categoryId: 'lead',       city: 'Rio de Janeiro', location: 'Rio de Janeiro, RJ', value: 3400,  agentId: 'maria',  createdAt: BASE_DATE - 16 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: 'CLI-2409', name: 'Bruno Rodrigues', initials: 'BR', avatarColor: '#70c748', email: 'bruno.rodrigues@example.com', phone: '+55 11 99012-3456', statusId: 'paused',   categoryId: 'licenciado', city: 'Belo Horizonte', location: 'Belo Horizonte, MG', value: 5600,  agentId: 'you',    createdAt: BASE_DATE - 9 * DAY_MS,  lastContact: BASE_DATE - 6 * DAY_MS  },
  { id: 'CLI-2410', name: 'Camila Ribeiro',  initials: 'CR', avatarColor: '#8754ec', email: 'camila.ribeiro@example.com',  phone: '+55 11 90123-4567', statusId: 'active',   categoryId: 'royal',      city: 'Porto Alegre',   location: 'Porto Alegre, RS',   value: 9800,  agentId: 'aline',  createdAt: BASE_DATE - 2 * DAY_MS,  lastContact: BASE_DATE                },
];
```

---

## 6. Componente raiz `<TblTable>`

```tsx
function TblTable({ density, cellBorders = true, selectedIds, setSelectedIds }) {
  const [rowMenu, setRowMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detailsRowId, setDetailsRowId] = useState(null);
  const detailsRow = detailsRowId ? ROWS_MOCK.find((r) => r.id === detailsRowId) : null;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = selectedIds.size === ROWS_MOCK.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const toggleAll = () => {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(ROWS_MOCK.map((r) => r.id)));
  };

  return (
    <div
      className={`tbl-table-wrap tbl-density-${density} ${cellBorders ? 'has-cell-borders' : ''}`}
      role="region"
      aria-label="Tabela de clientes"
    >
      <div className="tbl-table">

        {/* HEAD */}
        <div className="tbl-thead" role="rowgroup">
          <div className="tbl-tr-head" role="row">
            {COLUMNS.map((col) => {
              const cellStyle = getColCellStyle(col);
              if (col.type === 'select') return (
                <div key={col.key} className="tbl-th tbl-th-select" role="columnheader" style={cellStyle}>
                  <input
                    type="checkbox"
                    className="tbl-checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    aria-label="Selecionar todas"
                  />
                </div>
              );
              if (col.type === 'actions') return (
                <div key={col.key} className="tbl-th tbl-th-actions" role="columnheader"
                     aria-label="Ações" style={cellStyle} />
              );
              const TypeIcon = col.icon;
              return (
                <div key={col.key}
                     className={`tbl-th ${col.sorted ? 'is-sorted' : ''}`}
                     role="columnheader" style={cellStyle}>
                  {TypeIcon && <TypeIcon size={13} strokeWidth={1.7} className="tbl-th-type-icon" aria-hidden="true" />}
                  <span className="tbl-th-label">{col.label}</span>
                  {col.sorted ? (
                    <span className="tbl-th-sort">
                      <span className="tbl-th-sort-index">1</span>
                      <ArrowUpDown size={12} strokeWidth={1.8} />
                    </span>
                  ) : (
                    <span className="tbl-th-sort-hint" aria-hidden>
                      <ArrowUpDown size={11} strokeWidth={1.8} />
                    </span>
                  )}
                  <button type="button" className="tbl-th-menu"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Menu da coluna ${col.label}`}
                          title={`Menu da coluna ${col.label}`}>
                    <MoreVertical size={15} strokeWidth={1.7} />
                  </button>
                  <span className="tbl-th-resize" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>

        {/* BODY */}
        <div className="tbl-tbody" role="rowgroup">
          {ROWS_MOCK.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const isMenuOpen = rowMenu?.id === row.id;
            const isOpen = detailsRowId === row.id;
            return (
              <div key={row.id} role="row" tabIndex={0}
                   className={`tbl-tr ${isSelected ? 'is-selected' : ''} ${isOpen ? 'is-open' : ''} ${isMenuOpen ? 'is-menu-open' : ''}`}
                   onClick={() => setDetailsRowId(row.id)}>
                {COLUMNS.map((col) => {
                  const cellStyle = getColCellStyle(col);
                  if (col.type === 'select') return (
                    <div key={col.key} className="tbl-td tbl-td-select" role="cell"
                         style={cellStyle} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="tbl-checkbox"
                             checked={isSelected}
                             onChange={() => toggleSelect(row.id)}
                             aria-label={`Selecionar ${row.name}`} />
                    </div>
                  );
                  if (col.type === 'actions') return (
                    <div key={col.key} className="tbl-td tbl-td-actions" role="cell"
                         style={cellStyle} onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="tbl-row-menu-btn"
                              aria-label="Ações da linha" title="Ações"
                              aria-expanded={isMenuOpen}
                              onClick={(e) => {
                                e.stopPropagation();
                                const el = e.currentTarget;
                                setRowMenu(isMenuOpen ? null : { id: row.id, el });
                              }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  );
                  return (
                    <div key={col.key} className="tbl-td" role="cell" style={cellStyle}>
                      <CellRenderer col={col} row={row} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
```

> **Portais omitidos** — `<TblRowActionsMenu>`, `<TblConfirmDialog>` e
> `<TblDetailsPanel>` são opcionais nesta primeira versão. Se ainda não
> existem no DS, deixe os handlers em `console.log` por enquanto e cuide
> só do componente da tabela.

---

## 7. CSS completo — porta direta com tokens do DS

> **Mapeamento de CSS vars do sandbox → tokens DS Modelo**:
>
> | CSS var sandbox | Token DS Modelo (classe ou var) |
> |---|---|
> | `--table-bg` | `var(--color-bg-table)` (= `bg.table`) |
> | `--table-head-bg` | `var(--color-bg-table-head)` |
> | `--table-border` | `var(--color-border-table)` (= `border.table`) |
> | `--row-hover-bg` | `var(--color-bg-table-row-hover)` |
> | `--bg-brand` | `var(--color-bg-brand)` |
> | `--bg-brand-subtle` | `var(--color-bg-brand-subtle)` |
> | `--fg-on-brand` | `var(--color-fg-on-brand)` |
> | `--fg-default` | `var(--color-fg-default)` |
> | `--fg-muted` | `var(--color-fg-muted)` |
> | `--fg-success/warning/info/danger` | `var(--color-fg-<status>)` |
> | `--bg-surface` | `var(--color-bg-surface)` |
> | `--bg-muted` | `var(--color-bg-muted)` |
> | `--border-input` | `var(--color-border-input)` |
> | `--border-strong` | (não existe — usar `border-input` mais escura no hover, ou criar?) |
> | `--bg-success-muted` etc | `var(--color-bg-<status>-muted)` |
>
> **Atenção**: o sandbox usa `border-strong` no hover de inputs. No DS Modelo
> isso não existe ainda — se for um problema, perguntar antes de criar.

### 7.1 Wrap (container externo)

```css
.tbl-table-wrap {
  flex: 1;
  overflow: auto;
  background: var(--color-bg-table);
  border: 1px solid var(--color-border-table);
  border-radius: 12px;  /* radius-xl */
  scrollbar-width: thin;
  min-height: 0;
}
.tbl-table-wrap::-webkit-scrollbar { width: 8px; height: 8px; }
.tbl-table-wrap::-webkit-scrollbar-thumb {
  background: var(--color-bg-muted);
  border-radius: 9999px;
}

.tbl-table {
  display: block;
  min-width: max-content;  /* permite scroll horizontal */
}
```

### 7.2 Head (sticky)

```css
.tbl-thead {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-bg-table-head);
  border-bottom: 1px solid var(--color-border-table);
}
.tbl-tr-head {
  display: flex;
  background: var(--color-bg-table-head);
}
.tbl-th {
  position: relative;
  display: flex; align-items: center; gap: 6px;
  padding: 0 38px 0 14px;  /* padding-right reserva espaço pro menu absoluto */
  height: 42px;            /* SEMPRE 42px, independente da densidade */
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  color: var(--color-fg-muted);
  cursor: pointer;
  user-select: none;
  flex: 1 0 auto;
}
.tbl-th-select,
.tbl-th-actions { padding: 0 12px; }  /* sem reserva pro menu */

.tbl-th:hover { color: var(--color-fg-default); }
.tbl-th.is-sorted { color: var(--color-fg-default); }

.tbl-th-label {
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-align: left;
}

/* Ícone de tipo (Hash/User/AtSign/etc) — opacity vai pra 1 em hover/sorted */
.tbl-th-type-icon {
  flex: 0 0 auto;
  color: var(--color-fg-muted);
  opacity: 0.7;
}
.tbl-th:hover .tbl-th-type-icon { opacity: 1; }
.tbl-th.is-sorted .tbl-th-type-icon { opacity: 1; }
```

### 7.3 Cell borders verticais (toggle `.has-cell-borders`)

```css
.tbl-table-wrap.has-cell-borders .tbl-th  { border-right: 1px solid var(--color-border-table); }
.tbl-table-wrap.has-cell-borders .tbl-td  { border-right: 1px solid var(--color-border-table); }
/* Actions e a coluna IMEDIATAMENTE antes dela ficam sem border-right */
.tbl-table-wrap.has-cell-borders .tbl-th-actions,
.tbl-table-wrap.has-cell-borders .tbl-td-actions { border-right: 0; }
.tbl-table-wrap.has-cell-borders .tbl-tr-head .tbl-th:nth-last-child(2),
.tbl-table-wrap.has-cell-borders .tbl-tr      .tbl-td:nth-last-child(2) {
  border-right: 0;
}
```

### 7.4 Sort indicator (badge brand) + hint

```css
.tbl-th-sort {
  display: inline-flex; align-items: center; gap: 4px;
  flex: 0 0 auto;
  color: var(--color-fg-default);
}
.tbl-th-sort-index {
  display: grid; place-items: center;
  min-width: 18px; height: 18px;
  padding: 0 5px;
  border-radius: 4px;
  background: var(--color-bg-brand);
  color: var(--color-fg-on-brand);
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Hint atenuado em hover de col não-sorted (sinaliza clicável pra ordenar) */
.tbl-th-sort-hint {
  display: inline-flex; align-items: center;
  flex: 0 0 auto;
  color: var(--color-fg-muted);
  opacity: 0;
  transition: opacity 0.15s ease;
}
.tbl-th:hover .tbl-th-sort-hint { opacity: 0.5; }
```

### 7.5 Menu "..." do header (aparece só no hover)

```css
.tbl-th-menu {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: grid; place-items: center;
  width: 28px; height: 28px;
  border: 0;
  background: transparent;
  color: var(--color-fg-muted);
  border-radius: 6px;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}
.tbl-th:hover .tbl-th-menu { opacity: 1; }
.tbl-th-menu:hover {
  background: var(--color-bg-muted);
  color: var(--color-fg-default);
}
.tbl-th-select .tbl-th-menu,
.tbl-th-actions .tbl-th-menu { display: none; }
```

### 7.6 Resize handle (linha que se projeta pra baixo no hover)

> **Esse é um dos pontos que costuma faltar** — quando o cursor está em
> cima do handle (a faixa de 6px na borda direita do th), uma linha brand
> de 2px aparece projetada `top: 100%; height: 100vh` cobrindo o body
> inteiro abaixo. É o feedback de "vou redimensionar a coluna toda".

```css
.tbl-th-resize {
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 6px;
  background: transparent;
  cursor: col-resize;
  z-index: 2;
}

/* Linha vertical dentro do header — aparece em hover do th */
.tbl-th-resize::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 8px; bottom: 8px;
  width: 1px;
  background: transparent;
  transform: translateX(-50%);
  transition: background 0.15s ease, top 0.15s ease, bottom 0.15s ease, width 0.15s ease;
}
.tbl-th:hover .tbl-th-resize::before { background: var(--color-fg-muted); }

/* Hover direto no handle → brand + 2px + altura total */
.tbl-th-resize:hover::before {
  background: var(--color-bg-brand);
  width: 2px;
  top: 0; bottom: 0;
}

/* Linha PROJETADA PRA BAIXO — cobre body inteiro no hover do handle */
.tbl-th-resize::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 2px;
  height: 100vh;
  background: transparent;
  transform: translateX(-50%);
  pointer-events: none;
  transition: background 0.15s ease;
}
.tbl-th-resize:hover::after { background: var(--color-bg-brand); }

.tbl-th-select .tbl-th-resize,
.tbl-th-actions .tbl-th-resize { display: none; }
```

### 7.7 Colunas especiais (select / actions sticky)

```css
.tbl-th-select {
  width: 44px; flex: 0 0 44px; padding: 0 12px;
  cursor: default; justify-content: center;
}
.tbl-th-select:hover { background: transparent; }

.tbl-th-actions {
  width: 44px; flex: 0 0 44px;
  cursor: default; padding: 0;
  position: sticky; right: 0; z-index: 3;
  background: var(--color-bg-table-head);
}
```

### 7.8 Body — rows e estados

```css
.tbl-tbody { background: var(--color-bg-surface); }

.tbl-tr {
  position: relative;
  display: flex;
  border-bottom: 1px solid var(--color-border-table);
  background: var(--color-bg-surface);
  cursor: pointer;
  transition: background 0.15s ease;
}

/* Hover row (e menu-open) — bg sólido em ambos os temas */
.tbl-tr:hover,
.tbl-tr.is-menu-open { background: var(--color-bg-table-row-hover); }

/* Selected (checkbox) e Open (detail panel) — mesmo visual brand-tinted */
.tbl-tr.is-selected,
.tbl-tr.is-open { background: var(--color-bg-brand-subtle); }

/* Strip lateral brand 3px (left edge) */
.tbl-tr.is-selected::before,
.tbl-tr.is-open::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--color-bg-brand);
  z-index: 5;
  pointer-events: none;
}

.tbl-tr:focus-visible {
  outline: 2px solid var(--color-bg-brand);
  outline-offset: -2px;
}
```

### 7.9 Cells

```css
.tbl-td {
  display: flex; align-items: center;
  padding: 0 14px;
  font-size: 13px;
  color: var(--color-fg-default);
  flex: 1 0 auto;
  overflow: hidden;
  white-space: nowrap;
}
.tbl-td-right { justify-content: flex-end; }
.tbl-td-select {
  width: 44px; flex: 0 0 44px; padding: 0 12px;
  justify-content: center;
}

/* Sticky actions cell — bg adapta ao estado da row */
.tbl-td-actions {
  width: 44px; flex: 0 0 44px;
  padding: 0;
  justify-content: center;
  position: sticky; right: 0; z-index: 2;
  background: var(--color-bg-surface);
}
.tbl-tr:hover .tbl-td-actions,
.tbl-tr.is-menu-open .tbl-td-actions { background: var(--color-bg-table-row-hover); }
.tbl-tr.is-selected .tbl-td-actions,
.tbl-tr.is-open     .tbl-td-actions { background: var(--color-bg-brand-subtle); }

/* Botão "..." da row — aparece só no hover/menu-open */
.tbl-row-menu-btn {
  display: grid; place-items: center;
  width: 28px; height: 28px;
  border: 0;
  background: transparent;
  color: var(--color-fg-muted);
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}
.tbl-row-menu-btn:hover {
  background: var(--color-bg-muted);
  color: var(--color-fg-default);
}
.tbl-tr:hover .tbl-row-menu-btn,
.tbl-tr.is-menu-open .tbl-row-menu-btn { opacity: 1; }
```

### 7.10 Densidades

```css
.tbl-density-compact     .tbl-tr  { height: 40px; }
.tbl-density-compact     .tbl-td  { font-size: 12px; }
.tbl-density-comfortable .tbl-tr  { height: 56px; }  /* default */
.tbl-density-spacious    .tbl-tr  { height: 64px; }
```

### 7.11 Checkbox custom (16px com check rotacionado)

```css
.tbl-checkbox {
  appearance: none; -webkit-appearance: none;
  width: 16px; height: 16px;
  border: 1.5px solid var(--color-border-input);
  border-radius: 4px;
  background: var(--color-bg-input);
  cursor: pointer;
  position: relative;
  transition: background 0.12s, border-color 0.12s;
}
.tbl-checkbox:checked,
.tbl-checkbox:indeterminate {
  background: var(--color-bg-brand);
  border-color: var(--color-border-brand);
}

/* Check mark (✓) — retângulo rotacionado 45deg, translate(-50%, -55%) */
.tbl-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  width: 4px; height: 8px;
  border: solid var(--color-fg-on-brand);
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -55%) rotate(45deg);
}

/* Barra indeterminate */
.tbl-checkbox:indeterminate::after {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  width: 8px; height: 2px;
  background: var(--color-fg-on-brand);
  border-radius: 1px;
  transform: translate(-50%, -50%);
}
```

### 7.12 Cells específicas — formatters/cores

```css
.tbl-cell-id {
  font-size: 13px;
  color: var(--color-fg-muted);
  font-variant-numeric: tabular-nums;
}
.tbl-cell-currency {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.tbl-cell-date {
  font-variant-numeric: tabular-nums;
  color: var(--color-fg-muted);
}
.tbl-cell-status {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px;
  color: var(--color-fg-default);
  /* No dark do sandbox, status fica fg-muted — pode replicar com dark: variant */
}
.tbl-dot {
  width: 8px; height: 8px;
  border-radius: 9999px;
  flex: 0 0 auto;
}
.tbl-cell-person,
.tbl-cell-agent {
  display: inline-flex; align-items: center; gap: 8px;
  white-space: nowrap; overflow: hidden;
}
.tbl-cell-person-name {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.tbl-avatar {
  width: 28px; height: 28px;
  border-radius: 9999px;
  display: grid; place-items: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex: 0 0 auto;
}
.tbl-avatar-sm { width: 22px; height: 22px; font-size: 10px; }
.tbl-cell-link {
  color: var(--color-fg-brand);
  text-decoration: none;
}
.tbl-cell-link:hover { text-decoration: underline; }
.tbl-muted { color: var(--color-fg-muted); }
```

### 7.13 Chips (Categoria — pílulas com cor por kind)

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
.chip-sm { height: 22px; padding: 0 8px; font-size: 11px; }
.chip-success { background: var(--color-bg-success-muted); color: var(--color-fg-success); }
.chip-warning { background: var(--color-bg-warning-muted); color: var(--color-fg-warning); }
.chip-info    { background: var(--color-bg-info-muted);    color: var(--color-fg-info); }
.chip-error   { background: var(--color-bg-danger-muted);  color: var(--color-fg-danger); }
```

> **No DS Modelo já existe `<Chip>`** — em vez de criar `.chip-sm/.chip-success` etc,
> reusar `<Chip size="sm" variant="soft" color="warning" shape="pill">Royal</Chip>`.

---

## 8. Tokens do DS Modelo que esta tabela consome

| Token | Onde no CSS | Notas |
|---|---|---|
| `bg.table` | `.tbl-table-wrap` background | sólido p/ sticky funcionar |
| `bg.table-head` | `.tbl-thead`, `.tbl-tr-head`, `.tbl-th-actions` (sticky) | já existe |
| `bg.table-row-hover` | `.tbl-tr:hover`, `.tbl-tr.is-menu-open` | já existe; **sólido em ambos os temas** |
| `border.table` | `.tbl-table-wrap`, `.tbl-th`, `.tbl-td`, `.tbl-tr` border-bottom | já existe |
| `bg.brand` | sort-index, checkbox checked, strip lateral, resize handle hover, focus outline | |
| `bg.brand-subtle` | row `.is-selected`, `.is-open` | |
| `fg.on-brand` | sort-index, checkbox check mark | |
| `bg.surface` | `.tbl-tbody`, `.tbl-td-actions` rest | |
| `bg.muted` | hover de `.tbl-th-menu` e `.tbl-row-menu-btn` | |
| `bg.input` | `.tbl-checkbox` rest | |
| `border.input` | `.tbl-checkbox` border | |
| `border.brand` | `.tbl-checkbox:checked` border | |
| `fg.default` | `.tbl-td` text, `.tbl-th:hover`, `.tbl-th.is-sorted` | |
| `fg.muted` | `.tbl-th` rest, `.tbl-cell-date`, `.tbl-cell-id`, `.tbl-muted` | |
| `fg.brand` | `.tbl-cell-link` (email, phone) | |
| `fg.success/warning/info/danger` | status dots, chips | |
| `bg.success-muted` etc | chip backgrounds | |

**Pendência**: o sandbox usa `--border-strong` no hover de inputs. No Modelo isso
não existe. Pra esta tabela isso **não importa** (a tabela não tem inputs além
do checkbox — que tem regra própria), mas se for criar o Toolbar relacionado,
vai precisar dessa equivalência. Perguntar antes de criar.

---

## 9. Comportamentos JS (sem omitir)

1. **Click na row** → abre detail panel (`onClick={() => setDetailsRowId(row.id)}`)
2. **Click no checkbox da row** → `stopPropagation` + toggle no Set de selecionados
3. **Click no botão "..." da row** → `stopPropagation` + abre popover (via portal, posicionado pelo trigger element)
4. **Click no email/phone link** → `stopPropagation` (mailto:/tel:) — não abre detail
5. **Click no checkbox do header** → toggle all (vazio → todos; algum → vazio)
6. **Checkbox header indeterminate** → quando `0 < selected < total` (via `ref={(el) => { if (el) el.indeterminate = someSelected; }}`)
7. **Density** → controla via prop `density: 'compact' | 'comfortable' | 'spacious'` (classe `.tbl-density-${density}` no wrap)
8. **Cell borders** → toggle via prop `cellBorders` (classe `.has-cell-borders` no wrap)
9. **Tab no `<div class="tbl-tr">`** (tabIndex=0) → focus visível com outline brand 2px

---

## 10. Checklist de validação visual

Use isso pra revisar o componente — marque o que cada item PRECISA ter pra estar idêntico ao sandbox:

- [ ] **Wrap** com border 1px + radius 12px + `overflow: auto` + scrollbar 8px customizada
- [ ] **Head sticky** no top, com bg `bg-table-head` (distinto do body)
- [ ] **Head 42px** sempre, independente da densidade do body
- [ ] **13 colunas** definidas no array `COLUMNS` com as larguras corretas (select 44, id 120, name minWidth 220, …, actions 44)
- [ ] **Ícone de tipo** ao lado do label em **todas** as 11 colunas de dados (lucide-react: Hash, User, AtSign, Phone, CheckCircle2, Tag, Users, DollarSign, Calendar, Calendar, Type) — opacity 0.7, vai pra 1 no hover/sorted
- [ ] **Label do header** elide com `text-overflow: ellipsis`
- [ ] **Coluna `name`** vem com `sorted: true` → mostra badge brand "1" + `<ArrowUpDown size=12>` no rest
- [ ] **Colunas não-sorted** mostram `<ArrowUpDown size=11>` atenuado (opacity 0.5) só no hover
- [ ] **Menu "..." do header** absolute, aparece só no hover do th, hover do próprio botão pinta bg-muted
- [ ] **Resize handle** 6px na borda direita; linha 1px fg-muted no hover do th, vira 2px brand no hover do handle, **projeta linha brand 100vh pra baixo** no hover do handle
- [ ] **Select column (44px)** sem hover bg, justify-center, sem menu, sem resize
- [ ] **Actions column (44px) sticky right** com bg adapting (head ou row state)
- [ ] **Cell borders** (classe `.has-cell-borders`) entre colunas, **exceto** actions e a coluna imediatamente antes
- [ ] **Body bg surface**
- [ ] **Row 56px** comfortable / 40px compact / 64px spacious
- [ ] **Row hover** com `bg-table-row-hover` (sólido, não rgba)
- [ ] **Row selected/open** com `bg-brand-subtle` + strip lateral 3px brand absolute left:0
- [ ] **Row focus-visible** outline 2px brand `outline-offset: -2px`
- [ ] **Botão "..." da row** opacity 0 → 1 no hover/menu-open, hover-bg-muted
- [ ] **Cell padding** 0 14px, font 13px, single-line, fg-default
- [ ] **ID/date/currency** `font-variant-numeric: tabular-nums`
- [ ] **Currency** font-weight 600
- [ ] **Date format** "DD de mês_pt" (ex: "15 de abr")
- [ ] **PersonCell** avatar 28px circular + nome elipsado font-weight 500
- [ ] **AgentCell** avatar 22px sm + nome
- [ ] **StatusCell** dot 8px circular colorido + label
- [ ] **CategoryCell** chip 22px (sm) com bg-{kind}-muted + fg-{kind}
- [ ] **Email/phone** como `<a>` brand sem underline, com underline no hover, com stopPropagation
- [ ] **Checkbox custom** 16px com border 1.5px input, brand quando checked/indeterminate, check rotacionado 45deg
- [ ] **Checkbox header indeterminate** quando `0 < selected < total`

---

## 11. Erros comuns (e como evitar)

| Erro | Causa | Fix |
|---|---|---|
| Tabela genérica com N colunas | esquece o array COLUMNS literal | copiar o array da seção 2 inteiro |
| Falta ícone no header | não passou o `icon` na col + esqueceu de renderizar `<TypeIcon className="tbl-th-type-icon" />` | seguir o JSX da seção 6 |
| Resize handle só uma linha curtinha no header | esqueceu o `::after` que projeta `height: 100vh` | seção 7.6 |
| Hover row inconsistente com actions cell | usou `bg-muted/30` com alpha → sticky cell mostra cor diferente | usar `bg-table-row-hover` sólido |
| Linha selecionada sem strip lateral | esqueceu o `::before` `width: 3px` | seção 7.8 |
| Densidades afetando o head | density classes aplicaram em `.tbl-th` também | densidade só toca `.tbl-tr` e `.tbl-td`, head fica 42px |
| Header rolando junto com body | esqueceu `position: sticky; top: 0; z-index: 5` no `.tbl-thead` | seção 7.2 |
| Actions cell não sticky direita | esqueceu `position: sticky; right: 0; z-index: 2-3` + bg adapting | seção 7.7 e 7.9 |
| Body com font 14px ou 12px | default css ou herança do parent | forçar `font-size: 13px` no `.tbl-td` |
| Avatar quadrado/com tamanho errado | esqueceu `border-radius: 9999px` ou `width/height: 28px` | seção 7.12 |
| Chip Categoria com bg sólido brand | colorindo com `chip-primary` ou similar | usar `bg-<kind>-muted + fg-<kind>` |
| Click no email abre detail panel | esqueceu `stopPropagation` no `<a>` | seção 9 item 4 |

---

## 12. Como entregar o componente no DS Modelo

Sugestão de estrutura — alinhada com o resto dos componentes em `src/components/ui/`:

```
src/components/ui/Table/
  table.tsx              // <Table>, <TableHeader>, <TableBody>, <TableRow>, <TableCell> (low-level)
  table.styles.ts        // tv() com as variantes (density, cellBorders)
  table.types.ts
  index.ts               // barrel

  examples/              // OPCIONAL — se quiser exportar a demo
    ClientsTable.tsx     // a réplica exata do sandbox usando o low-level
    mock-data.ts         // COLUMNS, ROWS_MOCK, STATUSES, CATEGORIES, AGENTS
    cells/               // PersonCell, StatusCell, CategoryCell, etc
```

API mínima sugerida:

```tsx
<Table density="comfortable" cellBorders>
  <Table.Header>
    <Table.HeadRow>
      <Table.Head type="select"><TableCheckbox /></Table.Head>
      <Table.Head icon={Hash}>ID</Table.Head>
      <Table.Head icon={User} sorted={1}>Nome</Table.Head>
      {/* ... */}
      <Table.Head type="actions" />
    </Table.HeadRow>
  </Table.Header>
  <Table.Body>
    {rows.map(row => (
      <Table.Row key={row.id} selected={isSelected} open={isOpen}>
        <Table.Cell type="select"><TableCheckbox /></Table.Cell>
        <Table.Cell>{row.id}</Table.Cell>
        {/* ... */}
        <Table.Cell type="actions"><RowMenuButton /></Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

Mas isso é proposta — Sergio pode preferir uma API mais data-driven (passar
`columns` + `rows`). Ambos os caminhos servem desde que **o resultado visual
seja idêntico** ao sandbox.

---

## 13. Referências cruzadas

- **Sandbox source**: `src/app/design-and-table-v2/page.js`
  - `TblTable` → linhas 2158-2377
  - `COLUMNS` → linhas 2108-2122
  - `CellRenderer` → linhas 2138-2156
  - `STATUSES/CATEGORIES/AGENTS` → linhas 1895-1913
  - `ROWS_MOCK` → linhas 1927-1938
  - CSS da tabela → linhas 3350-3733
- **Tokens DS Modelo**: `Modelo/tokens/brands/default/semantic/color-{light,dark}.ts`
- **CLAUDE.md do Modelo**: regras de tokens/componentes do DS
