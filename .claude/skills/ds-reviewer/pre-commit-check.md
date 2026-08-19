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

- [x] ~~Comparar na mão as listas de `src/utils/tv.ts` e `src/lib/utils.ts` com o `typography.ts`~~ →
      **agora é gate**: `scripts/lib/typography-merge-sync.mjs` (no `npm test`) confere os DOIS
      merges contra o **tema gerado** (a fonte que decide qual classe existe de fato) e reprova
      preset ausente **ou** entrada morta, apontando arquivo e nome. Não repita a comparação
      manual aqui — duas cópias da mesma regra divergem.
      ⚠️ Quando este item era manual, ele passou: o `cn()` ficou **23 de 27** presets (faltavam
      os 4 `stat-*`, o role de valor de KPI) e o defeito foi baked no template do CLI. Achado
      em 2026-08-14 ao escrever o gate.
- [ ] **Re-bake do CLI?** Se `src/lib/utils.ts`, `src/utils/tv.ts`, `src/lib/lucide-types.ts` ou `src/styles/theme/tailwind-theme.css` mudaram → rodar **`npm run cli:rebake`** (re-bakeia no `cli/templates/default/`) + **bump `cli/package.json`**. Senão projetos novos do CLI nascem com cn/tv/theme **defasados** vs registry. (O `doctor.mjs` do consumidor pega o drift contra o registry, mas o re-bake mata na origem — CRÍTICO, mesma raiz da L-016.)

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
- [ ] **Índice `shadcn/USAGE.md` — gotcha coberto?** Se o componente novo/editado tem
  setup obrigatório (`<Toaster/>`/`<Provider>` no root), dep extra (`vaul`/`embla`/…),
  receita flutuante (L-040), z-index (L-030) ou ring/acessibilidade fora do padrão →
  há **1 linha** correspondente em `src/components/shadcn/USAGE.md`?
  Se NÃO tem gotcha → **não exigir linha** (índice é só de pegadinhas; não inflar).
  ⛔ Reprovar se alguém criou `USAGE.md` por-arquivo dentro de `shadcn/<nome>/`.

### 2.5 — Nova lição em `lessons.md`

Se foi adicionada L-NNN nova:

- [ ] **Resumo 1-linha** adicionado em `.claude/rules/ds-standards.md` (seção "Lições — resumo")?
- [ ] **Contador "N Lições — resumo"** no título da seção atualizado?
- [ ] Entry completa em **`.ai/status/lessons.md`** (formato canônico L-NNN)?
      ⚠️ Este item citava um `memory/igreen_lessons_summary.md` que **nunca existiu** —
      referência morta removida em 2026-07-30. Lição tem **duas** superfícies e só duas:
      a entry completa no `lessons.md` e o resumo 1-linha no `ds-standards.md`. Não crie
      um terceiro resumo: três cópias da mesma lição divergem (foi o que aconteceu com o
      catálogo de componentes).
- [ ] Próxima numeração L-NNN+1 mencionada como next em "Como adicionar nova lição"?

### 2.6 — Agente / skill / rule modificado

- [ ] Skill nova → registrada no router (`<agent>/SKILL.md`)?
- [ ] Regra nova/alterada → está nos **DOIS** auto-carregados com o **mesmo número** (`CLAUDE.md` + `.claude/rules/ds-standards.md`)? Gate: `rules-parity`
- [ ] Skill nova → linha na tabela §Skills por tarefa **+** rota no `orchestrator.md` **+** command? Gate: `skills-routing`
- [ ] Agent alterado → rodou `npm run sync:agents` e commitou os `.mdc`? Gate: `cursor-mirror`
- [ ] Lição nova → entrada 1-linha no resumo do `ds-standards.md` + contagem do título? Gate: `lessons-index`

> A linha anterior aqui era *"Rule auto-load mudou glob → `settings.json` consistente?"* —
> **inexecutável**: o `settings.json` não tem nenhuma chave de rules/glob (só `permissions`,
> `hooks` e `outputStyle`), e o `globs:` do frontmatter era sintaxe do Cursor, inerte.
> Trocada pelos 4 checks acima, que **têm gate** e portanto reprovam de verdade.
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

### 2.8 — Registry / distribuição (quando componente ou token mudou)

O DS é distribuído via registry shadcn (`@igreen/*`, ver `.ai/specs/registry-distribution.md`).
Mudança em componente/token precisa refletir no registry, senão o consumidor recebe versão velha.

- [ ] **Componente NOVO coberto?** Se o diff adicionou `src/components/ui/<Novo>/` ou
  `src/components/shadcn/<novo>.tsx` → existe entrada correspondente em `registry.json`?
  Se não → **ALTO**: o componente não é distribuível. Gerar com
  `node scripts/registry-add-item.mjs <Componente>` (escaneia imports → registryDeps +
  deps + flag de import cross-dir), revisar e adicionar.
- [ ] **registry rebuildado?** Se tocou componente/token/`tailwind-theme.css` → o diff
  inclui `registry.json` (meta.stamp na versão nova) **e** `registry-app/app/registry-data.ts`
  (embed)? Senão → rodar `npm run registry:build` + `copy-registry` (Passo 6.2b do release).
