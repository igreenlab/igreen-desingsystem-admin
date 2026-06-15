/**
 * Ambient type declaration para `lucide-react`.
 *
 * O pacote pinado (`lucide-react@1.7.0`) publica JS sem arquivo de tipos: o
 * campo `typings` aponta pra `dist/lucide-react.d.ts`, que NÃO existe no tarball
 * publicado, e não há `exports`/`types` no `package.json`. Resultado: todo
 * import de ícone dispara `TS7016` (implicit any) e quebra `tsc -b` no repo
 * inteiro (~136 chamadas de ícone). NÃO é regressão da feature tree-data — é um
 * defeito de empacotamento da versão pinada, já presente em HEAD/v0.9.0 (não
 * trocar versão: é pin do projeto). Quando a versão for atualizada para uma que
 * publique `.d.ts` corretamente, REMOVER este arquivo + `src/lib/lucide-types.ts`.
 *
 * Esta declaração "bare" (ambient, sem corpo) faz QUALQUER named import de
 * ícone (`import { ChevronRight } from "lucide-react"`) resolver — cobrindo a
 * tabela inteira de ícones sem enumeração. Os TIPOS públicos `LucideIcon` /
 * `LucideProps` (usados como `icon?: LucideIcon`) NÃO podem coexistir aqui:
 * TypeScript não permite, numa única declaração ambient, combinar wildcard de
 * imports nomeados (valores) com export de TIPO nomeado. Por isso esses tipos
 * vivem em `src/lib/lucide-types.ts` e os consumidores importam de lá.
 *
 * NB: este arquivo NÃO pode ter import/export no topo, senão deixa de ser
 * ambient (o `declare module` viraria augmentation e o TS7016 voltaria).
 */
declare module "lucide-react";
