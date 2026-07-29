# Conformance arquitetural + registro de showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> ⚠️ **Todos os blocos de comando são Bash** (tool Bash / Git Bash, não PowerShell).

**Goal:** Fazer o gate cobrir `.tsx` (hoje só vê `*styles.ts`) e reprovar componente novo sem showcase registrado — com a prevenção (skills, template, CONTRIBUTING) dizendo exatamente o mesmo que a detecção.

**Architecture:** Segue o padrão já estabelecido pelo gate de estilos: lógica pura em `scripts/lib/` (testável, zero I/O), casca de I/O em `scripts/*.mjs` (git, fs, console, exit code). A lista de exceção sai pra módulo compartilhado, resolvendo a divergência atual entre `distribution-debt.mjs` (tem lista) e `ds-inventory-check.sh` (não tem).

**Tech Stack:** Node ESM (`.mjs`, sem deps novas), vitest, bash (hook existente), GitHub Actions.

**Spec de origem:** [`.ai/specs/pipeline-conformance-showcase.md`](../specs/pipeline-conformance-showcase.md)

## Global Constraints

- Módulos em `scripts/lib/` são **puros**: sem `node:fs`, `node:child_process`, `console`, `process`. I/O só na casca CLI.
- **Zero duplicação de regra.** A tabela de patterns vive só em `ds-lint-patterns.mjs`; a lista de exceção só em `ds-exceptions.mjs`. Duplicar é o defeito que este design existe pra evitar.
- O check de showcase exige **exatamente a superfície 4 da L-042**: `<Nome>Doc.tsx` + id no `App.tsx` (**DOC_PAGES E render**) + entrada no `doc-nav-data.ts`. **Não** exigir `ComponentsOverview` (não consta na L-042 e há ~13 lacunas pré-existentes).
- O check de showcase **só reprova em PR não-rascunho**.
- Mensagem de erro precisa dizer: o que falta, que registry/catálogo/changelog **NÃO** vão nesta PR (Regra 8), e como declarar exceção.
- Anotações (`::error file=,line=::`) só quando `GITHUB_ACTIONS === "true"`.
- Prosa em **pt-BR**.

**Baseline a não quebrar:** `npx vitest run` → 4 arquivos, 59 passed + 4 todo. `node scripts/lint-styles.mjs --ratchet origin/main` → exit 0. `node scripts/distribution-debt.mjs` → exit 0.

---

## Contexto que o implementador precisa saber

**O furo que a Peça A fecha.** O `GLOB` do `lint-styles.mjs` é
`src/components/**/*styles.ts` — arquivos `.tsx` **não são varridos**. Então
`<div className="flex gap-4 h-10">` num componente passa limpo por todos os
checks. Medido com o módulo real: **3 violações** no `ui/` (todas em
`AppShell/user-menu.tsx`, linhas 92/102/123 — o mesmo container quadrado de 36px
já corrigido 2× hoje) e **27 em 10 arquivos** no `shadcn/`, que o ratchet congela.

**O furo que a Peça B fecha (L-042).** Componente com `<Nome>Doc.tsx` criada mas
não roteada faz a rota abrir **em branco**. O `ds-inventory-check.sh` já detecta
parte disso, mas só avisa localmente.

⚠️ **A armadilha do check de rota** — o id kebab aparece em **dois** lugares no
`App.tsx`, com formatos diferentes:

```js
// 1. dentro do array DOC_PAGES — string sozinha na linha
  "spinner",

// 2. na cascata de render
  {activePage === "spinner" && <SpinnerDoc />}
```

Um `grep` genérico pelo id **passa se estiver só no DOC_PAGES** — e nesse caso a
rota **ainda abre em branco**. Ou seja: a checagem mais óbvia deixa passar
exatamente o defeito que a L-042 registra. **Verifique as duas separadamente.**

📌 **3 requisitos, 4 checks.** Pra humano são 3 coisas (doc page · `App.tsx` ·
nav) — é assim que a L-042, o template e as skills falam. No código são **4
verificações**, porque `DOC_PAGES` e render falham de forma independente. As duas
contagens estão certas; não "corrija" uma pela outra.

**Por que a Peça D existe.** Check que só bloqueia adiciona atrito. Quem cria
componente pelo fluxo não deve nunca ver o check disparar — porque a skill já
entregou completo. Se a skill mandar 4 coisas e o check exigir 3, volta a
divergência que este design combate.

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `scripts/lib/ds-exceptions.mjs` | **Fonte única** da lista de componentes deliberadamente fora do registry/showcase | criar |
| `scripts/lib/ds-exceptions.test.mjs` | Garante que a lista tem os 8 nomes atuais e o formato certo | criar |
| `scripts/distribution-debt.mjs` | Passa a importar a lista em vez de ter a própria | modificar |
| `scripts/lib/ds-lint-patterns.mjs` | Sem mudança de pattern; só o docstring de escopo | modificar |
| `scripts/lint-styles.mjs` | `GLOB` ganha 2º pathspec (`.tsx`) | modificar |
| `.claude/hooks/ds-lint-styles.sh` | `case` abre pra `.tsx` | modificar |
| `src/components/ui/AppShell/user-menu.tsx` | 3 correções `size-9`/`w-9 h-9` → `size-comp-lg` | modificar |
| `scripts/lib/showcase-registration.mjs` | **Pura**: dado nome + conteúdos, diz o que falta | criar |
| `scripts/lib/showcase-registration.test.mjs` | Cobre o caso crítico (DOC_PAGES sem render) | criar |
| `scripts/showcase-check.mjs` | CLI: git diff → fs → chama a pura → anota → exit | criar |
| `.github/workflows/ci.yml` | +1 step (com guarda de rascunho) | modificar |
| `.claude/skills/ds-reviewer/review-component.md` | checklist arquitetural (Peça C) | modificar |
| `.claude/skills/ds-dev/impl-{igreen,composite,shadcn}.md` | os 3 registros como parte do trabalho (Peça D) | modificar |
| `.github/pull_request_template.md` · `CONTRIBUTING.md` | os **mesmos** 3 itens (Peça D) | modificar |
| `.ai/status/pipeline-state.md` | entrada de auditoria | modificar |

