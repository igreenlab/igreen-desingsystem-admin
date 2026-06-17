import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { ORDER } from "./order-mocks";
import { OverviewTab } from "./components/OverviewTab";
import { DetailsTab } from "./components/DetailsTab";
import { ActivityTab } from "./components/ActivityTab";
import { CommentsTab } from "./components/CommentsTab";
import { AttachmentsTab } from "./components/AttachmentsTab";

/**
 * OrderDetailScreen — conteúdo da página de detalhe de pedido consumindo o DS:
 * PageHeader (título + status + ações) + Tabs (Visão geral / Detalhes /
 * Atividade / Comentários / Anexos). Domínio iGreen (energia solar).
 *
 * Sem shell — embrulhe no seu AppShell/layout. O parent precisa dar altura
 * (h-full/flex) pro conteúdo preencher.
 */
export function OrderDetailScreen() {
  const [tab, setTab] = useState("overview");

  const order = ORDER;

  return (
    <div className="flex flex-col h-full min-h-0 gap-gp-2xl">
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
    </div>
  );
}

export default OrderDetailScreen;
