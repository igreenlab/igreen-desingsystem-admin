"use client";

import { forwardRef, type ReactNode } from "react";
import { CardOption } from "@/components/ui/CardOption";
import type { CardOptionSize } from "@/components/ui/CardOption";

export type CardCheckboxProps = {
  label: ReactNode;
  /** Texto secundário abaixo do label */
  description?: ReactNode;
  /** Ícone à esquerda, entre o checkbox e o texto */
  icon?: ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  size?: CardOptionSize;
  className?: string;
};

/**
 * CardCheckbox — atalho de `<CardOption type="checkbox">`.
 *
 * ## Por que virou wrapper em 2026-08-27
 *
 * Este componente era o ÚNICO dos três padrões de "card com controle" que existia de fato: o
 * card de radio e o de switch eram markup solto dentro das páginas de doc, e por isso os três
 * divergiam em 11 dimensões (alinhamento, padding, radius, presets do label e da descrição,
 * cor do selecionado, lado do input…). A implementação foi unificada no `CardOption`, e este
 * arquivo ficou como atalho.
 *
 * **Não foi deprecado nem removido**, e isso é deliberado: ele está no `registry.json`, no
 * barrel do npm, no vocabulário do consumidor e em **duas telas reais** — uma delas o
 * `example-finance`, que é distribuído. Trocar a API aqui seria breaking pra quem consome por
 * npm sem ganho nenhum: o comportamento é idêntico.
 *
 * Componente NOVO deve usar `CardOption` direto — é lá que estão `type`, `orientation`,
 * `layout="list"` e a matriz de tamanhos.
 *
 * ⚠️ Uma diferença de comportamento, e ela é CONSERTO: o anel de foco agora é do card, via
 * `has-[:focus-visible]`. A versão anterior declarava `focus-visible:ring-4` no próprio
 * `<label>`, que não recebe foco — era CSS morto, e o único anel visível era o do checkbox de
 * 16px (medido no browser).
 */
export const CardCheckbox = forwardRef<HTMLButtonElement, CardCheckboxProps>(
  function CardCheckbox(props, ref) {
    return <CardOption ref={ref} type="checkbox" {...props} />;
  },
);
