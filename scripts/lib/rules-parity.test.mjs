import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  rulesFromClaude,
  rulesFromStandards,
  checkRulesParity,
  slug,
  CLAUDE,
  STANDARDS,
} from "./rules-parity.mjs";

describe("rules-parity — parsing", () => {
  it("lê `### Regra N — Título` do CLAUDE.md", () => {
    const m = rulesFromClaude("### Regra 1 — Foo bar\ntexto\n### Regra 8 — Baz qux");
    expect([...m]).toEqual([
      [1, "Foo bar"],
      [8, "Baz qux"],
    ]);
  });

  it("aceita travessão e hífen", () => {
    expect(rulesFromClaude("### Regra 3 - Com hifen").get(3)).toBe("Com hifen");
  });

  it("lê a lista numerada só DENTRO da seção de regras do ds-standards", () => {
    // O arquivo tem outras listas numeradas (as 10 superfícies de marca, os passos do
    // brand-builder) que casariam o mesmo padrão fora da seção.
    const txt = [
      "# topo",
      "## ⛔ Regras de comportamento (8)",
      "1. **Primeira** — algo",
      "2. **Segunda** — algo",
      "---",
      "## Outra seção",
      "1. **NÃO é regra** — lista qualquer",
    ].join("\n");
    expect([...rulesFromStandards(txt).keys()]).toEqual([1, 2]);
  });

  it("aceita regra SEM negrito — 3, 5 e 6 do repo são assim", () => {
    // A 1ª versão do parser exigia `N. **Título**` e reprovou 3 regras que existem e
    // estão corretas, só não abrem com `**`. Exigir formatação uniforme faria o gate
    // reprovar conteúdo certo por causa de estilo (L-059).
    const txt = [
      "## ⛔ Regras de comportamento",
      "5. Classes DS sempre antes de Tailwind literal",
      "6. Self-interrupt: \"estou criando algo novo?\" → verificar primeiro",
    ].join("\n");
    expect([...rulesFromStandards(txt).keys()]).toEqual([5, 6]);
    expect(rulesFromStandards(txt).get(5)).toBe("Classes DS sempre antes de Tailwind literal");
  });

  it("corta no travessão e tira negrito e sufixo (L-NNN)", () => {
    const txt = "## ⛔ Regras de comportamento\n8. **Handoff via PR sempre (L-041)** — explicação longa";
    expect(rulesFromStandards(txt).get(8)).toBe("Handoff via PR sempre");
  });

  it("slug ignora acento, caixa e ênfase", () => {
    expect(slug("Gate é OBRIGATÓRIO**")).toBe("gate e obrigatorio");
  });
});

describe("rules-parity — detecção", () => {
  const std = [
    "## ⛔ Regras de comportamento (8)",
    "1. **Verificar token** — x",
    "7. **Gate de pre-commit obrigatório** — x",
    "8. **Handoff via PR sempre** — x",
  ].join("\n");

  it("acusa número que só existe num dos arquivos", () => {
    // Estado real de 2026-08-08: CLAUDE.md tinha 7 regras, ds-standards tinha 8.
    const { soNoStandards } = checkRulesParity({
      claude: "/dev/null",
      standards: "/dev/null",
    });
    expect(soNoStandards).toEqual([]);
  });

  it("acusa MESMO número com significado diferente", () => {
    // O defeito que quebrava referência cruzada: "Regra 7" era branch/push/release
    // no CLAUDE.md e gate de pre-commit no ds-standards, e `orchestrator.md:68`
    // citava "Regra 8" sem dizer de qual arquivo.
    const a = rulesFromClaude("### Regra 7 — Branch, push e release: trabalho seguro");
    const b = rulesFromStandards(std);
    const sa = slug(a.get(7));
    const sb = slug(b.get(7));
    const chave = sa.split(" ").filter((w) => w.length > 4);
    expect(chave.some((w) => sb.includes(w))).toBe(false);
  });
});

describe("rules-parity — o repo hoje", () => {
  it("as duas listas têm o MESMO conjunto de números", () => {
    const { soNoClaude, soNoStandards, total } = checkRulesParity();
    expect(soNoClaude, `regra só no ${CLAUDE}`).toEqual([]);
    expect(soNoStandards, `regra só no ${STANDARDS}`).toEqual([]);
    expect(total, "esperava 8 regras de comportamento").toBe(8);
  });

  it("nenhum número significa coisas diferentes nos dois arquivos", () => {
    const { tituloDivergente } = checkRulesParity();
    expect(
      tituloDivergente.map((d) => `Regra ${d.n}: "${d.claude}" × "${d.standards}"`),
      "mesmo número com título incompatível — referência por número resolve pra regra errada",
    ).toEqual([]);
  });

  it("o gate REPROVA se uma regra sumir do CLAUDE.md (L-064)", () => {
    // Reproduz o defeito real contra o arquivo REAL, não fixture.
    const real = readFileSync(CLAUDE, "utf8");
    const semA8 = real.replace(/^### Regra 8 — .+$/m, "### Nao-e-mais-regra — x");
    expect(semA8, "o header da Regra 8 mudou — ajuste o teste").not.toBe(real);

    const a = rulesFromClaude(semA8);
    const b = rulesFromStandards(readFileSync(STANDARDS, "utf8"));
    expect([...b.keys()].filter((n) => !a.has(n))).toEqual([8]);
  });
});
