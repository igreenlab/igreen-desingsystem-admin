import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cva } from "class-variance-authority";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * InputOTP — entrada de código (OTP/2FA), tokenizado iGreen.
 *
 * ## Irmão do `Input` de texto, por decisão (2026-08-18)
 *
 * O slot usa a MESMA superfície do `input.tsx`: `bg-bg-input dark:bg-bg-muted`,
 * `border-border-input`, e foco por **borda verde + `shadow-sh-ring`** — não por
 * `ring-4`. Os `size` e `state` são os mesmos 4 de cada, com os mesmos tokens
 * `form-*`, então um OTP e um campo de texto lado a lado têm altura idêntica.
 *
 *   size   xxs = 28px (form-xs) · xs = 32px (form-sm) · sm = 36px (form-md) · md = 40px (form-lg)
 *   state  default · error · warning · success   (mesmos tokens do Input)
 *
 * Antes disto o slot era `size-form-lg` cravado, sem bg, com `border-border-default`
 * e `ring-4 ring-ring-brand` no ativo — um campo de formulário que não parecia
 * com nenhum outro campo de formulário do DS.
 *
 * ## Variantes visuais
 *
 *   connected  slots colados, radius só nas pontas (DEFAULT — o look histórico)
 *   outlined   slots separados, borda e radius completos em cada
 *   filled     como outlined, com fundo e borda transparente
 *   underline  só a borda de baixo, sem fundo nem radius
 *
 * ## Por que `size`/`variant`/`state` vão por CONTEXTO e não por prop de slot
 *
 * O consumidor declara uma vez no root e os N slots herdam:
 *
 *     <InputOTP maxLength={6} size="sm" variant="outlined" state="error">
 *
 * A alternativa — repetir a prop em cada `<InputOTPSlot>` — erra silenciosamente
 * quando um slot fica de fora (fica de tamanho diferente no meio da fileira). O
 * `InputOTPGroup` também lê o contexto, porque `gap` e radius das pontas mudam
 * com a variante e são propriedade do GRUPO, não do slot.
 *
 * ⚠️ Não copie a receita do shadcn-studio (`className` no grupo com
 * `*:data-[slot=input-otp-slot]:rounded-lg`): ela usa Tailwind literal e
 * vocabulário da bridge (`bg-muted`), que não emitem CSS nos canais npm e
 * submódulo (L-039). Aqui a mesma capacidade vem por variante tokenizada.
 *
 * Composição: InputOTP > InputOTPGroup > InputOTPSlot (+ InputOTPSeparator).
 */

export type InputOTPVariant = "connected" | "outlined" | "filled" | "underline";
export type InputOTPSize = "xxs" | "xs" | "sm" | "md";
export type InputOTPState = "default" | "error" | "warning" | "success";

/* ── Contexto de estilo ──────────────────────────────────────────────── */

type InputOTPStyleCtx = {
  variant: InputOTPVariant;
  size: InputOTPSize;
  state: InputOTPState;
};

const DEFAULTS: InputOTPStyleCtx = {
  variant: "connected",
  size: "md",
  state: "default",
};

const InputOTPStyleContext = React.createContext<InputOTPStyleCtx>(DEFAULTS);

/* ── Slot ────────────────────────────────────────────────────────────── */

const slotVariants = cva(
  [
    "relative flex items-center justify-center",
    // Mesma superfície do input.tsx — ver o cabeçalho.
    "bg-bg-input dark:bg-bg-muted",
    "text-fg-default tabular-nums",
    "transition-[border-color,box-shadow,background-color] outline-none",
  ],
  {
    variants: {
      // Quadrado: a altura vem do MESMO token do Input, e a largura acompanha
      // pra o slot não virar retângulo. `size-form-*` = height e width juntos.
      size: {
        xxs: "size-form-xs text-body-sm",
        xs: "size-form-sm text-body-sm",
        sm: "size-form-md text-body-md",
        md: "size-form-lg text-body-md",
      },
      variant: {
        // Colados: cada slot desenha 3 lados; o 1º devolve a borda esquerda, e
        // as pontas recebem radius. Sem isso a fileira mostra borda dupla entre
        // slots vizinhos.
        connected: "border-y border-r first:border-l",
        outlined: "border",
        filled: "border border-transparent",
        // Sem fundo: a linha de baixo É o campo. `rounded-none` explícito
        // porque o radius das pontas do `connected` viria do grupo.
        underline: "border-0 border-b-2 rounded-none bg-transparent dark:bg-transparent",
      },
      // Cor de borda e anel de foco — os MESMOS pares do Input.
      state: {
        default: "border-border-input",
        error: "border-border-danger-muted",
        warning: "border-border-warning-muted",
        success: "border-border-success-muted",
      },
      /** Slot que o cursor está ocupando. O Radix não dá `:focus` aqui: o input
       *  real é único e invisível, então o "foco" é estado do contexto do
       *  `input-otp`, não do DOM. Daí ser variante e não `focus-visible:`. */
      active: { true: "z-10", false: "" },
    },
    compoundVariants: [
      // Foco = borda verde + anel, igual ao `focus-visible` do Input. Em erro/
      // aviso/sucesso a borda semântica MANDA (o usuário precisa continuar
      // vendo que o campo está inválido enquanto digita), e só o anel muda.
      { active: true, state: "default", class: "border-border-brand shadow-sh-ring" },
      { active: true, state: "error", class: "shadow-sh-ring-danger" },
      { active: true, state: "warning", class: "shadow-sh-ring-warning" },
      { active: true, state: "success", class: "shadow-sh-ring-success" },
      // Hover só onde há superfície pra reagir.
      { variant: "connected", class: "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover" },
      { variant: "outlined", class: "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover" },
      { variant: "filled", class: "bg-bg-muted dark:bg-bg-muted hover:bg-bg-muted-hover" },
    ],
    defaultVariants: { size: "md", variant: "connected", state: "default", active: false },
  },
);

