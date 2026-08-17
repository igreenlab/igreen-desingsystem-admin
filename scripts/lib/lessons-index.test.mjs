import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  lessonIds,
  citedIds,
  checkLessonsIndex,
  RESUMO,
  FONTES,
  COBERTAS_POR_GATE,
} from "./lessons-index.mjs";

/** Escreve um resumo mutilado num tmp e devolve o path (o caller apaga). */
function resumoSem(ids) {
  let txt = readFileSync(RESUMO, "utf8");
  for (const id of ids) txt = txt.replaceAll(id, "L-XXX");
  const tmp = join(tmpdir(), `ds-lessons-index-${ids.join("-")}.md`);
  writeFileSync(tmp, txt, "utf8");
  return tmp;
}

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
  it("acusa lição INALCANÇÁVEL — fora do resumo e sem gate (L-064: defeito real)", () => {
    // Reproduz o estado de 2026-08-08 usando a fonte REAL: L-044/045/046/048/049/050
    // existiam só no lessons.md (sob demanda) enquanto o resumo — o único que chega
    // à sessão — se dizia "o atalho 1-linha de TODAS". Nenhuma delas é coberta por
    // gate, então continuam reprovando depois da inversão.
    //
    // Fixture sintética não provaria nada: o parser podia estar quebrado e devolver
    // lista vazia dos dois lados, e o teste passaria igual.
    const AS_6 = ["L-044", "L-045", "L-046", "L-048", "L-049", "L-050"];
    const tmp = resumoSem(AS_6);
    const { ausentes } = checkLessonsIndex({ resumo: tmp });
    rmSync(tmp, { force: true });
    expect(ausentes).toEqual(AS_6);
  });

  it("lição COBERTA POR GATE não é acusada ao sair do resumo — a inversão", () => {
    // O ponto do D2: tirar a L-001 do resumo passa a ser legítimo, porque o
    // `ds-lint-patterns` a reprova sozinho. Dado REAL (resumo do repo, sem a L-001).
    const tmp = resumoSem(["L-001"]);
    const r = checkLessonsIndex({ resumo: tmp });
    rmSync(tmp, { force: true });
    expect(r.ausentes).not.toContain("L-001");
    expect(r.ausentes).toEqual([]);
  });

  it("lição SEM gate continua obrigatória no resumo — a garantia preservada", () => {
    // Contraprova do teste acima: a inversão não afrouxou nada pra quem não tem gate.
    // L-007 é o caso canônico — saiu do grep DE PROPÓSITO (exige julgamento, L-059),
    // então ela nunca pode ser dispensada do resumo.
    expect(COBERTAS_POR_GATE.has("L-007"), "L-007 exige julgamento: não pode ter gate").toBe(false);
    const tmp = resumoSem(["L-007"]);
    const { ausentes } = checkLessonsIndex({ resumo: tmp });
    rmSync(tmp, { force: true });
    expect(ausentes).toEqual(["L-007"]);
  });

  it("acusa declaração MORTA — gate declarado pra lição que não existe", () => {
    const r = checkLessonsIndex({ porGate: new Map([["L-999", "scripts/lib/ds-lint-patterns.mjs"]]) });
    expect(r.declaracoesMortas).toEqual(["L-999"]);
  });

  it("acusa gate declarado que não está no disco", () => {
    // Declaração apontando pra arquivo inexistente afirma cobertura que não existe:
    // é pior que ausência, porque quem lê para de investigar (L-060).
    const r = checkLessonsIndex({ porGate: new Map([["L-001", "scripts/lib/nao-existe.mjs"]]) });
    expect(r.gatesInexistentes).toEqual([
      { licao: "L-001", gate: "scripts/lib/nao-existe.mjs" },
    ]);
  });

  it("acusa id declarado duas vezes nas fontes", () => {
    const r = checkLessonsIndex({ fontes: [".ai/status/lessons.md", ".ai/status/lessons.md"] });
    expect(r.duplicadas.length).toBeGreaterThan(0);
  });
});

describe("lessons-index — o repo hoje", () => {
  it("TODA lição é alcançável — citada no resumo ou coberta por gate", () => {
    const { ausentes, total } = checkLessonsIndex();
    expect(
      ausentes,
      `lição inalcançável: não está no resumo de ${RESUMO} (auto-carregado) nem em ` +
        `COBERTAS_POR_GATE. Só existir no lessons.md não vale — ele é sob demanda`,
    ).toEqual([]);
    expect(total).toBeGreaterThanOrEqual(67);
  });

  it("nenhuma declaração de gate está morta, e todo gate declarado existe", () => {
    const { declaracoesMortas, gatesInexistentes } = checkLessonsIndex();
    expect(declaracoesMortas, "lição declarada em COBERTAS_POR_GATE não existe nas fontes").toEqual([]);
    expect(gatesInexistentes, "gate declarado não está no disco").toEqual([]);
  });

  it("o archive e o mapa não divergem — quem está arquivado tem gate declarado", () => {
    // `lessons-archive.md` existe com UMA premissa: "absorvidas em gate automático".
    // Se um id está lá e não está no mapa, uma das duas afirmações é falsa. Evita a
    // divergência clássica de duas listas descrevendo a mesma coisa (rules-parity).
    const arquivadas = lessonIds(readFileSync(FONTES[1], "utf8"));
    expect(arquivadas.length, "archive vazio? o teste perdeu o alvo").toBeGreaterThan(0);
    for (const id of arquivadas) {
      expect(
        COBERTAS_POR_GATE.has(id),
        `${id} está em lessons-archive.md ("absorvidas em gate") mas não em COBERTAS_POR_GATE`,
      ).toBe(true);
    }
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