---

## Task 1: Lista de exceção compartilhada

Hoje `distribution-debt.mjs` tem uma lista `IGNORE` e `ds-inventory-check.sh` **não
tem lista nenhuma** — já divergem. O check da Task 3 precisa dessa lista, então
ela sai pra módulo compartilhado antes.

**Files:**
- Create: `scripts/lib/ds-exceptions.mjs`
- Test: `scripts/lib/ds-exceptions.test.mjs`
- Modify: `scripts/distribution-debt.mjs` (linhas ~31-41 e o uso em ~50)

**Interfaces:**
- Produces: `DS_EXCEPTIONS` — `Map<string, string>` de nome-kebab → motivo. E `isException(kebabName): boolean`.

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, expect, it } from "vitest";
import { DS_EXCEPTIONS, isException } from "./ds-exceptions.mjs";

/* Fonte única dos componentes deliberadamente fora do registry/showcase.
   Antes desta extração, distribution-debt.mjs tinha a lista e
   ds-inventory-check.sh não tinha nenhuma — já divergiam. */

describe("DS_EXCEPTIONS", () => {
  it("mantém as 8 exceções que já existiam no distribution-debt", () => {
    for (const name of [
      "tabela-teste",
      "table-toolbar",
      "conversation-list-item",
      "date-separator-chip",
      "message-ack",
      "message-bubble",
      "message-composer",
      "message-variables-picker",
    ]) {
      expect(isException(name), name).toBe(true);
    }
    expect(DS_EXCEPTIONS.size).toBe(8);
  });

  it("toda exceção carrega um motivo não-vazio — lista sem motivo apodrece", () => {
    for (const [name, motivo] of DS_EXCEPTIONS) {
      expect(motivo, name).toBeTruthy();
      expect(motivo.length, name).toBeGreaterThan(15);
    }
  });

  it("componente normal não é exceção", () => {
    expect(isException("button")).toBe(false);
    expect(isException("data-table")).toBe(false);
  });

  it("usa nome kebab, não PascalCase", () => {
    expect(isException("TabelaTeste")).toBe(false);
    expect(isException("tabela-teste")).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar pra confirmar que falha**

Run: `npx vitest run scripts/lib/ds-exceptions.test.mjs`
Expected: FAIL — não resolve o import

- [ ] **Step 3: Criar o módulo**

```js
/**
 * ds-exceptions — FONTE ÚNICA dos componentes de `src/components/ui/` que
 * deliberadamente NÃO vão pro registry nem pro showcase.
 *
 * Consumido por (nunca duplique a lista):
 *   - scripts/distribution-debt.mjs   → não cobra registry/catálogo
 *   - scripts/showcase-check.mjs      → não cobra Doc page nem rota
 *
 * Antes desta extração, `distribution-debt.mjs` tinha a lista e
 * `ds-inventory-check.sh` não tinha nenhuma — já divergiam sobre o que é
 * exceção deliberada. É o mesmo defeito que a fonte única de patterns resolveu.
 *
 * Chave = nome kebab (DataList → data-list). Valor = MOTIVO, obrigatório:
 * lista de exceção sem motivo apodrece, porque ninguém sabe se ainda vale.
 */

export const DS_EXCEPTIONS = new Map([
  ["tabela-teste", "página de teste interna — não é componente distribuível"],
  [
    "table-toolbar",
    "bundlado no item `data-table` do registry (acoplamento circular); chega no consumidor via igreen:add data-table",
  ],
  // Internos do example-chat — distribuídos junto do exemplo, não como itens
  // avulsos, e sem showcase próprio.
  ["conversation-list-item", "interno do example-chat — distribuído junto do exemplo"],
  ["date-separator-chip", "interno do example-chat — distribuído junto do exemplo"],
  ["message-ack", "interno do example-chat — distribuído junto do exemplo"],
  ["message-bubble", "interno do example-chat — distribuído junto do exemplo"],
  ["message-composer", "interno do example-chat — distribuído junto do exemplo"],
  ["message-variables-picker", "interno do example-chat — distribuído junto do exemplo"],
]);

/** @param {string} kebabName nome do componente em kebab-case */
export function isException(kebabName) {
  return DS_EXCEPTIONS.has(kebabName);
}
```

- [ ] **Step 4: Rodar pra confirmar que passa**

Run: `npx vitest run scripts/lib/ds-exceptions.test.mjs`
Expected: PASS

- [ ] **Step 5: `distribution-debt.mjs` passa a importar**

Em `scripts/distribution-debt.mjs`: remova o bloco `const IGNORE = new Set([...])`
inteiro (com os comentários dele), adicione `import { isException } from "./lib/ds-exceptions.mjs";`
junto dos outros imports, e troque o filtro `.filter((d) => !IGNORE.has(kebab(d)))`
por `.filter((d) => !isException(kebab(d)))`.

- [ ] **Step 6: Verificar que o comportamento não mudou**

Run: `node scripts/distribution-debt.mjs; echo "exit=$?"`
Expected: `exit=0` e `✓ todos no registry.json e no catálogo do CLI.` — **idêntico
a antes**. Se aparecer débito novo, a extração perdeu uma entrada.

- [ ] **Step 7: Suíte completa + commit**

Run: `npx vitest run` → 4 arquivos + o novo, sem regressão (era 59 passed + 4 todo)

```bash
git add scripts/lib/ds-exceptions.mjs scripts/lib/ds-exceptions.test.mjs scripts/distribution-debt.mjs
git commit -m "refactor(scripts): lista de excecao vira fonte unica compartilhada

distribution-debt.mjs tinha a lista e ds-inventory-check.sh nao tinha
nenhuma — ja divergiam sobre o que e excecao deliberada. Mesmo defeito
que a fonte unica de patterns resolveu. O check de showcase (proxima
task) precisa da mesma lista, entao ela sai antes.

Cada entrada agora carrega MOTIVO obrigatorio: lista de excecao sem
motivo apodrece, porque ninguem sabe depois se ainda vale."
```

---

## Task 2: O lint passa a ver `.tsx`

**Files:**
- Modify: `scripts/lint-styles.mjs` (o `const GLOB`, ~linha 28, e a chamada de `execFileSync`)
- Modify: `scripts/lib/ds-lint-patterns.mjs` (só o docstring de escopo)
- Modify: `.claude/hooks/ds-lint-styles.sh` (o `case` de filtro)
- Modify: `src/components/ui/AppShell/user-menu.tsx` (linhas 92, 102, 123)

- [ ] **Step 1: Confirmar o baseline antes de mexer**

```bash
node -e '
import("./scripts/lib/ds-lint-patterns.mjs").then(({scanLines})=>{
  const {globSync,readFileSync}=require("node:fs");
  for(const [l,p] of [["ui",".tsx em ui"],["shadcn",".tsx em shadcn"]]){}
  for(const [label,pat] of [["ui","src/components/ui/**/*.tsx"],["shadcn","src/components/shadcn/*.tsx"]]){
    let t=0,f=0;
    for(const file of globSync(pat)){
      const v=scanLines(readFileSync(file,"utf8").split(/\r?\n/).map((text,i)=>({n:i+1,text})));
      if(v.length){f++;t+=v.length}
    }
    console.log(`${label}: ${t} violacao(oes) em ${f} arquivo(s)`);
  }
});'
```
Expected: `ui: 3 violacao(oes) em 1 arquivo(s)` e `shadcn: 27 violacao(oes) em 10 arquivo(s)`.
**Se divergir, PARE e reporte** — os números do plano viriam de outra árvore.

- [ ] **Step 2: `GLOB` ganha o 2º pathspec**

Em `scripts/lint-styles.mjs`, troque a constante e a chamada do git. Antes:

```js
const GLOB = "src/components/**/*styles.ts";
```

Depois:

```js
// Escopo: styles de componente E os próprios componentes.
//
// `*.tsx` entrou porque o gate só olhava `*styles.ts` — então Tailwind literal
// escrito direto no componente (`<div className="flex gap-4">`) passava limpo,
// que é o erro mais provável de quem não conhece o padrão. Medido antes de
// ligar: 3 violações reais no `ui/` (todas o mesmo container de 36px) e 27 no
// `shadcn/`, congeladas pelo ratchet.
//
// `src/examples/**` e `src/preview/**` seguem FORA de propósito — são
// cópias/demos, não a fonte do DS.
const GLOB = ["src/components/**/*styles.ts", "src/components/**/*.tsx"];
```

E na chamada do git (dentro de `modeRatchet`), troque `"--", GLOB` por
`"--", ...GLOB` — `git diff` aceita múltiplos pathspecs.

- [ ] **Step 3: O hook local abre junto**

Em `.claude/hooks/ds-lint-styles.sh`, o `case` que filtra os arquivos hoje aceita
só `*styles.ts`/`*styles.tsx`. Adicione o padrão de componente:

```bash
case "$FILE" in
  *src/components/*styles.ts|*src/components/*styles.tsx|*src/components/*.tsx) : ;;
  *) exit 0 ;;
esac
```

⚠️ **Isto não é opcional.** Se o hook seguir cego enquanto o CI reprova, volta a
divergência hook↔CI que a fonte única existe pra evitar — o dev veria o erro só
na PR, quando o hook poderia ter avisado no momento da edição.

- [ ] **Step 4: Corrigir as 3 violações reais**

Em `src/components/ui/AppShell/user-menu.tsx`, os 3 são o mesmo container
quadrado de 36px (`comp.lg`), a mesma correção já aplicada em `MenuSidebar` e
`SingleMenuSidebar` hoje:

| Linha | De | Para |
|---|---|---|
| 92 | `"grid place-items-center w-9 h-9 rounded-full shrink-0"` | `"grid place-items-center size-comp-lg rounded-full shrink-0"` |
| 102 | `<Avatar className="size-9">` | `<Avatar className="size-comp-lg">` |
| 123 | `className="size-9 shrink-0"` | `className="size-comp-lg shrink-0"` |

**Mantenha `rounded-full`** — não é violação (idêntico ao token DS). 36px→36px em
todos, zero mudança visual.

- [ ] **Step 5: Verificar que o `ui/` ficou limpo**

Rode o mesmo script do Step 1.
Expected: `ui: 0 violacao(oes) em 0 arquivo(s)` · `shadcn: 27 violacao(oes) em 10 arquivo(s)`

E o sweep dos styles segue em zero:
```bash
node scripts/lint-styles.mjs --file src/components/ui/AppShell/user-menu.tsx; echo "exit=$?"
```
Expected: `exit=0`, sem violação impressa.

- [ ] **Step 6: Verificar que o hook enxerga `.tsx`**

```bash
echo '{"tool_input":{"file_path":"src/components/shadcn/menubar.tsx"}}' \
  | bash .claude/hooks/ds-lint-styles.sh; echo "exit=$?"
```
Expected: `exit=0` **com** aviso em stderr (menubar tem 6 hits pré-existentes) —
prova que o hook agora varre `.tsx`. O `exit=0` prova que segue não-bloqueante.

- [ ] **Step 7: Ratchet e suíte**

```bash
node scripts/lint-styles.mjs --ratchet origin/main; echo "ratchet=$?"
npx vitest run
```
Expected: `ratchet=0` (as linhas que você alterou no `user-menu.tsx` estão
limpas) e suíte sem regressão.

- [ ] **Step 8: Commit**

```bash
git add scripts/lint-styles.mjs scripts/lib/ds-lint-patterns.mjs .claude/hooks/ds-lint-styles.sh src/components/ui/AppShell/user-menu.tsx
git commit -m "feat(lint): o gate passa a ver .tsx, nao so *styles.ts

O GLOB era src/components/**/*styles.ts, entao Tailwind literal escrito
direto no componente passava limpo por todos os checks — o erro mais
provavel de quem nao conhece o padrao. Medido antes de ligar: 3
violacoes reais no ui/ (todas o mesmo container de 36px, 3a/4a/5a
instancia do w-9 h-9 corrigido 2x hoje) e 27 no shadcn/, que o ratchet
congela.

O case do hook abre junto: hook cego + CI reprovando e a divergencia
hook<->CI que a fonte unica existe pra evitar."
```

---

## Task 3: Lógica pura do check de showcase

**Files:**
- Create: `scripts/lib/showcase-registration.mjs`
- Test: `scripts/lib/showcase-registration.test.mjs`

**Interfaces:**
- Consumes: `isException` de `./ds-exceptions.mjs` (Task 1)
- Produces: `toKebab(pascalName): string` e `checkRegistration({ name, docExists, appTsx, navData }): Array<{ id: string, what: string, fix: string }>` — array vazio = tudo registrado.

- [ ] **Step 1: Escrever o teste que falha — o caso crítico primeiro**

```js
import { describe, expect, it } from "vitest";
import { checkRegistration, toKebab } from "./showcase-registration.mjs";

/* Superfície 4 da L-042: componente novo precisa de Doc page + rota no App.tsx
   (DOC_PAGES **e** render) + entrada no doc-nav-data.
   Formatos reais no repo:
     DOC_PAGES →   "spinner",
     render    →   {activePage === "spinner" && <SpinnerDoc />}
     nav       →   { label: "Spinner", href: "spinner" }, */

const APP_COMPLETO = `
const DOC_PAGES = [
  "button",
  "empty-state",
];
{activePage === "button" && <ButtonDoc />}
{activePage === "empty-state" && <EmptyStateDoc />}
`;
const NAV_COMPLETO = `{ label: "Empty State", href: "empty-state" },`;

describe("checkRegistration", () => {
  it("tudo registrado → nenhuma pendência", () => {
    expect(
      checkRegistration({
        name: "EmptyState",
        docExists: true,
        appTsx: APP_COMPLETO,
        navData: NAV_COMPLETO,
      }),
    ).toEqual([]);
  });

  // ESTE é o caso que um grep genérico deixa passar — e é exatamente o defeito
  // que a L-042 registra: a rota abre EM BRANCO.
  it("id no DOC_PAGES mas SEM render → reprova (rota abre em branco)", () => {
    const appSemRender = `
const DOC_PAGES = [
  "empty-state",
];
{activePage === "button" && <ButtonDoc />}
`;
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: appSemRender,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("app-render");
    expect(faltas[0].what).toMatch(/render/i);
  });

  it("render presente mas SEM entrada no DOC_PAGES → reprova", () => {
    const appSemDocPages = `
const DOC_PAGES = [
  "button",
];
{activePage === "empty-state" && <EmptyStateDoc />}
`;
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: appSemDocPages,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("app-doc-pages");
  });

  it("Doc page ausente → reprova", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: false,
      appTsx: APP_COMPLETO,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("doc-page");
    expect(faltas[0].what).toContain("EmptyStateDoc.tsx");
  });

  it("nav ausente → reprova", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: APP_COMPLETO,
      navData: `{ label: "Button", href: "button" },`,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("nav");
  });

  // 3 REQUISITOS (doc page · App.tsx · nav) mas 4 CHECKS — o App.tsx conta
  // duas vezes, porque DOC_PAGES e render são falhas independentes.
  it("nada registrado → reporta os 4 checks, na ordem", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: false,
      appTsx: "",
      navData: "",
    });
    expect(faltas.map((f) => f.id)).toEqual(["doc-page", "app-doc-pages", "app-render", "nav"]);
  });

  it("componente na lista de exceção → nenhuma pendência, mesmo sem nada", () => {
    expect(
      checkRegistration({ name: "MessageBubble", docExists: false, appTsx: "", navData: "" }),
    ).toEqual([]);
  });

  it("toda pendência traz um `fix` acionável", () => {
    for (const f of checkRegistration({ name: "EmptyState", docExists: false, appTsx: "", navData: "" })) {
      expect(f.fix.length, f.id).toBeGreaterThan(10);
    }
  });

  it("não confunde id que é prefixo de outro", () => {
    // "chip" não deve casar com "chip-group"
    const app = `
const DOC_PAGES = [
  "chip-group",
];
{activePage === "chip-group" && <ChipGroupDoc />}
`;
    const faltas = checkRegistration({
      name: "Chip",
      docExists: true,
      appTsx: app,
      navData: `{ label: "Chip Group", href: "chip-group" },`,
    });
    expect(faltas.map((f) => f.id)).toEqual(["app-doc-pages", "app-render", "nav"]);
  });
});

