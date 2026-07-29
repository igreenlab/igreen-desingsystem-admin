# Gate determinístico de estilos — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> ⚠️ **Todos os blocos de comando são Bash** (use a tool Bash / Git Bash, não PowerShell — o plano usa `F=…`, `printf`, pipes pra `bash`).

---

## ⚠️ Este plano FOI EXECUTADO — leia as correções antes de confiar no texto

Executado em 2026-07-29 (PR #66, mergeada). O plano está preservado como
registro histórico, mas a execução revelou **erros no próprio plano**. Se você
está lendo isto como referência, estes pontos do texto abaixo estão **errados**:

| Onde | O plano dizia | Correto |
|---|---|---|
| Task 1, Step 4 · Task 7 | o sweep daria `TOTAL: 1` | **`TOTAL: 2`** — ampliei a alternação de height pra `13\|14\|16` sem re-medir. O `16` pegou uma violação real que os greps antigos não viam: `h-16` (64px) em `single-menu-sidebar.styles.ts:98`, onde existe token exato (`layout.navbar` → `h-layout-navbar`) |
| Task 7 | corrigir **1** arquivo | **2** arquivos (o `h-16` acima entrou) |
| Task 8, Step 1 | ler `date-picker.tsx` / `date-picker.types.ts` | o arquivo é **`datepicker.tsx`**, com tipos inline — os dois caminhos citados não existem |
| §"Regra 8" + Task 5 | ok como escrito | a spec de origem prescrevia o oposto em **5** lugares; corrigido na própria PR #66, não aqui |

Além disso, o **review final da branch** (pós-execução) achou 6 problemas
Important que este plano não previa — entre eles uma **terceira cópia** da tabela
de regras em `.claude/skills/ds-reviewer/review-component.md` e o fato de que
todos os patterns estavam ancorados em `"`, deixando aspas simples passarem
limpas. Todos corrigidos antes do merge.

**Fonte de verdade do que de fato existe hoje:** o código em `scripts/lib/` +
`scripts/lint-styles.mjs`, a lição **L-059** em `.ai/status/lessons.md`, e a
entrada de audit em `.ai/status/pipeline-state.md`. Este plano é o que se
*pretendia*, não o que se *entregou*.

---

**Goal:** Transformar o lint de estilos do DS de aviso-local-informativo em check de CI bloqueante que só reprova violação **nova**, com os patterns corrigidos e sem duplicação de regra entre hook e CI.

**Architecture:** Extrair a tabela de patterns e o scanner pra um módulo Node puro (`scripts/lib/`), consumido por **dois** clientes: o hook local (`ds-lint-styles.sh`, que passa a chamar `node` em vez de ter greps próprios — mata a duplicação) e um CLI novo (`scripts/lint-styles.mjs`) com modo `--ratchet` que roda só nas linhas adicionadas pelo diff. Lógica pura testável por vitest; I/O (git, fs) isolado no CLI.

**Tech Stack:** Node ESM (`.mjs`, sem deps novas), vitest (já configurado), bash (hook existente), GitHub Actions.

**Spec de origem:** [`.ai/specs/pipeline-governance-ci.md`](../specs/pipeline-governance-ci.md) — Fase 1 + Fase 2a-i + Fase 2a-ii do rollout (§6). Fases 3/4/5 (changeset-lite, Camada 3, OIDC) são planos separados.

**Escopo explicitamente FORA deste plano:**
- Camada 1 (CODEOWNERS/branch protection) — exige admin no repo, ação manual do mantenedor (§5 da spec).
- Gate de `ds-inventory-check` — depende de unificar listas de exceção; plano próprio.
- Fase 2b (staleness do CSS de tokens) — lógica não existe, fora de escopo na spec.
- Tornar o check "required" no GitHub — config de branch protection, não código.

---

## Contexto que o implementador precisa saber

**O problema.** Os 3 hooks em `.claude/hooks/` rodam como `PostToolUse` do Claude Code, fazem grep de anti-patterns do DS e escrevem aviso em stderr — mas terminam com `exit 0` hard-coded, então nunca bloqueiam. Quem abre PR sem passar por sessão de Claude Code (ou via submódulo, onde o `.claude/` da DS não é carregado — L-056) não recebe sinal nenhum.

**Por que não é só "trocar exit 0 por exit 1".** Medição de 2026-07-29 (spec §1.1): dos 51 hits que o hook produz contra os 40 `*.styles.ts`, **50 são ruído** e só 1 é violação real. Dois motivos:

1. **Patterns largos demais** (corrigidos na Task 1):
   - `0` nas alternações de `pad`/`gap` → `p-0`, `py-0`, `!gap-0` são flagrados, mas **não existe token DS pra zero**; são resets legítimos. 33 hits.
   - `rounded-(none|…|full)` inclui `none` e `full`, **numericamente idênticos** aos tokens DS (`--radius-radius-full: 9999px`, `--radius-radius-none: 0px`) — impossível causar defeito. Já `sm`…`3xl` **divergem** (nativo `rounded-lg` = 0.5rem vs DS 0.625rem), e daí vem a razão de existir da regra. 9 hits.
   - L-004 (`outline-none`) é **irredutivelmente semântico**: a afordância de foco pode estar no elemento via `focus-visible:shadow-sh-ring` (padrão do DS que o check não reconhece) ou no **wrapper** via `focus-within:`, possivelmente em outro arquivo. Vai pra Camada 3. 8 hits.

2. **Débito pré-existente**: 14 dos 40 arquivos têm hit. Uma PR de 1 linha no `TableToolbar` falharia por violação que já estava lá. Daí o **ratchet**: só linhas adicionadas contam.

**Classificação que guia o que entra no gate** (spec §1.1): regras erradas *independente de contexto* (valor divergente, classe inexistente) → gate determinístico. Regras que exigem contexto cross-elemento ou julgamento de intenção (L-004, L-007) → revisor semântico. **Não adicione L-004 nem L-007 a este check.**

**Protótipo já validado** 3/3 contra `table-toolbar.styles.ts`. Este plano formaliza em código testado.

### ⚠️ Regra 8 e o `distribution-debt` — leia antes da Task 5

A **Regra 8** (`ds-standards.md:26`) diz: *"Distribuição (registry.json + embed + bump) **não** vai por-PR-de-componente — consolida no `/ds-release`."* Logo `distribution-debt.mjs --ci` **não pode** ser check bloqueante de PR: reprovaria o próximo PR de componente novo por seguir a regra do projeto. Ele roda **sem** `--ci` na PR (informativo) e **com** `--ci` no `release:check` (bloqueante). A spec foi corrigida nesse ponto — não "otimize" isso de volta.

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `scripts/lib/ds-lint-patterns.mjs` | **Fonte única** da tabela de patterns + `scanLines()`. Zero I/O. | criar |
| `scripts/lib/ds-lint-patterns.test.mjs` | Testa cada pattern: pega o que deve, ignora falso-positivo. | criar |
| `scripts/lib/diff-added-lines.mjs` | Parser puro de `git diff -U0` → `Map<arquivo, [{n,text}]>`. Zero I/O. | criar |
| `scripts/lib/diff-added-lines.test.mjs` | Testa parse de hunk (múltiplos hunks/arquivos, deleção, `/dev/null`). | criar |
| `scripts/lint-styles.mjs` | CLI. Modos `--file <path>` (hook) e `--ratchet [base]` (CI). Faz o I/O. | criar |
| `.claude/hooks/ds-lint-styles.sh` | Delega pro módulo node; perde os greps; segue `exit 0`. | modificar |
| `.github/workflows/ci.yml` | +`fetch-depth: 0`, +2 steps (ratchet bloqueante, débito informativo). | modificar |
| `package.json` | +script `lint:styles`; `release:check` ganha `--ci` no distribution-debt. | modificar |
| `CLAUDE.md` (linha ~110) | Tabela de hooks: lista de lições do `ds-lint-styles` (L-004 saiu). | modificar |
| `.claude/rules/ds-standards.md` (linha ~61) | Idem — "Grep das lições L-001 a L-007" ficou falso. | modificar |
| `.ai/status/lessons.md` | Lição nova: classificação determinístico-vs-semântico. | modificar |
| `.ai/status/pipeline-state.md` | Entrada de audit log (checklist de encerramento do `CLAUDE.md`). | modificar |
| `src/components/ui/MenuSidebar/sidebar.styles.ts:158` | Quick win: `w-9 h-9` → `size-comp-lg`. | modificar |
| `src/components/ui/DatePicker/USAGE.md` | Quick win: gap real (distribuído sem USAGE). | criar |

**Por que dois módulos em `lib/`:** o parser de diff não sabe nada de DS e o scanner não sabe nada de git. Fronteiras separadas = testáveis isoladamente, e o parser fica reutilizável (o check de tokens da Fase 2b vai precisar de "só o que mudou").

---

## Task 1: Tabela de patterns + scanner

**Files:**
- Create: `scripts/lib/ds-lint-patterns.mjs`
- Test: `scripts/lib/ds-lint-patterns.test.mjs`

- [ ] **Step 1a: Criar o arquivo de teste — casos que DEVEM ser pegos**

```js
import { describe, expect, it } from "vitest";
import { scanLines, DS_LINT_PATTERNS } from "./ds-lint-patterns.mjs";

/* Especifica o gate determinístico de estilos do DS.
   Baseline medido em 2026-07-29: dos 51 hits do grep antigo, 50 eram ruído.
   Cada caso "NÃO deve pegar" corresponde a um desses falso-positivos. */

const scan1 = (text) => scanLines([{ n: 1, text }]);

describe("DS_LINT_PATTERNS — deve PEGAR (erradas independente de contexto)", () => {
  it("L-001: ring-ring-* com modificador de alpha", () => {
    expect(scan1('"ring-4 ring-ring-brand/30"')).toHaveLength(1);
    expect(scan1('"ring-ring-danger/20"')[0].id).toBe("L-001");
  });

  it("L-002: gap-N literal, inclusive gap-x/gap-y", () => {
    expect(scan1('"flex gap-4"')).toHaveLength(1);
    expect(scan1('"gap-24"')).toHaveLength(1);
    expect(scan1('"gap-x-4"')).toHaveLength(1);
    expect(scan1('"gap-y-2"')).toHaveLength(1);
  });

  it("L-002: pad/space literal", () => {
    expect(scan1('"p-4"')).toHaveLength(1);
    expect(scan1('"px-3 py-2"').length).toBeGreaterThanOrEqual(1);
  });

  it("L-002: height/size fixo", () => {
    expect(scan1('"h-9"')).toHaveLength(1);
    expect(scan1('"min-h-10"')).toHaveLength(1);
    expect(scan1('"size-9"')).toHaveLength(1); // w-9 h-9 escrito como size-9
    expect(scan1('"h-14"')).toHaveLength(1);
  });

  it("L-002: rounded nativo com valor divergente, inclusive side variants", () => {
    // nativo rounded-lg = 0.5rem, DS rounded-radius-lg = 0.625rem → defeito real
    for (const k of ["sm", "md", "lg", "xl", "2xl", "3xl"]) {
      expect(scan1(`"rounded-${k}"`), `rounded-${k}`).toHaveLength(1);
    }
    // side variants têm o MESMO valor divergente
    expect(scan1('"rounded-t-lg"')).toHaveLength(1);
    expect(scan1('"rounded-br-md"')).toHaveLength(1);
  });

  it("L-002: shadow nativo", () => {
    expect(scan1('"shadow-md"')).toHaveLength(1);
    expect(scan1('"shadow-xs"')).toHaveLength(1);
  });

  it("L-003: ring-3 (não existe no Tailwind)", () => {
    expect(scan1('"ring-3"')[0].id).toBe("L-003");
  });

  it("L-005: bg-input com alpha", () => {
    expect(scan1('"bg-input/50"')[0].id).toBe("L-005");
  });

  it("IMPORT: tv vindo de tailwind-variants, aspas duplas ou simples", () => {
    expect(scan1('import { tv } from "tailwind-variants";')[0].id).toBe("IMPORT");
    expect(scan1("import { tv } from 'tailwind-variants';")[0].id).toBe("IMPORT");
  });
});
```

- [ ] **Step 1b: Adicionar ao mesmo arquivo os casos que NÃO devem ser pegos**

```js
describe("DS_LINT_PATTERNS — NÃO deve pegar (os 50 falso-positivos medidos)", () => {
  it("zero não tem token DS equivalente — p-0/gap-0 são resets legítimos", () => {
    expect(scan1('"!gap-0 !p-0"')).toEqual([]);
    expect(scan1('"py-0 px-0 pl-0 pr-0 pt-0 pb-0"')).toEqual([]);
  });

  it("rounded-full e rounded-none são NUMERICAMENTE IDÊNTICOS ao token DS", () => {
    expect(scan1('"rounded-full"')).toEqual([]);
    expect(scan1('"rounded-none"')).toEqual([]);
    expect(scan1('"rounded-t-full"')).toEqual([]);
  });

  it("as próprias classes DS nunca são violação", () => {
    expect(scan1('"gap-gp-md p-sp-md px-pad-lg"')).toEqual([]);
    expect(scan1('"rounded-radius-lg rounded-radius-full"')).toEqual([]);
    expect(scan1('"shadow-sh-md min-h-form-lg size-comp-lg"')).toEqual([]);
    expect(scan1('"ring-4 ring-ring-brand"')).toEqual([]);
  });

  it("L-004 (outline-none) NÃO pertence ao gate determinístico — é semântico", () => {
    // Foco pode estar no wrapper (focus-within) ou vir de focus-visible:shadow-sh-ring.
    // Grep não decide; vai pra Camada 3. Ver spec §1.1.
    expect(scan1('"bg-transparent border-0 outline-none"')).toEqual([]);
    expect(DS_LINT_PATTERNS.some((p) => p.id === "L-004")).toBe(false);
  });

  it("L-007 (tipografia) também é semântico, fora do gate", () => {
    expect(DS_LINT_PATTERNS.some((p) => p.id === "L-007")).toBe(false);
  });

  it("comentário explicando a regra não é violação", () => {
    // Sem isso, um comentário citando "rounded-lg" reprova o CI.
    expect(scan1('  // nativo "rounded-lg" = 0.5rem vs DS 0.625rem')).toEqual([]);
    expect(scan1('   * usa "gap-4"? não — use gap-gp-md')).toEqual([]);
  });
});

describe("scanLines", () => {
  it("preserva o número de linha informado", () => {
    expect(scanLines([{ n: 42, text: '"gap-4"' }])[0].n).toBe(42);
  });

  it("acumula múltiplas violações na mesma linha", () => {
    expect(scanLines([{ n: 1, text: '"gap-4 h-9 rounded-lg"' }]).length).toBe(3);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(scanLines([])).toEqual([]);
  });

  it("toda violação carrega id, mensagem acionável e o texto da linha", () => {
    const [v] = scanLines([{ n: 1, text: '"gap-4"' }]);
    expect(v).toMatchObject({ id: expect.any(String), msg: expect.any(String) });
    expect(v.msg.length).toBeGreaterThan(10); // tem que dizer o que fazer
  });

  // Buracos de cobertura conhecidos, herdados do hook — decidir em plano futuro
  it.todo("space-x-N / space-y-N (utility legado, sem token DS direto)");
  it.todo("w-N / h-N isolados (só size-N e h-N estão cobertos)");
});
```

- [ ] **Step 2: Rodar pra confirmar que falha**

Run: `npx vitest run scripts/lib/ds-lint-patterns.test.mjs`
Expected: FAIL — `Failed to resolve import "./ds-lint-patterns.mjs"`

- [ ] **Step 3a: Criar o módulo com a tabela de patterns**

```js
/**
 * ds-lint-patterns — FONTE ÚNICA dos anti-patterns de estilo do DS.
 *
 * Consumido por DOIS clientes (nunca duplique a tabela):
 *   - .claude/hooks/ds-lint-styles.sh   → aviso local, nunca bloqueia
 *   - scripts/lint-styles.mjs --ratchet → check de CI, bloqueia violação nova
 *
 * ⚠️ Só entram aqui regras erradas INDEPENDENTE DE CONTEXTO (valor divergente
 * do token, classe que não existe). Regras que exigem contexto cross-elemento
 * ou julgamento de intenção — L-004 (afordância de foco pode estar no wrapper)
 * e L-007 (escolha de preset tipográfico) — pertencem ao revisor semântico,
 * NÃO a este arquivo. Ver `.ai/specs/pipeline-governance-ci.md` §1.1.
 *
 * Buracos de cobertura conhecidos (herdados do hook, ver it.todo no teste):
 * `space-x-N`, `w-N`/`h-N` isolados. Fechar exige decisão de política própria.
 */

export const DS_LINT_PATTERNS = [
  {
    id: "L-001",
    re: /ring-ring-[a-z-]+\/[0-9]+/,
    msg: "ring-ring-*/N — o token de ring já tem alpha embutido. Remova o /N.",
  },
  // `0` fora da alternação de propósito: não existe token DS pra zero
  // (p-0/gap-0 são resets legítimos, comuns com `!` sobre base do shadcn).
  {
    id: "L-002",
    re: /"[^"]*\bgap(-[xy])?-(1|2|3|4|5|6|7|8|9|10|12|14|16|20|24)\b[^"]*"/,
    msg: "gap-N literal → use gap-gp-{2xs,xs,sm,md,lg,xl,2xl}.",
  },
  {
    id: "L-002",
    re: /"[^"]*\b(px|py|pt|pb|pl|pr|p)-(1|2|3|4|5|6|7|8|10|12|16)\b[^"]*"/,
    msg: "pad/space literal → use p-sp-* (space) ou px-pad-* (pad).",
  },
  {
    id: "L-002",
    re: /"[^"]*\b(h|min-h|size)-(7|8|9|10|11|12|13|14|16)\b[^"]*"/,
    msg: "height/size fixo → use min-h-form-* (h-9=form-md, h-10=form-lg, h-11=form-xl). Se for quadrado, size-comp-*.",
  },
  // `none` e `full` fora da alternação: são numericamente IDÊNTICOS ao token DS
  // (--radius-radius-full: 9999px, --radius-radius-none: 0px) → não podem ser
  // defeito. Já sm..3xl DIVERGEM (nativo lg=0.5rem vs DS 0.625rem) → defeito
  // real. Side variants (rounded-t-lg) carregam o mesmo valor divergente.
  {
    id: "L-002",
    re: /"[^"]*\brounded(-(t|b|l|r|tl|tr|bl|br|s|e|ss|se|es|ee))?-(sm|md|lg|xl|2xl|3xl)\b[^"]*"/,
    msg: "rounded-N nativo tem VALOR DIFERENTE do token DS (nativo lg=0.5rem vs DS 0.625rem) → use rounded-radius-*.",
  },
  {
    id: "L-002",
    re: /"[^"]*\bshadow-(2xs|xs|sm|md|lg|xl|2xl)\b[^"]*"/,
    msg: "shadow-N nativo → use shadow-sh-*.",
  },
  {
    id: "L-003",
    re: /"[^"]*\bring-3\b[^"]*"/,
    msg: "ring-3 não existe no Tailwind (vira no-op silencioso) → use ring-4.",
  },
  {
    id: "L-005",
    re: /"[^"]*\bbg-input\/[0-9]+[^"]*"/,
    msg: "bg-input/N é var do shadcn → use o token DS bg-bg-surface (ou bg-bg-muted).",
  },
  {
    id: "IMPORT",
    re: /from\s+['"]tailwind-variants['"]/,
    msg: 'import errado: use `import { tv } from "@/utils/tv"` — o wrapper do DS carrega o twMergeConfig da L-016.',
  },
];

/** Linha de comentário não é código — citar uma classe proibida ao explicar a
 *  regra não pode reprovar o CI. */
const isComment = (text) => /^\s*(\/\/|\/\*|\*)/.test(text);

/**
 * Roda todos os patterns contra uma lista de linhas.
 * @param {Array<{n: number, text: string}>} lines
 * @returns {Array<{id: string, msg: string, n: number, text: string}>}
 */
export function scanLines(lines) {
  const out = [];
  for (const { n, text } of lines) {
    if (isComment(text)) continue;
    for (const p of DS_LINT_PATTERNS) {
      // `re` sem flag /g → .test() não mantém lastIndex, seguro reusar.
      if (p.re.test(text)) out.push({ id: p.id, msg: p.msg, n, text });
    }
  }
  return out;
}
```

- [ ] **Step 3b: Rodar o teste pra confirmar que passa**

Run: `npx vitest run scripts/lib/ds-lint-patterns.test.mjs`
Expected: PASS (com 2 `todo` pendentes)

- [ ] **Step 4: Verificar contra o repo real — deve achar exatamente 1 violação**

```bash
node -e '
import("./scripts/lib/ds-lint-patterns.mjs").then(({scanLines})=>{
  const {globSync,readFileSync}=require("node:fs");
  let total=0;
  for(const f of globSync("src/components/**/*styles.ts")){
    const v=scanLines(readFileSync(f,"utf8").split(/\r?\n/).map((text,i)=>({n:i+1,text})));
    if(v.length){total+=v.length;console.log(`${f}`);v.forEach(x=>console.log(`  :${x.n} [${x.id}]`))}
  }
  console.log(`TOTAL: ${total}`);
});'
```
Expected: `TOTAL: 1` — só `sidebar.styles.ts:158` (o `w-9 h-9`). Se der mais que 1, **pare** e investigue: algum pattern ficou largo demais.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/ds-lint-patterns.mjs scripts/lib/ds-lint-patterns.test.mjs
git commit -m "feat(lint): tabela única de anti-patterns de estilo com patterns corrigidos

Fonte única consumida pelo hook local e pelo check de CI. Corrige os
bugs medidos no baseline (spec §1.1): tira 0 das alternações de pad/gap
(zero não tem token DS), tira none/full do rounded (numericamente
idênticos ao token) e remove L-004 do conjunto determinístico (é
semântico — foco pode estar no wrapper). Fecha buracos herdados do hook
(gap-x/y, rounded side variants, size-N, shadow-xs, aspas simples no
import) e ignora linha de comentário. Leva os 51 hits atuais pra 1."
```

---

## Task 2: Parser de linhas adicionadas do diff

**Files:**
- Create: `scripts/lib/diff-added-lines.mjs`
- Test: `scripts/lib/diff-added-lines.test.mjs`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, expect, it } from "vitest";
import { parseAddedLines } from "./diff-added-lines.mjs";

/* Parser de `git diff -U0`. Com -U0 não há linha de contexto,
   então toda linha `+` é adição real. */

describe("parseAddedLines", () => {
  it("extrai linha adicionada com o número real no arquivo novo", () => {
    const diff = [
      "diff --git a/a.ts b/a.ts",
      "--- a/a.ts",
      "+++ b/a.ts",
      "@@ -10,0 +11 @@",
      '+  base: "gap-4",',
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 11, text: '  base: "gap-4",' },
    ]);
  });

  it("incrementa o número em adições consecutivas", () => {
    const diff = ["+++ b/a.ts", "@@ -0,0 +5,3 @@", "+l5", "+l6", "+l7"].join("\n");
    expect(parseAddedLines(diff).get("a.ts").map((l) => l.n)).toEqual([5, 6, 7]);
  });

  it("reinicia a contagem em cada hunk novo", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -1,0 +2 @@",
      "+dois",
      "@@ -50,0 +80,2 @@",
      "+oitenta",
      "+oitentaeum",
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 2, text: "dois" },
      { n: 80, text: "oitenta" },
      { n: 81, text: "oitentaeum" },
    ]);
  });

  it("aceita o sufixo de function-context do hunk (forma real do git)", () => {
    // git emite: @@ -1,2 +3,4 @@ export const foo = tv({
    const diff = [
      "+++ b/a.ts",
      "@@ -1,0 +7 @@ export const card = tv({",
      "+  base: \"gap-4\",",
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 7, text: '  base: "gap-4",' },
    ]);
  });

  it("separa por arquivo", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -0,0 +1 @@",
      "+do a",
      "diff --git a/b.ts b/b.ts",
      "+++ b/b.ts",
      "@@ -0,0 +1 @@",
      "+do b",
    ].join("\n");
    const out = parseAddedLines(diff);
    expect(out.get("a.ts")).toEqual([{ n: 1, text: "do a" }]);
    expect(out.get("b.ts")).toEqual([{ n: 1, text: "do b" }]);
  });

  it("ignora linhas removidas (deleção pura não gera entrada)", () => {
    const diff = ["+++ b/a.ts", "@@ -3,2 +2,0 @@", "-foi", "-embora"].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([]);
  });

  it("em hunk misto, conta só as linhas adicionadas", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -5,1 +5,2 @@",
      '-  base: "gap-gp-md",',
      '+  base: "gap-4",',
      '+  extra: "p-sp-md",',
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 5, text: '  base: "gap-4",' },
      { n: 6, text: '  extra: "p-sp-md",' },
    ]);
  });

  it("arquivo deletado (+++ /dev/null) não entra no resultado", () => {
    const diff = ["--- a/a.ts", "+++ /dev/null", "@@ -1,1 +0,0 @@", "-adeus"].join("\n");
    expect(parseAddedLines(diff).size).toBe(0);
  });

  it("não confunde o header +++ com uma linha adicionada", () => {
    const diff = ["+++ b/a.ts", "@@ -0,0 +1 @@", "+conteudo"].join("\n");
    const lines = parseAddedLines(diff).get("a.ts");
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe("conteudo");
  });

  it("devolve Map vazio pra diff vazio", () => {
    expect(parseAddedLines("").size).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar pra confirmar que falha**

Run: `npx vitest run scripts/lib/diff-added-lines.test.mjs`
Expected: FAIL — não resolve o import

- [ ] **Step 3: Implementar o módulo**

```js
/**
 * diff-added-lines — parser puro de saída de `git diff -U0`.
 *
 * Existe pro ratchet: permite rodar checks SÓ no que a PR adicionou, deixando
 * débito pré-existente congelado (sem ele, 35% dos *.styles.ts do repo
 * reprovariam qualquer PR que os tocasse — ver spec §1.1).
 *
 * Agnóstico de DS — qualquer check futuro que precise de "só o que mudou" pode
 * reusar (o de staleness de token da Fase 2b vai precisar).
 */

/**
 * @param {string} diffText saída de `git diff -U0 --merge-base <base> -- <paths>`
 * @returns {Map<string, Array<{n: number, text: string}>>} arquivo → linhas adicionadas
 */
export function parseAddedLines(diffText) {
  const out = new Map();
  let file = null;
  let lineNo = 0;

  for (const line of diffText.split(/\r?\n/)) {
    // Header do arquivo novo. Precisa vir ANTES do teste de `+`, senão
    // `+++ b/foo` é lido como conteúdo adicionado.
    if (line.startsWith("+++ ")) {
      const path = line.slice(4).trim();
      file = path === "/dev/null" ? null : path.replace(/^b\//, "");
      if (file && !out.has(file)) out.set(file, []);
      continue;
    }

    // @@ -oldStart[,oldCount] +newStart[,newCount] @@ [contexto de função]
    // Regex não ancorada no fim: o git costuma anexar o contexto após o @@.
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      lineNo = parseInt(hunk[1], 10);
      continue;
    }

    if (file && line.startsWith("+")) {
      out.get(file).push({ n: lineNo, text: line.slice(1) });
      lineNo++;
    }
    // Linhas `-` não avançam lineNo (a numeração é do arquivo NOVO).
  }

  return out;
}
```

- [ ] **Step 4: Rodar pra confirmar que passa**

Run: `npx vitest run scripts/lib/diff-added-lines.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/diff-added-lines.mjs scripts/lib/diff-added-lines.test.mjs
git commit -m "feat(lint): parser de linhas adicionadas de git diff -U0

Base do ratchet: permite rodar check só no que a PR adicionou, deixando
débito pré-existente congelado (sem isso 35% dos *.styles.ts reprovariam
qualquer PR que os tocasse). Cobre hunk com sufixo de function-context,
hunk misto e arquivo deletado. Módulo agnóstico de DS, reusável."
```

---

## Task 3: CLI `lint-styles.mjs`

**Files:**
- Create: `scripts/lint-styles.mjs`

Sem teste unitário próprio — é a casca de I/O (git/fs/console); a lógica que importa está coberta nas Tasks 1-2. Verificação aqui é end-to-end contra o repo.

- [ ] **Step 1a: Criar o CLI — imports e o modo `--file`**

```js
#!/usr/bin/env node
/**
 * lint-styles — anti-patterns de estilo do DS, em 2 modos.
 *
 *   --file <path>      varre o arquivo inteiro. Usado pelo hook local
 *                      (aviso informativo). SEMPRE exit 0.
 *   --ratchet [base]   varre SÓ as linhas adicionadas vs <base> (default
 *                      origin/main). Usado no CI. exit 1 se houver violação nova.
 *
 * Patterns: scripts/lib/ds-lint-patterns.mjs (fonte única, compartilhada com o
 * hook — nunca duplique a tabela aqui).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { scanLines } from "./lib/ds-lint-patterns.mjs";
import { parseAddedLines } from "./lib/diff-added-lines.mjs";

// Escopo: só styles de componente. `src/examples/**` e `src/preview/**` ficam
// FORA de propósito — são cópias/demos, não a fonte do DS. Se um dia o gate
// precisar cobrir `src/examples/` (que vai pro consumidor, L-034), é decisão
// de escopo própria, não ajuste silencioso aqui.
const GLOB = "src/components/**/*styles.ts";

function report(violations, { blocking }) {
  for (const v of violations) {
    console.log(`\n  ${blocking ? "✗" : "•"} ${v.file}:${v.n}  [${v.id}]`);
    console.log(`      ${v.text.trim().slice(0, 110)}`);
    console.log(`      → ${v.msg}`);
  }
}

function modeFile(path) {
  if (!path) {
    console.error("--file exige um caminho");
    return 2;
  }
  if (!existsSync(path)) return 0; // hook pode disparar em arquivo já removido
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((text, i) => ({ n: i + 1, text }));
  const violations = scanLines(lines).map((v) => ({ ...v, file: path }));
  if (violations.length) {
    console.log(
      `\n⚠️  ds-lint-styles — ${violations.length} violação(ões) anti-DS em ${path}:`,
    );
    report(violations, { blocking: false });
    console.log(
      "\n   Referência: .claude/rules/ds-standards.md (Anti-patterns) · tokens em .ai/context/tokens/\n",
    );
  }
  return 0; // modo hook NUNCA bloqueia
}
```

- [ ] **Step 1b: Adicionar o modo `--ratchet` e o dispatch de argv**

```js
function modeRatchet(base) {
  let diff = "";
  try {
    // --merge-base: compara com o ponto de divergência, não com o tip da base.
    // Sem isso, commit que entrou na base depois do fork aparece como `+`
    // e reprova quem não mexeu naquilo.
    diff = execFileSync("git", ["diff", "-U0", "--merge-base", base, "--", GLOB], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    console.error(
      `\n⚠️  lint-styles: não consegui diffar contra "${base}".` +
        ` No CI, garanta fetch-depth: 0 no actions/checkout.\n`,
    );
    return 1;
  }

  const added = parseAddedLines(diff);
  const violations = [];
  let files = 0;
  let lines = 0;
  for (const [file, ls] of added) {
    if (!ls.length) continue;
    files++;
    lines += ls.length;
    violations.push(...scanLines(ls).map((v) => ({ ...v, file })));
  }

  if (!violations.length) {
    console.log(
      `\n✓ lint-styles (ratchet vs ${base}): ${files} arquivo(s), ${lines} linha(s) adicionada(s), 0 violação nova.\n`,
    );
    return 0;
  }

  console.log(
    `\n✗ lint-styles (ratchet vs ${base}): ${violations.length} violação(ões) em linha ADICIONADA por esta PR:`,
  );
  report(violations, { blocking: true });
  console.log(
    "\n  Só linhas adicionadas contam — débito pré-existente no arquivo não reprova.\n" +
      "  Nota: código MOVIDO conta como adicionado; se você só reposicionou uma linha\n" +
      "  que já violava, corrija-a agora.\n" +
      "  Referência: .claude/rules/ds-standards.md (Anti-patterns).\n",
  );
  return 1;
}

const argv = process.argv.slice(2);
const fileIdx = argv.indexOf("--file");
const ratchetIdx = argv.indexOf("--ratchet");
if (fileIdx !== -1) {
  process.exit(modeFile(argv[fileIdx + 1]));
} else if (ratchetIdx !== -1) {
  process.exit(modeRatchet(argv[ratchetIdx + 1] ?? "origin/main"));
} else {
  console.error("uso: lint-styles.mjs --file <path> | --ratchet [base-ref]");
  process.exit(2);
}
```

- [ ] **Step 2: Verificar `--file` no arquivo que era o mais sujo**

Run: `node scripts/lint-styles.mjs --file src/components/ui/TableToolbar/table-toolbar.styles.ts; echo "exit=$?"`
Expected: `exit=0` e **nenhuma** violação. (Os hits antigos desse arquivo eram `outline-none` — agora fora do gate — mais dois `p-0`, eliminados pela remoção do `0` da alternação.)

- [ ] **Step 3: Verificar `--file` na única violação real**

Run: `node scripts/lint-styles.mjs --file src/components/ui/MenuSidebar/sidebar.styles.ts; echo "exit=$?"`
Expected: `exit=0` (modo hook não bloqueia) + **1** violação L-002 na linha 158 (`w-9 h-9`) — corrigida na Task 7.

- [ ] **Step 4: Verificar o ratchet — violação nova reprova**

```bash
F=src/components/ui/TableToolbar/table-toolbar.styles.ts
printf '\nexport const _ratchetProbe = tv({ base: ["gap-4 h-9 rounded-lg"] });\n' >> "$F"
node scripts/lint-styles.mjs --ratchet HEAD; echo "exit=$?"
git checkout -- "$F"
```
Expected: `exit=1` listando 3 violações (gap, height, rounded) e **nenhuma** pré-existente do arquivo.

- [ ] **Step 5: Verificar o ratchet — linha limpa passa**

```bash
F=src/components/ui/TableToolbar/table-toolbar.styles.ts
printf '\nexport const _ratchetProbe = tv({ base: ["gap-gp-md p-sp-md rounded-radius-lg", "!p-0 rounded-full"] });\n' >> "$F"
node scripts/lint-styles.mjs --ratchet HEAD; echo "exit=$?"
git checkout -- "$F"
git status --short   # deve estar limpo
```
Expected: `exit=0` — classes DS passam e `!p-0`/`rounded-full` não disparam.

- [ ] **Step 6: Commit**

```bash
git add scripts/lint-styles.mjs
git commit -m "feat(lint): CLI de lint de estilos com modo hook e modo ratchet

--file varre o arquivo inteiro e nunca bloqueia (uso do hook local).
--ratchet usa git diff -U0 --merge-base e reprova só violação em linha
adicionada (uso do CI). --merge-base evita reprovar por commit que
entrou na base após o fork. Mensagem de erro explica que código movido
conta como adicionado, pra não parecer bug de quem reposicionou linha."
```

---

## Task 4: Hook local passa a delegar (mata a duplicação de regra)

**Files:**
- Modify: `.claude/hooks/ds-lint-styles.sh`

**Por que:** manter a tabela em bash *e* em `.mjs` recria exatamente o bug medido entre `ds-inventory-check.sh` e `distribution-debt.mjs` — dois scripts do mesmo repo discordando da regra. O hook já usa `node` como fallback pra parsear JSON, então Node está disponível.

- [ ] **Step 1: Confirmar a estrutura atual antes de editar**

Run: `grep -n 'WARNINGS=\|FOUND=\|^check()\|^check \|if \[ "\$FOUND"\|^exit 0' .claude/hooks/ds-lint-styles.sh`
Expected: `WARNINGS=""` e `FOUND=0` (~51-52), definição de `check()` (~54), 10 chamadas `check '...'` (~67-92), `if [ "$FOUND" -gt 0 ]` (~94) e `exit 0` (~110).

- [ ] **Step 2: Substituir da linha 51 até o FIM do arquivo**

Preserve tudo até a linha 50 (extração do JSON via jq/node, `PROJECT_ROOT`/`LOG_FILE`/`TS`, guard `-z "$FILE"`, o `case` que filtra `*styles.ts`, guard `-f "$FILE"`). **Apague da linha 51 (`WARNINGS=""`) até o fim** — isso remove `FOUND`, `check()`, as 10 chamadas, o bloco de relatório e o `exit 0` antigo — e cole:

```bash
# Detecção delegada ao módulo Node — FONTE ÚNICA compartilhada com o check de
# CI (scripts/lib/ds-lint-patterns.mjs). Não reintroduza greps aqui: duplicar a
# tabela é como ds-inventory-check e distribution-debt passaram a divergir.
if command -v node >/dev/null 2>&1; then
  # stderr do node capturado junto: se o script quebrar, queremos ver, não
  # engolir e logar OK falso.
  OUTPUT=$(node "$PROJECT_ROOT/scripts/lint-styles.mjs" --file "$FILE" 2>&1)
  if [ -n "$OUTPUT" ]; then
    echo "[$TS] ds-lint-styles: WARN $FILE" >> "$LOG_FILE" 2>/dev/null
    printf '%s\n' "$OUTPUT" >&2
  else
    echo "[$TS] ds-lint-styles: OK   $FILE" >> "$LOG_FILE" 2>/dev/null
  fi
else
  echo "[$TS] ds-lint-styles: SKIP (node ausente) $FILE" >> "$LOG_FILE" 2>/dev/null
fi

# Nunca bloqueia o Edit — só o CI decide reprovar.
exit 0
```

- [ ] **Step 3: Atualizar o cabeçalho de comentário do hook**

O bloco de comentário no topo lista as lições verificadas. Ajuste pra L-001/L-002/L-003/L-005 + import (L-004 **saiu** — é semântica), com ponteiro pra `.ai/specs/pipeline-governance-ci.md` §1.1 explicando por quê, e nota de que a detecção agora vive em `scripts/lib/ds-lint-patterns.mjs`.

- [ ] **Step 4: Verificar que ainda avisa em arquivo com violação**

```bash
echo '{"tool_input":{"file_path":"src/components/ui/MenuSidebar/sidebar.styles.ts"}}' \
  | bash .claude/hooks/ds-lint-styles.sh; echo "exit=$?"
```
Expected: `exit=0` + aviso em stderr apontando a linha 158.

- [ ] **Step 5: Verificar que fica silencioso em arquivo limpo e fora de escopo**

```bash
echo '{"tool_input":{"file_path":"src/components/ui/Button/button.styles.ts"}}' \
  | bash .claude/hooks/ds-lint-styles.sh; echo "button exit=$?"
echo '{"tool_input":{"file_path":"src/App.tsx"}}' \
  | bash .claude/hooks/ds-lint-styles.sh; echo "app exit=$?"
```
Expected: ambos `exit=0` sem saída em stderr (o `!rounded-full` do `pill` do Button não é mais falso-positivo).

- [ ] **Step 6: Confirmar que não sobrou código órfão**

Run: `grep -n 'WARNINGS\|FOUND\|check()' .claude/hooks/ds-lint-styles.sh; echo "---"; grep -c '^exit 0' .claude/hooks/ds-lint-styles.sh`
Expected: primeiro grep sem resultado; contagem de `exit 0` = **1**.

- [ ] **Step 7: Commit**

```bash
git add .claude/hooks/ds-lint-styles.sh
git commit -m "refactor(hooks): ds-lint-styles delega pro módulo node (fonte única)

O hook tinha os greps embutidos, o que duplicaria a regra ao criar o
check de CI — exatamente como ds-inventory-check e distribution-debt
divergiram. Agora chama scripts/lint-styles.mjs --file. Segue exit 0
(informativo); L-004 saiu do conjunto por ser semântica."
```

---

## Task 5: Fiar no CI e no package.json

**Files:**
- Modify: `.github/workflows/ci.yml`, `package.json`

- [ ] **Step 1: Adicionar `fetch-depth: 0` ao checkout**

O ratchet precisa do histórico pra achar o merge-base — o default (`fetch-depth: 1`) não tem. Em `.github/workflows/ci.yml`:

```yaml
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # ratchet precisa do histórico pro merge-base
```

- [ ] **Step 2: Adicionar os 2 steps ao fim do job `check`**

```yaml
      - name: Lint de estilos (ratchet — só linhas adicionadas)
        run: node scripts/lint-styles.mjs --ratchet origin/${{ github.base_ref || 'main' }}

      # SEM --ci de propósito: informativo. Bloquear na PR colidiria com a
      # Regra 8 (distribuição consolida no /ds-release, não por-PR-de-
      # componente). A forma bloqueante vive no release:check.
      - name: Débito de distribuição (informativo)
        run: node scripts/distribution-debt.mjs
```

- [ ] **Step 3: Adicionar o npm script e endurecer o `release:check`**

Em `package.json`, seguindo o padrão dos outros checks:

```jsonc
"lint:styles": "node scripts/lint-styles.mjs --ratchet origin/main",
// release:check — distribution-debt passa a usar --ci (bloqueante no release)
"release:check": "node scripts/registry-check.mjs && node scripts/distribution-debt.mjs --ci && node scripts/examples-drift-check.mjs",
```

- [ ] **Step 4: Verificar que os steps estão no lugar**

Run: `grep -n 'fetch-depth\|--ratchet\|distribution-debt' .github/workflows/ci.yml package.json`
Expected: `fetch-depth: 0` e o step de ratchet no `ci.yml`; `distribution-debt.mjs` **sem** `--ci` no `ci.yml` e **com** `--ci` no `release:check`.

- [ ] **Step 5: Confirmar que os dois passam no estado atual**

```bash
node scripts/lint-styles.mjs --ratchet origin/main; echo "ratchet exit=$?"
node scripts/distribution-debt.mjs; echo "debt exit=$?"
```
Expected: ambos `exit=0`. (Se o ratchet reclamar de merge-base, você está numa branch sem `origin/main` local — rode `git fetch origin main` primeiro.)

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml package.json
git commit -m "ci: liga o ratchet de estilos + débito de distribuição informativo

Ratchet de estilos entra como step bloqueante; fetch-depth: 0 no
checkout porque sem histórico não há merge-base. distribution-debt roda
SEM --ci na PR (informativo) porque bloquear colidiria com a Regra 8
(distribuição consolida no /ds-release); a forma bloqueante passa a
viver no release:check. Ambos verdes no estado atual."
```

---

## Task 6: Fechar as superfícies de documentação

**Files:**
- Modify: `CLAUDE.md` (~linha 110), `.claude/rules/ds-standards.md` (~linha 61), `.ai/status/lessons.md`, `.ai/status/pipeline-state.md`

Sem isso a doc do pipeline passa a mentir (as duas tabelas de hooks dizem que o `ds-lint-styles` cobre L-001..L-007, e L-004/L-007 saíram).

- [ ] **Step 1: Corrigir as 2 tabelas de hooks**

Run: `grep -n "L-001/L-002\|L-001 a L-007" CLAUDE.md .claude/rules/ds-standards.md`

Nas duas linhas, ajuste a lista de lições pra L-001/L-002/L-003/L-005 + import, e mencione que a detecção agora vive em `scripts/lib/ds-lint-patterns.mjs` (fonte única com o CI) e que o ratchet de CI só reprova violação **nova**.

- [ ] **Step 2: Registrar a lição nova em `lessons.md`**

Adicione uma L-0NN (use o próximo número livre) com a classificação **determinístico vs semântico**: regra que está errada independente de contexto pode virar gate mecânico; regra que exige contexto cross-elemento (L-004 — o ring pode estar no wrapper) ou julgamento de intenção (L-007) **não** — forçá-la no grep gera o falso-positivo que faz o time desligar o check. Inclua o dado que sustenta: dos 51 hits do grep original, 50 eram ruído, e `rounded-full`/`rounded-none` são numericamente idênticos ao token DS (logo nunca foram violação).

- [ ] **Step 3: Adicionar o resumo 1-linha da lição nova ao `ds-standards.md`**

A seção "Lições — resumo" do `ds-standards.md` é o atalho; adicione a linha correspondente à L-0NN criada.

- [ ] **Step 4: Escrever a entrada de audit log**

Em `.ai/status/pipeline-state.md`, no topo do log de sessões, entrada `CONCLUÍDO` no formato canônico (Input/Output/Decisões/Assumption/Lições novas). A **Assumption** a registrar: *"o ratchet por linha adicionada é suficiente — débito legado congelado não volta a crescer por outro caminho (ex.: arquivo novo inteiro conta como adicionado, então componente novo nasce limpo)."*

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md .claude/rules/ds-standards.md .ai/status/lessons.md .ai/status/pipeline-state.md
git commit -m "docs: fecha as superfícies do gate de estilos (hooks, lições, audit)

As tabelas de hooks do CLAUDE.md e do ds-standards.md diziam que o
ds-lint-styles cobre L-001..L-007 — L-004 e L-007 saíram (são
semânticas). Registra a lição nova (classificação determinístico vs
semântico) e a entrada de audit log da sessão."
```

---

## Task 7: Quick win — a única violação real do repo

**Files:**
- Modify: `src/components/ui/MenuSidebar/sidebar.styles.ts` (linha 158)

- [ ] **Step 1: Confirmar o contexto e o token**

```bash
sed -n '155,161p' src/components/ui/MenuSidebar/sidebar.styles.ts
grep -n "lg: scale\[9\]" tokens/brands/default/semantic/sizing.ts
```
Expected: a linha 158 é `"grid place-items-center w-9 h-9 rounded-full"`, e `comp.lg = scale[9] = 36px` — casa exatamente com `w-9 h-9` (36×36). Container **quadrado** → token correto é `size-comp-*`, não `min-h-form-*`. Se `comp.lg` não fosse 36px, **pare** e sinalize cascata pro DS Designer (Regra 3: dev não cria token).

- [ ] **Step 2: Aplicar a troca**

`w-9 h-9` → `size-comp-lg`. **Mantenha** o `rounded-full` (não é violação — idêntico ao token DS).

- [ ] **Step 3: Verificar lint, CSS e tipos**

```bash
node scripts/lint-styles.mjs --file src/components/ui/MenuSidebar/sidebar.styles.ts; echo "exit=$?"
grep -n "spacing-comp-lg" src/styles/theme/tailwind-theme.css
npx tsc --noEmit; echo "tsc exit=$?"
```
Expected: lint sem violação; `--spacing-comp-lg: 36px` existe; `tsc exit=0`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/MenuSidebar/sidebar.styles.ts
git commit -m "fix(MenuSidebar): w-9 h-9 → size-comp-lg (única violação real do baseline)

Container quadrado de 36px usava height literal. size-comp-lg = scale[9]
= 36px, troca sem mudança visual. Era o único hit genuíno dos 51 que a
medição do baseline encontrou (spec §1.1) — os outros 50 eram ruído de
pattern, já corrigido."
```

> Conferência visual no preview é do mantenedor (o plano não roda `npm run dev` — `CLAUDE.md` proíbe npm sem solicitação, e o dev server não termina). A troca é 36px → 36px, então não há mudança esperada.

---

## Task 8: Quick win — `USAGE.md` do DatePicker

**Files:**
- Create: `src/components/ui/DatePicker/USAGE.md`

Componente distribuído no registry sem `USAGE.md`, violando a convenção (todo componente em `ui/` tem o atalho pra IA consumir sem ler o source). Achado na medição.

- [ ] **Step 1: Ler o componente pra documentar a API real**

```bash
ls src/components/ui/DatePicker/
sed -n '1,70p' src/components/ui/DatePicker/datepicker.tsx
```
⚠️ **Não invente API.** O componente é `datepicker.tsx` (**não** existe `date-picker.tsx` nem `date-picker.types.ts` — os types são inline, ~linhas 30-44). Documente só o que estiver lá. O `mode` single/range/multiple entrou no commit `8fdcb0d` e precisa aparecer.

- [ ] **Step 2: Usar um USAGE existente como molde de formato**

Run: `cat src/components/ui/Chip/USAGE.md`

Seções obrigatórias: o que é + categoria · quando usar · props essenciais (tabela) · variants (tabela) · exemplo mínimo · gotchas.

- [ ] **Step 3: Escrever o arquivo**

Gotchas que valem entrar: depende de `Popover` + `Calendar` (registry dependencies), e o `mode` muda o shape do valor (`Date` vs range vs array).

- [ ] **Step 4: Verificar que o hook de inventário parou de reclamar**

```bash
echo '{"tool_input":{"file_path":"src/components/ui/DatePicker/datepicker.tsx"}}' \
  | bash .claude/hooks/ds-inventory-check.sh
```
Expected: sem menção a `USAGE.md ausente`.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DatePicker/USAGE.md
git commit -m "docs(DatePicker): adiciona USAGE.md (gap achado no baseline)

Componente distribuído no registry sem o atalho de doc que a convenção
exige. Documenta o mode single/range/multiple adicionado em 8fdcb0d."
```

---

## Task 9: Handoff via PR

- [ ] **Step 1: Rodar a suíte completa**

```bash
npx vitest run && npx tsc --noEmit && node scripts/lint-styles.mjs --ratchet origin/main && node scripts/distribution-debt.mjs
```
Expected: tudo verde. Os testes novos somam aos 2 arquivos que já existiam (27 testes).

- [ ] **Step 2: Abrir o PR**

Branch própria (nunca commit direto em `main` — Regra 7) → commit descritivo → push → `gh pr create` → reportar o link e **PARAR** (merge é gate humano — L-041).

⚠️ **Remote:** a Regra 8 diz "push no `mirror`", mas o CI e o branch protection desta iniciativa vivem no **`origin`** (`igreenlab`), e foi por `origin` que os PRs desta linha de trabalho passaram. Use `origin` e **mencione a divergência ao mantenedor** — o texto da Regra 8 parece desatualizado e vale corrigir num PR próprio.

No corpo do PR, deixe explícito:
- os checks novos **ainda não bloqueiam de fato** até branch protection marcá-los como required (ação manual do mantenedor, §5 da spec);
- `distribution-debt` na PR é **informativo** de propósito (Regra 8) — a forma bloqueante ficou no `release:check`;
- nenhum componente mudou de comportamento, exceto a troca de token equivalente no MenuSidebar (36px → 36px).

---

## Definição de pronto

- [ ] `npx vitest run` verde, incluindo os testes novos de pattern e de parse de diff
- [ ] `npx tsc --noEmit` exit 0
- [ ] Varredura completa acha exatamente **1** violação antes da Task 7 e **0** depois
- [ ] `node scripts/lint-styles.mjs --ratchet origin/main` exit 0
- [ ] `node scripts/distribution-debt.mjs` exit 0 (informativo) e `release:check` usa `--ci`
- [ ] Hook local ainda avisa (não bloqueia), sem greps próprios e sem código órfão (`WARNINGS`/`FOUND`/`check()` sumiram, 1 único `exit 0`)
- [ ] Zero pattern duplicado entre hook e CI (tabela só em `ds-lint-patterns.mjs`)
- [ ] `CLAUDE.md` + `ds-standards.md` não mencionam mais L-004/L-007 no `ds-lint-styles`
- [ ] Lição nova em `lessons.md` + resumo em `ds-standards.md` + entrada em `pipeline-state.md`
- [ ] `git status` limpo (nenhum arquivo de probe temporário sobrando)
- [ ] PR aberta e link reportado; **sem merge**
