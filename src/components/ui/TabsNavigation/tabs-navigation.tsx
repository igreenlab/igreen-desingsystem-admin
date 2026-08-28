import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Circle, MoreHorizontal, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { TabsNavigationContext } from "./tabs-navigation-context";
import {
  tabsNavigationTab,
  tabsNavigationAcao,
  tabsNavigationAcoes,
  tabsNavigationStatus,
  tabsNavigationControles,
  tabsNavigationDivisoria,
  tabsNavigationRoot,
  tabsNavigationTrilho,
} from "./tabs-navigation.styles";
import type {
  TabsNavigationTabProps,
  TabsNavigationPanelProps,
  TabsNavigationProps,
  TabsNavigationStatus,
} from "./tabs-navigation.types";

const STATUS_CONHECIDOS: TabsNavigationStatus[] = ["success", "warning", "danger", "info", "neutral"];
const ehStatusConhecido = (s: unknown): s is TabsNavigationStatus =>
  typeof s === "string" && (STATUS_CONHECIDOS as string[]).includes(s);

/* ─────────────────────────── peças de composição ─────────────────────────── */

/** Título da aba. Existe pra não obrigar ninguém a decorar `truncate text-body-sm`. */
export function TabsNavigationTitle({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={["block truncate text-body-sm", className ?? ""].join(" ")} {...rest}>
      {children}
    </span>
  );
}
TabsNavigationTitle.displayName = "TabsNavigation.Title";

