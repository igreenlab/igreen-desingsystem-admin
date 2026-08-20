/**
 * blocks-index — a lista de blocos, GERADA a partir dos próprios arquivos.
 *
 * ## Por que gerada, e não escrita à mão
 *
 * O bloco declara a própria identidade no arquivo dele (`export const BLOCK = {...}`), e tudo o
 * mais — índice pro consumidor, item de registry, entrada da galeria — sai daí. Lista paralela
 * escrita à mão divergiria: foi o que aconteceu com 3 itens de backlog, com o plano dos Blocos
 * que evaporou e com duas versões inventadas na doc, tudo em 2026-08-19/20.
 *
 * ## Onde o índice mora, e por que NÃO em `rules/`
 *
 * O destino é `cli/templates/default/_claude/skills/ds-kit/blocks-index.md`.
 *
 * As 4 `rules/` do payload são `alwaysApply: true` — carregam em **100% das sessões do
 * consumidor**. Índice de bloco lá faria o custo de contexto crescer a cada bloco novo, que é
 * exatamente o que este desenho evita. Dentro de `skills/ds-kit/` ele carrega **sob demanda**,
 * quando o Passo 0 dispara — e bloco só é usado quando o humano cita um ID, então não há caso em
 * que a IA precise "descobrir" blocos sem ter sido provocada.
 *
 * O payload é copiado pro consumidor pelos dois caminhos (CLI npm e `ds:link` no submódulo), então
 * um arquivo só serve os dois canais.
 *
 * Módulo PURO: recebe `[{arquivo, fonte}]` e devolve blocos/achados. Quem lê disco e escreve é o
 * `scripts/blocks-build.mjs`.
 */

/** Formato do ID: `dsgreen-<categoria>[-<qualificador>]-<n>`. Ver spec §9. */
export const ID_RE = /^dsgreen-[a-z0-9]+(?:-[a-z0-9]+)*-\d+$/;

