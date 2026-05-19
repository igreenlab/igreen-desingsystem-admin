export type DateSeparatorProps = {
  /** Texto exibido — ex: "Hoje", "Ontem", "12 mar 2024". */
  label: string;
};

/**
 * Pílula centralizada com label de data entre grupos de mensagens.
 * Visual: chip arredondado com `bg-bg-muted`, tipografia tabular.
 */
export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-pad-md">
      <span className="px-pad-lg py-pad-2xs rounded-radius-full bg-bg-muted text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]">
        {label}
      </span>
    </div>
  );
}
