/**
 * Gate: fatos MECÂNICOS que as páginas de doc do próprio pipeline afirmam.
 *
 * ## Por que este gate existe
 *
 * Todos os checks do repo olham `src/components/**`, `registry.json`, `tokens/` — o
 * código. **Nenhum** olhava as páginas que documentam o pipeline. Resultado medido em
 * 2026-08-11, com o pipeline tendo mudado dezenas de PRs desde que essas páginas foram
 * escritas:
 *
 * - `DistributionDoc` dizia **87** itens no registry; havia **91**.
 * - `StructureDoc` dizia lições **L-001..L-037**; a última era **L-069**.
 * - `AgentsOverviewDoc` dizia **64 lessons (59 + 5)**; eram **69 (64 + 5)**.
 * - `PipelineCommandsDoc` listava **8** dos **15** commands.
 * - `PipelineSkillsDoc` nomeava `spec-token-color.md`, `spec-token-spacing.md`,
 *   `spec-token-sizing.md`, `spec-token-typography.md` — **quatro arquivos que não
 *   existem**. O real é um `spec-token.md` único, roteado por `args tipo=`.
 * - 3 páginas afirmavam que `ds-standards.md` é "auto-loaded **by glob**". O campo
 *   `globs:` do frontmatter é sintaxe do **Cursor** e é **inerte** aqui; o arquivo entra
 *   em TODA sessão. A `ds-standards` já corrigia isso sobre si mesma, e o showcase
 *   seguia ensinando o mecanismo inexistente.
 *
 * O último é o pior tipo: quem lê uma frase que descreve mecanismo **para de
 * investigar** (L-060). Nomear arquivo que não existe é o mesmo defeito com outra cara —
 * o leitor procura, não acha, e conclui que o repo está quebrado.
 *
 * ## O que este gate NÃO faz — e por quê (L-059)
 *
 * Só entra aqui regra **errada independente de contexto**: contagem que divergiu da
 * fonte, nome de arquivo que não existe, frase que descreve mecanismo que não existe.
 *
 * Fora: "esta página está completa?", "esta explicação continua boa?", "falta
 * mencionar X". Julgamento de intenção não vira grep sem produzir ruído — a medição da
 * L-059 (51 hits, 50 ruído) é o precedente. Isso fica pro revisor humano.
 *
 * Módulo PURO: zero I/O. Quem lê disco é o `.test.mjs`. Assim o mesmo código pode ser
 * exercitado com fixture do histórico — que é como se prova que um gate pega o defeito
 * que ele existe pra pegar (L-064).
 */

