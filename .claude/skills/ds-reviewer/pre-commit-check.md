---
name: pre-commit-check
description: >
  Gate amplo de pre-commit. Invocar antes de commit significativo
  (release, refactor amplo, mudança em token, novo componente).
  Mapeia escopo do diff e valida que USAGE.md, DocPages do showcase,
  sincronias técnicas (twMergeConfig, dark mode mirrors) e pipeline
  (lessons, pipeline-state, memory) acompanharam a mudança.
---

# DS Reviewer — Pre-commit check

> Auto-invocada antes de qualquer commit que toque token, componente,
> regra ou pipeline. Diferente do `review-component.md` (foco em UM
> componente), este checklist olha o **diff completo** do trabalho
> acumulado e verifica que TUDO que precisava acompanhar a mudança foi
> atualizado — código fonte, docs, USAGE, showcase, agentes, memória.

---

## Quando invocar

| Situação | Invocar? |
|---|:---:|
| Antes do commit final de uma release | ✅ obrigatório |
| Antes de commit que tocou ≥ 5 arquivos | ✅ obrigatório |
| Antes de commit que tocou `tokens/` ou `typography.ts` / `color-*.ts` | ✅ obrigatório |
| Antes de commit que criou componente novo em `src/components/ui/` | ✅ obrigatório |
| Antes de commit que adicionou lição em `lessons.md` | ✅ obrigatório |
| Commit pontual de bugfix em 1 arquivo `.styles.ts` | ⚪ opcional |
| Edit em DocPage isolada | ⚪ opcional |

Quando opcional: chamar se sentir que o impacto pode ser maior do que aparenta.

---

## Fluxo

```
1. Mapear escopo do diff (categorizar arquivos)
2. Rodar checklist por categoria
3. Reportar pendências (se houver) OU APROVADO
4. Bloquear commit se houver pendências críticas
```

---

## Passo 1 — Mapear escopo do diff

```bash
# Mudanças já staged + working tree
git diff --name-status HEAD 2>&1
```

Categorizar cada arquivo modificado em:

| Categoria | Glob / pattern |
|---|---|
| **Token semântico** | `tokens/brands/*/semantic/*.ts` |
| **Token primitivo** | `tokens/brands/*/primitives/*.ts` |
| **Transform** | `tokens/transforms/*.ts` |
| **CSS gerado** | `src/styles/theme/tailwind-theme.css` |
| **Tailwind-merge config** | `src/utils/tv.ts`, `src/lib/utils.ts` |
| **Componente UI iGreen** | `src/components/ui/<Nome>/*.styles.ts`, `*.tsx`, `USAGE.md` |
| **Componente shadcn** | `src/components/shadcn/*.tsx` |
| **DocPage do showcase** | `src/preview/pages/*Doc.tsx`, `*Showcase*.tsx` |
| **Pipeline / governance** | `.ai/audits/*`, `.ai/specs/*`, `.ai/status/*`, `.ai/context/*` |
| **Agente / skill / rule** | `.claude/agents/*`, `.claude/skills/**`, `.claude/rules/*`, `.claude/commands/*` |
| **Memory** | `<memory>/MEMORY.md`, `<memory>/*.md` |
| **Outros** | `README.md`, `package.json`, etc. |

Output esperado:

```
Escopo do diff:
  - Token semântico: typography.ts (1 arquivo)
  - Transform: to-tailwind-v4.ts (1)
  - CSS gerado: tailwind-theme.css (1)
  - Tailwind-merge config: tv.ts (1), utils.ts (1)
  - Componente UI iGreen: 18 arquivos em 12 pastas
  - Componente shadcn: 13 arquivos
  - DocPage do showcase: 47 arquivos
  - Pipeline / governance: 5 arquivos
  - Agente / skill / rule: 0 arquivos
  - Memory: 3 arquivos
```

---

## Passo 2 — Checklist por categoria

### 2.1 — Token semântico tocado (color, typography, spacing, etc)

