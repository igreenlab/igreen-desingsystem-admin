---
name: spec-token-typography
description: >
  Especificar preset tipográfico (heading, label, paragraph, etc.).
  Verificar se preset existente já atende antes de criar novo.
---

# DS Designer — Tipografia

## ⛔ Verificação prévia obrigatória

```
Antes de propor qualquer preset tipográfico:
1. Abrir semantic/typography.ts
2. Verificar label.*, paragraph.*, heading.*, title.*, subheading.*, caption.*
   Existe preset com tamanho e peso similar?
   Sim → usar o existente. NÃO criar.
   Ex: label-sm (0.875rem, 500) já existe → não criar label-button (14px, medium)
   Não → justificar por que nenhum existente serve → prosseguir
```

## Sistema

- Presets **≥ 32px** (display, heading sm→xl) → `clamp()` fluid, lineHeight unitless
- Presets **< 32px** → `rem` estático, lineHeight em rem
- **NUNCA px** em nenhum preset. Figma mostra px → dividir por 16 para rem.

## Presets por categoria

### display (hero — fluid)
`display-2xl` clamp(2.5→4.75rem) · `display-xl` clamp(2.25→3.8rem) · `display-lg` clamp(2→3rem) · `display-md` clamp(1.75→2.4rem)

### heading (títulos de página)
Fluido: `heading-xl/lg/md/sm` (clamp)
Estático: `heading-xs` 1.5rem · `heading-2xs` 1.25rem

### title (títulos de card — estático, weight 500)
`title-lg` 1.25rem · `title-md` 1rem · `title-sm` 0.875rem

### label (botões, inputs, tabs — weight 500, estático)
`label-xl` 1.5rem · `label-lg` 1.125rem · `label-md` 1rem · `label-sm` 0.875rem · `label-xs` 0.75rem

### paragraph (texto corrido — weight 400, mesmos tamanhos que label)
`paragraph-xl/lg/md/sm/xs` — idênticos ao label, mas weight 400

### subheading (categorias — letter-spacing positivo, estático)
`subheading-md` 1rem · `subheading-sm` 0.875rem · `subheading-xs` 0.75rem · `subheading-2xs` 0.6875rem

### caption (auxiliar, estático)
`caption-md` 0.8125rem · `caption-sm` 0.6875rem

### code (estático)
`code-md` 1rem · `code-sm` 0.8125rem

## Uso por componente

| Componente | Preset |
|------------|--------|
| Button | `label-sm` |
| Input value | `paragraph-sm` |
| Label de campo | `label-sm` |
| Helper text | `paragraph-xs` |
| Badge sm | `subheading-2xs` (0.6875rem, letter-spacing positivo) |
| Badge md | `label-xs` (0.75rem, weight 500) |
| Tabs item | `label-sm` |
| Card title | `label-md` |

## Regras

```typescript
// ❌ NUNCA combinar avulsos
"text-[14px] font-medium leading-5"
"text-sm font-semibold"

// ✅ SEMPRE preset composto
"text-label-sm"
"text-paragraph-sm"
"text-subheading-2xs"
```

`label` vs `paragraph` = mesmo tamanho, peso diferente (500 vs 400).
`subheading` = letter-spacing positivo — para categorias, badges pequenos.
`caption` ≠ `subheading-2xs` — caption tem letter-spacing neutro, subheading tem positivo.
