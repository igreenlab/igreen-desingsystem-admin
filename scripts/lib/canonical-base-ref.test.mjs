/**
 * O defeito REAL, reproduzido com os dados medidos em 2026-08-10 (L-064: gate novo
 * só vale depois de ver reprovar o caso que motivou sua existência).
 *
 * `git remote -v` deste repo naquele dia:
 *   empresa  https://github.com/igreenlab/igreen-desingsystem-admin.git  ← canônico
 *   origin   https://github.com/snksergio/igreen-desingsystem-admin.git  ← fork PARADO
 *
 * `origin/main` = 9b86f6f (2026-05-20) · `empresa/main` = 756e912 (2026-08-10).
 * `lint:styles` chumbava `origin/main` → 17 violações em arquivos que a PR não
 * tocou. Contra `empresa/main`: 0.
 */
import { describe, it, expect } from "vitest";
import {
  CANONICAL_REPO,
  parseRemotes,
  repoSlug,
  resolveBaseRef,
  resolveBaseRefFromGit,
} from "./canonical-base-ref.mjs";

/** Saída literal de `git remote -v` neste repo (o caso do defeito). */
const REMOTE_V_LOCAL = `empresa	https://github.com/igreenlab/igreen-desingsystem-admin.git (fetch)
empresa	https://github.com/igreenlab/igreen-desingsystem-admin.git (push)
origin	https://github.com/snksergio/igreen-desingsystem-admin.git (fetch)
origin	https://github.com/snksergio/igreen-desingsystem-admin.git (push)`;

/** Saída de `git remote -v` dentro do GitHub Actions (`actions/checkout`). */
const REMOTE_V_CI = `origin	https://github.com/igreenlab/igreen-desingsystem-admin (fetch)
origin	https://github.com/igreenlab/igreen-desingsystem-admin (push)`;

const todosExistem = () => true;

describe("resolveBaseRef — o defeito medido", () => {
  it("com fork como `origin`, escolhe o remote CANÔNICO (era o bug)", () => {
    const { ref, remote } = resolveBaseRef({
      remotes: parseRemotes(REMOTE_V_LOCAL),
      refExists: todosExistem,
    });
    expect(ref, "origin/main é o fork de maio — 17 falsos positivos").toBe("empresa/main");
    expect(remote).toBe("empresa");
  });

  it("o motivo diz POR QUE aquele ref — base silenciosa foi o que fez o bug durar", () => {
    const { motivo } = resolveBaseRef({
      remotes: parseRemotes(REMOTE_V_LOCAL),
      refExists: todosExistem,
    });
    expect(motivo).toContain("empresa");
    expect(motivo).toContain(CANONICAL_REPO);
  });

  it("no CI (só `origin`, apontando pro canônico) → origin/main, igual a antes", () => {
    // Propriedade que torna a mudança segura: o CI não muda de comportamento.
    const { ref, remote } = resolveBaseRef({
      remotes: parseRemotes(REMOTE_V_CI),
      refExists: todosExistem,
    });
    expect(ref).toBe("origin/main");
    expect(remote).toBe("origin");
  });

  it("`origin` ganha quando MAIS DE UM remote é canônico", () => {
    const remotes = parseRemotes(
      `origin	git@github.com:igreenlab/igreen-desingsystem-admin.git (fetch)
upstream	https://github.com/igreenlab/igreen-desingsystem-admin.git (fetch)`,
    );
    expect(resolveBaseRef({ remotes, refExists: todosExistem }).remote).toBe("origin");
  });

  it("branch não-main é respeitada (o CI diffa contra github.base_ref)", () => {
    const { ref } = resolveBaseRef({
      remotes: parseRemotes(REMOTE_V_LOCAL),
      refExists: todosExistem,
      branch: "release/v1",
    });
    expect(ref).toBe("empresa/release/v1");
  });
});

describe("resolveBaseRef — degradação", () => {
  it("canônico existe mas SEM ref local → fallback + instrução de fetch", () => {
    const { ref, motivo } = resolveBaseRef({
      remotes: parseRemotes(REMOTE_V_LOCAL),
      refExists: () => false,
    });
    expect(ref, "não deixa o gate sem base").toBe("origin/main");
    expect(motivo).toContain("git fetch empresa main");
  });

  it("clone só do fork (nenhum remote canônico) → origin/main, comportamento antigo", () => {
    const remotes = parseRemotes(
      `origin	https://github.com/snksergio/igreen-desingsystem-admin.git (fetch)`,
    );
    const { ref, motivo } = resolveBaseRef({ remotes, refExists: todosExistem });
    expect(ref).toBe("origin/main");
    expect(motivo).toContain("nenhum remote aponta");
  });

  it("sem remote nenhum → não lança", () => {
    expect(resolveBaseRef({ remotes: new Map(), refExists: todosExistem }).ref).toBe(
      "origin/main",
    );
  });
});

describe("repoSlug — as 3 formas de URL que o git aceita", () => {
  it.each([
    ["https://github.com/igreenlab/igreen-desingsystem-admin.git", CANONICAL_REPO],
    ["https://github.com/igreenlab/igreen-desingsystem-admin", CANONICAL_REPO],
    ["git@github.com:igreenlab/igreen-desingsystem-admin.git", CANONICAL_REPO],
    ["ssh://git@github.com/igreenlab/igreen-desingsystem-admin.git", CANONICAL_REPO],
    // Maiúscula/minúscula não distingue repo no GitHub — normalizar evita
    // "canônico que não é reconhecido como canônico".
    ["https://github.com/IGreenLab/iGreen-Desingsystem-Admin.git", CANONICAL_REPO],
    ["https://github.com/snksergio/igreen-desingsystem-admin.git", "snksergio/igreen-desingsystem-admin"],
  ])("%s → %s", (url, esperado) => {
    expect(repoSlug(url)).toBe(esperado);
  });

  it.each([["/caminho/local/bare.git"], ["D:/repos/algo"], [""], [null]])(
    "não reconhece %s (e não lança)",
    (url) => {
      expect(repoSlug(url)).toBeNull();
    },
  );
});

describe("parseRemotes", () => {
  it("prefere a URL de (fetch) e não duplica remote", () => {
    const m = parseRemotes(REMOTE_V_LOCAL);
    expect([...m.keys()].sort()).toEqual(["empresa", "origin"]);
    expect(m.get("empresa")).toContain("igreenlab");
  });

  it("ignora linha que não é remote", () => {
    expect(parseRemotes("lixo\n\nfoo bar (fetch)\n").get("foo")).toBe("bar");
  });
});

describe("resolveBaseRefFromGit — contra o git REAL deste repo", () => {
  it("resolve pro canônico, não pro fork", () => {
    // Sem mock: é o caso que o `npm run lint:styles` vai usar de fato. Se alguém
    // clonar só o fork, o teste vira `origin/main` e a asserção abaixo ainda passa.
    const { ref, remote, motivo } = resolveBaseRefFromGit();
    expect(ref).toBe(`${remote}/main`);
    expect(typeof motivo).toBe("string");
    expect(motivo.length).toBeGreaterThan(0);
  });
});
