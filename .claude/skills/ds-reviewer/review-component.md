---
name: review-component
description: >
  Validar componente implementado contra spec e padrões DS.
  Checklist estrutural + grep por violações + critique genuína.
---

# DS Reviewer — Checklist de componente

## Passo 1 — Localizar spec

Verificar `pipeline-state.md` — entrada do DS Dev deve estar lá.
Se não estiver: solicitar ao DS Dev que documente antes de continuar.
Verificar também o campo `Assumption` da entrada de gate — vai ser testado no Passo 4.

## Passo 2 — Varredura de regressões

Executar em `.styles.ts` e `.tsx` do componente:

```bash
# L-001 — ring com modificador de opacidade (verificar AMBOS os arquivos)
grep -n "ring-ring-.*/" arquivo.styles.ts arquivo.tsx

# L-002a — Tailwind literal de spacing/radius/shadow
grep -n "gap-[0-9]\|rounded-[sml][mdg]\|rounded-xl\|rounded-2xl\|shadow-[sml][mdg]\|px-[0-9]\|py-[0-9]\|p-[0-9]" arquivo.styles.ts

# L-002b — height fixo proibido (h-7 a h-12)
grep -n "\bh-[7-9]\b\|h-1[0-2]\b\|h-\[" arquivo.styles.ts arquivo.tsx

# L-003 — ring-3 inexistente
grep -n "ring-3\b" arquivo.styles.ts arquivo.tsx

# L-004 — outline-none sem focus-visible
grep -n '"outline-none"' arquivo.tsx arquivo.styles.ts

# L-005 — var Shadcn com opacidade
grep -n "bg-input\|bg-background\|bg-foreground" arquivo.tsx

# L-007 — tipografia avulsa no styles (text-xs, text-sm, text-base sem preset)
grep -n '"text-xs\|"text-sm\|"text-base\b' arquivo.styles.ts

# L-007b — tipografia avulsa no tsx (fora de className de preset)
grep -n 'className="text-xs\|className="text-sm\b' arquivo.tsx

# TypeScript any — verificar todos os arquivos do componente
grep -rn "\bany\b" arquivo.tsx arquivo.types.ts arquivo.styles.ts
```

**Qualquer resultado** (exceto L-014 em thumbs de Switch/Slider) → **REPROVADO com linha exata**.

## Passo 3 — Checklist estrutural

### Componente iGreen (`ui/`)
- [ ] 5 arquivos: `.tsx` + `.styles.ts` + `.types.ts` + `index.ts` + `USAGE.md`?
- [ ] `tv` de `@/utils/tv` (nunca `tailwind-variants`)?
- [ ] `disabled` por ÚLTIMO nos `compoundVariants`?
- [ ] `type="button"` em `<button>`?
- [ ] `min-h-form-*` (nunca `h-*` fixo)?
- [ ] Ring correto para tipo:
  - Botão/select → Padrão 1: ring em cada `color` variant, NÃO no base
  - Input/textarea → Padrão 2: `ring-0 ring-ring-primary` + `focus-visible:ring-4`
- [ ] `border border-transparent` na base?
- [ ] Prefixos DS: `gap-gp-*`, `px-pad-*`, `rounded-radius-*`, `shadow-sh-*`?
- [ ] Tipografia via presets?
- [ ] TypeScript sem `any`? (verificar resultado do grep acima)
- [ ] Exports em AMBOS: `ui/[Nome]/index.ts` + `src/components/index.ts`?
- [ ] **`.ai/context/components/inventory.md` atualizado** (dupla verificação — DS Dev deve ter feito, reviewer confirma)?
- [ ] `pipeline-state.md` atualizado pelo DS Dev?

### Componente Shadcn (`shadcn/`)
- [ ] Em `shadcn/` (não `ui/`)?
- [ ] Lógica Radix preservada (handlers, aria, data-state)?
- [ ] Focus ring Shadcn substituído pelo padrão iGreen?
- [ ] Dark mode via CSS vars (sem lógica condicional)?
- [ ] Se Switch/Slider: thumb usa `bg-white`? (L-014 — exceção válida)
- [ ] Se Radix state: `data-state` não `:checked`? (L-012)
- [ ] Se Slider: N thumbs por N valores no array? (L-013)
- [ ] Exports em AMBOS: `shadcn/index.ts` + `src/components/index.ts`?
- [ ] **`.ai/context/components/inventory.md` atualizado** (dupla verificação — DS Dev deve ter feito, reviewer confirma)?
- [ ] `pipeline-state.md` atualizado pelo DS Dev?

### Componente composto (`ui/`)
- [ ] API limpa — consumidor não importa bases?
- [ ] `htmlFor`, `aria-describedby`, `aria-invalid` presentes?
- [ ] Componentes-base não foram alterados?
- [ ] Tipo "composto" em `.ai/context/components/inventory.md` (dupla verificação)?
- [ ] `pipeline-state.md` atualizado pelo DS Dev?

## Passo 4 — Critério de critique genuína

Depois do checklist, aplicar este teste obrigatório:

> **"Esta revisão encontrou algo que muda a direção — ou apenas confirmou o que já se acreditava?"**

Se a resposta for "apenas confirmou": não aprovar ainda. Examinar especificamente:

1. **Assumption do gate ainda válida?**
   Ler o campo `Assumption` da entrada PAUSADO (gate) no `pipeline-state.md`.
   O que precisava ser verdade para esta decisão funcionar — ainda é verdade depois de ver a implementação?
   Se não → REPROVADO com descrição de qual assumption quebrou.

2. **Existe componente DS existente que torna este desnecessário?**
   (Especialmente para compostos e variantes)

3. **A spec resolve o problema correto?**
   O comportamento implementado atende ao que foi especificado — ou desviou?

Se após examinar o resultado ainda for "tudo correto" → aprovar com confiança.
Se encontrar algo que muda a direção → REPROVADO + descrição do que mudou.

> Critique que encontra apenas problemas menores quando maiores existem não é critique — é educação.

## Passo 5 — Escrever no pipeline-state.md (obrigatório)

```markdown
### [data] | DS REVIEWER | [NomeComponente] | [APROVADO/REPROVADO]
- Spec verificada: sim/não — onde encontrada
- Assumption verificada: [assumption do gate ainda válida? sim / não — e por quê]
- Critique genuína: [o que foi examinado além do checklist + o que encontrou]
- Regressões: nenhuma / [L-xxx linha N arquivo]
- Lições novas: nenhuma / [L-NNN: descrição se padrão novo]
```

## Output

`REVIEW_OK: [nome] ✅` ou `REVIEW_FALHOU: [nome]` + lista numerada com arquivo e linha exata.
