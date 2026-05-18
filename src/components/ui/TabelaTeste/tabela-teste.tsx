import { useState } from "react";
import { ArrowUpDown, MoreHorizontal, MoreVertical } from "lucide-react";
import {
  COLUMNS,
  ROWS_MOCK,
  STATUSES,
  CATEGORIES,
  AGENTS,
  getColCellStyle,
  formatCurrency,
  formatDateShort,
  type TabelaCol,
  type TabelaRow,
} from "./mock-data";
import { tabelaStyles as s } from "./tabela-teste.styles";

/**
 * TabelaTeste — réplica visual da tabela do sandbox `/design-and-table-v2`.
 *
 * Hardcoded por design: sem props além do nada. 13 colunas fixas, 10 rows mock,
 * densidade comfortable, cell-borders on. Toggle de seleção e detail panel
 * (state local).
 *
 * Serve como referência visual fixa pra outros componentes Table do DS — o
 * mapeamento de tokens, espaçamentos e estados está aqui de forma literal.
 */
export function TabelaTeste() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openRowId, setOpenRowId] = useState<string | null>(null);

  const allSelected = selectedIds.size === ROWS_MOCK.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(ROWS_MOCK.map((r) => r.id)));
  };

  return (
    <div
      role="region"
      aria-label="Tabela de clientes (referência)"
      className={s.wrap()}
    >
      <div className={s.table()}>
        {/* HEAD */}
        <div className={s.thead()} role="rowgroup">
          <div className={s.trHead()} role="row">
            {COLUMNS.map((col) => renderHeadCell(col, {
              allSelected,
              someSelected,
              onToggleAll: toggleAll,
            }))}
          </div>
        </div>

        {/* BODY */}
        <div className={s.tbody()} role="rowgroup">
          {ROWS_MOCK.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const isOpen = openRowId === row.id;
            const isHighlighted = isSelected || isOpen;
            return (
              <div
                key={row.id}
                role="row"
                tabIndex={0}
                onClick={() => setOpenRowId((cur) => (cur === row.id ? null : row.id))}
                className={`group/tr ${s.tr({ selected: isHighlighted })}`}
              >
                {COLUMNS.map((col) =>
                  renderBodyCell(col, row, {
                    isSelected,
                    isHighlighted,
                    onToggle: () => toggleSelect(row.id),
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Head cell renderer ────────────────────────────────────────────── */

function renderHeadCell(
  col: TabelaCol,
  ctx: { allSelected: boolean; someSelected: boolean; onToggleAll: () => void },
) {
  const cellStyle = getColCellStyle(col);

  if (col.type === "select") {
    return (
      <div
        key={col.key}
        role="columnheader"
        className={`${s.thSelect()} ${s.cellBorderTh()}`}
        style={cellStyle}
      >
        <input
          type="checkbox"
          className={s.checkbox()}
          checked={ctx.allSelected}
          ref={(el) => { if (el) el.indeterminate = ctx.someSelected; }}
          onChange={ctx.onToggleAll}
          aria-label="Selecionar todas"
        />
      </div>
    );
  }

  if (col.type === "actions") {
    return (
      <div
        key={col.key}
        role="columnheader"
        aria-label="Ações"
        className={s.thActions()}
        style={cellStyle}
      />
    );
  }

  // Coluna IMEDIATAMENTE antes de actions não tem border-right (visual mais limpo)
  const isBeforeActions = COLUMNS[COLUMNS.indexOf(col) + 1]?.type === "actions";
  const borderCls = isBeforeActions ? "" : s.cellBorderTh();

  const TypeIcon = col.icon;
  const sorted = Boolean(col.sorted);

  return (
    <div
      key={col.key}
      role="columnheader"
      style={cellStyle}
      className={`group/th ${s.th({ sorted })} ${borderCls}`}
    >
      {TypeIcon && <TypeIcon strokeWidth={1.7} className={s.thTypeIcon({ sorted })} aria-hidden="true" />}
      <span className={s.thLabel()}>{col.label}</span>
      {sorted ? (
        <span className={s.thSort()}>
          <span className={s.thSortIndex()}>1</span>
          <ArrowUpDown size={12} strokeWidth={1.8} />
        </span>
      ) : (
        <span className={s.thSortHint()} aria-hidden>
          <ArrowUpDown size={11} strokeWidth={1.8} />
        </span>
      )}
      <button
        type="button"
        className={s.thMenu()}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Menu da coluna ${col.label}`}
      >
        <MoreVertical size={15} strokeWidth={1.7} />
      </button>
      <span className={s.thResize()} aria-hidden="true" />
    </div>
  );
}

/* ── Body cell renderer ────────────────────────────────────────────── */

function renderBodyCell(
  col: TabelaCol,
  row: TabelaRow,
  ctx: { isSelected: boolean; isHighlighted: boolean; onToggle: () => void },
) {
  const cellStyle = getColCellStyle(col);

  if (col.type === "select") {
    return (
      <div
        key={col.key}
        role="cell"
        className={`${s.tdSelect()} ${s.cellBorderTd()}`}
        style={cellStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className={s.checkbox()}
          checked={ctx.isSelected}
          onChange={ctx.onToggle}
          aria-label={`Selecionar ${row.name}`}
        />
      </div>
    );
  }

  if (col.type === "actions") {
    return (
      <div
        key={col.key}
        role="cell"
        className={s.tdActions({ selected: ctx.isHighlighted })}
        style={cellStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={s.rowMenuBtn()}
          aria-label="Ações da linha"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    );
  }

  const isBeforeActions = COLUMNS[COLUMNS.indexOf(col) + 1]?.type === "actions";
  const borderCls = isBeforeActions ? "" : s.cellBorderTd();

  return (
    <div
      key={col.key}
      role="cell"
      style={cellStyle}
      className={`${s.td()} ${borderCls}`}
    >
      {renderCellContent(col, row)}
    </div>
  );
}

/* ── CellRenderer (switch por tipo) ────────────────────────────────── */

function renderCellContent(col: TabelaCol, row: TabelaRow) {
  switch (col.type) {
    case "id":       return <span className={s.cellId()}>{row.id}</span>;
    case "person":   return <PersonCell row={row} />;
    case "email":    return (
      <a
        href={`mailto:${row.email}`}
        className={s.cellLink()}
        onClick={(e) => e.stopPropagation()}
      >
        {row.email}
      </a>
    );
    case "phone":    return <PhoneCell value={row.phone} />;
    case "status":   return <StatusCell statusId={row.statusId} />;
    case "category": return <CategoryCell categoryId={row.categoryId} />;
    case "agent":    return <AgentCell agentId={row.agentId} />;
    case "currency": return <span className={s.cellCurrency()}>{formatCurrency(row.value)}</span>;
    case "date":     return <DateCell value={row[col.key as "createdAt" | "lastContact"]} />;
    case "text":     return <>{row[col.key as keyof TabelaRow]}</>;
    default:         return null;
  }
}

/* ── Sub-cells ─────────────────────────────────────────────────────── */

function PersonCell({ row }: { row: TabelaRow }) {
  return (
    <span className={s.cellPerson()} title={row.name}>
      <span className={s.avatar()} style={{ background: row.avatarColor }}>
        {row.initials}
      </span>
      <span className={s.cellPersonName()}>{row.name}</span>
    </span>
  );
}

function StatusCell({ statusId }: { statusId: keyof typeof STATUSES }) {
  const st = STATUSES[statusId];
  if (!st) return null;
  return (
    <span className={s.cellStatus()}>
      <span className={s.dot()} style={{ background: st.color }} aria-hidden />
      {st.label}
    </span>
  );
}

function CategoryCell({ categoryId }: { categoryId: keyof typeof CATEGORIES }) {
  const c = CATEGORIES[categoryId];
  if (!c) return null;
  return <span className={s.chip({ kind: c.kind })}>{c.label}</span>;
}

function AgentCell({ agentId }: { agentId: keyof typeof AGENTS }) {
  const a = AGENTS[agentId];
  if (!a) return <span className={s.cellMuted()}>—</span>;
  return (
    <span className={s.cellAgent()} title={a.name}>
      <span className={s.avatarSm()} style={{ background: a.color }}>
        {a.initials}
      </span>
      <span>{a.name}</span>
    </span>
  );
}

function PhoneCell({ value }: { value: string }) {
  if (!value) return <span className={s.cellMuted()}>—</span>;
  return (
    <a
      href={`tel:${value.replace(/\D/g, "")}`}
      className={s.cellLink()}
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </a>
  );
}

function DateCell({ value }: { value: number }) {
  if (!value) return <span className={s.cellMuted()}>—</span>;
  return <span className={s.cellDate()}>{formatDateShort(value)}</span>;
}
