import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseEmbed, compareEmbedContent, checkEmbedContent, EMBED } from "./embed-content.mjs";

/** Fake de fs pros testes de unidade — evita tocar disco pra caso sintético. */
function fakeFs(arquivos) {
  return {
    exists: (p) => p in arquivos,
    readFile: (p) => arquivos[p],
  };
}

describe("embed-content — parseEmbed", () => {
  it("extrai o objeto do embed real do repo", () => {
    const reg = parseEmbed(readFileSync(EMBED, "utf8"));
    expect(Object.keys(reg).length).toBeGreaterThan(80);
    expect(reg).toHaveProperty("theme-vibrant");
  });

  it("lança quando o arquivo não tem a declaração esperada", () => {
    expect(() => parseEmbed("// vazio\n")).toThrow(/export const registry/);
  });
});

describe("embed-content — detecção de defasagem", () => {
  const embed = {
    "theme-vibrant": {
      files: [{ path: "a.css", content: "conteudo NOVO\n", type: "registry:file" }],
    },
  };

  it("aprova quando embed e fonte são idênticos", () => {
    const r = compareEmbedContent(embed, fakeFs({ "a.css": "conteudo NOVO\n" }));
    expect(r).toEqual({ conferidos: 1, divergentes: [], semFonte: [] });
  });

  it("acusa quando a fonte mudou e o embed ficou pra trás", () => {
    // É o defeito real de 2026-08-04: o CSS foi corrigido, o embed seguiu servindo o
    // header velho, e o check por carimbo aprovou porque ninguém re-carimbou.
    const r = compareEmbedContent(embed, fakeFs({ "a.css": "conteudo VELHO\n" }));
    expect(r.divergentes).toEqual(["theme-vibrant → a.css"]);
    expect(r.conferidos).toBe(1);
  });

  it("acusa quando o embed cita path que não existe mais", () => {
    const r = compareEmbedContent(embed, fakeFs({}));
    expect(r.semFonte).toEqual(["theme-vibrant → a.css"]);
    // Não conta como conferido: não havia o que comparar.
    expect(r.conferidos).toBe(0);
    expect(r.divergentes).toEqual([]);
  });

  it("normaliza CRLF e BOM — variam por checkout, não são defasagem", () => {
    const comRuido = { "a.css": "﻿conteudo NOVO\r\n" };
    expect(compareEmbedContent(embed, fakeFs(comRuido)).divergentes).toEqual([]);
  });

  it("ignora entrada sem content (metadado) em vez de contar como divergente", () => {
    const soMeta = { x: { files: [{ path: "a.css", type: "registry:file" }] } };
    const r = compareEmbedContent(soMeta, fakeFs({ "a.css": "qualquer" }));
    expect(r).toEqual({ conferidos: 0, divergentes: [], semFonte: [] });
  });

  it("não quebra em item sem files", () => {
    expect(() => compareEmbedContent({ x: {}, y: { files: null } }, fakeFs({}))).not.toThrow();
  });
});

describe("embed-content — o embed commitado", () => {
  it("está em sync por conteúdo com os arquivos-fonte", () => {
    // Este é o teste que trava a regressão: reprova o PR que edita arquivo
    // distribuído e esquece de regerar o embed.
    const { conferidos, divergentes, semFonte } = checkEmbedContent();
    expect(divergentes, `regenere o embed: registry:build + copy-registry`).toEqual([]);
    expect(semFonte).toEqual([]);
    expect(conferidos).toBeGreaterThan(400);
  });
});
