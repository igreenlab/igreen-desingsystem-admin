import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  contagensDeclaradas,
  checkContributorParity,
  DECLARANTES,
  DOCS_DO_CONTRIBUIDOR,
  IDENTIFICADORES,
} from "./contributor-parity.mjs";

/** Lê os declarantes do disco. */
const lerDocs = () =>
  Object.fromEntries(DECLARANTES.map(({ arquivo }) => [arquivo, readFileSync(arquivo, "utf8")]));

describe("contributor-parity — extração da contagem", () => {
  it("pega `toca **N superfícies**`", () => {
    expect(contagensDeclaradas("Um componente novo toca **8 superfícies** (L-042).")).toEqual([8]);
  });

  it("IGNORA a variante de roteamento — é outra contagem (L-047)", () => {
    // As três contagens do repo: 4 (roteamento de skill), 8 (componente), 10 (marca).
    // Somá-las reprovaria texto correto, que é pior que gate nenhum.
    expect(contagensDeclaradas("Uma skill builder nova toca **4 superfícies de roteamento**")).toEqual([]);
  });

  it("separa as duas quando aparecem no MESMO texto", () => {
    const txt = "componente toca **8 superfícies**; skill nova toca **4 superfícies de roteamento**";
    expect(contagensDeclaradas(txt)).toEqual([8]);
  });

  it("não confunde a contagem de marca, que aparece em prosa", () => {
    expect(contagensDeclaradas("marca nova mexe em **10 superfícies** ao todo")).toEqual([]);
  });
});

describe("contributor-parity — detecção", () => {
  const base = {
    "CONTRIBUTING.md": "toca **8 superfícies** src/components/index.ts @types/x",
    ".github/pull_request_template.md": "toca **8 superfícies** src/components/index.ts @types/x",
    ".claude/rules/ds-standards.md": "toca **8 superfícies**",
    ".claude/skills/ds-dev/handoff-pr.md": "toca **8 superfícies**",
  };

  it("em acordo → nenhum achado", () => {
    const r = checkContributorParity({ docs: base });
    expect(r.divergentes).toEqual([]);
    expect(r.semDeclaracao).toEqual([]);
    expect(r.faltandoIdentificador).toEqual([]);
    expect(r.consenso).toBe(8);
  });

  it("acusa o defeito REAL de 2026-08-15: um diz 7, o outro diz 8", () => {
    const docs = { ...base, "CONTRIBUTING.md": "toca **7 superfícies** src/components/index.ts @types/x" };
    const r = checkContributorParity({ docs });
    expect(r.consenso).toBe(8);
    expect(r.divergentes).toEqual([{ arquivo: "CONTRIBUTING.md", declarou: 7 }]);
  });

  it("acusa arquivo que PAROU de declarar — senão o gate cala sobre ele", () => {
    // Modo de falha sutil: apagar a frase faria o arquivo sair da comparação em silêncio,
    // e o gate passaria a "aprovar" um conjunto incompleto.
    const docs = { ...base, ".claude/skills/ds-dev/handoff-pr.md": "sem contagem aqui" };
    const r = checkContributorParity({ docs });
    expect(r.semDeclaracao).toEqual([".claude/skills/ds-dev/handoff-pr.md"]);
  });

  it("acusa doc do contribuidor sem o barrel — a superfície que faltava de verdade", () => {
    const docs = { ...base, "CONTRIBUTING.md": "toca **8 superfícies** @types/x" };
    const r = checkContributorParity({ docs });
    expect(r.faltandoIdentificador).toEqual([
      { arquivo: "CONTRIBUTING.md", chave: "src/components/index.ts", oque: IDENTIFICADORES[0].oque },
    ]);
  });

  it("não cobra identificador de quem não é doc do contribuidor", () => {
    // ds-standards e handoff-pr declaram a contagem, mas não são os docs que alcançam
    // quem não usa Claude Code — cobrar deles inflaria arquivo auto-carregado.
    const r = checkContributorParity({ docs: base });
    expect(r.faltandoIdentificador).toEqual([]);
    expect(DOCS_DO_CONTRIBUIDOR).not.toContain(".claude/rules/ds-standards.md");
  });
});

