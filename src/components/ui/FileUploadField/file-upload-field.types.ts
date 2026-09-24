import type { FieldState } from "@/components/ui/FormField";

/** Modo de preview do arquivo selecionado. `auto` infere por accept/MIME. */
export type FileUploadPreview = "image" | "file" | "auto";

/** Motivo da rejeição de um arquivo (não vira value). */
export type FileUploadError = "type" | "size";

export interface FileUploadFieldProps {
  /**
   * Arquivo atual. `File` (recém-selecionado), `string` (URL já hospedada),
   * ou `null` (vazio). Componente é dumb: não faz upload, só captura/preview.
   */
  value: File | string | null;
  /** Callback ao selecionar (`File`) ou remover (`null`). */
  onChange: (file: File | null) => void;
  /** Filtro do seletor nativo + validação de tipo (ex: `"image/*"`, `".pdf,.png"`). */
  accept?: string;
  /** Tamanho máximo em MB. Arquivo acima é rejeitado via `onError("size")`. */
  maxSizeMB?: number;
  /** Modo de preview. `auto` (default) infere por `accept`/MIME do value. */
  preview?: FileUploadPreview;
  /** Nome exibido quando `value` é uma URL (string). */
  fileName?: string;
  /**
   * Textos da UI. Cada chave sobrescreve um literal em português que estava cravado no
   * componente — quem importa planilha em lote ("Selecionar CSV") tinha que aceitar
   * "Clique para anexar" ou recriar o campo. Só as chaves passadas mudam.
   */
  texts?: {
    /** Chamada na área de drop. Default: "Clique para anexar". */
    drop?: string;
    /** Nome mostrado quando `value` é string sem `fileName`. Default: "Arquivo". */
    fallbackFileName?: string;
    /** Nome acessível do botão de remover. Default: "Remover arquivo". */
    remove?: string;
    /**
     * Dica abaixo da chamada. Default: derivada de `accept` + `maxSizeMB`
     * — que é literalmente a lista de MIME types (`text/csv,application/vnd...`),
     * ilegível quando `accept` é longo. String vazia esconde a linha.
     */
    hint?: string;
  };
  /** Label do campo (renderizado pelo FormField). */
  label?: string;
  /** Marca como obrigatório (asterisco no label). */
  required?: boolean;
  /** Estado semântico — `error` pinta borda/mensagem do FormField. */
  state?: FieldState;
  /** Mensagem exibida quando `state="error"`. */
  errorMessage?: string;
  /** Texto auxiliar abaixo do campo. */
  helperText?: string;
  /** Chamado quando um arquivo é rejeitado por tipo ou tamanho. */
  onError?: (reason: FileUploadError) => void;
  /** Desabilita o campo (dropzone e remover). */
  disabled?: boolean;
  /** id do input (linka label↔input via htmlFor). */
  id?: string;
  /** className do container externo (FormField). */
  className?: string;
}
