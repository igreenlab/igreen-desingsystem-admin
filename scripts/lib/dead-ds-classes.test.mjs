import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { checkDeadDsClasses, tokensDoTema, FAMILIAS } from "./dead-ds-classes.mjs";

const TEMA = "src/styles/theme/tailwind-theme.css";
const RAIZ = "src/components";
/**
 * O payload do consumidor entra no escopo desde 2026-08-18. Classe morta AQUI é pior que
 * em `src/`: estes arquivos **ensinam** a IA do consumidor que classe usar, e três das
 * `rules/` são auto-carregadas em 100% das sessões dele. Uma classe que não emite CSS vira
 * silêncio no app de outra pessoa, onde nenhum gate nosso alcança.
 */
const PAYLOAD = "cli/templates/default/_claude";

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

/** Arquivos do payload que podem conter classe: `.md` (doc/skill/rule) + `.mjs` (hooks). */
function arquivosDoPayload(dir = PAYLOAD, out = {}) {
  for (const e of readdirSync(dir)) {
    const f = join(dir, e);
    if (statSync(f).isDirectory()) arquivosDoPayload(f, out);
    else if (/\.(md|mjs)$/.test(e)) out[f.split("\\").join("/")] = readFileSync(f, "utf8");
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

  it("nenhuma classe DS não-cor morta no PAYLOAD do consumidor", () => {
    const arquivos = arquivosDoPayload();
    const { mortas, conferidos } = checkDeadDsClasses({ arquivos, tokens: tokensReais() });
    expect(
      mortas.map((m) => `${m.arquivo}:${m.linha} — ${m.classe} (${m.familia})`),
      "classe morta no payload é PIOR que em src/: estes arquivos ensinam a IA do consumidor, " +
        "e 3 das rules/ são auto-carregadas em 100% das sessões dele. O erro sai daqui e vira " +
        "silêncio no app de outra pessoa",
    ).toEqual([]);
    expect(conferidos, "o payload tem 38 arquivos — leu quase nada?").toBeGreaterThan(25);
  });

  it("o gate REPROVA classe morta no payload (não passa por não estar olhando)", () => {
    // Mesmo raciocínio da prova com dado real acima: adultero o conteúdo REAL da rule
    // auto-carregada e confiro que acusa.
    const alvo = `${PAYLOAD}/rules/ds-design.md`;
    const real = readFileSync(alvo, "utf8");
    const adulterado = real.replace("min-h-form-md", "min-h-form-gigante");
    expect(adulterado, "o ds-design.md não cita mais min-h-form-md — ajuste o teste").not.toBe(real);

    const { mortas } = checkDeadDsClasses({ arquivos: { [alvo]: adulterado }, tokens: tokensReais() });
    expect(mortas.map((m) => m.classe)).toContain("min-h-form-gigante");
  });

  it("o CURINGA da doc não é falso positivo — a armadilha que o payload expôs", () => {
    // `ds-design.md` ensina `p-pad-card-*` e `px-pad-page-*` — PADRÃO, não classe. A 1ª
    // versão deste gate acusou os dois como mortos; se eu tivesse "corrigido", teria
    // quebrado doc correta no arquivo que a IA lê em toda sessão do consumidor.
    const linha = "padding de card `p-pad-card-*`, gutter `px-pad-page-*`, chrome `h-layout-*`";
    const { mortas } = checkDeadDsClasses({ arquivos: { "doc.md": linha }, tokens: tokensReais() });
    expect(mortas, "padrão com `-*` não é classe a validar").toEqual([]);
  });

  it("curinga NÃO cega o gate na mesma linha — classe morta ao lado segue sendo pega", () => {
    // O risco de conserto largo: pular a LINHA inteira quando há curinga. Aqui a mesma
    // linha tem um padrão legítimo e uma classe morta de verdade.
    const linha = "use `p-pad-card-*` mas nunca `shadow-sh-xs`";
    const { mortas } = checkDeadDsClasses({ arquivos: { "doc.md": linha }, tokens: tokensReais() });
    expect(mortas.map((m) => m.classe)).toEqual(["shadow-sh-xs"]);
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