describe("contributor-parity — o repo hoje", () => {
  it("os 4 declarantes existem e declaram a contagem", () => {
    const r = checkContributorParity({ docs: lerDocs() });
    expect(
      r.semDeclaracao,
      "arquivo que devia declarar `toca **N superfícies**` e não declara — sem isso o gate " +
        "para de comparar esse arquivo em silêncio",
    ).toEqual([]);
  });

  it("todos declaram a MESMA contagem", () => {
    const r = checkContributorParity({ docs: lerDocs() });
    expect(
      r.divergentes.map((d) => `${d.arquivo} diz ${d.declarou}, o resto diz ${r.consenso}`),
      "contagem de superfícies divergente entre os docs — foi assim que o CONTRIBUTING ficou " +
        "ensinando 7 enquanto o template de PR ensinava 8, e quem seguiu o primeiro entregou " +
        "componente sem o export no barrel",
    ).toEqual([]);
  });

  it("a contagem em acordo é 8 — o valor da L-042", () => {
    // Ancorar no número protege contra o caso em que TODOS mudam juntos pro valor errado:
    // acordo em 7 passaria no teste acima e continuaria escondendo o barrel.
    expect(checkContributorParity({ docs: lerDocs() }).consenso).toBe(8);
  });

  it("os dois docs do contribuidor mencionam barrel e dep de tipo", () => {
    const r = checkContributorParity({ docs: lerDocs() });
    expect(
      r.faltandoIdentificador.map((f) => `${f.arquivo}: falta "${f.chave}" — ${f.oque}`),
      "superfície que JÁ foi esquecida e voltou a não ser mencionada",
    ).toEqual([]);
  });

  it("REPROVA o estado real de antes da PR #178 (L-064: dado real, não fixture)", () => {
    // Fixture sintética concorda por construção. Aqui eu pego o `CONTRIBUTING.md` como ele
    // REALMENTE estava antes da correção e confirmo que o gate acusa.
    //
    // Fail-open se o commit não estiver alcançável (clone shallow): melhor pular avisando
    // que reprovar por falta de histórico.
    let antigo;
    try {
      antigo = execFileSync("git", ["show", "2b18edd~1:CONTRIBUTING.md"], {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch {
      console.warn("::warning::contributor-parity: commit 2b18edd~1 inalcançável — prova histórica PULADA");
      return;
    }

    const r = checkContributorParity({ docs: { ...lerDocs(), "CONTRIBUTING.md": antigo } });

    // O texto antigo dizia "toca 7 LUGARES", fora do formato `**N superfícies**` — então a
    // divergência de CONTAGEM não dispara nele. Quem pega é a ausência de declaração e a
    // dos identificadores. Duas redes independentes, e é bom que sejam: a de contagem
    // protege divergência futura no formato padrão; a de presença pegou o defeito real.
    expect(r.semDeclaracao).toContain("CONTRIBUTING.md");
    expect(r.faltandoIdentificador.map((f) => f.chave)).toEqual(
      expect.arrayContaining(["src/components/index.ts", "@types/"]),
    );
  });

  it("o fraseado da L-047 continua distinguível — a premissa do parser", () => {
    // Se alguém reescrever "4 superfícies de roteamento" sem o qualificador, o gate passa
    // a conflitar as duas contagens e reprova texto correto. Este teste é o alarme.
    const std = readFileSync(".claude/rules/ds-standards.md", "utf8");
    const temL047 = /toca\s+\*\*4\s+superfícies\s+de\s+roteamento/.test(std);
    expect(
      temL047,
      "a frase da L-047 perdeu o qualificador 'de roteamento' — o parser do contributor-parity " +
        "depende dele pra não confundir com as 8 superfícies de componente",
    ).toBe(true);
  });
});