/** Extrai o literal do `export const BLOCK = {...} as const` de um arquivo de bloco. */
function extrairBloco(fonte) {
  const i = fonte.indexOf("export const BLOCK");
  if (i < 0) return null;
  const abre = fonte.indexOf("{", i);
  if (abre < 0) return null;

  // Balanceamento de chaves em vez de janela fixa: a janela de N caracteres já leu de
  // menos e de mais em outro gate deste repo (o actions-column-canon).
  //
  // ⚠️ E o balanceamento tem de IGNORAR chave dentro de string: a descrição de um bloco
  // pode conter código (`"passe { total } no config"`), e contar aquelas chaves fecha o
  // literal cedo. Achado pelo próprio teste deste módulo — a primeira versão contava tudo.
  let nivel = 0;
  let fim = -1;
  let aspa = null; // " ' ou ` quando dentro de string
  for (let k = abre; k < fonte.length; k++) {
    const c = fonte[k];

    if (aspa) {
      if (c === "\\") k++; // escape: pula o próximo
      else if (c === aspa) aspa = null;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      aspa = c;
      continue;
    }

    if (c === "{") nivel++;
    else if (c === "}") {
      nivel--;
      if (nivel === 0) {
        fim = k;
        break;
      }
    }
  }
  if (fim < 0) return null;

  const corpo = fonte.slice(abre + 1, fim);
  const campo = (nome) => {
    const m = corpo.match(new RegExp(`${nome}\\s*:\\s*(?:"((?:[^"\\\\]|\\\\.)*)"|'((?:[^'\\\\]|\\\\.)*)')`, "s"));
    return m ? (m[1] ?? m[2]).replace(/\\"/g, '"').replace(/\s+/g, " ").trim() : null;
  };
  const lista = (nome) => {
    const m = corpo.match(new RegExp(`${nome}\\s*:\\s*\\[([^\\]]*)\\]`, "s"));
    if (!m) return [];
    return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
  };

  return {
    id: campo("id"),
    nome: campo("nome"),
    descricao: campo("descricao"),
    usa: lista("usa"),
  };
}

/** Categoria = a pasta sob `src/blocks/`. */
function categoriaDe(arquivo) {
  const m = String(arquivo).replace(/\\/g, "/").match(/src\/blocks\/([^/]+)\//);
  return m ? m[1] : null;
}

/**
 * @param {Array<{arquivo: string, fonte: string}>} arquivos — os `.tsx` de `src/blocks/**`
 * @returns {{blocos: Array<object>, achados: Array<object>}}
 */
export function coletarBlocos(arquivos) {
  const blocos = [];
  const achados = [];
  const vistos = new Map();

  for (const { arquivo, fonte } of arquivos ?? []) {
    const b = extrairBloco(String(fonte));

    if (!b) {
      achados.push({
        arquivo,
        problema: "não exporta `BLOCK`",
        conserto:
          "todo arquivo em `src/blocks/**` precisa de `export const BLOCK = { id, nome, descricao, usa } as const` — " +
          "é dele que saem o índice, o item de registry e a entrada da galeria. Helper compartilhado vai em `src/blocks/_shared/`, que é ignorado.",
      });
      continue;
    }

    for (const campo of ["id", "nome", "descricao"]) {
      if (!b[campo]) {
        achados.push({
          arquivo,
          problema: `\`BLOCK.${campo}\` ausente ou vazio`,
          conserto: `preencha \`${campo}\` — a descrição é o que faz a IA entender o arranjo antes de abrir o arquivo (spec §9.1 regra 3)`,
        });
      }
    }

    if (b.id && !ID_RE.test(b.id)) {
      achados.push({
        arquivo,
        problema: `id \`${b.id}\` fora do formato`,
        conserto:
          "use `dsgreen-<categoria>[-<qualificador>]-<n>`, tudo minúsculo (ex.: `dsgreen-chart-1`, " +
          "`dsgreen-chart-lines-2`). Caixa diferente citada como se fosse a mesma é falha silenciosa de resolução.",
      });
    }

    if (b.id && vistos.has(b.id)) {
      achados.push({
        arquivo,
        problema: `id \`${b.id}\` duplicado`,
        conserto: `já usado em ${vistos.get(b.id)}. ID é endereço: dois blocos com o mesmo tornam a citação ambígua, que é o oposto do motivo de existir.`,
      });
    } else if (b.id) {
      vistos.set(b.id, arquivo);
    }

    const categoria = categoriaDe(arquivo);
    if (b.id && categoria && !b.id.startsWith(`dsgreen-${categoria}-`)) {
      achados.push({
        arquivo,
        problema: `id \`${b.id}\` não bate com a pasta \`${categoria}\``,
        conserto:
          `o segmento depois de \`dsgreen-\` nomeia a CATEGORIA DA GALERIA, que é a pasta (spec §9.1 regra 1). ` +
          `Renomeie pra \`dsgreen-${categoria}-<n>\` ou mova o arquivo.`,
      });
    }

    blocos.push({ ...b, categoria, arquivo: String(arquivo).replace(/\\/g, "/") });
  }

  blocos.sort((a, b) => String(a.id).localeCompare(String(b.id), "en"));
  return { blocos, achados };
}

/** O markdown do índice — é ELE que o Passo 0 do `ds-kit` lê. */
export function renderIndice(blocos) {
  const porCategoria = new Map();
  for (const b of blocos) {
    if (!porCategoria.has(b.categoria)) porCategoria.set(b.categoria, []);
    porCategoria.get(b.categoria).push(b);
  }

  const linhas = [
    "<!-- GERADO por `npm run blocks:build` a partir dos `export const BLOCK` em src/blocks/**.",
    "     NÃO editar à mão: a próxima geração sobrescreve, e o gate `blocks-index` reprova divergência. -->",
    "",
    "# Índice de blocos",
    "",
    "**Bloco não é componente.** É uma composição de referência — feita só com componentes que você",
    "já tem — que existe porque a IA sabe as peças e os tokens mas não sabe o **arranjo** que um",
    "designer escolheu. Não tem props nem versão própria: você lê a estrutura e reconstrói com os",
    "dados do usuário.",
    "",
    "Este índice é lido pelo **Passo 0** da skill `ds-kit`, quando o usuário cita um código.",
    "",
  ];

  if (blocos.length === 0) {
    linhas.push("_Nenhum bloco no catálogo ainda._", "");
  }

  for (const [categoria, lista] of [...porCategoria].sort()) {
    linhas.push(`## ${categoria}`, "");
    // A coluna Arquivo não é decoração: é o que torna o caminho resolvível em modo
    // submódulo (`<dsPath>/<arquivo>`). Sem ela a instrução de leitura fica sem alvo.
    linhas.push("| Código | Composição | Quando serve | Usa | Arquivo |");
    linhas.push("|---|---|---|---|---|");
    for (const b of lista) {
      linhas.push(
        `| \`${b.id}\` | ${b.nome} | ${b.descricao} | ${b.usa.join(" · ")} | \`${b.arquivo}\` |`,
      );
    }
    linhas.push("");
  }

  linhas.push(
    "## Como pegar o código do bloco",
    "",
    "| modo de consumo | onde o arquivo está |",
    "|---|---|",
    '| **submódulo** (`.claude/ds-config.json` com `"mode": "submodule"`) | já no disco: `<dsPath>/<arquivo>` da tabela acima. Leia direto |',
    "| **copy-in / scaffold** | não vem instalado: `npm run igreen:add -- <código>` traz o arquivo |",
    "",
    "Leia o arquivo **inteiro**, incluindo o JSDoc do topo — ele carrega as regras que a composição",
    "embute (qual token de cor, por que `tabular-nums`, o que NÃO copiar) e uma seção **Cuidado ao",
    "adaptar** que diz o que ligar a estado e o que remover. Medido num consumidor real em",
    "2026-08-20: foi esse JSDoc que produziu o resultado bom, não só a resolução do ID.",
    "",
    "Adapte dados e rótulos **preservando estrutura e espaçamento**. Não \"melhore\" o arranjo — ele é",
    "o motivo pelo qual o código foi citado.",
    "",
    "Se o código citado não estiver na tabela, **diga isso** em vez de montar algo parecido: o valor",
    "do código é ser determinístico, e um palpite silencioso destrói exatamente isso.",
    "",
  );

  return linhas.join("\n");
}

/**
 * Os itens `registry:block` — gerados, pra o `igreen:add <id>` funcionar no copy-in.
 *
 * As `registryDependencies` saem dos **imports reais** do arquivo, não de lista escrita à mão: o
 * `usa` do `BLOCK` é prosa pra humano (e pra IA entender o arranjo), e prosa desatualiza. Quem
 * resolve import → item dono é o `donoDoArquivo`, passado pelo CLI — a MESMA resolução que o gate
 * `registry-imports` usa, senão o gerador e o gate discordariam sobre o que está declarado.
 *
 * `dependencies` (npm) vêm dos imports que não são do projeto — hoje só `recharts` aparece em
 * bloco de chart, mas derivar evita esquecer no próximo.
 *
 * @param {Array<object>} blocos
 * @param {(arquivoBase: string, spec: string) => string|null} donoDoArquivo
 *        dado um import do bloco, devolve o nome do item de registry que o distribui (ou null)
 * @param {(fonte: string) => string[]} especificadoresDe extrator de imports (o do registry-imports)
 * @param {Map<string,string>} fontes arquivo → conteúdo
 * @param {Map<string,object>} metaPorId `meta` existente por id, a PRESERVAR
 *
 * ⚠️ `metaPorId` não é detalhe: o `registry:stamp` grava um `meta.stamp` em cada item
 * (`igreen-ds · <id> · <versão> · <hash> · <data>`), e um gerador que não o preserve **apaga o
 * carimbo a cada geração** — deixando o `--check` reprovando pra sempre num loop em que gerar
 * conserta e o stamp seguinte quebra de novo. Achado ao ligar o gate no `release:check`, que roda
 * o stamp antes.
 */
export function itensDeRegistry(blocos, donoDoArquivo, especificadoresDe, fontes, metaPorId) {
  const BASE = ["@igreen/tv", "@igreen/utils"];

  return blocos.map((b) => {
    const fonte = fontes.get(b.arquivo) ?? "";
    const specs = especificadoresDe(fonte);

    const doRegistry = new Set(BASE);
    const doNpm = new Set();

    for (const spec of specs) {
      if (spec.startsWith("@/") || spec.startsWith(".")) {
        const dono = donoDoArquivo(b.arquivo, spec);
        if (dono) doRegistry.add(`@igreen/${dono}`);
        continue;
      }
      // pacote npm — react/jsx-runtime são peer do consumidor, não dependência do bloco
      if (spec === "react" || spec.startsWith("react/") || spec === "react-dom") continue;
      doNpm.add(spec.split("/")[0].replace(/^(@[^/]+)$/, "$1"));
    }

    const meta = metaPorId?.get(b.id);

    return {
      name: b.id,
      type: "registry:block",
      title: `Bloco ${b.id} — ${b.nome}`,
      description: b.descricao,
      registryDependencies: [...doRegistry].sort(),
      dependencies: [...doNpm].sort(),
      files: [
        {
          path: b.arquivo,
          type: "registry:block",
          target: b.arquivo.replace(/^src\//, ""),
        },
      ],
      ...(meta ? { meta } : {}),
    };
  });
}

/** Mensagens prontas pra reprovar. */
export function formatar(achados) {
  return achados.map((a) => `${a.arquivo}\n     ${a.problema}\n     → ${a.conserto}`);
}
