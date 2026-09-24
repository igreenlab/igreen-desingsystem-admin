import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/30 supports-[backdrop-filter]:backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * Largura do conteúdo, na escala de modal do DS.
 *
 * A base era `sm:max-w-md`, que com a escala de container sobrescrita resolvia pra
 * 768px — um valor que ninguém tinha escolhido e que não aparecia em token nenhum.
 * O NOME estava errado; o tamanho, não. O default continua **768px**, agora dito em
 * voz alta (`modal-lg`), porque tokenizar não é motivo pra mudar o que a tela mostra.
 *
 * Prefira `size` a `className`: um `max-w-*` sem variante NÃO vence o `sm:` daqui —
 * são breakpoints diferentes, o tailwind-merge não funde, e a media query ganha acima
 * de 640px. Era isso que obrigava o consumidor a escrever `sm:max-w-modal-lg`.
 */
const DIALOG_SIZE = {
  sm: "sm:max-w-modal-sm", // 480px
  md: "sm:max-w-modal-md", // 640px
  lg: "sm:max-w-modal-lg", // 768px — default, a largura que o Dialog sempre teve
} as const;

export type DialogSize = keyof typeof DIALOG_SIZE;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Esconde o botão "X" (Close) no canto superior direito. Default: false. */
    hideClose?: boolean;
    /** Largura na escala de modal do DS: sm 480 · md 640 · lg 768 (default). */
    size?: DialogSize;
  }
>(({ className, children, hideClose, size = "lg", onPointerDownOutside, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onPointerDownOutside={(event) => {
        // O Radix só reconhece como "dentro" o clique que atravessa a árvore REACT deste
        // conteúdo. Popover/Select/DropdownMenu portalado que não é filho React dele chega
        // aqui como "fora" e fecharia o dialog no meio da interação.
        // Regressão: dialog-sheet-popper.test.tsx.
        if (
          event.target instanceof Element &&
          event.target.closest("[data-radix-popper-content-wrapper]")
        ) {
          event.preventDefault();
          return;
        }
        onPointerDownOutside?.(event);
      }}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-gp-4xl rounded-radius-base bg-bg-surface p-pad-4xl text-body-md text-fg-default shadow-sh-xl outline-float duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        // Teto de altura + rolagem interna: sem isto, conteúdo alto passa da tela e o
        // rodapé fica inalcançável. Mesma margem de viewport do `max-w` acima (não há
        // token pra ela); `dvh` por causa da barra do navegador no mobile.
        "max-h-[calc(100dvh-2rem)] overflow-y-auto",
        DIALOG_SIZE[size],
        className
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        // `right-4 top-4` (16px) e SEM caixa de 24px: a geometria que o Dialog sempre
        // teve. A #333 moveu pra `pad-4xl` (24px) + caixa centrada na 1ª linha do título,
        // alinhando o X ao padding do conteúdo — defensável, mas o X desceu e entrou 12px.
        // Revertido em 2026-09-23 comparando com o publicado: o ganho de alinhamento não
        // pagou a perda de compactação.
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-radius-sm opacity-70 transition-opacity hover:opacity-100 outline-none ring-0 ring-ring-brand focus-visible:ring-4 disabled:pointer-events-none data-[state=open]:bg-bg-muted data-[state=open]:text-fg-muted">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    // Sem reserva à direita, como sempre foi. A #333 pôs `pr-pad-6xl` (32px) pra o título
    // não correr por baixo do X — mas aplicava TAMBÉM com `hideClose`, onde não há X pra
    // justificar, e estreitar o título o faz quebrar antes: mais altura, que é o oposto
    // do que se queria.
    // ⚠️ Em troca, título de uma linha muito longo passa por baixo do X. Em 768px de
    // largura isso não acontece com título de tamanho normal; se acontecer, passe
    // `className="pr-pad-6xl"` no `DialogHeader`.
    className={cn("flex flex-col gap-gp-sm", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-gp-md sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    // `leading-none` (16px) em vez dos 24px do preset `title-md`: é a entrelinha que o
    // Dialog sempre teve, e são 8px a menos de header em TODO diálogo de título curto,
    // que é o caso comum.
    //
    // ⚠️ O preço, medido e aceito: título que quebra em DUAS linhas fica com as linhas
    // encostadas e colado na descrição — foi por isso que a #333 tirou o `leading-none`.
    // Se o seu título quebra, passe `className="leading-tight"` (20px) no `DialogTitle`.
    className={cn(
      "text-title-md font-medium text-fg-default leading-none",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body-md text-fg-muted", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
