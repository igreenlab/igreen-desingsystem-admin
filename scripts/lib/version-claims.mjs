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
 * ## O número não existe na hora de escrever — por isso `vNEXT`
 *
 * Quem documenta um comportamento novo está numa feature PR: o bump só acontece na release, e
 * qual será o número **ninguém sabe** (depende do que mais entrar na fila). Foi assim que erramos
 * duas vezes em 12 horas — `0.42.2` virou 0.43.0, e o aviso do `maxViewTabs` foi documentado como
 * `v0.43.1+` numa PR que este próprio gate reprovou.
 *
 * Escreva **`vNEXT`**. O `npm test` aceita (é o estado normal de uma feature PR); o
 * `release:check` **reprova**, então a release não consegue sair com o placeholder — o
 * `/ds-release` substitui pelo número real, que naquele momento já é conhecido. Ou seja: a
 * substituição é lembrada por gate, não por disciplina.
 *
 * Módulo PURO: recebe `[{arquivo, fonte}]` e o conjunto de versões lançadas. Quem lê disco é o
 * `.test.mjs` e o `scripts/version-claims-check.mjs`.
 */

/** Citações que marcam release: `v0.42.0`, `v0.42.0+`. Sem `v` não é claim (ver header). */
const CLAIM = /v(\d+\.\d+\.\d+)(\+?)/g;

/** Placeholder pra "a próxima release, número ainda desconhecido". Ver header. */
export const PLACEHOLDER = "vNEXT";

/**
 * Onde uma citação de versão é AFIRMAÇÃO pro leitor: USAGE de componente, skills do pipeline,
 * regras, e o payload que a IA do consumidor lê. Fora daqui de propósito: `pipeline-state.md` e
 * `lessons.md`, que são registro histórico e citam versões de qualquer época legitimamente.
 */
export const RAIZES = [
  "src/components",
  ".claude/skills",
  ".claude/rules",
  "cli/templates/default/_claude",
];

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
            `\`v${versao}\` não existe no changelog. Três casos: (a) o comportamento ainda ` +
            `NÃO foi lançado — escreva \`${PLACEHOLDER}\`, que o /ds-release substitui pelo ` +
            `número real no passo 6.2a (não tente adivinhar: o bump depende do que mais ` +
            `entrar na fila); (b) já foi lançado e o número está errado — as versões reais ` +
            `estão em updates-data.ts; (c) é versão do CLI — escreva "CLI ${versao}" sem o ` +
            `\`v\`, que aqui significa release da lib.`,
        });
      }
    });
  }

  return { citacoesConferidas, achados };
}

/**
 * O único arquivo que PRECISA conter `vNEXT`: é o passo 6.2a do `/ds-release`, que manda
 * substituí-lo. Sem esta exceção o gate reprovaria a própria instrução que o resolve — e a saída
 * "tire a palavra da receita" deixaria a receita sem como se referir ao que ela troca.
 *
 * Não é override configurável (L-063 — resista a config pra 1 exceção): é o dono da definição,
 * fixo aqui, e um `vNEXT` em qualquer outra skill continua reprovando.
 */
export const DONO_DA_CONVENCAO = ".claude/skills/ds-dev/release.md";

/**
 * Onde o placeholder `vNEXT` ainda está — só o `release:check` reprova isso.
 *
 * @param {Array<{arquivo: string, fonte: string}>} arquivos
 * @returns {{achados: Array<object>}}
 */
export function checkPlaceholders(arquivos) {
  const achados = [];
  for (const { arquivo, fonte } of arquivos ?? []) {
    if (String(arquivo).replace(/\\/g, "/").endsWith(DONO_DA_CONVENCAO)) continue;
    String(fonte)
      .split(/\r?\n/)
      .forEach((linha, i) => {
        if (!linha.includes(PLACEHOLDER)) return;
        achados.push({
          arquivo,
          linha: i + 1,
          citada: PLACEHOLDER,
          contexto: linha.trim().slice(0, 120),
          conserto:
            `\`${PLACEHOLDER}\` é placeholder de feature PR e não pode ser publicado. ` +
            `Agora o número É conhecido: troque pela versão desta release (a do bump em ` +
            `package.json). Este check só roda no release:check, justamente pra isso.`,
        });
      });
  }
  return { achados };
}

/** Mensagens prontas pra reprovar. */
export function formatar(achados) {
  return achados.map(
    (a) => `${a.arquivo}:${a.linha} cita ${a.citada}\n     …${a.contexto}…\n     → ${a.conserto}`,
  );
}
