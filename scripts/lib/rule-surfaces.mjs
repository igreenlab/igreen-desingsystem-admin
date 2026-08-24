/**
 * rule-surfaces — regra de comportamento declarada no `USAGE.md` tem que CHEGAR no
 * consumidor. Puro, zero I/O (o scan do repo vive no teste).
 *
 * ## O defeito que originou isto
 *
 * Em 2026-08-24 o mantenedor pediu, explicitamente, regras de default para o `ScreenLoader`
 * ("`md` é o padrão", "skeleton `page` é o padrão"). O agente escreveu as regras — em prosa
 * nos Gotchas e na linha do vocabulário do consumidor — e **nenhum sinal** disse que o
 * terceiro canal, o bloco `ds:regras`, tinha ficado de fora.
 *
 * Investigando, o buraco era maior que o componente: o mecanismo de injeção existia no
 * código, no hook do consumidor e em 24 testes, e **não era mencionado em nenhuma skill,
 * regra ou command**. Nenhum agente tinha como saber que aquela superfície existia. Não foi
 * checklist ignorado — era checklist ausente. Mesmo modo de falha das L-042 e L-047.
 *
 * ## O que este gate checa, e por que só isto
 *
 * **Componente com bloco `ds:regras` → tem linha no vocabulário do consumidor?**
 *
 * Uma direção só, e mecânica: os dois lados são grepáveis, nenhum exige julgamento sobre se
 * a regra "deveria" existir. Bloco sem linha no vocabulário = a regra está escrita e não sai
 * daqui: só alcança a IA que ABRIR o arquivo, e medido num consumidor real ela abre 6 de 14.
 *
 * ⚠️ **A direção inversa NÃO é gate, de propósito.** Linha no vocabulário sem bloco é o
 * estado normal — hoje são 43 componentes com linha e 6 com bloco. Cobrar o bloco de todos
 * inundaria (L-059: aviso que aparece sempre é aviso desligado), e há componente que
 * legitimamente não tem regra de default nenhuma.
 *
 * ⚠️ **Componente fora do registry é pulado, não reprovado.** O vocabulário existe para a IA
 * do consumidor saber o que existe; componente que não é distribuído não tem o que constar
 * lá. Reprovar seria cobrar superfície inaplicável.
 */

import { nomesDeBlocos } from "./component-rules.mjs";

/**
 * O id de registry de um `USAGE.md` de composto.
 *
 * Derivado do **registry**, não do nome da pasta, de propósito: `AvatarIg` mora em
 * `ui/avatar-ig/` e a derivação PascalCase→kebab já reprovou caso correto antes (L-063).
 * O registry é a fonte que decide o nome pelo qual o consumidor pede o componente.
 *
 * @param {string} caminhoUsage  ex.: "src/components/ui/Panel/USAGE.md"
 * @param {Array<{name: string, files?: Array<{path: string}>}>} itens
 * @returns {string|null} o id, ou `null` se o USAGE não viaja em item nenhum
 */
export function idDoItem(caminhoUsage, itens) {
  for (const it of itens ?? []) {
    for (const f of it.files ?? []) {
      if (f?.path === caminhoUsage) return it.name;
    }
  }
  return null;
}

/**
 * O vocabulário cita o id?
 *
 * Casa o id **entre crases** — é como o arquivo nomeia todos eles (`screen-loader`). Sem a
 * crase, `alert` casaria dentro de `alert-dialog` e o gate aprovaria por prefixo.
 */
export function citadoNoVocabulario(vocabulario, id) {
  if (!id) return false;
  return String(vocabulario ?? "").includes("`" + id + "`");
}

/**
 * @param {object} entrada
 * @param {Array<{caminho: string, texto: string}>} entrada.usages  USAGE.md de compostos
 * @param {string|null} entrada.tabelaGlobal  texto do `shadcn/USAGE.md` (blocos nomeados)
 * @param {Array} entrada.itens  `registry.json` → items
 * @param {string} entrada.vocabulario  texto do `_claude/rules/ds-components.md`
 * @returns {{faltando: Array<{id: string, onde: string}>, ok: string[], pulados: Array<{onde: string, motivo: string}>}}
 */
