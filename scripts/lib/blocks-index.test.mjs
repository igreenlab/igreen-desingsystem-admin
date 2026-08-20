import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  ID_RE,
  coletarBlocos,
  renderIndice,
  itensDeRegistry,
  formatar,
} from "./blocks-index.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Estado atual: os blocos do repo, o índice e o registry têm de estar em sync
   ═══════════════════════════════════════════════════════════════════════════ */

const RAIZ = "src/blocks";
const INDICE = "cli/templates/default/_claude/skills/ds-kit/blocks-index.md";

function arquivos(dir = RAIZ, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    if (statSync(p).isDirectory()) {
      if (!e.name.startsWith("_")) arquivos(p, out);
    } else if (/\.tsx$/.test(e.name) && !/\.test\./.test(e.name) && !e.name.startsWith("_")) {
      out.push(p);
    }
  }
  return out;
}

const fontes = () =>
  arquivos().map((arquivo) => ({ arquivo, fonte: readFileSync(arquivo, "utf8") }));

describe("blocks-index — estado atual do repo", () => {
  const { blocos, achados } = coletarBlocos(fontes());

  it("todo arquivo em src/blocks/ declara um BLOCK válido, único e no formato", () => {
    expect(achados, `\n${formatar(achados).join("\n")}\n`).toEqual([]);
  });

  it("o índice do consumidor está em sync com os arquivos", () => {
    // Índice defasado = a IA resolve um código pra composição errada, ou não resolve.
    // O conserto é `npm run blocks:build`, não editar o .md.
    const atual = existsSync(INDICE) ? readFileSync(INDICE, "utf8") : "";
    const norm = (s) => s.replace(/\r\n/g, "\n");
    expect(norm(atual), "rode `npm run blocks:build`").toBe(norm(renderIndice(blocos)));
  });

  it("todo bloco tem item registry:block, com o ID como nome do item", () => {
    // O ID é o nome do item de propósito: `igreen:add -- dsgreen-chart-1` usa o mesmo
    // string que o humano cita. Nome diferente do ID quebraria essa simetria.
    const registry = JSON.parse(readFileSync("registry.json", "utf8"));
    const doRegistry = new Set(
      registry.items.filter((i) => i.type === "registry:block").map((i) => i.name),
    );
    for (const b of blocos) expect(doRegistry.has(b.id), `${b.id} sem item no registry`).toBe(true);
    expect(doRegistry.size).toBe(blocos.length);
  });

  it("conferiu de fato (não passa por varredura vazia)", () => {
    expect(blocos.length).toBeGreaterThan(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   O que o gate tem de REPROVAR — cada um é um jeito real de quebrar a resolução
   ═══════════════════════════════════════════════════════════════════════════ */

const bloco = (extra) => `
export const BLOCK = {
  id: "dsgreen-chart-1",
  nome: "Donut",
  descricao: "Um donut.",
  usa: ["Card"],
  ${extra ?? ""}
} as const;
export function X() { return null; }
`;

describe("blocks-index — reprova o que quebra a resolução por ID", () => {
  it("arquivo sem BLOCK: não entra no índice e não pode passar calado", () => {
    const r = coletarBlocos([
      { arquivo: "src/blocks/chart/orfao.tsx", fonte: "export function X(){return null}" },
    ]);
    expect(r.blocos).toEqual([]);
    expect(r.achados).toHaveLength(1);
    expect(r.achados[0].problema).toContain("BLOCK");
  });

  it("id duplicado — dois blocos no mesmo endereço torna a citação ambígua", () => {
    const r = coletarBlocos([
      { arquivo: "src/blocks/chart/a.tsx", fonte: bloco() },
      { arquivo: "src/blocks/chart/b.tsx", fonte: bloco() },
    ]);
    expect(r.achados.some((a) => a.problema.includes("duplicado"))).toBe(true);
  });

  it("id fora do formato — caixa/forma diferente citada como a mesma é falha silenciosa", () => {
    for (const id of ["DSGREEN-Chart-1", "dsgreen-chart", "chart-1", "dsgreen_chart_1"]) {
      const r = coletarBlocos([
        { arquivo: "src/blocks/chart/x.tsx", fonte: bloco().replace("dsgreen-chart-1", id) },
      ]);
      expect(r.achados.some((a) => a.problema.includes("formato")), id).toBe(true);
    }
  });

  it("id que não bate com a pasta — o segmento nomeia a CATEGORIA (spec §9.1 regra 1)", () => {
    const r = coletarBlocos([
      { arquivo: "src/blocks/kpi/x.tsx", fonte: bloco() }, // id diz chart, pasta diz kpi
    ]);
    expect(r.achados.some((a) => a.problema.includes("não bate com a pasta"))).toBe(true);
  });

  it("descrição vazia reprova — é ela que faz a IA entender o arranjo sem abrir o arquivo", () => {
    const r = coletarBlocos([
      {
        arquivo: "src/blocks/chart/x.tsx",
        fonte: bloco().replace('descricao: "Um donut.",', 'descricao: "",'),
      },
    ]);
    expect(r.achados.some((a) => a.problema.includes("descricao"))).toBe(true);
  });

  it("ID_RE aceita o qualificador opcional do meio", () => {
    expect(ID_RE.test("dsgreen-chart-1")).toBe(true);
    expect(ID_RE.test("dsgreen-chart-lines-2")).toBe(true);
    expect(ID_RE.test("dsgreen-chart-lines-stacked-12")).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Extração: os casos que uma janela de N caracteres erraria
   ═══════════════════════════════════════════════════════════════════════════ */

describe("blocks-index — extração do literal", () => {
  it("descrição com `}` dentro não corta o literal", () => {
    // Janela fixa em vez de balanceamento de chaves já leu de menos e de mais em outro
    // gate deste repo (o actions-column-canon). Aqui a descrição pode conter código.
    const fonte = `
export const BLOCK = {
  id: "dsgreen-chart-9",
  nome: "Com chave",
  descricao: "Passe { total } no config } e pronto.",
  usa: ["Card"],
} as const;
export function X() { return null; }
`;
    const { blocos, achados } = coletarBlocos([{ arquivo: "src/blocks/chart/x.tsx", fonte }]);
    expect(achados).toEqual([]);
    expect(blocos[0].descricao).toContain("e pronto.");
  });

  it("descrição em múltiplas linhas vira uma linha só (a tabela do índice é markdown)", () => {
    const fonte = `
export const BLOCK = {
  id: "dsgreen-chart-9",
  nome: "Multi",
  descricao:
    "Primeira parte da frase, e a segunda parte.",
  usa: ["Card"],
} as const;
export function X() { return null; }
`;
    const { blocos } = coletarBlocos([{ arquivo: "src/blocks/chart/x.tsx", fonte }]);
    expect(blocos[0].descricao).not.toContain("\n");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Índice e itens gerados
   ═══════════════════════════════════════════════════════════════════════════ */

describe("blocks-index — o que é gerado", () => {
  const { blocos } = coletarBlocos([
    { arquivo: "src/blocks/chart/x.tsx", fonte: bloco() },
  ]);

  it("o índice traz o CAMINHO do arquivo — sem ele a instrução de leitura fica sem alvo", () => {
    expect(renderIndice(blocos)).toContain("src/blocks/chart/x.tsx");
  });

  it("o índice avisa que é gerado, pra ninguém editar à mão", () => {
    expect(renderIndice(blocos)).toContain("GERADO");
  });

  it("catálogo vazio não gera tabela quebrada", () => {
    const md = renderIndice([]);
    expect(md).toContain("Nenhum bloco no catálogo ainda");
    expect(md).not.toContain("| Código |");
  });

  it("as deps do item saem dos IMPORTS, não de lista à mão", () => {
    // `usa` é prosa pra humano e desatualiza; o que o consumidor precisa instalar tem de
    // vir do que o arquivo realmente importa.
    const fontes = new Map([["src/blocks/chart/x.tsx", 'import { Card } from "@/components/shadcn/card";\nimport { Pie } from "recharts";']]);
    const especificadoresDe = (f) => [...String(f).matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
    const dono = (_base, spec) => (spec.includes("shadcn/card") ? "card" : null);
    const [item] = itensDeRegistry(blocos, dono, especificadoresDe, fontes);
    expect(item.registryDependencies).toContain("@igreen/card");
    expect(item.dependencies).toContain("recharts");
  });

  it("o nome do item é o ID — é o mesmo string que o humano cita no igreen:add", () => {
    const [item] = itensDeRegistry(blocos, () => null, () => [], new Map());
    expect(item.name).toBe("dsgreen-chart-1");
    expect(item.type).toBe("registry:block");
    expect(item.files[0].target).toBe("blocks/chart/x.tsx");
  });

  it("PRESERVA o meta.stamp existente — senão cada geração apaga o carimbo", () => {
    // O `registry:stamp` grava `meta.stamp` em todo item. Gerador que descarta faz o
    // `--check` reprovar pra sempre: gerar conserta, o stamp seguinte quebra de novo.
    // Achado ao ligar o gate no `release:check`, que roda o stamp antes.
    const meta = { stamp: "igreen-ds · dsgreen-chart-1 · v0.44.0 · abc1234 · 2026-08-20" };
    const [item] = itensDeRegistry(blocos, () => null, () => [], new Map(), new Map([["dsgreen-chart-1", meta]]));
    expect(item.meta).toEqual(meta);
  });

  it("sem stamp existente, não inventa a chave meta", () => {
    const [item] = itensDeRegistry(blocos, () => null, () => [], new Map(), new Map());
    expect("meta" in item).toBe(false);
  });

  it("react não entra como dependência npm do bloco (é peer do consumidor)", () => {
    const fontes = new Map([["src/blocks/chart/x.tsx", 'import { useState } from "react";']]);
    const especificadoresDe = (f) => [...String(f).matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
    const [item] = itensDeRegistry(blocos, () => null, especificadoresDe, fontes);
    expect(item.dependencies).toEqual([]);
  });
});
