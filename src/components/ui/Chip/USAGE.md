# Chip — USAGE

Pílula compacta para status, tags, filtros — dual-mode (span estático ou button interativo).

## Quando usar
- Tags / categorias (status, prioridade, label)
- Filtros aplicados (com onClick = remove)
- Chips de seleção (selected state)
- Counters inline

## Import
```tsx
import { Chip, ChipGroup, ChipGroupItem } from "@/components/ui/Chip";
```

## Variants
| Variant | Valores | Default | Quando |
|---|---|---|---|
| `color` | primary / neutral / danger / warning / success / info | neutral | Cor semântica |
| `variant` | solid / outline / soft / soft-outline | soft | Intensidade visual |
| `size` | sm / md / lg / xl | md | sm=24px, md=28px, lg=32px, xl=36px |
| `shape` | pill / rounded | pill | Border-radius |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `onClick` | () => void | Vira `<button>` automaticamente |
| `asButton` | boolean | Força modo button mesmo sem onClick |
| `selected` | boolean | Visual ativo (force soft) |
| `interactive` | boolean | Hover cursor (sem ser button) |

## Exemplo mínimo
```tsx
// Tag estática
<Chip color="warning" variant="soft">Royal</Chip>

// Filtro com remove
<Chip color="primary" onClick={removeFilter}>Status: Ativo ×</Chip>

// Group multi-select
<ChipGroup type="multiple" value={selected} onValueChange={setSelected}>
  <ChipGroupItem value="all">Todas</ChipGroupItem>
  <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
</ChipGroup>
```

## Cuidados / Gotchas
- Sem `onClick` e sem `asButton={true}` renderiza como `<span>` (decorativo)
- `selected=true` força visual "soft" da cor mesmo se `variant="outline"`
- Pra counter inline, usar `chipCount` slot (10px font-semibold)
