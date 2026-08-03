import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkVocab } from "./vocab-surface.mjs";

/* Dois grupos, por razões diferentes:

   1. "contra o repo real" — o gate de verdade. Roda no `npm test` do CI, então
      qualquer item novo no registry sem entrada no vocabulário reprova a PR.
      Fonte real, não fixture: fixture concorda por construção com quem a escreveu
      (L-064), e o defeito que importa aqui é o registry e o vocabulário
      DIVERGIREM no futuro — coisa que só dado real detecta.

   2. "classes de falha" — prova que o check enxerga cada direção. Sem isso um
      check que retorna sempre `{faltando:[], inventados:[]}` passaria o grupo 1. */

const REGISTRY = JSON.parse(readFileSync("registry.json", "utf8"));
const VOCAB = readFileSync(
  "cli/templates/default/_claude/rules/ds-components.md",
  "utf8",
);

describe("vocabulário do consumidor × registry (repo real)", () => {
  it("todo item distribuído aparece no vocabulário (senão a IA conclui que não existe)", () => {
    const { faltando } = checkVocab(VOCAB, REGISTRY);
    expect(faltando).toEqual([]);
  });

  it("todo nome citado existe no registry (classe PeriodSelector: mandar usar o inexistente)", () => {
    const { inventados } = checkVocab(VOCAB, REGISTRY);
    expect(inventados).toEqual([]);
  });

  // Guarda contra o check virar vacuously-true: se `total` fosse 0, os dois
  // testes acima passariam sem medir nada.
  it("está medindo o catálogo inteiro, não um subconjunto vazio", () => {
    const { total } = checkVocab(VOCAB, REGISTRY);
    expect(total).toBeGreaterThan(50);
  });
});

describe("vocab-surface — as classes de falha que o check existe pra pegar", () => {
  it("acusa item do registry ausente do texto", () => {
    const r = { items: [{ name: "button" }, { name: "date-picker" }] };
    const { faltando } = checkVocab("Use `button` pra ação.", r);
    expect(faltando).toEqual(["date-picker"]);
  });

  it("acusa nome citado que não existe no registry", () => {
    const r = { items: [{ name: "button" }] };
    const { inventados } = checkVocab(
      "Use `button`, ou `period-selector` pra período.",
      r,
    );
    expect(inventados).toEqual(["period-selector"]);
  });

  it("não confunde prefixo com o nome inteiro (fronteira de palavra)", () => {
    const r = { items: [{ name: "table" }, { name: "data-table" }] };
    // `data-table` citado NÃO satisfaz `table`: senão um vocabulário que só fala
    // do DataTable passaria como se documentasse a Table simples também.
    const { faltando } = checkVocab("Grade completa: `data-table`.", r);
    expect(faltando).toEqual(["table"]);
  });

  it("ignora example-* e utilitários (não são componente a escolher)", () => {
    const r = { items: [{ name: "example-finance" }, { name: "tv" }, { name: "button" }] };
    const { total, faltando } = checkVocab("Use `button`.", r);
    expect({ total, faltando }).toEqual({ total: 1, faltando: [] });
  });

  // Regressão v0.32.0: `theme` era ignorado por nome exato, então os overlays de marca
  // (`theme-blue` etc.) caíram em `faltando` e reprovaram o npm test. Tema não é
  // componente a escolher — a superfície dele é a rule `ds-themes.md`, não o
  // `ds-components.md`. Sem este caso, um conserto na regex vira ponto cego.
  it("ignora theme e os overlays theme-* (tema não é componente; superfície é ds-themes.md)", () => {
    const r = {
      items: [
        { name: "theme" },
        { name: "theme-blue" },
        { name: "theme-vibrant" },
        { name: "button" },
      ],
    };
    const { total, faltando } = checkVocab("Use `button`.", r);
    expect({ total, faltando }).toEqual({ total: 1, faltando: [] });
  });

  // A exclusão é por PREFIXO `theme-`, não por "contém theme": um componente que
  // legitimamente se chamasse `theme-picker` continuaria sendo cobrado — e deve.
  it("não usa 'theme' como curinga: nome que só CONTÉM theme segue sendo cobrado", () => {
    const r = { items: [{ name: "color-theme-switch" }, { name: "button" }] };
    const { faltando } = checkVocab("Use `button`.", r);
    expect(faltando).toEqual(["color-theme-switch"]);
  });

  it("não trata classe/prop/dep em backtick como nome de componente", () => {
    const r = { items: [{ name: "kpi" }] };
    const texto = "`kpi` usa `gap-form-gap`, prop `variant`, e traz `d3-geo`.";
    expect(checkVocab(texto, r).inventados).toEqual([]);
  });
});
