import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { EarningsHero } from "./sections/EarningsHero";
import { EventCard } from "./sections/EventCard";
import { NetworkGrowth } from "./sections/NetworkGrowth";
import { ProBuildingList } from "./sections/ProBuildingVariants";
import { Recognition } from "./sections/Recognition";
import { NetworkHealth } from "./sections/NetworkHealth";
import { NetworkAlertsKpis } from "./sections/NetworkAlertsKpis";
import { OnboardingSummary } from "./sections/OnboardingSummary";
import { OnboardingPanel } from "./sections/OnboardingPanel";
import { DetailPanel } from "./sections/DetailPanel";
import { InativosDrawer } from "../painel/sections/InativosDrawer";
import { leader } from "../painel/painel-mock";

/**
 * Painel do Líder v3 — visão consolidada da operação e da rede.
 * Layout em grade de 3 colunas: faixa de ação (full) → ganhos+saúde →
 * onboarding+rail → construção+evento+reconhecimento.
 */
export function PainelV3Page() {
  const [inativosOpen, setInativosOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [drillId, setDrillId] = useState<string | null>(null);

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

      {/* Faixa de ação necessária (KPIs em destaque) */}
      <NetworkAlertsKpis
        onInativos={() => setInativosOpen(true)}
        onDrill={setDrillId}
      />

      {/* Linha 1 — Ganhos (2/3) + Saúde da rede (1/3) */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-stretch">
        <EarningsHero className="lg:col-span-2" />
        <NetworkHealth onDrill={setDrillId} />
      </section>

      {/* Linha 2 — Onboarding (2/3) + Evolução da rede (1/3), alturas iguais */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-stretch">
        <OnboardingSummary
          className="lg:col-span-2"
          onOpen={() => setOnboardingOpen(true)}
        />
        <NetworkGrowth />
      </section>

      {/* Linha 3 — Construção PRO + Evento + Reconhecimento.
          Altura travada na do iGreen Expert (referência); Reconhecimento rola. */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 lg:items-start">
        <ProBuildingList className="lg:h-[593px]" />
        <EventCard className="lg:h-[593px]" />
        <Recognition className="lg:h-[593px]" />
      </section>

      {/* Respiro no rodapé pra não colar na borda do viewport */}
      <div aria-hidden className="h-pad-3xl shrink-0" />

      {/* Drill-downs */}
      <InativosDrawer open={inativosOpen} onOpenChange={setInativosOpen} />
      <OnboardingPanel open={onboardingOpen} onOpenChange={setOnboardingOpen} />
      <DetailPanel drillId={drillId} onClose={() => setDrillId(null)} />
    </>
  );
}