describe("toKebab", () => {
  it("converte PascalCase", () => {
    expect(toKebab("EmptyState")).toBe("empty-state");
    expect(toKebab("DataTable")).toBe("data-table");
    expect(toKebab("Button")).toBe("button");
  });

  it("lida com sigla e dígito", () => {
    expect(toKebab("Kpi")).toBe("kpi");
    expect(toKebab("MonthYearPicker")).toBe("month-year-picker");
  });
});
```

- [ ] **Step 2: Rodar pra confirmar que falha**

Run: `npx vitest run scripts/lib/showcase-registration.test.mjs`
Expected: FAIL — não resolve o import

- [ ] **Step 3: Implementar o módulo**

```js
/**
 * showcase-registration — verifica a **superfície 4 da L-042** de um componente:
 * Doc page + rota no App.tsx + entrada na nav. Puro, zero I/O.
 *
 * Por que existe: componente com `<Nome>Doc.tsx` criada mas não roteada faz a
 * rota abrir **em branco** em produção. Já aconteceu (L-042).
 *
 * ⚠️ O id kebab aparece em DOIS lugares no App.tsx, com formatos diferentes:
 *     DOC_PAGES →   "spinner",                                  (string sozinha)
 *     render    →   {activePage === "spinner" && <SpinnerDoc />}
 * Um grep genérico pelo id passa se estiver só no DOC_PAGES — e a rota AINDA
 * abre em branco. Por isso os dois são checados separadamente.
 *
 * NÃO checa `ComponentsOverviewDoc`: não consta na L-042 como superfície
 * obrigatória e o arquivo tem ~13 lacunas pré-existentes. Fica advisory, no
 * checklist do revisor.
 */
