import { useState } from "react";
import { LoginScreen } from "../../examples/login";
import { SidebarBrandIcon } from "../../components/ui/MenuSidebar";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/shadcn/toggle-group";

/**
 * LoginShowcase — preview do example-login com um TOGGLE de visualização (só no
 * showcase; o exemplo distribuído recebe as variantes por props). Alterna o
 * painel direito (texto por tokens · imagem · imagem+texto) e o fundo
 * (simples · ambiente), e passa a marca iGreen + uma imagem de exemplo. Servido
 * via `?app=login`.
 */
type RightVariant = "text" | "image" | "image-text";

const IMG = `${import.meta.env.BASE_URL}login-bg.png`;

export default function LoginShowcase() {
  const [variant, setVariant] = useState<RightVariant>("text");
  const [ambient, setAmbient] = useState(false);

  return (
    <>
      {/* Barra de preview — não faz parte do example (afordância do showcase). */}
      <div className="fixed left-1/2 top-gp-lg z-50 flex -translate-x-1/2 flex-wrap items-center justify-center gap-gp-md rounded-radius-full border border-border-subtle bg-bg-surface/90 px-pad-xl py-pad-sm shadow-sh-lg backdrop-blur">
        <span className="text-caption-md text-fg-muted">Painel</span>
        <ToggleGroup
          type="single"
          value={variant}
          onValueChange={(v) => v && setVariant(v as RightVariant)}
        >
          <ToggleGroupItem value="text">Texto</ToggleGroupItem>
          <ToggleGroupItem value="image">Imagem</ToggleGroupItem>
          <ToggleGroupItem value="image-text">Imagem + texto</ToggleGroupItem>
        </ToggleGroup>

        <span aria-hidden className="h-4 w-px bg-border-subtle" />

        <span className="text-caption-md text-fg-muted">Fundo</span>
        <ToggleGroup
          type="single"
          value={ambient ? "on" : "off"}
          onValueChange={(v) => v && setAmbient(v === "on")}
        >
          <ToggleGroupItem value="off">Simples</ToggleGroupItem>
          <ToggleGroupItem value="on">Ambiente</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <LoginScreen
        logo={<SidebarBrandIcon size={26} />}
        rightVariant={variant}
        image={IMG}
        ambient={ambient}
        panelTitle="Energia que move o seu negócio."
        panelSubtitle="Gerencie sua rede, acompanhe resultados e cresça com o portal."
      />
    </>
  );
}
