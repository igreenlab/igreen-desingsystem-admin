export type FooterTableProps = {
  /** Total de registros */
  totalCount: number;
  /** Página atual (1-indexed) */
  page: number;
  /** Linhas por página */
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  /** Opções do dropdown de page-size. Default: [10, 25, 50, 100]. */
  pageSizeOptions?: number[];

  /** Contagem de itens selecionados (opcional — exibe "· N selecionado") */
  selectionCount?: number;

  /** Label do select (default "Linhas") */
  pageSizeLabel?: string;
  /** Sufixo do range (ex "rows", "registros"). Default "rows" */
  rowLabel?: string;
  /** Locale pra formatar números (default "pt-BR") */
  locale?: string;

  /** Esconde o select de linhas/page (mantém só range + nav) */
  hidePageSize?: boolean;
  /** Esconde o "1–10 de 87 rows" */
  hideRange?: boolean;
  /** Esconde os botões « » (mantém só ‹ ›) */
  hideFirstLast?: boolean;

  /** className extra no <footer> */
  className?: string;
};
