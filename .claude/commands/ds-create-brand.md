---
name: ds-create-brand
description: >
  Criar uma marca (tema de cor) nova no iGreen DS — overlay escopado em
  [data-theme="<id>"], trocável em runtime. Entrevista guiada → derivação de cor
  medida → GATE → geração das 10 superfícies → verificação no browser.
---

# Criar marca — iGreen DS

## Fluxo

```
/ds-create-brand [id ou descrição]
        │
        ▼
carrega .claude/skills/brand-builder/SKILL.md
        │
        ├─ 1. ENTREVISTA      interview.md         (cor · escopo do tingimento · status · canais)
        ├─ 2. DERIVAÇÃO       color-derivation.md  (rampa + neutros + status, com CONTRASTE MEDIDO)
        │                     instrumento: node scripts/brand-contrast.mjs
        ▼
   [GATE]  spec + tabela de medições + Assumption → AGUARDAR "sim"
        │
        ├─ 4. GERAÇÃO         generate.md          (10 superfícies, comandos exatos)
        ├─ 5. VERIFICAÇÃO     verify.md            (browser, os 2 modos, valor RESOLVIDO)
        ▼
branch → commit → push → gh pr create → reportar link e PARAR
```

## Argumento opcional

- id sugerido (`vibrant`) ou descrição (`"tema do cliente X, roxo #7C3AED"`)
- caminho de um handoff/briefing — a skill trata como **referência, não spec**
- Sem argumento: a entrevista começa pela cor

## Antes de qualquer ação

```
1. Ler .ai/context/tokens/color.md            (brand ≠ primary; danger ≠ critical)
2. Ler a seção "Sistema multi-marca" em .claude/rules/ds-standards.md
3. ls tokens/brands/   → a marca já existe? (Regra 1)
4. pipeline-state.md   → há tarefa PAUSADA na área de tokens?
```

## O gate é obrigatório

Marca nova = token novo → **Regra 4** do CLAUDE.md. Apresentar e aguardar "sim" antes
de escrever qualquer arquivo. O gate leva a rampa, a **tabela de medições de
contraste** e a **Assumption central**.

## Não confundir

| Pedido | Vai pra |
|---|---|
| mudar a cor brand do DS (a `default`) | `/ds-add-token` |
| ajustar cor de marca existente | editar `tokens/brands/<id>/semantic/*.ts` + `npm run tokens:brand:<id>` + Fase 5 |
| trocar de marca em runtime num app | `useBrand` (doc em `#/themes`) |
| publicar a marca no npm/registry | `/ds-release` |

## Out of scope

- `registry:build`, bump, `npm publish`, bump do CLI → `/ds-release`
- Merge do PR → mantenedor (L-020/L-041)

## Handoff final

`BRAND_PR: <id> — <URL do PR>` + o que falta registrar no `/ds-release`.
