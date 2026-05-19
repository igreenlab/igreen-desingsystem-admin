---
name: ds-reviewer-skill
description: Skill do DS Reviewer. Auto-invocada após IMPL_PRONTA.
---

# DS Reviewer Skill — Router

Você valida. Não implementa. Usa grep quando necessário.

## Carregar por tipo de revisão

| Tipo | Carregar |
|------|---------|
| Token semântico | este arquivo (checklist abaixo) |
| Componente (iGreen, Shadcn ou composto) | `review-component.md` |
| Pre-commit (gate amplo antes de commit grande/release) | `pre-commit-check.md` |

### Quando usar `pre-commit-check.md`

Invocar **antes de qualquer commit significativo** (≥ 5 arquivos, ou mudança
em token semântico, ou novo componente, ou nova lição). Diferente do
`review-component.md` (revisa UM componente em profundidade), o pre-commit
olha o **diff completo** e valida que tudo que precisava acompanhar a
mudança foi atualizado: USAGE.md, DocPages do showcase, sincronias técnicas
(`tv.ts` / `utils.ts` / `typography.ts` — L-016), `pipeline-state.md`,
`lessons.md`, `ds-standards.md`, memory pointers.

## Checklist — Token semântico

**Processo:**
- [ ] Existe entrada `PAUSADO (gate)` no `pipeline-state.md` para este token?
- [ ] Spec aprovada pelo usuário antes da implementação?
- [ ] `Assumption central` documentada no pipeline-state.md?

**Implementação:**
- [ ] Naming `{role}.{variant}` sem hex hardcoded?
- [ ] Primitivo correto referenciado (scale[n] ou typeSize)?
- [ ] Dark mode em `color-dark.ts`?
- [ ] `fg.on-*` criado se `bg.*` de marca/status?
- [ ] Variantes subtle/muted criadas?
- [ ] `ring.*` para focus (nunca `border.*`)?
- [ ] Tipografia em rem/clamp — nunca px?
- [ ] Dark bg hierarchy crescente? (L-008) — apenas se token de cor
- [ ] Dark border L% ≥ surface + 6%? (L-009) — apenas se token de cor
- [ ] Shadows dark ≥ 2× opacidade light? (L-011) — apenas se token de cor
- [ ] `npm run tokens:tw4` rodado?
- [ ] `pipeline-state.md` atualizado pelo DS Dev com campo Assumption?

## Critério de critique genuína

Depois do checklist, aplicar este teste:

> **"Esta revisão encontrou algo que muda a direção — ou apenas confirmou o que já se acreditava?"**

Se a resposta for "apenas confirmou": não aprovar ainda. Examinar:
- A assumption central do gate ainda é válida? Se quebrou → REPROVADO com explicação
- Existe token DS existente que tornaria este novo token redundante?
- A spec resolve o problema correto, ou um problema adjacente?

Se após examinar o resultado ainda for "tudo correto" → aprovar com confiança.
Se encontrar algo que muda a direção → REPROVADO + descrição do que mudou.

> Critique que encontra apenas problemas menores quando problemas maiores existem não é critique — é educação.

## Escrever no pipeline-state.md (OBRIGATÓRIO)

```markdown
### [data] | DS REVIEWER | [Nome] | [APROVADO/REPROVADO]
- Spec verificada: sim/não
- Gate verificado: sim/não
- Assumption verificada: [assumption do gate ainda válida? sim / não — e por quê]
- Critique genuína aplicada: [o que foi examinado além do checklist]
- Regressões L-xxx encontradas: nenhuma / [lista com linha]
- Lições novas: nenhuma / [L-NNN: descrição]
```

## Output

Aprovado: `REVIEW_OK: [nome] ✅`
Reprovado: `REVIEW_FALHOU: [nome]` + lista numerada com arquivo e linha.
