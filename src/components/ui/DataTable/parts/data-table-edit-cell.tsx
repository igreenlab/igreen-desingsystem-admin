import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { DataTableColumnDef } from "../data-table.types";
import { columnTypeRegistry } from "../column-types";

export type DataTableEditCellProps<T> = {
  column: DataTableColumnDef<T>;
  row: T;
  initialValue: any;
  /** Fase F.1 — quando true, mostra spinner overlay e bloqueia input (commit em andamento). */
  isLoading?: boolean;
  /** Fase F.1 — quando definido, mostra ícone de erro com tooltip e mantem edit aberto. */
  error?: string | null;
  onCommit: (newValue: any) => void;
  onCancel: () => void;
};

/**
 * Editor inline para celulas com `editable: true`.
 *
 * - Se `column.renderEdit` definido, delega 100% pro consumer (escape hatch).
 * - Caso contrario, renderiza editor default baseado em `column.editType`
 *   (ou derivado de `column.type` / `column.filterOptions`).
 *
 * Eventos do editor default:
 *   - Enter → commit
 *   - Esc   → cancel
 *   - Blur  → commit (delay 1 tick pra permitir Radix internal events terminarem)
 *
 * Editor SE auto-foca no mount. Input ganha selection.all pra usuario
 * sobrescrever rapidamente.
 */
export function DataTableEditCell<T>({
  column,
  row,
  initialValue,
  isLoading = false,
  error = null,
  onCommit,
  onCancel,
}: DataTableEditCellProps<T>) {
  const [value, setValue] = useState(initialValue);

  // Wrapper com overlay de loading/error. Inputs internos ficam por baixo
  // com pointer-events bloqueado quando loading.
  const wrap = (children: React.ReactNode) => (
    <div className="relative w-full">
      <div
        className={
          isLoading
            ? "pointer-events-none opacity-60 transition-opacity"
            : "transition-opacity"
        }
      >
        {children}
      </div>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-pad-md pointer-events-none"
          aria-live="polite"
        >
          <Loader2
            className="size-icon-sm text-fg-brand animate-spin"
            aria-label="Salvando..."
          />
        </div>
      )}
      {error && !isLoading && (
        <div
          className="absolute inset-y-0 right-pad-md flex items-center pointer-events-none"
          aria-live="assertive"
          title={error}
        >
          <AlertCircle
            className="size-icon-sm text-fg-danger"
            aria-label={error}
          />
        </div>
      )}
    </div>
  );

  // Custom editor — consumer controla 100%
  if (column.renderEdit) {
    return wrap(
      column.renderEdit({
        row,
        value,
        onChange: setValue,
        onCommit: () => onCommit(value),
        onCancel,
      }),
    );
  }

  // Fase G.2 — registry-aware: se o tipo da coluna definir renderEdit, usa ele
  const typeDef = column.type ? columnTypeRegistry.get(column.type) : undefined;
  if (typeDef?.renderEdit) {
    return wrap(
      typeDef.renderEdit({
        row,
        value,
        onChange: (v) => setValue(v),
        onCommit: () => onCommit(value),
        onCancel,
        options: column.filterOptions,
      }),
    );
  }

  // Default editor — deriva editType
  const editType = resolveEditType(column);

  if (editType === "select") {
    return wrap(
      <SelectEditor
        value={value == null ? "" : String(value)}
        options={column.filterOptions ?? []}
        onChange={(v) => {
          // Select dispara onValueChange uma vez no commit (nao tem onChange + Enter).
          // Commit imediato no select pra UX direta.
          setValue(v);
          onCommit(v);
        }}
        onCancel={onCancel}
        disabled={isLoading}
      />,
    );
  }

  return wrap(
    <InputEditor
      type={editType === "number" ? "number" : "text"}
      value={value == null ? "" : String(value)}
      onChange={(v) => setValue(editType === "number" ? (v === "" ? null : Number(v)) : v)}
      onCommit={() => onCommit(value)}
      onCancel={onCancel}
      disabled={isLoading}
      hasError={!!error}
    />,
  );
}

/* ── Editor: Input (text/number) ─────────────────────────────────── */

function InputEditor({
  type,
  value,
  onChange,
  onCommit,
  onCancel,
  disabled = false,
  hasError = false,
}: {
  type: "text" | "number";
  value: string;
  onChange: (next: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  disabled?: boolean;
  hasError?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // Auto-focus + select-all no mount
  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    el.focus();
    el.select();
  }, [disabled]);

  return (
    <Input
      ref={ref}
      type={type}
      size="xs"
      state={hasError ? "error" : "default"}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onBlur={() => {
        // Durante loading, NAO commitar via blur — usuario pode estar so movendo
        // foco temporariamente enquanto a request voa. Commit explicito via Enter
        // ja foi disparado e a Promise esta em curso.
        if (disabled) return;
        // Delay 1 tick pra permitir cliques internos no row (caso usuario
        // clique em outra celula durante edicao) terminarem antes do commit.
        setTimeout(onCommit, 0);
      }}
      // Bloqueia bubbling pra TableRow.onClick / dnd / sort
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      className="border-0 rounded-radius-sm shadow-none focus-visible:shadow-sh-ring pr-pad-2xl"
    />
  );
}

/* ── Editor: Select ──────────────────────────────────────────────── */

function SelectEditor({
  value,
  options,
  onChange,
  onCancel,
  disabled = false,
}: {
  value: string;
  options: Array<{ value: any; label: string }>;
  onChange: (next: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="w-full"
    >
      <Select defaultOpen={!disabled} value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-form-sm min-h-form-sm rounded-radius-sm">
          <SelectValue placeholder="Selecionar..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function resolveEditType<T>(col: DataTableColumnDef<T>): "text" | "number" | "select" {
  if (col.editType) return col.editType;
  // Deriva de filterType primeiro (mais especifico que `type`)
  if (col.filterType === "select" || col.filterType === "multiSelect") return "select";
  if (col.filterType === "number") return "number";
  // Deriva de `type` da coluna
  if (col.type === "number" || col.type === "currency") return "number";
  if (col.type === "status" || col.type === "boolean") return "select";
  return "text";
}