- [ ] **CSS regenerado?** `npm run tokens:tw4` rodado? `src/styles/theme/tailwind-theme.css` presente no diff?
- [ ] **Light/Dark mirror?** Se `color-light.ts` mudou, `color-dark.ts` tem mudança equivalente?
- [ ] **DocPage do showcase atualizada?**
  - `typography.ts` mudou → `src/preview/pages/TypographyDoc.tsx` atualizada?
  - `color-light.ts` / `color-dark.ts` mudou → `src/preview/pages/ColorsDoc.tsx`?
  - `spacing.ts` mudou → `src/preview/pages/SpacingDoc.tsx`?
  - `shape.ts` / `elevation.ts` mudou → `ShapeDoc.tsx` / `ElevationDoc.tsx`?
  - `sizing.ts` mudou → `SizingDoc.tsx`?
- [ ] **`.ai/context/tokens/<tipo>.md` atualizado?** (contexto técnico que agentes carregam)
- [ ] **`pipeline-state.md` tem entry CONCLUÍDO?** com `Assumption` documentada?

### 2.2 — Tipografia especificamente (subcase crítico — L-016)

- [ ] Lista de presets em `src/utils/tv.ts > twMergeConfig` está **1:1** com `typography.ts`?
- [ ] Lista de presets em `src/lib/utils.ts > extendTailwindMerge` está **1:1** com `typography.ts`?

Comando rápido pra verificar:

```bash
# Extrair presets do typography.ts
grep -oE '"[a-z]+-[a-z0-9]+"' tokens/brands/default/semantic/typography.ts | sort -u

# Comparar com tv.ts
grep -oE '"[a-z]+-[a-z0-9]+"' src/utils/tv.ts | sort -u

# Devem ser idênticos
```

Se houver diff → REPROVADO. Adicionar/remover entries até bater.

### 2.3 — Componente UI iGreen tocado

Para cada `src/components/ui/<Nome>/` no diff:

- [ ] **`USAGE.md` existe** na pasta?
- [ ] Se o componente é novo → `USAGE.md` foi criado neste mesmo diff?
- [ ] Se props/variants mudaram → `USAGE.md` reflete a mudança?
- [ ] Se preset tipográfico mudou de nome → `USAGE.md` atualizado?
- [ ] **DocPage correspondente** existe e foi atualizada?
  - `src/components/ui/Button/` → `src/preview/pages/ButtonDoc.tsx`
  - `src/components/ui/Modal/` → `src/preview/pages/ModalDoc.tsx`
  - etc.
- [ ] **Inventory** (`.ai/context/components/inventory.md`) menciona o componente?
- [ ] Greps L-001..L-007 no styles.ts (ver `release.md` Passo 1.5)?

### 2.4 — Componente shadcn tocado

- [ ] Se importou util de classe → usa `cn()` de `src/lib/utils.ts`?
- [ ] Se usou preset tipográfico → o nome existe em `typography.ts` atual?
- [ ] DocPage correspondente (`InputDoc.tsx`, `SelectDoc.tsx`, etc) reflete a mudança?
- [ ] Comentários do componente mencionam apenas presets que ainda existem (não legados)?

### 2.5 — Nova lição em `lessons.md`

Se foi adicionada L-NNN nova:

- [ ] **Resumo 1-linha** adicionado em `.claude/rules/ds-standards.md` (seção "Lições — resumo")?
- [ ] **Contador "N Lições — resumo"** no título da seção atualizado?
- [ ] **`memory/igreen_lessons_summary.md`** atualizado com a nova entry?
- [ ] Próxima numeração L-NNN+1 mencionada como next em "Como adicionar nova lição"?

### 2.6 — Agente / skill / rule modificado

- [ ] Skill nova → registrada no router (`<agent>/SKILL.md`)?
- [ ] Rule auto-load mudou glob → `settings.json` consistente?
- [ ] Command novo → existe em `.claude/commands/<nome>.md`?
- [ ] CLAUDE.md raiz menciona o novo entry point (se aplicável)?

### 2.7 — Pipeline / memory

- [ ] **`pipeline-state.md`** tem entry CONCLUÍDO da tarefa atual com:
  - Data + Agente + Tarefa + STATUS
  - Input + Output
  - Decisões
  - **Assumption** (campo obrigatório — torna decisão reversível)
  - Lições novas
- [ ] **`memory/MEMORY.md`** tem pointer atualizado se trabalho é referenciável no futuro?
- [ ] **Audit antigo** marcado como histórico (se foi gerado audit novo)?

