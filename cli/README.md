# @snksergio/create-design-system

CLI to bootstrap a new project that consumes the **iGreen Design System via the
shadcn registry (copy-in model)** — not as an npm dependency.

Pre-configures React 19 + Vite + Tailwind CSS v4, with the DS **theme, `cn` and
`tv` already baked in** and the `@igreen` registry wired in `components.json`. You
then pull components on demand with `shadcn add @igreen/<name>`.

## Quick start

```bash
npm create @snksergio/design-system my-app
cd my-app
cp .env.local.example .env.local              # paste the IGREEN_TOKEN (ask the maintainer)
npm run igreen:add -- button form-field       # pull components + register in manifest
npm run igreen:drift                          # verify integrity (CI-friendly)
npm run dev
```

Browser opens at `http://localhost:3200`. The starter page works with zero
components installed (uses theme tokens only) and lists the next steps.

## What the CLI does

1. Asks for the project name (or takes from arg)
2. Optionally takes the `IGREEN_TOKEN` (writes `.env.local`) — Enter to skip and paste later
3. Detects your package manager (npm/pnpm/yarn/bun) — you can override
4. Copies the `default` template into a fresh folder
5. Renames `_gitignore` → `.gitignore` and `_env.local.example` → `.env.local.example`
6. Installs dependencies (optional) + git init (optional)
7. Prints next steps (token + `shadcn add`)

## What's in the template

```
my-app/
├── components.json            # @igreen registry + Bearer ${IGREEN_TOKEN} wired
├── .env.local.example         # IGREEN_TOKEN=
├── vite.config.ts             # @ alias + @tailwindcss/vite
├── tsconfig.json              # paths @/* → ./src/*
├── scripts/doctor.mjs         # valida cn/tv contra o registry (L-016)
├── scripts/igreen-add.mjs     # wrapper de `shadcn add` que mantém o manifesto
├── scripts/igreen-drift.mjs   # drift check (edição local + defasagem) — CI
├── .igreen-ds/manifest.json   # rev + hash de cada componente (gerado por igreen:add; commite)
└── src/
    ├── index.css              # tailwindcss + tw-animate-css + theme (na ordem certa)
    ├── lib/utils.ts           # cn do DS (extendTailwindMerge p/ prefixos DS) — BAKED
    ├── utils/tv.ts            # tv do DS (twMergeConfig) — BAKED
    ├── styles/theme/tailwind-theme.css   # tokens OKLCH — BAKED
    └── App.tsx                # starter (tokens only) + próximos passos
```

**Por que `cn`/`tv`/`theme` vêm baked:** evita o problema do `shadcn init` plantar o
`cn` padrão (que quebra a resolução de classe DS em silêncio — L-016). Como já são os
do DS, um `shadcn add @igreen/<x>` que traga `@igreen/utils`/`@igreen/tv` os vê
**idênticos e pula** — sem overwrite, sem pegadinha. `npm run doctor` valida a integridade.

## Requirements

- Node.js ≥ 20
- `IGREEN_TOKEN` (Bearer do registry privado) pra `shadcn add`

## Note about npx cache

`npm create XXX` = `npx create-XXX`. npx caches packages; após um publish novo,
peça `@latest` (ou versão específica) pra furar o cache:

```bash
npm create @snksergio/design-system@latest my-app
```

## License

Internal — iGreen. No public distribution intended beyond iGreen apps.
