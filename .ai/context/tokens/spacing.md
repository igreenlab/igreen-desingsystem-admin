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

⚠️ **Os 3 grupos compartilham a MESMA escala.** `gap.lg`, `space.lg` e `pad.lg` valem todos
10px — o que muda é a **intenção** (e por consequência a classe), não o valor. Até
2026-08-08 este arquivo trazia 3 tabelas com valores divergentes (`gap.lg` 12px, `space.lg`
24px, `pad.lg` 12px), todos falsos; o valor real vem de `unified` em
`tokens/brands/default/semantic/spacing.ts`.

| Degrau | Valor | `gap` | `space` | `pad` |
|--------|-------|-------|---------|-------|
| `2xs` | **2px** | `gap-gp-2xs` | `p-sp-2xs` | `px-pad-2xs` |
| `xs` | **4px** | `gap-gp-xs` | `p-sp-xs` | `px-pad-xs` |
| `sm` | **6px** | `gap-gp-sm` | `p-sp-sm` | `px-pad-sm` |
| `md` | **8px** | `gap-gp-md` | `p-sp-md` | `px-pad-md` |
| `lg` | **10px** | `gap-gp-lg` | `p-sp-lg` | `px-pad-lg` |
| `xl` | **12px** | `gap-gp-xl` | `p-sp-xl` | `px-pad-xl` |
| `2xl` | **16px** | `gap-gp-2xl` | `p-sp-2xl` | `px-pad-2xl` |
| `3xl` | **20px** | `gap-gp-3xl` | `p-sp-3xl` | `px-pad-3xl` |
| `4xl` | **24px** | `gap-gp-4xl` | `p-sp-4xl` | `px-pad-4xl` |
| `5xl` | **28px** | `gap-gp-5xl` | `p-sp-5xl` | `px-pad-5xl` |
| `6xl` | **32px** | `gap-gp-6xl` | `p-sp-6xl` | `px-pad-6xl` |
| `7xl` | **48px** | `gap-gp-7xl` | `p-sp-7xl` | `px-pad-7xl` |

Fora da escala: `gap.base`/`space.base` = 16px · `pad.base` = 12px · `space.px` = 1px ·
`space.0` = 0.

### Qual grupo usar

| Situação | Grupo | Exemplo |
|---|---|---|
| Espaço entre filhos de flex/grid, icon-to-label | `gap` | `gap-gp-sm` (6px) em botão |
| Margin, offset, padding simétrico genérico | `space` | `p-sp-md` |
| Padding interno de componente (x/y separados) | `pad` | `px-pad-2xl` (16px) em botão md |
| **Entre FormField num form/drawer/modal** | — | **`gap-form-gap` (20px)**, L-024 — não use `gap-gp-*` |

Usos reais medidos: AppShell body = `gap-gp-4xl` (24px) + `p-pad-6xl` (32px) com
`max-2xl:p-pad-4xl` (24px) e `max-md:` 18px. Botão = `gap-gp-sm` + `px-pad-xl/2xl`.

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

### `formGap` — gap padrão entre fields de formulário (v0.7.1+)
> CSS var: `--spacing-form-gap` → classe: `gap-form-gap` (20px)

| Token | Valor | Classe | Uso |
|-------|-------|--------|-----|
| `formGap` | 20px | `gap-form-gap` | spacing entre FormField units num form |

**REGRA DS (obrigatória):** todo formulário (drawer, modal, página) usa
`gap-form-gap` entre `FormField*` units. Não usar `gap-gp-md/lg/xl` semânticos
avulsos pra spacing de form — eles existem pra outros contextos (cards, icon-to-text,
section spacing).

**Por quê 20px:**
- `gap-gp-lg` (10px) → fica apertado quando label + helper text empilham
- `gap-gp-xl` (12px) → ainda visualmente curto pra 5+ fields num drawer
- `gap-gp-2xl` (16px) → mais perto, mas ainda não é o ritmo de form
- `formGap = 20px` → bench validado em NovoClienteDrawer + SacarDialog

**Aplicação:**
```tsx
// ✅ Form vertical
<form className="flex flex-col gap-form-gap">
  <FormFieldInput label="Nome" ... />
  <FormFieldSelect label="País" ... />
  <FormFieldInput label="Email" ... />
</form>

// ✅ Grid 2-col dentro do form (mantém consistência H × V)
<div className="grid grid-cols-2 gap-form-gap">
  <FormFieldInput label="Agência" ... />
  <FormFieldInput label="Conta" ... />
</div>
```

⚠️ **Não usar `gap-form-gap` fora de form context** — em cards, grids de
KPI, listas de chip etc, continuar usando `gap-gp-*` semânticos.

---

## Como escolher o grupo correto

| Situação | Grupo | Exemplo de classe |
|----------|-------|-------------------|
| Gap entre ícone e texto em botão | `gap` | `gap-gp-md` |
| Gap entre cards na grid | `gap` | `gap-gp-xl` |
| Gap entre seções de página | `gap` | `gap-gp-3xl` |
| **Gap entre fields de formulário** | **`formGap`** | **`gap-form-gap`** |
| Padding interno de botão/input | `pad` | `px-pad-lg` |
| Padding interno de card | `padCard` | `p-pad-card-base` |
| Padding lateral de página | `padPage` | `px-pad-page-base` |
| Margin genérica, offset | `space` | `m-sp-md` |

---

## Regra crítica

NUNCA usar Tailwind literal quando existe token DS equivalente:

```typescript
// ❌ ERRADO                    // ✅ CERTO
className="gap-4"               className="gap-gp-md"
className="gap-2"               className="gap-gp-xs"
className="p-6"                 className="p-sp-lg"
className="p-4"                 className="p-sp-md"
className="px-3"                className="px-pad-lg"
```

⚠️ **O número do Tailwind NÃO é o degrau do DS — e a diferença é grande.** O mapeamento
acima é por **papel**, não por valor: `gap-4` vale 16px no Tailwind e `gap-gp-md` vale
**8px** no DS. A escala do DS é mais densa de propósito (2·4·6·8·10·12·16·20·24·28·32·48).

Se o que você quer é **preservar o valor** de um layout existente, traduza pelo número:

| Tailwind | Valor | Token DS de mesmo valor |
|---|---|---|
| `gap-2` / `p-2` | 8px | `gap-gp-md` / `p-sp-md` |
| `gap-3` / `p-3` | 12px | `gap-gp-xl` / `p-sp-xl` |
| `gap-4` / `p-4` | 16px | `gap-gp-2xl` / `p-sp-2xl` |
| `gap-6` / `p-6` | 24px | `gap-gp-4xl` / `p-sp-4xl` |
| `gap-8` / `p-8` | 32px | `gap-gp-6xl` / `p-sp-6xl` |

Na dúvida entre os dois critérios, confira o valor no `tailwind-theme.css` e decida
explicitamente — não deduza pelo nome.

Tailwind literal só é permitido para valores sem token DS equivalente.

---

## Como adicionar token de espaçamento

1. Verificar se o valor já existe na escala (`scale[n] = n × 4px`)
2. Se existe mas não está no semântico → adicionar em `spacing.ts` no grupo correto
3. Se não existe na escala → adicionar `scale[n]` em primitivos e referenciar
4. Rodar `npm run tokens:tw4` — obrigatório após qualquer mudança
