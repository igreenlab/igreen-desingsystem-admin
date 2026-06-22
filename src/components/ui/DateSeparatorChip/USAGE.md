# DateSeparatorChip

**Categoria:** composto (Chip + Icon + Separator). Separador **centralizado na thread** do chat/atendimento. Marcador estático — não interativo.

## Quando usar

- **Separador de data** numa lista de mensagens (`MessagesList`): "Hoje", "Ontem", "22 jun".
- **Limite de conversa** (`boundary`): "Conversa encerrada" / "Conversa iniciada" — chip ladeado por duas réguas finas.

Não use para status de mensagem individual (use `Chip`) nem para divisões de seção genéricas fora da thread (use `Separator`).

## Anatomia

```
variant="date"                          variant="boundary"
        ┌──────────┐            ──────  ┌────────────────────┐  ──────
        │   Hoje   │                    │ ✓ Conversa encerrada│
        └──────────┘                    └────────────────────┘
   (chip pílula neutra,           (chip entre 2 réguas bg-border;
    centralizado mx-auto)          ícone opcional à esquerda)
```

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `label` | `string` | — | **Obrigatório.** Texto centralizado da pílula. |
| `variant` | `"date" \| "boundary"` | `"date"` | `date` = só o chip; `boundary` = chip entre 2 réguas. |
| `icon` | `IconName` | — | Ícone opcional à esquerda do label (ex: `line-check-circle` em boundary). |
| `className` | `string` | — | className do container (root). |

## Exemplo mínimo

```tsx
import { DateSeparatorChip } from "@snksergio/design-system";

// Separador de data na MessagesList
<DateSeparatorChip label="Hoje" />

// Limite de conversa
<DateSeparatorChip
  variant="boundary"
  icon="line-check-circle"
  label="Conversa encerrada"
/>
```

## Variants

| Variant | Valores | Efeito |
|---------|---------|--------|
| `variant` | `date` · `boundary` | `date` = chip centralizado isolado; `boundary` = chip ladeado por 2 réguas finas (`bg-border` do Separator) ocupando o espaço lateral |

## Gotchas

- **Composição pura:** reusa `Chip` (color `neutral`, variant `soft`, size `sm` → pílula `rounded-radius-full`, `text-caption-sm`), `Icon` (`size="xs"` = 12px) e `Separator` do shadcn. Não reescreve nenhum deles.
- **Réguas:** as réguas de `boundary` são `<Separator>` do shadcn com só `flex-1` (slot `rule`) pra esticar — a cor `bg-border` já vem do próprio Separator, sem override; centralização do chip via `mx-auto` + `gap-gp-md` lateral.
- **Estático:** sem foco/disabled — é um marcador, não um controle. Renderiza `role="separator"` + `aria-label={label}`.
- **Acessibilidade do ícone:** o `Icon` aqui é decorativo (sem `title`) — o significado já vem no `label` lido pelo `aria-label` do separador.