import { isException } from "./ds-exceptions.mjs";

/** PascalCase → kebab (DataList → data-list). */
export function toKebab(pascalName) {
  return pascalName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Escapa o id pra uso literal em RegExp. */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @param {object} p
 * @param {string} p.name       nome PascalCase da pasta do componente
 * @param {boolean} p.docExists se src/preview/pages/<Nome>Doc.tsx existe
 * @param {string} p.appTsx     conteúdo de src/App.tsx
 * @param {string} p.navData    conteúdo de doc-nav-data.ts
 * @returns {Array<{id: string, what: string, fix: string}>} vazio = ok
 */
export function checkRegistration({ name, docExists, appTsx, navData }) {
  const id = toKebab(name);
  if (isException(id)) return [];

  const faltas = [];
  const eid = esc(id);

  if (!docExists) {
    faltas.push({
      id: "doc-page",
      what: `src/preview/pages/${name}Doc.tsx não existe`,
      fix: `criar a doc page do componente`,
    });
  }

  // DOC_PAGES: string sozinha na linha (`  "empty-state",`). Ancorado em ^/$ pra
  // não casar com a linha do render, que contém o mesmo id.
  if (!new RegExp(`^\\s*"${eid}",?\\s*$`, "m").test(appTsx)) {
    faltas.push({
      id: "app-doc-pages",
      what: `id "${id}" ausente do array DOC_PAGES em src/App.tsx`,
      fix: `adicionar "${id}", ao DOC_PAGES`,
    });
  }

  // render: a cascata de activePage.
  if (!new RegExp(`activePage === "${eid}"`).test(appTsx)) {
    faltas.push({
      id: "app-render",
      what: `id "${id}" sem branch de render em src/App.tsx — a rota #/${id} abre EM BRANCO`,
      fix: `adicionar {activePage === "${id}" && <${name}Doc />}`,
    });
  }

  if (!new RegExp(`href:\\s*"${eid}"`).test(navData)) {
    faltas.push({
      id: "nav",
      what: `sem entrada em doc-nav-data.ts`,
      fix: `adicionar { label: "...", href: "${id}" }`,
    });
  }

  return faltas;
}
```

- [ ] **Step 4: Rodar pra confirmar que passa**

Run: `npx vitest run scripts/lib/showcase-registration.test.mjs`
Expected: PASS (11 testes)

- [ ] **Step 5: Sanidade contra o repo real**

Um componente registrado deve dar zero; um sabidamente ausente do overview mas
com rota deve dar zero também (o overview não é checado):

```bash
node -e '
Promise.all([import("./scripts/lib/showcase-registration.mjs")]).then(([m])=>{
  const {readFileSync,existsSync}=require("node:fs");
  const app=readFileSync("src/App.tsx","utf8");
  const nav=readFileSync("src/preview/components/doc-nav-data.ts","utf8");
  for(const name of ["Spinner","EmptyState","DatePicker","Button"]){
    const r=m.checkRegistration({name,docExists:existsSync(`src/preview/pages/${name}Doc.tsx`),appTsx:app,navData:nav});
    console.log(`${name}: ${r.length===0?"OK":r.map(x=>x.id).join(", ")}`);
  }
});'
```
Expected: todos `OK`. Se algum acusar, é lacuna real do repo — **reporte, não
ajuste o módulo** (a Task 4 só olha componente novo, então não bloqueia nada).

- [ ] **Step 6: Suíte + commit**

```bash
npx vitest run
git add scripts/lib/showcase-registration.mjs scripts/lib/showcase-registration.test.mjs
git commit -m "feat(showcase): logica pura do check de registro (superficie 4 da L-042)

Componente com Doc page criada mas nao roteada faz a rota abrir EM
BRANCO em producao — ja aconteceu (L-042).

O ponto sutil: o id kebab aparece em DOIS lugares no App.tsx com
formatos diferentes (string no DOC_PAGES, e activePage === no render).
Um grep generico passa se estiver so no DOC_PAGES, e a rota AINDA abre
em branco — ou seja, a checagem obvia deixaria passar exatamente o
defeito que a licao registra. Os dois sao verificados separadamente, com
teste dedicado pro caso.

NAO checa ComponentsOverview: nao consta na L-042 e o arquivo tem ~13
lacunas pre-existentes."
```

---

## Task 4: CLI do check + wiring no CI

**Files:**
- Create: `scripts/showcase-check.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `checkRegistration`, `toKebab` (Task 3); `isException` indiretamente.

- [ ] **Step 1: Criar o CLI**

```js
#!/usr/bin/env node
/**
 * showcase-check — reprova PR que adiciona componente em `src/components/ui/`
 * sem o showcase registrado (superfície 4 da L-042).
 *
 * Detecta componente NOVO pelo diff (arquivos com status `A`), não por sweep
 * total — assim não precisa semear lista de exceção com o passivo atual.
 *
 * Uso: node scripts/showcase-check.mjs [base-ref]   (default origin/main)
 *
 * Não reprova em PR de rascunho: o wiring no ci.yml pula o step quando
 * `github.event.pull_request.draft` é true. Ninguém escapa — draft não mergeia.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { checkRegistration, toKebab } from "./lib/showcase-registration.mjs";

const base = process.argv[2] ?? "origin/main";
const IN_GHA = process.env.GITHUB_ACTIONS === "true";
const esc = (s) =>
  String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

function annotate(title, message) {
  if (!IN_GHA) return;
  console.log(`::error title=${esc(title)}::${esc(message)}`);
}

/** Nomes PascalCase de componentes cuja pasta é NOVA neste diff. */
function novosComponentes(baseRef) {
  const out = execFileSync(
    "git",
    ["diff", "--name-status", "--diff-filter=A", `${baseRef}...HEAD`, "--", "src/components/ui"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const nomes = new Set();
  for (const linha of out.split(/\r?\n/)) {
    const m = linha.match(/^A\s+src\/components\/ui\/([^/]+)\//);
    if (m) nomes.add(m[1]);
  }
  return [...nomes].sort();
}

let novos;
try {
  novos = novosComponentes(base);
} catch (err) {
  const msg =
    `showcase-check: não consegui diffar contra "${base}".` +
    ` No CI, garanta fetch-depth: 0 no actions/checkout;` +
    ` localmente, rode git fetch origin main.` +
    (err?.message ? ` Detalhe do git: ${err.message.trim()}` : "");
  console.error(`\n⚠️  ${msg}\n`);
  annotate("showcase-check não conseguiu rodar", msg);
  process.exit(1);
}

if (!novos.length) {
  console.log("\n✓ showcase-check: nenhum componente novo nesta PR.\n");
  process.exit(0);
}

const appTsx = readFileSync("src/App.tsx", "utf8");
const navData = readFileSync("src/preview/components/doc-nav-data.ts", "utf8");

let reprovados = 0;
for (const name of novos) {
  const faltas = checkRegistration({
    name,
    docExists: existsSync(`src/preview/pages/${name}Doc.tsx`),
    appTsx,
    navData,
  });
  if (!faltas.length) {
    console.log(`  ✓ ${name} — showcase registrado`);
    continue;
  }
  reprovados++;
  const id = toKebab(name);
  const linhas = [
    `Componente novo \`${name}\` sem showcase registrado (L-042, superfície 4).`,
    `A rota #/${id} vai abrir EM BRANCO.`,
    ``,
    `Falta:`,
    ...faltas.map((f) => `  • ${f.what}\n    → ${f.fix}`),
    ``,
    `NÃO precisa nesta PR: registry.json, catálogo do CLI, changelog —`,
    `consolidam no /ds-release (Regra 8).`,
    ``,
    `Se o componente é interno de propósito (sem showcase), adicione em`,
    `scripts/lib/ds-exceptions.mjs com o motivo.`,
  ];
  console.log(`\n✗ ${linhas.join("\n  ")}\n`);
  annotate(`Showcase não registrado: ${name}`, linhas.join(" "));
}

