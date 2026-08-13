import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { checkOrphanUtilities, utilitiesDeclaradas, GLOBALS, TEMA } from "./orphan-utilities.mjs";

describe("orphan-utilities — parsing", () => {
  it("lê os nomes de @utility de um CSS", () => {
    expect(utilitiesDeclaradas("@utility foo-bar {\n a:b;\n}\n@utility baz {}")).toEqual([
      "foo-bar",
      "baz",
    ]);
  });

  it("ignora @utility que não está no início da linha (ex.: dentro de comentário)", () => {
    expect(utilitiesDeclaradas(" * usa @utility outline-float pra isso")).toEqual([]);
  });
});

describe("orphan-utilities — detecção", () => {
  const fontes = [{ p: "src/components/ui/Modal/modal.styles.ts", t: `"outline-float",` }];

  it("acusa utility do globals usada por componente e ausente do tema", () => {
    // É EXATAMENTE o defeito de 2026-08-07: 14 componentes usavam `outline-float`
    // e a classe não existia em canal nenhum do consumidor.
    const { orfas } = checkOrphanUtilities({
      globals: "@utility outline-float {\n outline: 6px;\n}",
      tema: "@utility scrollbar-thin {}",
      fontes,
    });
    expect(orfas).toHaveLength(1);
    expect(orfas[0]).toMatchObject({ nome: "outline-float", usos: 1 });
  });

  it("NÃO acusa quando a utility também está declarada no tema", () => {
    const { orfas } = checkOrphanUtilities({
      globals: "@utility outline-float {}",
      tema: "@utility outline-float {\n outline: 6px;\n}",
      fontes,
    });
    expect(orfas).toEqual([]);
  });

  it("NÃO acusa utility só do showcase que nenhum componente usa", () => {
    // Nem toda utility do globals é problema — só a que componente distribuído usa.
    const { orfas } = checkOrphanUtilities({
      globals: "@utility so-do-preview {}",
      tema: "",
      fontes,
    });
    expect(orfas).toEqual([]);
  });
});

describe("orphan-utilities — o repo hoje", () => {
  it("não tem nenhuma utility órfã", () => {
    // Trava a regressão: mover uma utility de volta pro globals.css, ou criar uma
    // nova lá e usá-la num componente, reprova aqui.
    const { orfas } = checkOrphanUtilities();
    expect(
      orfas,
      `mova para tokens/transforms/to-tailwind-v4.ts (buildFloatingUtilities): ${JSON.stringify(orfas)}`,
    ).toEqual([]);
  });

  it("as utilities que os componentes usam ESTÃO no tema gerado", () => {
    // Verificação positiva — sem ela, o teste acima passaria se o parser quebrasse.
    const tema = readFileSync(TEMA, "utf8");
    for (const nome of ["outline-float", "scrollbar-thin"]) {
      expect(utilitiesDeclaradas(tema), `${nome} deve estar no tema`).toContain(nome);
    }
  });

  it("o globals.css não redefine o que o tema já declara", () => {
    // Duplicar faz o showcase mascarar a ausência no consumidor — foi assim que o
    // outline-float passou despercebido por meses.
    const noGlobals = utilitiesDeclaradas(readFileSync(GLOBALS, "utf8"));
    const noTema = utilitiesDeclaradas(readFileSync(TEMA, "utf8"));
    const dup = noGlobals.filter((n) => noTema.includes(n));
    expect(dup, "utility declarada nos dois lugares").toEqual([]);
  });
});
