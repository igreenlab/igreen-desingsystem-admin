# ScreenLoader

**Categoria:** iGreen (tv()). Estado de **carregamento de página/área** — preenche o container pai e mostra um indicador enquanto o conteúdo processa. Irmão do `EmptyState` (mesma família de "estado de área").

## Quando usar

- Conteúdo de uma página inteira carregando dentro do slot de conteúdo do AppShell.
- Área grande (card, section, painel) aguardando primeira carga de dados.
- **Não** é pra loading inline (botão, célula) — aí use `Spinner` direto.
- **Não** é overlay sobre conteúdo já renderizado — cobre o slot vazio; sobrepor é composição do consumidor.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `"spinner" \| "skeleton"` | `"spinner"` | `spinner` = Spinner centrado + título + descrição. `skeleton` = silhueta genérica de página (header + bloco), sem prever o layout final. |
| `title` | `string` | `"Carregando…"` | Visível no `spinner`; sr-only no `skeleton` (leitores anunciam via `role="status"`). |
| `description` | `string` | — | Linha auxiliar sob o título (só `spinner`). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Escala spinner + tipografia do título. Sem efeito no `skeleton`. |
| `color` | cores do Spinner | `"brand"` | Repassada ao Spinner (só `spinner`). |
| `className` | `string` | — | Overrides no root (aceita `ref` de `HTMLDivElement`). |

## Exemplo mínimo

```tsx
import { ScreenLoader } from "@snksergio/design-system";

// dentro do slot de conteúdo (o pai precisa ter altura)
{isLoading ? (
  <ScreenLoader title="Carregando clientes" description="Buscando os dados mais recentes…" />
) : (
  <ClientesPage />
)}

// variação skeleton — silhueta genérica em vez de spinner
{isLoading ? <ScreenLoader variant="skeleton" /> : <Dashboard />}
```

## Gotchas

- **O pai precisa ter altura.** O componente preenche o container (`h-full flex-1`) — num pai sem altura definida, a variante `spinner` colapsa no topo (o `skeleton` tem `min-h` próprio de fallback). No AppShell o slot de conteúdo já tem altura.
- **Nunca `position: fixed`** — cobrir o viewport inteiro (splash, auth guard) é composição do consumidor, de propósito.
- **Skeleton genérico de propósito**: quando o layout final é conhecido (tabela, lista de cards), componha `<Skeleton>` na mão desenhando a silhueta real — o `DataTable`/`DataList` já trazem os próprios skeletons; não empilhe este por cima.
- **A11y sem duplicação**: o root tem `role="status"` + `aria-live="polite"`; o Spinner interno vai `aria-hidden`. Não embrulhe em outro `role="status"`.
- A rotação do Spinner para sob `prefers-reduced-motion` (`motion-reduce:animate-none`); o pulse do Skeleton (só opacidade, sem deslocamento) **não** é gated — é o comportamento do `shadcn/skeleton.tsx`.
