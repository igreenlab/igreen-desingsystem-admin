/**
 * component-rules — no momento em que a IA escreve `<FloatingPanel>`, entrega as regras
 * DAQUELE componente. Puro, zero I/O (ler arquivo é de quem chama).
 *
 * ## O problema, medido
 *
 * Os `USAGE.md` chegam no ponto de uso (34 dos 92 itens do registry os levam; em submódulo
 * estão todos no disco) e o vocabulário `alwaysApply` manda ler antes de compor. Mas **ler é
 * decisão do modelo, não mecanismo**. Medido num consumidor real em 2026-08-21: a IA abriu
 * **6 de 14** USAGE. E o padrão não foi aleatório — ela leu onde precisava decidir
 * ARQUITETURA (e mudou de rumo por causa disso) e pulou onde achava que já sabia a API.
 * É exatamente onde a memória dela está desatualizada.
 *
 * Escrever mais doc não conserta isso: o arquivo que ela pulou já estava correto e completo.
 *
 * ## A inversão
 *
 * O `protect-ds.mjs` é PreToolUse em `Edit|Write|MultiEdit` e já lê o conteúdo que está
 * ENTRANDO. Então não se pede leitura — se **entrega** a regra: detecta o componente no
 * código e imprime as linhas dele. Chega no agente por stderr + exit 1, que é o canal que
 * ele já usa pro lint de estilo.
 *
 * ## Por que não incha e não custa token
 *
 * O gatilho é o componente APARECER no código. Quem não usa `FloatingPanel` nunca vê uma
 * linha sobre ele. E o texto vem de um bloco curto dentro do próprio `USAGE.md` — nenhum
 * arquivo novo, nada em `rules/`, nada carregado por padrão.
 *
 * ## Progressivo por construção
 *
 * Componente **sem** o bloco `ds:regras` → silêncio absoluto, comportamento idêntico ao de
 * hoje. Ligar um componente é acrescentar 3 linhas no USAGE dele, sem tocar em código. Ou
 * seja: a adoção é por componente, reversível, e o dia em que isto entrar não muda nada
 * até alguém optar por um. É o oposto de big-bang.
 *
 * ## Anti-ruído (L-059) — as três travas
 *
 * Aviso que aparece sempre é aviso desligado. Então:
 *
 *   1. só componente com bloco declarado (hoje: os que o mantenedor optou);
 *   2. só a PRIMEIRA aparição no arquivo — repetir por tag é ruído;
 *   3. teto de 3 componentes e 8 linhas por Write, pra nunca inundar.
 *
 * E nunca bloqueia: o dono da decisão é quem está escrevendo.
 */

/**
 * Abre o bloco. Comentário HTML: invisível no markdown renderizado.
 *
 * Duas formas, uma convenção:
 *   `<!-- ds:regras`        no `USAGE.md` de um COMPOSTO — o arquivo já é daquele componente
 *   `<!-- ds:regras tabs`   na tabela global dos PRIMITIVOS — um arquivo, N componentes
 */
const ABRE = "<!-- ds:regras";
const FECHA = "-->";

/**
 * Tags JSX de componente (PascalCase) que aparecem no conteúdo, na ordem da 1ª aparição.
 *
 * Só PascalCase de propósito: `<div>`/`<span>` são HTML, e primitivo shadcn no copy-in cai
 * como arquivo solto minúsculo (`ui/badge.tsx`) sem USAGE — não há o que entregar. Sem
 * duplicata, porque o interesse é "este arquivo usa X", não quantas vezes.
 */
export function componentesUsados(conteudo) {
  const vistos = new Set();
  const ordem = [];
  for (const m of String(conteudo ?? "").matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    if (!vistos.has(m[1])) {
      vistos.add(m[1]);
      ordem.push(m[1]);
    }
  }
  return ordem;
}

/**
 * Extrai as linhas de um bloco `ds:regras`.
 *
 *     <!-- ds:regras                 ← anônimo, no USAGE do próprio componente
 *     - aba dentro dele → <Tabs fullWidth>, variante default
 *     -->
 *
 *     <!-- ds:regras tabs            ← nomeado, na tabela global dos primitivos
 *     - variante default dentro de superfície; `line` só pra seção de página
 *     -->
 *
 * Sem bloco → `[]`, e o chamador fica em silêncio. Linha vazia e `-` inicial são
 * normalizados; o resto do arquivo é prosa livre e não é lido por ninguém aqui.
 *
 * ⚠️ Varredura por `indexOf`, sem RegExp montada em runtime, de propósito: a 1ª versão
 * escapava `ABRE` pra dentro de um `new RegExp` e o escaping morreu no caminho (o arquivo
 * virou `SyntaxError`). Comparação de string não tem esse modo de falha.
 */
