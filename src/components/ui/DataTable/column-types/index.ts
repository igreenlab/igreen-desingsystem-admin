/**
 * Column Types Registry — sistema extensivel de tipos de coluna do DataTable.
 *
 * Cada tipo declara:
 *   - operators suportados
 *   - render no modal Filtros (advanced)
 *   - render no chip popover (fast filter)
 *   - logica de match runtime (rows.filter)
 *   - render do chip value (opcional, default uso simples)
 *
 * Default tipos registrados: text, number, date, select, multiSelect, boolean.
 * Pra adicionar tipo customizado:
 *   columnTypeRegistry.register({ type: "currency", operators: [...], renderFilterInput: ..., ... });
 */

export { columnTypeRegistry } from "./column-type-registry";
export type {
  ColumnTypeDefinition,
  ColumnTypeId,
  ColumnTypeOperator,
  ColumnOption,
  FilterInputProps,
  FastFilterInputProps,
} from "./column-types.types";

// Registra os tipos default automaticamente no import
import { columnTypeRegistry } from "./column-type-registry";
import { TextColumnType } from "./definitions/text-column-type";
import { NumberColumnType } from "./definitions/number-column-type";
import { DateColumnType } from "./definitions/date-column-type";
import { SelectColumnType } from "./definitions/select-column-type";
import { MultiSelectColumnType } from "./definitions/multi-select-column-type";
import { BooleanColumnType } from "./definitions/boolean-column-type";
// Fase G.3 — tipos prebuilt
import { CurrencyColumnType } from "./definitions/currency-column-type";
import { PercentageColumnType } from "./definitions/percentage-column-type";
import { EmailColumnType } from "./definitions/email-column-type";
import { PhoneColumnType } from "./definitions/phone-column-type";
import { UrlColumnType } from "./definitions/url-column-type";
import { UserColumnType } from "./definitions/user-column-type";
import {
  BadgeColumnType,
  StatusColumnType,
} from "./definitions/badge-column-type";
import { TagsColumnType } from "./definitions/tags-column-type";
import { DatetimeColumnType } from "./definitions/datetime-column-type";

columnTypeRegistry.registerMany([
  TextColumnType,
  NumberColumnType,
  DateColumnType,
  SelectColumnType,
  MultiSelectColumnType,
  BooleanColumnType,
  CurrencyColumnType,
  PercentageColumnType,
  EmailColumnType,
  PhoneColumnType,
  UrlColumnType,
  UserColumnType,
  BadgeColumnType,
  StatusColumnType,
  TagsColumnType,
  DatetimeColumnType,
]);

export {
  TextColumnType,
  NumberColumnType,
  DateColumnType,
  SelectColumnType,
  MultiSelectColumnType,
  BooleanColumnType,
  CurrencyColumnType,
  PercentageColumnType,
  EmailColumnType,
  PhoneColumnType,
  UrlColumnType,
  UserColumnType,
  BadgeColumnType,
  StatusColumnType,
  TagsColumnType,
  DatetimeColumnType,
};
