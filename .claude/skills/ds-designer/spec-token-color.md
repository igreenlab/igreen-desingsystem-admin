---
name: spec-token-color
description: >
  Especificar cor semântica (light + dark).
  Verificar se token existente já atende antes de criar novo.
---

# DS Designer — Cor semântica

## ⛔ Verificação prévia obrigatória

```
Antes de propor qualquer token de cor:
1. Abrir color-light.ts
2. Verificar bg.*, fg.*, border.*, ring.* — existe token com intenção similar?
   Sim → usar o existente. NÃO criar.
   Não → justificar por que nenhum existente serve → prosseguir
```

## Arquitetura

```
color-palette.ts (primitivo OKLCH)
  brand[0-1000] · neutral[0-950] · success/warning/danger/info[50-950]
  alpha.black/white/neutral/brand [10-64]
       ↓
color-light.ts + color-dark.ts (semântico)
  bg.* · fg.* · border.* · ring.* · overlay.*
```

## Roles — quando usar cada um

| Role | Uso |
|------|-----|
| `bg.*` | Fundos de superfície, containers, estados |
| `fg.*` | Texto e ícones (sem namespace separado para ícone) |
| `border.*` | Bordas e dividers |
| `ring.*` | Focus rings — NUNCA usar border para isso |
| `overlay.*` | Scrim, backdrop |

## Sufixos — `*-inverted` vs `on-*`

**`*-inverted`** → mesmo papel, fundo invertido
```
fg.foreground          → texto escuro sobre fundo claro
fg.foreground-inverted → texto claro sobre fundo escuro (tooltip)
```

**`on-*`** → texto projetado para sentar sobre cor específica
```
bg.primary  → fg.on-primary (texto branco sobre azul da marca)
bg.danger → fg.on-danger
```

## Variantes obrigatórias por cor de status

Para cada `bg.{cor}` de marca/status criar:
- `bg.{cor}-subtle` — fundo suave (alerts, banners)
- `bg.{cor}-muted` — fundo intermediário
- `fg.on-{cor}` — texto sobre fundo sólido

## Fluxo de criação

```
1. Primitivo existe em color-palette.ts? → se não: criar escala OKLCH
2. Adicionar em color-light.ts no role correto
3. Adicionar equivalente em color-dark.ts
4. Criar fg.on-{cor} se for bg de marca/status
5. Criar variantes subtle/muted
6. npm run tokens:tw4
```

## Nomes proibidos

`fg.brand` → `fg.primary` · `bg.page` → `bg.canvas` · `border.default` → `border.main`
`border.focus` → `ring.*` · `critical` → `danger` (semântico — DS usa `danger`, não `critical`)
`icon.*` → `fg.*`
