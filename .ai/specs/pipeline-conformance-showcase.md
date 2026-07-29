# Conformance arquitetural + registro de showcase

Spec da 2ª rodada de governança do pipeline. Continua de
[`pipeline-governance-ci.md`](pipeline-governance-ci.md), que fechou as Camadas 1
e 2 (proteção da `main` + gate determinístico de token). Não substitui `CLAUDE.md`
nem `.claude/rules/ds-standards.md`.

> **Objetivo**: garantir que **entrega de componente seja completa** — não só o
> token certo, mas o componente no lugar certo e registrado onde precisa. E que o
> pipeline faça isso **ajudando antes de bloquear**: quem usa o fluxo nunca deve
> ver o check disparar, porque a skill já entregou completo.

---

## 1. Estado medido (2026-07-29)

Números levantados antes de desenhar. Eles são a razão do escopo ser o que é —
e são re-verificáveis.

### Estrutura de arquivos dos componentes `ui/`

| Métrica | Valor |
|---|---|
| Componentes com `USAGE.md` | **42** |
| Com `.types.ts` separado | **35** (7 sem: Chip, Modal, Chart, Toast, CardCheckbox, DatePicker, TabelaTeste) |
| Com pasta `hooks/` | **6** (DataTable, TableToolbar, Kanban, List, DataList) |

**Decisão do mantenedor:** os 7 sem `.types.ts` são **exceção legítima** —
componente simples pode ter tipos inline. E `hooks/` só existe onde há hook, em 6
de 42. Portanto **"sempre 5 arquivos + hooks separados" NÃO é o padrão real** —
exigi-lo reprovaria 7 componentes existentes e pediria pasta de hooks em
componente sem hook.

### Hipótese descartada: "tipo público mora no `.types.ts`"

Tentei derivar um critério mecânico pra "deveria ter `.types.ts`". **Falsificado
pelos dados**: exportar tipo do `.tsx` é generalizado, inclusive em componentes
que **têm** `.types.ts` —

- `TableToolbar/table-toolbar.tsx:30` exporta `TableToolbarProps`, e existe `table-toolbar.types.ts`
- `FormField/form-field.tsx:12` exporta `FormFieldProps`, e existe `form-field.types.ts`
- `DataTable/parts/*.tsx` exportam dezenas de tipos, e existe `data-table.types.ts`

A convenção real é: **tipo compartilhado grande vai pro `.types.ts`; tipo de
sub-parte mora junto da sub-parte.** É boa arquitetura, mas é **julgamento** — não
há critério mecânico honesto. Consequência de design: organização de tipos vai
pro revisor (§5), não pro CI.

### Tailwind literal em `.tsx` (o furo do gate atual)

O `GLOB` do `lint-styles.mjs` é `src/components/**/*styles.ts` — **arquivos `.tsx`
não são varridos**. Então isto passa limpo por todos os checks hoje:

```tsx
<div className="flex gap-4 h-10 rounded-lg">
```

| Escopo | Violações medidas |
|---|---|
| `src/components/ui/**/*.tsx` | **1** — `AppShell/user-menu.tsx:92` (`w-9 h-9 rounded-full`) |
| `src/components/shadcn/*.tsx` | **35** em 14 arquivos |

A única do `ui/` é **genuína** e é o **terceiro** caso do mesmo `w-9 h-9` que já
corrigimos 2× hoje (`MenuSidebar`, `SingleMenuSidebar`) — prova de que o furo
deixa passar violação real, não hipotética.

Os 35 do `shadcn/` **não exigem decisão de política agora**: o ratchet congela
débito pré-existente e só reprova linha adicionada.

### `ComponentsOverview` está incompleto

| Métrica | Valor |
|---|---|
| Entradas em `ComponentsOverviewDoc.tsx` | **70** |
| Componentes existentes (`ui/` + `shadcn/`) | ~83 |
| Exemplos ausentes confirmados | `DatePicker`, `EmptyState` — ambos distribuídos e com Doc page |

⚠️ **E o overview NÃO consta na L-042** como superfície obrigatória. A lição lista
a superfície 4 como *"`<Nome>Doc` + `App.tsx` import/render/`DOC_PAGES` +
`doc-nav-data`"*. Exigi-lo seria **inventar requisito além do padrão
documentado**, e reprovar ~13 lacunas pré-existentes. → fica **advisory** (§5).

---

## 2. Escopo

