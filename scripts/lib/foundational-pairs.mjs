/**
 * foundational-pairs.mjs — fonte ÚNICA dos pares fonte(DS) ↔ baked(template do CLI).
 *
 * Consumido por `cli-rebake-foundationals.mjs` (que COPIA) e por
 * `check-foundationals.mjs` (que VERIFICA). Existir como módulo não é organização:
 * as duas pontas enumeravam a lista separadamente, e ao acrescentar os overlays de
 * marca só no lado que copia eu criaria um gate que afirma sync e não verifica os
 * overlays — mecanismo cuja garantia não vale, que é o defeito da L-060.
 *
 * Os overlays de marca entram por DESCOBERTA de diretório, não enumerados, porque o
 * `detectBrandThemes()` do `cli/src/create.js` também descobre pelo diretório pra
 * montar o prompt "Tema de cor?". Lista fixa aqui divergiria dele na primeira marca
 * nova (e o sintoma seria a marca não aparecer na criação de projeto — silencioso).
 */
import { readdirSync, existsSync } from "node:fs";

/** Foundationals fixos: cn, tv, lucide-types, o tema-base e a tabela de anti-patterns. */
const FIXOS = [
  ["src/lib/utils.ts", "cli/templates/default/src/lib/utils.ts"],
  ["src/utils/tv.ts", "cli/templates/default/src/utils/tv.ts"],
  ["src/lib/lucide-types.ts", "cli/templates/default/src/lib/lucide-types.ts"],
  ["src/styles/theme/tailwind-theme.css", "cli/templates/default/src/styles/theme/tailwind-theme.css"],
  // A tabela de anti-patterns vira o lint de conteúdo do consumidor (hook
  // `protect-ds.mjs`). Entrou em 2026-08-08: até então o consumidor tinha ZERO lint
  // de estilo — o `protect-ds` inspecionava só o `file_path`, então `bg-[#0fff00]`
  // ou `gap-13` numa tela nova passava 100% limpo em todos os canais. Entra como
  // foundational (e não como cópia manual) pra que o `check-foundationals` cobre o
  // sync: tabela do consumidor divergindo da do CI é o defeito que a L-060 descreve.
  ["scripts/lib/ds-lint-patterns.mjs", "cli/templates/default/_claude/hooks/ds-lint-patterns.mjs"],
  // O índice de gotchas dos primitivos shadcn. Entrou em 2026-08-21: ele NÃO chegava em
  // consumidor nenhum — nenhum item do registry o distribui e o payload tinha ZERO
  // USAGE.md. Só quem consome por submódulo o lia (está no disco). Consequência: todo
  // gotcha de primitivo (o `value=""` do select, o `<Toaster/>` no root, a receita
  // flutuante, e agora a regra de largura do tabs) existia pro consumidor apenas se
  // estivesse repetido no vocabulário `alwaysApply` — que é justamente o arquivo que a
  // gente cuida pra não inflar. Como foundational, ele chega nos 4 canais, carrega SOB
  // DEMANDA (é arquivo de skill, não rule) e o sync fica gated em vez de depender de
  // alguém lembrar de copiar.
  ["src/components/shadcn/USAGE.md", "cli/templates/default/_claude/skills/ds-kit/shadcn-gotchas.md"],
  // Entrega as regras do componente no momento em que a IA o escreve. Entrou em
  // 2026-08-21, depois de medir num consumidor real que a IA abre ~6 de 14 USAGE — ela
  // le onde precisa decidir arquitetura e pula onde acha que sabe a API, que e justo onde
  // a memoria dela esta velha. Escrever mais doc nao conserta: o arquivo pulado ja estava
  // certo. Entao o hook PARA DE PEDIR leitura e ENTREGA a regra. Foundational (e nao copia
  // manual) pelo mesmo motivo do ds-lint-patterns: o check-foundationals cobre o sync.
  ["scripts/lib/component-rules.mjs", "cli/templates/default/_claude/hooks/component-rules.mjs"],
];

const THEME_DIR = "src/styles/theme";
const TEMPLATE_THEME_DIR = "cli/templates/default/src/styles/theme";

/** Overlays `brand-<id>.css` presentes na fonte, em ordem estável. */
export function brandOverlays() {
  if (!existsSync(THEME_DIR)) return [];
  return readdirSync(THEME_DIR)
    .filter((f) => /^brand-.+\.css$/.test(f))
    .sort();
}

/**
 * Overlays que existem no BAKED mas não na fonte — marca removida do DS cuja cópia
 * ficou órfã no template. O prompt do CLI continuaria oferecendo um tema que o DS
 * não tem mais.
 */
export function orphanBakedOverlays() {
  if (!existsSync(TEMPLATE_THEME_DIR)) return [];
  const naFonte = new Set(brandOverlays());
  return readdirSync(TEMPLATE_THEME_DIR)
    .filter((f) => /^brand-.+\.css$/.test(f) && !naFonte.has(f))
    .sort();
}

/** Todos os pares [fonte, baked] — fixos + overlays de marca descobertos. */
export function foundationalPairs() {
  return [
    ...FIXOS,
    ...brandOverlays().map((f) => [`${THEME_DIR}/${f}`, `${TEMPLATE_THEME_DIR}/${f}`]),
  ];
}

export { FIXOS, THEME_DIR, TEMPLATE_THEME_DIR };
