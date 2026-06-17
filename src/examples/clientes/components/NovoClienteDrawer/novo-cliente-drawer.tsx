import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button/button";
import {
  FormField,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from "@/components/ui/FormField";
import { ChipGroup, ChipGroupItem } from "@/components/ui/Chip";
import { STATUSES, CATEGORIES } from "../../_table-data";
import { CITIES, STATUS_DOT } from "../../clientes-showcase-mocks";
import { drawerFormStyles } from "../../clientes-showcase.styles";
import type { NovoClienteFormData } from "../../clientes-showcase.types";

const INITIAL_FORM: NovoClienteFormData = {
  name: "",
  email: "",
  whatsapp: "",
  statusId: "active",
  categoryId: "lead",
  city: "",
  value: 0,
  notes: "",
};

export type NovoClienteDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Disparado ao confirmar — drawer fecha automaticamente após o submit. */
  onSubmit?: (data: NovoClienteFormData) => void;
};

/**
 * Drawer "Novo cliente" — replica visual do TblClientFormDrawer
 * (sandbox /design-and-table-v2), recompilado em cima dos componentes do DS:
 *   Panel + FormField (Input / Select / Textarea) + ChipGroup + Button.
 *
 * Layout (top → bottom):
 *   1. Nome*           — full width
 *   2. Email + WhatsApp — 2 cols
 *   3. Status           — ChipGroup com dot colorido
 *   4. Categoria        — ChipGroup
 *   5. Cidade + Valor R$ — 2 cols
 *   6. Notas            — textarea full width
 */
export function NovoClienteDrawer({
  open,
  onOpenChange,
  onSubmit,
}: NovoClienteDrawerProps) {
  const s = drawerFormStyles();
  const [form, setForm] = useState<NovoClienteFormData>(INITIAL_FORM);

  // Reseta form sempre que abrir
  useEffect(() => {
    if (open) setForm(INITIAL_FORM);
  }, [open]);

  const canSubmit = form.name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit?.(form);
    onOpenChange(false);
  };

  return (
    <Panel
      open={open}
      onOpenChange={onOpenChange}
      title="Novo cliente"
      side="right"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            color="secondary"
            size="md"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="md"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Criar cliente
          </Button>
        </>
      }
    >
      <FormFieldInput
        label="Nome"
        required
        placeholder="Maria Silva"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />

      <div className={s.twoCols()}>
        <FormFieldInput
          label="Email"
          type="email"
          placeholder="cliente@exemplo.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <FormFieldInput
          label="WhatsApp"
          type="tel"
          placeholder="55 11 99999-9999"
          value={form.whatsapp}
          onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
        />
      </div>

      <FormField label="Status">
        {() => (
          <ChipGroup
            type="single"
            value={form.statusId}
            onValueChange={(v) =>
              v &&
              setForm((f) => ({
                ...f,
                statusId: v as keyof typeof STATUSES,
              }))
            }
            size="md"
            shape="pill"
            ariaLabel="Status do cliente"
          >
            {Object.entries(STATUSES).map(([id, st]) => (
              <ChipGroupItem key={id} value={id}>
                <span
                  className={s.statusDot()}
                  style={{ background: STATUS_DOT[id] ?? st.color }}
                  aria-hidden
                />
                {st.label}
              </ChipGroupItem>
            ))}
          </ChipGroup>
        )}
      </FormField>

      <FormField label="Categoria">
        {() => (
          <ChipGroup
            type="single"
            value={form.categoryId}
            onValueChange={(v) =>
              v &&
              setForm((f) => ({
                ...f,
                categoryId: v as keyof typeof CATEGORIES,
              }))
            }
            size="md"
            shape="pill"
            ariaLabel="Categoria do cliente"
          >
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <ChipGroupItem key={id} value={id}>
                {cat.label}
              </ChipGroupItem>
            ))}
          </ChipGroup>
        )}
      </FormField>

      <div className={s.twoCols()}>
        <FormFieldSelect
          label="Cidade"
          placeholder="Selecionar..."
          value={form.city || undefined}
          onValueChange={(v) => setForm((f) => ({ ...f, city: v }))}
          options={CITIES.map((c) => ({ value: c, label: c }))}
        />
        <FormFieldInput
          label="Valor (R$)"
          type="number"
          startAddon="R$"
          value={String(form.value)}
          onChange={(e) =>
            setForm((f) => ({ ...f, value: Number(e.target.value) }))
          }
          min={0}
          step={0.01}
        />
      </div>

      <FormFieldTextarea
        label="Notas"
        placeholder="Observações sobre o cliente..."
        rows={4}
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
      />
    </Panel>
  );
}
