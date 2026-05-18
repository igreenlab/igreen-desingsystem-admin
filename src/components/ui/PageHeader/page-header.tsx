import { cn } from "@/lib/utils";
import { pageHeaderStyles } from "./page-header.styles";
import type { PageHeaderProps } from "./page-header.types";

/**
 * PageHeader — bloco de título reutilizável colocado dentro do body do
 * `<AppShell>`. Cobre o caso comum:
 *
 *   - Título (h1) + descrição (sub) + badge (chip ao lado)
 *   - Slot de ações à direita (botões / dropdowns)
 *   - Slot livre abaixo pra tabs, filtros ou qualquer conteúdo extra
 *
 * Mobile-ready por default:
 *   - Title/description/badge somem em viewports pequenas
 *     (Header global do AppShell já mostra title/breadcrumb)
 *   - O último botão do `actions` vira fluid (CTA full-width)
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Clientes"
 *   description="Gerencie sua base de clientes."
 *   badge={<Chip color="primary" variant="soft">87 registros</Chip>}
 *   actions={
 *     <>
 *       <Button variant="outline" size="icon-md"><MoreHorizontal /></Button>
 *       <Button variant="filled" color="primary">Novo cliente</Button>
 *     </>
 *   }
 * />
 * ```
 *
 * @example com tabs abaixo (slot children):
 * ```tsx
 * <PageHeader title="Configurações" actions={<Button>Salvar</Button>}>
 *   <Tabs ... />
 * </PageHeader>
 * ```
 */
export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  hideTextOnMobile = true,
  fluidPrimaryOnMobile = true,
  className,
}: PageHeaderProps) {
  const s = pageHeaderStyles({
    hideTextOnMobile,
    mobileFluid: fluidPrimaryOnMobile,
  });

  const hasText = !!(title || description || badge);
  const hasTopRow = hasText || !!actions;

  return (
    <header className={cn(s.root(), className)}>
      {hasTopRow && (
        <div className={s.topRow()}>
          {hasText && (
            <div className={s.textCol()}>
              {(title || badge) && (
                <div className={s.titleRow()}>
                  {title && <h1 className={s.title()}>{title}</h1>}
                  {badge}
                </div>
              )}
              {description && <p className={s.description()}>{description}</p>}
            </div>
          )}
          {actions && <div className={s.actionsRow()}>{actions}</div>}
        </div>
      )}
      {children && <div className={s.extraRow()}>{children}</div>}
    </header>
  );
}

PageHeader.displayName = "PageHeader";
