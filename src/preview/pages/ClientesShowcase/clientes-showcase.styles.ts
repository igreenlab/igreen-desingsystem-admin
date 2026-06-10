import { tv } from "@/utils/tv";

/**
 * Layout em grid de 2 colunas usado dentro do drawer pra pares de campos
 * (Email + WhatsApp, Cidade + Valor).
 * `gap-form-gap` (20px) = token DS pra spacing entre FormField units (L-024).
 */
export const drawerFormStyles = tv({
  slots: {
    twoCols: "grid grid-cols-2 gap-form-gap",
    statusDot: "inline-block size-[8px] rounded-radius-full mr-gp-xs shrink-0",
  },
});
