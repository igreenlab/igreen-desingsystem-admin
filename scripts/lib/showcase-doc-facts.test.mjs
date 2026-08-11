import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  checarContagemRegistry,
  checarContagemLicoes,
  checarArquivosNomeados,
  checarCoberturaCommands,
  checarFrasesBanidas,
  CITACOES_FRASE,
  ARQUIVOS_ILUSTRATIVOS,
  auditarFatosDaDoc,
} from "./showcase-doc-facts.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Leitura do estado REAL (só aqui — o módulo é puro)
   ═══════════════════════════════════════════════════════════════════════════ */

const PAGES = "src/preview/pages";

/** Páginas do showcase que descrevem o pipeline/distribuição. */
const DOCS_DE_PIPELINE = [
  "DistributionDoc.tsx",
  "StructureDoc.tsx",
  "InstallationDoc.tsx",
  "AgentsOverviewDoc.tsx",
  "PipelineSkillsDoc.tsx",
  "PipelineCommandsDoc.tsx",
  "PipelineHooksDoc.tsx",
  "PipelineMcpDoc.tsx",
  "PipelineMemoryDoc.tsx",
  "PipelineOutputStylesDoc.tsx",
];

function lerDoc(nome) {
  return readFileSync(join(PAGES, nome), "utf8");
}

/**
 * Basenames de todo `.md` do repo. Pastas fora: as que não são fonte (`node_modules`,
 * builds) e as de trabalho (`lp/`, `projeto/`) — um `.md` que só existe num sandbox não
 * deveria isentar a doc.
 */
const IGNORAR = new Set([
  "node_modules",
  "dist",
  "dist-lib",
  ".git",
  "lp",
  "projeto",
  "design-tabela",
  "my-app",
  "public",
]);

function arquivosMdNoRepo(raiz = ".") {
  const nomes = new Set();
  for (const e of readdirSync(raiz, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = join(raiz, e.name);
    if (e.isDirectory()) {
      for (const n of arquivosMdNoRepo(p)) nomes.add(n);
    } else if (e.name.endsWith(".md")) {
      nomes.add(e.name);
    }
  }
  return nomes;
}

function commandsNoDisco() {
  return new Set(
    readdirSync(".claude/commands")
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, "")),
  );
}

/** Última lição, ativas e arquivadas — direto das fontes. */
function fatosDasLicoes() {
  const ids = (p) =>
    existsSync(p)
      ? new Set([...readFileSync(p, "utf8").matchAll(/L-(\d{3})/g)].map((m) => Number(m[1])))
      : new Set();
  const ativas = ids(".ai/status/lessons.md");
  const arquivadas = ids(".ai/status/lessons-archive.md");
  const todas = new Set([...ativas, ...arquivadas]);
  return {
    ultima: Math.max(...todas),
    // "ativas" = a lição vive só no lessons.md; "arquivadas" = está no archive.
    arquivadas: arquivadas.size,
    ativas: todas.size - arquivadas.size,
  };
}