/** Subtítulo — some sozinho quando a tira é `density="compact"`. */
export function TabsNavigationSubtitle({ children, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  const ctx = useContext(TabsNavigationContext);
  if (ctx?.density === "compact") return null;
  return (
    <span
      className={["block truncate text-caption-md text-fg-subtle", className ?? ""].join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
TabsNavigationSubtitle.displayName = "TabsNavigation.Subtitle";

/**
 * Ação inline da aba. 24px porque o menor `size="icon-*"` do `Button` é 32px e não cabe numa
 * aba de 40px sem espremer o título — é o mesmo motivo de o `+` da tira usar `Button` e este
 * não. `stopPropagation` embutido: clique na ação não pode selecionar a aba.
 */
export const TabsNavigationAction = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tom?: "neutro" | "success" | "danger" }
>(function TabsNavigationAction({ tom = "neutro", className, onClick, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={tabsNavigationAcao({ tom, className })}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...rest}
    />
  );
});
TabsNavigationAction.displayName = "TabsNavigation.Action";

/** Ações GLOBAIS da tira (busca, preferências) — ficam à direita, depois de uma divisória. */
export function TabsNavigationActions({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
TabsNavigationActions.displayName = "TabsNavigation.Actions";

/**
 * Painel de conteúdo — opcional. Só faz sentido quando o conteúdo mora DENTRO da árvore do
 * componente; quando mora fora (outra coluna, outra rota), use `panelId` na aba.
 */
export function TabsNavigationPanel({ value, children, className, ...rest }: TabsNavigationPanelProps) {
  const ctx = useContext(TabsNavigationContext);
  if (!ctx || ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      aria-labelledby={ctx.idTab(value)}
      tabIndex={0}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}
TabsNavigationPanel.displayName = "TabsNavigation.Panel";

/* ─────────────────────────────── a aba ─────────────────────────────── */

export const TabsNavigationTab = forwardRef<HTMLDivElement, TabsNavigationTabProps>(function TabsNavigationTab(
  {
    value,
    leading,
    status,
    badge,
    actions,
    onClose,
    menu,
    panelId,
    actionsAlwaysVisible = false,
    children,
    className,
    ...rest
  },
  ref,
) {
  const ctx = useContext(TabsNavigationContext);
  if (!ctx) throw new Error("<TabsNavigation.Tab> só funciona dentro de <TabsNavigation>.");

  const ativa = ctx.value === value;
  const temAcoesPadrao = !actions && typeof onClose === "function";
  const conteudoAcoes = actions ?? (temAcoesPadrao ? <AcoesPadrao onClose={onClose!} menu={menu} /> : null);

  return (
    <div
      ref={ref}
      role="tab"
      id={ctx.idTab(value)}
      data-value={value}
      aria-selected={ativa}
      aria-controls={panelId}
      /* Roving tabindex: só a aba ativa entra na ordem de tabulação; as vizinhas se alcançam
         pelas setas, que é o padrão ARIA de tablist. Sem isso, 12 abas viram 12 paradas de Tab
         antes do conteúdo. */
      tabIndex={ativa ? 0 : -1}
      onClick={() => ctx.onValueChange(value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          ctx.onValueChange(value);
        }
      }}
      className={tabsNavigationTab({
        density: ctx.density,
        fill: ctx.fill,
        surface: ctx.surface,
        ativa,
        className,
      })}
      {...rest}
    >
      {leading}

      <div className="min-w-0 flex-1">
        {status !== undefined ? (
          <div className="flex items-center gap-gp-sm">
            {ehStatusConhecido(status) ? (
              <Circle className={tabsNavigationStatus({ status })} aria-hidden />
            ) : (
              status
            )}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        ) : (
          children
        )}
      </div>

      {/* Badge some na aba ativa: o usuário está lendo, o contador não tem o que contar. */}
      {!ativa && badge !== undefined && badge !== null && badge !== 0 ? (
        typeof badge === "number" ? (
          <span
            className="inline-flex min-w-[18px] items-center justify-center rounded-radius-full bg-bg-brand px-pad-xs text-caption-sm font-semibold text-fg-on-brand"
            aria-hidden
          >
            {badge}
          </span>
        ) : (
          badge
        )
      ) : null}

      {conteudoAcoes ? (
        <div
          className={tabsNavigationAcoes({
            visivel: ativa || actionsAlwaysVisible || ctx.actionsMode === "persistent",
          })}
        >
          <div className="flex min-w-0 items-center gap-gp-2xs overflow-hidden">{conteudoAcoes}</div>
        </div>
      ) : null}
    </div>
  );
});
TabsNavigationTab.displayName = "TabsNavigation.Tab";

function AcoesPadrao({ onClose, menu }: { onClose: () => void; menu?: ReactNode }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <TabsNavigationAction aria-label="Opções da aba">
            <MoreHorizontal className="size-icon-sm" />
          </TabsNavigationAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[196px]">
          {menu}
          {menu ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            onSelect={onClose}
            className="text-fg-danger focus:bg-bg-danger-muted focus:text-fg-danger"
          >
            <X className="size-icon-sm" /> Fechar aba
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TabsNavigationAction aria-label="Fechar aba" onClick={onClose}>
        <X className="size-icon-sm" />
      </TabsNavigationAction>
    </>
  );
}

/* ──────────────────────────────── a tira ──────────────────────────────── */

/**
 * `TabsNavigation` — tira de abas de navegação, no estilo das abas de um navegador.
 *
 * ## O conteúdo mora onde você quiser
 *
 * O componente é **sempre controlado** e não hospeda o conteúdo: ele diz qual aba está ativa
 * (`value` / `onValueChange`) e o consumidor troca o que quiser, onde quiser — outra coluna,
 * outra rota, outro componente. Pra fechar a acessibilidade com o painel fora, dê `panelId` à
 * aba (vira `aria-controls`); com o painel dentro, use `<TabsNavigation.Panel>`.
 *
 * ## Composição, não configuração
 *
 * `leading`, `children`, `status`, `badge` e `actions` aceitam qualquer nó. `actions`
 * **substitui** as ações padrão — é por ele que entram ✓/✗ de aceitar/recusar um chamado, ou
 * cinco botões, ou nenhum.
 *
 * @example
 * <TabsNavigation value={id} onValueChange={setId} aria-label="Conversas abertas" onNewTab={abrir}>
 *   <TabsNavigation.Tab
 *     value="c1"
 *     leading={<Avatar size="sm" colorHex="#2563EB">MS</Avatar>}
 *     status="success"
 *     badge={3}
 *     panelId="painel"
 *     onClose={() => fechar("c1")}
 *   >
 *     <TabsNavigation.Title>Maria Silva</TabsNavigation.Title>
 *     <TabsNavigation.Subtitle>Fatura de julho</TabsNavigation.Subtitle>
 *   </TabsNavigation.Tab>
 * </TabsNavigation>
 */
export const TabsNavigationRoot = forwardRef<HTMLDivElement, TabsNavigationProps>(function TabsNavigation(
  {
    value,
    onValueChange,
    surface = "surface",
    density = "comfortable",
    fill = false,
    actionsMode = "hover",
    chrome = true,
    onNewTab,
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const prefixo = useId();
  const trilho = useRef<HTMLDivElement>(null);

  const ctx = useMemo(
    () => ({
      value,
      onValueChange,
      surface,
      density,
      fill,
      actionsMode,
      idTab: (v: string) => `${prefixo}-${v}`,
    }),
    [value, onValueChange, surface, density, fill, actionsMode, prefixo],
  );

  /** Separa as abas das ações globais: as duas coisas moram em lugares diferentes da tira. */
  const { abas, acoesGlobais } = useMemo(() => {
    const abas: ReactElement<TabsNavigationTabProps>[] = [];
    let acoesGlobais: ReactNode = null;
    for (const filho of Children.toArray(children)) {
      if (!isValidElement(filho)) continue;
      if (filho.type === TabsNavigationActions) acoesGlobais = filho;
      else abas.push(filho as ReactElement<TabsNavigationTabProps>);
    }
    return { abas, acoesGlobais };
  }, [children]);

  /**
   * Estado do overflow — três coisas, não uma: **se** transborda (mostra os controles) e se dá
   * pra rolar pra cada lado (habilita cada seta). Seta que não faz nada é pior que ausente.
   */
  const [rolagem, setRolagem] = useState({ transborda: false, esq: false, dir: false });

  const medir = useCallback(() => {
    const el = trilho.current;
    if (!el) return;
    // 1px de tolerância: os valores são inteiros arredondados e empatam por fração fora do
    // zoom 100% — sem isso a seta pisca em 110%.
    const max = el.scrollWidth - el.clientWidth;
    setRolagem({ transborda: max > 1, esq: el.scrollLeft > 1, dir: el.scrollLeft < max - 1 });
  }, []);

  /**
   * `ResizeObserver` no trilho e nos filhos, não `window.resize`: a tira também transborda
   * quando um painel ao lado abre ou a sidebar colapsa — nenhum desses dispara resize.
   */
  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    medir();
    // SSR / jsdom safe — mesmo guarda do `use-column-auto-width` do DataTable. Sem ele o
    // componente derruba a suíte de quem consome (jsdom não implementa ResizeObserver), e a
    // medição inicial + o `onScroll` já dão o comportamento básico.
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    for (const filho of Array.from(el.children)) ro.observe(filho);
    return () => ro.disconnect();
  }, [medir, abas.length]);

  /** Trocar de aba por fora (lista, teclado, aba nova) tem que trazer a aba pro campo de visão. */
  useEffect(() => {
    const el = trilho.current;
    const alvo = el?.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`);
    alvo?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });

    /**
     * O foco acompanha a seleção — mas SÓ quando já estava na tira. Sem a condição, o
     * componente roubaria o foco do usuário toda vez que o app trocasse de aba por conta
     * própria (uma notificação abrindo a conversa, uma rota mudando). Sem o foco, o leitor de
     * tela continua anunciando a aba antiga enquanto a tela mostra outra.
     */
    if (el?.contains(document.activeElement) && alvo !== document.activeElement) alvo?.focus();
  }, [value]);

  const rolar = (dir: -1 | 1) => trilho.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  /** Setas ←/→/Home/End: padrão ARIA de tablist, e o que faz o roving tabindex ter saída. */
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const valores = abas.map((a) => a.props.value);
    const i = valores.indexOf(value);
    if (i < 0) return;
    const proximo =
      e.key === "ArrowRight"
        ? valores[(i + 1) % valores.length]
        : e.key === "ArrowLeft"
          ? valores[(i - 1 + valores.length) % valores.length]
          : e.key === "Home"
            ? valores[0]
            : e.key === "End"
              ? valores[valores.length - 1]
              : null;
    if (!proximo) return;
    e.preventDefault();
    onValueChange(proximo);
    /* O foco vai junto — mas no efeito abaixo, não aqui: o componente é controlado, então na
       hora deste handler a aba nova ainda nem existe como ativa. A primeira versão usava
       `requestAnimationFrame`, e isso amarra o foco a haver FRAME: em ambiente que não compõe
       (o painel de automação, um teste headless) a seleção mudava e o foco ficava pra trás. */
  };

  const controles = tabsNavigationControles({ fill, density });

  return (
    <TabsNavigationContext.Provider value={ctx}>
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className={tabsNavigationRoot({
          fill,
          chrome,
          // em `fill` a aba vai de ponta a ponta: respiro no topo desmontaria justamente isso
          respiro: fill ? "nenhum" : density,
          className,
        })}
        {...rest}
      >
        {rolagem.transborda ? (
          <div className={`${controles} pr-pad-xs`}>
            <Button
              variant="ghost"
              color="secondary"
              size="icon-sm"
              aria-label="Abas anteriores"
              disabled={!rolagem.esq}
              onClick={() => rolar(-1)}
            >
              <ChevronLeft />
            </Button>
            <span aria-hidden className={tabsNavigationDivisoria({ fill })} />
          </div>
        ) : null}

        <div ref={trilho} onScroll={medir} className={tabsNavigationTrilho({ fill })}>
          {abas.map((aba, i) => {
            /* Divisória só entre DUAS inativas: ao lado da ativa ela encosta na borda e vira
               uma sombra falsa. É o que o navegador faz. */
            const vizinhaDaAtiva =
              aba.props.value === value || abas[i + 1]?.props.value === value;
            return (
              <div
                key={aba.props.value}
                className={["flex shrink-0", fill ? "items-stretch" : "items-end"].join(" ")}
              >
                {aba}
                {i < abas.length - 1 ? (
                  <span aria-hidden className={tabsNavigationDivisoria({ fill, oculta: vizinhaDaAtiva })} />
                ) : null}
              </div>
            );
          })}
        </div>

        {rolagem.transborda ? (
          <div className={`${controles} pl-pad-xs`}>
            <span aria-hidden className={tabsNavigationDivisoria({ fill })} />
            <Button
              variant="ghost"
              color="secondary"
              size="icon-sm"
              aria-label="Próximas abas"
              disabled={!rolagem.dir}
              onClick={() => rolar(1)}
            >
              <ChevronRight />
            </Button>
          </div>
        ) : null}

        {/* ⚠️ O `+` e a lista moram FORA do trilho de propósito: dentro, eles rolavam junto com
            as abas e sumiam da tela justamente quando havia abas demais — que é quando servem. */}
        {onNewTab || (rolagem.transborda && abas.length) || acoesGlobais ? (
          <div className={controles}>
            {onNewTab ? (
              <Button
                variant="ghost"
                color="secondary"
                size="icon-sm"
                aria-label="Abrir nova aba"
                onClick={onNewTab}
              >
                <Plus />
              </Button>
            ) : null}

            {/* A seta resolve "a vizinha"; ela não resolve "aquela ali". Por isso a lista — e
                só quando transborda: com 3 abas visíveis, um menu pra escolher entre 3 é ruído. */}
            {rolagem.transborda && abas.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="icon-sm"
                    aria-label={`Listar as ${abas.length} abas abertas`}
                  >
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="max-h-[320px] w-[264px] overflow-y-auto scrollbar-thin"
                >
                  <DropdownMenuLabel>{abas.length} abas abertas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {abas.map((aba) => {
                    const p = aba.props;
                    return (
                      <DropdownMenuItem
                        key={p.value}
                        onSelect={() => onValueChange(p.value)}
                        className={p.value === value ? "bg-bg-brand-subtle text-fg-brand" : undefined}
                      >
                        {ehStatusConhecido(p.status) ? (
                          <Circle className={tabsNavigationStatus({ status: p.status })} aria-hidden />
                        ) : null}
                        <span className="min-w-0 flex-1">{p.children}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {acoesGlobais ? (
              <>
                <span aria-hidden className={tabsNavigationDivisoria({ fill, className: "mx-pad-xs" })} />
                <div className="flex items-center gap-gp-2xs">{acoesGlobais}</div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </TabsNavigationContext.Provider>
  );
});

type TabsNavigationCompound = typeof TabsNavigationRoot & {
  Tab: typeof TabsNavigationTab;
  Title: typeof TabsNavigationTitle;
  Subtitle: typeof TabsNavigationSubtitle;
  Action: typeof TabsNavigationAction;
  Actions: typeof TabsNavigationActions;
  Panel: typeof TabsNavigationPanel;
};

export const TabsNavigation = Object.assign(TabsNavigationRoot, {
  Tab: TabsNavigationTab,
  Title: TabsNavigationTitle,
  Subtitle: TabsNavigationSubtitle,
  Action: TabsNavigationAction,
  Actions: TabsNavigationActions,
  Panel: TabsNavigationPanel,
}) as TabsNavigationCompound;
