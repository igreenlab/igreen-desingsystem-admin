import { Tags, ChevronDown } from "lucide-react";
import { Chip } from "../../../Chip/chip";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { FILTER_FIELD_CLASS } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { resolveChipColor, findOption, toStringArray } from "../_shared";

export const TagsColumnType: ColumnTypeDefinition = {
  type: "tags",
  operators: [
    { id: "isAnyOf", label: "tem qualquer" },
    { id: "isNoneOf", label: "não tem" },
    { id: "contains", label: "contém" },
  ],
  renderFilterInput: ({ value, onChange, options }) => {
    const selected = new Set(toStringArray(value));
    const toggle = (v: string) => {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange(Array.from(next));
    };
    const labels = Array.from(selected).map((v) => {
      const opt = findOption(v, options);
      return opt?.label ?? v;
    });
    const display =
      labels.length === 0
        ? ""
        : labels.length <= 2
          ? labels.join(", ")
          : `${labels.length} selecionados`;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={FILTER_FIELD_CLASS}>
            <span className={display ? "truncate" : "text-fg-muted opacity-70 truncate"}>
              {display || "Selecione tags..."}
            </span>
            <ChevronDown className="size-icon-xs text-fg-muted shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[200px]">
          <div className="flex flex-col gap-gp-2xs p-pad-md max-h-[240px] overflow-auto">
            {(options ?? []).map((o) => (
              <label
                key={String(o.value)}
                className="flex items-center gap-gp-md p-pad-xs rounded-radius-sm hover:bg-bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selected.has(String(o.value))}
                  onCheckedChange={() => toggle(String(o.value))}
                />
                <span className="text-body-md text-fg-default">{o.label}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
  renderFastFilterInput: ({ value, onChange, options }) => {
    const selected = new Set(toStringArray(value));
    const toggle = (v: string) => {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange(Array.from(next));
    };
    return (
      <div className="flex flex-col gap-gp-2xs p-pad-md max-h-[240px] overflow-auto">
        {(options ?? []).map((o) => (
          <label
            key={String(o.value)}
            className="flex items-center gap-gp-md p-pad-xs rounded-radius-sm hover:bg-bg-muted cursor-pointer"
          >
            <Checkbox
              checked={selected.has(String(o.value))}
              onCheckedChange={() => toggle(String(o.value))}
            />
            <span className="text-body-md text-fg-default">{o.label}</span>
          </label>
        ))}
      </div>
    );
  },
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toStringArray(cellValue);
    const filter = toStringArray(filterValue);
    if (operator === "isAnyOf") return filter.some((f) => cell.includes(f));
    if (operator === "isNoneOf") return !filter.some((f) => cell.includes(f));
    if (operator === "contains") return filter.every((f) => cell.includes(f));
    return null;
  },
  renderChipValue: (value, options) => {
    const arr = toStringArray(value);
    if (arr.length === 0) return "";
    const labels = arr.map(
      (v) => findOption(v, options)?.label ?? v,
    );
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selecionados`;
  },

  renderCell: ({ value, options }) => {
    const arr = toStringArray(value);
    if (arr.length === 0) return null;
    return (
      <span className="inline-flex items-center flex-wrap gap-gp-2xs">
        {arr.map((v) => {
          const opt = findOption(v, options);
          return (
            <Chip key={v} size="sm" color={resolveChipColor(opt?.color)}>
              {opt?.label ?? v}
            </Chip>
          );
        })}
      </span>
    );
  },
  formatValue: (v) => toStringArray(v).join(", "),
  defaultAlign: "left",
  defaultWidth: 200,
  defaultEllipsis: true,
  defaultSortable: false,
  defaultIcon: Tags,
};
