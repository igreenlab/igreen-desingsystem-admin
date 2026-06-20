---
name: list-builder-blueprint
description: >
  Estágio 2 do List Builder — consolida a entrevista num blueprint único, roda
  pré-validações automáticas e apresenta o GATE. Zero edição antes do "aprovar".
---

# List Builder — Blueprint [GATE]

## Pré-validações automáticas (ANTES de exibir)

Corrigir silenciosamente (ou reportar se exigir decisão):

1. **Excludências de escala** — `virtualized` + `enableDnD` → desligar DnD;
   `virtualized` + `onLoadMore` → escolher um; `fillHeight` + `virtualized` →
   `fillHeight` off. Anotar `← corrigido`.
2. **branchHighlight** só com `layout="hierarchical"` — em outro layout, ignorar
   e avisar.
3. **Coerência de layout** — `grouped` tem `groups`; `hierarchical` tem itens com
   `children` (ou `onLoadChildren`).
4. **filterFields** — cada um tem `accessor`; `select` tem `options`. Operador de
   view/filtro pré-aplicado válido pro `type` (multiSelect⇒`isAnyOf`,
   select⇒`equals`, text⇒`contains`, number⇒`equals`, date⇒`between`,
   boolean⇒`equals`).
5. **Colisão de page id** — não pode existir em `DOC_PAGES` (`src/App.tsx`).
   Colisão → propor sufixo.
6. **Card** — `title` presente (slots) OU `renderItem` definido. Excluir
   (destructive) tem `AlertModal` no plano (se houver form).

## Formato do blueprint (apresentar TUDO de uma vez)

```markdown
## Blueprint — Lista <Entidade>

**Página**: <Título> · id `<page-id>` · wrapper <ExamplePageLayout|AppShell|puro> · nav "List Components"
**Dados**: <client|server> mode · fonte: <sample|interface|endpoint|manual> · ~<N> itens · id: `<campo>`

### Card (<slots|renderItem>)
- leading: <avatar/ícone|—> · title: `<campo>` · subtitle: `<campo|—>`
- meta: [<label:campo(align)>, ...] · trailing: <badge|—> · description: <campo|—>
- (ou renderItem custom: <descrição do card rico>)
- densidade <comfortable|compact> · menu por card [<Editar·Excluir>|—]

### Layout
<standard | grouped (groups: <id(cor)>...; DnD <on|off>; surface <on|off>)
 | hierarchical (branchHighlight <none|block|active>; expand inicial <...>; lazy <on|off>)>

### Toolbar
título OU views[<abas>] · busca <on|off> · refresh <on|off> · moreActions [<...>]
filterFields: [<id:label:type>, ...]

### Seleção / escala
selectable <on|off> + bulk [<actions>] · onItemClick <nada|detalhe|nav>
escala: <nenhuma | virtualized (estimate <N>) | infinite (onLoadMore/hasMore/loadingMore)>
fillHeight <on|off>

### Estados
loading <skeletonCount> · vazio <emptyState msg/CTA>

### Arquivos
- CRIAR  <PAGES_DIR><Nome>Preview.tsx (~<N> linhas)   [ou pasta <Nome>Showcase/]
- EDITAR src/App.tsx (import + DOC_PAGES + render)
- EDITAR src/preview/components/doc-nav-data.ts (item "Example: <Nome>")

### Referências canônicas que serão lidas antes de gerar
<lista da matriz do generate.md, só os cenários presentes>

⛔ Nenhum arquivo será tocado antes da aprovação.
Responda **aprovar** · **ajustar <o quê>** · **cancelar**.
```

## Protocolo do gate

- Registrar `PAUSADO (gate)` em `.ai/status/pipeline-state.md` com **Assumption**
  (ex: "o sample é representativo; `status` tem exatamente os N valores mapeados").
- `aprovar` → carregar `generate.md` e executar.
- `ajustar X` → re-montar → re-apresentar (novo gate).
- `cancelar` → abortar; nota de cancelamento. Zero disco.

Sinal junto com o preview: `BLUEPRINT_PRONTO: <Entidade> (lista) — aguardando gate`
