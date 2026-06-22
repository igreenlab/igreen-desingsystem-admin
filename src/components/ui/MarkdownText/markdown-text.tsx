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
 * Aplica bold/italic/strike recursivamente sobre texto puro (sem code/links).
 * `prefix` torna as React keys estáveis e únicas por chamada (índice LOCAL),
 * sem depender de contador module-global.
 */
function parseInline(text: string, s: Slots, prefix: string): ReactNode[] {
  // Tenta casar o PRIMEIRO marcador de bold/italic/strike e divide em torno dele.
  const markers: { re: RegExp; slot: keyof Slots; el: "strong" | "em" | "span" }[] = [
    { re: /\*([^*\n]+?)\*/, slot: "strong", el: "strong" },
    { re: /_([^_\n]+?)_/, slot: "em", el: "em" },
    { re: /~([^~\n]+?)~/, slot: "strike", el: "span" },
  ];

  for (const { re, slot, el } of markers) {
    const m = re.exec(text);
    if (!m || m.index === undefined) continue;

    const before = text.slice(0, m.index);
    const inner = m[1];
    const after = text.slice(m.index + m[0].length);

    const Tag = el;
    const className =
      slot === "strong"
        ? s.strong()
        : slot === "em"
          ? s.em()
          : s.strike();

    return [
      ...parseInline(before, s, `${prefix}-b`),
      <Tag key={`${prefix}-${slot}`} className={className}>
        {parseInline(inner, s, `${prefix}-i`)}
      </Tag>,
      ...parseInline(after, s, `${prefix}-a`),
    ];
  }

  // Sem marcadores → texto literal.
  return text ? [text] : [];
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
      out.push(...parseInline(text.slice(last, m.index), s, `${prefix}-${i}t`));
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
    out.push(...parseInline(text.slice(last), s, `${prefix}-${i}t`));
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
      out.push(...parseLinksAndInline(source.slice(last, m.index), s, `${i}t`));
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
    out.push(...parseLinksAndInline(source.slice(last), s, `${i}t`));
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
