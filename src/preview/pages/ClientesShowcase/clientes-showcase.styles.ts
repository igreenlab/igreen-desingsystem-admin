import { tv } from "@/utils/tv";

/**
 * Layout em grid de 2 colunas usado dentro do drawer pra pares de campos
 * (Email + WhatsApp, Cidade + Valor).
 */
export const drawerFormStyles = tv({
  slots: {
    twoCols: "grid grid-cols-2 gap-gp-xl",
    fieldLabel:
      "text-body-sm font-semibold tracking-[0.01em] leading-none text-fg-default dark:text-fg-muted select-none",
    statusDot: "inline-block size-[8px] rounded-radius-full mr-gp-xs shrink-0",
  },
});
