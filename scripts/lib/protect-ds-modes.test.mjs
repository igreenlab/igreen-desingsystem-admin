/**
 * Testa o `protect-ds.mjs` do payload do consumidor **rodando o processo de verdade** —
 * stdin JSON, exit code, stderr. Não há como testar este hook por import: o contrato dele
 * com o Claude Code É o exit code (0 libera · 1 avisa · 2 bloqueia).
 *
 * ## Por que este arquivo existe
 *
 * O hook decide **bloquear ou liberar** escrita no projeto de outra pessoa, e não tinha
 * nenhum teste. Em 2026-08-18 ele ganhou consciência de modo pra poder ser projetado no
 * canal submódulo (a maioria do uso), e o risco dessa mudança é assimétrico:
 *
 *   falso NEGATIVO em submódulo → o tema do DS é editado e ninguém avisa (o que o hook existe pra impedir)
 *   falso POSITIVO em submódulo → avisa sobre o `src/` DO CONSUMIDOR, e o reflexo é desligar o hook
 *
 * Os dois lados estão fixados abaixo. E o caso copy-in existe pra provar que a mudança
 * **não alterou o comportamento antigo** — sem `ds-config.json` nada muda.
 *
 * ## Quais casos DISCRIMINAM a mudança — medido contra o hook antigo (L-064)
 *
 * Rodei os fixtures contra `git show HEAD:<hook>` antes de acreditar no verde. Só **dois**
 * casos mudam de resultado; os outros já passavam, e dizer que os 11 "provam" a mudança
 * seria falso:
 *
 *   src/ do CONSUMIDOR         antigo 2 → novo 0   ← o falso positivo, e a razão da exclusão
 *   tokens/ do submódulo       antigo 0 → novo 2   ← cobertura nova
 *   tema em <dsPath>/src/…     antigo 2 = novo 2   já funcionava (match por `includes`)
 *   lint h-10/gap-4 na tela    antigo 1 = novo 1   já funcionava
 *
 * A leitura correta disso: o hook **sempre soube** lintar o código do consumidor. O que
 * desligava o lint no canal submódulo era o `ds:link` não projetar o arquivo — e o que
 * tornava a projeção insegura era o falso positivo da 1ª linha. A consciência de modo não
 * "traz o lint": ela remove o motivo da exclusão. Os casos que não discriminam ficam como
 * guarda de regressão do comportamento copy-in, que não pode mudar.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK_SRC = "cli/templates/default/_claude/hooks/protect-ds.mjs";
const PATTERNS_SRC = "cli/templates/default/_claude/hooks/ds-lint-patterns.mjs";

/**
 * Monta um projeto-consumidor temporário e roda o hook DENTRO dele (cwd), porque é assim
 * que o Claude Code o executa — e é o cwd que determina se o `ds-config.json` é achado.
 *
 * @param {object|null} cfg  conteúdo do `.claude/ds-config.json`; null = copy-in
 * @param {object} toolInput o `tool_input` do payload do hook
 */
