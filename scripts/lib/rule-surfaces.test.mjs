import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { auditar, citadoNoVocabulario, novosSemBloco, formatar } from "./rule-surfaces.mjs";

/**
 * O escopo destes dois checks foi decidido por MEDIÇÃO contra o gate vizinho, não por desenho.
 *
 * A 1ª versão cobrava a linha do vocabulário para todo componente com bloco. Rodando o
 * `distribution-debt` no mesmo cenário (linha do `screen-loader` removida à mão), ele já
 * reprovava com `exit 1`. Metade deste módulo era cópia de regra com dono — e o repo é
 * explícito: duas cópias da mesma regra divergem.
 *
 * O mesmo teste achou a fatia que ele NÃO cobre: removendo `tabs`, o `distribution-debt` saiu
 * **0**. Ele varre só `src/components/ui/`, e os primitivos shadcn ficam fora. É só isso que
 * `auditar` cobra hoje.
 */

const COM_BLOCO = "# X\n\n<!-- ds:regras\n- omita `size`: md é o padrão\n-->\n\n## Quando usar\nprosa\n";
const SEM_BLOCO = "# X\n\n## Gotchas\n- omita `size`: md é o padrão (só prosa)\n";

const GLOBAL = [
  "# Shadcn — índice de gotchas",
  "",
  "<!-- ds:regras tabs",
  "- variante default dentro de superfície; `line` só pra seção de página",
  "-->",
  "",
  "<!-- ds:regras sonner",
  "- precisa do <Toaster/> no root",
  "-->",
].join("\n");

describe("rule-surfaces — primitivo shadcn com bloco tem que chegar no vocabulário", () => {
  it("bloco nomeado sem linha no vocabulário REPROVA", () => {
    const r = auditar({ tabelaGlobal: GLOBAL, vocabulario: "| abas | `tabs` |" });
    expect(r.ok).toEqual(["tabs"]);
    expect(r.faltando).toEqual([
      { id: "sonner", onde: "src/components/shadcn/USAGE.md" },
    ]);
  });

  it("todos com linha → silêncio", () => {
    const r = auditar({
      tabelaGlobal: GLOBAL,
      vocabulario: "| abas | `tabs` | · | toast | `sonner` |",
    });
    expect(r.faltando).toEqual([]);
  });

  it("tabela ausente não quebra", () => {
    expect(auditar({ vocabulario: "" }).faltando).toEqual([]);
    expect(auditar({ tabelaGlobal: null, vocabulario: "" }).ok).toEqual([]);
  });

  it("a mensagem diz o que fazer E que ui/ não é escopo dela", () => {
    const msg = formatar({ faltando: [{ id: "sonner", onde: "src/components/shadcn/USAGE.md" }] });
    expect(msg).toContain("ds-components.md");
    expect(msg).toContain("bump do CLI");
    expect(msg).toContain("distribution-debt"); // aponta o dono da outra metade
    expect(msg).toContain("handoff-pr.md");
  });
});

describe("rule-surfaces — a crase é a fronteira do nome", () => {
  it("`alert` não casa dentro de `alert-dialog`", () => {
    const vocab = "| aviso modal | `alert-dialog` |";
    expect(citadoNoVocabulario(vocab, "alert-dialog")).toBe(true);
    expect(citadoNoVocabulario(vocab, "alert")).toBe(false);
  });

  it("id vazio nunca casa", () => {
    expect(citadoNoVocabulario("qualquer `coisa`", null)).toBe(false);
  });
});

describe("rule-surfaces — componente novo sem bloco (o caso ScreenLoader)", () => {
  const ler = (mapa) => (caminho) => (caminho in mapa ? mapa[caminho] : null);

  it("novo com regra em PROSA e sem bloco → avisa", () => {
    // Reprodução do defeito real: regras de default nos Gotchas, bloco ausente.
    const r = novosSemBloco(
      ["src/components/ui/ScreenLoader"],
      ler({ "src/components/ui/ScreenLoader/USAGE.md": SEM_BLOCO }),
    );
    expect(r).toEqual([
      { componente: "ScreenLoader", caminho: "src/components/ui/ScreenLoader/USAGE.md" },
    ]);
  });

  it("novo COM bloco → silêncio", () => {
    const r = novosSemBloco(
      ["src/components/ui/Panel"],
      ler({ "src/components/ui/Panel/USAGE.md": COM_BLOCO }),
    );
    expect(r).toEqual([]);
  });

  it("USAGE ausente → silêncio (quem cobra isso é o showcase-check)", () => {
    expect(novosSemBloco(["src/components/ui/Sem"], ler({}))).toEqual([]);
  });

  it("USAGE ilegível não quebra o check", () => {
    const explode = () => {
      throw new Error("EACCES");
    };
    expect(novosSemBloco(["src/components/ui/X"], explode)).toEqual([]);
  });

  it("lista vazia → silêncio (PR sem componente novo é o caso comum)", () => {
    expect(novosSemBloco([], ler({}))).toEqual([]);
    expect(novosSemBloco(undefined, ler({}))).toEqual([]);
  });
});

describe("rule-surfaces — estado do repo", () => {
  it("todo bloco nomeado do shadcn chega no vocabulário do consumidor", () => {
    const tg = "src/components/shadcn/USAGE.md";
    const r = auditar({
      tabelaGlobal: existsSync(tg) ? readFileSync(tg, "utf8") : null,
      vocabulario: readFileSync("cli/templates/default/_claude/rules/ds-components.md", "utf8"),
    });
    expect(r.faltando, formatar(r)).toEqual([]);
  });
});
