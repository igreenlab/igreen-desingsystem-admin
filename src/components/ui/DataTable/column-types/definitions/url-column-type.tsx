import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

export const UrlColumnType: ColumnTypeDefinition = {
  type: "url",
  operators: [
    { id: "contains", label: "contém" },
    { id: "equals", label: "é" },
  ],
  renderFilterInput: ({ value, onChange }) => (
    <Input
      type="url"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder="https://..."
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        type="url"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        autoFocus
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue).toLowerCase();
    const filter = filterValue == null ? "" : String(filterValue).toLowerCase();
    if (operator === "contains") return cell.includes(filter);
    if (operator === "equals") return cell === filter;
    return null;
  },

  renderCell: ({ value }) => {
    const url = value == null ? "" : String(value);
    if (!url) return null;
    // Strip protocol pra display, mas mantém no href
    const display = url.replace(/^https?:\/\//, "");
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-fg-brand hover:underline truncate inline-flex items-center gap-gp-2xs"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="truncate">{display}</span>
        <ExternalLink className="size-icon-2xs shrink-0 opacity-60" aria-hidden />
      </a>
    );
  },
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultWidth: 200,
  defaultEllipsis: true,
  defaultSortable: false,
  defaultIcon: LinkIcon,
};
