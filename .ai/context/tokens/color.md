# Tokens de cor — contexto do agente

> Carregar quando a tarefa envolve: nova cor semântica, ajuste de paleta,
> dark mode, tokens de feedback, overlay, scrim.

## Arquitetura de cor (2 tiers)

```
color-palette.ts (primitivo — OKLCH)
  brand[0–1000]         → azul da marca
  neutral[0–950]        → slate (levemente frio, hue ~247)
  success/warning/danger/info [50–950]
  purple/teal/sky/pink/yellow [50–950]
  alpha.black[4–64]
  alpha.white[8–64]
  alpha.neutral[10–24]  → overlays neutros
  alpha.brand[10–24]    → overlays de marca
       ↓
color-light.ts  /  color-dark.ts (semântico)
  bg.*      → fundos de superfície e containers
  fg.*      → texto e ícones (sem namespace separado para icon)
  border.*  → bordas e dividers
  ring.*    → focus rings (outline de foco acessível)
  overlay.* → scrim, tooltip
```

---

## Dois padrões de sufixo — DIFERENTES, ambos corretos

### `*-inverted` — versão invertida de um papel neutro

Usado quando um papel neutro precisa ser lido em fundo oposto.
Exemplo: `fg.foreground` é quase preto no light mode. Em um tooltip escuro
dentro do mesmo tema light, o texto precisa ser quase branco → `fg.foreground-inverted`.

```
fg.foreground          → ~preto  (texto sobre superfície clara)
fg.foreground-inverted → ~branco (texto sobre superfície escura)

fg.muted               → cinza médio (descritivo sobre fundo claro)
fg.muted-inverted      → cinza claro (descritivo sobre fundo escuro)
```

**Regra:** usar `*-inverted` quando o PAPEL é o mesmo, mas o contexto de fundo inverteu.

---

### `on-*` — texto projetado para sentar sobre uma cor de marca ou status

Usado quando o fundo É uma cor específica (primary, success, warning, danger, info).

```
bg.primary   → fundo azul da marca
fg.on-primary → texto branco que vai SOBRE bg.primary

bg.danger    → fundo vermelho de erro
fg.on-danger → texto que vai SOBRE bg.danger
```

**Regra:** usar `on-*` quando o fundo É uma cor semântica específica.

---

## Roles semânticos — nomes e uso

| Role | Uso correto |
|------|-------------|
| **bg (backgrounds)** | |
| `bg.canvas` | Fundo da página (o mais externo) |
| `bg.secondary` | Superfície escura — neutral[950] (dark surface para contraste) |
| `bg.surface` | Cards, modais, popovers |
| `bg.surface-inverted` | Tooltips, toasts escuros, badges invertidos |
| `bg.muted` | Inputs, code blocks (recuado) |
| `bg.disabled` | Fundo de elementos desabilitados |
| `bg.primary` | Fundo de destaque da marca (CTA) |
| `bg.primary-subtle` | Fundo suave de marca (banners, alerts) |
| `bg.primary-muted` | Fundo de marca com ênfase intermediária |
| `bg.primary-hover` | Hover sobre bg.primary |
| `bg.success / .warning / .danger / .info` | Status feedback — fundo sólido |
| `bg.*-subtle / *-muted / *-strong` | Variantes de intensidade por cor semântica |
| **fg (foreground — texto e ícones)** | |
| `fg.foreground` | Texto base neutro — máximo contraste |
| `fg.foreground-inverted` | Texto neutro sobre superfície invertida |
| `fg.strong` | Títulos, destaques |
| `fg.moderate` | Sub-headings, rótulos |
| `fg.muted` | Textos descritivos, subtítulos |
| `fg.subtle` | Placeholders, hints |
| `fg.disabled` | Texto desabilitado |
| `fg.primary` | Cor da marca — links, CTAs |
| `fg.on-primary` | Texto sobre `bg.primary` |
| `fg.on-danger` | Texto sobre `bg.danger` |
| `fg.on-success` | Texto sobre `bg.success` |
| `fg.on-warning` | Texto sobre `bg.warning` |
| `fg.on-info` | Texto sobre `bg.info` |
| **border** | |
| `border.main` | Bordas de input, card (padrão) |
| `border.subtle` | Separadores leves, dividers |
| `border.strong` | Bordas de destaque, hover |
| `border.heavy` | Borda pesada de destaque (borderWidth.sm) |
| `border.primary` | Borda com cor da marca |
| `border.danger-muted` | Borda de erro |
| **ring (focus rings)** | |
| `ring.primary` | Focus ring padrão — alpha.brand[20] (20% opacidade) |
| `ring.danger` | Focus ring em estado de erro — alpha.danger[20] |
| `ring.neutral` | Focus ring neutro — alpha.neutral[20] |
| **chart (data-viz)** | usados **só** em gráficos (Recharts via `Chart`) |
| `chart.1` | série principal — **verde da marca** (primitive; acompanha a brand) |
| `chart.2`–`chart.5` | harmônicas — teal / azul / âmbar / violeta |
| `chart.grid` | linhas-guia (CartesianGrid/PolarGrid). light `gray[200]` / dark branco 12% |