process.exit(reprovados > 0 ? 1 : 0);
```

- [ ] **Step 2: Verificar que passa quando não há componente novo**

Run: `node scripts/showcase-check.mjs origin/main; echo "exit=$?"`
Expected: `exit=0` com `nenhum componente novo nesta PR.` (esta branch não cria
componente)

- [ ] **Step 3: Verificar que reprova componente novo sem registro**

```bash
mkdir -p src/components/ui/ProbeWidget
printf 'export const x = 1;\n' > src/components/ui/ProbeWidget/index.ts
git add src/components/ui/ProbeWidget/index.ts
node scripts/showcase-check.mjs origin/main; echo "exit=$?"
```
Expected: `exit=1`, listando as **4** pendências de `ProbeWidget` (doc-page,
app-doc-pages, app-render, nav), com o parágrafo do "NÃO precisa nesta PR" e o
caminho da exceção.

- [ ] **Step 4: Verificar a saída de anotação e limpar**

```bash
GITHUB_ACTIONS=true node scripts/showcase-check.mjs origin/main 2>&1 | grep "::error"
git rm -f --cached src/components/ui/ProbeWidget/index.ts
rm -rf src/components/ui/ProbeWidget
git status --short   # deve estar limpo do probe
```
Expected: uma linha `::error title=Showcase não registrado: ProbeWidget::...`, e
depois árvore limpa. **Se o probe sobrar, PARE e limpe antes de seguir.**

- [ ] **Step 5: Wiring no `ci.yml` com guarda de rascunho**

Adicione ao fim dos steps do job `check`:

```yaml
      # Só reprova em PR não-rascunho: quem abre draft pra pedir opinião no meio
      # do caminho não é bloqueado. Ninguém escapa — draft não mergeia, então
      # pra mergear tem que sair de rascunho e aí o check vale.
      - name: Showcase registrado (L-042 superfície 4)
        if: github.event.pull_request.draft != true
        run: node scripts/showcase-check.mjs origin/${{ github.base_ref || 'main' }}
