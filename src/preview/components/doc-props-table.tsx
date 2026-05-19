export type PropItem = {
  name: string;
  type: string;
  defaultVal: string;
};

export function PropsTable({ items }: { items: PropItem[] }) {
  return (
    <div className="rounded-radius-3xl ring-1 ring-border-subtle overflow-hidden">
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
            <tr key={p.name} className="border-t border-border-subtle">
              <td className="py-pad-xl px-pad-3xl font-mono text-body-md text-fg-default">{p.name}</td>
              <td className="py-pad-xl px-pad-3xl font-mono text-body-md text-fg-muted">{p.type}</td>
              <td className="py-pad-xl px-pad-3xl font-mono text-body-md text-fg-subtle">{p.defaultVal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
