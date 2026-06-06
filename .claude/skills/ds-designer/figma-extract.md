---
name: figma-extract
description: >
  Extrair tokens ou componentes do Figma para o DS.
  Mapear variáveis Figma para tokens semânticos existentes.
---

# DS Designer — Extração do Figma

## ⛔ Verificações antes de mapear

```
1. Componente já existe em component-inventory.md?
   Sim → avaliar se é redesign (ajustar existente) ou componente novo

2. Para cada valor do Figma, antes de propor token novo:
   Abrir o arquivo semântico correspondente e verificar se já existe.
   Ex: cor → abrir color-light.ts · spacing → ver spacing.ts · radius → ver shape.ts
   Token similar já existe? → usar o existente, NÃO propor novo.
```

## Processo

```
1. Ler valores do Figma (px, hex, rem)
2. Para cada valor → verificar se existe token DS (passo acima)
3. Se não existe → propor novo token semântico (com justificativa)
4. Output: tabela de mapeamento + gaps + Perspectiva Strategist
```

## Conversões obrigatórias

| Figma mostra | Converter para |
|-------------|---------------|
| px (font-size) | rem (÷16): 14px → 0.875rem |
| px (spacing) | verificar escala: 8px → gap-gp-md |
| hex/rgb/hsl | verificar role semântico: #3B82F6 → bg-bg-primary |
| border-radius px | verificar escala: 26px → rounded-radius-base |
| box-shadow | verificar nível: leve → shadow-sh-sm |

## Formato de output (completo)

```markdown
## Mapeamento Figma → iGreen DS

| Elemento | Valor Figma | Token DS | Classe |
|----------|-------------|----------|--------|
| Fundo botão primário | #338449 | bg.primary | bg-bg-primary |
| Texto botão | #FFFFFF | fg.on-primary | text-fg-on-primary |
| Border-radius botão | 26px | radius.base | rounded-radius-base |
| Font-size label | 14px | title-sm | text-title-sm |
| Gap icon-to-text | 8px | gap.md | gap-gp-md |

## Gaps identificados (tokens faltantes — verificados como ausentes)
| Valor Figma | Uso | Token proposto | Justificativa |
|------------|-----|----------------|---------------|
| (se houver) | ... | ... | por que nenhum existente serve |

## Perspectiva Strategist (obrigatório — usado pelo Orchestrator no gate)
- Gaps identificados: [listar tokens faltantes ou "nenhum — todos mapeados"]
- Assumption central: [ex: "os valores do Figma são a referência de design final, não estimativas de layout"]
```

## Quando há gaps

Se tokens faltantes foram identificados:
```
→ Criar tokens primeiro via /add-token (fluxo: DS Designer → [GATE] → DS Dev → DS Reviewer)
→ Só após tokens aprovados → implementar o componente via /create-component ou /add-shadcn-component
```

Não implementar componente com tokens faltantes — acionar cascata via Orchestrator.

## Regras

- Figma raramente usa nomenclatura semântica — traduzir sempre para intenção
- Cor de fundo → verificar TODOS os `bg.*` antes de propor novo
- Nunca mapear hex diretamente → sempre via role semântico
- Justificar SEMPRE por que um token existente não serve antes de propor novo