```

- [ ] **Step 6: Verificar YAML e rodar tudo**

```bash
grep -n "showcase-check\|draft" .github/workflows/ci.yml
npx vitest run
node scripts/lint-styles.mjs --ratchet origin/main; echo "ratchet=$?"
node scripts/distribution-debt.mjs >/dev/null; echo "debt=$?"
git status --short
```
Expected: o step presente com a guarda de draft; suíte verde; `ratchet=0`;
`debt=0`; árvore limpa.

- [ ] **Step 7: Commit**

```bash
git add scripts/showcase-check.mjs .github/workflows/ci.yml
git commit -m "feat(ci): reprova componente novo sem showcase registrado

Fecha o furo da L-042: Doc page criada mas nao roteada faz a rota abrir
em branco em producao. Detecta componente novo pelo diff (--diff-filter=A),
nao por sweep total, entao nao precisa semear excecao com o passivo atual.

Nao reprova em PR de rascunho — quem abre draft pra pedir opiniao no meio
do caminho nao e bloqueado, e ninguem escapa porque draft nao mergeia.

A mensagem diz o que falta, que registry/catalogo/changelog NAO vao nesta
PR (Regra 8) e como declarar excecao — os tres pontos onde a pessoa
travaria sem saida."
```

---

## Task 5: Prevenção — skills, template e CONTRIBUTING dizendo o mesmo

Esta é a task que faz o pipeline **ajudar** em vez de só barrar. Quem cria
componente pelo fluxo não deve nunca ver o check da Task 4 disparar.

**Files:**
- Modify: `.claude/skills/ds-dev/impl-igreen.md`, `impl-composite.md`, `impl-shadcn.md`
- Modify: `.claude/skills/ds-reviewer/review-component.md`
- Modify: `.github/pull_request_template.md`
- Modify: `CONTRIBUTING.md`

- [ ] **Step 1: Ler os 3 `impl-*.md` e achar onde entra**

Run: `grep -n "USAGE.md\|inventory\|showcase\|DOC_PAGES" .claude/skills/ds-dev/impl-igreen.md .claude/skills/ds-dev/impl-composite.md .claude/skills/ds-dev/impl-shadcn.md`

Você precisa saber se já existe seção de "superfícies" pra estender, ou se cria
uma nova. Não duplique se já houver.

- [ ] **Step 2: Nos 3 `impl-*.md`, incluir os 3 registros como parte do trabalho**

Cada um ganha (ou tem estendida) uma seção de encerramento com **exatamente estes
3 itens**, na mesma ordem e com os mesmos nomes de arquivo que o check verifica:

```markdown
## Antes de considerar pronto — showcase (L-042, superfície 4)

