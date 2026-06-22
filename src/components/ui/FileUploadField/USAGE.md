# FileUploadField — USAGE

Captura de **um** arquivo com preview. Componente **dumb**: só captura o `File` e
mostra preview — o **consumidor faz o upload**. Categoria: form / data-input.

Composto de `FormField` (label/estado/erro) + `Button` + `Chip` + `Icon` + `tv()`.

## Quando usar

- Anexar avatar, logo, comprovante, documento único em um formulário.
- Quando o upload é responsabilidade do consumer (envia o `File` pra API depois).
- Para **múltiplos** arquivos ou drag & drop, NÃO use este (single-file; D&D é fase 2).

## Import

```tsx
import { FileUploadField } from "@/components/ui/FileUploadField";
```

## Props essenciais

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `value` | `File \| string \| null` | — (req) | `File` recém-selecionado, `string` (URL hospedada) ou `null` (vazio) |
| `onChange` | `(file: File \| null) => void` | — (req) | Selecionar → `File`; remover → `null` |
| `accept` | `string` | — | Filtro do seletor + validação (`"image/*"`, `".pdf,.png"`) |
| `maxSizeMB` | `number` | — | Tamanho máximo; acima → rejeitado via `onError("size")` |
| `preview` | `"image" \| "file" \| "auto"` | `"auto"` | Modo de preview; `auto` infere por accept/MIME |
| `fileName` | `string` | — | Nome exibido quando `value` é uma URL |
| `label` | `string` | — | Label (renderizado pelo FormField) |
| `required` | `boolean` | — | Asterisco no label |
| `state` | `"default" \| "error" \| "warning" \| "success"` | `"default"` | Estado semântico do FormField |
| `errorMessage` | `string` | — | Mensagem quando `state="error"` |
| `helperText` | `string` | — | Texto auxiliar abaixo do campo |
| `onError` | `(reason: "type" \| "size") => void` | — | Disparado quando arquivo é rejeitado |
| `disabled` | `boolean` | — | Desabilita dropzone + remover |
| `id` | `string` | — | id do input (linka label↔input) |
| `className` | `string` | — | className do container (FormField) |

## Estados visuais

| value | Render |
|---|---|
| `null` | Dropzone `<button>` full-width (`min-h-form-xl`, dashed) com ícone + "Clique para anexar" + hint accept/maxSize |
| `File`/URL imagem | Row: thumbnail (`size-icon-2xl`, object-cover) + botão remover |
| `File`/URL arquivo | Row: Chip soft (ícone file + nome truncate) + botão remover |

## Exemplo mínimo

```tsx
const [file, setFile] = useState<File | null>(null);

<FileUploadField
  label="Comprovante"
  required
  value={file}
  onChange={setFile}
  accept="image/*,.pdf"
  maxSizeMB={5}
  onError={(reason) =>
    toast.error(reason === "size" ? "Arquivo muito grande" : "Tipo inválido")
  }
/>
```

### Editar registro existente (value como URL)

```tsx
<FileUploadField
  label="Logo"
  value={logoUrl}            // string (URL já hospedada)
  fileName="logo.png"
  onChange={(f) => setNewLogo(f)}  // null = remover, File = trocar
  accept="image/*"
  preview="image"
/>
```

## Gotchas / cuidados

- **Dumb component**: não envia nada à rede. O `onChange(File)` te dá o `File`;
  faça `FormData`/upload no consumer e persista a URL retornada.
- Arquivo rejeitado (tipo/tamanho) **não** vira `value` — só dispara `onError`.
  Para feedback visual no campo, controle `state="error"` + `errorMessage` no consumer.
- Preview de `File` usa `URL.createObjectURL` (revogado automaticamente). Para URL
  string, o `src` é o próprio value.
- Single-file: o input não tem `multiple`. Drag & drop é fase 2 (API preservada).
- A11y: dropzone é `<button>` (Enter/Space abrem o seletor); input file hidden com
  `id` do FormField; thumbnail tem `alt`; remover é icon-only com `aria-label`.

## Fonte de verdade

- Estilos: `file-upload-field.styles.ts` (tv())
- Lógica: `file-upload-field.tsx`
- Tipos: `file-upload-field.types.ts`