**Entra:**
- **A** — o lint passa a ver `.tsx` (§3)
- **B** — check bloqueante de registro de showcase (§4)
- **C** — o não-mecanizável vira checklist explícito do revisor (§5)
- **D** — paridade entre skill, template e check (§6) ← *a parte que faz isso ajudar em vez de só barrar*

**Fica fora, com motivo:**

| Item | Por que não |
|---|---|
| Changelog / `updates-data.ts` por-PR | contraria a **Regra 8** — changelog consolida no `/ds-release` |
| Distribuição (registry / catálogo / npm) | **já coberta** pelo `distribution-debt.mjs` em toda PR, decisão testada em 2026-07-29 |
| `ComponentsOverview` bloqueante | não consta na L-042 + ~13 lacunas pré-existentes (§1) |
| Análise de AST pra "view burra" | a variação legítima medida em §1 garantiria falso-positivo. Seria repetir os 51 alarmes numa escala maior |
| Exigir `.types.ts` / `hooks/` sempre | não é o padrão real (§1) |

---

## 3. Peça A — o lint passa a ver `.tsx`

`scripts/lint-styles.mjs` ganha um segundo pathspec no `GLOB`
(`src/components/**/*.tsx` ao lado do `*styles.ts` atual). O `case` de
`.claude/hooks/ds-lint-styles.sh` abre junto — **se o hook seguir cego enquanto o
CI reprova, volta a divergência hook↔CI que a fonte única existe pra evitar.**

Nenhum pattern muda: eles casam string entre aspas, e `className="..."` é isso.

Inclui a correção do único hit real: `user-menu.tsx:92` → `size-comp-lg` (36px→36px,
zero mudança visual — mesma correção aplicada nos outros dois casos).

**Antes de ligar, re-medir.** O número esperado é 1 no `ui/` e 35 congelados no
`shadcn/`. Se divergir, investigar antes de afrouxar pattern.

---

## 4. Peça B — registro de showcase, bloqueante

**Decisão do mantenedor: bloqueia.** Determinístico, e o sintoma é grave — rota
abrindo **em branco** em produção (L-042).

### O que exige — exatamente a superfície 4 da L-042, nada inventado

Para **pasta de componente nova** em `src/components/ui/<Nome>/`:

1. `src/preview/pages/<Nome>Doc.tsx` existe
2. id kebab roteado em `src/App.tsx` — **as DUAS ocorrências**: dentro de
   `DOC_PAGES` **e** na cascata de render (`activePage === "<id>"`)
3. entrada em `src/preview/components/doc-nav-data.ts`

⚠️ **O item 2 exige verificar as duas ocorrências separadamente, não só "o id
aparece no arquivo".** O hook atual faz `grep -q "\"$KEBAB\"" App.tsx`, que passa
se o id estiver **só** no `DOC_PAGES` — e nesse caso a rota **ainda abre em
branco**, porque falta o render. Ou seja: a checagem mais óbvia deixaria passar
exatamente o defeito que a L-042 registra. Contar ocorrências ou casar os dois
padrões distintos, não um `grep` genérico.

**A mensagem lista só o que de fato falta** — se 2 dos 3 já estão lá, só o
terceiro aparece. O exemplo abaixo mostra os 3 por ilustração, não porque sejam
sempre reportados juntos.

### Como detecta "componente novo"

Pelo diff (`git diff --name-status`, arquivos `A` sob `src/components/ui/<Nome>/`)
— **não** sweep total. Assim não precisa semear lista de exceção com o passivo
atual; só pega o que a PR cria.

### Pré-requisito: unificar as listas de exceção

Hoje `distribution-debt.mjs` tem uma lista `IGNORE` (7 entradas: os 6 internos do
`example-chat` + `tabela-teste` + `table-toolbar`) e `ds-inventory-check.sh` **não
tem lista nenhuma**. **Já divergem** — é o mesmo defeito que a fonte única de
patterns resolveu. A lista sai pra um módulo compartilhado
(`scripts/lib/ds-exceptions.mjs`) consumido pelos três.

### PR em rascunho não trava

O check roda e anota, mas **só reprova em PR não-rascunho**
(`github.event.pull_request.draft`). Quem abre draft pra pedir opinião no meio do
caminho não é bloqueado — e ninguém escapa, porque draft não mergeia: pra mergear
tem que sair de rascunho, e aí o check vale.

### A mensagem — clareza é requisito, não enfeite

Sai como anotação na PR (mecanismo do §Camada 2 de `pipeline-governance-ci.md`):

```
✗ Componente novo `EmptyState` sem showcase registrado (L-042, superfície 4).
  A rota #/empty-state vai abrir EM BRANCO.

  Falta:
    • src/preview/pages/EmptyStateDoc.tsx        (não existe)
    • id "empty-state" em src/App.tsx            (está no DOC_PAGES, falta o render)
    • entrada em doc-nav-data.ts                 (href: "empty-state")

  NÃO precisa nesta PR: registry.json, catálogo do CLI, changelog —
  consolidam no /ds-release (Regra 8).

  Se o componente é interno de propósito (sem showcase), adicione em
  scripts/lib/ds-exceptions.mjs com o motivo.