/** Um achado. `arquivo` é relativo à raiz do repo. */
function achado(arquivo, o_que, conserto) {
  return { arquivo, o_que, conserto };
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. Contagens afirmadas vs. a fonte
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Contagem de itens do registry afirmada no `DistributionDoc`.
 *
 * Casa a frase inteira, não um número solto: "91" aparece em outros contextos, e um
 * gate que pega qualquer número vira ruído.
 */
export function checarContagemRegistry(textoDistribution, totalReal) {
  const m = textoDistribution.match(/lista os (\d+) itens/);
  if (!m) {
    return [
      achado(
        "src/preview/pages/DistributionDoc.tsx",
        'a frase "lista os N itens" desapareceu — o gate perdeu a âncora',
        "restaure a frase, ou remova esta checagem do showcase-doc-facts.mjs (não deixe o gate cego)",
      ),
    ];
  }
  const afirmado = Number(m[1]);
  if (afirmado === totalReal) return [];
  return [
    achado(
      "src/preview/pages/DistributionDoc.tsx",
      `afirma ${afirmado} itens no registry; registry.json tem ${totalReal}`,
      `troque "lista os ${afirmado} itens" por "lista os ${totalReal} itens"`,
    ),
  ];
}

/**
 * Número da última lição afirmado nas páginas que citam a faixa ou o total.
 *
 * Duas formas na doc, as duas medidas erradas em 2026-08-11:
 *   - faixa:  "L-001..L-037"
 *   - total:  "64 lessons (59 active + 5 archived …)"
 */
export function checarContagemLicoes(docs, ultimaLicao, totalAtivas, totalArquivadas) {
  const out = [];
  for (const { arquivo, texto } of docs) {
    for (const m of texto.matchAll(/L-001\.\.L-(\d{3})/g)) {
      if (Number(m[1]) !== ultimaLicao) {
        out.push(
          achado(
            arquivo,
            `afirma a faixa L-001..L-${m[1]}; a última lição é L-${String(ultimaLicao).padStart(3, "0")}`,
            `troque por L-001..L-${String(ultimaLicao).padStart(3, "0")}`,
          ),
        );
      }
    }
    for (const m of texto.matchAll(/(\d+) lessons \((\d+) active \+ (\d+) archived/g)) {
      const [, total, ativas, arquivadas] = m.map(Number);
      if (total !== ultimaLicao || ativas !== totalAtivas || arquivadas !== totalArquivadas) {
        out.push(
          achado(
            arquivo,
            `afirma ${total} lessons (${ativas} active + ${arquivadas} archived); o real é ${ultimaLicao} (${totalAtivas} + ${totalArquivadas})`,
            `troque por "${ultimaLicao} lessons (${totalAtivas} active + ${totalArquivadas} archived"`,
          ),
        );
      }
    }
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. Nome de arquivo que a doc nomeia e o disco não tem
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Todo `<algo>.md` nomeado numa página de pipeline tem que existir **em algum lugar** do
 * repo.
 *
 * ## Por que "em algum lugar", e não "sob `.claude/skills/`"
 *
 * A 1ª versão desta função exigia que todo `.md` citado no `PipelineSkillsDoc` estivesse
 * sob `.claude/skills/`. Rodada contra o repo real, acusou três **falsos positivos** na
 * hora: `ds-standards.md` (vive em `.claude/rules/`), `dashboard-patterns.md`
 * (`.ai/context/components/`) e `pipeline-state.md` (`.ai/status/`) — as páginas citam
 * esses arquivos legitimamente, ao explicar de onde uma skill lê contexto.
 *
 * Era o próprio erro que o cabeçalho deste arquivo adverte: regra mecânica que depende de
 * contexto (*qual* menção é "declaração de path de skill" e qual é referência cruzada)
 * produz ruído. O sinal que **não** depende de contexto é mais simples e mais forte:
 * **o arquivo existe?** Se não existe em canto nenhum, a doc está mandando o leitor
 * procurar o que não tem — sempre defeito, qualquer que seja a intenção da frase.
 *
 * Direção ÚNICA (nomeado ⇒ existe). O inverso (existe ⇒ nomeado) reprovaria por qualquer
 * `.md` novo do repo, e essas páginas não se propõem a listar tudo. A exceção é
 * `.claude/commands/`, onde o catálogo SE PROPÕE a ser completo — daí a checagem
 * bidirecional própria, ali embaixo.
 *
 * `nomesNoDisco` = Set dos basenames de `.md` do repo (fora de `node_modules`, `dist*`).
 */
export function checarArquivosNomeados(docs, nomesNoDisco, ilustrativos = new Set()) {
  const out = [];
  for (const { arquivo, texto } of docs) {
    const vistos = new Set();
    for (const m of texto.matchAll(/\b([a-z0-9][a-z0-9._-]*\.md)\b/g)) {
      const nome = m[1];
      if (vistos.has(nome)) continue;
      vistos.add(nome);
      // Placeholder de template não é nome de arquivo (mesmo mecanismo do
      // `dead-theme-classes`: o `<` ou `{` logo antes/depois é o sinal).
      if (nome.includes("{") || nome.includes("<")) continue;
      if (ilustrativos.has(`${arquivo}::${nome}`)) continue;
      if (nomesNoDisco.has(nome)) continue;
      const linha = texto.slice(0, m.index).split("\n").length;
      out.push(
        achado(
          `${arquivo}:${linha}`,
          `nomeia o arquivo "${nome}", que não existe em lugar nenhum do repo`,
          "corrija o nome ou remova a menção — arquivo inexistente na doc manda o leitor procurar o que não tem",
        ),
      );
    }
  }
  return out;
}

/**
 * Nomes de arquivo que a doc cita como EXEMPLO de algo que não mora no repo.
 *
 * Escopo por PAR `"<arquivo da doc>::<nome.md>"` + motivo obrigatório, igual ao `CITACOES`
 * do `dead-theme-classes` e às duas listas de exceção do registry/barrel. Motivo de ser
 * uma declaração humana e não um regex: "este nome é ilustrativo" é julgamento de
 * intenção, e regex pra isso é o que a L-059 proíbe. Um humano declara uma vez; no gate
 * volta a ser mecânico — e o teste reprova exceção MORTA (par que a doc não cita mais,
 * ou cujo arquivo passou a existir), senão a lista viraria despejo.
 */
export const ARQUIVOS_ILUSTRATIVOS = new Map([
  [
    "src/preview/pages/PipelineMemoryDoc.tsx::user_role.md",
    "camada 1 (User Memory) vive em ~/.claude/projects/<hash>/memory/, FORA do repo — por definição não está aqui",
  ],
  [
    "src/preview/pages/PipelineMemoryDoc.tsx::feedback_genuine_evaluation.md",
    "idem — exemplo de memória de usuário, fora do repo",
  ],
  [
    "src/preview/pages/PipelineMemoryDoc.tsx::project_kanban_v1.md",
    "idem — exemplo de memória de usuário, fora do repo",
  ],
]);

/**
 * Cobertura de commands: as DUAS direções.
 *
 * Aqui o inverso vale, ao contrário das skills: o catálogo da página se propõe a ser o
 * catálogo, e um command ausente é literalmente indescobrível por ele — foi o defeito
 * medido (8 de 15). São 15 arquivos com nome único, então listar todos é barato.
 */
export function checarCoberturaCommands(textoCommandsDoc, nomesNoDisco) {
  const out = [];
  const naDoc = new Set(
    [...textoCommandsDoc.matchAll(/\b(ds-[a-z0-9-]+)\.md\b/g)].map((m) => m[1]),
  );
  for (const nome of nomesNoDisco) {
    if (!naDoc.has(nome)) {
      out.push(
        achado(
          "src/preview/pages/PipelineCommandsDoc.tsx",
          `/${nome} existe em .claude/commands/ e não aparece na página`,
          `adicione ${nome}.md na árvore + um <CmdCard> no catálogo`,
        ),
      );
    }
  }
  for (const nome of naDoc) {
    if (!nomesNoDisco.has(nome)) {
      out.push(
        achado(
          "src/preview/pages/PipelineCommandsDoc.tsx",
          `documenta /${nome}, que não existe em .claude/commands/`,
          "remova a entrada, ou crie o command",
        ),
      );
    }
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. Frase que descreve mecanismo inexistente
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Frases banidas: descrevem mecanismo que este repo NÃO tem.
 *
 * `motivo` é obrigatório — a mensagem de erro precisa dizer por que a frase está errada,
 * senão o leitor a reescreve com outras palavras e o gate volta a passar.
 */
export const FRASES_BANIDAS = [
  {
    padrao: /auto-?loaded by glob/i,
    motivo:
      "o campo `globs:` do frontmatter de .claude/rules/ é sintaxe do Cursor e é INERTE aqui — todo .md de rules/ entra como project instruction em TODA sessão, sem escopo por pasta",
    troque: 'diga "loaded on every session" (ou "auto-loaded em toda sessão")',
  },
  {
    padrao: /carregad[ao] por glob/i,
    motivo: "idem — não há escopo por glob neste harness",
    troque: 'diga "carregado em toda sessão"',
  },
  {
    padrao: /o hook formata/i,
    motivo:
      "não existe formatador automático (decisão de 2026-07-29). O format-on-save.sh chamava `npx --no-install prettier` num projeto sem prettier: no-op mudo, e ARMADO — ligou sozinho quando o cache do npx foi populado (L-061). Hook e script removidos; formatação é na mão",
    troque: "diga que a formatação é manual, espelhando o código vizinho",
  },
];

/**
 * `docs` = [{ arquivo, texto }]. `citacoes` = Set de `"<arquivo>::<índice da frase>"`,
 * pra a página que EXPLICA que a frase está errada não ser reprovada por citá-la.
 *
 * Escopo por PAR (arquivo, frase), não global: separar citação de prescrição por regex
 * seria julgamento de intenção (L-059) — um humano declara, e no gate volta a ser
 * mecânico.
 */
export function checarFrasesBanidas(docs, citacoes = new Set()) {
  const out = [];
  for (const { arquivo, texto } of docs) {
    FRASES_BANIDAS.forEach((frase, i) => {
      if (citacoes.has(`${arquivo}::${i}`)) return;
      const m = texto.match(frase.padrao);
      if (!m) return;
      const linha = texto.slice(0, m.index).split("\n").length;
      out.push(
        achado(
          `${arquivo}:${linha}`,
          `"${m[0]}" descreve um mecanismo que não existe — ${frase.motivo}`,
          `${frase.troque}. Se a frase é uma CITAÇÃO (a página explica que está errada), declare o par em CITACOES_FRASE`,
        ),
      );
    });
  }
  return out;
}

/**
 * Citações declaradas — (arquivo, índice em FRASES_BANIDAS) + motivo.
 *
 * Vazio hoje: nenhuma página do showcase cita as frases pra corrigi-las. Existe porque
 * a alternativa (regex tentando distinguir citação de prescrição) é justamente o que a
 * L-059 proíbe.
 */
export const CITACOES_FRASE = new Map();

/* ═══════════════════════════════════════════════════════════════════════════
   Fachada
   ═══════════════════════════════════════════════════════════════════════════ */

export function auditarFatosDaDoc({
  distributionDoc,
  totalItensRegistry,
  docsComLicoes,
  ultimaLicao,
  licoesAtivas,
  licoesArquivadas,
  arquivosMdNoRepo,
  commandsDoc,
  commandsNoDisco,
  todasAsDocs,
}) {
  return [
    ...checarContagemRegistry(distributionDoc, totalItensRegistry),
    ...checarContagemLicoes(docsComLicoes, ultimaLicao, licoesAtivas, licoesArquivadas),
    ...checarArquivosNomeados(
      todasAsDocs,
      arquivosMdNoRepo,
      new Set(ARQUIVOS_ILUSTRATIVOS.keys()),
    ),
    ...checarCoberturaCommands(commandsDoc, commandsNoDisco),
    ...checarFrasesBanidas(todasAsDocs, new Set(CITACOES_FRASE.keys())),
  ];
}
