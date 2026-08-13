import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMirror, mirrorPairs, toLF } = require("../../.claude/scripts/sync-agents-to-cursor.cjs");

/**
 * O `.cursor/rules/_agent-*.mdc` é espelho gerado de `.claude/agents/*.md`
 * (`npm run sync:agents`). Dois defeitos já viveram nesse script, e nenhum dos dois
 * quebrava nada visivelmente:
 *
 *  1. **Comparação por prefixo** — `existing.includes(body.slice(0, 200))` fazia toda
 *     edição depois do caractere 200 dar "Sem mudança". Medido em 2026-07-30: o
 *     `orchestrator.md` estava 217 linhas contra 173 do mirror, sem nenhuma das 9
 *     rotas de builder, e o script reportava "0 sincronizados, 6 sem mudança".
 *
 *  2. **Regex CRLF** — `/^---\n/` nunca casava `---\r\n` nos arquivos do repo, então
 *     o frontmatter não era extraído e ia parar na **linha 6** do `.mdc`, precedido
 *     pela nota de mirror. O Cursor exige `---` na linha 1 → nenhuma das 6 rules era
 *     auto-anexada. O script rodava, escrevia arquivo e reportava sucesso; o artefato
 *     era inerte (L-061).
 *
 * Nenhum gate cobria: `npm run sync:agents` não está no CI nem no `pre-commit-check`.
 * Aqui ele passa a estar — o teste é o gate.
 */
describe("cursor-mirror — buildMirror", () => {
  it("extrai frontmatter de fonte CRLF (o bug de 2026-08-08)", () => {
    const crlf = "---\r\nname: x\r\ndescription: y\r\n---\r\n\r\n# Corpo\r\n";
    const out = buildMirror(crlf, "x.md");
    expect(out.startsWith("---\nname: x"), "frontmatter tem que abrir na LINHA 1").toBe(true);
    expect(out).toContain("# Corpo");
  });

  it("funciona igual com fonte LF", () => {
    const lf = "---\nname: x\n---\n\n# Corpo\n";
    expect(buildMirror(lf, "x.md").startsWith("---\nname: x\n---")).toBe(true);
  });

  it("emite sempre LF, mesmo com entrada CRLF", () => {
    expect(buildMirror("---\r\nname: x\r\n---\r\n\r\nbody\r\n", "x.md")).not.toContain("\r");
  });

  it("põe a nota de mirror DEPOIS do frontmatter, nunca antes", () => {
    // Nota antes do `---` foi exatamente o que quebrou o parsing no Cursor.
    const out = buildMirror("---\nname: x\n---\n\nbody", "x.md");
    expect(out.indexOf("---")).toBeLessThan(out.indexOf("Mirror gerado"));
  });

  it("sem frontmatter, não inventa um", () => {
    const out = buildMirror("# Só corpo\n", "x.md");
    expect(out.startsWith("\n")).toBe(true);
    expect(out).toContain("# Só corpo");
  });
});

describe("cursor-mirror — o repo hoje", () => {
  it("os 6 .mdc estão em sync com os agents (rode `npm run sync:agents`)", () => {
    // Fecha o buraco que deixou o `_agent-orchestrator.mdc` 9 dias defasado, ensinando
    // `push mirror` (remote inexistente) e sem a rota `/ds-create-brand`.
    const fora = [];
    for (const { file, sourcePath, destPath } of mirrorPairs()) {
      const esperado = buildMirror(readFileSync(sourcePath, "utf8"), file);
      const atual = toLF(readFileSync(destPath, "utf8"));
      if (atual !== esperado) fora.push(file);
    }
    expect(fora, "mirror defasado — rode `npm run sync:agents` e commite").toEqual([]);
  });

  it("todo .mdc abre com `---` na linha 1 (senão o Cursor ignora a rule)", () => {
    for (const { destPath } of mirrorPairs()) {
      const txt = toLF(readFileSync(destPath, "utf8"));
      expect(txt.split("\n")[0], `${destPath} sem frontmatter na linha 1`).toBe("---");
    }
  });

  it("nenhum mirror ensina o remote `mirror`, que não existe", () => {
    // `git remote -v` → só `origin` (fork pessoal) e `empresa` (canônico).
    for (const { destPath } of mirrorPairs()) {
      const txt = readFileSync(destPath, "utf8");
      expect(/push\s+`?mirror`?/.test(txt), `${destPath} cita o remote inexistente`).toBe(false);
    }
  });
});
