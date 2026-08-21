import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CITACOES, presetsDoTema, checkPresets, formatar } from "./dead-typography-presets.mjs";

const TEMA = "src/styles/theme/tailwind-theme.css";

/*
 * Superfícies que ENSINAM a IA qual preset usar. `cli/templates/` entra porque é o que
 * viaja pro projeto de outra pessoa, onde nenhum gate nosso alcança — e três das `rules/`
 * de lá são auto-carregadas em 100% das sessões dele.
 */
const DOCS = [
  "CLAUDE.md",
  ".claude/rules",
  ".claude/skills",
  ".claude/commands",
  ".claude/agents",
  ".ai/context",
  ".ai/rules",
  "cli/templates/default",
];

function arquivos(alvo, out = []) {
  if (!existsSync(alvo)) return out;
  if (statSync(alvo).isFile()) {
    if (/\.(md|mdc|mjs)$/.test(alvo)) out.push(alvo);
    return out;
  }
  for (const e of readdirSync(alvo)) arquivos(join(alvo, e).split("\\").join("/"), out);
  return out;
}

const fontes = () =>
  DOCS.flatMap((d) => arquivos(d)).map((file) => ({ file, text: readFileSync(file, "utf8") }));

describe("dead-typography-presets — estado atual do repo", () => {
  const cssTema = readFileSync(TEMA, "utf8");

  it("nenhuma doc/skill/kit cita preset que o tema não emite", () => {
    const { mortos } = checkPresets({ fontes: fontes(), cssTema });
    const vivos = presetsDoTema(cssTema);
    expect(mortos, `\n${formatar(mortos, vivos).join("\n\n")}\n`).toEqual([]);
  });

  it("conferiu de fato — não passa por varredura vazia", () => {
    const { conferidos } = checkPresets({ fontes: fontes(), cssTema });
    // Medido em 2026-08-20: 124 arquivos, centenas de citações de preset. Se este número
    // cair pra ~0, o gate virou no-op silencioso (glob quebrado, path renomeado) e o
    // teste acima passa por vacuidade — que é o modo de falha da L-061.
    expect(conferidos).toBeGreaterThan(80);
  });

  it("o tema emite os 27 presets em 7 papéis", () => {
    const vivos = presetsDoTema(cssTema);
    expect(vivos.size).toBe(27);
    const papeis = new Set([...vivos].map((p) => p.slice(0, p.indexOf("-"))));
    expect([...papeis].sort()).toEqual(
      ["body", "caption", "code", "display", "heading", "stat", "title"],
    );
  });
});

describe("dead-typography-presets — reprova o defeito real", () => {
  /*
   * Este é O defeito, reproduzido: em 2026-08-20 eu plantei `text-code-xxl` no
   * generate.md do payload e os dois gates de classe morta passaram (14/14). Escrever o
   * teste a partir do mesmo modelo mental que gerou o código concorda por construção
   * (L-064) — então a entrada aqui é o texto REAL daquele arquivo, com a troca real.
   */
  const cssTema = `
@utility text-body-sm { font-size: 0.8125rem; }
@utility text-code-sm { font-size: 0.8125rem; }
@utility text-stat-lg { font-size: 1.875rem; }
`;

  it("preset inexistente em doc do payload reprova, com arquivo e linha", () => {
    const texto = [
      "- **Avatar**: use `avatar-ig`. **Números**: `tabular-nums`.",
      "**Tags**: `type: \"tags\"`. **Código/identificador**: preset **`text-code-xxl`** — nunca na unha.",
    ].join("\n");
    const { mortos } = checkPresets({
      fontes: [{ file: "cli/templates/default/_claude/skills/crud-builder/generate.md", text: texto }],
      cssTema,
    });
    expect(mortos).toHaveLength(1);
    expect(mortos[0]).toMatchObject({ linha: 2, preset: "text-code-xxl" });
  });

  it("o preset CERTO no mesmo lugar passa", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "preset **`text-code-sm`** pra chave de env" }],
      cssTema,
    });
    expect(mortos).toEqual([]);
  });

  it("papel inexistente também reprova (não é só tier errado)", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "use `text-label-md` no rótulo" }],
      cssTema,
    });
    expect(mortos.map((m) => m.preset)).toEqual(["text-label-md"]);
  });

  it("a mensagem diz quais tiers existem no papel — senão o agente adivinha", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "`text-code-xxl`" }],
      cssTema,
    });
    const msg = formatar(mortos, presetsDoTema(cssTema)).join("\n");
    expect(msg).toContain("text-code-xxl` não existe");
    expect(msg).toContain("o papel `code` tem sm");
  });
});

