import type { Order } from "./order.types";

/** Formata número como BRL. */
export const formatBRL = (v: number): string =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Pedido mock no domínio iGreen (energia solar). Espelha a estrutura da
 * referência (Overview / Details / Activity / Comments / Attachments) com
 * dados coerentes ao resto do showcase.
 */
export const ORDER: Order = {
  id: "84021",
  status: "paid",
  fulfillment: "fulfilled",
  placedAt: "8 de janeiro de 2024 às 21:48 · via Pedidos rascunho",
  source: "Pedidos rascunho",

  items: [
    {
      id: "SOL-4KWP-098",
      name: "Kit Solar Residencial 4 kWp",
      sku: "SOL-4KWP-098",
      price: 12480,
      qty: 1,
      thumb: "#22A06B",
    },
    {
      id: "INV-5KW-336",
      name: "Inversor Híbrido 5 kW",
      sku: "INV-5KW-336",
      price: 4890,
      qty: 1,
      thumb: "#3B82F6",
    },
    {
      id: "PNL-550-368",
      name: "Painel Monocristalino 550 W",
      sku: "PNL-550-368",
      price: 689,
      qty: 8,
      thumb: "#F59E0B",
    },
  ],
  subtotal: 22882,
  shipping: 320,
  tax: 1373,
  discountCode: "INVERNO2024",
  discountLabel: "-10%",
  discountValue: 2288.2,
  total: 22286.8,

  customer: {
    firstName: "Helena",
    middleName: "Rocha",
    lastName: "Martins",
    initials: "HM",
    colorHex: "#22A06B",
    email: "helena.martins@example.com",
    phone: "+55 (31) 99845-2014",
    customerId: "#CLI-52365",
    accountType: "Premium",
    registeredAt: "17/12/2023",
    active: true,
    previousOrders: 11,
  },

  shippingAddress: {
    line1: "Rua das Acácias, 2780",
    line2: "Sala 4",
    city: "Belo Horizonte",
    state: "Minas Gerais",
    zip: "30513-200",
    country: "Brasil",
    carrier: "Correios SEDEX",
    tracking: "BR7489204588 31",
    eta: "12 de janeiro de 2024",
  },

  billing: {
    address: "Rua das Acácias, 2780, Sala 4",
    cityState: "Belo Horizonte, Minas Gerais 30513-200",
    country: "Brasil",
    method: "Visa terminando em 4242",
    transactionId: "TXN-8847291",
    paymentDate: "8 de janeiro de 2024",
  },

  note: "Caso haja qualquer atraso ou problema com meu pedido, por favor me avise. Valorizo uma comunicação clara e a atenção aos detalhes.",
  internalNote:
    "Cliente solicitou embalagem reforçada para todos os itens. A etiqueta de envio deve incluir a nota \"Frágil — manusear com cuidado\". Prioridade confirmada pelo status de conta Premium.",

  tags: [
    { label: "Cliente verificado", color: "success" },
    { label: "Premium", color: "info" },
    { label: "Alta prioridade", color: "warning" },
    { label: "Recorrente", color: "neutral" },
    { label: "Frágil", color: "danger" },
  ],

  activity: [
    {
      id: "a1",
      dateGroup: "Domingo, 06 de março",
      title: "Pedido entregue",
      description: "Recebido por: Helena Martins",
      time: "14:05",
      done: true,
    },
    {
      id: "a2",
      dateGroup: "Domingo, 06 de março",
      title: "Saiu para entrega",
      time: "09:12",
    },
    {
      id: "a3",
      dateGroup: "Domingo, 06 de março",
      title: "Chegou ao centro de distribuição",
      time: "22:15",
    },
    {
      id: "a4",
      dateGroup: "Sexta, 04 de março",
      title: "Coletado pela transportadora",
      time: "03:43",
    },
    {
      id: "a5",
      dateGroup: "Sexta, 04 de março",
      title: "Saiu do centro de distribuição",
      time: "01:12",
    },
    {
      id: "a6",
      dateGroup: "Quinta, 03 de março",
      title: "Em preparação para envio",
      time: "23:30",
    },
    {
      id: "a7",
      dateGroup: "Quinta, 03 de março",
      title: "Pedido confirmado",
      description: "Pagamento recebido via cartão de crédito",
      time: "21:15",
    },
  ],

  comments: [
    {
      id: "c1",
      author: "Helena Martins",
      initials: "HM",
      colorHex: "#22A06B",
      when: "2 dias atrás",
      text: "Vocês conseguem atualizar o endereço de entrega? Mudei recentemente e esqueci de alterar antes de fazer o pedido.",
    },
    {
      id: "c2",
      author: "Suporte iGreen",
      initials: "SI",
      colorHex: "#3B82F6",
      when: "1 dia atrás",
      text: "Claro! Atualizei o endereço para Rua das Acácias, 2780, Sala 4, Belo Horizonte/MG. Pode confirmar se está correto?",
    },
    {
      id: "c3",
      author: "Helena Martins",
      initials: "HM",
      colorHex: "#22A06B",
      when: "1 dia atrás",
      text: "Isso mesmo, muito obrigada pela agilidade!",
    },
  ],

  attachments: [
    { id: "f1", name: "nota_fiscal_84021.pdf", kind: "pdf", size: "245 KB" },
    { id: "f2", name: "etiqueta_envio.png", kind: "image", size: "128 KB" },
    {
      id: "f3",
      name: "comprovante_pagamento.pdf",
      kind: "pdf",
      size: "89 KB",
    },
  ],
};
