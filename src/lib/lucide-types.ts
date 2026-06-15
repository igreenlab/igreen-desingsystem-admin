/**
 * Tipos públicos de ícone do `lucide-react`, re-exportados localmente.
 *
 * ## Por quê este arquivo existe
 * O pacote pinado (`lucide-react@1.7.0`) publica JS sem arquivo de tipos: o
 * campo `typings` aponta pra `dist/lucide-react.d.ts`, que NÃO existe no tarball
 * publicado, e não há `exports`/`types` no `package.json`. Por isso o repo usa
 * uma declaração ambient "bare" (`src/lucide-react.d.ts`) pra que os imports de
 * ícone (`import { ChevronRight } from "lucide-react"`) resolvam.
 *
 * Um efeito colateral do módulo "bare" é que `import type { LucideIcon } from
 * "lucide-react"` resolve `LucideIcon` como NAMESPACE (any), não como tipo —
 * gerando `TS2709` ("Cannot use namespace as a type") nos ~11 pontos que tipam
 * `icon?: LucideIcon`. TypeScript não permite, numa única declaração ambient,
 * combinar wildcard de imports nomeados (valores) com export de TIPO nomeado.
 *
 * Solução: os tipos `LucideIcon`/`LucideProps` vivem aqui (fonte local). Os
 * arquivos que tipavam ícones passam a importar daqui (`~/lib/lucide-types`) em
 * vez de `"lucide-react"`. Os imports de VALOR (os próprios ícones) continuam
 * vindo de `"lucide-react"` normalmente.
 *
 * Quando a versão do `lucide-react` for atualizada para uma que publique
 * `.d.ts` corretamente, este arquivo + `src/lucide-react.d.ts` podem ser
 * removidos e os imports revertidos para `"lucide-react"`.
 */
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export interface LucideProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
  strokeWidth?: string | number;
}

/** Componente de ícone do lucide-react (chevron, X, etc.). */
export type LucideIcon = ForwardRefExoticComponent<
  LucideProps & RefAttributes<SVGSVGElement>
>;