---

## Passo 3 — Output

### Se TODAS as checks OK

```
🟢 PRE-COMMIT APROVADO

Escopo: <resumo do escopo>
Validações: X/X passaram

✅ USAGE.md atualizado em todos os componentes UI tocados
✅ DocPages do showcase refletindo mudanças de tokens
✅ Sincronia twMergeConfig ↔ typography.ts (L-016)
✅ Pipeline-state.md com entry CONCLUÍDO
✅ Memory pointers atualizados

Pode prosseguir com commit.
```

### Se há pendências

```
🔴 PRE-COMMIT BLOQUEADO

Pendências encontradas:

[CRÍTICO]
  • src/utils/tv.ts não sincronizado com typography.ts (L-016)
    Presets em typography.ts mas ausentes em tv.ts: body-2xl, caption-md
    → Adicionar antes do commit

[ALTO]
  • src/components/ui/NewComponent/ existe mas USAGE.md ausente
    → Criar USAGE.md no mesmo commit

  • typography.ts mudou mas TypographyDoc.tsx não foi atualizada
    → Refletir as 6 roles novas + presets adicionados/removidos

[MÉDIO]
  • Lição L-016 adicionada em lessons.md mas resumo em ds-standards.md
    não foi atualizado
    → Adicionar entry 1-linha em "16 Lições — resumo"

[BAIXO]
  • Comentário em src/components/shadcn/label.tsx menciona preset legado
    `label-base` (já removido em Onda 14)
    → Atualizar comentário (não bloqueia mas é higiene)

Resolver pendências críticas + altas antes de prosseguir.
Médias/baixas podem ser commitadas em separado se preferir.
```

### Bloqueio vs aviso

| Severidade | Ação |
|---|---|
| **CRÍTICO** | Bloquear commit (sincronias técnicas que causam bug silencioso, ex: L-016) |
| **ALTO** | Bloquear commit (docs essenciais ausentes — USAGE/DocPage) |
| **MÉDIO** | Avisar, deixar usuário decidir (governance ainda alinhável) |
| **BAIXO** | Avisar como higiene, não bloquear |

---

## Comandos de varredura úteis

```bash
# Componentes UI tocados sem USAGE.md
for dir in $(git diff --name-only HEAD -- 'src/components/ui/' | xargs -n1 dirname | sort -u | grep -E '^src/components/ui/[^/]+$'); do
  if [ ! -f "$dir/USAGE.md" ]; then
    echo "FALTA: $dir/USAGE.md"
  fi
done

# DocPage existe para componente tocado?
for nome in $(git diff --name-only HEAD -- 'src/components/ui/' | xargs -n1 dirname | sort -u | grep -oE 'src/components/ui/[^/]+$' | xargs -n1 basename); do
  doc="src/preview/pages/${nome}Doc.tsx"
  if [ ! -f "$doc" ]; then
    echo "FALTA: $doc"
  fi
done

# Sincronia typography.ts ↔ tv.ts ↔ utils.ts
diff <(grep -oE '"[a-z]+-[a-z0-9]+"' tokens/brands/default/semantic/typography.ts | sort -u) \
     <(grep -oE '"[a-z]+-[a-z0-9]+"' src/utils/tv.ts | sort -u)

# Referencias a presets legados (paragraph/label/subheading) em código
grep -rE 'text-(paragraph|label|subheading)-(sm|md|lg|xl|xs|base|2xs)' src --include='*.ts' --include='*.tsx'
```

---

## Out of scope

- Não substitui `review-component.md` (revisão profunda de UM componente). Pre-commit-check é mais largo, menos profundo.
- Não substitui Passo 1.5 do `release.md` (greps L-001..L-007). Esse é específico pra release; pre-commit pode ser invocado fora de release.
- Não roda `tsc` / tests — o release skill (ou o usuário) faz isso depois.
- Não decide se commit deve ser único ou separado — apenas valida que TUDO que precisava acompanhar a mudança foi atualizado.

---

## Sinal de handoff

- **Aprovado:** `PRE_COMMIT_OK: <escopo>` → DS Dev pode prosseguir com commit
- **Bloqueado:** `PRE_COMMIT_BLOCKED: <N>pendências` + lista → DS Dev resolve antes de re-invocar
