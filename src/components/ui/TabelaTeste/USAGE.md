# TabelaTeste — USAGE

Replica visual hardcoded do sandbox `/design-and-table-v2` — referência de tabela com density "comfortable" (56px).

## Quando usar
- ⚠️ **Referência visual apenas** — não usar em produção
- Sandbox de comparação com o design original
- Validar tokens DS contra design system de referência

## Em produção, use:
- `<Table>` — primitiva dumb com slots flexíveis
- `<DataTable>` — wrapper smart com toolbar/pagination/filters

## Import
```tsx
import { TabelaTeste } from "@/components/ui/TabelaTeste";
```

## Variants
| Variant | Valores | Default | Quando |
|---|---|---|---|
| `density` | compact / comfortable / spacious | comfortable | Altura da row (40/56/64px) |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `rows` | TestRow[] | Dados fixos hardcoded |
| `density` | "compact" \| "comfortable" \| "spacious" | Altura |
| `onRowSelect` | (id: string) => void | Callback de seleção |

## Exemplo mínimo
```tsx
<TabelaTeste
  rows={[
    { id: 1, name: "João", status: "Ativo", amount: "R$ 1.200" },
  ]}
  density="comfortable"
/>
```

## Cuidados / Gotchas
- ❌ **Não use em features novas** — é referência viva, não componente real
- Density "comfortable" (56px) é o padrão visual do sandbox; "compact" e "spacious" são variações pra exploração
- Chips embutidos seguem 4 kinds: success / warning / info / danger
- Pra qualquer tabela de produto, usar `<DataTable>` (smart) ou `<Table>` (dumb)
