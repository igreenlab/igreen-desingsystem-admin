import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * GuidedTour — motor de onboarding/product-tour DS-native (showcase-only).
 *
 * Spotlight via box-shadow (recorta o alvo do scrim) + balão no padrão flutuante
 * do DS (L-040: bg-dropdown frosted + border-default + radius 12 + shadow-lg).
 * Passos são resolvidos por seletor(es) contra um container (scopeRef); alvo não
 * encontrado → balão centralizado (degradação graciosa, nunca quebra).
 */

export type TourStep = {
  /** Seletor CSS, lista de fallbacks, ou resolver. Resolve dentro do scopeRef. */
  target: string | string[] | (() => Element | null);
  title: string;
  body: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  /** Roda ao entrar no passo (ex.: revelar bulk bar selecionando uma linha). */
  onEnter?: (scope: HTMLElement | null) => void;
  /** Roda ao sair do passo (desfaz o onEnter). */
  onLeave?: (scope: HTMLElement | null) => void;
  /** Padding do recorte do spotlight (px). Default 8. */
  padding?: number;
  /** Não faz scrollIntoView ao entrar (ex.: passo de popover já visível). */
  noScroll?: boolean;
};

type Rect = { top: number; left: number; width: number; height: number };

const BALLOON_W = 340;
const GAP = 14;

