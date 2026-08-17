/**
 * lessons-index.mjs — toda lição é ALCANÇÁVEL pelo agente?
 *
 * ## O que mudou em 2026-08-15, e por quê
 *
 * Antes este gate exigia que toda lição estivesse **citada** no resumo
 * auto-carregado. A garantia era boa e o efeito colateral, perverso: **não existia
 * caminho pro resumo encolher**. Medido — o `ds-standards.md` foi de 276 linhas em
 * maio pra 921 em agosto, e é PROJECT INSTRUCTION: custa ~18.500 tokens em 100% das
 * sessões, antes de o usuário digitar. Somado ao `CLAUDE.md`, ~23.900 tokens fixos.
 *
 * O gate mais barato do repo estava, sozinho, tornando obrigatório o crescimento do
 * arquivo mais caro dele.
 *
 * E boa parte do que ele obrigava a manter era redundante com a máquina: uma lição
 * que um gate mecânico reprova não precisa estar no contexto do modelo — o CI pega.
 * Manter as duas é pagar token pra ser redundante com o próprio CI, toda sessão,
 * pra sempre.
 *
 * **A inversão:** a lição precisa ser **alcançável**, não citada. Dois caminhos
 * válidos, e a garantia original (nenhuma lição desaparece) fica intacta:
 *
 *   1. citada no resumo auto-carregado — pro que exige julgamento humano; ou
 *   2. declarada em `COBERTAS_POR_GATE`, com o **gate que a aplica** — pro que a
 *      máquina reprova sozinha.
 *
 * O que NÃO é caminho válido: existir só no `lessons.md`, que é sob demanda. Esse
 * era o defeito original e continua reprovando.
 *
 * ⚠️ Este módulo só cria a PERMISSÃO de encolher. Decidir quais linhas saem do resumo
 * é trabalho separado (item D1 do plano de fechamento), item por item, com o
 * mantenedor — não é consequência automática deste gate.
 *
 * ## O furo original que isto fecha
 *
 * As lições vivem em dois lugares com papéis diferentes:
 *
 *   .ai/status/lessons.md          formato completo — SOB DEMANDA (o agente só lê se abrir)
 *   .ai/status/lessons-archive.md  as absorvidas em gate automático — idem
 *   .claude/rules/ds-standards.md  resumo 1-linha — PROJECT INSTRUCTION, sempre em contexto
 *
 * O resumo é o único que chega à sessão sem ação do agente. Ele se apresenta como
 * *"o atalho 1-linha de TODAS, ativas e arquivadas"* — e em 2026-08-08 **6 lições
 * não estavam lá**: L-044, L-045, L-046, L-048, L-049 e L-050.
 *
 * A mais grave a ter ficado invisível foi a **L-044** — "hooks bash dependem de jq e
 * de path forward-slash; no Windows ficam CEGOS" — num repo que roda em Windows. Se
 * ela vale, metade da tabela de hooks do `CLAUDE.md` é ficção nesta máquina, e o
 * agente não tinha como saber.
 *
 * É a L-060 na forma canônica: uma frase que **afirma garantia** ("TODAS") sem que
 * nada verificasse a garantia. Aqui ela passa a ser verificável.
 *
 * ## Por que gate mecânico serve neste caso (L-059)
 *
 * A regra é independente de contexto: ou o id `L-NNN` aparece no resumo, ou não
 * aparece. Não exige julgamento sobre a QUALIDADE do resumo — só sobre existência.
 */
import { readFileSync, existsSync } from "node:fs";

const FONTES = [".ai/status/lessons.md", ".ai/status/lessons-archive.md"];
const RESUMO = ".claude/rules/ds-standards.md";

/**
 * Lição → gate que a aplica sozinho. Ser declarada aqui é o **segundo** caminho de
 * alcançabilidade: dispensa a citação no resumo auto-carregado, porque quem cobra a
 * regra é o CI, não a leitura do agente.
 *
 * ⛔ Só entra aqui lição que um gate reprova de forma **mecânica e independente de
 * contexto** (L-059). Lição que exige julgamento — L-004 e L-007 são o exemplo
 * canônico, e saíram do grep de propósito — NUNCA entra: ela precisa estar no resumo.
 *
 * O caminho declarado tem que EXISTIR no disco: declaração apontando pra gate que não
 * existe é pior que ausência, porque afirma cobertura inexistente (L-060). Verificado.
 *
 * A semente abaixo não é meu julgamento — é a tabela "Quem aplica hoje" que o próprio
 * `lessons-archive.md` já publica desde 2026-07-30. Um teste confere que as duas não
 * divergem.
 */
