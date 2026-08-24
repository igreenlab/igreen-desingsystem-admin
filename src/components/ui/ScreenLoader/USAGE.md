# ScreenLoader

<!-- ds:regras
- omita `size`: `md` é o calibrado pro slot do AppShell; `lg` não é "pra dar destaque"
- omita `skeletonLayout`: `page` serve pra qualquer tela — só mude se ela TEM KPIs no topo
- o pai precisa ter altura, senão a variante spinner colapsa no topo
- loading inline (botão, célula) → `Spinner` direto; overlay é composição do consumidor
-->

**Categoria:** iGreen (tv()). Estado de **carregamento de página/área** — preenche o container pai e mostra um indicador enquanto o conteúdo processa. Irmão do `EmptyState` (mesma família de "estado de área").

## Quando usar

- Conteúdo de uma página inteira carregando dentro do slot de conteúdo do AppShell.
- Área grande (card, section, painel) aguardando primeira carga de dados.
- **Não** é pra loading inline (botão, célula) — aí use `Spinner` direto.
- **Não** é overlay sobre conteúdo já renderizado — cobre o slot vazio; sobrepor é composição do consumidor.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `variant` | `"spinner" \| "skeleton"` | `"spinner"` | `spinner` = Spinner centrado + título + descrição. `skeleton` = silhueta genérica de página, sem prever o layout final. |
| `skeletonLayout` | `"page" \| "dashboard" \| "kpis"` | `"page"` | Blocos da silhueta (só `skeleton`): `page` = header + conteúdo · `dashboard` = header + linha de 4 KPIs + conteúdo · `kpis` = KPIs + conteúdo, sem header. |
| `title` | `string` | `"Carregando…"` | Visível no `spinner`; sr-only no `skeleton` (leitores anunciam via `role="status"`). |
| `description` | `string` | — | Linha auxiliar sob o título (só `spinner`). |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Escala spinner + tipografia do título. Sem efeito no `skeleton`. **`md` é o padrão de uso** — não passe `size` a menos que a área destoe (ver Gotchas). |
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
{isLoading ? <ScreenLoader variant="skeleton" /> : <ClientesPage />}

// tela de painel: skeleton com linha de KPIs (com ou sem header)
{isLoading ? <ScreenLoader variant="skeleton" skeletonLayout="dashboard" /> : <Dashboard />}
{isLoading ? <ScreenLoader variant="skeleton" skeletonLayout="kpis" /> : <KpiSection />}
```

## Gotchas

- **Padrão de uso: omita `size` (= `md`).** É o calibrado pro slot de conteúdo do AppShell. `sm` só pra área comprovadamente pequena (card baixo, painel lateral); `lg` só pra tela cheia vazia sem chrome. Não escolha `lg` "pra dar destaque".
- **Padrão do skeleton: omita `skeletonLayout` (= `page`, header + conteúdo).** É a silhueta genérica que serve pra qualquer tela — só saia dela quando a tela alvo COMPROVADAMENTE tem KPIs no topo: `dashboard` (com header de página) ou `kpis` (quando o header já está renderizado fora da área que carrega). Não invente combinação além dessas três: layout mais específico que isso = compor `Skeleton` na mão.

- **O pai precisa ter altura.** O componente preenche o container (`h-full flex-1`) — num pai sem altura definida, a variante `spinner` colapsa no topo (o `skeleton` tem `min-h` próprio de fallback). No AppShell o slot de conteúdo já tem altura.
- **Nunca `position: fixed`** — cobrir o viewport inteiro (splash, auth guard) é composição do consumidor, de propósito.
- **Skeleton genérico de propósito**: quando o layout final é conhecido (tabela, lista de cards), componha `<Skeleton>` na mão desenhando a silhueta real — o `DataTable`/`DataList` já trazem os próprios skeletons; não empilhe este por cima.
- **A11y sem duplicação**: o root tem `role="status"` + `aria-live="polite"`; o Spinner interno vai `aria-hidden`. Não embrulhe em outro `role="status"`.
- A rotação do Spinner para sob `prefers-reduced-motion` (`motion-reduce:animate-none`); o pulse do Skeleton (só opacidade, sem deslocamento) **não** é gated — é o comportamento do `shadcn/skeleton.tsx`.
