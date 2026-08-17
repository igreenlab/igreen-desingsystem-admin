import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { checkDeadDsClasses, tokensDoTema, FAMILIAS } from "./dead-ds-classes.mjs";

const TEMA = "src/styles/theme/tailwind-theme.css";
const RAIZ = "src/components";

const tokensReais = () => tokensDoTema(readFileSync(TEMA, "utf8"));

/** Todos os .ts/.tsx sob src/components/. */
function arquivosDeComponente(dir = RAIZ, out = {}) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) arquivosDeComponente(f, out);
    else if (/\.tsx?$/.test(e)) out[f.split("\\").join("/")] = readFileSync(f, "utf8");
  }
  return out;
}

describe("dead-ds-classes — detecção", () => {
  const tokens = { shadow: new Set(["sh-sm", "sh-md"]), spacing: new Set(["pad-card-base", "form-md"]), radius: new Set(["radius-sm"]) };

  it("acusa a sombra que motivou o gate (shadow-sh-xs não existe)", () => {
    const r = checkDeadDsClasses({ arquivos: { "a.ts": '"rounded-radius-sm shadow-sh-xs"' }, tokens });
    expect(r.mortas.map((m) => m.classe)).toEqual(["shadow-sh-xs"]);
  });

  it("NÃO acusa a sombra que existe", () => {
    const r = checkDeadDsClasses({ arquivos: { "a.ts": '"shadow-sh-sm"' }, tokens });
    expect(r.mortas).toEqual([]);
  });

  it("token com hífen interno NÃO é falso positivo — a armadilha medida", () => {
    // Meu primeiro regex de medição usou [a-z0-9]+ e parou no hífen: casou `pad-card` a
    // partir de `p-pad-card-base` e reportou classe morta que NÃO era. Falso positivo por
    // parser preguiçoso reprova código correto e ensina o time a ignorar o gate.
    const r = checkDeadDsClasses({ arquivos: { "a.ts": '"p-pad-card-base"' }, tokens });
    expect(r.mortas, "p-pad-card-base é válido — o tema emite --spacing-pad-card-base").toEqual([]);
  });

  it("reporta arquivo, LINHA e família", () => {
    const r = checkDeadDsClasses({
      arquivos: { "x/y.styles.ts": 'linha1\n"gap-gp-inexistente"' },
      tokens: { ...tokens, spacing: new Set(["pad-card-base"]) },
    });
    expect(r.mortas[0]).toMatchObject({ arquivo: "x/y.styles.ts", linha: 2, familia: "gap-gp-*" });
  });

  it("não confunde namespace: radius-sm existe em radius, não em shadow", () => {
    const r = checkDeadDsClasses({ arquivos: { "a.ts": '"shadow-sh-radius-sm"' }, tokens });
    expect(r.mortas.length, "sh-radius-sm não existe no namespace shadow").toBe(1);
  });

  it("cada família tem nome legível e namespace declarado", () => {
    for (const f of FAMILIAS) {
      expect(f.nome.length, "família sem nome").toBeGreaterThan(3);
      expect(["shadow", "radius", "spacing"]).toContain(f.ns);
    }
  });
});

describe("dead-ds-classes — o repo hoje", () => {
  it("nenhuma classe DS não-cor morta em src/components/", () => {
    const arquivos = arquivosDeComponente();
    const { mortas, conferidos } = checkDeadDsClasses({ arquivos, tokens: tokensReais() });
    expect(
      mortas.map((m) => `${m.arquivo}:${m.linha} — ${m.classe} (${m.familia})`),
      "classe DS cujo token não existe no tema: ela fica no className, o CSS não casa, e o " +
        "componente renderiza sem o efeito. Nem tsc, nem lint:styles, nem dead-theme-classes pegam",
    ).toEqual([]);
    // Guarda contra parser quebrado devolvendo lista vazia por não ler nada.
    expect(conferidos, "nenhum arquivo lido — o walk quebrou?").toBeGreaterThan(150);
  });

  it("o gate REPROVA quando a classe morta é real (L-064)", () => {
    // Fixture sintética não prova nada sobre o repo. Aqui eu injeto a classe no conteúdo
    // REAL de um componente e confiro que acusa, com o tema REAL.
    const alvo = "src/components/ui/Button/button.styles.ts";
    const real = readFileSync(alvo, "utf8");
    const adulterado = real.replace("shadow-sh-sm", "shadow-sh-xs");
    expect(adulterado, "o Button não usa mais shadow-sh-sm — ajuste o teste").not.toBe(real);

    const { mortas } = checkDeadDsClasses({
      arquivos: { [alvo]: adulterado },
      tokens: tokensReais(),
    });
    expect(mortas.map((m) => m.classe)).toContain("shadow-sh-xs");
  });

  it("as 8 famílias acham uso REAL no repo — escopo não é letra morta", () => {
    // Família que não casa nada pode estar com regex quebrado e ninguém saberia: o gate
    // passaria verde sobre um eixo que ele não está olhando.
    const arquivos = arquivosDeComponente();
    const texto = Object.values(arquivos).join("\n");
    for (const { nome, re } of FAMILIAS) {
      re.lastIndex = 0;
      expect([...texto.matchAll(re)].length, `família ${nome} não casou NADA no repo`).toBeGreaterThan(0);
    }
  });
});