> Paleta categórica de gráficos. Editar em `tokens/.../semantic/color-light.ts` +
> `color-dark.ts` (namespace `chart`) → `npm run tokens:tw4`. Consumo: `var(--color-chart-*)`
> no `config` do `ChartContainer`, nunca em componentes comuns. Convenções de uso
> (1 série / 2 séries verde+âmbar / pizza monocromática / status) e caveats do Recharts 3:
> `.ai/context/components/chart-patterns.md` + L-032.

---

## Regras invioláveis

1. **Nunca usar primitivos em componentes.** `brand[600]` → proibido. Usar `bg-bg-primary`.
2. **Contraste mínimo:** `fg.foreground` / `bg.canvas` ≥ 7:1 (WCAG AAA).
3. **Dark mode:** mudar só `color-dark.ts`. Jamais lógica `if (isDark)` em componentes.
4. **`on-*` obrigatório:** todo `bg.{cor}` de marca/status precisa de `fg.on-{cor}`.
5. **Variantes de intensidade:** toda cor semântica deve ter `subtle`, `muted`.
6. **Ícones usam `fg.*`:** sem namespace separado para ícone.
7. **Focus ring usa `ring.*`:** nunca `border.*` para outline de foco. Ring tokens usam cores alpha (20% opacidade) — aplicar via `ring-4 ring-ring-{color}` com `outline-none`.

---

## Fluxo para adicionar nova cor semântica

```
1. Existe primitivo em color-palette.ts?
   Sim → pular para passo 2
   Não → adicionar escala OKLCH em color-palette.ts

2. Adicionar em color-light.ts no role correto
   (bg / fg / border / ring)

3. Adicionar equivalente em color-dark.ts

4. Se for bg.{cor} de marca/status:
   → criar fg.on-{cor}
   → criar bg.{cor}-subtle, bg.{cor}-muted

5. Se for papel neutro com versão invertida:
   → criar fg.{papel}-inverted

6. Rodar npm run tokens:tw4 para gerar as classes CSS

7. Atualizar .ai/status/pipeline-state.md
```

---

## Quando usar cada padrão — guia rápido

| Situação | Padrão | Classe |
|----------|--------|--------|
| Texto sobre superfície clara | `fg.foreground` | `text-fg-foreground` |
| Texto sobre tooltip escuro | `fg.foreground-inverted` | `text-fg-foreground-inverted` |
| Texto sobre botão primário | `fg.on-primary` | `text-fg-on-primary` |
| Texto sobre fundo de erro | `fg.on-danger` | `text-fg-on-danger` |
| Fundo de elemento disabled | `bg.disabled` | `bg-bg-disabled` |

---

## Nomes a evitar

- `fg.brand` → renomeado para `fg.primary`
- `bg.page` → renomeado para `bg.canvas`
- `border.default` → renomeado para `border.main`
- `border.focus` → movido para `ring.*`
- `critical` → renomeado para `danger` (alinhado com primitivo e CSS gerado)
- `icon.*` → removido, usar `fg.*`