function roda(cfg, toolInput) {
  const dir = mkdtempSync(join(tmpdir(), "protect-ds-"));
  try {
    mkdirSync(join(dir, ".claude", "hooks"), { recursive: true });
    copyFileSync(HOOK_SRC, join(dir, ".claude", "hooks", "protect-ds.mjs"));
    copyFileSync(PATTERNS_SRC, join(dir, ".claude", "hooks", "ds-lint-patterns.mjs"));
    if (cfg) writeFileSync(join(dir, ".claude", "ds-config.json"), JSON.stringify(cfg));

    const r = spawnSync(process.execPath, [join(".claude", "hooks", "protect-ds.mjs")], {
      cwd: dir,
      input: JSON.stringify({ tool_input: toolInput }),
      encoding: "utf8",
    });
    return { code: r.status, err: r.stderr || "" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const SUB = { mode: "submodule", dsPath: "design-system", alias: "@ds" };

describe("protect-ds — modo copy-in (sem ds-config) não mudou", () => {
  it("bloqueia o tema (exit 2)", () => {
    const r = roda(null, { file_path: "src/styles/theme/tailwind-theme.css", content: "x" });
    expect(r.code).toBe(2);
    expect(r.err).toContain("GERENCIADO");
  });

  it("avisa em componente do DS (exit 1)", () => {
    const r = roda(null, { file_path: "src/components/ui/Button/button.styles.ts", content: "x" });
    expect(r.code).toBe(1);
  });

  it("libera tela do consumidor sem anti-pattern (exit 0)", () => {
    const r = roda(null, { file_path: "src/pages/Foo.tsx", content: '<div className="gap-gp-md" />' });
    expect(r.code).toBe(0);
  });
});

describe("protect-ds — modo submódulo", () => {
  it("bloqueia o tema DENTRO do submódulo (exit 2)", () => {
    const r = roda(SUB, { file_path: "design-system/src/styles/theme/tailwind-theme.css", content: "x" });
    expect(r.code, "o tema do DS tem de ser bloqueado também em submódulo").toBe(2);
  });

  it("bloqueia tokens/ do submódulo — path que só existe neste modo", () => {
    const r = roda(SUB, { file_path: "design-system/tokens/brands/default/semantic/color-light.ts", content: "x" });
    expect(r.code).toBe(2);
  });

  it("NÃO confunde o src/ do consumidor com o do DS (o falso positivo que desligaria o hook)", () => {
    // Antes da consciência de modo, o path abaixo casaria `src/styles/theme/` por
    // `includes` e o consumidor receberia "não edite, é gerenciado" sobre arquivo DELE.
    const r = roda(SUB, { file_path: "src/styles/theme/meu-tema.css", content: "x" });
    expect(r.code, "esse arquivo é do consumidor — liberar").toBe(0);
  });

  it("avisa que editar componente do DS é edição no repo do submódulo", () => {
    const r = roda(SUB, { file_path: "design-system/src/components/ui/Button/button.styles.ts", content: "x" });
    expect(r.code).toBe(1);
    expect(r.err, "a mensagem tem de citar submódulo, não igreen:update").toContain("SUBMÓDULO");
  });

  it("a mensagem NÃO manda rodar igreen:add, que não existe neste canal", () => {
    const r = roda(SUB, { file_path: "design-system/src/utils/tv.ts", content: "x" });
    expect(r.code).toBe(2);
    expect(r.err).not.toContain("igreen:add");
    expect(r.err, "tem de dar o conserto REAL do canal").toContain("git -C design-system");
  });
});

describe("protect-ds — o lint de conteúdo, que era o que se perdia", () => {
  it("pega anti-pattern na tela do consumidor EM MODO SUBMÓDULO", () => {
    // Este é o ganho central: em submódulo o hook nem rodava, então `h-10` num arquivo
    // novo do consumidor passava 100% limpo — sem lint em canal nenhum.
    const r = roda(SUB, { file_path: "src/pages/Nova.tsx", content: '<button className="h-10 gap-4" />' });
    expect(r.code, "h-10/gap-4 têm de avisar").toBe(1);
    expect(r.err).toContain("anti-pattern");
  });

  it("pega hex cru na tela do consumidor em submódulo", () => {
    const r = roda(SUB, { file_path: "src/pages/Nova.tsx", content: '<div className="bg-[#0fff00]" />' });
    expect(r.code).toBe(1);
    expect(r.err).toContain("HEX");
  });

  it("NÃO linta o código do DS — débito legado dele não é ruído do consumidor", () => {
    const r = roda(SUB, { file_path: "design-system/src/preview/pages/FooDoc.tsx", content: '<div className="h-10 gap-4" />' });
    expect(r.code, "arquivo do DS: o CI do DS é que linta").toBe(0);
  });
});
