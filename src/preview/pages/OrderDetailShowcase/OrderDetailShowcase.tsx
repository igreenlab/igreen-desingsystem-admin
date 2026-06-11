import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
  APP_SHELL_LAYOUT_OPTIONS,
  APP_SHELL_USER,
} from "../../mocks/app-shell-mocks";
import { ORDER } from "./order-mocks";
import { OverviewTab } from "./components/OverviewTab";
import { DetailsTab } from "./components/DetailsTab";
import { ActivityTab } from "./components/ActivityTab";
import { CommentsTab } from "./components/CommentsTab";
import { AttachmentsTab } from "./components/AttachmentsTab";

/**
 * OrderDetailShowcase — tela standalone (fullscreen, sem nav de docs) acessada
 * via `?app=order-detail`. Exemplo de página de detalhe de pedido consumindo o
 * DS: AppShell + PageHeader + Tabs (Visão geral / Detalhes / Atividade /
 * Comentários / Anexos). Domínio iGreen (energia solar).
 */
export default function OrderDetailShowcase() {
  const { theme, setTheme } = useTheme();
  const [layout, setLayout] = useState<string>("fluid");
  const [tab, setTab] = useState("overview");

  const order = ORDER;

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#atendimentos"
      breadcrumb={[{ label: "Pedidos" }, { label: `#${order.id}` }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => {},
        onMoreActions: () => {},
        onViewAll: () => {},
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => {},
        onExpand: () => {},
        onViewAll: () => {},
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
      user={APP_SHELL_USER}
      layout={layout}
      onLayoutChange={setLayout}
      layoutOptions={APP_SHELL_LAYOUT_OPTIONS}
      onSettings={() => {}}
      onLogout={() => {}}
    >
      <PageHeader
        title={`Pedido #${order.id}`}
        description={order.placedAt}
        hideTextOnMobile={false}
        badge={
          <span className="flex items-center gap-gp-sm">
            <Chip color="success" variant="soft" size="sm" shape="pill">
              Pago
            </Chip>
            <Chip color="info" variant="soft" size="sm" shape="pill">
              Enviado
            </Chip>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="md"
              iconLeft={<RotateCcw />}
            >
              Reabastecer
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="md"
              iconLeft={<Pencil />}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Mais ações"
            >
              <MoreHorizontal />
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Pedido anterior"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="icon-md"
              aria-label="Próximo pedido"
            >
              <ChevronRight />
            </Button>
          </>
        }
      >
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="comments">
              Comentários
              <Chip color="danger" variant="soft" size="sm" shape="pill">
                {order.comments.length}
              </Chip>
            </TabsTrigger>
            <TabsTrigger value="attachments">Anexos</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      {tab === "overview" && <OverviewTab order={order} />}
      {tab === "details" && <DetailsTab order={order} />}
      {tab === "activity" && <ActivityTab order={order} />}
      {tab === "comments" && <CommentsTab order={order} />}
      {tab === "attachments" && <AttachmentsTab order={order} />}
    </AppShell>
  );
}
