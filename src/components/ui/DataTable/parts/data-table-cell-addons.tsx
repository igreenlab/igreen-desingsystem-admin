import { useCallback, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/shadcn/popover";
import { cellAddonsStyles } from "./data-table-cell-addons.styles";

const styles = cellAddonsStyles();

/* ── Read-more ──────────────────────────────────────────────────────── */

export type ReadMoreConfig = {
  /** Nº de linhas antes de truncar. Default 1 (single-line + reticências). */
  lines?: number;
  /** Texto do gatilho. Default "Ler mais". */
  label?: string;
};

export type DataTableReadMoreCellProps = {
  /** Conteúdo renderizado (a célula base — string ou ReactNode). */
  children: ReactNode;
  /** Texto puro pro popover + acessibilidade. Default: deriva de `children` se string. */
  text?: string;
  config: ReadMoreConfig;
};

/**
 * Célula "Ler mais" — trunca o conteúdo (1 ou N linhas com reticências) e
 * revela o texto completo num popover ao clicar no gatilho. DS-equivalente do
 * `ReadMoreCell` legado (que usava tooltip NextUI): aqui usamos `Popover`.
 *
 * Só mostra o gatilho quando há texto; conteúdo vazio cai no truncate puro.
 */
export function DataTableReadMoreCell({
  children,
  text,
  config,
}: DataTableReadMoreCellProps) {
  const lines = config.lines ?? 1;
  const fullText =
    text ?? (typeof children === "string" ? children : undefined);
  const hasContent =
    fullText != null ? fullText.trim().length > 0 : children != null;

  const truncateNode =
    lines > 1 ? (
      <span
        className={styles.clamp()}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
        }}
      >
        {children}
      </span>
    ) : (
      <span className={styles.truncate()}>{children}</span>
    );

  if (!hasContent) {
    return <span className={styles.root()}>{truncateNode}</span>;
  }

  return (
    <span className={styles.root()}>
      {truncateNode}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={styles.readMoreBtn()}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {config.label ?? "Ler mais"}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.readMorePopover()}>{children}</div>
        </PopoverContent>
      </Popover>
    </span>
  );
}

/* ── Copy-cell ──────────────────────────────────────────────────────── */

/** Janela (ms) que o feedback "Copiado!" fica visível. */
const COPY_FEEDBACK_MS = 2000;

export type CopyableConfig = {
  /** Valor copiado pro clipboard. Default: texto da célula. */
  value?: string;
  /** aria-label do botão. Default "Copiar". */
  label?: string;
};

export type DataTableCopyCellProps = {
  children: ReactNode;
  /** Texto a copiar (resolvido pelo consumer ou derivado do value). */
  copyText: string;
  config: CopyableConfig;
};

/**
 * Célula copiável — ícone de copiar revelado no hover/focus da célula, com
 * feedback "Copiado!" (check) por ~2s. Usa `navigator.clipboard` (sem
 * dependência nova). Para o click no botão de borbulhar pra seleção/row click.
 */
export function DataTableCopyCell({
  children,
  copyText,
  config,
}: DataTableCopyCellProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = copyText ?? "";
      const done = () => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
      };
      // clipboard API moderna; fallback silencioso se indisponível (http/iframe).
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => {});
      } else {
        done();
      }
    },
    [copyText],
  );

  const hasContent = copyText != null && copyText.trim().length > 0;

  return (
    <span className={styles.root()}>
      <span className={styles.truncate()}>{children}</span>
      {hasContent && (
        <button
          type="button"
          className={styles.copyBtn()}
          aria-label={
            copied ? "Copiado!" : (config.label ?? "Copiar")
          }
          title={copied ? "Copiado!" : (config.label ?? "Copiar")}
          onClick={handleCopy}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {copied ? (
            <Check className="size-icon-xs text-fg-success" aria-hidden />
          ) : (
            <Copy className="size-icon-xs" aria-hidden />
          )}
        </button>
      )}
    </span>
  );
}
