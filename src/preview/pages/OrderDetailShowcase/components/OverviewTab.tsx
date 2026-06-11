import { Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { SectionCard } from "./section-card";
import { formatBRL } from "../order-mocks";
import type { Order } from "../order.types";

export function OverviewTab({ order }: { order: Order }) {
  const c = order.customer;
  const addr = order.shippingAddress;

  return (
    <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3">
      {/* Coluna principal */}
      <div className="flex flex-col gap-gp-2xl lg:col-span-2">
        {/* Produtos */}
        <SectionCard title="Produtos do pedido">
          <ul className="flex flex-col">
            {order.items.map((item, i) => (
              <li
                key={item.id}
                className={
                  "flex items-center gap-gp-lg py-pad-lg" +
                  (i > 0 ? " border-t border-border-subtle" : "")
                }
              >
                <span
                  className="size-12 shrink-0 rounded-radius-md"
                  style={{ backgroundColor: `${item.thumb}1f` }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-semibold text-fg-default">
                    {item.name}
                  </p>
                  <p className="text-caption-sm text-fg-muted">
                    SKU: {item.sku}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-body-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
                    {formatBRL(item.price)}
                  </p>
                  <p className="text-caption-sm text-fg-muted">
                    Qtd: {item.qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Pagamento */}
        <SectionCard
          title="Pagamento"
          action={
            <Chip color="success" variant="soft" size="sm" shape="pill">
              Pago
            </Chip>
          }
        >
          <dl className="flex flex-col gap-gp-md">
            <Row label="Subtotal" value={formatBRL(order.subtotal)} />
            <Row label="Frete" value={formatBRL(order.shipping)} />
            <Row label="Impostos" value={formatBRL(order.tax)} />
            {order.discountValue != null && (
              <Row
                label={`Desconto (${order.discountCode})`}
                value={`- ${formatBRL(order.discountValue)}`}
                accent
              />
            )}
            <div className="mt-gp-xs flex items-center justify-between border-t border-border-subtle pt-pad-lg">
              <dt className="text-body-md font-semibold text-fg-default">
                Total
              </dt>
              <dd className="text-body-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
                {formatBRL(order.total)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-title-md font-semibold text-fg-default">
                Pago pelo cliente
              </dt>
              <dd className="text-title-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
                {formatBRL(order.total)}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      {/* Coluna lateral */}
      <div className="flex flex-col gap-gp-2xl">
        <SectionCard title="Cliente">
          <div className="flex items-center gap-gp-md">
            <Avatar size="lg" colorHex={c.colorHex} aria-label={`${c.firstName} ${c.lastName}`}>
              {c.initials}
            </Avatar>
            <div className="min-w-0">
              <p className="text-body-md font-semibold text-fg-default">
                {c.firstName} {c.lastName}
              </p>
              <p className="text-caption-sm text-fg-muted">
                {c.previousOrders} pedidos anteriores
              </p>
            </div>
          </div>

          <div className="mt-gp-xl flex flex-col gap-gp-md">
            <a
              href={`mailto:${c.email}`}
              className="flex items-center gap-gp-sm text-body-sm text-fg-default hover:text-fg-brand"
            >
              <Mail className="size-icon-sm shrink-0 text-fg-muted" />
              <span className="truncate">{c.email}</span>
            </a>
            <span className="flex items-center gap-gp-sm text-body-sm text-fg-default">
              <Phone className="size-icon-sm shrink-0 text-fg-muted" />
              {c.phone}
            </span>
          </div>

          <Divider />

          <AddressBlock
            title="Endereço de entrega"
            lines={[
              addr.line1,
              addr.line2,
              `${addr.city} — ${addr.state}`,
              addr.zip,
              addr.country,
            ]}
          />
          <div className="mt-gp-xl">
            <AddressBlock
              title="Endereço de cobrança"
              lines={[
                order.billing.address,
                order.billing.cityState,
                order.billing.country,
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="Observação do cliente">
          <p className="text-body-sm leading-relaxed text-fg-muted">
            {order.note}
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body-sm text-fg-muted">{label}</dt>
      <dd
        className={
          "text-body-sm [font-variant-numeric:tabular-nums] " +
          (accent ? "text-fg-success" : "text-fg-default")
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Divider() {
  return <div className="my-gp-xl h-px bg-border-subtle" />;
}

function AddressBlock({ title, lines }: { title: string; lines: (string | undefined)[] }) {
  return (
    <div>
      <p className="mb-gp-xs text-caption-sm font-semibold uppercase tracking-wider text-fg-muted">
        {title}
      </p>
      <address className="not-italic text-body-sm leading-relaxed text-fg-default">
        {lines.filter(Boolean).map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </address>
    </div>
  );
}
