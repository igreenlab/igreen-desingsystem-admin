import type { ColumnTypeDefinition, ColumnTypeId } from "./column-types.types";

/**
 * Tipos de coluna **estruturais**: existem na união `ColumnTypeId` e são tratados por
 * caminho próprio no `DataTable`, **não** pelo registry. Pedir um deles ao registry é
 * legítimo (o call-site é genérico e roda por célula), então não é typo — e avisar
 * anularia o guard, que é justamente pra typo.
 *
 * Consequência de estar aqui: `get()` devolve o fallback `text` **em silêncio**. O valor
 * de retorno é idêntico ao de antes; muda só a ausência do `console.warn`.
 *
 * Ao acrescentar tipo estrutural novo (coluna que o `DataTable` renderiza por conta
 * própria, sem `renderCell` de tipo), acrescente aqui também — senão ele passa a gritar
 * por célula, por page load.
 */
const STRUCTURAL_TYPES = new Set<string>([
  // `getActions` → `DataTableActionsCell`. Ver `data-table-row.tsx` (fallback chain
  // de render, passo 2) e `data-table.tsx` (`isActionsCol`, `headerActions`).
  "actions",
]);

/**
 * Registry Singleton de tipos de coluna do DataTable.
 *
 * Permite o consumer registrar tipos customizados sem mudar o nucleo.
 * Fallback automatico pra `text` quando tipo desconhecido eh requisitado.
 *
 * Uso:
 *   columnTypeRegistry.register(myCustomType);
 *   const def = columnTypeRegistry.get("currency");
 */
class ColumnTypeRegistry {
  private types = new Map<string, ColumnTypeDefinition>();

  register(definition: ColumnTypeDefinition): void {
    if (this.types.has(definition.type)) {
      // Não throw — pra hot reload em dev e re-import incidental. Apenas warn.
      // Em produção, console.warn é silencioso por default mas detectável.
      console.warn(
        `[columnTypeRegistry] type "${definition.type}" já registrado — override silencioso. Verifique imports duplicados.`,
      );
    }
    this.types.set(definition.type, definition);
  }

  registerMany(definitions: ColumnTypeDefinition[]): void {
    for (const d of definitions) this.register(d);
  }

  get(typeId: ColumnTypeId | undefined): ColumnTypeDefinition {
    if (typeId && this.types.has(typeId)) {
      return this.types.get(typeId)!;
    }
    // Typo guard (dev): diferencia "sem tipo" (undefined → text é intencional)
    // de "tipo desconhecido" (provável typo). Sem isso, `type="curency"` degrada
    // silenciosamente pra text plano.
    //
    // ⚠️ Tipo ESTRUTURAL não é typo — e avisar sobre ele anulava o guard.
    // Medido em 2026-08-10 no `?app=finance`: **156 warnings por page load**, todos
    // de `type: "actions"`. Com esse volume, um `type="curency"` de verdade fica
    // invisível no console — o guard existe pra pegar typo e estava sepultando o
    // próprio sinal.
    //
    // `actions` é o ÚNICO dos 17 tipos da união que não está registrado, e está
    // certo em não estar: não é tipo de DADO (não tem `renderCell`, filtro nem
    // operadores) — é coluna estrutural, com caminho próprio de render
    // (`DataTableActionsCell`, via `isActionsCol && col.getActions` em
    // `data-table-row.tsx`). Registrá-lo seria mentira: apareceria na lista de
    // "tipos disponíveis" e nas UIs de filtro, onde não faz sentido.
    //
    // O aviso vinha de `data-table-row.tsx:149`, que chama `get(col.type)` pra TODA
    // célula antes de saber qual caminho de render usar — o `typeDef` da coluna de
    // actions é calculado e **descartado**. Ou seja: nada quebrava, era ruído puro.
    // Por isso o retorno aqui é o MESMO de antes (fallback `text`); só o warn sai.
    if (typeId && !STRUCTURAL_TYPES.has(typeId) && import.meta.env?.DEV) {
      console.warn(
        `[columnTypeRegistry] type "${typeId}" não registrado — usando fallback "text". Typo? Tipos disponíveis: ${Array.from(this.types.keys()).join(", ")}.`,
      );
    }
    const fallback = this.types.get("text");
    if (!fallback) {
      throw new Error(
        "ColumnTypeRegistry: tipo 'text' nao registrado (default fallback ausente)",
      );
    }
    return fallback;
  }

  has(typeId: string): boolean {
    return this.types.has(typeId);
  }

  list(): ColumnTypeDefinition[] {
    return Array.from(this.types.values());
  }
}

export const columnTypeRegistry = new ColumnTypeRegistry();
