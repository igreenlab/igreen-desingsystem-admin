import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import { Textarea } from "@/components/shadcn/textarea";
import { Separator } from "@/components/shadcn/separator";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

import { messageComposerStyles } from "./message-composer.styles";
import type { MessageComposerProps } from "./message-composer.types";

/**
 * MessageComposer — shell DUMB do input de mensagem (Atendimento + Chat interno).
 *
 * Compõe `Textarea` (auto-grow) + `Button` (envio) + `Icon` (telegram) + `Separator`,
 * e expõe slots para emoji/anexo (`toolbarStart`), mic/extra (`toolbarEnd`), citação
 * (`replyPreview`), aviso (`banner`) e gravação (`recording`). NÃO embute lógica de
 * API/upload/emoji/áudio — só a moldura.
 *
 * Comportamento: Enter envia (`onSend`), Shift+Enter quebra linha. O `onKeyDown` do
 * consumer roda antes e pode chamar `preventDefault()` para suprimir o envio. O botão
 * de envio só habilita com `value.trim()` e fora de `disabled`/`sending`.
 *
 * O ref é encaminhado para a `<textarea>` interna (anchor para foco programático /
 * autosize externo). Em `state="read-only"` o campo some e só o `banner` aparece.
 */
export const MessageComposer = forwardRef<
  HTMLTextAreaElement,
  MessageComposerProps
>(function MessageComposer(
  {
    value,
    onChange,
    onSend,
    onKeyDown,
    placeholder,
    state = "open",
    size = "md",
    toolbarStart,
    toolbarEnd,
    replyPreview,
    banner,
    sending = false,
    recording,
    className,
  },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Auto-grow: zera a altura e cresce até max-h (limitado por CSS), permitindo encolher.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const isDisabled = state === "disabled";
  const isReadOnly = state === "read-only";
  const canSend = value.trim().length > 0 && !isDisabled && !sending;

  const styles = messageComposerStyles({ size, state });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className={styles.root({ className })}>
      {replyPreview ? (
        <div className={styles.replyPreview()}>{replyPreview}</div>
      ) : null}

      {banner ? <div className={styles.banner()}>{banner}</div> : null}

      {!isReadOnly && (
        <>
          {(replyPreview || banner) && <Separator />}
          <div className={styles.field()}>
            {toolbarStart ? (
              <div className={styles.toolbarStart()}>{toolbarStart}</div>
            ) : null}

            {recording ? (
              <div className={styles.recording()}>{recording}</div>
            ) : (
              <div className={styles.inputArea()}>
                <Textarea
                  ref={setRefs}
                  rows={1}
                  value={value}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  aria-label={placeholder ?? "Mensagem"}
                  className={styles.textarea()}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    onChange(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            {toolbarEnd ? (
              <div className={styles.toolbarEnd()}>{toolbarEnd}</div>
            ) : null}

            {!recording && (
              <Button
                type="button"
                size={size === "sm" ? "icon-sm" : "icon-md"}
                color="primary"
                variant="filled"
                loading={sending}
                disabled={!canSend}
                aria-label="Enviar mensagem"
                className={styles.send()}
                onClick={() => {
                  if (canSend) onSend();
                }}
              >
                <Icon name="line-telegram" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
});
