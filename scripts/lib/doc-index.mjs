/**
 * doc-index — gera e verifica o índice de navegação dos docs GRANDES lidos sob
 * demanda. Puro, zero I/O (ler arquivo é do CLI e do teste).
 *
 * ## O furo que isto fecha
 *
 * Medido em 2026-08-17: nenhum dos maiores documentos do repo tinha índice —
 * `inventory.md` (75 KB, 34 seções), `pipeline-state.md` (293 KB, 104), e outros dois
 * que acabaram ficando de fora por motivo próprio (ver a nota após `INDEXADOS`). Quem
 * precisa de UMA seção não tem como saber onde ela está: lê o arquivo inteiro, ou
 * greps às cegas.
 *
 * Para agente isso é token; para humano é tempo. Nos dois casos, o custo é pago em
 * toda consulta, e o índice o paga uma vez.
 *
 * ## Por que só os SOB DEMANDA — e por que isto importa
 *
 * ⛔ `CLAUDE.md` e `.claude/rules/ds-standards.md` **não entram**, de propósito. São
 * project instruction: já chegam INTEIROS no contexto de toda sessão. Um índice ali
 * não ajuda o agente a achar nada (ele já tem tudo) e adiciona tokens ao arquivo mais
 * caro do repo — seria o oposto do item D1, que acabou de cortar 2.246 tokens deles.
 *
 * Índice é ferramenta de **leitura parcial**. Onde não há leitura parcial, é só custo.
 *
 * ## Por que gerado, e não escrito à mão
 *
 * Índice escrito à mão desatualiza no primeiro heading renomeado, e passa a apontar
 * pra seção que não existe — a L-060 na forma mais direta possível: um texto que
 * afirma estrutura, sem nada verificar a afirmação. Aqui ele é derivado dos headings
 * e conferido por teste, então divergir reprova.
 */

/** Marcadores do bloco gerado. Conteúdo fora deles nunca é tocado. */
export const INICIO = "<!-- doc-index:início — gerado por scripts/doc-index.mjs, não edite à mão -->";
export const FIM = "<!-- doc-index:fim -->";

/**
 * Arquivos indexados. Só docs grandes de leitura SOB DEMANDA.
 * `nivel` = profundidade máxima de heading que entra no índice.
 */
export const INDEXADOS = [
  { arquivo: ".ai/context/components/inventory.md", nivel: 2, motivo: "75 KB — consultado por componente" },
  { arquivo: ".ai/status/pipeline-state.md", nivel: 2, motivo: "293 KB — audit log; navegar por seção" },
];

/**
 * ⛔ **Só arquivo RASTREADO pelo git entra aqui.** O `DESIGN.md` da raiz entrou na
 * primeira versão desta lista e foi tirado antes do commit: ele está no
 * `.gitignore:28` — é arquivo local. O índice escrito nele não seria commitado, e o
 * teste abaixo quebraria com ENOENT em clone limpo e no CI, passando só na máquina de
 * quem o tem. Defeito de "passou aqui": o teste confere `git ls-files` por isso.
 *
 * ⛔ **O `lessons.md` também NÃO entra**, e o motivo é o do parágrafo acima em outra
 * forma: o resumo 1-linha das 69 lições no `ds-standards.md` **já é** o índice dele — e
 * chega auto-carregado. Um índice no próprio arquivo seria a MESMA lista duas vezes,
 * custando **+3.178 tokens** (medido) pra repetir o que o agente já tem. E duas cópias da
 * mesma lista divergem: é exatamente o que o gate `lessons-index` existe pra impedir.
 *
 * O `DESIGN.md` distribuído (`cli/templates/default/DESIGN.md`) é rastreado, mas tem
 * 11 KB e 12 seções — pequeno o bastante pra índice não pagar.
 */

/** Headings de nível 2..`nivel`, fora de bloco de código e fora do próprio índice. */
export function headings(texto, nivel = 2) {
  const linhas = String(texto ?? "").split(/\r?\n/);
  const out = [];
  let emCodigo = false;
  let emIndice = false;
  for (const l of linhas) {
    if (/^```/.test(l)) { emCodigo = !emCodigo; continue; }
    if (emCodigo) continue;
    if (l.includes(INICIO)) { emIndice = true; continue; }
    if (l.includes(FIM)) { emIndice = false; continue; }
    if (emIndice) continue;
    const m = /^(#{2,6})\s+(.+?)\s*$/.exec(l);
    if (!m) continue;
    const n = m[1].length;
    if (n > nivel) continue;
    out.push({ nivel: n, texto: m[2] });
  }
  return out;
}

/**
 * Slug do GitHub para link interno: minúsculas, sem pontuação, espaço→hífen.
 * Acento é PRESERVADO (o GitHub não o remove) — remover geraria link morto.
 */
export function slug(texto) {
  return String(texto)
    .toLowerCase()
    .replace(/`|\*|_|~|\[|\]|\(|\)/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Bloco de índice pronto, com os marcadores. */
export function buildIndice(texto, nivel = 2) {
  const hs = headings(texto, nivel);
  const linhas = [INICIO, "", "**Índice**", ""];
  for (const h of hs) {
    const recuo = "  ".repeat(Math.max(0, h.nivel - 2));
    linhas.push(`${recuo}- [${h.texto}](#${slug(h.texto)})`);
  }
  linhas.push("", FIM);
  return linhas.join("\n");
}

/**
 * Insere ou substitui o bloco. Posição: depois do H1 e do blockquote de abertura
 * que o segue (a nota de contexto que quase todo doc do repo tem), antes do resto.
 * @returns {{texto:string, mudou:boolean}}
 */
export function aplicarIndice(texto, nivel = 2, eol = "\n") {
  const bloco = buildIndice(texto, nivel).split("\n").join(eol);
  const linhas = String(texto ?? "").split(/\r?\n/);

  const iIni = linhas.findIndex((l) => l.includes(INICIO));
  if (iIni !== -1) {
    const iFim = linhas.findIndex((l, k) => k >= iIni && l.includes(FIM));
    if (iFim === -1) throw new Error("marcador de início sem fim");
    const antes = linhas.join(eol);
    linhas.splice(iIni, iFim - iIni + 1, ...bloco.split(eol));
    const depois = linhas.join(eol);
    return { texto: depois, mudou: antes !== depois };
  }

  // primeira inserção: após o H1 + eventual blockquote de abertura + linha vazia
  let pos = linhas.findIndex((l) => /^#\s+/.test(l));
  pos = pos === -1 ? 0 : pos + 1;
  while (pos < linhas.length && (linhas[pos].trim() === "" || linhas[pos].startsWith(">"))) pos++;
  const novo = [...linhas];
  novo.splice(pos, 0, ...bloco.split(eol), "");
  return { texto: novo.join(eol), mudou: true };
}
