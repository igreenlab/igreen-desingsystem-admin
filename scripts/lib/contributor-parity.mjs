/**
 * contributor-parity.mjs — os documentos que instruem o CONTRIBUIDOR dizem a mesma
 * coisa? Puro, zero I/O (ler arquivo é do teste).
 *
 * ## O furo que isto fecha
 *
 * Medido em 2026-08-15: `CONTRIBUTING.md` e `.github/pull_request_template.md`
 * ensinavam contagens **diferentes** para a mesma tarefa.
 *
 *   CONTRIBUTING.md              "toca 7 lugares"  ·  barrel AUSENTE
 *   pull_request_template.md     "toca 8 superfícies (L-042)"  ·  barrel com gate citado
 *
 * O template estava certo; o `CONTRIBUTING` ficou uma revisão atrás — é anterior ao dia
 * em que a L-042 passou de 7 pra 8. **Consequência:** quem seguisse o arquivo que o
 * próprio texto manda ler *"até o fim antes da primeira PR"* entregava o componente sem
 * o export no barrel. O gate `barrel-completeness` pega, então nada quebrado chega na
 * `main` — mas a pessoa faz **duas viagens**, exatamente o que a primeira frase daquele
 * documento promete evitar.
 *
 * É o mesmo defeito que o `rules-parity` fecha para as 8 regras de comportamento, numa
 * superfície que ele não cobre — e numa que importa MAIS pro objetivo declarado do
 * projeto ("outras pessoas constroem componentes sem quebrar nada"), porque estes dois
 * arquivos são os únicos que alcançam quem **não** usa Claude Code.
 *
 * ## Escopo deliberado: a contagem e os identificadores, não a prosa
 *
 * Comparar o TEXTO seria julgamento de intenção (L-059): o `CONTRIBUTING` é didático e
 * o template é checklist, com formatos diferentes de propósito. O que se afirma
 * mecanicamente é: **mesma contagem declarada** e **presença dos identificadores** das
 * superfícies que já foram esquecidas. Contradição de redação continua sendo do revisor.
 *
 * ## ⚠️ Existem TRÊS contagens de "superfícies" no repo — não as confunda
 *
 * Medido: `4 superfícies de roteamento` (L-047, skill builder nova) · `8 superfícies`
 * (L-042, componente novo) · `10 superfícies` (marca nova). Um gate que somasse as três
 * seria pior que gate nenhum, porque reprovaria texto correto.
 *
 * O que separa é o fraseado: a contagem de COMPONENTE aparece como `toca **N
 * superfícies**` **sem** qualificador; a de roteamento sempre traz `de roteamento`. O
 * `PADRAO` abaixo depende disso — se alguém reescrever a frase da L-047 sem o
 * qualificador, este gate passa a conflitar, e o teste de fraseado acusa.
 */

/** Arquivos que declaram a contagem de superfícies de um COMPONENTE novo. */
export const DECLARANTES = [
  { arquivo: "CONTRIBUTING.md", papel: "porta do contribuidor humano — o doc que ele lê antes da 1ª PR" },
  { arquivo: ".github/pull_request_template.md", papel: "checklist que aparece preenchido ao abrir a PR" },
  { arquivo: ".claude/rules/ds-standards.md", papel: "resumo da L-042, auto-carregado" },
  { arquivo: ".claude/skills/ds-dev/handoff-pr.md", papel: "skill que fecha o trabalho por PR (Regra 8)" },
];

/**
 * Identificadores que os DOIS docs do contribuidor têm que mencionar — cada um é uma
 * superfície que já foi esquecida de verdade, e são strings estáveis (path e prefixo de
 * pacote), não prosa.
 */
export const IDENTIFICADORES = [
  { chave: "src/components/index.ts", oque: "o barrel — 8ª superfície; sem ele o import estoura no consumidor npm" },
  { chave: "@types/", oque: "dep de TIPO em dependencies — L-058; em devDeps o tsc do consumidor quebra" },
];

/** Só os dois que alcançam quem não usa Claude Code. */
export const DOCS_DO_CONTRIBUIDOR = ["CONTRIBUTING.md", ".github/pull_request_template.md"];

/**
 * Contagem declarada como `toca **N superfícies**`, ignorando a variante de roteamento
 * (`toca **4 superfícies de roteamento**`, que é outra coisa — L-047).
 * @returns {number[]} todas as contagens encontradas, na ordem do texto
 */
export function contagensDeclaradas(texto) {
  const out = [];
  const re = /toca\s+\*\*(\d+)\s+superfícies\*\*(\s+de\s+roteamento)?/g;
  for (const m of String(texto ?? "").matchAll(re)) {
    if (m[2]) continue; // "de roteamento" → L-047, escopo diferente
    out.push(Number(m[1]));
  }
  return out;
}

/**
 * @param {{docs: Record<string,string>}} entrada  conteúdo por caminho de arquivo
 * @returns {{
 *   semDeclaracao: string[], contagens: Record<string,number[]>,
 *   divergentes: Array<{arquivo:string, declarou:number}>, consenso: number|null,
 *   faltandoIdentificador: Array<{arquivo:string, chave:string, oque:string}>,
 * }}
 *   `semDeclaracao`  arquivo que devia declarar a contagem e não declara — sem isso o
 *                    gate silenciosamente pararia de comparar aquele arquivo.
 *   `divergentes`    declarou contagem diferente do consenso (a maioria).
 *   `faltandoIdentificador`  doc do contribuidor sem mencionar uma superfície já esquecida.
 */
export function checkContributorParity({ docs }) {
  const contagens = {};
  const semDeclaracao = [];

  for (const { arquivo } of DECLARANTES) {
    const ns = contagensDeclaradas(docs[arquivo] ?? "");
    contagens[arquivo] = ns;
    if (!ns.length) semDeclaracao.push(arquivo);
  }

  // Consenso = valor mais frequente. Sem fonte privilegiada, igual ao rules-parity:
  // o invariante é ACORDO entre os arquivos, não obediência a um deles.
  const todas = Object.values(contagens).flat();
  const freq = new Map();
  for (const n of todas) freq.set(n, (freq.get(n) ?? 0) + 1);
  let consenso = null;
  let melhor = 0;
  for (const [n, q] of freq) if (q > melhor) { melhor = q; consenso = n; }

  const divergentes = [];
  for (const [arquivo, ns] of Object.entries(contagens)) {
    for (const n of ns) if (consenso !== null && n !== consenso) divergentes.push({ arquivo, declarou: n });
  }

  const faltandoIdentificador = [];
  for (const arquivo of DOCS_DO_CONTRIBUIDOR) {
    const txt = docs[arquivo] ?? "";
    for (const { chave, oque } of IDENTIFICADORES) {
      if (!txt.includes(chave)) faltandoIdentificador.push({ arquivo, chave, oque });
    }
  }

  return { semDeclaracao, contagens, divergentes, consenso, faltandoIdentificador };
}
