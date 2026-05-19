---
name: ds-add-token
description: >
  Adicionar ou modificar token no DS.
  Entry point com verificações obrigatórias.
  Quem especifica: DS Designer. Quem implementa: DS Dev.
---

# Adicionar token — iGreen DS

## Fluxo correto

```
Token novo sempre passa pelo pipeline:
DS Designer especifica → [GATE] → DS Dev implementa → DS Reviewer valida

NÃO pular o DS Designer para ir direto ao DS Dev.
```

## ⛔ Verificações antes de qualquer ação

```
1. Qual a intenção semântica do token necessário?
2. Abrir o arquivo semântico correspondente
3. Existe token com valor ou intenção similar?
   Sim → USAR o existente. Não criar.
   Não → prosseguir com DS Designer para especificar
```

**Exemplos de tokens que NÃO devem ser criados:**
```
❌ bg.primary-custom   → já existe bg.primary
❌ gap.content-md      → já existe gap.md (gap-gp-md)
❌ radius.button-base  → já existe radius.base (rounded-radius-base)
```

## Passo 1 — DS Designer especifica

Carregar `.claude/skills/ds-designer/spec-token.md` com argumento `tipo`:
- Cor → `spec-token.md` (tipo=color)
- Spacing → `spec-token.md` (tipo=spacing)
- Sizing → `spec-token.md` (tipo=sizing)
- Radius → `spec-token.md` (tipo=radius)
- Shadow → `spec-token.md` (tipo=shadow)
- Tipografia → `spec-token.md` (tipo=typography)

A spec deve incluir **obrigatoriamente** a perspectiva Strategist:
```
- Alternativas descartadas: [por que nenhum token existente serve]
- Assumption central: [o que precisa ser verdade para este token funcionar]
```

Output: diff do arquivo semântico em markdown + perspectiva Strategist
Sinal: `SPEC_PRONTA: token [nome] — aguardando aprovação`

## Passo 2 — Gate: aprovação do usuário

Orchestrator apresenta a spec com perspectiva Strategist.
Aguardar "sim" antes de acionar DS Dev.
Registrar entrada PAUSADO (gate) no pipeline-state.md com campo `Assumption central`.

## Passo 3 — DS Dev implementa

Carregar `.claude/skills/ds-dev/impl-token.md`:
- Arquivos semânticos por tipo
- Templates de implementação
- `npm run tokens:tw4` obrigatório ao final

## Passo 4 — DS Reviewer valida

Carregar `.claude/skills/ds-reviewer/SKILL.md` → checklist token + critique genuína.
O reviewer verifica se a assumption central do gate ainda é válida após a implementação.

## Handoff final

`REVIEW_OK: token [nome] ✅`
