import * as React from "react";
import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster (Sonner) — notificações/toasts. Tokenizado iGreen: surface +
 * border-default + shadow-lg, texto via tokens fg.
 * Status (success/warning/error/info) tinge ÍCONE + FUNDO + BORDA via tokens
 * semânticos — o feedback ganha peso real, não só o ícone. Usa o `richColors`
 * do Sonner (regras de alta especificidade por data-type) alimentado pelas CSS
 * vars `--{status}-bg/border/text`, mapeadas pros tokens DS. O fundo é um tint
 * SÓLIDO sobre o surface (`color-mix` com o token de status) — legível e
 * automático em light/dark (o surface troca por tema), texto fica fg-default.
 * Self-contained: segue o tema observando a classe `.dark` no <html>
 * (não depende de next-themes nem de hook externo — portável no copy-in).
 *
 * Monte UMA vez no root da app (`<Toaster />`) e dispare com
 * `toast.success("...")` / `toast.error(...)` etc. do pacote `sonner`.
 */

/** tint sólido: <pct>% do token de status sobre o surface (resolve por tema). */
const tint = (statusVar: string, pct = 14) =>
  `color-mix(in oklch, var(${statusVar}) ${pct}%, var(--color-bg-surface))`;

const statusVars = {
  "--normal-bg": "var(--color-bg-surface)",
  "--normal-border": "var(--color-border-default)",
  "--normal-text": "var(--color-fg-default)",
  "--success-bg": tint("--color-bg-success"),
  "--success-border": "var(--color-border-success-muted)",
  "--success-text": "var(--color-fg-default)",
  "--info-bg": tint("--color-bg-info"),
  "--info-border": "var(--color-border-info-muted)",
  "--info-text": "var(--color-fg-default)",
  "--warning-bg": tint("--color-bg-warning"),
  "--warning-border": "var(--color-border-warning-muted)",
  "--warning-text": "var(--color-fg-default)",
  "--error-bg": tint("--color-bg-danger"),
  "--error-border": "var(--color-border-danger-muted)",
  "--error-text": "var(--color-fg-default)",
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  const [isDark, setIsDark] = React.useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      richColors
      className="toaster group"
      style={statusVars}
      icons={{
        success: <CircleCheck className="size-icon-sm text-fg-success" />,
        info: <Info className="size-icon-sm text-fg-info" />,
        warning: <TriangleAlert className="size-icon-sm text-fg-warning" />,
        error: <OctagonX className="size-icon-sm text-fg-danger" />,
        loading: (
          <LoaderCircle className="size-icon-sm animate-spin text-fg-muted" />
        ),
      }}
      toastOptions={{
        classNames: {
          // bg/borda/texto (normal + por status) vêm das CSS vars em `statusVars`
          // via richColors; aqui só shadow + raio herdado do Sonner.
          toast: "group toast group-[.toaster]:shadow-sh-lg",
          description: "group-[.toast]:text-fg-muted",
          actionButton:
            "group-[.toast]:bg-bg-brand group-[.toast]:text-fg-on-brand",
          cancelButton:
            "group-[.toast]:bg-bg-muted group-[.toast]:text-fg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