Sem os três, a rota abre **em branco**. O CI reprova (`showcase-check`).

1. `src/preview/pages/<Nome>Doc.tsx` — a doc page
2. `src/App.tsx` — **duas** edições: `"<id-kebab>",` no array `DOC_PAGES` **e**
   `{activePage === "<id-kebab>" && <<Nome>Doc />}` na cascata de render
3. `src/preview/components/doc-nav-data.ts` — `{ label: "...", href: "<id-kebab>" }`

**Não** faz parte desta entrega: `registry.json`, catálogo do CLI e changelog —
consolidam no `/ds-release` (Regra 8). Anote no corpo da PR o que ficou pendente.

Componente interno de propósito (sem showcase) → declare em
`scripts/lib/ds-exceptions.mjs` com o motivo.
```

- [ ] **Step 3: No `review-component.md`, adicionar o checklist arquitetural (Peça C)**

Na seção semântica (a que sobrou depois de o mecânico ir pro `lint-styles.mjs`),
adicione — deixando claro que é **julgamento, não regra mecânica**:

```markdown
### Arquitetura — julgamento, não grep

O lint pega Tailwind literal; estes exigem ler o código:

- **View burra** — lógica visual mora no `.styles.ts`; o `.tsx` compõe e passa
  props. Lógica visual disfarçada de código (ternário montando classe, cálculo de
  estilo inline) não é pega por lint nenhum.
- **Organização de tipos** — tipo compartilhado grande → `.types.ts`; tipo de
  sub-parte → junto da sub-parte. **Não exija `.types.ts` sempre**: 7 dos 42
  componentes têm tipos inline por serem simples, e isso é exceção legítima
  (medido em 2026-07-29, ver `.ai/specs/pipeline-conformance-showcase.md` §1).
