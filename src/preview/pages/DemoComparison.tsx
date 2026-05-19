import { Button } from "../../components/ui/Button/button";
import { Input } from "../../components/shadcn/input";

/* ═══════════════════════════════════════════════════════════════════════════
   DEMO: Original Shadcn (screenshot) vs iGreen DS (recriação)
   Prova de conceito que os tokens do DS reproduzem fielmente o visual.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── iGreen DS Card (recriação com componentes e tokens do DS) ──────────── */
function IGreenCard() {
  return (
    <div className="flex flex-col rounded-radius-base ring-1 ring-border-subtle shadow-sh-md bg-bg-surface">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="text-title-lg font-semibold text-fg-default">Buy Investment</div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-6 px-6 py-3">
        {/* Amount field — usa Input component */}
        <div className="flex flex-col gap-1.5">
          <label className="text-body-md font-medium text-fg-default">Amount to Invest</label>
          <Input size="sm" defaultValue="1,000.00" />
        </div>

        {/* Order Type field — usa Input como select (estruturalmente) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-body-md font-medium text-fg-default">Order Type</label>
          <Input size="sm" defaultValue="Market Order" />
          <p className="text-body-md text-fg-muted">Market orders execute at the current price.</p>
        </div>

        {/* Info rows */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-body-md text-fg-muted">Estimated Shares</span>
            <span className="text-body-md font-medium font-semibold tabular-nums">1.95</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-md text-fg-muted">Buying Power</span>
            <span className="text-body-md font-medium font-semibold tabular-nums">$12,450.00</span>
          </div>
        </div>
      </div>

      {/* Footer — usa Button component */}
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-3">
        <Button color="primary" variant="filled" size="sm" fullWidth>
          Review Order
        </Button>
        <p className="text-body-md text-fg-muted text-center">
          Trades are typically executed within minutes during market hours.
        </p>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export function DemoComparison() {
  return (
    <div className="p-10">
      <h1 className="text-title-lg font-semibold text-fg-default mb-2">Demo: Shadcn Original vs iGreen DS</h1>
      <p className="text-body-lg text-fg-muted mb-8">
        Esquerda: screenshot pixel-perfect do Shadcn Luma Green. Direita: recriação usando tokens e componentes do iGreen DS.
      </p>

      <div className="grid grid-cols-2 gap-10 items-start">
        {/* Left — Original (screenshot) */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-radius-3xl bg-bg-muted text-body-xs text-fg-muted font-medium">
              Original Shadcn
            </span>
            <span className="text-body-md text-fg-subtle">Luma Green preset (screenshot)</span>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/shadcn-buy-investment.png"
              alt="Shadcn Buy Investment Card — Original"
              className="rounded-lg shadow-sh-md max-w-[380px] w-full"
            />
          </div>
        </div>

        {/* Right — iGreen DS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-radius-3xl bg-bg-brand-subtle text-body-xs text-fg-brand font-medium">
              iGreen DS
            </span>
            <span className="text-body-md text-fg-subtle">Tokens + Button component</span>
          </div>
          <div className="max-w-[380px]">
            <IGreenCard />
          </div>
        </div>
      </div>

      {/* Token mapping reference */}
      <div className="mt-12 rounded-radius-base ring-1 ring-border-subtle overflow-hidden">
        <div className="bg-bg-muted px-6 py-3 border-b border-border-subtle">
          <h2 className="text-body-md font-medium font-medium text-fg-default">Mapeamento de tokens utilizados</h2>
        </div>
        <div className="px-6 py-4">
          <table className="w-full text-left text-body-md">
            <thead>
              <tr className="text-body-md font-medium text-fg-muted">
                <th className="pb-2 font-medium">Elemento</th>
                <th className="pb-2 font-medium">Token / Classe</th>
                <th className="pb-2 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="text-fg-default">
              {[
                ["Card radius", "rounded-radius-base", "26px (calc 0.625rem * 2.6)"],
                ["Card shadow", "shadow-sh-md", "dual-layer ambient + key"],
                ["Card border", "ring-1 ring-border-subtle", "1px neutral"],
                ["Card bg", "bg-bg-surface", "white / dark gray"],
                ["Input height", "h-form-md", "36px"],
                ["Input radius", "rounded-radius-base", "26px"],
                ["Button", "Button primary/filled/md", "40px, green, rounded-radius-base"],
                ["Title", "text-title-lg", "20px, semibold"],
                ["Label", "text-body-md font-medium", "14px, medium"],
                ["Body text", "text-body-md", "14px, regular"],
                ["Primary color", "bg-bg-brand", "oklch(52.7% 0.154 150)"],
                ["Muted text", "text-fg-muted", "oklch(52% 0 0)"],
              ].map(([el, token, val]) => (
                <tr key={el} className="border-t border-border-subtle">
                  <td className="py-2">{el}</td>
                  <td className="py-2 font-mono text-fg-brand">{token}</td>
                  <td className="py-2 text-fg-muted">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