function entradaAuditoria() {
  const licoes = fatosDasLicoes();
  return {
    distributionDoc: lerDoc("DistributionDoc.tsx"),
    totalItensRegistry: JSON.parse(readFileSync("registry.json", "utf8")).items.length,
    docsComLicoes: ["StructureDoc.tsx", "AgentsOverviewDoc.tsx"].map((n) => ({
      arquivo: `${PAGES}/${n}`,
      texto: lerDoc(n),
    })),
    ultimaLicao: licoes.ultima,
    licoesAtivas: licoes.ativas,
    licoesArquivadas: licoes.arquivadas,
    arquivosMdNoRepo: arquivosMdNoRepo(),
    commandsDoc: lerDoc("PipelineCommandsDoc.tsx"),
    commandsNoDisco: commandsNoDisco(),
    todasAsDocs: DOCS_DE_PIPELINE.map((n) => ({ arquivo: `${PAGES}/${n}`, texto: lerDoc(n) })),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   O estado atual passa
   ═══════════════════════════════════════════════════════════════════════════ */

describe("showcase-doc-facts — estado atual do repo", () => {
  it("nenhum fato mecânico divergente nas páginas de pipeline", () => {
    const achados = auditarFatosDaDoc(entradaAuditoria());
    // Falha legível: o teste tem que dizer O QUE consertar, não só "esperava 0".
    expect(
      achados.map((a) => `${a.arquivo} — ${a.o_que}\n    → ${a.conserto}`).join("\n"),
    ).toBe("");
  });

  it("as fontes de verdade existem (senão o gate passa por medir vazio)", () => {
    const e = entradaAuditoria();
    expect(e.totalItensRegistry).toBeGreaterThan(50);
    expect(e.ultimaLicao).toBeGreaterThanOrEqual(69);
    expect(e.arquivosMdNoRepo.size).toBeGreaterThan(60);
    expect(e.commandsNoDisco.size).toBeGreaterThanOrEqual(15);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Detecção — cada caso é o defeito REAL medido em 2026-08-11 (L-064)
   ═══════════════════════════════════════════════════════════════════════════ */

describe("showcase-doc-facts — reproduz os defeitos que motivaram o gate", () => {
  it("contagem do registry: a página dizia 87, havia 91", () => {
    const doc = lerDoc("DistributionDoc.tsx").replace(
      "lista os 91 itens",
      "lista os 87 itens",
    );
    const achados = checarContagemRegistry(doc, 91);
    expect(achados).toHaveLength(1);
    expect(achados[0].o_que).toContain("afirma 87");
    expect(achados[0].conserto).toContain("lista os 91 itens");
  });

  it("contagem do registry: sem a âncora, o gate ACUSA em vez de ficar cego", () => {
    // O modo de falha silencioso de um gate ancorado em frase é a frase mudar.
    const achados = checarContagemRegistry("nada aqui", 91);
    expect(achados).toHaveLength(1);
    expect(achados[0].o_que).toContain("desapareceu");
  });

  it("faixa de lições: o StructureDoc dizia L-001..L-037", () => {
    const achados = checarContagemLicoes(
      [{ arquivo: "StructureDoc.tsx", texto: "← Lessons L-001..L-037" }],
      69,
      64,
      5,
    );
    expect(achados).toHaveLength(1);
    expect(achados[0].conserto).toBe("troque por L-001..L-069");
  });

  it("total de lições: o AgentsOverviewDoc dizia 64 (59 + 5)", () => {
    const achados = checarContagemLicoes(
      [
        {
          arquivo: "AgentsOverviewDoc.tsx",
          texto: "Error log — 64 lessons (59 active + 5 archived once absorbed into a gate)",
        },
      ],
      69,
      64,
      5,
    );
    expect(achados).toHaveLength(1);
    expect(achados[0].o_que).toContain("afirma 64 lessons (59 active + 5 archived)");
  });

  it("arquivo nomeado e inexistente: os 4 spec-token-*.md que nunca existiram", () => {
    // Conteúdo literal da página antes do fix. A última linha (spec-component.md) EXISTE
    // e tem que passar — senão o teste confirmaria um gate que reprova tudo.
    const antes = `
      <p className="ml-sp-2xl">spec-token-color.md        <span>← color/dark mode tokens</span></p>
      <p className="ml-sp-2xl">spec-token-spacing.md      <span>← gap, pad, sp</span></p>
      <p className="ml-sp-2xl">spec-token-sizing.md       <span>← form, icon, radius, shadow</span></p>
      <p className="ml-sp-2xl">spec-token-typography.md   <span>← presets</span></p>
      <p className="ml-sp-2xl">spec-component.md          <span>← novo componente</span></p>
    `;
    // Disco REAL: se o parser estiver quebrado, este teste não passa por acidente.
    const achados = checarArquivosNomeados(
      [{ arquivo: "PipelineSkillsDoc.tsx", texto: antes }],
      arquivosMdNoRepo(),
    );
    expect(achados.map((a) => a.o_que.match(/"([^"]+)"/)[1])).toEqual([
      "spec-token-color.md",
      "spec-token-spacing.md",
      "spec-token-sizing.md",
      "spec-token-typography.md",
    ]);
  });

  it("NÃO acusa arquivo que existe fora de .claude/skills/ (o falso positivo da 1ª versão)", () => {
    // A 1ª versão exigia `.claude/skills/` e acusou estes três de cara. As páginas os
    // citam legitimamente, ao explicar de onde uma skill lê contexto.
    const texto = "a skill lê ds-standards.md, dashboard-patterns.md e pipeline-state.md";
    expect(
      checarArquivosNomeados([{ arquivo: "X.tsx", texto }], arquivosMdNoRepo()),
    ).toEqual([]);
  });

  it("cobertura de commands: a página listava 8 dos 15", () => {
    const os8 = [
      "ds-create-component",
      "ds-create-composite",
      "ds-add-shadcn",
      "ds-add-token",
      "ds-extract-figma",
      "ds-update",
      "ds-release",
      "ds-create-crud",
    ];
    const doc = os8.map((n) => `<p>${n}.md</p>`).join("\n");
    const faltando = checarCoberturaCommands(doc, commandsNoDisco())
      .filter((a) => a.o_que.includes("não aparece"))
      .map((a) => a.o_que.match(/\/(\S+) existe/)[1]);
    expect(faltando.sort()).toEqual(
      [
        "ds-create-app",
        "ds-create-brand",
        "ds-create-dashboard",
        "ds-create-list",
        "ds-create-login",
        "ds-create-screen",
        "ds-replicate-module",
      ].sort(),
    );
  });

  it("cobertura de commands: pega a direção inversa também", () => {
    const doc = "<p>ds-create-fantasma.md</p>";
    const achados = checarCoberturaCommands(doc, commandsNoDisco());
    expect(achados.some((a) => a.o_que.includes("ds-create-fantasma"))).toBe(true);
  });

  it('frase banida: "auto-loaded by glob" nas 3 páginas que a tinham', () => {
    const achados = checarFrasesBanidas([
      { arquivo: "InstallationDoc.tsx", texto: "ds-standards.md — auto-loaded by glob for any DS work" },
      { arquivo: "PipelineSkillsDoc.tsx", texto: "<li>Auto-loaded by glob match</li>" },
      { arquivo: "StructureDoc.tsx", texto: 'desc="ds-standards.md auto-loaded by glob — 8 rules"' },
    ]);
    expect(achados).toHaveLength(3);
    expect(achados[0].o_que).toContain("sintaxe do Cursor");
  });

  it('frase banida: "o hook formata" (o formatador nunca rodou — L-061)', () => {
    const achados = checarFrasesBanidas([
      { arquivo: "X.tsx", texto: "Não precisa rodar nada: o hook formata automaticamente." },
    ]);
    expect(achados).toHaveLength(1);
    expect(achados[0].o_que).toContain("no-op mudo");
  });

  it("citação declarada isenta o PAR (arquivo, frase), não a frase toda", () => {
    const docs = [
      { arquivo: "A.tsx", texto: "auto-loaded by glob" },
      { arquivo: "B.tsx", texto: "auto-loaded by glob" },
    ];
    const soA = checarFrasesBanidas(docs, new Set(["A.tsx::0"]));
    expect(soA.map((a) => a.arquivo.split(":")[0])).toEqual(["B.tsx"]);
  });

  it("o achado aponta a LINHA da frase, não só o arquivo", () => {
    const texto = "linha 1\nlinha 2\nauto-loaded by glob\n";
    const [a] = checarFrasesBanidas([{ arquivo: "X.tsx", texto }]);
    expect(a.arquivo).toBe("X.tsx:3");
  });
});

describe("showcase-doc-facts — higiene do próprio gate", () => {
  it("toda citação declarada tem motivo (senão a lista vira despejo)", () => {
    for (const [par, motivo] of CITACOES_FRASE) {
      expect(typeof motivo === "string" && motivo.length > 10, `sem motivo: ${par}`).toBe(true);
    }
  });

  it("todo arquivo ilustrativo declarado tem motivo", () => {
    for (const [par, motivo] of ARQUIVOS_ILUSTRATIVOS) {
      expect(typeof motivo === "string" && motivo.length > 10, `sem motivo: ${par}`).toBe(true);
    }
  });

  it("nenhuma exceção de arquivo ilustrativo está MORTA", () => {
    // Duas formas de morrer, ambas fazem a lista mentir sobre o que protege:
    // a doc parou de citar o nome, ou o arquivo passou a existir de verdade.
    const noRepo = arquivosMdNoRepo();
    for (const par of ARQUIVOS_ILUSTRATIVOS.keys()) {
      const [arquivo, nome] = par.split("::");
      expect(existsSync(arquivo), `exceção aponta pra página inexistente: ${arquivo}`).toBe(true);
      expect(
        readFileSync(arquivo, "utf8").includes(nome),
        `exceção morta: ${arquivo} não cita mais "${nome}"`,
      ).toBe(true);
      expect(noRepo.has(nome), `exceção desnecessária: "${nome}" existe no repo`).toBe(false);
    }
  });

  it("citação declarada pra página que existe e ainda contém a frase", () => {
    // Exceção morta é pior que exceção: parece proteção e não protege nada.
    for (const par of CITACOES_FRASE.keys()) {
      const [arquivo] = par.split("::");
      expect(existsSync(arquivo), `citação aponta pra arquivo inexistente: ${arquivo}`).toBe(true);
    }
  });
});
