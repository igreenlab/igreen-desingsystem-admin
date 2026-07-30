# Lições arquivadas — absorvidas em gate automático

> Estas lições **continuam valendo**. Foram movidas do `lessons.md` ativo porque o
> pipeline já as aplica sozinho: não dependem mais de disciplina humana no dia a dia.
> Arquivadas em 2026-07-30, seguindo a política do próprio `lessons.md` (que estava
> em 82 KB, 64% acima do teto de ~50 KB que ela mesma define).
>
> O resumo 1-linha de TODAS as lições — ativas e arquivadas — permanece em
> `.claude/rules/ds-standards.md`, que é a fonte auto-carregada. Nada aqui precisa
> ser lido pra trabalhar; está aqui pro caso de alguém querer o porquê.

| Lição | Quem aplica hoje |
|---|---|
| L-001, L-002, L-003, L-005 | `scripts/lib/ds-lint-patterns.mjs` — hook `ds-lint-styles.sh` no Edit + ratchet bloqueante no CI |
| L-017 | `scripts/lib/pack-contract.mjs` + `scripts/lib-verify.mjs` — gate do Passo 7 do release e step bloqueante no CI |

---

## [L-001] Ring com modificador de opacidade

**Erro cometido:** usar `ring-ring-primary/30` ou `ring-ring-primary/20`

**Regra derivada:** tokens `ring-ring-*` já possuem alpha de 20% embutido via OKLCH.
Usar sempre sem modificador:

```typescript
// ✅
"focus-visible:ring-4 focus-visible:ring-ring-primary";
// ❌ NUNCA
"focus-visible:ring-4 focus-visible:ring-ring-primary/30";
```

**Contexto:** qualquer componente com focus ring

---

---

## [L-002] Tailwind literal em vez de token DS

**Erro cometido:** usar `gap-4`, `rounded-lg`, `shadow-md`, `p-4` quando existem tokens DS equivalentes

**Regra derivada:** sempre verificar se existe token DS antes de usar Tailwind puro:

```typescript
gap-4      → gap-gp-md      (8px)
gap-2      → gap-gp-xs      (4px)
p-4        → p-sp-md        (16px)
rounded-lg → rounded-radius-lg
shadow-md  → shadow-sh-md
px-3       → px-pad-lg      (12px)
h-9        → min-h-form-md  (36px)   ← h-9 = 36px = form-md, NÃO form-lg
h-10       → min-h-form-lg  (40px)
```

**Contexto:** qualquer arquivo `.styles.ts` ou componente Shadcn

---

---

## [L-003] `ring-3` não existe no Tailwind

**Erro cometido:** usar `ring-3`

**Regra derivada:** valores válidos de ring width: `ring-0`, `ring-1`, `ring-2`, `ring-4`, `ring-8`.
Para focus rings do DS usar sempre `ring-4`.

**Contexto:** qualquer componente com focus ring

---

---

## [L-005] `bg-input/50` e vars Shadcn com opacidade

**Erro cometido:** manter `bg-input/50` ao adaptar componente Shadcn

**Regra derivada:**

```typescript
// ❌
"bg-input/50";
// ✅
"bg-bg-surface";
```

**Contexto:** componentes Shadcn migrados para tokens iGreen

---

---

## [L-017] `files` no package.json deve incluir paths das declarações TypeScript

**Erro cometido:** publicar lib no npm com `vite-plugin-dts` gerando `.d.ts` que referenciam paths preservados do source (`./src/components/index`, `./tokens/index`) que **NÃO estavam listados em `files`** do `package.json`. Resultado: tarball publicado tinha `dist-lib/index.d.ts` e `dist-lib/tokens.d.ts` apontando pra arquivos fantasma. Consumers TypeScript instalavam o package mas qualquer `import` retornava `any` ou erro "Cannot find module". **Bug afetou v0.1.0 até v0.5.0 silenciosamente** (4 releases) — corrigido em v0.5.1.

**Regra derivada:** ao publicar lib que usa `vite-plugin-dts` com estrutura preservada, o `files` do `package.json` DEVE incluir os paths emitidos:

```json
"files": [
  "dist-lib/index.*",
  "dist-lib/tokens.*",
  "dist-lib/preview/**",
  "dist-lib/chunks/**",
  "dist-lib/src/**",       // ← types preservam estrutura do source
  "dist-lib/tokens/**",    // ← idem
  "dist-lib/theme.css",
  "README.md"
]
```

**Verificação obrigatória antes de cada publish:**

```bash
npm pack --dry-run --json | grep -E '"path".*(src/components|tokens/index)' | head -5
# Deve retornar arquivos. Se vazio → bug presente, NÃO publicar.
```

Alternativa mais robusta: configurar `vite-plugin-dts` com `rollupTypes: true` pra gerar um único `dist-lib/index.d.ts` self-contained, eliminando a dependência de paths preservados.

**Contexto:** qualquer release de lib npm com TypeScript + múltiplos entries no mapa `exports`. Bug é silencioso (build passa, runtime JS funciona, só types quebram).

---
