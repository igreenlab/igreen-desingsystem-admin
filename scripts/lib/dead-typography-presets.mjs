/**
 * dead-typography-presets — acha PRESET TIPOGRÁFICO citado em doc/skill/kit que o tema
 * não emite. Puro, zero I/O (ler arquivo é do teste).
 *
 * ## O furo que isto fecha
 *
 * Medido em 2026-08-20, com o defeito plantado: troquei `text-code-sm` por `text-code-xxl`
 * (preset que não existe) no `cli/templates/default/_claude/skills/crud-builder/generate.md`
 * — arquivo que **ensina** a IA do consumidor — e rodei os gates de classe morta:
 * **14/14 passaram**. Depois plantei `text-codigo-{sm,md}` no `ds-design.md`, que é
 * `alwaysApply`: passou também.
 *
 * Por que escapava de tudo:
 *
 *   dead-theme-classes      cobre só `--color-*`                       → tipografia não
 *   dead-ds-classes         8 famílias (shadow/radius/form/gap/pad/…)  → tipografia não
 *   typography-merge-sync   os 27 presets em `tv.ts` e `utils.ts`      → doc e payload não
 *
 * E o alvo é pior que código: classe morta num `.tsx` estraga uma tela; **doc errada ensina
 * o erro** a toda IA que a ler. Foi assim que 25 usos da nomenclatura V2 sobreviveram meses
 * (a origem do `dead-theme-classes`) e que o `cn()` ficou com 23 de 27 presets (a origem do
 * `typography-merge-sync`): nos dois casos a doc ensinava o nome errado.
 *
 * ## A fonte de verdade é o tema, e é uma só
 *
 * O que existe é o que o tema gerado emite como `@utility text-<nome>` — mesma fonte que o
 * `typography-merge-sync` usa (`presetsDoTema`). Reusar em vez de reimplementar é de
 * propósito: dois extratores discordando sobre quais presets existem seria pior que não ter
 * gate.
 *
 * ## Curinga e citação deliberada
 *
 * Duas coisas legítimas parecem violação e não são:
 *
 * 1. **Curinga** — `text-code-*`, `text-stat-{sm,md}` e `text-body-{sm|md}` são PADRÃO, não
 *    classe. Doc escreve assim o tempo todo. O sinal (`*`, `{`) é context-free.
 * 2. **Citação deliberada** — a L-032 nomeia `text-display-sm`/`display-xs` justamente pra
 *    dizer que **não existem** (renderizam 14px no Recharts). Apagar a citação apagaria a
 *    lição. Então quem cita declara em `CITACOES`, com motivo — e aí volta a ser
 *    context-free: ou está declarado, ou reprova.
 *
 * Escopo por PAR (arquivo, preset), igual ao `dead-theme-classes`: o `chart-patterns.md`
 * pode citar `display-sm`, mas se alguém escrever `text-code-xxl` lá amanhã, reprova.
 */

/** Os 7 papéis vivos do DS. Preset é sempre `text-<papel>-<tier>`. */
const PAPEIS = ["display", "heading", "title", "body", "caption", "stat", "code"];

/**
 * Papéis da nomenclatura **V2, extinta**. Precisam entrar no padrão porque o defeito
 * mais provável não é errar o tier de um papel vivo — é a doc ficar uma revisão atrás e
 * seguir ensinando o papel que morreu. Foi assim que 25 usos de V2 sobreviveram meses
 * (a origem do `dead-theme-classes`), e a seção de anti-patterns ainda grepa por estes
 * três nomes em `src/`. Sem eles aqui, `text-label-md` numa skill passava batido: o
 * padrão não o reconhecia como preset, logo não tinha o que validar.
 */
const PAPEIS_EXTINTOS = ["paragraph", "label", "subheading"];

/**
 * Citação deliberada: (arquivo → preset → motivo). O nome aparece pra ENSINAR que ele
 * não existe. Ao acrescentar, escreva o motivo — sem ele a exceção vira lixo que ninguém
 * sabe se ainda vale.
 */