/* ── Grupo ───────────────────────────────────────────────────────────── */

const groupVariants = cva("flex items-center", {
  variants: {
    variant: {
      // Colados: zero gap, e o radius das pontas é do GRUPO (o slot não sabe se
      // é primeiro/último de um grupo quando há mais de um grupo na tela).
      connected: "gap-0 [&>*:first-child]:rounded-l-radius-lg [&>*:last-child]:rounded-r-radius-lg",
      outlined: "gap-gp-md [&>*]:rounded-radius-lg",
      filled: "gap-gp-md [&>*]:rounded-radius-lg",
      underline: "gap-gp-md",
    },
    // Radius acompanha o size, como no Input: os dois menores usam radius-md.
    size: { xxs: "", xs: "", sm: "", md: "" },
  },
  compoundVariants: [
    { variant: "connected", size: "xxs", class: "[&>*:first-child]:rounded-l-radius-md [&>*:last-child]:rounded-r-radius-md" },
    { variant: "connected", size: "xs", class: "[&>*:first-child]:rounded-l-radius-md [&>*:last-child]:rounded-r-radius-md" },
    { variant: "outlined", size: "xxs", class: "[&>*]:rounded-radius-md" },
    { variant: "outlined", size: "xs", class: "[&>*]:rounded-radius-md" },
    { variant: "filled", size: "xxs", class: "[&>*]:rounded-radius-md" },
    { variant: "filled", size: "xs", class: "[&>*]:rounded-radius-md" },
  ],
  defaultVariants: { variant: "connected", size: "md" },
});

/* ── Root ────────────────────────────────────────────────────────────── */

/**
 * `Omit` que **distribui** sobre união. As props do `OTPInput` são uma união
 * discriminada (`render` XOR `children`), e `Omit<A | B, K>` colapsa a união num
 * objeto só — o discriminante se perde e o TS rejeita tanto `children` quanto
 * `render` (TS2322, "Type 'InputOTPRenderFn' is not assignable to 'undefined'").
 * Com `T extends any ? … : never` o Omit roda em cada membro e a união sobrevive.
 */
type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never;

/**
 * Tipo, não `interface`: `interface extends` também colapsa a união acima.
 *
 * O `size` nativo do `<input>` (numérico) é omitido pra ceder o nome à nossa
 * variante — é a mesma decisão do `input.tsx`, que faz
 * `Omit<InputHTMLAttributes, "size">`. Sem isso: TS2430, e a mensagem não aponta
 * a causa.
 */
export type InputOTPProps = DistributiveOmit<
  React.ComponentPropsWithoutRef<typeof OTPInput>,
  "size"
> & {
  /** Aparência dos slots. `connected` (default) = o look histórico do DS. */
  variant?: InputOTPVariant;
  /** Altura do slot, nos MESMOS tokens `form-*` do `Input`: 28/32/36/40px. */
  size?: InputOTPSize;
  /** Feedback de validação — mesmos pares de cor do `Input`. */
  state?: InputOTPState;
};

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, InputOTPProps>(
  ({ className, containerClassName, variant, size, state, ...props }, ref) => {
    const ctx = React.useMemo(
      () => ({
        variant: variant ?? DEFAULTS.variant,
        size: size ?? DEFAULTS.size,
        state: state ?? DEFAULTS.state,
      }),
      [variant, size, state],
    );

    return (
      <InputOTPStyleContext.Provider value={ctx}>
        {/* `children` NÃO é desestruturado de propósito: ele viaja dentro de
            `...props` pra preservar a união `render` XOR `children` do OTPInput.
            Extraí-lo e repassá-lo como children explícito reintroduz o TS2322. */}
        <OTPInput
          ref={ref}
          containerClassName={cn(
            "flex items-center gap-gp-md has-[:disabled]:opacity-50",
            containerClassName,
          )}
          className={cn("disabled:cursor-not-allowed", className)}
          {...(props as React.ComponentPropsWithoutRef<typeof OTPInput>)}
        />
      </InputOTPStyleContext.Provider>
    );
  },
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const { variant, size } = React.useContext(InputOTPStyleContext);
  return (
    <div ref={ref} className={cn(groupVariants({ variant, size }), className)} {...props} />
  );
});
InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  /** Override pontual. Em geral declare no `<InputOTP>` e deixe herdar. */
  variant?: InputOTPVariant;
  size?: InputOTPSize;
  state?: InputOTPState;
}

const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, InputOTPSlotProps>(
  ({ index, className, variant, size, state, ...props }, ref) => {
    const ctx = React.useContext(InputOTPStyleContext);
    const otp = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = otp.slots[index];

    return (
      <div
        ref={ref}
        data-slot="input-otp-slot"
        data-active={isActive ? "true" : undefined}
        className={cn(
          slotVariants({
            variant: variant ?? ctx.variant,
            size: size ?? ctx.size,
            state: state ?? ctx.state,
            active: isActive,
          }),
          className,
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-caret-blink bg-fg-default duration-1000" />
          </div>
        )}
      </div>
    );
  },
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("text-fg-muted", className)} {...props}>
    {children ?? <Dot />}
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, slotVariants };
