import { useState } from "react";
import { IdentityHeader } from "./sections/IdentityHeader";
import { AlertsSection } from "./sections/AlertsSection";
import { OnboardingSection } from "./sections/OnboardingSection";
import { ProMakerSection } from "./sections/ProMakerSection";
import { RecognitionSection } from "./sections/RecognitionSection";
import { EventsSection } from "./sections/EventsSection";
import { InativosDrawer } from "./sections/InativosDrawer";

/**
 * Painel do Líder — reconstrução orientada a prioridade.
 * Ordem: identidade+KPIs → ação necessária → onboarding → pro maker →
 * reconhecimento → eventos. Preserva 100% da info da tela legada.
 */
export function PainelPage() {
  const [inativosOpen, setInativosOpen] = useState(false);

  return (
    <div className="flex flex-col gap-gp-5xl">
      <IdentityHeader />
      <AlertsSection onInativos={() => setInativosOpen(true)} />
      <OnboardingSection />
      <ProMakerSection />
      <RecognitionSection />
      <EventsSection />

      <InativosDrawer open={inativosOpen} onOpenChange={setInativosOpen} />
    </div>
  );
}
