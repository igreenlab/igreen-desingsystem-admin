import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { CITACOES, EXCECOES, deadThemeClasses } from "./dead-theme-classes.mjs";

/* Três grupos, por razões diferentes:

   1. "src/" — o gate original. Uma classe de cor inexistente no CÓDIGO reprova a
      PR. Fonte real e não fixture: o defeito que importa é o código e o tema
      DIVERGIREM no futuro, e só dado real detecta.

   2. "docs" — o gate novo (2026-08-08). A doc é o que GERA o código: 44 usos de
      vocabulário V2 sobreviveram meses nas skills — inclusive no `impl-igreen.md`,
      que é o template canônico — porque o gate olhava só `src/`. O `CLAUDE.md` do
      consumidor chegou a ensinar `ring-ring-primary/30 → ring-ring-primary`, isto é,
      trocar uma classe morta por outra, em todo projeto de scaffold.

   3. "classes de falha" — prova que o check enxerga o defeito E que não acusa
      código correto. O segundo caso é o que quase deu errado: sem a fronteira
      à direita, `border-border-warning` casa dentro de
      `border-border-warning-muted` e ~40 arquivos bons reprovam. */

const CSS = readFileSync("src/styles/theme/tailwind-theme.css", "utf8");

const walk = (d) =>
  readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = join(d, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const ler = (f) => ({ file: f.split(sep).join("/"), text: readFileSync(f, "utf8") });

const FONTES = walk("src")
  .filter((f) => /\.(ts|tsx|md)$/.test(f))
  .map(ler);

/* Superfícies que ENSINAM a IA a escrever componente. `cli/templates/` entra porque
   é distribuída: classe morta prescrita ali chega em todo projeto de scaffold.

   Fora do escopo, e de propósito: `lessons.md`, `pipeline-state.md`, `audits/`,
   `archive/` e `specs/` são registro HISTÓRICO — descrevem o que ERA verdade na data,
   e nomear a classe morta é o conteúdo deles. Reescrevê-los apagaria a evidência de
   por que a regra existe. */
const DOCS = ["CLAUDE.md", "README.md", ".claude/rules", ".claude/skills", ".claude/commands", ".claude/agents", ".ai/context", ".ai/rules", "cli/templates/default"]
  .filter(existsSync)
  .flatMap((p) => (statSync(p).isFile() ? [p] : walk(p)))
  .filter((f) => /\.mdx?$/.test(f))
  .filter((f) => !/lessons(-archive)?\.md$|pipeline-state\.md$/.test(f))
  .map(ler);

describe("classes de cor do DS × tema gerado (repo real)", () => {
  it("toda classe de cor usada em src/ tem CSS var correspondente", () => {
    const { mortas } = deadThemeClasses(CSS, FONTES);
    // Mensagem legível na falha: classe + onde, não só a contagem.
    expect(mortas.map((m) => `${m.classe} — ${m.file}:${m.line}`)).toEqual([]);
  });

  it("toda classe de cor PRESCRITA em doc/skill/kit existe no tema", () => {
    const { mortas } = deadThemeClasses(CSS, DOCS);
    expect(
      mortas.map(
        (m) =>
          `${m.classe} — ${m.file}:${m.line}  (se for CITAÇÃO deliberada, declare em CITACOES com o motivo)`,
      ),
    ).toEqual([]);
  });

  // Guarda contra o check virar vacuously-true: se o regex parasse de casar
  // nada, ou o CSS viesse vazio, o teste acima passaria sem medir.
  it("está medindo o repo inteiro, não um subconjunto vazio", () => {
    const { varsConhecidas, usosVarridos } = deadThemeClasses(CSS, FONTES);
    expect(varsConhecidas).toBeGreaterThan(50);
    expect(usosVarridos).toBeGreaterThan(1000);
  });

  it("o escopo de doc não é um subconjunto vazio", () => {
    expect(DOCS.length).toBeGreaterThan(80);
    expect(deadThemeClasses(CSS, DOCS).usosVarridos).toBeGreaterThan(200);
  });
});

describe("dead-theme-classes — o defeito que pega e o que NÃO acusa", () => {
  const css = `@theme {
    --color-ring-brand: #000;
    --color-border-warning-muted: #111;
    --color-fg-danger: #222;
  }`;

  it("acusa classe cuja var não existe (o caso ring-ring-primary)", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "a.ts", text: `"focus-visible:ring-4 focus-visible:ring-ring-primary"` },
    ]);
    expect(mortas).toEqual([{ classe: "ring-ring-primary", file: "a.ts", line: 1 }]);
  });

  it("NÃO acusa a classe correta cujo nome contém uma inexistente como prefixo", () => {
    // `border-border-warning` não existe; `border-border-warning-muted` existe.
    // Sem fronteira à direita, este teste falha — foi o bug real do instrumento.
    const { mortas } = deadThemeClasses(css, [
      { file: "b.ts", text: `"border border-border-warning-muted"` },
    ]);
    expect(mortas).toEqual([]);
  });

  it("aceita modificador de opacidade sem confundir o nome da var", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "c.ts", text: `"border-border-warning-muted/50"` },
    ]);
    expect(mortas).toEqual([]);
  });

  it("acusa dentro de variante (dark:, hover:, focus-visible:)", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "d.ts", text: `"dark:text-fg-critical hover:text-fg-danger"` },
    ]);
    expect(mortas.map((m) => m.classe)).toEqual(["text-fg-critical"]);
  });

  it("honra a exceção nomeada, e ela é estreita", () => {
    const alvo = "src/preview/pages/updates-data.ts";
    expect([...EXCECOES.keys()]).toEqual([alvo]);
    // toda exceção precisa de motivo escrito — é o que impede a lista de crescer calada
    for (const motivo of EXCECOES.values()) expect(motivo.length).toBeGreaterThan(20);
    // o mesmo texto reprova fora da exceção e passa dentro dela
    const texto = `"ring-ring-primary"`;
    expect(deadThemeClasses(css, [{ file: "qualquer.ts", text: texto }]).mortas).toHaveLength(1);
    expect(deadThemeClasses(css, [{ file: alvo, text: texto }]).mortas).toEqual([]);
  });

  it("reporta linha certa em arquivo multi-linha", () => {
    const { mortas } = deadThemeClasses(css, [
      { file: "e.ts", text: `ok\n"bg-bg-nao-existe"\nok` },
    ]);
    expect(mortas).toEqual([{ classe: "bg-bg-nao-existe", file: "e.ts", line: 2 }]);
  });

  it("NÃO acusa placeholder de template — `{` depois da classe não é classe", () => {
    // A doc ensina o padrão por template (`bg-bg-{cor}`, `text-fg-on-{cor}`).
    // Sem esta regra, `spec-component.md` reprovava por escrever a REGRA certa.
    const { mortas } = deadThemeClasses(css, [
      { file: "f.md", text: "| filled | `bg-bg-{cor}` + `text-fg-on-{cor}` |" },
    ]);
    expect(mortas).toEqual([]);
  });

  it("honra CITAÇÃO declarada por (arquivo, classe) — e só naquele par", () => {
    const texto = `"ring-ring-primary"`;
    // declarado em CLAUDE.md → passa
    expect(deadThemeClasses(css, [{ file: "CLAUDE.md", text: texto }]).mortas).toEqual([]);
    // MESMA classe em arquivo não declarado → reprova
    expect(deadThemeClasses(css, [{ file: ".claude/skills/x.md", text: texto }]).mortas).toHaveLength(1);
    // OUTRA classe morta no arquivo declarado → reprova (a exceção não cega o arquivo)
    expect(
      deadThemeClasses(css, [{ file: "CLAUDE.md", text: `"bg-bg-primary"` }]).mortas,
    ).toEqual([{ classe: "bg-bg-primary", file: "CLAUDE.md", line: 1 }]);
  });

  it("toda citação declarada tem motivo escrito", () => {
    // É o que impede a lista de crescer calada — mesma regra do EXCECOES.
    for (const [file, porClasse] of CITACOES) {
      expect(porClasse.size).toBeGreaterThan(0);
      for (const [classe, motivo] of porClasse) {
        expect(motivo.length, `${file} → ${classe} sem motivo`).toBeGreaterThan(30);
      }
    }
  });

  it("reproduz o defeito REAL que motivou o gate de doc (L-064)", () => {
    // Texto literal que estava no `cli/templates/default/CLAUDE.md` até 2026-08-08:
    // o anti-pattern mandava trocar a classe morta POR OUTRA CLASSE MORTA, e essa doc
    // é auto-lida por todo projeto de scaffold.
    const antes = "ring-ring-primary/30 → ring-ring-primary   ring-3 → ring-4";
    const { mortas } = deadThemeClasses(css, [{ file: ".claude/skills/qualquer.md", text: antes }]);
    expect(mortas.map((m) => m.classe)).toContain("ring-ring-primary");

    // E o texto corrigido passa.
    const depois = "ring-ring-brand/30 → ring-ring-brand   ring-3 → ring-4";
    expect(deadThemeClasses(css, [{ file: ".claude/skills/qualquer.md", text: depois }]).mortas).toEqual([]);
  });
});
