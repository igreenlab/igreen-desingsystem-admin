export interface MarkdownTextProps {
  /**
   * Texto-fonte em markdown estilo WhatsApp. Obrigatório.
   *
   * Sintaxe suportada:
   *   - `*bold*`    → negrito (font-semibold)
   *   - `_italic_`  → itálico
   *   - `~strike~`  → tachado
   *   - `` `mono` `` ou ```` ```mono``` ```` → monoespaçado com fundo sutil
   *   - URLs (`http://`, `https://`, `www.`) → link em nova aba
   *
   * O conteúdo é parseado para React nodes (sem `dangerouslySetInnerHTML`),
   * portanto qualquer HTML/markdown não suportado é renderizado como texto
   * literal — seguro contra injeção.
   */
  children: string;
  /**
   * `true` → renderiza em `<span>` e colapsa quebras de linha em espaço
   * (ideal para prévia de última mensagem truncável com `line-clamp` do
   * consumer). `false` (default) → renderiza em `<p>` preservando quebras.
   */
  inline?: boolean;
  /** className extra aplicado ao elemento raiz. */
  className?: string;
}
