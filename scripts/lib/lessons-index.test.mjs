import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lessonIds, citedIds, checkLessonsIndex, RESUMO } from "./lessons-index.mjs";

describe("lessons-index — parsing", () => {
  it("lê os ids dos headers `## [L-NNN]`", () => {
    expect(lessonIds("## [L-001] a\ntexto\n## [L-042] b")).toEqual(["L-001", "L-042"]);
  });

  it("ignora o template `## [L-NNN] Título curto`", () => {
    // O lessons.md abre com um template literal; contá-lo inflaria o total em 1.
    expect(lessonIds("## [L-NNN] Título curto\n## [L-007] real")).toEqual(["L-007"]);
  });

  it("citação conta em qualquer forma", () => {
    const c = citedIds("- **L-042** algo · ver (L-058) e L-001.");
    expect([...c].sort()).toEqual(["L-001", "L-042", "L-058"]);
  });

  it("não confunde L-04 com L-042", () => {
    expect(citedIds("L-04 solto").has("L-042")).toBe(false);
  });
});

describe("lessons-index — detecção", () => {
  it("acusa lição da fonte ausente do resumo (L-064: reproduz o defeito real)", () => {
    // Reproduz o estado de 2026-08-08 usando a fonte REAL: L-044/045/046/048/049/050
    // existiam só no lessons.md (sob demanda) enquanto o resumo — o único que chega
    // à sessão — se dizia "o atalho 1-linha de TODAS".
    //
    // Fixture sintética não provaria nada: o parser podia estar quebrado e devolver
    // lista vazia dos dois lados, e o teste passaria igual.
    const resumoReal = readFileSync(RESUMO, "utf8");
    const AS_6 = ["L-044", "L-045", "L-046", "L-048", "L-049", "L-050"];
    let mutilado = resumoReal;
    for (const id of AS_6) mutilado = mutilado.replaceAll(id, "L-XXX");

    const tmp = join(tmpdir(), "ds-lessons-index-resumo-mutilado.md");
    writeFileSync(tmp, mutilado, "utf8");
    const { ausentes } = checkLessonsIndex({ resumo: tmp });
    rmSync(tmp, { force: true });

    expect(ausentes).toEqual(AS_6);
  });

  it("acusa id declarado duas vezes nas fontes", () => {
    // Numeração colidida quebra a referência por número — o mesmo "L-NNN" apontando
    // pra duas lições diferentes.
    const r = checkLessonsIndex({ fontes: [".ai/status/lessons.md", ".ai/status/lessons.md"] });
    expect(r.duplicadas.length).toBeGreaterThan(0);
  });
});

describe("lessons-index — o repo hoje", () => {
  it("TODA lição da fonte está citada no resumo auto-carregado", () => {
    const { ausentes, total } = checkLessonsIndex();
    expect(
      ausentes,
      `lição fora do resumo de ${RESUMO} — só existe no lessons.md, que é sob demanda, então não chega na sessão`,
    ).toEqual([]);
    expect(total).toBeGreaterThanOrEqual(67);
  });

  it("nenhum id de lição está duplicado entre ativas e arquivadas", () => {
    expect(checkLessonsIndex().duplicadas).toEqual([]);
  });

  it("o resumo declara a contagem certa no próprio título", () => {
    // A linha "## NN Lições (L-001 a L-0NN) — resumo" é lida por humano e por agente;
    // errada, ela mesma vira a desinformação que a L-060 descreve.
    const { total } = checkLessonsIndex();
    const resumo = readFileSync(RESUMO, "utf8");
    const m = /^##\s*(\d+)\s+Lições\s*\(L-001 a (L-\d{3})\)/m.exec(resumo);
    expect(m, "não achei o header `## NN Lições (L-001 a L-0NN) — resumo`").not.toBeNull();
    expect(Number(m[1]), "contagem no título do resumo").toBe(total);
    expect(m[2], "última lição no título do resumo").toBe(`L-${String(total).padStart(3, "0")}`);
  });
});