export function auditar({ usages = [], tabelaGlobal = null, itens = [], vocabulario = "" }) {
  const faltando = [];
  const ok = [];
  const pulados = [];

  const registrar = (id, onde) => {
    if (citadoNoVocabulario(vocabulario, id)) ok.push(id);
    else faltando.push({ id, onde });
  };

  // 1) compostos: bloco anônimo no USAGE do próprio componente
  for (const { caminho, texto } of usages) {
    if (!nomesDeBlocos(texto).includes("")) continue; // sem bloco anônimo → nada a cobrar
    const id = idDoItem(caminho, itens);
    if (!id) {
      pulados.push({ onde: caminho, motivo: "USAGE não viaja em nenhum item do registry" });
      continue;
    }
    registrar(id, caminho);
  }

  // 2) primitivos: blocos NOMEADOS na tabela global — o rótulo já é o id do registry
  for (const nome of nomesDeBlocos(tabelaGlobal).filter(Boolean)) {
    registrar(nome, "src/components/shadcn/USAGE.md");
  }

  return { faltando, ok, pulados };
}

/**
 * Componente **novo** cujo `USAGE.md` não declara bloco `ds:regras`.
 *
 * É o outro lado, e é o que o `auditar` acima NÃO alcança: ele cobra que um bloco existente
 * chegue no consumidor, mas não tem como saber que um bloco *deveria* existir. Foi exatamente
 * esse o caso do `ScreenLoader` (2026-08-24): o mantenedor pediu regras de default, elas foram
 * escritas em prosa, e o bloco ficou de fora sem nenhum sinal.
 *
 * **AVISO, nunca reprovação** — e por dois motivos independentes:
 *   1. componente pode legitimamente não ter regra de default (`Separator`, `AspectRatio`);
 *   2. julgar "esta prosa deveria ser bloco" exige contexto, e gate assim vira ruído (L-059).
 *
 * **Só em componente NOVO, nunca em varredura.** Medido em 2026-08: 34 dos 43 USAGE têm
 * seção de gotcha, então uma varredura retroativa acusaria quase todos. E o ritmo de
 * componente novo caiu — 17 em maio, 22 em junho, 3 em julho, 1 em agosto: o aviso dispara
 * 1 a 3 vezes por mês, no momento em que o autor está presente pra responder.
 *
 * @param {string[]} pastasNovas  ex.: ["src/components/ui/ScreenLoader"]
 * @param {(caminho: string) => string|null} lerUsage  devolve o texto ou `null`
 */
export function novosSemBloco(pastasNovas, lerUsage) {
  const out = [];
  for (const pasta of pastasNovas ?? []) {
    const caminho = `${pasta}/USAGE.md`;
    let texto = null;
    try {
      texto = lerUsage(caminho);
    } catch {
      texto = null;
    }
    if (texto == null) continue; // USAGE ausente já é cobrado pelo showcase-check
    if (nomesDeBlocos(texto).includes("")) continue;
    out.push({ componente: pasta.split("/").pop(), caminho });
  }
  return out;
}

/** A mensagem de reprovação. Vazia quando não há nada a dizer. */
export function formatar({ faltando }) {
  if (!faltando.length) return "";
  return (
    `Regra declarada que NÃO chega no consumidor (${faltando.length}):\n` +
    faltando.map((f) => `  • \`${f.id}\` — bloco ds:regras em ${f.onde}`).join("\n") +
    "\n\n" +
    "O bloco só alcança quem ABRE o arquivo. Pra alcançar toda sessão, o componente precisa\n" +
    "de linha em cli/templates/default/_claude/rules/ds-components.md (grupo de tarefa +\n" +
    "critério de escolha) — e isso muda cli/templates/**, logo pede bump do CLI.\n" +
    "Receita: .claude/skills/ds-dev/handoff-pr.md §Regra de comportamento.\n"
  );
}
