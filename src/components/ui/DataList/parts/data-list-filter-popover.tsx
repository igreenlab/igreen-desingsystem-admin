import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/shadcn/input";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import type { ActiveFilter, FilterableField } from "../data-list.types";

type Props = {
  fields: FilterableField[];
  value: ActiveFilter[];
  onChange: (filters: ActiveFilter[]) => void;
};

type Draft = Record<string, string | number | boolean>;

function toDraft(filters: ActiveFilter[]): Draft {
  const d: Draft = {};
  for (const f of filters) d[f.fieldId] = f.value;
  return d;
}

/** Popover de filtro montado a partir dos campos filtráveis (sem colunas). */
export function DataListFilterPopover({ fields, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(value));
  const activeCount = value.length;

  const set = (id: string, v: string | number | boolean) =>
    setDraft((d) => ({ ...d, [id]: v }));

  const apply = () => {
    const filters: ActiveFilter[] = [];
    for (const f of fields) {
      const v = draft[f.id];
      const empty = v === undefined || v === "" || (f.type === "boolean" && v === false);
      if (!empty) filters.push({ fieldId: f.id, value: v });
    }
    onChange(filters);
    setOpen(false);
  };

  const clear = () => {
    setDraft({});
    onChange([]);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) setDraft(toDraft(value));
        setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" color="secondary" size="sm" iconLeft={<Filter />}>
          Filtros
          {activeCount > 0 && (
            <span className="ml-gp-xs inline-flex min-w-[18px] items-center justify-center rounded-radius-full bg-bg-brand px-[5px] text-caption-sm text-fg-on-brand">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[300px] p-pad-xl">
        <div className="flex flex-col gap-form-gap">
          {fields.map((f) => (
            <div key={f.id} className="flex flex-col gap-gp-xs">
              <label className="text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted">
                {f.label}
              </label>
              {f.type === "boolean" ? (
                <label className="flex items-center gap-gp-md text-body-sm text-fg-default">
                  <Checkbox
                    checked={Boolean(draft[f.id])}
                    onCheckedChange={(c) => set(f.id, Boolean(c))}
                  />
                  Sim
                </label>
              ) : f.type === "select" ? (
                <Select
                  value={(draft[f.id] as string) ?? ""}
                  onValueChange={(v) => set(f.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  value={(draft[f.id] as string) ?? ""}
                  onChange={(e) =>
                    set(f.id, f.type === "number" ? Number(e.target.value) : e.target.value)
                  }
                  placeholder={`Filtrar ${f.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}

          <div className="mt-gp-xs flex items-center justify-end gap-gp-md">
            <Button variant="ghost" color="secondary" size="sm" onClick={clear}>
              Limpar
            </Button>
            <Button variant="filled" color="primary" size="sm" onClick={apply}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
