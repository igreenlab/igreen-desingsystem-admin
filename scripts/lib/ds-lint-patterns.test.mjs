import { describe, expect, it } from "vitest";
import { scanLines, DS_LINT_PATTERNS } from "./ds-lint-patterns.mjs";

/* Especifica o gate determinístico de estilos do DS.
   Baseline medido em 2026-07-29: dos 51 hits do grep antigo, 50 eram ruído.
   Cada caso "NÃO deve pegar" corresponde a um desses falso-positivos. */

const scan1 = (text) => scanLines([{ n: 1, text }]);

describe("DS_LINT_PATTERNS — deve PEGAR (erradas independente de contexto)", () => {
  it("L-001: ring-ring-* com modificador de alpha", () => {
    expect(scan1('"ring-4 ring-ring-brand/30"')).toHaveLength(1);
    expect(scan1('"ring-ring-danger/20"')[0].id).toBe("L-001");
  });

  it("L-002: gap-N literal, inclusive gap-x/gap-y", () => {
    expect(scan1('"flex gap-4"')).toHaveLength(1);
    expect(scan1('"gap-24"')).toHaveLength(1);
    expect(scan1('"gap-x-4"')).toHaveLength(1);
    expect(scan1('"gap-y-2"')).toHaveLength(1);
  });

  it("L-002: pad/space literal", () => {
    expect(scan1('"p-4"')).toHaveLength(1);
    expect(scan1('"px-3 py-2"').length).toBeGreaterThanOrEqual(1);
  });

  it("L-002: height/size fixo", () => {
    expect(scan1('"h-9"')).toHaveLength(1);
    expect(scan1('"min-h-10"')).toHaveLength(1);
    expect(scan1('"size-9"')).toHaveLength(1); // w-9 h-9 escrito como size-9
    expect(scan1('"h-14"')).toHaveLength(1);
    expect(scan1('"flex h-16 items-center"')).toHaveLength(1); // 64px → h-layout-navbar
  });

  it("L-002: rounded nativo com valor divergente, inclusive side variants", () => {
    // nativo rounded-lg = 0.5rem, DS rounded-radius-lg = 0.625rem → defeito real
    for (const k of ["sm", "md", "lg", "xl", "2xl", "3xl"]) {
      expect(scan1(`"rounded-${k}"`), `rounded-${k}`).toHaveLength(1);
    }
    // side variants têm o MESMO valor divergente
    expect(scan1('"rounded-t-lg"')).toHaveLength(1);
    expect(scan1('"rounded-br-md"')).toHaveLength(1);
  });

  it("L-002: shadow nativo", () => {
    expect(scan1('"shadow-md"')).toHaveLength(1);
    expect(scan1('"shadow-xs"')).toHaveLength(1);
  });

  it("L-003: ring-3 (não existe no Tailwind)", () => {
    expect(scan1('"ring-3"')[0].id).toBe("L-003");
  });

  it("L-005: bg-input com alpha", () => {
    expect(scan1('"bg-input/50"')[0].id).toBe("L-005");
  });

  it("IMPORT: tv vindo de tailwind-variants, aspas duplas ou simples", () => {
    expect(scan1('import { tv } from "tailwind-variants";')[0].id).toBe("IMPORT");
    expect(scan1("import { tv } from 'tailwind-variants';")[0].id).toBe("IMPORT");
  });

  // Achado do review: todo pattern com âncora de aspas era só aspas DUPLAS —
  // `'flex gap-4 h-9 rounded-lg shadow-md'` (aspas simples) passava limpo.
  // O delimitador agora é uma classe de caracteres (aspa simples OU dupla)
  // nos dois lados, em vez de aspa dupla fixa.
  it("aspas simples: mesmos patterns pegam com ' em vez de \"", () => {
    expect(scan1("'ring-4 ring-ring-brand/30'")[0].id).toBe("L-001");
    expect(scan1("'flex gap-4'")).toHaveLength(1);
    expect(scan1("'p-4'")).toHaveLength(1);
    expect(scan1("'h-9'")).toHaveLength(1);
    expect(scan1("'rounded-lg'")).toHaveLength(1);
    expect(scan1("'shadow-md'")).toHaveLength(1);
    expect(scan1("'ring-3'")[0].id).toBe("L-003");
    expect(scan1("'bg-input/50'")[0].id).toBe("L-005");
  });

  it("aspas simples: uma linha só com múltiplas violações mistura tudo (caso real do finding)", () => {
    const hits = scan1("'flex gap-4 h-9 rounded-lg shadow-md'");
    expect(hits.length).toBe(4); // gap, height, rounded, shadow
  });

  it("aspas simples: os falso-positivos (0 / none / full) continuam limpos", () => {
    expect(scan1("'!gap-0 !p-0'")).toEqual([]);
    expect(scan1("'rounded-full'")).toEqual([]);
    expect(scan1("'rounded-none'")).toEqual([]);
  });
});

