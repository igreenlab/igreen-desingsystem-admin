/**
 * canonical-base-ref — descobre contra QUAL ref o ratchet deve diffar.
 *
 * ## O defeito que isto existe pra corrigir (medido em 2026-08-10)
 *
 * `npm run lint:styles` passava `--ratchet origin/main` fixo. Mas neste repo
 * `origin` é o **fork pessoal parado** — a Regra 8 diz isso em letras maiúsculas, e
 * o remote canônico se chama `empresa`. Medido no dia: `origin/main` estava em
 * `9b86f6f` (2026-05-20, v0.5.0) enquanto `empresa/main` estava em `756e912`
 * (2026-08-10, PR #154). Três meses de distância.
 *
 * Consequência: o ratchet contava **tudo** que entrou desde maio como "linha
 * adicionada por esta PR" e reprovava com **17 violações** em `shadcn/`
 * (carousel · context-menu · drawer · menubar · navigation-menu) — nenhuma delas
 * tocada pela PR que estava rodando o comando. O mesmo comando contra
 * `empresa/main`: **0 violação**.
 *
 * Não é o `--merge-base` errado (ele está certo); é o **ref base** apontando pra
 * uma foto de maio. E é a L-059 de novo, num nível acima: gate que reprova o caso
 * legítimo perde autoridade, e quem roda aprende a ignorar a saída.
 *
 * ## Por que resolver por URL, e não pelo nome do remote
 *
 * Chumbar `empresa/main` conserta o local e **quebra o CI**, onde o único remote é
 * `origin` (o `actions/checkout` o aponta pro repo sendo buildado). Chumbar
 * `origin/main` é o bug atual. O invariante que vale nos dois lugares não é o
 * NOME do remote — é a **URL**: o remote canônico é aquele que aponta pro
 * `igreenlab/igreen-desingsystem-admin`, se chame `origin` (CI) ou `empresa`
 * (local).
 *
 * O CI segue passando base explícita (`origin/${{ github.base_ref }}`), porque lá
 * a base pode não ser `main`. Esta resolução só entra quando ninguém passou base —
 * ou seja, no uso local. Ainda assim ela é correta no CI, o que é a propriedade que
 * a torna segura.
 */
import { execFileSync } from "node:child_process";

/** O repo canônico do DS. Mesmo valor que a Regra 8 e o `gh pr create --repo`. */
export const CANONICAL_REPO = "igreenlab/igreen-desingsystem-admin";

/**
 * Extrai `owner/repo` de uma URL de remote, nas 3 formas que o git aceita:
 * `https://host/owner/repo(.git)`, `git@host:owner/repo(.git)`,
 * `ssh://git@host/owner/repo(.git)`. Devolve `null` se não reconhecer — remote de
 * disco (`/caminho/bare.git`) cai aqui, e não ser canônico é a resposta certa.
 */
export function repoSlug(url) {
  if (!url) return null;
  const limpa = url.trim().replace(/\.git$/i, "").replace(/\/+$/, "");
  // `git@host:owner/repo` — o `:` separa host de path (não é porta).
  const scp = limpa.match(/^[^/]+@[^/:]+:(.+)$/);
  const caminho = scp ? scp[1] : limpa.replace(/^[a-z+]+:\/\/[^/]+\//i, "");
  if (caminho === limpa && !scp) return null; // não tinha esquema nem forma scp
  const partes = caminho.split("/").filter(Boolean);
  if (partes.length < 2) return null;
  return partes.slice(-2).join("/").toLowerCase();
}

/** Converte a saída de `git remote -v` em `Map<nome, url>` (fetch). */
export function parseRemotes(stdout) {
  const out = new Map();
  for (const linha of String(stdout).split(/\r?\n/)) {
    const m = linha.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
    if (!m) continue;
    if (m[3] === "fetch" || !out.has(m[1])) out.set(m[1], m[2]);
  }
  return out;
}

/**
 * Escolhe o ref base. Puro de propósito: `remotes` e `refExists` entram como
 * dados pra o teste poder reproduzir o defeito real (fork parado como `origin` +
 * canônico como `empresa`) sem depender do git da máquina — L-064.
 *
 * Preferência quando MAIS DE UM remote aponta pro repo canônico: `origin`. Não é
 * estética — mantém o CI byte-idêntico ao comportamento antigo.
 *
 * Fallback é `origin/<branch>` (o comportamento antigo), pra clone que só tem o
 * fork não ficar sem ratchet nenhum. `motivo` sai na mensagem do gate: base
 * silenciosa é o que fez este bug durar.
 */
export function resolveBaseRef({ remotes, refExists, branch = "main" }) {
  const canonicos = [...remotes.entries()]
    .filter(([, url]) => repoSlug(url) === CANONICAL_REPO)
    .map(([nome]) => nome)
    .sort((a, b) => (a === "origin" ? -1 : b === "origin" ? 1 : a.localeCompare(b)));

  for (const nome of canonicos) {
    const ref = `${nome}/${branch}`;
    if (refExists(ref)) {
      return { ref, remote: nome, motivo: `remote "${nome}" aponta pro ${CANONICAL_REPO}` };
    }
  }

  const fallback = `origin/${branch}`;
  const motivo = canonicos.length
    ? `nenhum ref local pros remotes canônicos (${canonicos.join(", ")}) — rode: git fetch ${canonicos[0]} ${branch}`
    : `nenhum remote aponta pro ${CANONICAL_REPO} — usando ${fallback}`;
  return { ref: fallback, remote: "origin", motivo };
}

/** Wrapper que fala com o git de verdade. Falha de git = Map/false, nunca throw. */
export function resolveBaseRefFromGit(branch = "main") {
  let remotes = new Map();
  try {
    remotes = parseRemotes(execFileSync("git", ["remote", "-v"], { encoding: "utf8" }));
  } catch {
    /* sem git ou fora de repo — o fallback resolve, e o diff logo abaixo erra claro */
  }
  const refExists = (ref) => {
    try {
      execFileSync("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`], {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  };
  return resolveBaseRef({ remotes, refExists, branch });
}
