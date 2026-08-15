import { Fragment, type ReactNode } from "react";

import { markdownTextStyles } from "./markdown-text.styles";
import type { MarkdownTextProps } from "./markdown-text.types";

/* ──────────────────────────────────────────────────────────────────────────
 * Parser markdown estilo WhatsApp → React nodes (SEM dangerouslySetInnerHTML).
 *
 * Estratégia: tokenização por níveis, sempre produzindo React nodes a partir de
 * SUBSTRINGS do input original. Nada de HTML cru é interpretado — qualquer tag
 * digitada pelo usuário vira texto literal. Isso é o que sanitiza por design.
 *
 * Ordem de precedência (do "mais externo" pro "mais interno"):
 *   1. Code  (```...``` e `...`) — opaco: conteúdo NÃO recebe mais formatação.
 *   2. Links (http(s):// e www.) — opaco.
 *   3. Bold (*...*), Italic (_..._), Strike (~...~) — recursivos entre si.
 * ────────────────────────────────────────────────────────────────────────── */

type Slots = ReturnType<typeof markdownTextStyles>;

/* Regex de segmentação de nível 1: code fences/inline. */
const CODE_RE = /```([\s\S]+?)```|`([^`]+?)`/g;
/* Regex de URL: http(s):// … ou www. … (até espaço/fim). */
const URL_RE = /((?:https?:\/\/|www\.)[^\s<>()]+[^\s<>().,!?;:'"])/g;

/**
 * Concatena `src` em `dst` sem spread. `dst.push(...src)` passa cada node como
 * ARGUMENTO, e um input hostil (milhares de marcadores → milhares de nodes)
 * chega no limite de argumentos do V8 e estoura com RangeError — a mesma classe
 * de crash que a pilha do parseInline tinha.
 */
function pushAll(dst: ReactNode[], src: ReactNode[]): void {
  for (const node of src) dst.push(node);
}

/* Marcadores de nível 3, em ordem de precedência (bold vence italic vence strike). */
const MARKERS: { re: RegExp; slot: "strong" | "em" | "strike"; el: "strong" | "em" | "span" }[] = [
  { re: /\*([^*\n]+?)\*/, slot: "strong", el: "strong" },
  { re: /_([^_\n]+?)_/, slot: "em", el: "em" },
  { re: /~([^~\n]+?)~/, slot: "strike", el: "span" },
];

/**
 * Tarefa da máquina de pilha do `parseInline`:
 *  - `text`  → segmentar esta substring no frame do topo
 *  - `open`  → abrir frame novo (os filhos do marcador vão pra ele)
 *  - `close` → fechar o frame e empacotá-lo no elemento do marcador
 */
type Task =
  | { kind: "text"; text: string; prefix: string }
  | { kind: "open" }
  | { kind: "close"; el: "strong" | "em" | "span"; className: string; key: string };

/**
 * Aplica bold/italic/strike sobre texto puro (sem code/links).
 * `prefix` torna as React keys estáveis e únicas por chamada (índice LOCAL),
 * sem depender de contador module-global.
 *
 * ⚠️ ITERATIVO de propósito — não voltar pra recursão. A versão recursiva gastava
 * um frame de pilha por marcador encontrado (o `after` recursionava com o resto
 * da string), então a profundidade era O(nº de marcadores): `"*a*".repeat(5000)`
 * — 15 KB, cabe folgado numa mensagem de WhatsApp (limite 65.536) — estourava com
 * `RangeError: Maximum call stack size exceeded`. Como este componente renderiza
 * conteúdo RECEBIDO (MessageBubble, ConversationListItem), isso era um DoS
 * persistido: a mensagem hostil derrubava a bolha e o item da lista, e reabrir a
 * conversa derrubava de novo. Aqui a pilha é heap (array `work`) — O(n) de
 * memória, zero de pilha de chamada.
 */
function parseInline(text: string, s: Slots, prefix: string): ReactNode[] {
  const root: ReactNode[] = [];
  // Frames abertos; o último é onde os nodes produzidos agora entram.
  const frames: ReactNode[][] = [root];
  // LIFO: as tarefas são empilhadas em ordem INVERSA pra sair em ordem de leitura.
  const work: Task[] = [{ kind: "text", text, prefix }];

  while (work.length) {
    const task = work.pop()!;

    if (task.kind === "open") {
      frames.push([]);
      continue;
    }

    if (task.kind === "close") {
      const children = frames.pop()!;
      const Tag = task.el;
      frames[frames.length - 1].push(
        <Tag key={task.key} className={task.className}>
          {children}
        </Tag>,
      );
      continue;
    }

    const current = frames[frames.length - 1];

    // Primeiro marcador que casa, na ordem de precedência.
    let mk: (typeof MARKERS)[number] | null = null;
    let m: RegExpExecArray | null = null;
    for (const candidate of MARKERS) {
      const found = candidate.re.exec(task.text);
      if (found && found.index !== undefined) {
        mk = candidate;
        m = found;
        break;
      }
    }

    // Sem marcadores → texto literal.
    if (!mk || !m) {
      if (task.text) current.push(task.text);
      continue;
    }

    const before = task.text.slice(0, m.index);
    const inner = m[1];
    const after = task.text.slice(m.index + m[0].length);
    const className =
      mk.slot === "strong" ? s.strong() : mk.slot === "em" ? s.em() : s.strike();

    // Ordem de saída desejada: before · <Tag>inner</Tag> · after.
    work.push({ kind: "text", text: after, prefix: `${task.prefix}-a` });
    work.push({
      kind: "close",
      el: mk.el,
      className,
      key: `${task.prefix}-${mk.slot}`,
    });
    work.push({ kind: "text", text: inner, prefix: `${task.prefix}-i` });
    work.push({ kind: "open" });
    work.push({ kind: "text", text: before, prefix: `${task.prefix}-b` });
  }

  return root;
}

/**
 * Segmenta texto puro extraindo URLs como <a>; o resto vai pro parseInline.
 * `prefix` deriva as keys de índices LOCAIS desta chamada.
 */
function parseLinksAndInline(text: string, s: Slots, prefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  URL_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(text)) !== null) {
    if (m.index > last) {
      pushAll(out, parseInline(text.slice(last, m.index), s, `${prefix}-${i}t`));
    }
    const raw = m[0];
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;
    out.push(
      <a
        key={`${prefix}-${i}link`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={s.link()}
      >
        {raw}
      </a>,
    );
    last = m.index + raw.length;
    i += 1;
  }
  if (last < text.length) {
    pushAll(out, parseInline(text.slice(last), s, `${prefix}-${i}t`));
  }
  return out;
}

/**
 * Nível 1: separa code spans (opacos) do resto. As React keys derivam de
 * índices LOCAIS (`prefix`), não de contador global.
 */
function parseMarkdown(source: string, s: Slots): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  CODE_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = CODE_RE.exec(source)) !== null) {
    if (m.index > last) {
      pushAll(out, parseLinksAndInline(source.slice(last, m.index), s, `${i}t`));
    }
    const codeContent = m[1] ?? m[2] ?? "";
    out.push(
      <code key={`${i}code`} className={s.code()}>
        {codeContent}
      </code>,
    );
    last = m.index + m[0].length;
    i += 1;
  }
  if (last < source.length) {
    pushAll(out, parseLinksAndInline(source.slice(last), s, `${i}t`));
  }
  return out;
}

/**
 * MarkdownText — renderiza markdown estilo WhatsApp já SANITIZADO.
 *
 * Porta de `ui-igreen-hub/src/components/MarkdownWrapper`, sem dependência de
 * `markdown-to-jsx`: parse manual para React nodes, então nenhum HTML cru é
 * interpretado (a sintaxe não suportada vira texto literal — seguro por design).
 *
 * `inline=false` (default) → `<p>` preservando quebras de linha (`pre-wrap`).
 * `inline=true` → `<span>` colapsando quebras (prévia truncável com line-clamp
 * do consumer).
 */
export function MarkdownText({
  children,
  inline = false,
  className,
}: MarkdownTextProps) {
  const styles = markdownTextStyles({ inline });

  // inline → colapsa quebras de linha (e espaços redundantes) num único espaço.
  const source = inline ? children.replace(/\s+/g, " ").trim() : children;

  const nodes = parseMarkdown(source, styles);
  const content = nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);

  if (inline) {
    return <span className={styles.root({ className })}>{content}</span>;
  }
  return <p className={styles.root({ className })}>{content}</p>;
}
