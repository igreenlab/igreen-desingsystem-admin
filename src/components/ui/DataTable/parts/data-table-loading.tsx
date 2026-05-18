/**
 * DataTableLoading — esqueleto de loading que simula a estrutura da tabela.
 *
 * Renderiza header bar + N rows com células fluidas que se distribuem em todas
 * as colunas — visualmente próximo da tabela final pra evitar layout shift quando
 * dados chegam. Cada cell tem placeholder bg-bg-muted animate-pulse com largura
 * relativa (50-90% da cell) pra parecer texto real.
 */
export type DataTableLoadingProps = {
  /** Quantas linhas fake renderizar. Default 10. */
  rows?: number;
  /** Quantas colunas fake renderizar. Default 6. */
  columns?: number;
};

export function DataTableLoading({
  rows = 10,
  columns = 6,
}: DataTableLoadingProps = {}) {
  // Pesos pra distribuir colunas (1 = base; 2 = duas vezes maior).
  // Primeira coluna mais estreita (ID/checkbox), segunda mais larga (nome),
  // demais variando. Repete o padrão se columns > 6.
  const widthPattern = [0.5, 1.5, 1.4, 1.2, 1, 0.9];
  // Larguras INTERNAS da placeholder dentro da cell (% — varia pra parecer texto)
  const innerPattern = [70, 85, 75, 60, 80, 65];

  return (
    <div
      role="status"
      aria-label="Carregando dados"
      aria-busy="true"
      // Mesmo container do Table primitivo (table.styles.ts → root) — garante
      // que skeleton tenha bordas, radius e shadow idênticos ao estado loaded,
      // evitando o "salto visual" quando dados chegam (quadrado → arredondado).
      className="flex flex-col w-full bg-bg-table border border-border-table rounded-radius-xl shadow-sh-sm overflow-hidden"
    >
      {/* Header fake — barra mais escura simulando o head da tabela */}
      <div className="flex w-full h-[42px] items-center px-pad-2xl gap-gp-2xl border-b border-border-table bg-bg-table-head">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div
            key={colIdx}
            className="flex-1 min-w-0"
            style={{ flex: widthPattern[colIdx % widthPattern.length] }}
          >
            <div
              className="h-3 rounded-radius-sm bg-bg-muted animate-pulse"
              style={{ width: `${innerPattern[colIdx % innerPattern.length]}%` }}
            />
          </div>
        ))}
      </div>

      {/* Body rows fake */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex w-full h-[56px] items-center px-pad-2xl gap-gp-2xl border-b border-border-table last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => {
            // Variacao pseudo-random estavel pra evitar todas linhas identicas
            const seed = (rowIdx * 31 + colIdx * 17) % 100;
            const width = 40 + ((seed * 1.5) % 50); // 40-90%
            return (
              <div
                key={colIdx}
                className="flex-1 min-w-0"
                style={{ flex: widthPattern[colIdx % widthPattern.length] }}
              >
                <div
                  className="h-form-sm rounded-radius-md bg-bg-muted animate-pulse"
                  style={{
                    width: `${width}%`,
                    animationDelay: `${(rowIdx * 60 + colIdx * 30) % 600}ms`,
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
