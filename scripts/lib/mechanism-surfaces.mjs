/**
 * Gate: um MECANISMO mudou; as superfícies que o descrevem acompanharam?
 *
 * ## Por que este gate existe
 *
 * O repo tem 7 gates de paridade (`api-doc-surface`, `rules-parity`,
 * `contributor-parity`, `foundational-pairs`, `vocab-surface`, `brand-surfaces`,
 * `shadcn-vocab`). **Nenhum** liga um mecanismo em `scripts/`, `src/` ou
 * `cli/templates/**\/hooks/` às regras e skills que AFIRMAM como ele funciona. O
 * `showcase-doc-facts` é o vizinho mais próximo, mas olha só as páginas de doc do
 * showcase (`src/preview/pages/*Doc.tsx`) — não o payload que vai pro consumidor.
 *
 * Os dois defeitos que motivaram o gate foram medidos em 2026-08-18, e os dois
 * **chegaram a consumidor real** (CLI 0.25.0 e 0.25.1):
 *
 * 1. O `AppShell` passou a montar `sidebar="single"` (lib 0.41.0) e o
 *    `SingleMenuSidebar` sempre teve colapso controlado — chamado **`expanded`**. As
 *    skills `app-builder` (repo + payload) e a regra `ds-components.md` afirmavam o
 *    contrário: que o Single "não tem `collapsed` nem drawer mobile" e por isso não
 *    encaixava no shell. Quem seguisse montava layout na mão sem necessidade.
 * 2. O `ds-link` passou a projetar o hook `protect-ds.mjs` (CLI 0.24.0), que reconhece o
 *    layout de submódulo. A `ds-channels.md` foi corrigida; a `ds-design.md`, que
 *    descreve a MESMA tabela de proteção por canal, seguiu dizendo "❌ nenhuma" no
 *    submódulo por três versões do CLI.
 *
 * O padrão é o mesmo nos dois: eu mudei o mecanismo, atualizei **uma** superfície e não
 * procurei as outras que descreviam a mesma coisa. É a L-060 (texto é load-bearing: quem
 * lê para de investigar) sem nenhuma vigilância mecânica.
 *
 * ## Por que AFIRMAÇÃO POSITIVA, e nunca "frase errada ausente"
 *
 * O reflexo é proibir a frase errada (`/não tem .collapsed./`). Isso reprova as próprias
 * notas de retratação que o repo escreve por convenção — a `ds-components.md` diz, em
 * prosa corrida, *"Até o CLI 0.25.0 esta linha dizia que o `single-menu-sidebar` não
 * encaixava no `app-shell`: era **falso**"*. Filtrar retratação por marcador (`dizia`,
 * `era falso`) é heurística sobre texto livre, e a L-059 já mediu onde isso vai dar.
 *
 * Afirmação positiva não tem essa ambiguidade: a superfície **contém** a asserção certa,
 * ou não contém. E ela reproduz o defeito real — nas duas vezes, a versão quebrada não
 * tinha a asserção positiva (era justamente o que faltava).
 *
 * ## Duas formas de asserção, porque o texto tem duas formas
 *
 * - `exige` — a regex casa em qualquer ponto do arquivo. Serve pra asserção que aparece
 *   como código ou termo (`sidebar="single"`).
 * - `linhaDeTabela` — pra cada **linha de tabela markdown** (começa com `|`) cuja
 *   primeira célula casa `celula`, exigir que a linha contenha `contem`. Necessário
 *   porque a asserção da proteção por canal vive numa CÉLULA: a `ds-design.md` quebrada
 *   citava `protect-ds.mjs` na linha do copy-in, então um `exige` global passaria nela
 *   sem enxergar o `❌ nenhuma` da linha do submódulo. Só linha `|` entra — a nota de
 *   retratação é blockquote (`>`) e fica fora por construção.
 *
 * ## O fato não pode virar no-op em silêncio (L-061)
 *
 * Cada fato declara também o `mecanismo` que o sustenta. Se a sonda do mecanismo deixar
 * de casar — o `sidebar: "single"` sai do tipo, o hook para de tratar submódulo — o gate
 * **não** passa reportando nada: ele acusa `premissa-sumiu`. Sem isso, um fato cuja base
 * mudou continuaria cobrando das superfícies uma asserção que virou mentira, ou
 * (dependendo de como fosse escrito) pararia de cobrar qualquer coisa. As duas saídas são
 * piores que falhar pedindo revisão.
 *
 * ## O que NÃO entra aqui (L-059)
 *
 * Só fato **errado independente de contexto**: mecanismo existe e a superfície não o
 * afirma. Fora: "esta seção está completa?", "a explicação continua boa?". Julgamento de
 * intenção é do revisor.
 *
 * Módulo PURO: zero I/O. Quem lê disco é o `.test.mjs` — assim o mesmo código roda contra
 * fixture do conteúdo quebrado de verdade, que é como se prova que um gate pega o defeito
 * que ele existe pra pegar (L-064).
 */

