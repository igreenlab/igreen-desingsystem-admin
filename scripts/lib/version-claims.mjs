/**
 * version-claims — a versão que a doc cita existe?
 *
 * ## O defeito que motivou
 *
 * Em 2026-08-19 eu escrevi **"(lib 0.42.2+)"** em três frases de doc enquanto esperava que o
 * bump fosse patch. A fila tinha um `feat`, a regra de bump em 0.x manda MINOR, e a release
 * saiu **0.43.0**. Duas dessas frases foram **publicadas** antes de alguém notar — uma no
 * payload do CLI, outra no embed que o consumidor lê.
 *
 * Rodando a checagem pela primeira vez, apareceu um caso mais antigo: o `DataTable/USAGE.md`
 * afirmava `(v0.19.2+)` para o `col.width` virar base/piso. **A 0.19.2 nunca existiu** (há
 * 0.19.0 e 0.19.1), e a mesma afirmação aparece como `(v0.22.0+)` em outros pontos do repo.
 *
 * ## Por que só a forma com `v`, e o número que decidiu isso
 *
 * Medido antes de escrever o gate (L-059 — regra que produz ruído vira regra ignorada). Nas
 * 99 citações `X.Y.Z` em `src/components`, `.claude/` e no payload:
 *
 *   forma `vX.Y.Z` / `vX.Y.Z+`  →  3 achados, **3 legítimos**
 *   forma `X.Y.Z` (sem o `v`)   → 10 achados, **10 ruído**
 *
 * O ruído da forma nua é inteiro: critérios de acessibilidade (`WCAG 4.1.2`, `SC 1.4.11`) e
 * exemplos de semver das tabelas de bump (`1.0.0 → 2.0.0`, `PATCH (1.0.0 → 1.0.1)`). Nada
 * disso é afirmação sobre release, e nenhuma regra de contexto separaria os dois sem virar
 * heurística sobre texto livre. O `v` é o marcador que o repo já usa quando fala de release.
 *
 * ## Versão de CLI não é versão de lib
 *
 * O CLI (`@snksergio/create-design-system`) tem linha de versão própria, e o changelog aqui é
 * só da lib. Dois dos 3 achados eram versões de CLI escritas como `v0.13.7` na mesma frase que
 * uma versão de lib (`v0.12.0`) — o leitor não tinha como saber de qual produto era cada uma.
 * O gate flagra isso **de propósito**: a saída é escrever `CLI 0.13.7`, sem o `v`, que é como
 * o resto do repo já distingue.
 *
 * Módulo PURO: recebe `[{arquivo, fonte}]` e o conjunto de versões lançadas. Quem lê disco e
 * extrai o changelog é o `.test.mjs`.
 */

/** Citações que marcam release: `v0.42.0`, `v0.42.0+`. Sem `v` não é claim (ver header). */
const CLAIM = /v(\d+\.\d+\.\d+)(\+?)/g;

/**
 * Extrai as versões lançadas de `updates-data.ts`.
 * @param {string} updatesText conteúdo de `src/preview/pages/updates-data.ts`
 * @returns {Set<string>}
 */
export function versoesLancadas(updatesText) {
  return new Set(
    [...String(updatesText).matchAll(/version:\s*"([\d.]+)"/g)].map((m) => m[1]),
  );
}

/**
 * @param {Array<{arquivo: string, fonte: string}>} arquivos
 * @param {Set<string>} lancadas
 * @returns {{citacoesConferidas: number, achados: Array<object>}}
 */
export function checkVersionClaims(arquivos, lancadas) {
  const achados = [];
  let citacoesConferidas = 0;

  for (const { arquivo, fonte } of arquivos ?? []) {
    const linhas = String(fonte).split(/\r?\n/);
    linhas.forEach((linha, i) => {
      for (const m of linha.matchAll(CLAIM)) {
        citacoesConferidas++;
        const versao = m[1];
        if (lancadas.has(versao)) continue;
        achados.push({
          arquivo,
          linha: i + 1,
          citada: `v${versao}${m[2]}`,
          versao,
          contexto: linha.trim().slice(0, 120),
          conserto:
            `\`v${versao}\` não existe no changelog. Se é versão da LIB, corrija o número ` +
            `(as vizinhas reais estão em updates-data.ts). Se é versão do CLI, escreva ` +
            `"CLI ${versao}" sem o \`v\` — aqui o \`v\` significa release da lib.`,
        });
      }
    });
  }

  return { citacoesConferidas, achados };
}

/** Mensagens prontas pra reprovar. */
export function formatar(achados) {
  return achados.map(
    (a) => `${a.arquivo}:${a.linha} cita ${a.citada}\n     …${a.contexto}…\n     → ${a.conserto}`,
  );
}
