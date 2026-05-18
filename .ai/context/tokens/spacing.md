# Tokens de espaçamento — referência do agente

> Carregar quando a tarefa envolver: padding, gap, spacing, espaçamento interno de componente.
> NÃO carregar para cor, tipografia ou sombra.

---

## Arquivo fonte: `tokens/brands/default/semantic/spacing.ts`

## Escala base

Todos os valores derivam de `scales.ts`. BASE = 4px.
`scale[n] = 4 × n`. Exemplos: scale[1]=4px, scale[2]=8px, scale[4]=16px, scale[6]=24px.

---

## Grupos semânticos + classes geradas

### `gap` — espaço entre filhos de flex/grid, icon-to-label, section spacing
> CSS var: `--spacing-gp-*` → classe: `gap-gp-*`

| Token | Valor | Classe Tailwind | Uso típico |
|-------|-------|-----------------|------------|
| `gap.2xs` | 2px | `gap-gp-2xs` | label micro |
| `gap.xs` | 4px | `gap-gp-xs` | icon-to-text compacto, chips |
| `gap.sm` | 6px | `gap-gp-sm` | badge, tabs item, button xxs/xs |
| `gap.md` | 8px | `gap-gp-md` | form fields, button sm/md |
| `gap.lg` | 12px | `gap-gp-lg` | cards em row |
| `gap.xl` | 16px | `gap-gp-xl` | entre seções |
| `gap.2xl` | 24px | `gap-gp-2xl` | base / alias |
| `gap.3xl` | 32px | `gap-gp-3xl` | major section gaps |
| `gap.4xl` | 48px | `gap-gp-4xl` | page-level |

### `space` — espaço genérico (margin, padding simétrico, offsets)
> CSS var: `--spacing-sp-*` → classe: `p-sp-*`, `m-sp-*`, `px-sp-*`, etc.

| Token | Valor | Classe Tailwind |
|-------|-------|-----------------|
| `space.2xs` | 2px | `p-sp-2xs` |
| `space.xs` | 4px | `p-sp-xs` |
| `space.sm` | 8px | `p-sp-sm` |
| `space.md` | 16px | `p-sp-md` |
| `space.lg` | 24px | `p-sp-lg` |
| `space.xl` | 32px | `p-sp-xl` |
| `space.2xl` | 48px | `p-sp-2xl` |
| `space.3xl` | 64px | `p-sp-3xl` |

### `pad` — padding interno de componente (separado x/y)
> CSS var: `--spacing-pad-*` → classe: `px-pad-*`, `py-pad-*`, `p-pad-*`

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|-----------------|-----|
| `pad.2xs` | 2px | `px-pad-2xs` | badge micro |
| `pad.xs` | 4px | `px-pad-xs` | badge sm |
| `pad.sm` | 6px | `px-pad-sm` | button xxs |
| `pad.md` | 8px | `px-pad-md` | button xs |
| `pad.lg` | 12px | `px-pad-lg` | button sm, base |
| `pad.xl` | 14px | `px-pad-xl` | button md |
| `pad.2xl` | 16px | `px-pad-2xl` | button lg |
| `pad.3xl` | 24px | `px-pad-3xl` | containers |

---

## Tokens de componente: `components/spacing.ts`

Paddings recorrentes compartilhados por múltiplos componentes.

### `padCard` — padding interno de cards
> CSS var: `--spacing-pad-card-*` → classe: `p-pad-card-*`

| Token | Valor | Classe |
|-------|-------|--------|
| `padCard.base` | 24px | `p-pad-card-base` |
| `padCard.sm` | 16px | `p-pad-card-sm` |

### `padPage` — padding de body/page content
> CSS var: `--spacing-pad-page-*` → classe: `p-pad-page-*`, `px-pad-page-*`

| Token | Valor | Classe |
|-------|-------|--------|
| `padPage.sm` | 16px | `px-pad-page-sm` — mobile |
| `padPage.base` | 24px | `px-pad-page-base` — default |
| `padPage.lg` | 40px | `px-pad-page-lg` — desktop wide |

---

## Como escolher o grupo correto

| Situação | Grupo | Exemplo de classe |
|----------|-------|-------------------|
| Gap entre ícone e texto em botão | `gap` | `gap-gp-md` |
| Gap entre cards na grid | `gap` | `gap-gp-xl` |
| Gap entre seções de página | `gap` | `gap-gp-3xl` |
| Padding interno de botão/input | `pad` | `px-pad-lg` |
| Padding interno de card | `padCard` | `p-pad-card-base` |
| Padding lateral de página | `padPage` | `px-pad-page-base` |
| Margin genérica, offset | `space` | `m-sp-md` |

---

## Regra crítica

NUNCA usar Tailwind literal quando existe token DS equivalente:
```typescript
// ❌ ERRADO
className="gap-4"    // usar: gap-gp-md  (8px)
className="gap-2"    // usar: gap-gp-xs  (4px)
className="p-6"      // usar: p-sp-lg    (24px)
className="p-4"      // usar: p-sp-md    (16px)

// ✅ CERTO
className="gap-gp-md"
className="p-sp-md"
className="px-pad-lg"
```

Tailwind literal só é permitido para valores sem token DS equivalente.

---

## Como adicionar token de espaçamento

1. Verificar se o valor já existe na escala (`scale[n] = n × 4px`)
2. Se existe mas não está no semântico → adicionar em `spacing.ts` no grupo correto
3. Se não existe na escala → adicionar `scale[n]` em primitivos e referenciar
4. Rodar `npm run tokens:tw4` — obrigatório após qualquer mudança
