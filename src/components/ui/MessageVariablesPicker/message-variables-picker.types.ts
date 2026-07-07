import type { MessageVariablesPickerVariantProps } from "./message-variables-picker.styles";

/** Variável de mensagem inserível no cursor — `token` é o texto bruto ({{...}}), `label` é o rótulo legível. */
export type MessageVariable = {
  /** Texto bruto inserido no cursor (ex: `"{{firstName}}"`). Pode ter trailing space proposital. */
  token: string;
  /** Rótulo legível exibido no Chip (ex: `"Primeiro Nome"`). */
  label: string;
};

/**
 * Variáveis padrão de mensagem do iGreen Hub.
 *
 * ⚠️ Trailing spaces são PROPOSITAIS (token concatenado direto no texto da mensagem):
 * todos têm espaço final EXCETO `{{firstName}}`.
 */
export const DEFAULT_MESSAGE_VARIABLES: MessageVariable[] = [
  { token: "{{firstName}}", label: "Primeiro Nome" },
  { token: "{{name}} ", label: "Nome" },
  { token: "{{ms}} ", label: "Saudação" },
  { token: "{{protocol}} ", label: "Protocolo" },
  { token: "{{hora}} ", label: "Hora" },
];

export type MessageVariablesPickerProps = MessageVariablesPickerVariantProps & {
  /** Chamado com o token da variável escolhida — o consumer insere no cursor do textarea. */
  onSelect: (token: string) => void;
  /** Lista de variáveis exibidas. @default DEFAULT_MESSAGE_VARIABLES */
  variables?: MessageVariable[];
  /** Rótulo do trigger (usado no `triggerVariant="button"`). @default "Variáveis" */
  label?: string;
  /** `icon` = botão só-ícone (glyph chaves) · `button` = ícone + label. @default "icon" */
  triggerVariant?: "icon" | "button";
  /** Estado controlado de abertura. */
  open?: boolean;
  /** Callback de mudança de abertura (controlado). */
  onOpenChange?: (open: boolean) => void;
  /** Fecha o popover ao selecionar uma variável. @default true */
  closeOnSelect?: boolean;
  /** Desabilita o trigger. */
  disabled?: boolean;
  /** Classe extra no trigger. */
  className?: string;
};
