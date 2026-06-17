import {
  CreditCard,
  FileText,
  Percent,
  StickyNote,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { SectionCard, SectionDivider, Field } from "./section-card";
import { formatBRL } from "../order-mocks";
import type { Order } from "../order.types";

export function DetailsTab({ order }: { order: Order }) {
  const c = order.customer;
  const a = order.shippingAddress;
  const b = order.billing;

  return (
    <div className="flex flex-col gap-gp-2xl">
      {/* Tags rápidas no topo */}
      <div className="flex flex-wrap items-center gap-gp-sm">
        {order.tags.map((t) => (
          <Chip key={t.label} color={t.color} variant="soft" size="sm" shape="pill">
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="flex flex-col gap-gp-2xl lg:col-span-2">
          <SectionCard
            title="Informações do cliente"
            icon={<User className="size-icon-md" />}
          >
            <div className="flex items-start gap-gp-lg">
              <Avatar size="xl" colorHex={c.colorHex} aria-label={`${c.firstName} ${c.lastName}`}>
                {c.initials}
              </Avatar>
              <div className="grid flex-1 grid-cols-1 gap-x-gp-2xl gap-y-gp-2xl sm:grid-cols-3">
                <Field label="Nome" value={c.firstName} />
                <Field label="Nome do meio" value={c.middleName ?? "—"} />
                <Field label="Sobrenome" value={c.lastName} />
                <Field label="E-mail" value={c.email} accent />
                <Field label="Telefone" value={c.phone} />
                <Field label="Tipo de conta" value={c.accountType} />
                <Field label="ID do cliente" value={c.customerId} />
                <Field label="Cadastro" value={c.registeredAt} />
                <Field
                  label="Status"
                  value={
                    <span className="text-fg-success">
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Informações de entrega"
            icon={<Truck className="size-icon-md" />}
          >
            <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-2xl sm:grid-cols-3">
              <Field label="Endereço linha 1" value={a.line1} />
              <Field label="Endereço linha 2" value={a.line2 ?? "—"} />
              <Field label="Cidade" value={a.city} />
              <Field label="Estado" value={a.state} />
              <Field label="CEP" value={a.zip} />
              <Field label="País" value={a.country} />
            </div>
            <SectionDivider className="my-gp-2xl" />
            <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-2xl sm:grid-cols-3">
              <Field label="Transportadora" value={a.carrier} />
              <Field label="Rastreamento" value={a.tracking} accent />
              <Field label="Previsão de entrega" value={a.eta} />
            </div>
          </SectionCard>

          <SectionCard
            title="Informações de cobrança"
            icon={<CreditCard className="size-icon-md" />}
          >
            <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-2xl sm:grid-cols-3">
              <Field label="Endereço de cobrança" value={b.address} />
              <Field label="Cidade / Estado" value={b.cityState} />
              <Field label="País" value={b.country} />
            </div>
            <SectionDivider className="my-gp-2xl" />
            <div className="grid grid-cols-1 gap-x-gp-2xl gap-y-gp-2xl sm:grid-cols-3">
              <Field label="Forma de pagamento" value={b.method} />
              <Field label="ID da transação" value={b.transactionId} accent />
              <Field label="Data do pagamento" value={b.paymentDate} />
            </div>
          </SectionCard>
        </div>

        {/* Coluna lateral */}
        <div className="flex flex-col gap-gp-2xl">
          <SectionCard
            title="Resumo do pedido"
            icon={<FileText className="size-icon-md" />}
          >
            <div className="grid grid-cols-2 gap-x-gp-2xl gap-y-gp-2xl">
              <Field label="ID do pedido" value={`#${order.id}`} />
              <Field label="Data" value="8 jan 2024" />
              <Field label="Itens" value={`${order.items.length} produtos`} />
              <Field
                label="Total"
                value={
                  <span className="text-fg-success [font-variant-numeric:tabular-nums]">
                    {formatBRL(order.total)}
                  </span>
                }
              />
              <Field
                label="Pagamento"
                value={
                  <Chip color="success" variant="soft" size="sm" shape="pill">
                    Pago
                  </Chip>
                }
              />
              <Field
                label="Fulfillment"
                value={
                  <Chip color="info" variant="soft" size="sm" shape="pill">
                    Enviado
                  </Chip>
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Notas internas"
            icon={<StickyNote className="size-icon-md" />}
          >
            <p className="text-body-sm leading-relaxed text-fg-muted">
              {order.internalNote}
            </p>
          </SectionCard>

          <SectionCard
            title="Tags e rótulos"
            icon={<Tag className="size-icon-md" />}
          >
            <div className="flex flex-wrap gap-gp-sm">
              {order.tags.map((t) => (
                <Chip
                  key={t.label}
                  color={t.color}
                  variant="soft"
                  size="sm"
                  shape="pill"
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </SectionCard>

          {order.discountValue != null && (
            <SectionCard
              title="Desconto aplicado"
              icon={<Percent className="size-icon-md" />}
            >
              <div className="grid grid-cols-2 gap-x-gp-2xl gap-y-gp-2xl">
                <Field label="Cupom" value={order.discountCode} />
                <Field
                  label="Desconto"
                  value={
                    <span className="text-fg-success">
                      {order.discountLabel} ({formatBRL(order.discountValue)})
                    </span>
                  }
                />
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
