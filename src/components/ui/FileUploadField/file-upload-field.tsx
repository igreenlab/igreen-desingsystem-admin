import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { fileUploadFieldStyles } from "./file-upload-field.styles";
import type {
  FileUploadFieldProps,
  FileUploadPreview,
} from "./file-upload-field.types";

/** Decide se o value deve ser exibido como imagem (thumbnail) ou como chip de arquivo. */
function resolveIsImage(
  value: File | string,
  preview: FileUploadPreview,
  accept?: string,
): boolean {
  if (preview === "image") return true;
  if (preview === "file") return false;
  // auto — infere por MIME (File) ou por accept (URL string)
  if (value instanceof File) return value.type.startsWith("image/");
  if (accept) return /image\//.test(accept) || /\.(png|jpe?g|gif|webp|svg|avif)/i.test(accept);
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value);
}

/** Valida tipo contra `accept` (suporta `image/*`, `image/png`, `.pdf`). */
function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return tokens.some((token) => {
    if (!token) return false;
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return mime.startsWith(token.slice(0, token.length - 1));
    return mime === token;
  });
}

/**
 * FileUploadField — captura de UM arquivo (dumb: só captura File + preview).
 * O consumidor é responsável pelo upload. Composto de FormField + Button + Chip + Icon.
 *
 * - Estado VAZIO (`value == null`): dropzone `<button>` que abre o seletor nativo.
 * - Estado COM-ARQUIVO: preview (thumbnail de imagem ou Chip de arquivo) + remover.
 * - Rejeição por tipo/tamanho: arquivo NÃO vira value; dispara `onError("type"|"size")`.
 *
 * A11y: dropzone é `<button>` (Enter/Space abrem o seletor); input file hidden
 * com id linkado ao FormField; thumbnail com `alt`; remover icon-only com aria-label.
 * Drag & drop é fase 2 (não implementado — API preservada).
 */
export function FileUploadField({
  value,
  onChange,
  accept,
  maxSizeMB,
  preview = "auto",
  fileName,
  label,
  required,
  state,
  errorMessage,
  helperText,
  onError,
  disabled,
  id,
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = fileUploadFieldStyles({ disabled });

  // Object URL pra preview de File (revogado ao trocar/desmontar).
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setObjectUrl(null);
    return undefined;
  }, [value]);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFiles = (file: File | undefined) => {
    if (!file) return;
    if (!matchesAccept(file, accept)) {
      onError?.("type");
      resetInput();
      return;
    }
    if (maxSizeMB != null && file.size > maxSizeMB * 1024 * 1024) {
      onError?.("size");
      resetInput();
      return;
    }
    onChange(file);
  };

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange(null);
    resetInput();
  };

  const hint = [
    accept ? accept : null,
    maxSizeMB != null ? `máx. ${maxSizeMB}MB` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const displayName =
    value instanceof File ? value.name : (fileName ?? "Arquivo");
  const isImage = value != null && resolveIsImage(value, preview, accept);
  const imageSrc = value instanceof File ? objectUrl : (value as string | null);

  return (
    <FormField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      helperText={helperText}
      className={className}
      id={id}
      disabled={disabled}
    >
      {({ id: fieldId }) => (
        <div>
          <input
            ref={inputRef}
            id={fieldId}
            type="file"
            accept={accept}
            disabled={disabled}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files?.[0])}
          />

          {value == null ? (
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled}
              aria-label={label ? `${label}: clique para anexar` : "Clique para anexar"}
              className={styles.dropzone()}
            >
              <Icon name="line-cloud-upload" size="lg" className={styles.dropIcon()} />
              <span className={styles.dropText()}>Clique para anexar</span>
              {hint && <span className={styles.dropHint()}>{hint}</span>}
            </button>
          ) : (
            <div className={styles.fileRow()}>
              {isImage && imageSrc ? (
                <img src={imageSrc} alt={displayName} className={styles.thumb()} />
              ) : (
                <div className={styles.fileChipWrap()}>
                  <Chip color="neutral" variant="soft" size="lg" className="max-w-full">
                    <Icon name="line-file" size="sm" />
                    <span className={styles.fileName()}>{displayName}</span>
                  </Chip>
                </div>
              )}
              <div className={styles.removeWrap()}>
                <Button
                  type="button"
                  color="critical"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label="Remover arquivo"
                  onClick={handleRemove}
                >
                  <Icon name="line-bin" size="sm" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </FormField>
  );
}
