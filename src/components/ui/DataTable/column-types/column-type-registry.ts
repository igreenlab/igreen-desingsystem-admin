import type { ColumnTypeDefinition, ColumnTypeId } from "./column-types.types";

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
