import { useState } from "react";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../shadcn/popover";
import { Separator } from "../../shadcn/separator";
import { messageVariablesPickerStyles } from "./message-variables-picker.styles";
import {
  DEFAULT_MESSAGE_VARIABLES,
  type MessageVariablesPickerProps,
} from "./message-variables-picker.types";

/**
 * MessageVariablesPicker — picker de variáveis `{{...}}` que emite `onSelect(token)`.
 *
 * NÃO contém o textarea — o consumer é responsável por inserir o token no cursor.
 * Composto a partir de Popover (mobileSheet), Button, Chip, Icon e Separator do DS.
 *
 * @example
 * <MessageVariablesPicker onSelect={(t) => insertAtCursor(t)} />
 */
export function MessageVariablesPicker({
  onSelect,
  variables = DEFAULT_MESSAGE_VARIABLES,
  label = "Variáveis",
  triggerVariant = "icon",
  open: openProp,
  onOpenChange,
  closeOnSelect = true,
  size = "sm",
  className,
  disabled,
}: MessageVariablesPickerProps) {
  const styles = messageVariablesPickerStyles({ size });

  const [openState, setOpenState] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openState;

  const setOpen = (next: boolean) => {
    if (!isControlled) setOpenState(next);
    onOpenChange?.(next);
  };

  const handleSelect = (token: string) => {
    onSelect(token);
    if (closeOnSelect) setOpen(false);
  };

  const buttonSize = triggerVariant === "icon" ? (size === "md" ? "icon-md" : "icon-sm") : size;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button
            type="button"
            color="primary"
            variant="ghost"
            size={buttonSize}
            disabled={disabled}
            className={className}
            aria-label="Inserir variável"
            aria-haspopup="dialog"
          >
            <Icon name="line-code" />
          </Button>
        ) : (
          <Button
            type="button"
            color="primary"
            variant="ghost"
            size={buttonSize}
            disabled={disabled}
            className={className}
            aria-haspopup="dialog"
            iconLeft={<Icon name="line-code" />}
          >
            {label}
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} mobileSheet>
        <div className={styles.content()}>
          {variables.length > 0 && (
            <>
              <span className={styles.header()}>Variáveis disponíveis</span>
              <Separator />
            </>
          )}

          {variables.length === 0 ? (
            <span className={styles.empty()}>Nenhuma variável disponível</span>
          ) : (
            <div className={styles.list()}>
              {variables.map((variable) => (
                <Chip
                  key={variable.token}
                  color="primary"
                  variant="soft"
                  size="sm"
                  asButton
                  aria-label={`Inserir ${variable.label}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(variable.token)}
                >
                  {variable.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
