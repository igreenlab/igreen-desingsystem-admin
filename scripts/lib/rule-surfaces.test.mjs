import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import {
  auditar,
  idDoItem,
  citadoNoVocabulario,
  novosSemBloco,
  formatar,
} from "./rule-surfaces.mjs";

/**
 * O caso que originou o gate está no primeiro `describe`: bloco declarado e nenhuma linha no
 * vocabulário. É o estado em que a regra existe, parece entregue, e alcança só quem abrir o
 * arquivo — 6 de 14, medido num consumidor real.
 *
 * O segundo `describe` é o que impede o gate de virar ruído: a direção inversa (linha sem
 * bloco) é o estado normal de 37 dos 43 componentes e **não** pode reprovar.
 */

const ITENS = [
  { name: "panel", files: [{ path: "src/components/ui/Panel/USAGE.md" }, { path: "src/components/ui/Panel/panel.tsx" }] },
  { name: "screen-loader", files: [{ path: "src/components/ui/ScreenLoader/USAGE.md" }] },
  { name: "avatar-ig", files: [{ path: "src/components/ui/avatar-ig/USAGE.md" }] },
  { name: "tabela-teste", files: [{ path: "src/components/ui/TabelaTeste/tabela-teste.tsx" }] },
];

const COM_BLOCO = "# X\n\n<!-- ds:regras\n- omita `size`: md é o padrão\n-->\n\n## Quando usar\nprosa\n";
const SEM_BLOCO = "# X\n\n## Gotchas\n- omita `size`: md é o padrão (só prosa)\n";

describe("rule-surfaces — bloco declarado tem que chegar no consumidor", () => {
  it("bloco sem linha no vocabulário REPROVA", () => {
    const r = auditar({
      usages: [{ caminho: "src/components/ui/ScreenLoader/USAGE.md", texto: COM_BLOCO }],
      itens: ITENS,
      vocabulario: "| carregando | `spinner` |",
    });
    expect(r.faltando).toEqual([
      { id: "screen-loader", onde: "src/components/ui/ScreenLoader/USAGE.md" },
    ]);
  });

  it("bloco COM linha no vocabulário passa", () => {
    const r = auditar({
      usages: [{ caminho: "src/components/ui/ScreenLoader/USAGE.md", texto: COM_BLOCO }],
      itens: ITENS,
      vocabulario: "| página inteira carregando | `screen-loader` — omita size |",
    });
    expect(r.faltando).toEqual([]);
    expect(r.ok).toEqual(["screen-loader"]);
  });

  it("a mensagem diz o que fazer, não só que falhou", () => {
    const msg = formatar({
      faltando: [{ id: "screen-loader", onde: "src/components/ui/ScreenLoader/USAGE.md" }],
    });
    expect(msg).toContain("ds-components.md");
    expect(msg).toContain("bump do CLI");
    expect(msg).toContain("handoff-pr.md");
  });
});

describe("rule-surfaces — as travas anti-ruído", () => {
  it("linha no vocabulário SEM bloco não reprova (é o estado normal)", () => {
    const r = auditar({
      usages: [{ caminho: "src/components/ui/Panel/USAGE.md", texto: SEM_BLOCO }],
      itens: ITENS,
      vocabulario: "nada aqui",
    });
    expect(r.faltando).toEqual([]);
    expect(r.ok).toEqual([]);
  });

  it("componente fora do registry é PULADO, não reprovado", () => {
    const r = auditar({
      usages: [{ caminho: "src/components/ui/TabelaTeste/USAGE.md", texto: COM_BLOCO }],
      itens: ITENS,
      vocabulario: "",
    });
    expect(r.faltando).toEqual([]);
    expect(r.pulados).toHaveLength(1);
    expect(r.pulados[0].motivo).toContain("registry");
  });
});

describe("rule-surfaces — o id vem do registry, não do nome da pasta", () => {
  it("acha o id pelo caminho do USAGE", () => {
    expect(idDoItem("src/components/ui/Panel/USAGE.md", ITENS)).toBe("panel");
  });

  it("pasta que não é PascalCase resolve certo (L-063: avatar-ig existia e reprovava)", () => {
    expect(idDoItem("src/components/ui/avatar-ig/USAGE.md", ITENS)).toBe("avatar-ig");
  });

  it("USAGE que não viaja em item nenhum → null", () => {
    expect(idDoItem("src/components/ui/Nada/USAGE.md", ITENS)).toBeNull();
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

describe("rule-surfaces — primitivos shadcn, pelos blocos nomeados", () => {
  const GLOBAL = [
    "# Shadcn — gotchas",
    "<!-- ds:regras tabs",
    "- variante default dentro de superfície",
    "-->",
    "<!-- ds:regras sonner",
    "- precisa do <Toaster/> no root",
    "-->",
  ].join("\n");

  it("o rótulo do bloco JÁ é o id — cobra a linha de cada um", () => {
    const r = auditar({ tabelaGlobal: GLOBAL, itens: ITENS, vocabulario: "| abas | `tabs` |" });
    expect(r.ok).toContain("tabs");
    expect(r.faltando.map((f) => f.id)).toEqual(["sonner"]);
    expect(r.faltando[0].onde).toContain("shadcn/USAGE.md");
  });

  it("tabela ausente não quebra", () => {
    expect(auditar({ itens: ITENS, vocabulario: "" }).faltando).toEqual([]);
  });
});

describe("rule-surfaces — componente novo sem bloco (o caso ScreenLoader)", () => {
  const ler = (mapa) => (caminho) => (caminho in mapa ? mapa[caminho] : null);

  it("novo com regra em PROSA e sem bloco → avisa", () => {
    // Reprodução do defeito real: regras de default escritas nos Gotchas, bloco ausente.
    const r = novosSemBloco(["src/components/ui/ScreenLoader"], ler({
      "src/components/ui/ScreenLoader/USAGE.md": SEM_BLOCO,
    }));
    expect(r).toEqual([
      { componente: "ScreenLoader", caminho: "src/components/ui/ScreenLoader/USAGE.md" },
    ]);
  });

  it("novo COM bloco → silêncio", () => {
    const r = novosSemBloco(["src/components/ui/Panel"], ler({
      "src/components/ui/Panel/USAGE.md": COM_BLOCO,
    }));
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
  it("todo bloco ds:regras do repo chega no vocabulário do consumidor", () => {
    const dir = "src/components/ui";
    const usages = [];
    if (existsSync(dir)) {
      for (const nome of readdirSync(dir)) {
        const p = `${dir}/${nome}/USAGE.md`;
        if (existsSync(p)) usages.push({ caminho: p, texto: readFileSync(p, "utf8") });
      }
    }
    const tg = "src/components/shadcn/USAGE.md";
    const r = auditar({
      usages,
      tabelaGlobal: existsSync(tg) ? readFileSync(tg, "utf8") : null,
      itens: JSON.parse(readFileSync("registry.json", "utf8")).items,
      vocabulario: readFileSync("cli/templates/default/_claude/rules/ds-components.md", "utf8"),
    });
    expect(r.faltando, formatar(r)).toEqual([]);
  });
});
