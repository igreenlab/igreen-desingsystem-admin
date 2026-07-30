import { toast as sonnerToast, type ExternalToast } from "sonner";
import { ToastCard, type ToastCardProps } from "./toast-card";
import { type ToastStatus } from "./toast.styles";

/**
 * Opções do helper `toast` — props do card + opções nativas do Sonner
 * (duration, position, id). Tudo o que NÃO é do card cai no Sonner, então
 * agrupamento, slide, swipe e direções continuam nativos.
 */
export type ToastOptions = Omit<ToastCardProps, "toastId" | "status"> &
  Pick<ExternalToast, "duration" | "position" | "id">;

// Neutraliza a caixa visual do Sonner SÓ neste toast (mantém posicionamento +
// animação nativos — por isso NÃO usamos `unstyled`, que quebra o anchor bottom).
// O `!` vence a superfície tokenizada do <Toaster>. Nosso ToastCard é a superfície.
const STRIP_SONNER_BOX = {
  toast: "!bg-transparent !border-0 !p-0 !shadow-none",
} as const;

function show(opts: ToastOptions, status: ToastStatus) {
  const { duration, position, id, ...card } = opts;
  return sonnerToast.custom(
    (t) => <ToastCard {...card} status={status} toastId={t} />,
    { duration, position, id, classNames: STRIP_SONNER_BOX },
  );
}

/**
 * Dispara um toast do DS (card consistente sobre o Sonner).
 *
 * @example
 * toast.success({ title: "Alterações salvas", description: "Perfil atualizado." });
 * toast.error({ title: "Falha no upload", action: { label: "Tentar de novo", onClick } });
 * toast({ title: "3 mensagens novas", icon: <Mail />, meta: "agora" }); // neutro
 *
 * Métodos nativos do Sonner seguem disponíveis: `toast.promise`, `toast.dismiss`,
 * `toast.custom` (pra conteúdo 100% livre).
 */
/** Id que o Sonner devolve — derivado dele, não fixado à mão. */
type ToastId = ReturnType<typeof sonnerToast.custom>;

/**
 * Métodos do Sonner repassados sem alteração. Declarado com `Pick<typeof
 * sonnerToast, …>` de propósito: o retorno de `promise` referencia
 * `PromiseIExtendedResult`, que o Sonner **não exporta**. Sob inferência, o TS
 * precisa NOMEAR esse tipo na declaração e falha com **TS4023** — e o
 * `vite-plugin-dts` então **pula o arquivo em silêncio**, com o build saindo 0.
 * Resultado: `toast.d.ts` não era emitido, mas o `index.d.ts` reexportava dele →
 * `import { toast }` virava `any` pra quem consome via npm (L-017, achado pelo
 * `npm run lib:verify`). Com `Pick`, o tipo fica uma REFERÊNCIA ao export do módulo
 * e nada precisa ser nomeado.
 */
type SonnerPassthrough = Pick<
  typeof sonnerToast,
  "promise" | "dismiss" | "custom" | "loading"
>;

/** API pública do helper `toast` do DS. */
export interface ToastApi extends SonnerPassthrough {
  (opts: ToastOptions): ToastId;
  success(opts: ToastOptions): ToastId;
  error(opts: ToastOptions): ToastId;
  warning(opts: ToastOptions): ToastId;
  info(opts: ToastOptions): ToastId;
}

export const toast: ToastApi = Object.assign(
  (opts: ToastOptions) => show(opts, "default"),
  {
    success: (opts: ToastOptions) => show(opts, "success"),
    error: (opts: ToastOptions) => show(opts, "danger"),
    warning: (opts: ToastOptions) => show(opts, "warning"),
    info: (opts: ToastOptions) => show(opts, "info"),
    // passthrough nativo do Sonner
    promise: sonnerToast.promise,
    dismiss: sonnerToast.dismiss,
    custom: sonnerToast.custom,
    loading: sonnerToast.loading,
  },
);
