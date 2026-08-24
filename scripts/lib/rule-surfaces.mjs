/**
 * rule-surfaces — as superfícies de uma REGRA de comportamento de componente. Puro, zero I/O
 * (o scan do repo vive no teste e no CLI).
 *
 * ## O defeito que originou isto
 *
 * Em 2026-08-24 o mantenedor pediu, explicitamente, regras de default para o `ScreenLoader`
 * ("`md` é o padrão", "skeleton `page` é o padrão"). O agente escreveu as regras em prosa nos
 * Gotchas **e** na linha do vocabulário do consumidor — 2 dos 3 canais, incluindo o mais forte
 * — e **nenhum sinal** disse que o terceiro, o bloco `ds:regras`, tinha ficado de fora.
 *
 * Investigando, o buraco era maior que o componente: `ds:regras` tinha **0 menções** em
 * `.claude/skills/`, `.claude/rules/` e `.claude/commands/`. O mecanismo existia no código, no
 * hook do consumidor e em 24 testes — e nenhum agente tinha como saber que a superfície
 * existia. Não foi checklist ignorado: era checklist **ausente**. Mesmo modo de falha das
 * L-042 e L-047.
 *
 * ## Dois checks, e o escopo de cada um foi MEDIDO
 *
 * A primeira versão deste módulo cobrava a linha do vocabulário para **todo** componente com
 * bloco. Testando contra o `distribution-debt` no mesmo cenário (linha removida à mão), ele
 * **já reprovava** — `exit 1`, com a mensagem certa. Ou seja: metade deste gate era cópia de
 * uma regra que já tinha dono, e duas cópias divergem no primeiro ajuste.
 *
 * O mesmo teste mostrou o que ele **não** cobre: o `distribution-debt` varre só
 * `src/components/ui/`. Removendo `tabs` do vocabulário, ele saiu **0** e não viu nada — os
 * primitivos shadcn ficam fora da varredura dele. É essa a fatia que sobrou aqui:
 *
 *   `auditar`        → bloco NOMEADO em `shadcn/USAGE.md` sem linha no vocabulário. REPROVA.
 *                      (a família `ui/` é do `distribution-debt`, que já faz isto)
 *   `novosSemBloco`  → componente NOVO cujo USAGE não declara bloco. AVISA, não reprova.
 *
 * ⚠️ **A direção inversa NÃO é gate, de propósito.** Linha no vocabulário sem bloco é o estado
 * normal — hoje 43 componentes têm linha e 6 têm bloco. Cobrar bloco de todos inundaria
 * (L-059: aviso que aparece sempre é aviso desligado), e há componente que legitimamente não
 * tem regra de default nenhuma.
 */

import { nomesDeBlocos } from "./component-rules.mjs";

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
 * Blocos nomeados na tabela global dos primitivos que não chegam no vocabulário.
 *
 * O rótulo do bloco **já é** o id do registry (`<!-- ds:regras tabs`), então não há derivação
 * de nome aqui — e é de propósito: derivar pasta→id já reprovou caso correto antes (L-063).
 *
 * @param {string|null} tabelaGlobal  texto do `src/components/shadcn/USAGE.md`
 * @param {string} vocabulario  texto do `_claude/rules/ds-components.md`
 * @returns {{faltando: Array<{id: string, onde: string}>, ok: string[]}}
 */
export function auditar({ tabelaGlobal = null, vocabulario = "" }) {
  const faltando = [];
  const ok = [];
  for (const nome of nomesDeBlocos(tabelaGlobal).filter(Boolean)) {
    if (citadoNoVocabulario(vocabulario, nome)) ok.push(nome);
    else faltando.push({ id: nome, onde: "src/components/shadcn/USAGE.md" });
  }
  return { faltando, ok };
}

/**
 * Componente **novo** cujo `USAGE.md` não declara bloco `ds:regras`.
 *
 * É o check que pega o caso do `ScreenLoader`: o `auditar` acima cobra que um bloco existente
 * chegue no consumidor, mas não tem como saber que um bloco *deveria* existir.
 *
 * **AVISO, nunca reprovação** — por dois motivos independentes:
 *   1. componente pode legitimamente não ter regra de default (`Separator`, `AspectRatio`);
 *   2. julgar "esta prosa deveria ser bloco" exige contexto, e gate assim vira ruído (L-059).
 *
 * **Só em componente NOVO, nunca em varredura.** Medido em 2026-08: 34 dos 43 USAGE têm seção
 * de gotcha, então varredura retroativa acusaria quase todos. E o ritmo de componente novo
 * caiu — 17 em maio, 22 em junho, 3 em julho, 1 em agosto: o aviso dispara 1 a 3 vezes por
 * mês, no momento em que o autor está presente pra responder.
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

/** A mensagem de reprovação do `auditar`. Vazia quando não há nada a dizer. */
export function formatar({ faltando }) {
  if (!faltando.length) return "";
  return (
    `Primitivo com bloco ds:regras que NÃO chega no consumidor (${faltando.length}):\n` +
    faltando.map((f) => `  • \`${f.id}\` — declarado em ${f.onde}`).join("\n") +
    "\n\n" +
    "O bloco só alcança quem ABRE o arquivo. Pra alcançar toda sessão, o primitivo precisa de\n" +
    "linha em cli/templates/default/_claude/rules/ds-components.md (grupo de tarefa + critério\n" +
    "de escolha) — e isso muda cli/templates/**, logo pede bump do CLI.\n" +
    "⚠️ A família ui/ NÃO é checada aqui: quem cobra a linha dela é o distribution-debt.\n" +
    "Receita: .claude/skills/ds-dev/handoff-pr.md §Regra de comportamento.\n"
  );
}
