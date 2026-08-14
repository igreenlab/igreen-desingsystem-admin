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
 * Os tipos default são os do `registerMany` no fim deste arquivo — essa lista é a FONTE.
 * (Até 2026-08-14 este cabeçalho dizia "text, number, date, select, multiSelect, boolean",
 * seis de dezesseis: a lista tinha crescido e a frase não.)
 *
 * ⚠️ **Um arquivo pode registrar MAIS DE UM tipo, e hoje há uma exceção só** — ela custa
 * duas buscas a quem procura pelo nome do tipo: **`status` NÃO tem
 * `definitions/status-column-type.tsx`**. Ele é registrado dentro de
 * `definitions/badge-column-type.tsx` (mesma UI de chip, semântica diferente), e exportado
 * como `StatusColumnType`. Procurar pelo nome do tipo — o reflexo natural — não acha nada.
 * Ao criar tipo novo, prefira 1 arquivo por tipo; se agrupar, anote aqui.
 *
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
