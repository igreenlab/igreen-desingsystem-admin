---
name: ds-extract-figma
description: >
  Extrair componente ou tokens do Figma para o DS.
  Entry point que aciona DS Designer com skill figma-extract.md.
  Ativar para: "extrair do Figma", "importar do Figma", "mapear tokens do Figma".
---

# Extrair do Figma — iGreen DS

## Fluxo correto

```
DS Designer (figma-extract.md) → mapeamento com Perspectiva Strategist → [GATE] → DS Dev implementa gaps
```

Extração é responsabilidade do DS Designer — não do DS Dev.

## ⛔ Antes de qualquer mapeamento

```
1. Componente já existe em .ai/context/components/inventory.md?
   Sim → avaliar se é redesign (ajustar existente) ou componente novo
2. Carregar .claude/skills/ds-designer/figma-extract.md — processo completo de mapeamento
```

## O que o DS Designer produz

Tabela de mapeamento + Perspectiva Strategist (obrigatória para o gate):

```markdown
## Mapeamento: [NomeComponente]

| Elemento | Valor Figma | Classe DS |
|----------|-------------|-----------|
| Fundo principal | #338449 | bg-bg-primary |
| Texto sobre fundo | #FFFFFF | text-fg-on-primary |
| Border-radius | 26px | rounded-radius-base |
| Font-size label | 14px | text-label-sm |
| Gap icon-text | 8px | gap-gp-md |

## Gaps (tokens a criar antes de implementar)
- [se houver valores sem token DS correspondente — com justificativa de por que nenhum existente serve]

## Perspectiva Strategist
- Gaps identificados: [tokens faltantes com justificativa]
- Assumption central: [ex: "os valores do Figma são a referência de design final, não estimativas"]
```

## Após mapeamento

```
Gaps identificados?
  Sim → criar tokens primeiro via /ds-add-token → tokens:tw4 → retomar
  Não → DS Dev implementa via /ds-create-component ou /ds-add-shadcn
```

## Handoff

`SPEC_PRONTA: figma/[NomeComponente] — aguardando aprovação`