const COBERTAS_POR_GATE = new Map([
  ["L-001", "scripts/lib/ds-lint-patterns.mjs"],
  ["L-002", "scripts/lib/ds-lint-patterns.mjs"],
  ["L-003", "scripts/lib/ds-lint-patterns.mjs"],
  ["L-005", "scripts/lib/ds-lint-patterns.mjs"],
  ["L-017", "scripts/lib/pack-contract.mjs"],
]);

/**
 * Ids de lição declarados num arquivo-fonte, pelos headers `## [L-NNN] ...`.
 * O template (`## [L-NNN] Título curto`) é ignorado — `NNN` não é dígito.
 */
export function lessonIds(texto) {
  return [...String(texto ?? "").matchAll(/^##\s*\[(L-\d{3})\]/gm)].map((m) => m[1]);
}

/** Ids citados em qualquer lugar de um texto (o resumo cita como `**L-042**`, `(L-058)`…). */
export function citedIds(texto) {
  return new Set([...String(texto ?? "").matchAll(/\bL-(\d{3})\b/g)].map((m) => `L-${m[1]}`));
}

/**
 * @returns {{
 *   ausentes:string[], duplicadas:string[], declaracoesMortas:string[],
 *   gatesInexistentes:Array<{licao:string,gate:string}>, podemSairDoResumo:string[],
 *   total:number, ativas:number, arquivadas:number, citadas:number, porGate:number
 * }}
 *   `ausentes`          lição inalcançável: nem citada no resumo, nem coberta por gate. REPROVA.
 *   `duplicadas`        mesmo id declarado 2× nas fontes (numeração colidiu). REPROVA.
 *   `declaracoesMortas` declarada em COBERTAS_POR_GATE e inexistente nas fontes. REPROVA.
 *   `gatesInexistentes` declarada apontando pra arquivo de gate que não está no disco. REPROVA.
 *   `podemSairDoResumo` coberta por gate E ainda citada — não é erro: é a lista de
 *                       trabalho do D1. Sobreposição é o estado normal durante a migração.
 */
export function checkLessonsIndex({
  fontes = FONTES,
  resumo = RESUMO,
  porGate = COBERTAS_POR_GATE,
  gateExiste = (p) => existsSync(p),
} = {}) {
  const porArquivo = fontes.map((f) => (existsSync(f) ? lessonIds(readFileSync(f, "utf8")) : []));
  const todas = porArquivo.flat();

  const vistos = new Set();
  const duplicadas = [];
  for (const id of todas) {
    if (vistos.has(id)) duplicadas.push(id);
    vistos.add(id);
  }

  const citadas = citedIds(existsSync(resumo) ? readFileSync(resumo, "utf8") : "");

  // Alcançável = citada no resumo OU coberta por gate declarado.
  const ausentes = [...vistos].filter((id) => !citadas.has(id) && !porGate.has(id)).sort();

  // Declaração que não corresponde a lição nenhuma afirma cobertura de coisa que não
  // existe — mesmo critério das outras duas listas de exceção do repo.
  const declaracoesMortas = [...porGate.keys()].filter((id) => !vistos.has(id)).sort();

  // Cobertura declarada tem que ser verificável no disco.
  const gatesInexistentes = [...porGate.entries()]
    .filter(([, gate]) => !gateExiste(gate))
    .map(([licao, gate]) => ({ licao, gate }));

  const podemSairDoResumo = [...porGate.keys()].filter((id) => citadas.has(id)).sort();

  return {
    ausentes,
    duplicadas,
    declaracoesMortas,
    gatesInexistentes,
    podemSairDoResumo,
    total: vistos.size,
    ativas: porArquivo[0]?.length ?? 0,
    arquivadas: porArquivo[1]?.length ?? 0,
    citadas: [...vistos].filter((id) => citadas.has(id)).length,
    porGate: porGate.size,
  };
}

export { FONTES, RESUMO, COBERTAS_POR_GATE };
