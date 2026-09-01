import { Fragment } from "react";

export type PropItem = {
  name: string;
  type: string;
  defaultVal: string;
  /**
   * Nota que aparece sob o nome da prop. Opcional: a maioria das props é óbvia pelo
   * tipo, e uma coluna a mais em toda tabela só encolheria as outras três.
   *
   * ⚠️ Este campo **existia nos dados e não existia aqui**. O `AppShellDoc` escreveu
   * uma `description` de 4 linhas pra `defaultMenuCollapsed` (o comportamento
   * responsivo do collapse) que nunca renderizou: array literal inferido, passado
   * depois pra `PropItem[]`, então o excess-property check do TS não dispara e a
   * chave era descartada em silêncio. Quem escreveu acreditou ter documentado.
   */
  description?: string;
};

export function PropsTable({ items }: { items: PropItem[] }) {
  return (
    /* `mb-14` espelha o do `ExampleSection`.
     *
     * Existe porque o `SectionH2` tem `pb-5 border-b mb-12` e **nenhum**
     * `margin-top`: um heading logo depois de uma tabela colava nela, com a
     * régua do heading a 0px da borda do card. É a segunda metade da L-050, que
     * já registrava o sintoma ("`SectionH2` tem `mb` sem `margin-top`: tabela
     * seguida de heading cola") sem que nada no código o resolvesse — cada
     * página que empilhava duas tabelas de props reproduzia o defeito.
     *
     * Fica aqui e não no `SectionH2` porque o problema é a AUSÊNCIA de espaço
     * DEPOIS da tabela: pôr `margin-top` no heading dobraria o respiro nos
     * casos em que ele vem depois de um `ExampleSection`, que já tem `mb-14`. */
    <div className="mb-14 rounded-radius-3xl ring-1 ring-border-subtle overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-bg-muted">
          <tr>
            <th className="py-pad-lg px-pad-3xl text-body-md font-medium text-fg-muted font-medium">Prop</th>
            <th className="py-pad-lg px-pad-3xl text-body-md font-medium text-fg-muted font-medium">Type</th>
            <th className="py-pad-lg px-pad-3xl text-body-md font-medium text-fg-muted font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            /* Fragment porque a nota é uma LINHA própria, não conteúdo da 1ª célula: a
               coluna Prop é estreita, e um parágrafo dentro dela vira uma tira de ~25
               caracteres de largura por 12 linhas de altura. Com `colSpan` a nota usa a
               tabela inteira e lê como nota de rodapé da linha. */
            <Fragment key={p.name}>
              <tr className="border-t border-border-subtle">
                <td className="px-pad-3xl pt-pad-xl pb-pad-xl align-top font-mono text-body-md text-fg-default">
                  {p.name}
                </td>
                <td className="px-pad-3xl pt-pad-xl pb-pad-xl align-top font-mono text-body-md text-fg-muted">{p.type}</td>
                <td className="px-pad-3xl pt-pad-xl pb-pad-xl align-top font-mono text-body-md text-fg-subtle">{p.defaultVal}</td>
              </tr>
              {p.description && (
                <tr>
                  {/* Sem borda no topo: pertence à linha de cima, não é item novo. O
                      `-mt` do `<td>` anterior não existe em tabela, então o respiro sai
                      do padding assimétrico. */}
                  <td colSpan={3} className="px-pad-3xl pt-0 pb-pad-xl">
                    <p className="max-w-[92ch] text-caption-md leading-relaxed text-fg-subtle">
                      {p.description}
                    </p>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
