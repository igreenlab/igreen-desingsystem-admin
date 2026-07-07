import { forwardRef, useId, useState } from "react";
import { Check } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Separator } from "@/components/shadcn/separator";
import { Input } from "@/components/shadcn";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { getContrastTextColor } from "@/utils/color-contrast";

import { colorPickerStyles } from "./color-picker.styles";
import { DEFAULT_COLOR_PRESETS } from "./color-picker.presets";
import type { ColorPickerProps } from "./color-picker.types";

/* ── Normalização de hex ──────────────────────────────────────────────────
 * Aceita 3 ou 6 dígitos (com/sem `#`), expande shorthand e devolve
 * `#RRGGBB` MAIÚSCULO. Retorna null se não casar 3/6 dígitos hex. */
function normalizeHex(raw: string): string | null {
  let h = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return `#${h.toUpperCase()}`;
  }
  return null;
}

/** Compara dois hex ignorando caixa e shorthand. */
function sameHex(a: string, b: string): boolean {
  const na = normalizeHex(a);
  const nb = normalizeHex(b);
  return na !== null && nb !== null && na === nb;
}

/**
 * ColorPicker — seletor de cor hex (#RRGGBB) controlado para Tags e Filas.
 *
 * Compõe `Popover` (mobileSheet) + `Input` (hex) + `Button` + `Separator`, e usa
 * `getContrastTextColor` (L-027) para o checkmark do preset selecionado. O swatch
 * é o anchor do Popover (forwardRef via `PopoverTrigger asChild`); o bg do swatch
 * e dos presets vem por INLINE STYLE — única exceção de hardcode permitida
 * (cor dinâmica externa, igual ao `colorHex` do Avatar).
 *
 * Fluxo: clique no swatch abre o grid de presets + (opcional) input hex livre.
 * Escolher um preset ou confirmar um hex válido → `onValueChange("#RRGGBB")` e
 * fecha o popover. O input hex inline (fora do popover) também normaliza no blur.
 */
export const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      onValueChange,
      presets = DEFAULT_COLOR_PRESETS,
      id: idProp,
      state = "default",
      size = "md",
      disabled = false,
      allowCustomHex = true,
      placeholder = "#RRGGBB",
      open: openProp,
      onOpenChange,
      className,
    },
    ref,
  ) {
    const autoId = useId();
    const id = idProp ?? autoId;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;
    const setOpen = (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    // Rascunho do input hex inline (fora do popover) e do input hex livre (dentro).
    const [inlineDraft, setInlineDraft] = useState(value);
    const [customDraft, setCustomDraft] = useState(value);

    const styles = colorPickerStyles({ size, state, disabled });

    const commit = (raw: string): boolean => {
      const norm = normalizeHex(raw);
      if (!norm) return false;
      onValueChange(norm);
      return true;
    };

    const handleInlineCommit = () => {
      if (!commit(inlineDraft)) {
        // hex inválido → restaura o valor atual
        setInlineDraft(value);
      }
    };

    const handlePreset = (hex: string) => {
      const norm = normalizeHex(hex);
      if (!norm) return;
      onValueChange(norm);
      setInlineDraft(norm);
      setCustomDraft(norm);
      setOpen(false);
    };

    const handleCustomConfirm = () => {
      const norm = normalizeHex(customDraft);
      if (!norm) return;
      onValueChange(norm);
      setInlineDraft(norm);
      setOpen(false);
    };

    // bg do swatch: hex válido normalizado, senão transparente (mostra a borda).
    const swatchBg = normalizeHex(value) ?? "transparent";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className={styles.root({ className })}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              aria-label="Selecionar cor"
              aria-haspopup="dialog"
              aria-expanded={open}
              className={styles.swatch()}
              style={{ backgroundColor: swatchBg }}
            />
          </PopoverTrigger>

          <Input
            id={id}
            type="text"
            inputMode="text"
            size={size}
            state={state}
            disabled={disabled}
            placeholder={placeholder}
            aria-label="Cor hexadecimal"
            className={styles.hexInput()}
            value={inlineDraft}
            onChange={(e) => setInlineDraft(e.target.value)}
            onBlur={handleInlineCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleInlineCommit();
              }
            }}
          />
        </div>

        <PopoverContent
          align="start"
          mobileSheet
          role="dialog"
          aria-label="Paleta de cores"
          className={styles.content()}
        >
          <div
            className={styles.presetsGrid()}
            role="group"
            aria-label="Cores predefinidas"
          >
            {presets.map((hex) => {
              const norm = normalizeHex(hex) ?? hex;
              const selected = sameHex(hex, value);
              const checkColor = getContrastTextColor(hex);
              return (
                <button
                  key={norm}
                  type="button"
                  aria-label={norm}
                  aria-pressed={selected}
                  className={styles.preset()}
                  style={{ backgroundColor: norm }}
                  onClick={() => handlePreset(hex)}
                >
                  {selected && (
                    <Check
                      className={styles.presetCheck()}
                      style={{ color: checkColor }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {allowCustomHex && (
            <>
              <Separator />
              <div className={styles.customRow()}>
                <FormField label="Cor personalizada" id={`${id}-custom`}>
                  {({ id: customId }) => (
                    <Input
                      id={customId}
                      type="text"
                      size={size}
                      placeholder={placeholder}
                      aria-label="Cor hexadecimal"
                      value={customDraft}
                      onChange={(e) => setCustomDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCustomConfirm();
                        }
                      }}
                    />
                  )}
                </FormField>
                <Button
                  type="button"
                  size="sm"
                  fullWidth
                  disabled={normalizeHex(customDraft) === null}
                  onClick={handleCustomConfirm}
                >
                  Aplicar
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);
