import { useRef, useState } from "react";
import { CreditCard, MapPin, Package, User } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { ChipGroup, ChipGroupItem } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  FormField,
  FormFieldInput,
  FormFieldSelect,
} from "@/components/ui/FormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Input } from "@/components/shadcn/input";
import { SectionCard } from "./components/section-card";
import { StepNav, type Step } from "./components/StepNav";

const STEPS: Step[] = [
  {
    id: "produtos",
    icon: Package,
    title: "Selecionar produtos",
    description: "Adicione produtos à lista de compra.",
  },
  {
    id: "cliente",
    icon: User,
    title: "Dados do cliente",
    description: "Nome, e-mail e telefone do cliente.",
  },
  {
    id: "endereco",
    icon: MapPin,
    title: "Endereço",
    description: "Informe o endereço de entrega.",
  },
  {
    id: "pagamento",
    icon: CreditCard,
    title: "Pagamento",
    description: "Método e dados do pagamento.",
  },
];

const COUNTRY_OPTIONS = [
  { value: "br", label: "Brasil" },
  { value: "pt", label: "Portugal" },
  { value: "us", label: "Estados Unidos" },
];

const PAYMENT_OPTIONS = [
  { value: "card", label: "Cartão de crédito/débito" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
];

const DDI_OPTIONS = ["+55", "+1", "+351"];

/**
 * EditPageScreen — tela de edição de pedido (formulário em etapas). Mesmo
 * modelo de design da OrderDetail (SectionCard) + nav lateral (stepper).
 * Toggle de layout: 1 coluna (igual à referência) ou 2 colunas. Domínio
 * iGreen (energia solar).
 */
export function EditPageScreen() {
  const [cols, setCols] = useState<"one" | "two">("one");
  const [activeStep, setActiveStep] = useState("produtos");

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const goTo = (id: string) => {
    setActiveStep(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    // Conteúdo da página (sem shell). Embrulhe no seu AppShell/layout — o
    // parent precisa dar altura (h-full/flex) pra página preencher.
    <div className="flex flex-col h-full min-h-0 gap-gp-2xl">
      <PageHeader
        title="Editar pedido"
        description="Pedido #84021 · atualize produtos, cliente, entrega e pagamento."
        hideTextOnMobile={false}
        actions={
          <ChipGroup
            type="single"
            value={cols}
            onValueChange={(v) => v && setCols(v as "one" | "two")}
            size="sm"
            ariaLabel="Layout das colunas"
          >
            <ChipGroupItem value="one">1 coluna</ChipGroupItem>
            <ChipGroupItem value="two">2 colunas</ChipGroupItem>
          </ChipGroup>
        }
      />

      <div className="grid grid-cols-1 items-start gap-gp-4xl pb-pad-6xl lg:grid-cols-[260px_1fr]">
        {/* Nav lateral */}
        <StepNav
          steps={STEPS}
          activeId={activeStep}
          onSelect={goTo}
          className="lg:sticky lg:top-gp-2xl"
        />

        {/* Seções do formulário */}
        <div
          className={
            cols === "two"
              ? "grid grid-cols-1 items-start gap-gp-4xl xl:grid-cols-2"
              : "flex flex-col gap-gp-4xl"
          }
        >
          <div ref={setRef("produtos")} className="scroll-mt-gp-2xl">
            <SectionCard title="Selecionar produtos">
              <FormFieldInput
                label="Buscar produto"
                placeholder="Busque por nome ou SKU..."
              />
            </SectionCard>
          </div>

          <div ref={setRef("cliente")} className="scroll-mt-gp-2xl">
            <SectionCard title="Dados do cliente">
              <div className="flex flex-col gap-form-gap">
                <div className="grid grid-cols-1 gap-form-gap sm:grid-cols-2">
                  <FormFieldInput label="Nome" placeholder="Nome" />
                  <FormFieldInput label="Usuário" placeholder="Nome de usuário" />
                </div>
                <FormFieldInput
                  label="Email"
                  type="email"
                  placeholder="email@exemplo.com"
                />
                <FormField label="Telefone">
                  {({ id }) => (
                    <div className="flex gap-gp-sm">
                      <Select defaultValue="+55">
                        <SelectTrigger className="w-24 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DDI_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id={id}
                        type="tel"
                        placeholder="Número de telefone"
                        className="flex-1"
                      />
                    </div>
                  )}
                </FormField>
              </div>
            </SectionCard>
          </div>

          <div ref={setRef("endereco")} className="scroll-mt-gp-2xl">
            <SectionCard title="Endereço">
              <div className="flex flex-col gap-form-gap">
                <FormFieldSelect
                  label="País"
                  placeholder="Selecione o país"
                  options={COUNTRY_OPTIONS}
                />
                <FormFieldInput label="Endereço" placeholder="Rua, número" />
                <div className="grid grid-cols-1 gap-form-gap sm:grid-cols-2">
                  <FormFieldInput label="Cidade" placeholder="Cidade" />
                  <FormFieldInput label="CEP" placeholder="00000-000" />
                </div>
              </div>
            </SectionCard>
          </div>

          <div ref={setRef("pagamento")} className="scroll-mt-gp-2xl">
            <SectionCard title="Pagamento">
              <div className="flex flex-col gap-form-gap">
                <FormFieldSelect
                  label="Método de pagamento"
                  defaultValue="card"
                  options={PAYMENT_OPTIONS}
                />
                <FormFieldInput
                  label="Nome no cartão"
                  placeholder="Nome impresso no cartão"
                />
                <FormFieldInput
                  label="Número do cartão"
                  placeholder="0000 0000 0000 0000"
                  inputMode="numeric"
                />
                <div className="grid grid-cols-1 gap-form-gap sm:grid-cols-2">
                  <FormFieldInput label="Validade" placeholder="MM/AA" />
                  <FormFieldInput label="CVV" placeholder="123" />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Footer de ações */}
          <div
            className={
              "flex items-center justify-end gap-gp-md" +
              (cols === "two" ? " xl:col-span-2" : "")
            }
          >
            <Button variant="outline" color="secondary" size="md">
              Cancelar
            </Button>
            <Button variant="filled" color="primary" size="md">
              Salvar pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPageScreen;
