import { useRef, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectTriggerState,
} from "@/components/shadcn/select";
import { FormField } from "./form-field";
import type { FormFieldBaseProps } from "./form-field.types";

/**
 * Valor interno que substitui `""` antes de chegar ao Radix. Ver o docblock do
 * componente: `""` é a sentinela de "nada selecionado" do próprio Radix, e uma
 * opção com esse valor ou some da tela ou lança, dependendo da versão.
 *
 * Cifrões não aparecem em valor de domínio, e o prefixo `__ds` diz de onde vem
 * — colisão com valor real de consumidor exigiria má-fé.
 */
const SENTINELA_VAZIO = "__ds_select_vazio__";

export type FormFieldSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

/**
 * FormFieldSelect — wrapper "one-shot" pra um select dropdown.
 *
 * Compõe FormField + Select (radix) — reutiliza os Select* primitives existentes.
 *
 * Uso simples via `options`:
 *   <FormFieldSelect label="País" placeholder="Selecione..." options={[
 *     { value: "br", label: "Brasil" },
 *     { value: "us", label: "Estados Unidos" },
 *   ]} />
 *
 * Pra casos avançados (groups, separators), use o Select primitive direto.
 */
export type FormFieldSelectProps = FormFieldBaseProps & {
  options: FormFieldSelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** className aplicado ao <SelectTrigger>. Pra estilizar o wrapper, use `className` (vai pro FormField root). */
  triggerClassName?: string;
  /** Largura/maxHeight customizada do dropdown */
  contentClassName?: string;
};

export function FormFieldSelect({
  label,
  required,
  helperText,
  state,
  errorMessage,
  warningMessage,
  successMessage,
  className,
  id,
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled,
  triggerClassName,
  contentClassName,
}: FormFieldSelectProps) {
  /**
   * Duas armadilhas do Radix Select, e as duas apagam dado em silêncio.
   *
   * ── 1. `""` é a SENTINELA de "nada selecionado" ───────────────────────────
   *
   * `shouldShowPlaceholder(value) { return value === "" || value === void 0 }`.
   * Consumidor que oferece uma opção "nenhum" com `value: ""` — o idioma óbvio,
   * e o que este componente sempre convidou a escrever — colide com ela:
   *
   *   - o rótulo da opção NUNCA aparece: com `value=""` o gatilho mostra o
   *     placeholder, então "Sem fila padrão" fica invisível e o campo parece
   *     vazio mesmo estando preenchido;
   *   - no Radix 2.2.6 o `<SelectItem value="">` LANÇA ("must have a value prop
   *     that is not an empty string"). No 2.3.1 esse erro foi REMOVIDO e o
   *     comportamento virou silencioso — o mesmo código quebra alto numa versão
   *     e erra baixo na outra.
   *
   * A sentinela abaixo mantém a API pública intacta (`value: ""` continua
   * sendo o jeito de dizer "nenhum") e o vazio nunca chega ao Radix.
   *
   * ── 2. O valor controlado é ECOADO de volta, e o eco pode vir vazio ───────
   *
   * O `SelectBubbleInput` guarda um `<select>` nativo escondido para integração
   * com formulário. Quando o `value` muda, ele ecoa num efeito:
   *
   *     setValue.call(select, selectValue);          // select.value = "24"
   *     select.dispatchEvent(new Event("change"));   // change de verdade
   *
   * com `onChange: (e) => onValueChange(e.target.value)`.
   *
   * O DOM recusa atribuir a um `<select>` um valor sem `<option>`
   * correspondente — o campo fica em `""`. O eco então chega ao consumidor como
   * `onValueChange("")`, indistinguível de uma escolha. Quem controla o campo
   * por formulário grava esse vazio e o valor some sozinho.
   *
   * Acontece sempre que as OPÇÕES chegam depois do VALOR: lista assíncrona, ou
   * opções derivadas do próprio estado do formulário. Medido no Hub em
   * 20/08/2026 — a tela de Conexões parou de salvar, a validação reprovava por
   * um campo que ninguém esvaziou, e 19 horas de log não tiveram um PUT.
   *
   * A guarda é estreita: só engole o vazio quando ele NÃO pode ter vindo de
   * quem usa (dropdown fechado) e o valor atual é órfão. Escolha real acontece
   * com o dropdown aberto e passa direto.
   */
  const abertoRef = useRef(false);

  const valorEhOrfao =
    value !== undefined &&
    value !== "" &&
    !options.some((opt) => opt.value === value);

  const paraRadix = (v: string | undefined) =>
    v === "" ? SENTINELA_VAZIO : v;

  const aoMudarValor = (proximo: string) => {
    if (proximo === "" && valorEhOrfao && !abertoRef.current) return;
    onValueChange?.(proximo === SENTINELA_VAZIO ? "" : proximo);
  };

  return (
    <FormField
      label={label}
      required={required}
      helperText={helperText}
      state={state}
      errorMessage={errorMessage}
      warningMessage={warningMessage}
      successMessage={successMessage}
      className={className}
      id={id}
      disabled={disabled}
    >
      {({ id: fieldId, state: fieldState }) => (
        <Select
          value={paraRadix(value)}
          defaultValue={paraRadix(defaultValue)}
          onValueChange={aoMudarValor}
          onOpenChange={(aberto) => {
            abertoRef.current = aberto;
          }}
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldId}
            state={fieldState as SelectTriggerState}
            className={triggerClassName}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={paraRadix(opt.value) as string}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}
