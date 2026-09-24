# Chip — USAGE

Pílula compacta para status, tags, filtros — dual-mode (span estático ou button interativo).

## Quando usar
- Tags / categorias (status, prioridade, label)
- Filtros aplicados (use `onRemove` — o × ganha alvo próprio)
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

## ChipGroup props
Seleção via `@radix-ui/react-toggle-group`. Visual ativo/inativo configurável independentemente.

| Prop | Tipo | Default | Função |
|---|---|---|---|
| `type` | `"single"` \| `"multiple"` | — (obrigatória) | single = radio-like, multiple = checkbox-like |
| `value` | string (single) / string[] (multiple) | — | Seleção controlada |
| `defaultValue` | string (single) / string[] (multiple) | — | Seleção inicial (uncontrolled) |
| `onValueChange` | (value: string) => void (single) / (value: string[]) => void (multiple) | — | Callback de mudança |
| `inactiveColor` | mesmos valores de `color` | `"neutral"` | Cor dos items NÃO selecionados |
| `inactiveVariant` | mesmos valores de `variant` | `"outline"` | Variant dos items NÃO selecionados |
| `activeColor` | mesmos valores de `color` | `"primary"` | Cor dos items selecionados |
| `activeVariant` | mesmos valores de `variant` | `"soft-outline"` | Variant dos items selecionados |
| `size` | sm / md / lg / xl | `"md"` | Size aplicado em todos os chips do grupo |
| `shape` | pill / rounded | `"pill"` | Shape aplicado em todos os chips |
| `orientation` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Direção do grupo |
| `ariaLabel` | string | — | Aria-label do grupo |

## Exemplo mínimo
```tsx
// Tag estática
<Chip color="warning" variant="soft">Royal</Chip>

// Filtro aplicado: clicar edita, × remove (dois alvos)
<Chip color="primary" onClick={editarFiltro} onRemove={removerFiltro}>
  Status: Ativo
</Chip>

// Só removível
<Chip onRemove={removerFiltro}>Status: Ativo</Chip>

// Group multi-select
<ChipGroup type="multiple" value={selected} onValueChange={setSelected}>
  <ChipGroupItem value="all">Todas</ChipGroupItem>
  <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
</ChipGroup>
```

## Cuidados / Gotchas
- Sem `onClick` e sem `asButton={true}` renderiza como `<span>` (decorativo)
- O visual interativo (cursor pointer + focus ring) é calculado internamente a partir de `onClick`/`asButton` — não existe prop `interactive` no Chip
- `selected=true` força visual "soft" da cor mesmo se `variant="outline"`
- Pra counter inline, usar `chipCount` slot (10px font-semibold)

## `onRemove` — o × é um alvo, não um caractere (2026-09-23)

Até aqui a receita desta própria página era `<Chip onClick={remover}>Status: Ativo ×</Chip>`:
o "×" era um caractere digitado no texto, o chip inteiro removia, e não havia como ter as
duas ações — "editar este filtro" e "tirar este filtro" — no mesmo chip.

- Com `onRemove`, a pílula vira `<span>` e a label ganha o próprio `<button>` quando há
  `onClick`. **Botão dentro de botão é HTML inválido**: o navegador desaninha e o clique
  no × passa a disparar o do chip junto. Por isso são dois irmãos, nunca um dentro do outro.
- Chip **sem** `onRemove` não mudou em nada: estático continua `<span>`, clicável continua
  `<button>`.
- **`removeLabel`**: o nome acessível do × sai do texto do chip ("Remover Status: Ativo").
  Quando `children` não é texto simples, o default vira só "Remover" — e cinco botões
  "Remover" numa barra de filtros são indistinguíveis no leitor de tela. Passe o nome.