- **Hooks extraídos** quando a lógica com estado cresce — e só então. `hooks/`
  existe em 6 de 42 componentes; exigir sempre seria errado.
- **`ComponentsOverviewDoc`** — *advisory*: sugira adicionar, não reprove. Não
  consta na L-042 e o arquivo tem ~13 lacunas pré-existentes.
```

- [ ] **Step 4: Template de PR e CONTRIBUTING — os MESMOS 3 itens**

No `.github/pull_request_template.md`, na seção de componente novo, o item de
showcase deve listar as 3 coisas com os mesmos nomes de arquivo. No
`CONTRIBUTING.md`, idem, na seção "Componente novo".

⚠️ **Requisito de paridade:** os quatro textos (3 skills + template +
CONTRIBUTING) e o check citam **a mesma lista de 3**, com os mesmos caminhos. Se
divergirem, volta o defeito que a fonte única resolveu.

- [ ] **Step 5: Verificar a paridade você mesmo**

```bash
grep -c "doc-nav-data" .claude/skills/ds-dev/impl-igreen.md .claude/skills/ds-dev/impl-composite.md .claude/skills/ds-dev/impl-shadcn.md .github/pull_request_template.md CONTRIBUTING.md
grep -rn "ComponentsOverview" .claude/skills/ds-dev/impl-*.md || echo "  ok — nenhum impl-* exige o overview"
```
Expected: cada arquivo cita `doc-nav-data` ao menos 1×; e **nenhum** `impl-*.md`
exige `ComponentsOverview` (seria requisito além da L-042).

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/ds-dev/impl-igreen.md .claude/skills/ds-dev/impl-composite.md .claude/skills/ds-dev/impl-shadcn.md .claude/skills/ds-reviewer/review-component.md .github/pull_request_template.md CONTRIBUTING.md
git commit -m "docs: prevencao alinhada com o check de showcase

Check que so bloqueia adiciona atrito. As 3 skills de implementacao
passam a incluir os 3 registros como parte do trabalho — quem cria
componente pelo fluxo nunca ve o check disparar. Template e CONTRIBUTING
listam os MESMOS 3 itens, com os mesmos caminhos: se a skill mandar 4 e o
check exigir 3, volta a divergencia que a fonte unica resolveu.

O review-component.md ganha o checklist arquitetural como JULGAMENTO
explicito, nao regra: 7 dos 42 componentes tem tipos inline e hooks/
existe em 6 — exigir sempre seria errado (medido, spec §1)."
```

---

## Task 6: Auditoria e handoff

- [ ] **Step 1: Rodar tudo**

```bash
npx vitest run
npx tsc --noEmit; echo "tsc=$?"
node scripts/lint-styles.mjs --ratchet origin/main; echo "ratchet=$?"
node scripts/showcase-check.mjs origin/main; echo "showcase=$?"
node scripts/distribution-debt.mjs >/dev/null; echo "debt=$?"
```
Expected: suíte verde; `ratchet=0`; `showcase=0`; `debt=0`.

Sobre o `tsc`: se der 7 erros `TS2307` em `src/components/ui/ChoroplethMap/`, é
`node_modules` local desatualizado (deps estão no `package.json` e no lock) — **não
é regressão desta branch**. Um `npm install` resolve. Reporte o que observou.

- [ ] **Step 2: Entrada de auditoria**

Em `.ai/status/pipeline-state.md`, entrada `CONCLUÍDO` no topo do log, formato
canônico (o do arquivo), incluindo:
- o furo fechado (gate cego a `.tsx`) e os números medidos (3 no `ui/` corrigidas, 27 congeladas no `shadcn/`)
- o check de showcase e por que detecta pelo diff
- a lista de exceção unificada (o que divergia antes)
- **Assumption:** *"detectar componente novo por pasta adicionada no diff é confiável; quebra se o componente e a Doc page vierem em PRs separadas — a primeira reprova, e isso é o comportamento desejado"*
- o que ficou **fora** e por quê: `ComponentsOverview` (não consta na L-042, ~13 lacunas), changelog (Regra 8), análise de AST (variação legítima medida)

- [ ] **Step 3: Commit e PR**

Branch própria, commit descritivo, push no `origin`, `gh pr create`, reportar o
link e **PARAR** — merge é gate humano (L-041).

No corpo do PR, deixe explícito:
- que o gate passou a cobrir `.tsx` e que os 27 hits do `shadcn/` estão congelados pelo ratchet (não reprovam ninguém);
- que o check de showcase **não reprova PR de rascunho**;
- que `ComponentsOverview` ficou de fora **de propósito**, com o motivo.

---

## Definição de pronto

- [ ] `npx vitest run` verde, incluindo os testes novos de exceções e de registro
- [ ] Sweep de `.tsx`: `ui/` em **0**, `shadcn/` em **27** (congeladas)
- [ ] `lint-styles --ratchet origin/main` → 0 · `showcase-check` → 0 · `distribution-debt` → 0
- [ ] Hook local avisa em `.tsx` e segue `exit 0`
- [ ] `showcase-check` provado nos dois sentidos (componente novo sem registro reprova; sem componente novo passa)
- [ ] Zero duplicação: patterns só em `ds-lint-patterns.mjs`, exceções só em `ds-exceptions.mjs`
- [ ] Paridade verificada: 3 skills + template + CONTRIBUTING citam os mesmos 3 itens; nenhum exige `ComponentsOverview`
- [ ] `git status` limpo (sem `ProbeWidget` sobrando)
- [ ] PR aberta e link reportado; **sem merge**