describe("dead-typography-presets — o que NÃO é violação", () => {
  const cssTema = "@utility text-body-sm {} @utility text-code-sm {} @utility text-stat-lg {}";

  it("curinga com `*` é padrão de doc, não classe", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "valor de KPI = `text-stat-*` + tabular-nums" }],
      cssTema,
    });
    expect(mortos).toEqual([]);
  });

  it("chave (`text-code-{sm,md}`) é padrão", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "**`text-code-{sm,md}`** pra chave de env, ID, hash" }],
      cssTema,
    });
    expect(mortos).toEqual([]);
  });

  it("alternativa com pipe também", () => {
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "use `text-{body|caption}-sm` no secundário" }],
      cssTema,
    });
    expect(mortos).toEqual([]);
  });

  it("citação declarada passa — e SÓ no arquivo que declarou", () => {
    const texto = "(1) `text-display-sm`/`text-display-xs` **não existem** (renderizam 14px)";
    const declarado = checkPresets({
      fontes: [{ file: ".claude/rules/ds-standards.md", text: texto }],
      cssTema,
    });
    expect(declarado.mortos).toEqual([]);

    const outroArquivo = checkPresets({ fontes: [{ file: "outro.md", text: texto }], cssTema });
    expect(outroArquivo.mortos.map((m) => m.preset)).toEqual(["text-display-sm", "text-display-xs"]);
  });

  it("palavra que só PARECE preset não conta", () => {
    // Fronteira à esquerda e à direita: `bodyish` não é papel, e `contexto-body-sm` tem
    // caractere de classe antes do `text-`... na verdade não tem `text-` nenhum. Os dois
    // são vizinhança, não citação.
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "text-bodyish-sm e contexto-body-sm e sub-text-body-sm" }],
      cssTema,
    });
    expect(mortos).toEqual([]);
  });

  it("tier inválido em papel vivo REPROVA — não é vizinhança, é preset errado", () => {
    // Este caso estava do lado errado do teste na 1ª versão que eu escrevi: `text-body-smx`
    // não é palavra parecida, é um preset com tier que não existe. Tem que reprovar.
    const { mortos } = checkPresets({
      fontes: [{ file: "x.md", text: "use `text-body-smx` no rodapé" }],
      cssTema,
    });
    expect(mortos.map((m) => m.preset)).toEqual(["text-body-smx"]);
  });
});

describe("dead-typography-presets — CITACOES é uma lista honesta", () => {
  it("toda citação declarada tem motivo escrito", () => {
    const semMotivo = [];
    for (const [arquivo, presets] of CITACOES) {
      for (const [preset, motivo] of presets) {
        if (!motivo || motivo.trim().length < 20) semMotivo.push(`${arquivo} → ${preset}`);
      }
    }
    expect(semMotivo, "exceção sem motivo escrito vira lixo que ninguém sabe se ainda vale").toEqual([]);
  });

  it("toda citação declarada aponta pra arquivo que existe", () => {
    const fantasmas = [...CITACOES.keys()].filter((f) => !existsSync(f));
    expect(fantasmas, "arquivo renomeado/removido deixa a exceção viva e cega").toEqual([]);
  });

  it("nenhuma citação declara preset que EXISTE — isso seria exceção inútil", () => {
    const vivos = presetsDoTema(readFileSync(TEMA, "utf8"));
    const inuteis = [];
    for (const [arquivo, presets] of CITACOES) {
      for (const preset of presets.keys()) {
        if (vivos.has(preset.replace(/^text-/, ""))) inuteis.push(`${arquivo} → ${preset}`);
      }
    }
    expect(inuteis).toEqual([]);
  });
});