function resolveTarget(
  target: TourStep["target"],
  scope: HTMLElement | null,
): Element | null {
  const root: ParentNode = scope ?? document;
  if (typeof target === "function") return target();
  const list = Array.isArray(target) ? target : [target];
  for (const sel of list) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export function GuidedTour({
  steps,
  open,
  onClose,
  scopeRef,
}: {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
  scopeRef?: React.RefObject<HTMLElement | null>;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [balloonSize, setBalloonSize] = useState({ w: BALLOON_W, h: 180 });
  const balloonRef = useRef<HTMLDivElement>(null);
  const prevIndexRef = useRef(-1);

  const step = steps[index];
  const total = steps.length;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const close = useCallback(() => {
    step?.onLeave?.(scopeRef?.current ?? null);
    prevIndexRef.current = -1;
    setIndex(0);
    onClose();
  }, [onClose, step, scopeRef]);

  const go = useCallback(
    (dir: 1 | -1) => {
      if ((dir === 1 && isLast) || (dir === -1 && isFirst)) return;
      setIndex((i) => Math.min(Math.max(i + dir, 0), total - 1));
    },
    [isFirst, isLast, total],
  );

  // reset ao abrir
  useEffect(() => {
    if (open) {
      setIndex(0);
      prevIndexRef.current = -1;
    }
  }, [open]);

  // onEnter/onLeave ao trocar de passo
  useEffect(() => {
    if (!open || !step) return;
    const scope = scopeRef?.current ?? null;
    step.onEnter?.(scope);
    return () => step.onLeave?.(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // mede alvo + reposiciona (troca de passo, scroll, resize)
  useLayoutEffect(() => {
    if (!open || !step) return;
    const scope = scopeRef?.current ?? null;

    const measure = () => {
      const el = resolveTarget(step.target, scope);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          return;
        }
      }
      setRect(null); // fallback: balão centralizado
    };

    // scroll o alvo pra viewport ao entrar no passo (pulado em passos de popover)
    if (prevIndexRef.current !== index) {
      prevIndexRef.current = index;
      if (!step.noScroll) {
        const el = resolveTarget(step.target, scope);
        el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }

    measure();
    // retry: o alvo pode não ter renderizado ainda (auto-open no mount, troca de view).
    const ids = [150, 350, 650, 1000, 1500, 2200].map((ms) =>
      window.setTimeout(measure, ms),
    );
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ids.forEach(window.clearTimeout);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, step]);

  // mede o balão
  useLayoutEffect(() => {
    if (balloonRef.current) {
      const r = balloonRef.current.getBoundingClientRect();
      setBalloonSize({ w: r.width, h: r.height });
    }
  }, [index, rect]);

  // teclado
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // se há um popover/menu (não-tour) aberto, deixa o Esc fechá-lo primeiro
        if (
          document.querySelector(
            '[role="dialog"]:not([aria-label="Tour guiado"]), [role="menu"]',
          )
        )
          return;
        close();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, go]);

  if (!open || !step) return null;

  const pad = step.padding ?? 8;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // posição do balão
  let balloonTop: number;
  let balloonLeft: number;
  if (rect) {
    const placement = step.placement ?? "bottom";
    const cx = rect.left + rect.width / 2;
    if (placement === "top") {
      balloonTop = rect.top - pad - GAP - balloonSize.h;
      balloonLeft = cx - balloonSize.w / 2;
    } else if (placement === "left") {
      balloonTop = rect.top + rect.height / 2 - balloonSize.h / 2;
      balloonLeft = rect.left - pad - GAP - balloonSize.w;
    } else if (placement === "right") {
      balloonTop = rect.top + rect.height / 2 - balloonSize.h / 2;
      balloonLeft = rect.left + rect.width + pad + GAP;
    } else {
      balloonTop = rect.top + rect.height + pad + GAP;
      balloonLeft = cx - balloonSize.w / 2;
    }
    // auto-flip vertical se estourar
    if (balloonTop + balloonSize.h > vh - 8)
      balloonTop = rect.top - pad - GAP - balloonSize.h;
    if (balloonTop < 8) balloonTop = rect.top + rect.height + pad + GAP;
    balloonLeft = Math.min(Math.max(balloonLeft, 8), vw - balloonSize.w - 8);
    balloonTop = Math.min(Math.max(balloonTop, 8), vh - balloonSize.h - 8);
  } else {
    balloonTop = vh / 2 - balloonSize.h / 2;
    balloonLeft = vw / 2 - balloonSize.w / 2;
  }

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* catcher — bloqueia interação com a página durante o tour */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {/* spotlight: box-shadow gigante cria o scrim; recorte no alvo */}
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-radius-base border-[3px] border-border-brand ring-4 ring-ring-primary transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[rgba(0,0,0,0.55)]" />
      )}

      {/* balão */}
      <div
        ref={balloonRef}
        className={cn(
          "absolute w-[340px] max-w-[calc(100vw-16px)] p-pad-3xl",
          "bg-bg-dropdown border border-border-default rounded-[12px] shadow-sh-lg outline-float",
          "before:absolute before:inset-0 before:-z-10 before:rounded-[12px] before:backdrop-blur-2xl",
          "flex flex-col gap-gp-lg",
        )}
        style={{ top: balloonTop, left: balloonLeft }}
      >
        <div className="flex items-start justify-between gap-gp-md">
          <span className="text-caption-md font-semibold text-fg-brand tabular-nums">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Pular tour"
            className="text-fg-muted hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary rounded-radius-sm"
          >
            <X className="size-icon-sm" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-gp-xs">
          <h3 className="text-title-sm font-semibold text-fg-default">{step.title}</h3>
          <div className="text-body-sm text-fg-muted [&_code]:text-code-sm [&_code]:text-fg-brand">
            {step.body}
          </div>
        </div>

        <div className="flex items-center justify-between gap-gp-md pt-gp-xs">
          <Button variant="ghost" color="secondary" size="sm" onClick={close}>
            Pular
          </Button>
          <div className="flex items-center gap-gp-sm">
            {!isFirst && (
              <Button variant="outline" color="secondary" size="sm" onClick={() => go(-1)}>
                <ArrowLeft className="size-icon-sm" aria-hidden="true" />
                Voltar
              </Button>
            )}
            <Button
              variant="filled"
              color="primary"
              size="sm"
              onClick={() => (isLast ? close() : go(1))}
            >
              {isLast ? "Finalizar" : "Próximo"}
              {!isLast && <ArrowRight className="size-icon-sm" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
