/** Tipos da tela de detalhe de pedido (showcase OrderDetail). */

export type OrderStatus = "paid" | "pending" | "refunded";
export type FulfillmentStatus = "fulfilled" | "unfulfilled" | "partial";

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  /** Preço unitário em centavos? Não — em reais (number) pra simplicidade do mock. */
  price: number;
  qty: number;
  /** Cor do thumb placeholder (hex). */
  thumb: string;
}

export interface OrderActivity {
  id: string;
  /** Cabeçalho do grupo de data (ex: "Domingo, 06 de março"). */
  dateGroup: string;
  title: string;
  description?: string;
  time: string;
  /** true = evento concluído (verde); false = etapa do fluxo (brand). */
  done?: boolean;
}

export interface OrderComment {
  id: string;
  author: string;
  initials: string;
  colorHex?: string;
  when: string;
  text: string;
}

export interface OrderAttachment {
  id: string;
  name: string;
  kind: "pdf" | "image";
  size: string;
}

export type OrderTagColor =
  | "success"
  | "primary"
  | "warning"
  | "neutral"
  | "danger"
  | "info";

export interface OrderTag {
  label: string;
  color: OrderTagColor;
}

export interface OrderCustomer {
  firstName: string;
  middleName?: string;
  lastName: string;
  initials: string;
  colorHex?: string;
  email: string;
  phone: string;
  customerId: string;
  accountType: string;
  registeredAt: string;
  active: boolean;
  previousOrders: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  fulfillment: FulfillmentStatus;
  placedAt: string;
  source: string;

  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discountCode?: string;
  discountLabel?: string;
  discountValue?: number;
  total: number;

  customer: OrderCustomer;

  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    carrier: string;
    tracking: string;
    eta: string;
  };

  billing: {
    address: string;
    cityState: string;
    country: string;
    method: string;
    transactionId: string;
    paymentDate: string;
  };

  note: string;
  internalNote: string;
  tags: OrderTag[];

  activity: OrderActivity[];
  comments: OrderComment[];
  attachments: OrderAttachment[];
}
