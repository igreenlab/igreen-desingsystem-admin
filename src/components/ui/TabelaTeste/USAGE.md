# TabelaTeste — USAGE

## O que é

Demo standalone — réplica visual hardcoded da tabela do sandbox `/design-and-table-v2`. Serve como referência visual fixa pra outros componentes Table do DS: o mapeamento de tokens, espaçamentos e estados está literal no código (`tabela-teste.styles.ts`).

⚠️ **Não é componente de produto.** Não aceita props, não recebe dados externos e não deve ser usado em apps.

## O que demonstra

- 13 colunas fixas (select, id, person, email, phone, status, category, agent, currency, 2× date, text, actions)
- 50 rows mock determinísticas internas (`ROWS_MOCK` em `mock-data.ts` — 10 base × 5 variações)
- Densidade fixa "comfortable" (56px), cell-borders on
- Seleção de rows (checkbox + select-all com indeterminate) e highlight de row aberta — state local, sem callbacks
- Chips de categoria com 4 kinds nos estilos: success / warning / info / danger

## Como ver no preview

`npm run dev` (porta 3100) → página **tabela-teste** (renderizada por `src/preview/pages/TabelaTesteDoc.tsx`).

## Em produção, use:

- `<Table>` — primitiva dumb com slots flexíveis
- `<DataTable>` — wrapper smart com toolbar/pagination/filters

## Import

```tsx
import { TabelaTeste } from "@/components/ui/TabelaTeste";
```

## Props

Nenhuma — componente 100% hardcoded por design (`export function TabelaTeste()`). Dados, colunas e densidade são internos.

## Variants

Nenhuma exposta. Os estilos (`tabela-teste.styles.ts`) têm uma variant interna `density` (compact 40px / comfortable 56px / spacious 64px) preparada pra exploração, mas o componente nunca a parametriza — renderiza sempre o default `comfortable`.

## Exemplo mínimo

```tsx
<TabelaTeste />
```

## Cuidados / Gotchas

- ❌ **Não use em features novas** — é referência viva, não componente real
- Não há como passar dados, callbacks ou trocar densidade — qualquer customização exige editar o source (e isso quebra o propósito de referência fixa)
- Pra qualquer tabela de produto, usar `<DataTable>` (smart) ou `<Table>` (dumb)
