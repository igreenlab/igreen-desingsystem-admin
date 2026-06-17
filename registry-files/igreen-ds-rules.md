# iGreen DS — regras pro consumidor (governança via registry)

Regras que viajam com o DS pra IA/devs gerarem UI consistente. Puxado via
`@igreen/rules` (copy-in) → `.claude/rules/igreen-ds.md` (auto-carregado pelo
Claude Code). Atualize com `npm run igreen:add -- rules`.

## Consumo
- Componentes vêm por **copy-in** (`npm run igreen:add -- <nome>`), viram código seu
  em `src/components/ui/`. Import sempre por alias `@/`, **nunca** de pacote npm.
- `npm run doctor` valida `cn`/`tv` contra o registry; `npm run igreen:drift` acusa
  edição local / defasagem. Use ambos em CI.

## Anti-patterns proibidos
```ts
// Tailwind literal quando existe token DS
gap-4 → gap-gp-md        p-4 → p-sp-md
rounded-lg → rounded-radius-lg     shadow-md → shadow-sh-md
// Heights fixos
h-9 → min-h-form-md   h-10 → min-h-form-lg   h-11 → min-h-form-xl (WCAG mobile)
// Ring / focus
ring-ring-primary/30 → ring-ring-primary   ring-3 → ring-4
outline-none → focus-visible:outline-none
// Tipografia avulsa
text-sm font-medium → text-body-sm font-semibold     text-[14px] → text-body-md
```

## Padrões obrigatórios
```ts
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}
min-h-form-lg   // 40px desktop default · min-h-form-xl 44px mobile
// Tipografia — 6 roles: display / heading / title / body / caption / code
// body-sm (13/500) = default · title weight 600 · override via font-semibold etc.
```

## Forms
- **Sempre** `FormField`/`FormFieldInput/Select/Textarea/Checkbox/Switch` — nunca
  `<label>` cru (divergência de peso/cor no dark).
- Spacing entre fields: `gap-form-gap` (20px), não `gap-gp-*`.

## Cores / dark mode
- `primary` = cor da marca (NÃO "texto principal"). `fg.foreground` = texto padrão.
- `danger` = destrutivo. `on-*` = texto sobre cor de marca. `ring.*` = focus (nunca `border.*`).
- Dark: CSS vars `--color-*` + `.dark{}`. Componentes são theme-aware — sem lógica
  condicional de tema neles.

## Tabela
- Use `<DataTable>` (smart) com `columns` **memoizado** e builders
  (`textColumn`/`currencyColumn`/`dateColumn`/`statusColumn`/`actionColumn`).
- Ações precisam de `id` estável (key de reconciliação). Status via `statusColumn` com
  `color` semântico (success/warning/critical/muted).