export function regrasDoUsage(texto, nome = null) {
  const s = String(texto ?? "");
  const querido = nome ? String(nome).toLowerCase() : null;

  for (let i = s.indexOf(ABRE); i >= 0; i = s.indexOf(ABRE, i + 1)) {
    const fimDaLinha = s.indexOf("\n", i);
    if (fimDaLinha < 0) return [];
    // o que sobra na linha do abre é o nome (vazio no bloco anônimo)
    const rotulo = s.slice(i + ABRE.length, fimDaLinha).trim().toLowerCase();
    if (querido ? rotulo !== querido : rotulo !== "") continue;

    const j = s.indexOf(FECHA, fimDaLinha);
    if (j < 0) return []; // bloco não fechado: ignora em silêncio, nunca quebra o Write
    return s
      .slice(fimDaLinha, j)
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^-\s*/, ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * As regras de um PRIMITIVO, pelo bloco nomeado na tabela global.
 *
 * Converte a tag JSX pro id do registry (`<InputOTP>` → `input-otp`), que é como o arquivo
 * global nomeia. Sem bloco pro componente → `[]`, e `[]` é silêncio.
 *
 * ⚠️ **Não** lê a CÉLULA da tabela, de propósito. Medido: a célula do `tabs` tem 816 chars
 * (~204 tokens) e truncar em 240 perde exatamente o `fullWidth`, que é a parte decisiva. A
 * célula é doc pra humano; injeção precisa de payload curto e **escolhido** por quem
 * escreve. Daí o bloco nomeado ao lado dela, em vez de recorte automático.
 */
export function regrasDoPrimitivo(texto, nome) {
  const id = String(nome ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
  return regrasDoUsage(texto, id);
}

const MAX_COMPONENTES = 3;
const MAX_LINHAS = 8;

/**
 * @param {string} conteudo  o que está sendo escrito (content/new_string)
 * @param {(nome: string) => string|null} lerUsage  devolve o texto do USAGE do componente,
 *   ou `null` se não existir. Quem chama resolve o caminho (copy-in × submódulo).
 * @param {string|null} tabelaPrimitivos  texto do `shadcn-gotchas.md`, ou `null`. Consultado
 *   só quando o componente NÃO tem USAGE próprio — é a família dos primitivos, que no
 *   copy-in cai como arquivo solto (`ui/tabs.tsx`) e não tem USAGE por arquivo.
 * @returns {Array<{componente: string, regras: string[]}>} vazio = silêncio
 */
export function regrasAplicaveis(conteudo, lerUsage, tabelaPrimitivos = null) {
  const out = [];
  let linhas = 0;
  for (const nome of componentesUsados(conteudo)) {
    if (out.length >= MAX_COMPONENTES || linhas >= MAX_LINHAS) break;
    let texto = null;
    try {
      texto = lerUsage(nome);
    } catch {
      texto = null; // USAGE ilegível é silêncio, nunca erro no caminho de um Write
    }
    /* Composto primeiro, primitivo depois. A ordem importa: se um dia um composto e um
       primitivo tiverem o mesmo nome, o USAGE específico ganha da tabela global. */
    const regras = texto
      ? regrasDoUsage(texto)
      : regrasDoPrimitivo(tabelaPrimitivos, nome);
    if (!regras.length) continue;
    const cabem = regras.slice(0, MAX_LINHAS - linhas);
    out.push({ componente: nome, regras: cabem });
    linhas += cabem.length;
  }
  return out;
}

/** A mensagem que o agente lê. Vazio quando não há nada a dizer. */
export function formatar(aplicaveis, caminhoDoArquivo = "") {
  if (!aplicaveis.length) return "";
  const corpo = aplicaveis
    .map(
      ({ componente, regras }) =>
        `   • ${componente}\n` + regras.map((r) => `     – ${r}`).join("\n"),
    )
    .join("\n");
  return (
    `ℹ Regras dos componentes que você está usando${caminhoDoArquivo ? ` em ${caminhoDoArquivo}` : ""}:\n` +
    `${corpo}\n` +
    "   Detalhe completo no USAGE.md ao lado de cada componente.\n" +
    "   (informativo, não bloqueio — o arquivo FOI escrito.)\n"
  );
}
