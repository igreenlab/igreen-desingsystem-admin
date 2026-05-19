---
name: spec-token-sizing
description: >
  ALIAS pra spec-token (tipo=sizing|radius|shadow). Mantido pra retrocompatibilidade.
  Conteúdo consolidado em .claude/skills/ds-designer/spec-token.md.
---

# DS Designer — Sizing/Radius/Shadow (alias)

Este arquivo foi consolidado em `spec-token.md`. Use:

```
Skill: ds-designer/spec-token
Args:  tipo=sizing     (form heights, icon sizes, container widths, layout heights)
       tipo=radius     (border-radius, prefixo rounded-radius-*)
       tipo=shadow     (elevation, prefixo shadow-sh-*)
```

A skill consolidada inclui:
- Verificação prévia obrigatória (regra comum)
- Spec com perspectiva Strategist (alternativas + assumption)
- Seções específicas pra sizing/radius/shadow + zIndex
- Doc de referência: `.ai/context/tokens/sizing-shape-elevation.md`