describe("DS_LINT_PATTERNS — NÃO deve pegar (os 50 falso-positivos medidos)", () => {
  it("zero não tem token DS equivalente — p-0/gap-0 são resets legítimos", () => {
    expect(scan1('"!gap-0 !p-0"')).toEqual([]);
    expect(scan1('"py-0 px-0 pl-0 pr-0 pt-0 pb-0"')).toEqual([]);
  });

  it("rounded-full e rounded-none são NUMERICAMENTE IDÊNTICOS ao token DS", () => {
    expect(scan1('"rounded-full"')).toEqual([]);
    expect(scan1('"rounded-none"')).toEqual([]);
    expect(scan1('"rounded-t-full"')).toEqual([]);
  });

  it("as próprias classes DS nunca são violação", () => {
    expect(scan1('"gap-gp-md p-sp-md px-pad-lg"')).toEqual([]);
    expect(scan1('"rounded-radius-lg rounded-radius-full"')).toEqual([]);
    expect(scan1('"shadow-sh-md min-h-form-lg size-comp-lg"')).toEqual([]);
    expect(scan1('"ring-4 ring-ring-brand"')).toEqual([]);
  });

  it("L-004 (outline-none) NÃO pertence ao gate determinístico — é semântico", () => {
    // Foco pode estar no wrapper (focus-within) ou vir de focus-visible:shadow-sh-ring.
    // Grep não decide; vai pra Camada 3. Ver spec §1.1.
    expect(scan1('"bg-transparent border-0 outline-none"')).toEqual([]);
    expect(DS_LINT_PATTERNS.some((p) => p.id === "L-004")).toBe(false);
  });

  it("L-007 (tipografia) também é semântico, fora do gate", () => {
    expect(DS_LINT_PATTERNS.some((p) => p.id === "L-007")).toBe(false);
  });

  it("comentário explicando a regra não é violação", () => {
    // Sem isso, um comentário citando "rounded-lg" reprova o CI.
    expect(scan1('  // nativo "rounded-lg" = 0.5rem vs DS 0.625rem')).toEqual([]);
    expect(scan1('   * usa "gap-4"? não — use gap-gp-md')).toEqual([]);
  });
});

describe("scanLines", () => {
  it("preserva o número de linha informado", () => {
    expect(scanLines([{ n: 42, text: '"gap-4"' }])[0].n).toBe(42);
  });

  it("acumula múltiplas violações na mesma linha", () => {
    expect(scanLines([{ n: 1, text: '"gap-4 h-9 rounded-lg"' }]).length).toBe(3);
  });

  it("lista vazia devolve lista vazia", () => {
    expect(scanLines([])).toEqual([]);
  });

  it("toda violação carrega id, mensagem acionável e o texto da linha", () => {
    const [v] = scanLines([{ n: 1, text: '"gap-4"' }]);
    expect(v).toMatchObject({ id: expect.any(String), msg: expect.any(String) });
    expect(v.msg.length).toBeGreaterThan(10); // tem que dizer o que fazer
  });

  // Buracos de cobertura conhecidos, herdados do hook — decidir em plano futuro
  it.todo("space-x-N / space-y-N (utility legado, sem token DS direto)");
  it.todo("w-N / h-N isolados (só size-N e h-N estão cobertos)");
  // Buracos achados no review do widening de aspas (finding 4) — documentados
  // no docstring do módulo, não fechados nesta rodada.
  it.todo("template literals (crase) nunca são varridos — `flex gap-4` passa limpo");
  it.todo("números fora do baseline medido passam limpo: w-10, p-9, gap-11, h-20");
});
