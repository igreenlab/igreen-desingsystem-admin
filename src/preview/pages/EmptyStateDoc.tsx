import { Inbox, Search, Users } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Padrão" },
  { id: "ex-action", label: "Com ação" },
  { id: "ex-search", label: "Busca sem resultado" },
  { id: "ex-custom", label: "Ação custom + tamanhos" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "title", type: "string", defaultVal: "— (obrigatório)" },
  {
    name: "icon",
    type: "LucideIcon | ReactNode",
    defaultVal: "—",
  },
  { name: "description", type: "string", defaultVal: "—" },
  {
    name: "action",
    type: "{ label, onClick, color?, variant? } | ReactNode",
    defaultVal: "—",
  },
  { name: "size", type: "'sm' | 'md' | 'lg'", defaultVal: "'md'" },
  { name: "className", type: "string", defaultVal: "—" },
];

export function EmptyStateDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="EmptyState"
        description="Estado vazio genérico e reusável — sem dados, busca sem resultado, inbox vazia, conversa não selecionada. Compõe ícone (lucide ou Icon do DS) + título + descrição + ação (Button do DS) num bloco centralizado. Visual 100% via tokens."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-default"
        title="Padrão"
        description="Ícone (referência do componente lucide) + título + descrição. Sem ação."
        code={`<EmptyState
  icon={Inbox}
  title="Nenhuma conversa selecionada"
  description="Selecione uma conversa ao lado para visualizar as mensagens."
/>`}
      >
        <div className="w-full max-w-container-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <EmptyState
            icon={Inbox}
            title="Nenhuma conversa selecionada"
            description="Selecione uma conversa ao lado para visualizar as mensagens."
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-action"
        title="Com ação"
        description="A ação como objeto { label, onClick } vira um Button do DS, dimensionado pelo size."
        code={`<EmptyState
  icon={Users}
  title="Nenhum cliente cadastrado"
  description="Cadastre o primeiro cliente para começar a acompanhar suas propostas."
  action={{ label: "Novo cliente", onClick: handleCreate }}
/>`}
      >
        <div className="w-full max-w-container-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Cadastre o primeiro cliente para começar a acompanhar suas propostas."
            action={{ label: "Novo cliente", onClick: () => {} }}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-search"
        title="Busca sem resultado"
        description="size sm + ação secundária para limpar filtros. Objeto action aceita color/variant repassados ao Button."
        code={`<EmptyState
  size="sm"
  icon={Search}
  title="Nenhum resultado encontrado"
  description="Ajuste os termos ou limpe os filtros para ver mais itens."
  action={{
    label: "Limpar filtros",
    onClick: handleClear,
    color: "secondary",
    variant: "outline",
  }}
/>`}
      >
        <div className="w-full max-w-container-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <EmptyState
            size="sm"
            icon={Search}
            title="Nenhum resultado encontrado"
            description="Ajuste os termos ou limpe os filtros para ver mais itens."
            action={{
              label: "Limpar filtros",
              onClick: () => {},
              color: "secondary",
              variant: "outline",
            }}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-custom"
        title="Ação custom + tamanho lg"
        description="action aceita um ReactNode custom (ex.: dois botões). size lg aumenta título e Button."
        code={`<EmptyState
  size="lg"
  icon={Inbox}
  title="Sua caixa de entrada está vazia"
  description="Quando novas mensagens chegarem, elas aparecem aqui."
  action={
    <div className="flex gap-gp-md">
      <Button variant="outline" color="secondary">Ver arquivadas</Button>
      <Button>Nova mensagem</Button>
    </div>
  }
/>`}
      >
        <div className="w-full max-w-container-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <EmptyState
            size="lg"
            icon={Inbox}
            title="Sua caixa de entrada está vazia"
            description="Quando novas mensagens chegarem, elas aparecem aqui."
            action={
              <div className="flex gap-gp-md">
                <Button type="button" variant="outline" color="secondary">
                  Ver arquivadas
                </Button>
                <Button type="button">Nova mensagem</Button>
              </div>
            }
          />
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default EmptyStateDoc;