/**
 * Os fatos vigiados.
 *
 * Ao mudar um mecanismo que a doc descreve, o lugar de registrar é aqui — e o gate passa
 * a cobrar de TODAS as superfícies de uma vez, em vez de depender de você lembrar quais
 * eram. Acrescentar fato é barato; o custo por fato é uma regex por superfície.
 */
export const FATOS = [
  {
    nome: "appshell-monta-sidebar-single",
    afirmacao:
      'O `AppShell` aceita `sidebar="single"` (união discriminada), e o `SingleMenuSidebar` tem colapso controlado via `expanded`.',
    // ⚠️ Sondas TOLERANTES A ESPAÇO. A primeira versão exigia `;` colado na aspa
    // (`/sidebar:\s*"single";/`), e o smoke test mostrou que `sidebar: "single" ;` — que o
    // `tsc` aceita sem reclamar — derrubava a premissa. Este repo não tem formatador (é
    // decisão de 2026-07-29), então a formatação é manual e essa variação acontece. Um
    // `premissa-sumiu` falso custa tempo de quem for investigar, sem defeito nenhum atrás.
    mecanismo: [
      {
        arquivo: "src/components/ui/AppShell/app-shell.types.ts",
        presente: /sidebar\s*:\s*"single"\s*;/,
        o_que: 'o tipo do AppShell declara o ramo `sidebar: "single"`',
      },
      {
        arquivo: "src/components/ui/SingleMenuSidebar/single-menu-sidebar.types.ts",
        presente: /expanded\s*\?\s*:\s*boolean\s*;/,
        o_que: "o Single declara colapso controlado (`expanded`)",
      },
    ],
    superficies: [
      ".claude/skills/app-builder/SKILL.md",
      "cli/templates/default/_claude/skills/app-builder/SKILL.md",
      "cli/templates/default/_claude/rules/ds-components.md",
    ].map((arquivo) => ({
      arquivo,
      exige: /sidebar\s*=\s*"single"|sidebar:\s*"single"|`"single"`/,
      dica: 'a superfície precisa afirmar que o shell monta a Single — cite `sidebar="single"` no ponto em que ela explica a escolha de menu',
    })),
  },
  {
    nome: "submodulo-tem-protecao-de-integridade",
    afirmacao:
      "No canal submódulo o `ds-link` projeta o hook `protect-ds.mjs`, que reconhece o layout de submódulo — a proteção existe (com 1 passo manual de registro no `settings.json`).",
    mecanismo: [
      {
        arquivo: "cli/templates/default/_claude/hooks/protect-ds.mjs",
        presente: /cfg\.mode\s*===\s*"submodule"/,
        o_que: "o hook trata o modo submódulo",
      },
    ],
    superficies: [
      "cli/templates/default/_claude/rules/ds-channels.md",
      "cli/templates/default/_claude/rules/ds-design.md",
    ].map((arquivo) => ({
      arquivo,
      // Âncora na PRIMEIRA célula, e em `**submódulo**` exato. Um `/submódulo/i` solto
      // casava também a linha `| **submódulo git** | git submodule add | tudo … |` da
      // tabela de COMPARAÇÃO DE CANAIS da `ds-channels.md`, que não fala de proteção e
      // não tem ✅ nenhum — falso-positivo que a fixture pegou. As duas tabelas de
      // proteção usam `**submódulo**`; a de canais, `**submódulo git**`.
      linhaDeTabela: { celula: /^\|\s*\*\*submódulo\*\*\s*\|/, contem: /✅/ },
      dica: "a linha da tabela de proteção por canal precisa marcar ✅ no submódulo (a proteção existe desde o CLI 0.24.0); `❌ nenhuma` ali é a afirmação falsa que foi publicada",
    })),
  },
];