export const CITACOES = new Map([
  [
    ".claude/rules/ds-standards.md",
    new Map([
      ["text-display-sm", "L-032: nomeia os presets que NÃO existem (renderizam 14px no Recharts) — é o conteúdo da lição"],
      ["text-display-xs", "L-032: o par do display-sm — a lição nomeia os DOIS presets que não existem, senão ensina metade"],
    ]),
  ],
  [
    ".ai/context/components/chart-patterns.md",
    new Map([
      ["text-display-sm", "tabela de caveats do Recharts 3: a linha existe pra dizer que este preset não existe"],
      ["text-display-xs", "tabela de caveats: a mesma linha cita os dois nomes inexistentes, um ao lado do outro"],
    ]),
  ],
  [
    // A doc que DOCUMENTA este gate precisa nomear o defeito que ele pega. Pegou a si
    // mesma na 1ª execução — sinal de que o escopo está certo, igual ao irmão de cor.
    ".claude/skills/ds-reviewer/pre-commit-check.md",
    new Map([
      ["text-code-xxl", "tabela §2.9: nomeia a sonda que passou por 14/14 testes em 2026-08-20 — é o exemplo que explica por que este gate existe"],
    ]),
  ],
  [
    "cli/templates/default/_claude/skills/charts/SKILL.md",
    new Map([
      ["text-display-sm", "mesma advertência, na versão do consumidor: valor de KPI usa heading-*/stat-*, não display-sm"],
    ]),
  ],
]);

/** Presets emitidos como `@utility text-<nome>` no tema gerado. */
export function presetsDoTema(cssTema) {
  return new Set([...String(cssTema ?? "").matchAll(/@utility\s+text-([a-z0-9-]+)/g)].map((m) => m[1]));
}

/**
 * O match é parte de um PADRÃO com curinga, não uma classe?
 *
 * Olha o caractere seguinte ao match e o anterior ao tier: `text-code-*`, `text-stat-{sm,md}`
 * e `text-{body|caption}-sm` são as três formas que a doc usa. Nenhuma classe real tem `*`
 * ou `{`, então o teste é context-free.
 */
function ehCuringa(linha, ini, fim) {
  if (linha[fim] === "*" || linha[fim] === "{" || linha[fim] === "|") return true;
  // `text-{display|heading}-sm`: a chave abre antes do papel
  const antes = linha.slice(Math.max(0, ini - 2), ini + 5);
  return antes.includes("{") || antes.includes("|");
}

/**
 * @param {{fontes: Array<{file: string, text: string}>, cssTema: string}} entrada
 * @returns {{mortos: Array<{arquivo: string, linha: number, preset: string, trecho: string}>, conferidos: number}}
 *   `mortos` = preset citado que o tema não emite e que não está declarado em CITACOES.
 */
export function checkPresets({ fontes, cssTema }) {
  const vivos = presetsDoTema(cssTema);
  const papeis = [...PAPEIS, ...PAPEIS_EXTINTOS].join("|");
  const re = new RegExp(`(?<![a-z0-9-])text-(${papeis})-([a-z0-9]+)(?![a-z0-9-])`, "g");
  const mortos = [];
  let conferidos = 0;

  for (const { file, text } of fontes) {
    const declaradas = CITACOES.get(file);
    const linhas = String(text ?? "").split(/\r?\n/);
    for (let i = 0; i < linhas.length; i++) {
      for (const m of linhas[i].matchAll(re)) {
        const fim = m.index + m[0].length;
        if (ehCuringa(linhas[i], m.index, fim)) continue;
        conferidos++;
        const nome = `${m[1]}-${m[2]}`;
        if (vivos.has(nome)) continue;
        if (declaradas?.has(m[0])) continue;
        mortos.push({
          arquivo: file,
          linha: i + 1,
          preset: m[0],
          trecho: linhas[i].trim().slice(0, 90),
        });
      }
    }
  }
  return { mortos, conferidos };
}

/** Mensagem por achado, com o conserto — o que o agente lê quando reprova. */
export function formatar(mortos, vivos) {
  const porPapel = new Map();
  for (const p of vivos) {
    const [papel, tier] = [p.slice(0, p.indexOf("-")), p.slice(p.indexOf("-") + 1)];
    if (!porPapel.has(papel)) porPapel.set(papel, []);
    porPapel.get(papel).push(tier);
  }
  return mortos.map((m) => {
    const papel = m.preset.slice("text-".length, m.preset.lastIndexOf("-"));
    const tiers = (porPapel.get(papel) ?? []).sort().join(" · ");
    return (
      `✗ ${m.arquivo}:${m.linha} — \`${m.preset}\` não existe no tema.\n` +
      `    ${m.trecho}\n` +
      `    conserto: o papel \`${papel}\` tem ${tiers || "(nenhum tier — o papel também não existe)"}.\n` +
      `    Se o nome está aí de propósito (pra ensinar que NÃO existe), declare em CITACOES com o motivo.`
    );
  });
}
