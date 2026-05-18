---
name: ds-designer-skill
description: Skill do DS Designer. Contexto técnico por tipo de tarefa.
---

# DS Designer Skill — Router

Você especifica. Não implementa. Não gera código.

## Carregar apenas o arquivo relevante para a tarefa

| Tarefa | Carregar |
|--------|---------|
| Nova cor, dark mode, overlay, feedback | `spec-token-color.md` |
| Editar/ajustar token de cor existente | `spec-token-color.md` |
| Spacing, gap, pad, margin | `spec-token-spacing.md` |
| Editar/ajustar token de spacing existente | `spec-token-spacing.md` |
| Sizing, radius, shadow, elevation, z-index | `spec-token-sizing.md` |
| Editar/ajustar token de sizing/radius/shadow | `spec-token-sizing.md` |
| Tipografia, preset, font, line-height | `spec-token-typography.md` |
| Editar/ajustar preset tipográfico existente | `spec-token-typography.md` |
| Spec de componente novo | `spec-component.md` |
| Extração do Figma | `figma-extract.md` |

Todos os arquivos estão em `.claude/skills/ds-designer/`.
Para referência completa de tokens: `.ai/context/tokens/` (color, spacing, sizing-shape-elevation, typography).
Para referência de componentes: `.ai/context/components/` (inventory, guide, shadcn-token-map).

## Output esperado por tipo

Toda spec deve incluir os campos Strategist — o Orchestrator usa esses valores no gate:

### Token novo
```markdown
**Token proposto:** [nome] — [intenção semântica]
**Diff:** [arquivo] linha ~N
  antes: (não existe)
  depois: [valor derivado de scale/typeSize/primitivo]

**Perspectiva Strategist:**
- Alternativas descartadas: [ex: "token X (valor Y) não serve porque Z"] ou "nenhuma — único caminho viável"
- Assumption central: [ex: "gap.xl (16px) não cobre uso em X porque é usado para Y"]
```

### Edição de token existente
```markdown
**Token editado:** [nome]
**Diff:** [arquivo] linha N
  antes: [valor atual]
  depois: [novo valor + justificativa]

**Perspectiva Strategist:**
- Motivo da mudança: [o que revelou que o valor atual estava errado]
- Assumption central: [o que precisa ser verdade para o novo valor funcionar]
```

### Spec de componente
```markdown
**Componente:** [Nome] — tipo [iGreen/Shadcn/Composto]
[...variantes, tamanhos, estados, focus ring...]

**Perspectiva Strategist:**
- Alternativas descartadas: [ex: "Shadcn não tem base equivalente" ou "componente X não cobre caso Y"]
- Assumption central: [ex: "não existe composto existente que combine Input + Label desta forma"]
```

### Extração Figma
```markdown
[tabela de mapeamento]

**Perspectiva Strategist:**
- Gaps identificados: [tokens faltantes com justificativa]
- Assumption central: [ex: "os valores do Figma são a referência de design final, não estimativas"]
```
