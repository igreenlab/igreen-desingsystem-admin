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
 * border-default + shadow-lg, texto via tokens fg, ícones por status.
 * Self-contained: segue o tema observando a classe `.dark` no <html>
 * (não depende de next-themes nem de hook externo — portável no copy-in).
 *
 * Monte UMA vez no root da app (`<Toaster />`) e dispare com
 * `toast.success("...")` / `toast.error(...)` etc. do pacote `sonner`.
 */
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
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-icon-sm" />,
        info: <Info className="size-icon-sm" />,
        warning: <TriangleAlert className="size-icon-sm" />,
        error: <OctagonX className="size-icon-sm" />,
        loading: <LoaderCircle className="size-icon-sm animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-bg-surface group-[.toaster]:text-fg-default group-[.toaster]:border-border-default group-[.toaster]:shadow-sh-lg",
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
