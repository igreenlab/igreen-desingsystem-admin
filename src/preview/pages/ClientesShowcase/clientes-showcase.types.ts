import type { STATUSES, CATEGORIES } from "../TableDoc";

/**
 * Payload do formulário do drawer "Novo cliente".
 * Consumido por <NovoClienteDrawer onSubmit={...}> no main page.
 */
export type NovoClienteFormData = {
  name: string;
  email: string;
  whatsapp: string;
  statusId: keyof typeof STATUSES;
  categoryId: keyof typeof CATEGORIES;
  city: string;
  value: number;
  notes: string;
};