- [ ] **Foundational → CLI rebake?** Se `src/lib/utils.ts` / `src/utils/tv.ts` /
  `src/lib/lucide-types.ts` / `tailwind-theme.css` mudaram → `npm run cli:rebake` rodou
  (`cli/templates/default/**` no diff) + `cli/package.json` bumpado? (já no 2.2, reforço aqui)
- [ ] **Componente novo no vocabulário do consumidor? (L-042)** Se o diff adicionou componente
  que entrou (ou entrará) no `registry.json` → ele consta em
  `cli/templates/default/_claude/rules/ds-components.md`, no grupo de tarefa a que serve, com o
  critério de escolha? Se NÃO → **ALTO**: a IA do consumidor não sabe que ele existe e compõe na
  unha. Adicionar ao vocabulário + bump `cli/package.json` + republicar CLI.
  (Gap real: Toast distribuído na v0.12.0 mas fora do catálogo até a CLI 0.13.7. O hook
  `ds-inventory-check` acusa "no registry mas fora do catálogo".)
- [ ] **Import cross-dir em componente distribuível?** Componente em `registry.json` que
  importa `../../shadcn/x` (relativo cross-dir) **quebra no copy-in** — tem que ser alias
  `@/components/shadcn/x`. Grep rápido:
  ```bash
  git diff --name-only HEAD -- 'src/components/**' | while read f; do grep -lE 'from "(\.\./)+shadcn/' "$f" 2>/dev/null; done
  ```

### 2.9 — Rodar os gates agregados (mais barato que reproduzir na mão)

Antes de aprovar, rode os 2 comandos abaixo — eles cobrem o que o checklist manual não alcança:

```bash
npm run release:check   # registry-check --ci + brand-check + distribution-debt --ci
                        # + examples-drift + npm audit (high)
npm test                # inclui runtime-base.test e orphan-utilities
```

O que cada gate pega, e **por que o checklist manual não pega**:

| Gate | Pega |
|---|---|
| `registry-check --ci` | item de registry com `files[].path` inexistente · import relativo pra `shadcn/` · embed fora de sync **por conteúdo** |
| `brand-check` | marca do catálogo faltando em qualquer das **10 superfícies** — 8 delas falham em silêncio |
| `distribution-debt --ci` | componente em `ui/` fora do registry **ou** fora do vocabulário do consumidor (L-042) |
| `examples-drift-check` | `src/examples/*` divergindo do showcase que ele copia (L-035) |
| `orphan-utilities` | `@utility` que um componente usa e que **não está no tema gerado** — era o buraco por onde o `outline-float` passou meses |
| `runtime-base.test` | as 7 peças de runtime ausentes do tema · cópia do CLI divergente · `globals.css` **redeclarando** alguma delas |
| `shadcn-vocab` | vocabulário da bridge (`bg-popover`, `ring-foreground`…) em componente/exemplo/showcase — só existe no `globals.css`/`index.css` e não viaja pros canais npm e submódulo · e cor da **paleta nativa** do Tailwind (`bg-red-500`), que renderiza mas fica fora do sistema de tokens |
| `dead-theme-classes` | classe de cor sem CSS var — em `src/` **e** nas docs/skills/kit que ensinam a IA. Foi por só olhar `src/` que 44 usos de V2 sobreviveram nas skills. Citação deliberada declara-se em `CITACOES` com motivo |

⚠️ **Mexeu em doc que ensina classe?** `npm test` já cobre classe INEXISTENTE. O que ele
**não** cobre é classe que existe com **valor errado** na doc (`radius.base` documentado
como 26px valendo 10px) — pra isso rode `npm run audit:token-docs` e trie a saída.

### 2.10 — Mexeu no transform de tokens?

Se o diff toca `tokens/transforms/to-tailwind-v4.ts`, não basta `npm run tokens:tw4`:

- [ ] `npm test` passa (`runtime-base.test` + `orphan-utilities` cobrem o transform)
- [ ] Se mexeu em `buildRuntimeBase` / `buildFloatingUtilities` / `buildScrollbarUtilities`:
      o `globals.css` **continua sem redeclarar** o que você mudou?
- [ ] `npm run cli:rebake` rodou (o template leva uma cópia do tema) **+ bump `cli/package.json`**?
- [ ] Marca nova ou token de cor? → `npm run brand:check` e, se for cor sobre superfície,
      `npm run brand:contrast`

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
    → Refletir as 7 roles + presets adicionados/removidos

[MÉDIO]
  • Lição L-016 adicionada em lessons.md mas resumo em ds-standards.md
    não foi atualizado
    → Adicionar entry 1-linha na seção "NN Lições (L-001 a L-NNN) — resumo" **e**
      atualizar a contagem do título (o gate `lessons-index` confere os dois)

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
- ~~Não roda `tsc` / tests~~ — **desatualizado**: a §2.9 manda rodar `npm test` e `npm run release:check`, que é onde vivem os gates de classe morta, vocabulário da bridge, runtime-base e vocabulário do consumidor. O que continua fora daqui é o `npx tsc --noEmit` (o release skill faz).
- Não decide se commit deve ser único ou separado — apenas valida que TUDO que precisava acompanhar a mudança foi atualizado.

---

## Sinal de handoff

- **Aprovado:** `PRE_COMMIT_OK: <escopo>` → DS Dev pode prosseguir com commit
- **Bloqueado:** `PRE_COMMIT_BLOCKED: <N>pendências` + lista → DS Dev resolve antes de re-invocar
