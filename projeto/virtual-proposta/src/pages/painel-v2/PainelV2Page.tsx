import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { EarningsHero } from "./sections/EarningsHero";
import { NetworkHealth } from "./sections/NetworkHealth";
import { ActionQueue } from "./sections/ActionQueue";
import { SideRail } from "./sections/SideRail";
import { ProBuilding } from "./sections/ProBuilding";
import { Recognition } from "./sections/Recognition";
import { InativosDrawer } from "../painel/sections/InativosDrawer";
import { leader } from "../painel/painel-mock";

/**
 * Painel do Líder v2 — dashboard agrupado por pergunta (Ganho · Saúde · Ação ·
 * Crescimento · Reconhecimento), seguindo a linguagem do DashboardShowcase do DS.
 * Benchmarks: Stripe (herói+tendência), Ramp (fila de ação), HubSpot (agrupar por
 * pergunta), Mixpanel (1 gráfico + breakdown), Vercel (rail leve).
 */
export function PainelV2Page() {
  const [inativosOpen, setInativosOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Painel do Líder"
        description={`Bem-vindo, ${leader.name}. Sua operação e rede num só lugar.`}
        badge={
          <Chip color="success" variant="soft" size="sm" shape="rounded">
            {leader.graduation}
          </Chip>
        }
        actions={
          <Button
            color="secondary"
            variant="outline"
            size="md"
            iconLeft={<Calendar />}
            iconRight={<ChevronDown />}
          >
            Junho 2026
          </Button>
        }
      />

      {/* Linha 1 — Ganhos (2/3) + Saúde da rede (1/3) */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-stretch">
        <EarningsHero className="lg:col-span-2" />
        <NetworkHealth />
      </section>

      {/* Linha 2 — Precisa de você (2/3) + rail Alertas/Evento (1/3) */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-start">
        <ActionQueue className="lg:col-span-2" />
        <SideRail onInativos={() => setInativosOpen(true)} />
      </section>

      {/* Linha 3 — Construção PRO (2/3) + Reconhecimento (1/3) */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-stretch">
        <ProBuilding className="lg:col-span-2" />
        <Recognition />
      </section>

      <InativosDrawer open={inativosOpen} onOpenChange={setInativosOpen} />
    </>
  );
}
