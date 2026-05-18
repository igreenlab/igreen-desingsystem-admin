---
name: impl-token
description: >
  Implementar token aprovado pelo gate.
  Nunca criar token inline — sinalizar cascata se faltar.
---

# DS Dev — Implementação de token

## Verificação antes de implementar

```
Token foi aprovado via gate pelo usuário?
  Sim → prosseguir
  Não → PARAR → sinalizar ao Orchestrator que gate é necessário
```

## Arquivos semânticos por tipo

| Tipo | Arquivo |
|------|---------|
| Cor | `semantic/color-light.ts` + `semantic/color-dark.ts` |
| Spacing/gap/pad | `semantic/spacing.ts` |
| Sizing genérico | `semantic/sizing.ts` |
| Radius/border | `semantic/shape.ts` |
| Shadow/opacity/blur/z | `semantic/elevation.ts` |
| Tipografia | `semantic/typography.ts` |
| Form/layout/icon/container | `components/sizing.ts` |
| padCard/padPage | `components/spacing.ts` |

## Regras de implementação

```typescript
// ✅ Valores derivam de scale[n] ou typeSize(n) — NUNCA hardcoded
space.md: scale[4]        // = 16px via multiplicador
label-sm: typeSize(-1)    // = 0.875rem via função

// ❌ NUNCA
space.md: "16px"          // hardcode proibido
label-sm: { fontSize: "14px" }  // px proibido em tipografia
```

## Cor — obrigações ao criar token

```typescript
// color-light.ts
export const bg = {
  "nova-cor":        brand[500],    // fundo sólido
  "nova-cor-subtle": brand[50],     // fundo suave
  "nova-cor-muted":  brand[100],    // fundo intermediário
  "nova-cor-hover":  brand[600],    // hover sobre sólido
};
export const fg = {
  "on-nova-cor": neutral[0],        // texto sobre fundo sólido
  "nova-cor":    brand[600],        // texto com cor da marca
};

// color-dark.ts — hierarquia CRESCENTE obrigatória
// canvas < surface < subtle < muted (cada step ≥ 3% L%)
// Shadows dark ≥ 2× opacidade do light
// Rings dark ≥ 1.5× alpha do light
```

## Tipografia — template

```typescript
// Preset estático (< 32px):
"novo-preset": {
  fontSize:      "0.875rem",   // 14px ÷ 16
  lineHeight:    "1.25rem",    // 20px ÷ 16 (em rem, não unitless)
  fontWeight:    "500",
  letterSpacing: "-0.006em",
},

// Preset fluid (≥ 32px):
"heading-novo": {
  fontSize:   "clamp(1.5rem, calc(0.25rem + 2.778vw), 2rem)", // 375→1280px
  lineHeight: "1.25",   // UNITLESS — escala com font-size
  fontWeight: "500",
},
```

## Após implementar qualquer token

```bash
npm run tokens:tw4   # OBRIGATÓRIO — gera CSS vars e utility classes
```

## Checklist antes de sinalizar

- [ ] Token aprovado via gate (spec aceita pelo usuário)
- [ ] Valores sem hardcode (usa scale/typeSize/primitivos)
- [ ] Light + Dark — **apenas se token de cor**
- [ ] Hierarquia dark bg crescente (L-008) — **apenas se token de cor**
- [ ] Shadows/rings dark escalados (L-011) — **apenas se token de cor**
- [ ] `npm run tokens:tw4` rodado
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`
  Ex: `Assumption: "este valor não existe na escala atual e o passo anterior X não o cobria"`
