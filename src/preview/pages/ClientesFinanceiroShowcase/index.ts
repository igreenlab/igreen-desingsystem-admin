/**
 * Barrel da ClientesFinanceiroShowcase — tela standalone (fullscreen sem nav
 * de docs) acessada via `?app=finance` no App.tsx.
 *
 * Reaproveita estrutura do ClientesShowcase com tema financeiro:
 *   - Coluna "Saldo disponível" (currency BRL)
 *   - Coluna "Conta bancária" (banco + agência + conta)
 *   - Action "Sacar" abre SacarDialog (modal com valor + cards de conta)
 *   - Action "Editar" reaproveita NovoClienteDrawer (mock)
 *   - KPI row com Disponível total / High-value / Saldo médio
 */
export { default, default as ClientesFinanceiroShowcase } from "./ClientesFinanceiroShowcase";
export type * from "./clientes-financeiro.types";
