import { describe, it, expect } from "vitest";
import {
  skillFolders,
  citedSkills,
  resolvesToDisk,
  checkSkillsRouting,
  readAllMd,
  routingText,
  ROUTING_EXCEPTIONS,
  CITATION_EXCEPTIONS,
} from "./skills-routing.mjs";

describe("skills-routing — parsing", () => {
  it("pega as 3 formas de citar uma skill", () => {
    const t = [
      "carregar `.claude/skills/crud-builder/SKILL.md`",
      "ver `list-builder/SKILL.md`",
      "→ skill `charts`",
    ].join("\n");
    expect([...citedSkills(t)].sort()).toEqual(["charts", "crud-builder", "list-builder"]);
  });

  it("`skills` no plural NÃO é citação de rota", () => {
    // "as skills `crud-builder` e `list-builder`" é prosa, não instrução de carga.
    expect(citedSkills("as skills `foo` e `bar` fazem X").has("foo")).toBe(false);
  });

  it("sub-arquivo resolve pra disco — `release` é ds-dev/release.md", () => {
    // A 1ª versão do gate acusou `release`, `update-changelog` e `ds-kit` como rota
    // morta. Os dois primeiros são SUB-ARQUIVOS de `ds-dev`, e estão lá.
    const pastas = skillFolders();
    expect(resolvesToDisk("release", pastas), "ds-dev/release.md existe").toBe(true);
    expect(resolvesToDisk("update-changelog", pastas)).toBe(true);
    expect(resolvesToDisk("handoff-pr", pastas)).toBe(true);
    expect(resolvesToDisk("skill-que-nao-existe", pastas)).toBe(false);
  });
});

describe("skills-routing — detecção", () => {
  it("acusa skill do disco que nenhum entry point cita", () => {
    // Skill só no disco depende de auto-descoberta por `description`, que é loteria.
    const { naoRoteadas } = checkSkillsRouting({
      pastas: ["crud-builder", "fantasma"],
      entry: "carregar `.claude/skills/crud-builder/SKILL.md`",
      arquivos: [],
    });
    expect(naoRoteadas).toEqual(["fantasma"]);
  });

  it("acusa rota pra skill inexistente, com o ARQUIVO que a contém", () => {
    // Era o caso real: dashboard-builder/SKILL.md roteava pra `charts` e `page-edit`,
    // que só existem no payload do consumidor. O agente do repo perdia o turno.
    const { rotasMortas } = checkSkillsRouting({
      pastas: ["dashboard-builder"],
      entry: "`.claude/skills/dashboard-builder/SKILL.md`",
      arquivos: [{ path: "x/SKILL.md", texto: "gráfico isolado → skill `charts`" }],
    });
    expect(rotasMortas).toEqual(["x/SKILL.md → `charts`"]);
  });

  it("a exceção de citação é escopada por (arquivo, nome), não por nome solto", () => {
    // Mesmo mecanismo do CITACOES do dead-theme-classes: o arquivo que DIZ "a skill
    // charts não existe" é a correção; outro arquivo citando o mesmo nome como ROTA
    // continua reprovando.
    const base = { pastas: ["dashboard-builder"], entry: "`.claude/skills/dashboard-builder/SKILL.md`" };
    const permitido = ".claude/commands/ds-create-dashboard.md";
    expect(
      checkSkillsRouting({
        ...base,
        arquivos: [{ path: permitido, texto: "não existe skill `charts` neste repo" }],
      }).rotasMortas,
    ).toEqual([]);
    expect(
      checkSkillsRouting({
        ...base,
        arquivos: [{ path: "outro/SKILL.md", texto: "→ skill `charts`" }],
      }).rotasMortas,
    ).toEqual(["outro/SKILL.md → `charts`"]);
  });
});

describe("skills-routing — o repo hoje", () => {
  it("toda skill do disco é alcançável por command, orchestrator ou pela rule", () => {
    const { naoRoteadas, total } = checkSkillsRouting();
    expect(
      naoRoteadas,
      "skill sem entry point — acrescente linha na tabela §Skills por tarefa do ds-standards, ou declare exceção com motivo",
    ).toEqual([]);
    expect(total).toBeGreaterThanOrEqual(14);
  });

  it("nenhuma rota aponta pra skill que não existe", () => {
    expect(
      checkSkillsRouting().rotasMortas,
      "rota morta — o agente vai procurar e não achar",
    ).toEqual([]);
  });

  it("nenhuma exceção está morta", () => {
    expect(checkSkillsRouting().exceçõesMortas).toEqual([]);
  });

  it("toda exceção tem motivo substantivo", () => {
    for (const [k, v] of [...ROUTING_EXCEPTIONS, ...CITATION_EXCEPTIONS]) {
      expect(String(v).length, `${k} sem motivo`).toBeGreaterThan(30);
    }
  });

  it("`igreen-page` não voltou — ela dizia 'quando carregar: nunca'", () => {
    expect(skillFolders()).not.toContain("igreen-page");
  });

  it("o varredor `all` alcança as skills, não só os entry points", () => {
    // Verificação positiva: sem ela, o teste de rota morta passaria se o leitor
    // devolvesse lista vazia — que foi exatamente o bug da 1ª versão.
    const paths = readAllMd(".claude").map((f) => f.path);
    expect(paths.some((p) => p.includes("skills/dashboard-builder"))).toBe(true);
    expect(routingText("entry")).not.toBe("");
  });
});