```

Os dois últimos parágrafos são deliberados:
- o **"NÃO precisa nesta PR"** é o antídoto pra pessoa achar que tem que fazer
  tudo e ir mexer no registry — a colisão com a Regra 8 descoberta em 2026-07-29;
- o **caminho da exceção** evita que alguém fique preso sem saída quando o
  componente é interno de propósito.

---

## 5. Peça C — o que NÃO vira check

Vira checklist explícito em `.claude/skills/ds-reviewer/review-component.md`,
seção semântica:

- **View burra** — lógica visual mora no `.styles.ts`; o `.tsx` compõe e passa
  props. (O lint pega Tailwind literal no `.tsx`; *não* pega lógica visual
  disfarçada de código.)
- **Organização de tipos** — compartilhado grande → `.types.ts`; de sub-parte →
  junto da sub-parte. Julgamento, não regra (§1).
- **Hooks extraídos** quando a lógica com estado cresce — e só então.
- **`ComponentsOverview`** — advisory: o revisor sugere adicionar; não reprova.

Encaixa naturalmente porque o `review-component.md` foi reescrito em 2026-07-29
pra delegar o mecânico ao `lint-styles.mjs` e ficar só com o semântico.

---

## 6. Peça D — paridade skill / template / check

**Esta é a peça que faz o pipeline ajudar em vez de só barrar**, e é a que se
degrada primeiro se ninguém amarrar.

Um check que só bloqueia adiciona atrito. Pra virar suporte, a **prevenção vem
antes da detecção**:

| Superfície | Papel | Ação |
|---|---|---|
| `impl-igreen.md`, `impl-composite.md`, `impl-shadcn.md` | **previne** | incluir os 3 registros como parte do trabalho de implementação — quem cria componente pelo fluxo nunca vê o check disparar |
| `.github/pull_request_template.md` | **lembra** | listar **exatamente** os mesmos 3 itens |
| `CONTRIBUTING.md` | **explica** | idem |
| o check | **detecta** | rede de segurança pra quem não usou o fluxo |

**Requisito de consistência:** os quatro citam a mesma fonte (L-042, superfície
4) e a **mesma lista de 3 itens**. Se a skill mandar 4 coisas e o check exigir 3,
volta a divergência que a fonte única de patterns resolveu.

---

## 7. Riscos e assumptions

- **Assumption central:** detectar "componente novo" por pasta adicionada no diff
  é confiável. **Quebra** se alguém criar o componente numa PR e a Doc page em
  outra — a primeira reprova. Isso é o comportamento desejado, mas é deliberado e
  precisa estar na mensagem, senão parece bug.
- **Falso-negativo por convenção de nome:** o check depende de `<Nome>Doc.tsx` e
  id kebab. Quem fugir do padrão de nome passa batido. Erra pro lado seguro
  (deixa passar, não reprova errado) — aceitável.
- **`.tsx` tem mais variedade de string que `.styles.ts`.** Medido: 1 hit em 42
  componentes. Risco baixo, mas é o número a re-verificar antes de ligar (§3).
- **Risco de degradação da paridade (§6):** é o mais provável a médio prazo.
  Mitigação possível num follow-up: um teste que compara a lista de itens do
  check com a do template — hoje fica como disciplina, não como check.
- **Não medido:** quantos componentes `ui/` **existentes** não têm Doc page
  registrada. Não bloqueia esta spec (o check só olha o diff), mas se um dia
  virar sweep total, esse número precisa ser levantado primeiro.

---

## 8. Fora de escopo (YAGNI)

- Sweep total de registro de showcase (o diff cobre o objetivo sem precisar
  semear exceção).
- Exigir `ComponentsOverview` (§1 — não é a regra documentada e há ~13 lacunas).
- Análise de AST / heurística de "view burra".
- Preencher as ~13 lacunas do `ComponentsOverview` — item de backlog próprio, se
  quiserem que o overview seja completo.
- Teste automatizado de paridade entre skill/template/check (§7) — follow-up.