/**
 * Linhas que são linha de tabela markdown.
 *
 * ⚠️ Precisa tirar o marcador de blockquote ANTES de olhar o `|`. A tabela de proteção por
 * canal da `ds-design.md` vive **dentro** de um blockquote (`> | **submódulo** | … |`), nas
 * duas versões — a quebrada e a corrigida. A primeira versão desta função exigia que a linha
 * começasse com `|` e por isso ignorava a tabela inteira: o gate passava batido no defeito
 * que existe pra pegar. Quem pegou foi a fixture do commit real (84515b4^), não o meu
 * raciocínio sobre o formato — é o ponto da L-064.
 *
 * A nota de retratação continua fora por construção: depois de tirar o `>`, ela começa com
 * `⚠️`/texto, não com `|`.
 */
function linhasDeTabela(texto) {
  return texto
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s>]+/, ""))
    .filter((l) => l.startsWith("|"));
}

/**
 * @param {Array<{nome: string, afirmacao: string, mecanismo: Array<object>, superficies: Array<object>}>} fatos
 * @param {(arquivo: string) => string | null} ler  conteúdo do arquivo, ou `null` se não existe
 * @returns {{achados: Array<{fato: string, tipo: string, arquivo: string, o_que: string, conserto: string}>, verificados: number}}
 */
export function checkMechanismSurfaces(fatos, ler) {
  const achados = [];
  let verificados = 0;

  for (const fato of fatos) {
    // 1. A premissa ainda vale? Sem isso o fato viraria no-op ou cobrança de mentira.
    let premissaOk = true;
    for (const m of fato.mecanismo) {
      const src = ler(m.arquivo);
      if (src === null) {
        premissaOk = false;
        achados.push({
          fato: fato.nome,
          tipo: "premissa-sumiu",
          arquivo: m.arquivo,
          o_que: `arquivo do mecanismo não existe — o fato "${fato.nome}" apoiava-se nele (${m.o_que})`,
          conserto:
            "o mecanismo mudou de lugar ou saiu: atualize a sonda em `FATOS` (scripts/lib/mechanism-surfaces.mjs) e reveja se as superfícies ainda devem afirmar isso",
        });
        continue;
      }
      if (!m.presente.test(src)) {
        premissaOk = false;
        achados.push({
          fato: fato.nome,
          tipo: "premissa-sumiu",
          arquivo: m.arquivo,
          o_que: `a sonda do mecanismo não casa mais (${m.o_que})`,
          conserto:
            "se o mecanismo mudou de propósito, atualize `FATOS` E as superfícies na MESMA PR — é exatamente a divergência que este gate existe pra impedir",
        });
      }
    }
    // Premissa caiu: não cobrar das superfícies uma asserção que pode ter virado falsa.
    if (!premissaOk) continue;

    // 2. Cada superfície afirma o fato?
    for (const s of fato.superficies) {
      const txt = ler(s.arquivo);
      if (txt === null) {
        achados.push({
          fato: fato.nome,
          tipo: "superficie-sumiu",
          arquivo: s.arquivo,
          o_que: "superfície declarada não existe",
          conserto:
            "arquivo renomeado/removido? atualize a lista em `FATOS` (scripts/lib/mechanism-surfaces.mjs)",
        });
        continue;
      }
      verificados++;

      if (s.exige) {
        if (!s.exige.test(txt)) {
          achados.push({
            fato: fato.nome,
            tipo: "afirmacao-ausente",
            arquivo: s.arquivo,
            o_que: `não afirma: ${fato.afirmacao}`,
            conserto: s.dica,
          });
        }
        continue;
      }

      if (s.linhaDeTabela) {
        const { celula, contem } = s.linhaDeTabela;
        const alvo = linhasDeTabela(txt).filter((l) => celula.test(l));
        if (alvo.length === 0) {
          achados.push({
            fato: fato.nome,
            tipo: "afirmacao-ausente",
            arquivo: s.arquivo,
            o_que: `nenhuma linha de tabela casa ${celula} — a superfície deixou de descrever esse caso`,
            conserto: s.dica,
          });
          continue;
        }
        const faltando = alvo.filter((l) => !contem.test(l));
        if (faltando.length > 0) {
          achados.push({
            fato: fato.nome,
            tipo: "afirmacao-ausente",
            arquivo: s.arquivo,
            o_que: `linha de tabela contradiz o mecanismo: ${faltando[0].trim().slice(0, 120)}`,
            conserto: s.dica,
          });
        }
      }
    }
  }

  return { achados, verificados };
}
