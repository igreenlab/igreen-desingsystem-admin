import { describe, it, expect } from "vitest";
import { checkEmbedStaleness, parseStamps, summarize } from "./embed-staleness.mjs";

/** Monta um item de registry com carimbo no formato real do `registry-stamp.mjs`. */
const item = (name, version, hash, date = "2026-07-28") => ({
  name,
  meta: { stamp: `igreen-ds · ${name} · v${version} · ${hash} · ${date}` },
});

/** Simula o embed: o `registry-data.ts` é um módulo com os JSON serializados. */
const embed = (...stamps) =>
  `// AUTO-GERADO\nexport const registry = ${JSON.stringify(
    Object.fromEntries(stamps.map((s) => [s.split(" · ")[1], { meta: { stamp: s } }])),
  )};\n`;

const stampOf = (name, version, hash, date = "2026-07-28") =>
  `igreen-ds · ${name} · v${version} · ${hash} · ${date}`;

describe("parseStamps", () => {
  it("extrai nome, versão, hash e data", () => {
    const m = parseStamps(stampOf("choropleth-map", "0.30.0", "ea1ef0d"));
    expect(m.get("choropleth-map")).toEqual({
      version: "0.30.0",
      hash: "ea1ef0d",
      date: "2026-07-28",
    });
  });

  it("aceita nome com prefixo de namespace (example-finance, @igreen/tv)", () => {
    const m = parseStamps(
      `${stampOf("example-finance", "0.30.0", "abc1234")}\n${stampOf("@igreen/tv", "0.30.0", "abc1234")}`,
    );
    expect([...m.keys()]).toEqual(["example-finance", "@igreen/tv"]);
  });

  it("texto sem carimbo devolve mapa vazio, não lança", () => {
    expect(parseStamps("nada aqui").size).toBe(0);
    expect(parseStamps(undefined).size).toBe(0);
  });
});

describe("checkEmbedStaleness", () => {
  it("em sincronia → nenhum achado", () => {
    const items = [item("button", "0.30.0", "ea1ef0d"), item("modal", "0.30.0", "ea1ef0d")];
    const t = embed(stampOf("button", "0.30.0", "ea1ef0d"), stampOf("modal", "0.30.0", "ea1ef0d"));
    expect(checkEmbedStaleness({ items, embedText: t })).toEqual([]);
  });

  // O cenário que motivou o módulo: release bumpou e carimbou o registry.json,
  // mas ninguém rodou copy-registry.mjs → consumidor recebe código antigo com
  // número de versão novo, e o check antigo (só nomes) ficava verde.
  it("versão divergente → stale (o furo do release sem regenerar)", () => {
    const items = [item("modal", "0.30.1", "9f8e7d6")];
    const t = embed(stampOf("modal", "0.30.0", "ea1ef0d"));
    const f = checkEmbedStaleness({ items, embedText: t });
    expect(f).toHaveLength(1);
    expect(f[0].id).toBe("stale");
    expect(f[0].msg).toContain("v0.30.1");
    expect(f[0].msg).toContain("v0.30.0");
  });

  // Mesma versão + hash diferente = alguém editou o componente e re-carimbou sem
  // regenerar. Versão sozinha não pegaria; é por isso que o hash entra na comparação.
  it("mesma versão mas hash divergente → stale", () => {
    const items = [item("button", "0.30.0", "9f8e7d6")];
    const t = embed(stampOf("button", "0.30.0", "ea1ef0d"));
    const f = checkEmbedStaleness({ items, embedText: t });
    expect(f).toHaveLength(1);
    expect(f[0].id).toBe("stale");
  });

  it("item novo ausente do embed → absent-in-embed", () => {
    const items = [item("button", "0.30.0", "ea1ef0d"), item("novo-widget", "0.30.0", "ea1ef0d")];
    const t = embed(stampOf("button", "0.30.0", "ea1ef0d"));
    const f = checkEmbedStaleness({ items, embedText: t });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ id: "absent-in-embed", name: "novo-widget" });
  });

  it("item sem meta.stamp → no-registry-stamp, não trava os outros", () => {
    const items = [{ name: "sem-carimbo" }, item("button", "0.30.0", "ea1ef0d")];
    const t = embed(stampOf("button", "0.30.0", "ea1ef0d"));
    const f = checkEmbedStaleness({ items, embedText: t });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ id: "no-registry-stamp", name: "sem-carimbo" });
  });

  it("meta.stamp em formato estranho → no-registry-stamp", () => {
    const items = [{ name: "button", meta: { stamp: "carimbo velho sem formato" } }];
    expect(checkEmbedStaleness({ items, embedText: embed() })[0].id).toBe("no-registry-stamp");
  });

  it("items ausente/vazio não lança", () => {
    expect(checkEmbedStaleness({ items: undefined, embedText: "" })).toEqual([]);
    expect(checkEmbedStaleness({ items: [], embedText: "" })).toEqual([]);
  });

  it("relata TODOS os divergentes, não só o primeiro", () => {
    const items = [item("a", "0.30.1", "9f8e7d6"), item("b", "0.30.1", "9f8e7d6")];
    const t = embed(stampOf("a", "0.30.0", "ea1ef0d"), stampOf("b", "0.30.0", "ea1ef0d"));
    expect(checkEmbedStaleness({ items, embedText: t })).toHaveLength(2);
  });
});

describe("summarize", () => {
  it("agrega contagem, versões e hashes distintos", () => {
    const m = parseStamps(
      `${stampOf("a", "0.30.0", "ea1ef0d")}\n${stampOf("b", "0.30.1", "9f8e7d6")}`,
    );
    expect(summarize(m)).toEqual({
      count: 2,
      versions: ["0.30.0", "0.30.1"],
      hashes: ["9f8e7d6", "ea1ef0d"],
    });
  });
});
