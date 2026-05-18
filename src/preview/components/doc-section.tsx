export function SectionH2({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-heading-xs font-semibold text-fg-default pb-5 border-b border-border-subtle mb-12 scroll-mt-6">
      {title}
    </h2>
  );
}

export function DocSeparator() {
  return <div className="border-t border-dashed border-border-subtle my-8" />;
}
