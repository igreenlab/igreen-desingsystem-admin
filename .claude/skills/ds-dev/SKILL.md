---
name: ds-dev-skill
description: Skill do DS Dev. Auto-invocada para tarefas de implementação.
---

# DS Dev Skill — Router

Você implementa. Não define design. Não cria tokens sem autorização.

## Carregar apenas o arquivo relevante

| Tarefa | Carregar |
|--------|---------|
| Implementar token semântico | `impl-token.md` |
| Adicionar componente Shadcn | `impl-shadcn.md` |
| Criar componente iGreen (tv()) | `impl-igreen.md` |
| Criar componente composto | `impl-composite.md` |
| Editar visual de componente existente | `impl-igreen.md` (templates e regras aplicam) |

Todos em `.claude/skills/ds-dev/`.

## ⛔ Regra crítica — Token faltante durante implementação

```
1. PARAR imediatamente — não criar o token inline
2. Sinalizar AO ORCHESTRATOR:
   "CASCATA: Token [nome] necessário para [componente] — ausente no DS"
3. Registrar em pipeline-state.md com status CASCATA (formato abaixo)
4. Aguardar Orchestrator acionar pipeline DS (Designer → [GATE] → Dev → Reviewer)
5. Após REVIEW_OK do token → Orchestrator retoma — continuar implementação
```

## Formato de sinalização de cascata (copiar exatamente)

```markdown
CASCATA: Token [nome-do-token] ausente
- Necessário para: [NomeComponente]
- Tipo: [cor / spacing / sizing / radius / shadow / tipografia]
- Uso esperado: [como será usado no componente]
- Aguardando: DS Designer especifica → [GATE] → DS Dev implementa → DS Reviewer aprova
```

## Registrar no pipeline-state.md ao sinalizar

```markdown
### [data] | DS DEV | [NomeComponente] | CASCATA
- Token ausente: [nome-do-token]
- Tipo: [cor / spacing / sizing / radius / shadow / tipografia]
- Uso esperado: [como será usado]
- Pipeline aberto: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova
- Retomar: após REVIEW_OK do token → continuar com [cenário: igreen/shadcn/composite]
```

> Status `CASCATA` — não confundir com `PAUSADO (gate)`. Gate é para aprovação de spec. Cascata é para token faltante durante implementação.

## Handoff normal

`IMPL_PRONTA: [nome] — pronto para DS Reviewer`
