/**
 * actions-column-canon.mjs — a coluna `type: "actions"` dos exemplos ENSINA o default?
 *
 * ## Por que este gate existe
 *
 * As skills mandam **espelhar o exemplo canônico**, e o comentário do próprio
 * `ClientesShowcase` já dizia por quê: *"o exemplo é a fonte de maior precedência das
 * skills ('o exemplo vence tudo'), então prop redundante aqui vira prop copiada em toda
 * tela gerada"*. O repo tem gate de drift `exemplo ↔ showcase` (hash) e **nenhum** gate de
 * contradição `exemplo ↔ regra`. Resultado medido no dogfood de submódulo de 2026-08-18:
 *
 * - O payload publicado dizia **"NÃO passe `width`"**, e os 5 arquivos canônicos passavam
 *   `width` — 3 deles com um comentário que **justificava** a escolha, texto que virou falso
 *   na v0.42.0 (quando `col.width` deixou de ser ignorado nessa coluna).
 * - Os 4 itens do `example-clientes` marcavam `showInMenu: true` na mão. Desde a v0.42.0 o
 *   colapso acima de 3 é automático, então a marcação virou **redundante** — e o agente do
 *   consumidor copiou a marcação pra um caso de **3** ações, onde ela INVERTE o
 *   comportamento: o usuário pediu botões e recebeu um menu. Pior, o agente justificou
 *   dizendo *"é o padrão do DS"*, invertendo qual é o default.
 * - E o `width: 40` do finance ficou **abaixo** dos 44px de 1 slot: o botão tem
 *   `flex-shrink: 1` e `min-width: auto`, então o flex o **comprimiu de 28 → 24px** em 25
 *   linhas. Medido no browser (`computed width: 24px`). Regressão silenciosa da própria
 *   v0.42.0 — nada transbordava, então nenhum teste, tsc ou gate acusou.
 *
 * ## O que entra aqui (L-059)
 *
 * Só regra errada **independente de contexto**: prop que o próprio DS documenta como "não
 * passe", e marcação que o default já faz. Fora: "este exemplo está bom?", "faltou
 * demonstrar X" — julgamento de intenção é do revisor.
 *
 * ⚠️ `showInMenu` com contagem **≤ 3** é override LEGÍTIMO (quer as ações no menu mesmo
 * cabendo inline) e não é acusado. Só a forma redundante — TODAS marcadas com mais de 3
 * ações, onde o default já colapsaria — reprova. O `ClientsCRUDServerPreview` demonstra o
 * split parcial (2 de 4) de propósito e tem de continuar passando.
 *
 * Módulo PURO: recebe `[{arquivo, fonte}]`. Quem lê disco é o `.test.mjs`.
 */

/** Quantos ícones cabem inline — espelha `ACTIONS_INLINE_MAX` do componente. */
export const INLINE_MAX = 3;

/**
 * Extrai o objeto de cada coluna `type: "actions"` por **brace-matching**.
 *
 * ⚠️ Não troque por leitura de janela fixa. A primeira versão da medição lia 2600 chars a
 * partir do `type: "actions"` e contava `id:` de código vizinho: reportou **12 ações** onde
 * havia 4, e eu quase abri PR com esse número. Casar chave é o que delimita o objeto.
 */
export function blocosDeActions(fonte) {
  const src = String(fonte);
  const blocos = [];
  let i = -1;
  while ((i = src.indexOf('type: "actions"', i + 1)) !== -1) {
    // sobe até a `{` que abre o objeto da coluna (ignorando objetos internos fechados)
    let ini = i;
    let fechadas = 0;
    for (; ini >= 0; ini--) {
      if (src[ini] === "}") fechadas++;
      else if (src[ini] === "{") {
        if (fechadas === 0) break;
        fechadas--;
      }
    }
    if (ini < 0) continue;
    // desce fazendo brace-match
    let fim = ini;
    let prof = 0;
    for (; fim < src.length; fim++) {
      if (src[fim] === "{") prof++;
      else if (src[fim] === "}") {
        prof--;
        if (prof === 0) {
          fim++;
          break;
        }
      }
    }
    blocos.push(src.slice(ini, fim));
  }
  return blocos;
}

/**
 * Conta o que importa num bloco.
 *
 * ⚠️ A contagem de ações NÃO pode depender de indentação. A primeira versão exigia
 * `^[ \t]{6,}id:` — casava o formato do prettier (`{`, quebra, `id: "edit",`) e contava
 * **zero** num objeto compacto (`{ id: "a", label: "A" }`), fazendo a regra de redundância
 * não disparar **em silêncio**. Foi o próprio teste do gate que pegou.
 *
 * O lookbehind evita contar `persistId:`, `getRowId:`, `viewId:` como ação.
 */
export function analisarBloco(bloco) {
  const width = (bloco.match(/^[ \t]*width:\s*(\d+)/m) || [])[1];
  const acoes = (bloco.match(/(?<![A-Za-z0-9_$])id:\s*["']/g) || []).length;
  const menu = (bloco.match(/showInMenu:\s*true/g) || []).length;
  return { width: width === undefined ? undefined : Number(width), acoes, menu };
}

/**
 * @param {Array<{arquivo: string, fonte: string}>} arquivos
 * @returns {{blocosConferidos: number, achados: Array<{arquivo:string, tipo:string, o_que:string, conserto:string}>}}
 */
export function checkActionsColumnCanon(arquivos) {
  const achados = [];
  let blocosConferidos = 0;

  for (const { arquivo, fonte } of arquivos ?? []) {
    for (const bloco of blocosDeActions(fonte)) {
      blocosConferidos++;
      const { width, acoes, menu } = analisarBloco(bloco);

      if (width !== undefined) {
        achados.push({
          arquivo,
          tipo: "width-em-actions",
          o_que: `coluna \`type: "actions"\` passa \`width: ${width}\` — o payload do consumidor diz "NÃO passe width", e a largura é derivada do nº de ações (1→44px · 2→74 · 3→104)`,
          conserto:
            "remova o `width`. Precisa travar mesmo? Use `minWidth` — mas então o exemplo deixa de ensinar o default, e provavelmente é o exemplo que está errado",
        });
      }

      if (acoes > INLINE_MAX && menu === acoes) {
        achados.push({
          arquivo,
          tipo: "showInMenu-redundante",
          o_que: `todas as ${acoes} ações marcam \`showInMenu: true\`, e acima de ${INLINE_MAX} o colapso no "…" já é automático — a marcação não muda o render e ensina o contrário do default`,
          conserto:
            "remova os `showInMenu: true`. O render fica idêntico. Split manual só quando você quer o que o default NÃO faz (≤3 no menu, ou >3 inline)",
        });
      }
    }
  }

  return { blocosConferidos, achados };
}

/** Mensagens prontas pra reprovar. */
export function formatar(achados) {
  return achados.map((a) => `[${a.tipo}] ${a.arquivo}\n     ${a.o_que}\n     → ${a.conserto}`);
}
