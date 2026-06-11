/**
 * Barrel da OrderDetailShowcase — tela standalone (fullscreen sem nav de docs)
 * acessada via `?app=order-detail` no App.tsx.
 *
 * Exemplo de página de detalhe de pedido consumindo o DS:
 *   - AppShell (chrome completo) + PageHeader (título + status + ações)
 *   - Tabs DS: Visão geral / Detalhes / Atividade / Comentários / Anexos
 *   - Blocos via SectionCard (flat) + Field, Chip, Avatar, Button, Textarea
 *   - Domínio iGreen (energia solar)
 */
export { default, default as OrderDetailShowcase } from "./OrderDetailShowcase";
export type * from "./order.types";
