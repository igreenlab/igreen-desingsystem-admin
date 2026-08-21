---
name: list-builder-blueprint
description: >
  Estágio 2 do List Builder — consolida a entrevista num blueprint único, roda
  pré-validações automáticas e apresenta o GATE. Zero edição antes do "aprovar".
---

> **Modo submódulo (`ds-link`).** Existe `.claude/ds-config.json` com `"mode": "submodule"`?
> Então **NÃO rode `igreen:add`** — esse script não existe no seu projeto. Os componentes e
> exemplos já estão no disco em `<dsPath>/src`: importe pelo `importBase` do config
> (compostos) e pelo `primitivesBase` (primitivos shadcn), e **leia** o exemplo direto de
> `<dsPath>/src/examples/`.

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
5. **Colisão de rota** — o id/rota proposto não pode já existir no router **deste
   projeto**. Colisão → propor sufixo. (Onde ficam as rotas varia: React Router,
   TanStack Router, file-based do Next… **pergunte** se não for óbvio pelo repo.)
6. **Card** — `title` presente (slots) OU `renderItem` definido. Excluir
   (destructive) tem `AlertModal` no plano (se houver form).

## Formato do blueprint (apresentar TUDO de uma vez)

```markdown
## Blueprint — Lista <Entidade>

**Página**: <Título> · id `<page-id>` · wrapper <ExamplePageLayout|AppShell|puro> · nav "List Components"
**Dados**: <client|server> mode · fonte: <sample|interface|endpoint|manual> · ~<N> itens · id: `<campo>`

### ⚠️ Decisões inferidas — vete se discordar

Só o que o usuário NÃO disse e você decidiu sozinho (wrapper, tema, tipo de campo com
confiança baixa…) — uma linha cada, com o que muda se ele vetar. Sem inferência →
`nenhuma`; não apague a seção: é a ausência dela que faz a decisão passar aprovada
em pacote junto com o resto.

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
- CRIAR  <PAGES_DIR><Nome>.tsx (~<N> linhas)
- EDITAR <REGISTRO> (rota + entrada de navegação do SEU projeto — ver Fase 0)

### Referências canônicas que serão lidas antes de gerar
<lista da matriz do generate.md, só os cenários presentes>

⛔ Nenhum arquivo será tocado antes da aprovação.
Responda **aprovar** · **ajustar <o quê>** · **cancelar**.
```

## Protocolo do gate

- Enunciar a **Assumption** central junto do blueprint (ex.: "o sample é
  representativo; `status` tem exatamente os N valores mapeados") — é o que torna a
  decisão reversível depois. **Não** há audit log a preencher neste projeto.
- `aprovar` → carregar `generate.md` e executar.
- `ajustar X` → re-montar → re-apresentar (novo gate).
- `cancelar` → abortar; nota de cancelamento. Zero disco.

Sinal junto com o preview: `BLUEPRINT_PRONTO: <Entidade> (lista) — aguardando gate`
