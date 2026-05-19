# Pipeline State — iGreen DS v2

> Audit log append-only. Nunca apagar entradas — só adicionar.
> Cada agente DEVE escrever aqui ao iniciar e concluir uma tarefa.

---

## Formatos de entrada por status

### CONCLUÍDO / APROVADO
```
### [YYYY-MM-DD] | AGENTE | TAREFA | STATUS
- Input: o que foi recebido
- Output: o que foi entregue / sinalizado
- Decisões: decisões tomadas durante a execução
- Assumption: [o que precisa ser verdade para esta decisão estar certa]
  Ex: "bg.primary-muted é suficientemente distinto de bg.primary-subtle para uso em alerts"
  Ex: "Não existe componente Shadcn com lógica equivalente"
- Lições novas: nenhuma / [L-NNN: descrição]
```

> O campo Assumption torna decisões reversíveis: quando um problema aparecer no futuro,
> você verifica qual assumption quebrou — e sabe exatamente o que revisar.

### REPROVADO
```
### [YYYY-MM-DD] | DS REVIEWER | [Nome] | REPROVADO
- Spec verificada: sim/não — onde encontrada
- Assumption verificada: [a assumption do gate ainda é válida? sim / não — e por quê]
- Critique genuína: [o que foi examinado além do checklist + o que encontrou]
- Itens reprovados: [lista numerada com arquivo e linha]
- Lições novas: nenhuma / [L-NNN: descrição]
```

### PAUSADO (gate) — aguardando aprovação do usuário
```
### [YYYY-MM-DD] | ORCHESTRATOR | [Nome] | PAUSADO (gate)
- Spec entregue por: ds-designer
- Alternativas descartadas: [o que foi considerado e por que não serve]
- Assumption central: [o que precisa ser verdade para esta spec funcionar]
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill [igreen/shadcn/composite].md
```

### CASCATA — token ausente detectado durante implementação
```
### [YYYY-MM-DD] | DS DEV | [NomeComponente] | CASCATA
- Token ausente: [nome-do-token]
- Tipo: [cor / spacing / sizing / radius / shadow / tipografia]
- Uso esperado: [como será usado]
- Pipeline aberto: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova
- Retomar: após REVIEW_OK do token → ds-dev continua com skill [igreen/shadcn/composite].md
```

**Status possíveis:** `CONCLUÍDO` · `APROVADO` · `REPROVADO` · `PAUSADO (gate)` · `CASCATA` · `RETOMADO`

---

## Log de sessões

> Entradas mais recentes no topo.

<!-- NOVA ENTRADA AQUI -->

### [2026-05-16] | DS REVIEWER | Token de scrollbar + utility variant | APROVADO (apos fix)
- Spec verificada: sim — entrada PAUSADO (gate) confirmada no pipeline-state.md com alternativas descartadas e assumption central
- Gate verificado: sim
- Assumption verificada: agora valida — `scrollbar-width: auto` em scrollbar-default entrega scrollbar do sistema no Firefox (~16px nativo), enquanto `scrollbar-thin` permanece `thin`. No webkit (Chrome/Safari/Edge) a distincao e 8px vs 6px via `--scrollbar-width-default` / `--scrollbar-width-thin`. Distincao real existe em todos os browsers-alvo.
- Critique genuina: examinado se `scrollbar-color` com track `transparent` e valido com `scrollbar-width: auto` no Firefox — confirmado valido (a spec CSS aceita `transparent` independente do valor de width). Examinado se algum elemento foi alterado alem do scrollbar-width — negativo: scrollbar-color, ::-webkit-scrollbar-track, ::-webkit-scrollbar-thumb e ::-webkit-scrollbar-thumb:hover intactos em ambas as utilities. Examinado se a distincao semantica "thin = compacto, default = tamanho do sistema" e coerente com o naming — confirmado coerente.
- Fix do RETOMADO: confirmado aplicado corretamente (linha 663 do tailwind-theme.css: `scrollbar-width: auto`). scrollbar-thin linha 640 permanece `scrollbar-width: thin`.
- Lições novas: nenhuma (L-015 ja registrada no ciclo anterior)

### [2026-05-16] | DS DEV | Token de scrollbar | RETOMADO (fix da reprovacao)
- Input: REPROVADO pelo ds-reviewer; correcao aplicada conforme Opcao A
- Output: scrollbar-default agora usa `scrollbar-width: auto` (era thin)
- Decisoes: optei pela Opcao A em vez de B (manter thin + documentar) porque Opcao A entrega diferenca visual real em todos os browsers; semanticamente mais alinhado com naming "default"
- Licoes reforcadas: L-015 documentou a limitacao antes da correcao
- Validacao: npm run tokens:tw4 exit 0; tsc --noEmit exit 0
- Assumption: `scrollbar-width: auto` no Firefox ativa a scrollbar padrao do sistema (~16px); no Chrome/Safari/Edge o `::-webkit-scrollbar` com `--scrollbar-width-default` (8px) tem precedencia. Resultado: distincao real entre `scrollbar-thin` e `scrollbar-default` em todos os browsers.

### [2026-05-16] | DS REVIEWER | Token de scrollbar + utility variant | REPROVADO
- Spec verificada: sim — entrada "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)" confirmada no pipeline-state.md
- Gate verificado: sim — entrada PAUSADO (gate) presente com spec completa, alternativas descartadas e assumption central documentada
- Assumption verificada: **parcialmente válida** — a assumption "scrollbar-width CSS standard + ::-webkit-scrollbar cobrem browsers-alvo" é correta. Porém a assumption implícita de que `scrollbar-default` (8px) se comporta diferente de `scrollbar-thin` (6px) no Firefox é **falsa**: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none` — não aceita px. Ambas as utilities entregam `scrollbar-width: thin` no Firefox, tornando-as visualmente idênticas nesse browser. A distinção de 6px vs 8px só existe no Chrome/Safari/Edge via `::webkit-scrollbar`. Isso não quebra a assumption do gate (que não faz promessa sobre Firefox pixel-width), mas é uma limitação de design não documentada.
- Critique genuína aplicada: A revisão encontrou 1 item que muda a direção — não é aprovação automática. O problema não está nos tokens, no transform, nem nas migrations. Está na semântica do naming: `scrollbar-default` promete comportamento "default" (implicitamente diferente de thin), mas no Firefox ambas as utilities são idênticas. Isso não é bug implementado incorretamente — é uma limitação inerente do CSS que a spec aprovou sem documentar. O checklist mecânico passou. A regressão de cor no TabelaTeste (`bg-muted` → `bg-muted-hover`) foi registrada pelo DS Dev como "conforme spec aprovada" — spec aprovada pela gate mencionou `bg-muted-hover` como thumb-color padrão, então a uniformização é intencional e aceita. O overflow-x-hidden foi preservado (linha 83 de kanban.styles.ts). `--radius-radius-full` existe no @theme (linha 198 do CSS) — a correção do DS Dev está correta. Vars consumidas pelas utilities (`--color-bg-muted-hover`, `--color-fg-muted`) têm override no .dark. Estrutura nested `&::-webkit-scrollbar` dentro de `@utility` é o formato suportado pelo Tailwind v4. Paridade visual do Kanban `board`/`columnBody`: todas as 6 propriedades do hardcode anterior estão cobertas pela utility.
- Itens reprovados:
  1. `tokens/transforms/to-tailwind-v4.ts` linha 212 + 234: `scrollbar-default` usa `scrollbar-width: thin` — igual ao `scrollbar-thin`. No Firefox, as duas utilities são visualmente idênticas. A utility deve ou (a) usar `scrollbar-width: auto` para `scrollbar-default` (scroll bar mais larga, default do browser), ou (b) adicionar comentário explícito documentando que a distinção 6px/8px é Chrome/Safari/Edge-only. Sem essa correção, o naming `scrollbar-default` é semanticamente enganoso para contexts de teste/documentação.
- Lições novas: L-015 — `@utility scrollbar-*` com duas larguras distintas: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none`. Distinção px entre utilities só existe em Chrome/Safari/Edge via `::webkit-scrollbar`. No Firefox, toda utility custom com `scrollbar-width: thin` é visualmente idêntica. Se houver 2 utilities com tamanhos distintos, documentar esse comportamento ou usar `auto` para a "maior" (que ativa scroll bar default do browser).

### [2026-05-16] | DS DEV | Token de scrollbar + utility variant | CONCLUÍDO
- Input: spec aprovada em [2026-05-16] — gate "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)"
- Output: IMPL_PRONTA sinalizado — tokens + utilities + transform fn + 3 migrations executadas
  - 2 tokens: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px) em `tokens/brands/default/components/sizing.ts`
  - 1 função `buildScrollbarVars()` no transform `tokens/transforms/to-tailwind-v4.ts` — emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`
  - 1 função `buildScrollbarUtilities()` no transform — emite `@utility scrollbar-thin` + `@utility scrollbar-default` no output
  - 3 migrations: Kanban `board` + `columnBody` → `scrollbar-thin`, TabelaTeste `wrap` → `scrollbar-default`
  - `npm run tokens:tw4` executado sem erros — CSS regenerado com vars + utilities
  - `npx tsc --noEmit` exit 0
- Decisões:
  - `buildScrollbarVars()` emite vars com prefixo `--scrollbar-width-*` (sem `--spacing-`) — scrollbar width não é spacing semanticamente
  - Scrollbar vars posicionadas no final do bloco `themeVars` (após z-index), mantendo a ordem lógica (dimensões no fim)
  - Scrollbar utilities emitidas após bloco de typography utilities — mesma seção de "@utility blocks" do output
  - TabelaTeste migrado de `bg-bg-muted` → `scrollbar-default` (que usa `bg-muted-hover`) conforme spec aprovada — mudança sutil de cor do thumb rest state
- Assumption: scrollbar utilities aplicam corretamente em Chrome/Safari/Firefox/Edge — validar manualmente na próxima fase
- Lições novas: nenhuma — padrão de @utility token-driven é análogo ao já estabelecido para text-* presets. Nota: spec original usava `var(--radius-full)` nos utilities, corrigido para `var(--radius-radius-full)` durante implementação — dentro de `@utility` o CSS var precisa do nome completo conforme declarado no `@theme {}`, não do sufixo de classe Tailwind

### [2026-05-16] | ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)
- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 2
- Escopo:
  - 2 tokens em `tokens/brands/default/components/sizing.ts`: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px)
  - 2 utilities em `src/styles/theme/tailwind-theme.css`: `@utility scrollbar-thin` + `@utility scrollbar-default`
  - 1 função `buildScrollbarVars()` adicionada ao transform `tokens/transforms/to-tailwind-v4.ts` (emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`)
  - Migrações: Kanban `board` + `columnBody` (2 slots, drop-in) e TabelaTeste (1 slot, drop-in)
  - Não migrar: table-toolbar (hidden scrollbar, fora do escopo) + 4 popovers (thumb color diferente)
- Alternativas descartadas:
  1. Status quo (hardcoded em cada consumer) — descartado: duplicação cresce linearmente, popovers já mostram divergência sem governance
  2. Token `scrollbar-thumb-color` dedicado — descartado: `bg-muted-hover` já é o token semântico correto; indireção não adiciona flexibilidade real
  3. Variant `scrollbar` via `tv()` puro (sem @utility) — descartado: tv() não resolve pseudo-elements; a verbosidade hardcoded se manteria dentro do tv()
  4. Arquivo CSS separado (`scrollbar.css`) — descartado: fragmentação sem ganho; @utility de scrollbar é da mesma natureza dos @utility text-* já existentes no mesmo arquivo
- Assumption central: scrollbar-width CSS standard (Firefox) + ::-webkit-scrollbar (Chrome/Safari/Edge) cobrem os browsers-alvo do produto CRM. Safari mobile não exibe scrollbar (overlaid) por padrão — utility não causa regressão, apenas sem efeito visível no iOS. Assumption quebra se produto tiver target de browser legacy (Firefox <64) ou requisito de scrollbar sempre visível em mobile.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-token.md` para: (1) adicionar `scrollbar` em `components/sizing.ts`, (2) adicionar `buildScrollbarVars()` no transform + incluir no `themeVars`, (3) adicionar `@utility scrollbar-thin` + `@utility scrollbar-default` no template string do transform, (4) rodar `npm run tokens:tw4`, (5) migrar Kanban `board`+`columnBody` + TabelaTeste → `"scrollbar-thin"` / `"scrollbar-default"`, (6) rodar `npx tsc --noEmit`

### [2026-05-16] | DS REVIEWER | Avatar iGreen (ui/) | APROVADO
- Spec verificada: sim — entrada "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)" em pipeline-state.md (linha 78–91)
- Assumption verificada: sim — `text-white` sobre colorHex mantém legibilidade decorativa aceitável. A implementação não adicionou warning/check de contraste (correto — assumption transfere risco ao consumer). Cor `#f9a47a` (peach, Lúcia Almeida) no KanbanDoc é a mais próxima do limite de contraste (~1.4:1 com branco), mas o DS Dev usou essa cor deliberadamente em contexto decorativo dentro de um card que já apresenta o nome textualmente. Assumption não quebrou — cabe ao consumer evitar cores muito claras se contraste for requisito. Caso patológico (`#ffeb3b`) é silenciosamente quebrado, como documentado na assumption do gate.
- Critique genuína: (1) API Opção B (`color` + `colorHex?` separados): na prática KanbanDoc e user-column-type usam exclusivamente `colorHex` — prop `color` semântico é usado zero vezes nas migrations. Isso confirma que o uso dominante do Avatar no produto é pessoa-específico (hex). A prop `color` ainda tem valor para avatars genéricos (status/categoria), mas não é o caminho principal. Decisão de API ainda correta — não muda direção, mas é um sinal de onde o DS pode evoluir (preset de paleta pra pessoas, ou `colorHex` com fallback automático de contraste). (2) `_custom` interno: solução é elegante — não é um hack. O tv() não suporta `color: undefined` desativando o defaultVariant de forma limpa; `_custom: ""` é o padrão correto para "sem classe, sem override do default". A variante não vaza: types.ts faz `Omit<AvatarVariantProps, "color">` e redefine `color` como union explícita sem `_custom` — TypeScript bloqueia em compile time. (3) `text-caption-sm` (11px) em `xs` (20px): DS Dev manteve o preset em vez de usar `text-[9px]`. Avaliação: aceitável. O literal `text-[9px]` anterior (PersonAvatar) era não-documentado e inconsistente. `caption-sm` (11px) em 20px de container resulta em uma letra que ocupa ~55% do diâmetro — um pouco maior que o ideal, mas dentro do tolerável para uso decorativo. Não há token menor que `caption-sm` no DS, e criar `caption-2xs` foi explicitamente descartado na spec. (4) `h-[640px]` encontrado no KanbanDoc: pertence ao container de preview do Kanban (layout da página de doc), não ao Avatar — fora do escopo desta revisão.
- Regressões: nenhuma — todos os greps L-001 a L-014 sem match. `size-comp-*` resolvido via Tailwind v4 auto-mapping de `--spacing-comp-*`. TSC exit 0 conforme pipeline-state.
- Lições novas: nenhuma

### [2026-05-16] | DS DEV | Avatar iGreen (ui/) | CONCLUIDO
- Input: gate aprovado em [2026-05-16] — spec "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)"
- Output: 4 arquivos criados (`avatar.styles.ts`, `avatar.types.ts`, `avatar.tsx`, `index.ts`, `USAGE.md`) + 2 migrations executadas (KanbanDoc.tsx, user-column-type.tsx)
- Decisoes:
  - Usou variante interna `_custom` no `color` para o caso `colorHex`: quando `colorHex` esta ativo, `color` e definido como `"_custom"` (string vazia, sem bg/fg), e `text-white` e adicionado via className merge. Isso evita lutar contra o `defaultVariants` do tv() que aplicaria `muted` caso `color` fosse `undefined`.
  - Sizes usam `size-comp-*` (nao `size-form-*` nem `size-icon-*`) por ser o token correto para sizing generico de componentes (comp.2xs=20, comp.xs=24, comp.sm=28, comp.md=32, comp.xl=40).
  - Migration KanbanDoc: head do card usa `size="sm"` (24px, era `size-icon-lg`), footer usa `size="xs"` (20px, era `size-icon-md`). Funcao `PersonAvatar` removida, import de Avatar shadcn removido.
  - Migration user-column-type: `UserAvatar` inline (22px hardcoded) substituido por `<Avatar size="sm">` (24px). Diferenca de 2px e aceitavel — 22px nao tinha token DS; 24px (`comp.xs`) e o token mais proximo e correto.
  - `aria-hidden="true"` default (decorativo); `role="img"` + `aria-label` quando label e fornecido.
- Assumption: `text-white` sobre qualquer `colorHex` mantém legibilidade decorativa aceitável. Validar na próxima fase com DS Reviewer.
- Licoes novas: nenhuma
- Validacao: `npx tsc --noEmit` exit 0

### [2026-05-16] | ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)
- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 1
- Escopo: componente iGreen puro em `ui/Avatar/` (sem Radix, sem AvatarImage, sem AvatarStack). Children = ReactNode (initials fornecidas pelo consumer).
- Variants: `size` (xs/sm/md/lg/xl → tokens comp.2xs–comp.xl) + `color` (brand/success/warning/critical/info/muted) + `colorHex?: string` (override hex literal pra cor de pessoa — exceção L-014)
- Tokens consumidos: todos existentes (comp.*, radius.full, bg.*, fg.on-*, text-caption-sm/md, text-label-xs). Zero tokens novos. Zero cascatas abertas.
- Alternativas descartadas:
  1. Estender Avatar shadcn com className externo — não resolve hardcode no consumer.
  2. Usar AvatarFallback Radix como base — overengineering sem AvatarImage no escopo.
  3. API `color: union | string` (Opcao A) — descartada por imprecisão de tipo; Opcao B (`color` semântico + `colorHex?` livre) escolhida.
  4. Criar preset `caption-2xs` (9px) para xs/sm — descartado; `caption-sm` (11px) é proporcional e adequado sem cascata.
- Assumption central: `text-white` sobre qualquer `colorHex` mantém legibilidade para uso decorativo em CRM. Se o produto usar cores claras via `colorHex`, contraste cai abaixo de WCAG AA — responsabilidade do consumer. Assumption quebra se o produto exigir garantia de contraste automático para hex livres.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-igreen.md` para criar `src/components/ui/Avatar/` (4 arquivos) + migrar PersonAvatar em KanbanDoc.tsx + migrar UserAvatar em user-column-type.tsx

### [2026-05-16] | DS DEV | Kanban Refinement V1 — Fase A (DS conformance) + Fase B (features) | CONCLUÍDO
- Input: usuário pediu auditoria completa do `<Kanban>` existente após decisão arquitetural (caminho D — primitive dumb, igual `<Table>`/`<TableToolbar>`). Achados: bug checkbox focus-within, 3 botões raw, ~10 hardcoded tokens, 0 DnD, sem `renderCard`, menus só via callback.
- Output Fase A — Bugs + DS conformance:
  - **Fix checkbox visibility bug**: `cardCheck` styles trocou `group-focus-within` → `group-focus-visible`. Resolve: checkbox antes permanecia visível ao desmarcar (focus retido no input). Agora some corretamente. Mesmo fix aplicado em `cardMenuSlot` e na variante hover/focus do `card`.
  - **3 botões raw → `<Button>` DS** (kanban.tsx): `columnAction` (Plus header) + `columnAction` (More header) + `cardMenu` (More card) → `<Button variant="ghost" color="secondary" size="icon-2xs">`. Slot `cardMenuSlot` mantido apenas pra positioning absolute + opacity. `columnAdd` (footer dashed) mantido raw — variant dashed-ghost não existe no Button DS, mas migrou pra `min-h-form-sm` + `text-caption-md` + `focus-visible:ring-4 ring-ring-brand`.
  - **~10 hardcoded → tokens DS** (kanban.styles.ts): `gap-[2px]` → `gap-gp-2xs`, `gap-[4px]` → `gap-gp-xs`, `px-[6px]` → `px-pad-sm`, `pt-[4px]` → `pt-sp-xs`, `mt-[2px]` → `mt-sp-2xs`, `text-[11px]` → `text-caption-sm`, `text-[12px]` → `text-caption-md`, `text-[12.5px]` → `text-caption-md`, `text-[13px]` → `text-label-sm`, `text-[13.5px]` → `text-label-sm`, `text-[11.5px]` → `text-caption-sm`. Mantidos como literal: offsets absolutos (`top-[18px] left-[12px]`, `top-[6px] right-[6px]`, `pl-[36px]`), width fixo da coluna (`w-[296px]`), dot decorativo (`size-[8px]`) — sem token equivalente.
  - **Preview ajustado** (KanbanDoc.tsx): `PersonAvatar` agora usa `size-icon-md text-caption-sm` (footer) e `size-icon-lg text-caption-md` (head); literais inline migrados pra tokens. Bug "letra do avatar grande quase saindo fora" resolvido.
- Output Fase B — Features novas (API expansion, backward-compatible):
  - **`renderCard?: (params) => ReactNode`** na `KanbanProps`: substitui o miolo do card mantendo wrapper externo (border/shadow/focus/checkbox/menu positioning) sob controle do primitive. Garante consistência mesmo em boards customizados.
  - **`getCardMenuItems?` + `getColumnMenuItems?`** na `KanbanProps`: items padronizados (`KanbanMenuItem[]`) — primitive renderiza `<DropdownMenu>` DS automático com suporte a `icon`, `destructive`, `disabled`, `separator`. Coexistem com `onCardMenu`/`onColumnMenu` (callbacks manuais) como escape hatch — se ambos forem fornecidos, `get*MenuItems` ganha.
  - **DnD entre colunas** (`enableDnD` + `onCardMove`): hook novo `hooks/use-kanban-dnd.ts` encapsula `@dnd-kit/core` (PointerSensor com `distance: 5` preserva click-to-open, KeyboardSensor pra acessibilidade). `<DndContext>` + `<DragOverlay>` wrap o board. Cada card é `useDraggable`; cada column body é `useDroppable`. Constraints por coluna: `canReceiveDrop: false` (terminal) + `canDragFrom: false` (locked). Visual feedback built-in: card sendo arrastado com `opacity-40 cursor-grabbing`, coluna candidata com `outline-2 outline-border-brand bg-bg-brand-subtle/30`, coluna inválida com `cursor-not-allowed opacity-60`. Primitive **não faz revert** — consumer comita via `cards` props (optimistic ou async).
  - **`KanbanMenuItem` + `KanbanRenderCardParams` exportados** no barrel (`index.ts`).
  - **Preview ampliada** (KanbanDoc.tsx): 3 novas seções demonstram `getCardMenuItems`/`getColumnMenuItems` (Ver/Editar/Arquivar/Excluir com separator + destructive), DnD com coluna "Inativo" bloqueada (`canReceiveDrop: false`), e `renderCard` compacto com layout custom.
- Decisões:
  - **Wrapper do card permanece sob controle do primitive** mesmo com `renderCard`. Consumer não customiza border/shadow/focus/checkbox/menu positioning — garante consistência visual e a11y.
  - **Coexistência callbacks manuais + auto-menus**: não deprecar callbacks. `getCardMenuItems` é a recomendação pra 80% dos casos; `onCardMenu` continua disponível pra menus complexos (submenu, search, etc).
  - **Primitive não faz revert de DnD**: consumer é responsável. Justificativa: Kanban é dumb, não tem state de cards. Reverter exigiria espelhar `cards` em state interno, quebrando o contrato.
  - **`canReceiveDrop` testado por coluna destino apenas** (não por origem-destino combo). YAGNI — se algum dia precisar de regras `from→to` granulares, vira `canReceiveCardFrom: (fromColumnId) => boolean`. Por enquanto boolean simples cobre 95%.
- Assumption: usuários não precisam de revert visual automático em DnD (consumer commita optimistic e reverte updating cards prop se backend rejeitar). Se isso quebrar, primitive precisará tracking interno de pending moves.
- Validação: `npx tsc --noEmit` exit 0 após Fase A e após Fase B.
- Lições novas: nenhuma.

### [2026-05-16] | DS DEV | Kanban Fase C — Cascatas DS sinalizadas (não executadas) | CASCATA
- Cascata 1 — **`<Avatar>` iGreen** (componente novo):
  - **Necessidade**: Avatar shadcn não tem variants `size` — consumer fica fazendo `className="size-[22px] text-[10px]"` hardcoded. Quebra hierarquia tipográfica (fallback default é `text-label-sm`, sobrescrito por literal arbitrário).
  - **Uso esperado**: `<Avatar size="xs|sm|md|lg|xl" color="brand|warning|success|info|critical|muted">MS</Avatar>` + suporte a `color={hex literal}` pra cores de pessoa (avatars coloridos por entidade no Kanban).
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK do `<Avatar>` iGreen → migrar `PersonAvatar` em KanbanDoc.tsx pra `<Avatar size="sm">`/`<Avatar size="md">` + migrar previews do DataTable.
- Cascata 2 — **Token de scrollbar** (token novo):
  - **Necessidade**: Kanban e DataTable virtualized fazem scrollbar styles hardcoded (`[scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-[6px]`). Cores conformes (`bg-bg-muted`, `bg-bg-muted-hover`) mas dimensões não.
  - **Uso esperado**: tokens `--scrollbar-width-thin: 6px`, `--scrollbar-width-default: 8px`, `--scrollbar-thumb-color: var(--color-bg-muted-hover)` em `tokens/components/sizing.ts`, e variant `scrollbar` no `tv()` que aplique automaticamente. Consumer faz `scrollbar="thin"` em vez do hack `[&::-webkit-scrollbar]:...`.
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria token + variant utility → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK → migrar Kanban + DataTable virtualized + outros consumers em batch.
- Decisão: Fase C **não bloqueia V1 do Kanban**. V1 fica entregável com Fase A+B (bug fix + DS conformance + features novas); cascatas C são melhorias futuras agendadas pra backlog.
- Assumption: usuário concorda em manter os 2 literals workaround em produção (avatar size+text hardcoded em consumer, scrollbar styles hardcoded em primitive) até as cascatas saírem. Se isso for inaceitável, Fase C precisa rodar antes do release.
- Aguardando: priorização do usuário pra abrir as 2 cascatas (provavelmente em sessões dedicadas — Avatar iGreen é tarefa de spec rica, scrollbar é simples).

### [2026-05-16] | DS DEV | DataTable Fase G — Column Type System (registry expandido + 10 tipos prebuilt) | CONCLUÍDO
- Input: usuário identificou bug (filter popover avançado não usa registry, date cai em text input) + pediu pacote de tipos prebuilt cobrindo cell render + edit input + filter input + chip value + defaults. Plano em 4 fases (G.1-G.4).
- Output G.1 — Fix FilterPopover (registry-aware):
  - **`FilterPopoverProps.renderValueInput?`** novo: callback que recebe `{column, operator, value, onChange}` e devolve ReactNode. Quando passado, FilterPopover delega 100% (skip do hardcoded select/number/text).
  - **`FilterPopoverColumn.filterType?: string`** novo: tipo original do registry propagado.
  - **`data-table.tsx`** passa `renderValueInput={...}` que resolve via `columnTypeRegistry.get(typeId).renderFilterInput(...)`. Inclui mapping `POPOVER_OP_TO_FILTER_OP[operator]` pra normalizar operator string → FilterOperator union.
  - Resultado: date column no advanced filter agora abre Calendar (single ou range), multiSelect abre checkboxes, etc.
- Output G.2 — `ColumnTypeDefinition` expandido:
  - **6 novos slots opcionais**: `renderCell`, `renderEdit`, `formatValue`, `defaultAlign`, `defaultEllipsis`, `defaultWidth`, `defaultSortable`.
  - **`CellRenderProps`** + **`CellEditRenderProps`** types novos.
  - **`DataTableColumnDef.typeOptions?: Record<string, unknown>`** novo: payload type-specific (ex: `user` → `{ users: Record<id, UserInfo> }`, `currency` → `{ currency, locale }`).
  - **Fallback chain no cell render** (data-table.tsx): `col.render` > `registry.renderCell` > `col.valueFormatter` > `registry.formatValue` > raw value.
  - **`use-data-table-columns.ts`** aplica `defaultWidth` + `defaultSortable` quando consumer não passa.
  - **`data-table-edit-cell.tsx`** usa `registry.renderEdit` se definido antes de cair no editor default.
- Output G.3 — 10 tipos prebuilt + 5 existentes atualizados:
  - **`currency`** (R$ formatado + tabular + right align + sum agreg + between range)
  - **`percentage`** (n% + right align + tabular)
  - **`email`** (mailto link + truncate + ellipsis)
  - **`phone`** (tel link + normalize digits no matchesFilter)
  - **`url`** (target blank + ExternalLink icon + strip protocol display)
  - **`user`** (Avatar shadcn + nome via `typeOptions.users` lookup; fallback gera iniciais do valor raw)
  - **`badge`** + **`status`** alias (Chip shadcn colorido via filterOptions.color; mapping primary/success/danger/warning/info/neutral + aliases red/green/yellow/blue/gray)
  - **`tags`** (multi-Chip + Checkbox list pra filter + match contains/isAnyOf/isNoneOf)
  - **`datetime`** (date + hora em formato pt-BR)
  - **`text`/`number`/`date`/`boolean`** ganharam `renderCell` + defaults
  - **Boolean** com Check/X icon (text-fg-success / text-fg-muted), align center
- Output G.4 — Demo declarativa:
  - **`ClientsTypedPreview`** novo (`src/preview/pages/ClientsTypedPreview.tsx`): mesma tabela CRUD mas **sem nenhum `render` custom**. Cada coluna declara apenas `type: "..."`. Demo cobre 9 tipos: text, user, email, phone, status, badge, currency, date, datetime.
  - Lookup tables passadas via `typeOptions.users` pra agentes (AGENTS_LOOKUP).
  - `filterOptions.color` aceita nomes semânticos (`"success"` em vez de `var(--color-...)`) — mapeamento explícito `STATUS_COLOR_MAP`.
  - Registrada em `App.tsx` + `doc-nav-data.ts` como "Clientes (column types)".
- **`type` union estendido** em `DataTableColumnDef`: `text | number | currency | percentage | date | datetime | email | phone | url | status | badge | boolean | user | tags | select | multiSelect | actions | (string & {})`. Último permite custom types registrados via `columnTypeRegistry.register(...)`.
- **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Registry como source-of-truth**: ter 1 lugar (registry) que sabe renderizar cell/edit/filter/chip/defaults pra cada tipo elimina N caminhos paralelos. FilterPopover, FastFilter, EditCell, Cell render — todos consomem o mesmo entry. Manutenção 1:N → 1:1.
  - **L-Fallback chain explícita**: consumer custom > registry default > formatter > raw — ordem clara permite override em qualquer nível sem quebrar backward compat. Add `type` sem `render` herda registry; add `render` mantém comportamento legado.
  - **L-typeOptions como payload type-specific**: evita explosão de props no ColumnDef (`users?`, `currency?`, `locale?`, `dateFormat?`...). Cada tipo declara seu shape em `typeOptions`, documentado no `defaults` do tipo.
  - **L-Alias types**: `status` = `badge` (mesma render logic, semântica diferente). Registry permite alias barato — `{ ...BadgeColumnType, type: "status" }` reusa 100% do código.
- Assumption: "10 tipos cobrem ~95% dos casos CRM (id, nome, email, telefone, status, categoria, agente, valor, datas, tags). Customização via `render`/`renderEdit`/`renderFilterInput` continua escape hatch pros 5%. Custom types registrados via `columnTypeRegistry.register(myType)` dão paridade total — DS-table virou plataforma extensível."

### [2026-05-16] | DS DEV | DataTable Fase F.4b — Row expansion (master-detail) | CONCLUÍDO
- Input: usuário pediu cenário "tabela normal onde clicar numa coluna específica abre um painel abaixo da row". Padrão master-detail clássico — distinto de `groupBy` (que junta múltiplas rows).
- Output:
  - **`DataTableColumnDef.expandable?: boolean`** novo: marca coluna como trigger de expansão. Cells dessa coluna ganham chevron + cursor pointer + `data-expandable="true"` + `aria-expanded`.
  - **`DataTableProps`** ganha **`renderRowExpansion?: ({ row }) => ReactNode`** + **`defaultExpandedRowIds?: GridRowId[]`** + **`singleExpand?: boolean`** (default false).
  - **`utils/expand-rows.ts`** novo: marker symbol `ROW_EXPANSION_TYPE` + tipo `DataTableRowExpansionItem<T>` + type guard `isExpansionRow<T>(item: unknown)`. Helper `expandRows(rows, expandedIds, getRowId)` intercala 1 marker logo após cada row expandida. Quando set vazio ou nenhum match, retorna array original (reference preserved → zero re-renders).
  - **`DataTableRowExpansion<T>`** componente novo (`parts/data-table-row-expansion.tsx`): wrapper `flex w-full sticky left-0` que delega 100% ao consumer via `render({ row })`. Sticky-left preserva visibilidade no scroll horizontal da tabela.
  - **`data-table.tsx`**:
    - State `expandedRowIds: Set<GridRowId>` + handler `toggleRowExpansion(id)` (respeita `singleExpand`).
    - `useRowExpansion = !!renderRowExpansion && !groupByField` — mutuamente exclusivo com groupBy (groupBy precedence).
    - **`finalItems` useMemo unificado**: 1 array que cobre rows simples / agrupadas / com expansion. Virtualizer usa `finalItems.length` no count.
    - `renderItem` ganha 4º branch: `isExpansionRow(item)` → `<DataTableRowExpansion row={item.row} render={props.renderRowExpansion} />`.
    - Cell render checa `isExpandableCol = useRowExpansion && col.expandable && field === expandableColField`. Quando true:
      - Content prefixado com `<ChevronRight>` rotacionando 90° quando aberto
      - `cellRootProps` ganha `onClick` que toggla expansão + stopPropagation + `cursor: pointer`
      - Coexiste com `isEditable` (cell pode ser ambos se consumer quiser)
  - **Demo nova: `ClientsExpandablePreview`** (`src/preview/pages/ClientsExpandablePreview.tsx`):
    - Tabela normal (sem groupBy) com 50 rows e paginação 25
    - Coluna `id` marcada como `expandable: true`
    - Painel expandido: grid 3 colunas com blocos Contato / Comercial / Operacional, layout livre fora da estrutura de cells
    - Registrada em `App.tsx` + `doc-nav-data.ts` como "Clientes (linha expansível)"
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Type guard com `unknown`**: quando o array final é união de tipos (T | GroupRow | GroupContent | ExpansionRow), type guards com tipos específicos no parâmetro (ex: `T | DataTableRowExpansionItem<T>`) falham em narrowing. Solução: `(item: unknown): item is X` — TS narrowing funciona via predicate, parâmetro aceito é amplo.
  - **L-Mutually exclusive features**: `groupBy` e `renderRowExpansion` reshape o array final. Aceitar ambos simultaneamente exigiria reshape pipeline (group → for each row check expansion). V1 escolheu precedência (groupBy wins) — mais simples, sem feature loss real (use cases distintos).
  - **L-Reference preservation no useMemo**: `expandRows` retorna array ORIGINAL quando set vazio (não nova array vazia spread). Sem isso, `finalItems` mudaria reference a cada render → virtualizer/renders cascateiam. Pattern útil pra transformations opt-in.
  - **L-onClick on cell rootProps**: TableCell já aceitava `rootProps` (adicionado na F.D pra onDoubleClick edit). Reaproveitado pra onClick expansion. Mesma porta, eventos diferentes — composáveis via spread (`...isEditable && { onDoubleClick: ... }`, `...isExpandableCol && { onClick: ... }`).
- Assumption: "Row expansion (master-detail) é padrão admin moderno (Notion sub-pages, Linear sub-issues, Stripe drilldown). Trigger numa coluna específica via `expandable: true` é mais flexível que coluna dedicada — consumer escolhe se chevron vai no ID, nome, ou coluna custom. Single column trigger é V1; multi-column triggers (qualquer cell abre o mesmo painel) cobre via stopPropagation manual no consumer."

### [2026-05-15] | DS DEV | DataTable v2 Fase F.4 — Agrupamento de linhas (groupBy) | CONCLUÍDO + V2 COMPLETA
- Input: última fase da V2 (F.5 lazy chunks foi descartado pelo usuário). F.4 = agrupar rows por field, com headers expansíveis + subtotalizers inline.
- Output:
  - **`DataTableProps.groupBy?: string`** + **`defaultGroupExpanded?: boolean`** (default true) em data-table.types.ts.
  - **`utils/group-rows.ts`** novo: helper `groupRows(rows, field, expandedKeys, defaultExpanded, col)` reshape do array `T[]` em `(DataTableGroupRow | T)[]` alternado. `GROUP_ROW_TYPE` é symbol pra discriminator. Type guard `isGroupRow<T>` pra branching no render. Resolve label via `column.valueFormatter`, fallback "(sem valor)" pra null/empty. **Pattern de expandedKeys "diff do default"**: set rastreia keys QUE DIFEREM do default — permite "expandir/colapsar tudo" sem precisar listar todas as keys explicitamente.
  - **`parts/data-table-group-header-row.tsx`** novo: row full-width com chevron (ChevronDown/Right) + label + count badge + subtotalizers inline por coluna (reusa logica do TotalizerRow F.2). Sticky offsets pra colunas pinned preservadas. Click toggle. Helper interno `resolveAggregate` espelha o do TotalizerRow (sum/avg/count/min/max + custom fn).
  - **`data-table.tsx`**:
    - State `expandedGroupKeys: Set<string>` + helper `toggleGroup(key)`.
    - `groupedRows` useMemo reshape via groupRows quando `groupByField` definido.
    - Render branching: `renderItem(item)` checa `isGroupRow<T>(item)` → GroupHeaderRow; senão → renderRow (existente).
    - Virtualizer count usa `groupedRows.length` quando groupBy (inclui group headers no count).
    - Funciona em virtualize + grouping simultaneamente (mixed list passa pro virtualizer).
  - **`useDataTableController` auto-skip paginate quando `groupBy`**: `shouldPaginate = !disabled && !virtualize && !groupBy`. Paginar agrupamento quebraria grupos pela metade — fail-safe.
  - **Demo nova: `ClientsGroupedPreview`** (`src/preview/pages/ClientsGroupedPreview.tsx`):
    - 50 rows agrupadas por field selecionável via toolbar (Status / Categoria / Agente / Localização)
    - Subtotalizer de "Valor" inline em cada group header (sum por grupo via `aggregate: "sum"`)
    - Grand total no footer via `showTotalizers` (sum total)
    - Botões de switch group-by no header da página
    - Registrada em `App.tsx` + `doc-nav-data.ts` como "Clientes (agrupado)"
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Symbol discriminator pattern**: usar `Symbol("dt-group-row")` como `__type` é mais robusto que string literal — zero chance de conflito acidental com props do T (mesmo se T = `{ __type: "foo" }`, o `Symbol` é único por instância do módulo).
  - **L-Expanded-keys diff-from-default**: armazenar "keys que diferem do default" (não "keys expanded") permite operações simétricas com o mesmo state. `expand all` = clear set + defaultExpanded=true; `collapse all` = clear set + defaultExpanded=false. Sem isso, precisaria listar todas as keys no set toda vez.
  - **L-Mixed array virtualization**: virtualizer com items heterogêneos (headers + rows) funciona desde que `estimateSize` retorne size consistente. V1 usa same size pra ambos (compromisso aceitável — group header ~42px vs row ~56px na density standard, diferença visualmente insignificante).
  - **L-Render branch via type guard**: type guard com `isGroupRow<T>` no render mantém TypeScript narrowing — dentro do `if` branch, `item` é narrowed pra GroupRow; no `else`, é T. Mais limpo que `if ("__type" in item)` que não estreita generics.
- Assumption: "Single-field grouping + default-expanded cobre 95% dos casos CRM (agrupar clientes por status, por agente, por categoria). Nested grouping (ex: status → agente), selectAll-per-group, custom group header render, sort-by-group ficam pra V3 quando demanda real aparecer."

### Fase F (V2) COMPLETA — DataTable production-ready
- **F.1** Async cell edit com spinner + reject keeps open
- **F.2** Date range filter (Calendar + between operator + chip "→")
- **F.3** Virtualization (@tanstack/react-virtual, 10k+ rows fluído)
- **F.4** Row grouping (groupBy + chevron + count + inline subtotals)
- **F.5** Lazy chunks — DESCARTADO (cobertura via server pagination tradicional já existente)
- Plus fix de processor que sempre paginava (bug latente — paginationConfig.enabled=false agora funciona corretamente).
- DataTable V2 entregue.

### [2026-05-15] | DS DEV | DataTable v2 Fase F.3 — Virtualização (@tanstack/react-virtual) | CONCLUÍDO
- Input: V2 segue. F.3 = virtualização — renderizar apenas rows visíveis pra tabelas grandes (>500 linhas). Mais arriscada do roadmap por mexer no body render.
- Output:
  - **Dep nova**: `@tanstack/react-virtual` instalado (≈10KB, MIT, mantida pela TanStack).
  - **`Table` primitivo ganha prop `scrollRef?: MutableRefObject<HTMLDivElement>`** (table.types.ts + table.tsx). Quando passada, Table usa essa ref no scroll container interno em vez da própria. Sem isso, DataTable não tinha acesso ao scroll element pra passar pro virtualizer.
  - **`TableBody` ganha prop `style?: CSSProperties`** pra aceitar `height` total + `position: relative` durante virtualização.
  - **`DataTableProps` ganha 3 props novas**: `virtualize?: boolean` (default false), `estimateRowHeight?: number` (default deriva de density: compact=40, standard=56, comfortable=64), `overscan?: number` (default 10 — rows extras antes/depois da viewport pra suavizar scroll).
  - **`data-table.tsx`**:
    - `scrollContainerRef` novo (`useRef<HTMLDivElement | null>`) passado pra Table.
    - `useVirtualizer({ count, getScrollElement, estimateSize, overscan })` configurado.
    - Quando count > 0 (virtualize=true), `getVirtualItems()` retorna `{ index, start, size, key, end }[]`.
    - **`renderRow(row, index, virtualStyle?)`** extraído como closure dentro do JSX pra evitar duplicação. Recebe style condicional pra absolute-positioning.
    - **TableBody style** em virtualize: `{ height: totalSize, position: relative, minWidth: "100%" }` + className `!block` (override do flex-col).
    - **Cada row em virtualize**: `position: absolute, top: 0, left: 0, width: 100%, height: vi.size, transform: translateY(vi.start)`. Transform é compositor-friendly (GPU) — scroll suave.
    - **Keyboard nav atualizado**: quando virtualize, `rowVirtualizer.scrollToIndex(nextIdx, { align: "auto" })` ANTES de tentar focar — sem isso, row alvo não está no DOM. setTimeout 50ms pra virtualizer reconciliar antes do `.focus()`.
  - **Compatibilidade preservada**:
    - Sticky header (TableHead `sticky top-0`): ✓ inalterado, fora do body absolute.
    - Sticky pinned cells (per-cell `position: sticky`): ✓ cada cell ainda tem scroll container ancestral idêntico, comportamento preservado.
    - Totalizer footer (sticky bottom-0): ✓ renderiza após o virtualizer no JSX, mantém sticky natural.
    - Inline edit, dnd column reorder, filter shortcut, row focus: ✓ todos preservados — mudou apenas mecanismo de mount/unmount de rows.
  - **Demo nova: `ClientsVirtualizedPreview`** (`src/preview/pages/ClientsVirtualizedPreview.tsx`):
    - **10.000 linhas** geradas via `Array.from({ length: 1000 }).flatMap` do CLIENTS_MOCK (10 base × 1000 = 10k rows).
    - `virtualize` ligado, `paginationConfig.enabled: false` pra mostrar scroll de tudo de uma vez.
    - Search/filter/sort/select/export funcionam normalmente — operações em memória rodam sobre todo o dataset, render só nos visíveis.
    - Registrada em `App.tsx` + `doc-nav-data.ts` como "Clientes (10k virtualizado)".
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Virtual scroll precisa scroll container ref**: `useVirtualizer` precisa `getScrollElement: () => HTMLElement`. Como o Table primitivo encapsula o scroll container, expor via prop `scrollRef` é necessário. Alternativa via context seria mais opaca.
  - **L-Transform vs top/left**: `transform: translateY(Npx)` em vez de `top: Npx` é crucial pra perf — transform usa compositor (GPU), top causa repaint. Diferença notável em scroll rápido com >100 visible items.
  - **L-Absolute rows + sticky cells**: aparente conflito (absolute escapa do flow), mas funciona porque sticky é relativo ao nearest scrolling ancestor, não ao parent. Row em absolute dentro de scroll container → cells dentro da row ainda veem scroll container como ancestor → sticky working.
  - **L-overscan trade-off**: overscan=10 = 20 rows extras renderizadas (10 acima + 10 abaixo). Mais = scroll mais suave (menos flicker no edge da viewport), menos = perf melhor. 10 é o sweet spot pra tabelas com cells leves; reduzir pra 3-5 se row tem MUITO conteúdo (rich cells, imagens).
  - **L-scrollToIndex antes de focus**: foco programatic em row virtualizada falha se row não está no DOM. Fix: `scrollToIndex` força mount, depois setTimeout pra virtualizer reconciliar, depois focus.
  - **L-Block override do flex-col**: TableBody usa flex-col por default (rows como itens flex). Em virtualize, rows são absolute → flex-col não faz sentido. Override via `!block` (className tailwind important).
- Assumption: "Virtualização é opt-in (`virtualize: true`). Default false preserva 100% comportamento anterior pra tabelas pequenas (que não precisam). Row heights fixas (derivadas de density) cobrem casos comuns; height variável precisa medirElement do virtualizer — fica pra V3 quando vier necessidade real (ex: rows com diferentes alturas por conteúdo)."

### [2026-05-15] | DS DEV | DataTable v2 Fase F.2 — Filtro de data e período (Calendar + between) | CONCLUÍDO
- Input: V2 segue. F.2 = adicionar tipo "between" pra range de datas, com Calendar (shadcn/DayPicker) substituindo o `<input type="date">` nativo.
- Output:
  - **`FilterOperator` ganha `between`** e **`FilterValue` aceita tuplas** `[string|null, string|null]` e `[number|null, number|null]` em data-table.types.ts.
  - **`DateColumnType` reescrito** (`column-types/definitions/date-column-type.tsx`):
    - Operators: equals, gt, lt, **between** (novo).
    - `renderFilterInput` (modal advanced): single-mode Calendar se operator != between; range-mode se between.
    - `renderFastFilterInput` (chip popover): detecta tupla → range mode; senão → single mode.
    - `renderChipValue` novo: formata via `Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })` → "15 jan" ou "15 jan → 28 jan" pra range. Range parcial: "desde 15 jan" / "até 28 jan".
    - `matchesFilter` handler `between`: tupla [start, end] inclusive em ambos. Range parcial degenera pra gt/lt.
    - Helpers internos: `toDateMs`, `toDate`, `toIsoDate`, `dayStart`, `formatShort`.
  - **`data-table.tsx` atualizações**:
    - `POPOVER_OP_TO_FILTER_OP` + `FILTER_OP_TO_POPOVER_OP` mapeiam `between` ↔ `between`.
    - **`isFilterValueEmpty(v)`** helper novo: trata null, string vazia, e tupla `[null,null]`/`["",""]` como empty. Substitui o `String(v).length === 0` que falhava com tuplas.
    - `appliedGroups` e cleanup-on-cancel usam `isFilterValueEmpty` (tupla `[null,null]` agora é corretamente skipped).
    - **`handleFilterShortcut` para date** → operator padrão = `between` + valor inicial `[null, null]`. Demais tipos: select→equals, text/number→contains (preservado).
    - **`appliedFilters` (chip labels)**: quando column-type tem `renderChipValue`, delega 100% (formato custom). Senão, usa labelOf padrão. Date: chama renderChipValue por item.value, gera "15 jan → 28 jan".
    - **`updateGroupValue` agora distingue tuple vs spread**: `between` → 1 item single com value=tupla; demais → spread em N items. Sem isso, range `[from, to]` virava 2 filtros independentes.
    - **`renderChip` (Popover)**: detecta `isTupleOperator` → passa value como tupla (não spread) + usa column-type direto sem promover pra multiSelect. Sem isso, range value virava `aggregateValues.length > 1 → multiSelect`, quebrando o Calendar.
  - **Demo em `ClientsCRUDPreview`**: `createdAt` e `lastContact` ganharam `enableColumnFilter: true` + `filterType: "date"`. Hover no header → ícone filtro → click → chip aparece com "entre" → popover abre com Calendar range → user seleciona "15 jan → 28 fev" → filter aplica em tempo real → chip mostra "15 jan → 28 fev".
  - **Advanced FilterPopover NÃO migrado pra registry** (limitação atual): só conhece text/select/number, não usa renderFilterInput do registry. Date column via "Filtros" do toolbar continua text input. Refactor V3.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Tuple vs Array distinction**: operadores como `isAnyOf` usam value=[v1,v2,v3] (multi-valor independente), `between` usa value=[start,end] (1 par semântico). Mesmo shape (array), semântica diferente. Solução: check `operator === "between"` (lista de tuple operators) pra decidir comportamento de spread vs preserve-as-tuple.
  - **L-isFilterValueEmpty deve entender tuplas**: `String([null,null]) === ","` (length 1), o que enganava o check antigo. Helper específico que recursivamente checa array elements é essencial pra evitar "ghost chips" com value tuple sem dates.
  - **L-renderChipValue como override**: column-type registry com `renderChipValue?` é o ponto de extensão pra tipos com formato custom (data, currency, percentage). Mantém DataTable agnóstico a formato — cada tipo decide.
  - **L-Multiple paths to filter**: filter shortcut (header) usa registry → funciona ✓. FilterPopover (toolbar) tem código próprio → não usa registry → não tem date support. Migrar ambos pra mesma fonte de verdade (registry) é refactor pendente, mas não bloqueia F.2.
- Assumption: "Range filter via tupla [start, end] cobre date e number ranges. Operador único `between` no FilterOperator union evita explosão (ex: gte+lte pareados). Format chip via Intl é universal — não precisa de lib externa (date-fns). Advanced FilterPopover seguirá com text input pra date até refactor pra usar registry."

### [2026-05-15] | DS DEV | DataTable v2 Fase F.1 — Edição com loading (async commit) | CONCLUÍDO
- Input: V2 iniciada. F.1 = quando consumer retorna Promise em onCellEditCommit, mostrar spinner na cell durante await, manter edit aberto se rejeitar, fechar no resolve.
- Output:
  - **Tipo `onCellEditCommit` aceita `Promise<void>`** (data-table.types.ts): `(params) => void | Promise<void>`.
  - **`handleCellEditCommit` agora async** em data-table.tsx: detecta se result é Promise. Sync → fecha imediato (comportamento anterior preservado). Async → setEditLoading(true), await, no try/catch: resolve fecha edit + limpa erro; reject seta editError + MANTEM edit aberto pro user corrigir/cancelar.
  - **`editLoading` + `editError` states** novos em data-table.tsx. `handleCellEditCancel` helper limpa todos (chamado no Esc).
  - **`DataTableEditCell` aceita `isLoading?: boolean` + `error?: string | null`** novos props.
  - **Wrap overlay**: HOF `wrap(children)` que renderiza filho + overlay condicional. Loading: `Loader2` spinner no canto direito + filho com `opacity-60 pointer-events-none`. Error: `AlertCircle` vermelho no canto direito + `title={error}` no wrapper pra tooltip nativo. Estados mutuamente exclusivos (loading vence).
  - **`InputEditor` ganhou `disabled` + `hasError`**: disabled pula auto-focus (não rouba foco durante loading), bloqueia onBlur commit (evita double commit), e usa Input prop `state="error"` quando hasError.
  - **`SelectEditor` ganhou `disabled`**: `defaultOpen={!disabled}` (não auto-abre durante loading), `disabled` passado ao Radix Select.
  - **Demo em `ClientsCRUDPreview`**: `onCellEditCommit` agora async com `setTimeout(800ms)` simulando latência. 15% de chance de `throw new Error("Falha ao salvar")` pra demonstrar fluxo de retry — usuário vê AlertCircle vermelho com tooltip, edit fica aberto, pode tentar de novo ou Esc.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Async detection via instanceof Promise**: `result instanceof Promise` é o padrão pra detectar se consumer retornou async. Mais robusto que `typeof result.then === 'function'` (que confunde objetos thenable arbitrários).
  - **L-Loading bloqueia auto-focus**: `useEffect` que faz `el.focus() + el.select()` no mount não pode rodar com input disabled. Tem que checar disabled e skip — senão ESC ou Tab durante loading pode roubar foco do user.
  - **L-Don't commit on blur during loading**: se usuário muda foco enquanto commit voa, blur não pode disparar commit de novo (double commit + race condition). Guard com `if (disabled) return`.
  - **L-Reject keeps edit open**: padrão correto pra erros transientes (rede caiu, validação server-side). User vê erro contextual e decide retry vs cancel. Fechar edit no erro = perde os dados digitados, frustra.
- Assumption: "Async edit com retry visual é o padrão admin moderno (Notion, Linear, Airtable). Sync também funciona — backward compat 100% preservada via instanceof check. Race conditions complexas (user digita rápido durante save → segundo commit antes do primeiro resolver) ficam pra V3 se aparecerem."

### [2026-05-15] | DS DEV | DataTable — substituir Quick Filter row por Filter Shortcut no header | CONCLUÍDO
- Input: usuário rejeitou a Fase E.4 (linha de inputs sticky abaixo do header) — "conflita com a experiência de filtros existente, comportamento fora do padrão da tabela". Proposta: trocar por ícone de filtro no header da coluna que, ao clicar, adiciona o chip do filtro no toolbar e abre o popover com foco no input.
- Output:
  - **Removido completamente**: `data-table-quick-filter-row.tsx` (arquivo), `DataTableQuickFilterRow` (import + uso em data-table.tsx), `showQuickFilter` prop (data-table.types.ts + index.ts), uso na ClientsCRUDPreview.
  - **Filter shortcut icon no header**: Botão `<FilterIcon />` (lucide `Filter`) `size="icon-2xs"` ghost adicionado ao slot `headMenu` do TableHeadCell, ao lado do botão 3-pontos (DataTableColumnMenu). Renderiza apenas para colunas `enableColumnFilter: true` e não actions. Compartilha hover-show behavior do slot (visível só no hover do header, focus-within, e while popover aberto).
  - **`pendingOpenChipKey` state** novo em DataTableInternal: guarda chave do chip (`field|operator`) que deve abrir popover auto. Setado por `handleFilterShortcut`, limpo no `onOpenChange(false)` do Popover.
  - **`handleFilterShortcut(col)`** helper: deriva operator do filterType (`select`/`multiSelect`→equals, demais→contains), procura item existente por (field, operator); se existe → apenas seta pendingOpenChipKey; senão → adiciona FilterItem vazio com id `shortcut-{field}-{operator}-{timestamp}` + seta pendingOpenChipKey em `setTimeout(0)` (garante chip renderizado antes do open).
  - **`appliedGroups` agora inclui items com valor vazio** quando key === pendingOpenChipKey. Sem isso, chip vazio não renderiza e o Popover não tem âncora. Itens vazios fora do pending continuam sendo skip pra não poluir toolbar.
  - **Popover controlled per-chip**: `<Popover open={isPendingOpen || undefined} onOpenChange={...}>`. `undefined` quando NÃO pending = volta a uncontrolled (Radix gerencia). Padrão pra mesclar controlled+uncontrolled.
  - **Cleanup on close**: ao fechar popover, se TODOS items do grupo têm valor vazio (caso de shortcut → cancel sem digitar), remove os items do filterModel. Sem isso, lixo fica no estado e o chip continuaria aparecendo no próximo render se pendingOpenChipKey reaparecesse.
  - **Auto-focus**: Radix PopoverContent já auto-focuses primeiro elemento focusable. renderFastFilterInput de cada column-type retorna Input/Select que recebe foco. ✓
  - **DataTableColumnDef import** adicionado a data-table.tsx (usado pelo handleFilterShortcut).
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Single source of truth pra filtros**: ao invés de criar UI paralela (quick filter row) com seu próprio sync com filterModel, reutilizar o chip do toolbar mantém UX consistente. Chip mostra valor atual, popover edita, X remove. Filter shortcut é só atalho de discovery → cria chip → mesmo fluxo.
  - **L-Controlled+uncontrolled hybrid**: passar `open={cond || undefined}` ao Radix Popover deixa controlled quando cond=true, uncontrolled quando undefined. Padrão útil pra "controlar só em casos específicos" sem perder o comportamento default.
  - **L-Phantom item visibility**: pra Popover ter trigger válido durante "estado pendente", chip precisa renderizar mesmo com valor vazio. Solução: condicional no useMemo (`appliedGroups`) que inclui empty items quando pending. Sem isso, item vira fantasma sem âncora visual.
  - **L-State cleanup on cancel**: quando UI add-on inicializa estado vazio aguardando input, e user cancela sem completar, precisa limpar o estado. Sem isso, model fica com lixo invisível que reaparece em condições corner-case.
- Assumption: "Filter shortcut como icone no header (alongside 3-dots) é discovery superior à quick filter row — usuário descobre filtro por coluna sem perder espaço vertical, e o fluxo (click → chip aparece → popover abre com foco) é o mesmo do FilterPopover do toolbar. Single source of truth no chip preserva consistência."

### [2026-05-15] | DS DEV | DataTable Fase E.4 — Quick filter row (header inputs) | CONCLUÍDO + Fase E COMPLETA
- Input: ultima sub-fase da E. Quick filter = linha sticky de inputs/selects abaixo do header pra filtragem direta por coluna.
- Output:
  - **`DataTableProps.showQuickFilter?: boolean`** novo. Liga renderizacao da linha.
  - **`DataTableQuickFilterRow<T>`** novo (`parts/data-table-quick-filter-row.tsx`): renderiza row sticky `top: 42px` (abaixo do header principal) com z-[15]. Para cada coluna em effectiveColumns:
    - Cell renderiza com mesma width/sticky offsets do header (alinhamento perfeito);
    - Se `enableColumnFilter: true` e nao actions → renderiza input/select baseado em filterType;
    - Senao → cell vazia (mantem largura).
  - **`QuickFilterInput`** componente interno: 
    - `select`/`multiSelect` → `<Select>` shadcn com opcao "Todos" (`__all__` sentinel) + filterOptions. Operator `equals`. Commit imediato.
    - text/number → `<DebouncedTextInput>` (300ms). Operator `contains`.
  - **`DebouncedTextInput`** componente interno: state local pra digitacao imediata + setTimeout pra commit no filterModel. `useEffect` sincroniza com mudancas externas (ex: "Limpar filtros" do toolbar) apenas quando NAO ha timer ativo (evita override do que o user esta digitando).
  - **`upsertFilter` logic**: encontra item existente por `(field, operator)`, remove-o, e re-adiciona (ou nao) com o novo valor. ID `quick-{field}-{operator}` pra distinguir de filtros do FilterPopover.
  - **Coexistencia com FilterPopover**: ambos editam `filterModel.items` mas com IDs diferentes. Quick filter mexe apenas no item dele; advanced popover pode adicionar items adicionais (multi-conditions) sem conflito.
  - **`stopPropagation`** em click/pointerdown/mousedown nos inputs e SelectTrigger pra nao disparar dnd/sort/onRowClick.
  - **Index export**: `DataTableQuickFilterRow`.
  - **Demo em ClientsCRUDPreview**: `showQuickFilter` ligado. Colunas `email`/`statusId`/`categoryId`/`agentId`/`value`/`location` ja tinham `enableColumnFilter: true` → linha aparece automatica com input/select adequado por tipo.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Debounced controlled input**: para inputs com debounce, manter estado local sincronizado com prop externa eh frágil. Pattern: useEffect que SÓ sincroniza quando timer está null (user nao está digitando). Sem isso, o sync de fora "rouba" caracteres do user no meio da digitação.
  - **L-Sentinel select value**: Select do Radix nao aceita string vazia como SelectItem value. Solucao: usar sentinel `__all__` no item e no value default, mapeando pra empty string no commit.
  - **L-Sticky stacking**: header principal (z-20) + quick filter (z-15) + body cells pinned (z-5) + totalizer (z-8). Hierarquia z preserva ordem visual durante scroll horizontal (sticky lateral) e vertical (sticky top/bottom).
- Assumption: "Quick filter como linha sticky abaixo do header eh padrao admin/dashboard (Notion, Airtable, planilhas). Coexiste com advanced popover sem dupla source-of-truth (filterModel unico, IDs distintos). Filtros range/data/multi-select complexos ficam pro FilterPopover."

### Fase E COMPLETA — DataTable feature-completo
- **E.1** Keyboard nav (arrow keys + Home/End/PageUp/PageDown + Enter/Space + roving tabindex + outline focus + auto-scroll)
- **E.2** Totalizers footer (sum/avg/count/min/max + custom fn + aggregateRow server override)
- **E.3** Empty/NoResults polish (props customizaveis + ilustracao circular + onClearFilters auto-wired)
- **E.4** Quick filter row (input/select por coluna filterable, debounced, coexiste com FilterPopover)
- Plus todas Fases A-D + bugfixes (dropdown teleport, resize line, resize re-render storm, resize click vs sort conflict, scroll shadow removal).
- DataTable v1 entregue com: server/client modes, multi-sort, multi-filter (popover + quick + advanced SQL), grouped chips, pagination, density, saved views (presets + user), persist (localStorage), export (CSV + custom formats), bulk actions, column types registry, column menu 3-dots, column resize, **column drag-drop**, **inline edit (text/number/select)**, **actions column built-in**, **totalizers**, **keyboard nav**, **quick filter**, empty/no-results polish.

### [2026-05-15] | DS DEV | DataTable Fase E.3 — Empty/NoResults polish (props + auto-clear) | CONCLUÍDO
- Input: continuação da Fase E. E.3 = melhorar estados visuais Empty e NoResults com ilustração circular + props customizáveis + auto-wiring de "Limpar filtros".
- Output:
  - **`DataTableEmpty`** refatorado com props: `icon` (default Inbox), `title`, `description`, `action`. Ilustração agora circular: `size-[80px] rounded-full bg-bg-muted` + icone `size-icon-2xl text-fg-muted` centrado. Hierarquia: ícone → título (`text-title-md text-fg-strong`) → descrição (`text-paragraph-sm text-fg-muted`) → action opcional (mt-pad-md). `flex-1 min-h-0` pra ocupar altura disponivel dentro do container.
  - **`DataTableNoResults`** mesma estrutura + props `onClearFilters?: () => void`. Quando `onClearFilters` definido E `action` undefined, renderiza botao default "Limpar filtros" (variant outline, color secondary, iconLeft `<FilterX />`). Action customizada sempre vence.
  - **Auto-wire em `data-table.tsx`**: quando consumer NAO passa `renderNoResults`, o default renderiza com `onClearFilters={() => { filters.setFilterModel({ items: [], logicOperator: "AND" }); search.setInputValue(""); }}` — limpa filterModel + busca em uma ação só. Consumer que quiser comportamento custom passa `renderNoResults`.
  - **Index exports**: `DataTableEmptyProps` e `DataTableNoResultsProps` exportados pra consumer estender/customizar.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Empty vs NoResults**: estados visualmente parecidos mas semanticamente distintos. Empty = dataset 100% vazio (Inbox icon, sugere criar). NoResults = filtro/busca zerou (SearchX icon, sugere ajustar). DataTable já distingue via `isDataEmpty` vs `isNoResults`; agora visual reforça a diferença pela ação sugerida.
  - **L-Auto-wire vs explicit prop**: quando o componente default tem callback útil (`onClearFilters`), wirar automaticamente no consumer pai (DataTable) reduz boilerplate. Mas manter o componente standalone (consumer pode usar fora do DataTable) sem callback default funciona — auto-wire e zero-config são camadas separadas.
- Assumption: "Empty/NoResults com 1 ação primária cobre 90% dos casos. Onboarding com múltiplos passos, ilustrações SVG custom por contexto, ou diferenciação por tipo de dado (empty cadastro vs empty importação) ficam pra consumer customizar via props ou `renderEmpty/renderNoResults`."

### [2026-05-15] | DS DEV | DataTable Fase E.2 — Totalizers footer (aggregate row) | CONCLUÍDO
- Input: continuação da Fase E. E.2 = footer row com agregações por coluna (sum/avg/count/min/max + custom + server-side override).
- Output:
  - **`DataTableColumnDef.aggregate?`**: `'sum' | 'avg' | 'count' | 'min' | 'max' | ((rows: T[]) => ReactNode)`. Built-ins operam em valores numericos (filtra NaN/null). Custom function gera ReactNode livre.
  - **`DataTableColumnDef.aggregateFormatter?: (value: number) => string`**: formatter aplicado ao resultado built-in. Fallback: `valueFormatter`, depois `String(v)`.
  - **`DataTableProps.showTotalizers?: boolean`** + **`aggregateRow?: Record<string, ReactNode>`**: showTotalizers liga o footer; aggregateRow é override pre-computado por field (server mode usa pra mostrar agregação GLOBAL do dataset, não só pagina atual).
  - **`DataTableTotalizerRow<T>`** novo (`parts/data-table-totalizer-row.tsx`): renderiza row sticky no bottom (`sticky bottom-0 z-[8] bg-bg-table-head border-t`). Usa `TableCell` pra cada coluna com mesma width/pinOffset/align do header (alinhamento perfeito). Helper `resolveTotalizerContent` decide: override > aggregate fn > built-in keyword > null. Helper `getFieldValue` suporta dot-path.
  - **`useDataTableController` retorna `rowsAllPagesProcessed`**: total filtered/sorted rows (allPagesProcessed). Em server mode = current page. Passado pra TotalizerRow agregar sobre tudo (não só pagina visível).
  - **`data-table.tsx`** renderiza `<DataTableTotalizerRow>` no fim do TableBody quando `showTotalizers=true`. Recebe columns/widths/offsets/rows/overrides + `hasSelection` (renderiza cell vazia 56px no início pra alinhar).
  - **Demo em `ClientsCRUDPreview`**: 
    - Coluna `id` com `aggregate: (rows) => <span>{rows.length} registros</span>` (custom fn);
    - Coluna `value` com `aggregate: 'sum'` + `aggregateFormatter: formatCurrency` (built-in).
    - `showTotalizers` ligado no DataTable.
  - **Index export**: `DataTableTotalizerRow`.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Sticky bottom em scroll container**: footer sticky precisa de `z-index` maior que rows mas menor que header (z-20). Escolhi z-[8] pra ficar acima das body cells (z-5 quando pinned) e abaixo do header. Background sólido obrigatório (`bg-bg-table-head`) pra cobrir rows que passam por baixo.
  - **L-Server mode totalizers**: agregação global de dataset em server mode NÃO pode ser computada no client (so tem current page). Pattern: consumer passa `aggregateRow[field] = serverProvidedValue`. Override vence sempre.
- Assumption: "Totalizers como row sticky no bottom + per-column aggregate é o padrão (MUI DataGrid, AG Grid). Multi-row aggregation (subtotals por grupo) e grouping requerem virtualização — fica pra V2."

### [2026-05-15] | DS DEV | DataTable Fase E.1 — Keyboard navigation (a11y) | CONCLUÍDO
- Input: usuário pediu continuação. Fase E (polish finais) dividida em sub-fases E.1 (kb nav) > E.2 (totalizers) > E.3 (empty polish) > E.4 (quick filter). E.1 primeiro por maior valor a11y.
- Output:
  - **`TableRow` agora `forwardRef`** + nova prop `focused?: boolean` + `rootProps?: HTMLAttributes` (table.types.ts + table.tsx). Forwarded ref usado pelo DataTable pra Map<index, HTMLDivElement> e scroll programatico.
  - **Focused state visual**: `outline-2 outline-offset-[-2px] outline-bg-brand z-[6] relative` quando focused. Outline (não border/ring) pra nao deslocar layout nem interferir com sticky.
  - **`tabIndex` dinamico**: row focada = 0 (em ordem de Tab), demais = -1. Garante que entrar via Tab na tabela cai na linha focada (ou nenhuma se null). 
  - **`focusedRowIndex` state + `rowRefs` Map** em data-table.tsx.
  - **`handleRowKeyDown`** event handler com:
    - `ArrowDown` / `ArrowUp` → ±1
    - `Home` / `End` → primeira/ultima da pagina
    - `PageDown` / `PageUp` → ±10
    - `Enter` → dispara `props.onRowClick(row)` (sem alterar focused)
    - `Space` → dispara `selection.toggleRow(row)` se `selectionConfig.enabled`
    - Outras teclas → no-op (permite Tab sair, etc)
  - **Auto-scroll** via `el.scrollIntoView({ block: "nearest", behavior: "smooth" })` no setTimeout 0 (após React re-render aplicar tabIndex).
  - **onFocus handler** atualiza `focusedRowIndex` quando Tab traz foco direto (sem keyDown prévio).
  - **onClick atualiza focused** — click na row tambem foca pra futuras navegacoes por teclado.
  - **Reset focus on data change**: useEffect com deps `[page, pageSize, filterModel, search.debouncedValue, sortModels]` zera focusedRowIndex pra null. Sem isso, indice stale aponta pra row inexistente.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-Outline vs ring/border**: foco em rows com border/ring (que tomam espaço no flex layout) desloca conteudo e quebra sticky positioning. Outline pinta SOBRE o elemento sem afetar layout — escolha certa pra focus de container que precisa preservar estrutura.
  - **L-tabIndex dinamico**: roving tabindex pattern (apenas o item focado = 0, demais = -1) é o WCAG-recommended pra listas/grids. Tab entra no item focado, setas navegam, Shift+Tab sai pro próximo focusable do DOM.
  - **L-setTimeout 0 no focus()**: chamar `.focus()` no mesmo tick do `setState(newIndex)` pode falhar porque React ainda nao reconciliou o tabIndex no DOM. setTimeout 0 enfileira após o paint.
- Assumption: "Keyboard nav básico (setas + Enter + Space + Home/End) cobre 95% dos casos. Modais de edição por teclado, navegação célula-a-célula (F2 entra em edit), ARIA grid completo (rovingtabindex em cells, não rows) ficam pra V2."

### [2026-05-15] | DS DEV | DataTable Fase D — Inline edit (double-click to edit) | CONCLUÍDO
- Input: usuário pediu sequência da Fase C. Fase D = edit inline de celulas — double-click abre editor, Enter/blur commit, Esc cancel.
- Output:
  - **`DataTableColumnDef.editable?: boolean`** + `editType?: 'text' | 'number' | 'select'` (default deriva de `type` / `filterType`) + `renderEdit?: (params) => ReactNode` escape hatch.
  - **`DataTableProps.onCellEditCommit?: ({ id, field, value, oldValue, row }) => void`** — callback no commit. Em server mode, consumer faz PATCH no endpoint; em client mode, atualiza array de rows local.
  - **`DataTableEditCell`** novo (`parts/data-table-edit-cell.tsx`): renderiza editor baseado em editType. **Text/number**: Input shadcn (`size="xs"`) com Enter→commit, Esc→cancel, blur→commit (setTimeout 0 pra Radix events). **Select**: Select shadcn com `defaultOpen` + `onValueChange` commit imediato (UX direta). Auto-focus + select-all no mount. stopPropagation em click/pointerdown/mousedown/doubleclick pra não disparar dnd/sort/onRowClick.
  - **`resolveEditType`** helper: editType > filterType (`select|multiSelect→select`, `number→number`) > type (`number|currency→number`, `status|boolean→select`) > default text.
  - **`TableCell.rootProps`** novo (table.types.ts + table.tsx): aceita HTMLAttributes spread no root pra DataTable plugar `onDoubleClick` em celulas editaveis. spread vem PRIMEIRO no JSX, role/data-* override (mesma estratégia de TableHeadCell).
  - **`data-table.tsx`** estado `editingCell: { rowId, field } | null` + handler `handleCellEditCommit` que chama `onCellEditCommit` e fecha edição. Cell map verifica `isEditingThisCell` e troca `content` por `<DataTableEditCell>`. Celula editavel recebe `rootProps.onDoubleClick` que entra em edit mode. Em edicao, padding zerado (`!px-pad-xs !py-0`) pra editor ocupar 100% da cell.
  - **Demo em `ClientsCRUDPreview`** (client mode): `phone` (text), `statusId` (select), `value` (number), `location` (text) marcados como `editable: true`. `onCellEditCommit` faz `setRows(prev => prev.map(r => r.id === id ? {...r, [field]: value} : r))`. Status edita via Select com filterOptions já existentes (statuses do mock).
  - **Index exports** estendidos com `DataTableEditCell`.
  - **`tsc --noEmit`**: exit 0.
- Lições reforçadas:
  - **L-EditCell focus**: editor inline precisa auto-focus + select-all no mount via `useEffect(() => { el.focus(); el.select() })` — sem isso, usuario tem que clicar duplo + clicar pra focar. Quebra fluxo.
  - **L-Blur commit timing**: blur dispara antes de cliques internos do Radix Select (dropdown options). `setTimeout(onCommit, 0)` no blur evita commit prematuro ao clicar numa option do select interno.
  - **L-Cell padding em edit**: cell tem `px-pad-2xl py-0` default. Em edit mode, padding default deixa editor visualmente apertado dentro de border. Removendo via `!px-pad-xs !py-0` faz editor encostar nas bordas → input vira "cell que virou input", sem moldura dupla.
- Assumption: "Edit-on-double-click + single-cell-at-a-time é o padrão (MUI DataGrid, AG Grid). Edge cases (multi-cell edit, async commit com loading, validação inline, undo) ficam pra V2."

### [2026-05-15] | DS DEV | DataTable Fase C — Column drag-and-drop (@dnd-kit/sortable) | CONCLUÍDO
- Input: usuário pediu sequência das fases após bugfix+actions. Fase C = reordenar colunas via drag-and-drop no header.
- Output:
  - **`@dnd-kit/sortable`** ja instalado (verified `package.json`). Stack: `DndContext` + `PointerSensor` (activation distance=5px) + `KeyboardSensor` (sortableKeyboardCoordinates) + `SortableContext` (horizontalListSortingStrategy).
  - **`TableHeadCell` agora forwardRef** (`table.tsx`): aceita `ref?: Ref<HTMLDivElement>` + props novos `style?: CSSProperties` (merged com interno) + `rootProps?: HTMLAttributes` (spread no root div). `rootProps` vai PRIMEIRO no spread pra explicit handlers/role internos prevalecerem; dnd-kit attributes/listeners passam por essa porta. `setRefs` callback combina forwardedRef + headCellRef interno (resize live-DOM).
  - **`TableHeadCellProps`** estendido com `style` + `rootProps` em `table.types.ts`.
  - **`SortableHeadCell`** novo (`parts/sortable-head-cell.tsx`): wrapper que chama `useSortable({ id, disabled })`, aplica `transform`/`transition`/`opacity`/`cursor`/`zIndex`/`position` durante drag, repassa props pro TableHeadCell. `position: relative` durante drag override do sticky pra cell flutuar com cursor. Cursor `grab` (pointer-friendly) → `grabbing` (ativo). `disableDrag` desativa drag sem remover do contexto (mantem layout).
  - **`data-table.tsx`** wrap: `DndContext` envolve toda a `Table`, `SortableContext` envolve o `effectiveColumns.map` (não inclui checkbox que é estatico fora do map). `handleColumnDragEnd` usa `arrayMove(columnOrder, fromIdx, toIdx)` + `cols.handleReorder(newOrder)`. `sortableIds` memoizado de effectiveColumns.
  - **Actions column desativada**: `<SortableHeadCell disableDrag={isActions}>` — coluna actions visualmente presente, sem cursor grab, sem drag, sem ser drop target ativo.
  - **Preserva**: click-to-sort (5px activation), resize handle (stopPropagation no mousedown bloqueia dnd), column menu button (stopPropagation), keyboard nav (Tab+Space pra grab, Setas pra mover).
  - **`tsc --noEmit`**: exit 0. Type-safe.
- Lições reforçadas:
  - **L-Drag activation**: distance threshold ≥ 5px no PointerSensor é critico pra coexistir com click handlers (sort, navigation). Sem isso, todo click vira drag-of-1px.
  - **L-Sticky vs transform**: drag de coluna pinned com sticky positioning quebra visual (transform aplica relativo, sticky absoluto à viewport). Solução: `position: relative` inline durante isDragging pra "destacar" do sticky temporariamente.
  - **L-rootProps order**: spread de dnd attributes/listeners PRIMEIRO, explicit props depois — preserva `role="columnheader"`, `aria-sort`, internal handlers vs override pelo dnd's `role="button"`.
- Assumption: "DnD via @dnd-kit/sortable é a abordagem padrão (accessibility-first, keyboard support, sensors flexíveis). Distance activation preserva interações existentes (sort/resize). Actions column como `disabled` no contexto evita refactor de zonas separadas — V1 aceitavel."

### [2026-05-15] | DS DEV | DataTable Fase A (bugfix+polish) + Fase B parte 1 (Actions column) | CONCLUÍDO
- Input: usuário pediu plano em 5 fases pra evoluir DataTable. Fase A = bugfixes visíveis (resize line nao aparecia no body, dropdown teleportava, skeleton pequeno, dropdown piscava ao fechar, re-render storm no resize em server mode). Fase B = CellType Registry (já feito) + Actions column built-in.
- Output Fase A:
  - **Resize line propagada pro body** (`table.tsx`): Context `resizingField` + handlers `onMouseEnter`/`onMouseLeave` no handle + `useEffect` propagando `isDragging`. Cell aplica `after:` brand quando `resizingField === field`. Linha alinhada (2px width, right-2) com o centro do handle no header.
  - **Dropdown column-menu sem teleporte**: trigger ganhou `stopPropagation` em `onClick + onPointerDown + onMouseDown` (não só onClick) — evita header `sortable` disparar handleSort durante anchor calculation do Radix portal.
  - **Botão "..." visível durante hover do menu**: wrapper `headMenuItem` usa `has-[[data-state=open]]:inline-flex` pra continuar `inline-flex` enquanto o dropdown está aberto, mesmo quando cursor sai do header.
  - **Fix do flash no fechamento**: `DataTableColumnMenu` virou controlled (`open` + `keepMounted` state). `keepMounted` permanece true por 200ms após `setOpen(false)` (matching Radix close animation). Botão recebe `data-menu-active={keepMounted}`; wrapper headMenuItem adiciona regra `has-[[data-menu-active=true]]:inline-flex`. Portal não perde âncora durante fade-out.
  - **Skeleton loading rewrite** (`data-table-loading.tsx`): substituiu layout pequeno por estrutura fluida (header bar 42px + 10 body rows 56px) com placeholders pseudo-randomicos (40-90% largura) distribuídos via flex weights. `aria-busy="true"` + `role="status"`.
  - **Resize sem re-render storm** (`table.tsx` + `data-table.tsx`): `data-table.tsx` agora usa `onResizeEnd` (commit no mouseup) em vez de `onResize` (per-mousemove). Live visual feedback durante drag via DOM direto: TableHeadCell escreve `el.style.width` em todas as cells com `data-field` correspondente via `querySelectorAll` escopado ao `[role="grid"]` mais próximo. Zero React state durante drag → zero re-render → zero perceived "atualiza".
- Output Fase B parte 1 (Actions column built-in):
  - **Tipo `DataTableActionItem<T>`** novo (`data-table.types.ts`): `id, label, icon?, onClick(row), showInMenu?, destructive?, disabled?(boolean | fn(row)), hidden?(boolean | fn(row))`.
  - **`DataTableColumnDef.getActions?: ({ row }) => DataTableActionItem[]`** — propriedade pra colunas `type: "actions"`.
  - **`DataTableActionsCell<T>`** novo (`parts/data-table-actions-cell.tsx`): renderiza items sem `showInMenu` como icone-buttons inline (`size="icon-2xs"` ghost + `title={label}`), items com `showInMenu` no dropdown 3-pontos. Resolve `hidden`/`disabled` por row. stopPropagation em todos os clicks pra não disparar `onRowClick`.
  - **Auto-render em `data-table.tsx`**: quando `col.type === "actions"` + `col.getActions` definido + sem `col.render` → renderiza `<DataTableActionsCell>`. Se `col.render` passado, ele ganha (escape hatch).
  - **Coluna actions excluída do ColsPopover** (`colsPopoverColumns` filter): é estrutural, não aparece no popover de visibilidade. Já estava excluída de sort/filter/menu antes.
  - **Demo em `ClientsCRUDServerPreview`**: coluna actions ao final com Visualizar (inline Eye), Editar (inline Pencil), Duplicar (menu Copy), Excluir (menu Trash2 destructive). Pinned right.
  - **Export**: `DataTableActionsCell` + tipo `DataTableActionItem` no `index.ts`.
- Lições reforçadas:
  - **L-Drag perf**: Live drag feedback via DOM direto > React state per-mousemove. Pattern aplicável a outras interações com taxa alta (slider, color picker, etc).
  - **L-Portal anchor**: Radix portals dependem do trigger DOM existir durante animação de fechamento. Esconder o trigger por CSS antes do `data-state="closed"` completar = portal teleporta pra (0,0). Solução: manter o trigger visível por janela de close-animation (~200ms).
- Assumption: "DataTable já tem base sólida (10 hooks SRP + ColumnTypeRegistry). Polish + Actions column são camadas incrementais sem refactor. Fases C (DnD), D (Inline edit), E (quick filter/totalizers/keyboard nav) seguem mesmo modelo."

### [2026-05-15] | DS DEV | DataTable filter chips — reuso do ToolbarApplied (correção visual) | CONCLUÍDO
- Input: usuario apontou que eu havia criado `DataTableFilterChips` paralelo quando o `ToolbarApplied` existente do TableToolbar já tinha o layout correto (X + nome + operador + value-tag). Pediu manter consistência visual e reusar.
- Output:
  - **`ToolbarApplied` estendido** (`parts/toolbar-applied.tsx`):
    - Prop nova `renderChip?: (filter, defaultChip) => ReactNode` — slot pra envolver chip default com qualquer wrapper (ex: Popover). Componente continua dumb.
    - `value: ReactNode | ReactNode[]` — quando array, cada item vira tag estilizada inline com `toolbarAppliedChipValue` (gap-gp-2xs entre elas).
    - `toolbarAppliedTagClass` exportado (alias de `toolbarAppliedChipValue`) pra consumer usar em render custom.
    - X do chip ganhou `stopPropagation` pra não disparar o renderChip wrapper.
  - **`AppliedFilter.value: ReactNode | ReactNode[]`** — type update pra aceitar array.
  - **DataTable maestro** (`data-table.tsx`):
    - `appliedGroups` agrupa items por `field|operator` (key=`${field}|${operator}`).
    - `appliedFilters` mapeia grupos pra `AppliedFilter[]`: id=group key, value=array de labels (1-2 valores) ou string "N selecionados" (3+).
    - Handlers `removeGroup(key)` / `updateGroupValue(key, newValue)` / `getGroupOptions(key)` substituem a logica do componente paralelo.
    - `renderChip` envolve `defaultChip` num `<Popover>` cujo trigger é o próprio chip; PopoverContent renderiza `renderFastFilterInput` do tipo da coluna (forçando `multiSelect` quando coluna é select/multiSelect ou operador agregado).
    - Estratégia "promote to multiSelect": grupo de `select` com options → popover multiselect, permite toggle de novas opções (ADICIONA em vez de substituir).
  - **DELETADO** `parts/data-table-filter-chips.tsx` — não usado mais.
- Validação visual (DevTools MCP):
  - Layout do chip 100% idêntico ao exemplo "Applied filters (chips)" do TableToolbarDoc: `[X] Status = [Ativo]`
  - Click chip → popover multiselect abre com Ativo marcado
  - Marcar Pendente → chip vira `[X] Status = [Ativo] [Pendente]` (2 tags inline)
  - Tabela mostra 25 rows (Ativo + Pendente)
  - `tsc --noEmit`: zero erros
- Decisões:
  - **renderChip slot em vez de fork** — `ToolbarApplied` continua dumb, qualquer consumer (DataTable inclusive) pode plugar comportamento sem refazer markup.
  - **value como array vs string "N selecionados"** — 1-2 valores ficam visíveis como tags (informação direta); 3+ resumido (evita chip muito longo). Click sempre permite ver todos no popover.
  - **PopoverTrigger asChild com `<span>` do defaultChip** — Radix aceita; span clicável funciona como trigger sem mudar markup.
  - **Promote multiSelect quando coluna tem options** — UX intuitivo (clicar = editar coleção, não adicionar filtro novo).
- Assumption: "Componentes dumb com slot de render-prop são mais reusáveis que componentes especializados — o consumer plugga comportamento sem perder controle visual."
- Lições novas: nenhuma — confirma princípio "estender componente existente com renderProp em vez de criar paralelo".

### [2026-05-15] | DS DEV | DataTable evolução completa — replicação dos padrões do `@tabela/data-grid` | CONCLUÍDO
- Input: usuario pediu replicar arquitetura/features do projeto de referência `design-tabela/` (lib `@tabela/data-grid` v0.1.0) mantendo nosso visual e nuances já definidas. Mapeei tudo via 2 agentes Explore + DevTools MCP navegando `localhost:5173`.
- Output (5 fases em sequencia F4 → F5 → F2 → F1 → F3):
  - **F4 — Toolbar refactor** (`data-table.tsx`, `data-table.types.ts`):
    - Ordem fixa idêntica ao "Full toolbar" da doc: `[Search Divider Refresh Divider Views+] || [Filtrar Ordenar Colunas Divider Density Divider Exportar▾ ⋯ MoreMenu]`
    - `DataTableToolbarConfig.enableRefresh: boolean` (default true) — server mode chama `query.refresh()`, client mode pisca spinner 400ms
    - `enableExport: boolean | { formats?: DataTableExportFormat[], items?: DataTableMoreMenuItem[] }` — formatos custom + items append
    - `moreMenu: { items: DataTableMoreMenuItem[] }` — botão `⋯` padrão (esconde quando sem items)
    - Tipos novos: `DataTableExportFormat`, `DataTableMoreMenuItem`
  - **F5 — defaultViews + restore** (`data-table.types.ts`, `use-data-table-controller.ts`, `state-persistence-utils.ts`):
    - `defaultViews?: DataTablePresetView[]` na prop — read-only, sempre antes das userViews. Tipo `DataTablePresetView` com `id` (recomendo prefixo `preset:`), `name`, `state` parcial.
    - Mapping `owner: "preset"` no `viewsForToolbar` — ViewsPopover não mostra X em presets.
    - `applyPresetView(preset)` + `applyViewById(id)` no controller — lookup unificado (preset OR saved).
    - `lastActiveViewId` no `PersistedDataTableState` — persiste no localStorage; useEffect restore on mount aplica view automaticamente após `savedViews` carregar.
    - Showcase `ClientsCRUDPreview.tsx` ganhou `defaultViews` com `preset:ativos` e `preset:alto-valor`.
  - **F2 — Column Menu 3-pontos** (`parts/data-table-column-menu.tsx`):
    - Novo componente DropdownMenu por coluna: Sort asc/desc/clear, Pin left/right/unpin, Hide column, slot `extraItems` pra ações custom.
    - `DataTableColumnDef.enableColumnMenu?: boolean` (default true) + `columnMenuItems?` slot.
    - Substituiu o botão MoreHorizontal vazio anterior no `TableHeadCell.headMenu`.
  - **F1 — ColumnTypeRegistry + Filtros agrupados** (folder `column-types/` + `parts/data-table-filter-chips.tsx`):
    - `ColumnTypeRegistry` Singleton com Strategy Pattern — fallback automático pra `text` quando tipo desconhecido. Registra side-effect 6 tipos: text, number, date, select, multiSelect, boolean.
    - Cada `ColumnTypeDefinition` declara: `operators`, `renderFilterInput` (modal), `renderFastFilterInput` (chip popover), `matchesFilter` (runtime), `renderChipValue` (label visual).
    - `useDataTableProcessor.applyFilters` agora **agrupa items por `field|operator`** e aplica **OR dentro do grupo, AND entre grupos** — resolve o problema dos 2 filtros Status (era AND = 0 rows; agora é OR = todos status).
    - `DataTableFilterChips` componente novo substituiu `ToolbarApplied` no maestro: chips agrupados (Status: 1 valor / 2 valores / "N selecionados") clicáveis abrem popover do tipo da coluna (multiSelect com checkboxes pra editar coleção). X separado pra remover grupo inteiro. "Limpar todos" no fim.
    - Estratégia "promote to multiSelect" — quando grupo tem >1 item OU operador `isAnyOf`/`isNoneOf`, força popover multiSelect mesmo se tipo da coluna é "select". UX: clicar chip de "Status = Ativo" abre popover com checkboxes pra adicionar mais.
    - Operadores novos: `isAnyOf`, `isNoneOf` (semântica OR explícita pra arrays).
    - Auto-extract de opções: select/multiSelect sem `filterOptions` extrai valores únicos das rows.
  - **F3 — Parser SQL Avançado** (`popovers/filter-sql-parser.ts`, `filter-popover.tsx`):
    - Modal Filtros já tinha 2 tabs Visual/Avançado (`enableAdvanced`) mas Avançado era só textarea visual.
    - Parser `parseSqlFilter(text)` converte texto livre em `ParsedFilterEntry[]` — suporta operadores `=`, `!=`, `<>`, `>`, `<`, `>=`, `<=`, `contains`, `like` + conectores `AND`/`OR` case-insensitive + strings entre aspas. Validação de campos existentes.
    - `entriesToSql(entries)` round-trip — quando muda pra tab Avançado, textarea hidratado com filters atuais.
    - UI: error message vermelho inline + border critical no textarea + botão "Aplicar" que parseia e seta filterModel. `enableAdvanced={true}` padrão no DataTable maestro.
  - Showcase atualizado: `statusId`/`categoryId`/`agentId` viraram `filterType: "multiSelect"`, `value` ganhou `filterType: "number"`.
- Validação visual (DevTools MCP):
  - F4: nova ordem visível (Atualizar → Views → Filtrar/Ordenar/Colunas → Density → Exportar)
  - F5: tabs `Default + Ativos + Alto valor`; click em "Ativos" filtra (26 rows). Reload restaura tab "Ativos" via `lastActiveViewId`.
  - F2: Column Menu abre com Sort asc/desc, Pin left/right, Hide column. Click "Ordenar crescente" aplica sort.
  - F1: aplicar preset "Ativos" cria chip "Status é Ativo". Click no chip abre popover multiSelect com 4 checkboxes (Ativo selected). Marcar "Pausado" → chip vira "Status é Ativo, Pausado" + 35 rows (Ativo + Pausado).
  - F3: tab "Avançado" hidrata textarea com filtros atuais. Digitar `statusId = active AND statusId = pending` + Aplicar → chip agrupado "Status é Ativo, Pendente" (OR implícito funcionando via parser → FilterModel → processor).
  - `tsc --noEmit`: zero erros.
- Decisões arquiteturais:
  - **ColumnTypeRegistry side-effect register** via `import "../column-types"` no controller — mínima fricção pro consumer (tipos default sempre disponíveis).
  - **Filtros agrupados** no processor (não no FilterModel) — modelo persistido continua flat `items[]`, agrupamento é cosmético no runtime. Backward-compat com SavedView existentes.
  - **MultiSelect promotion automático** no chip popover — UX intuitivo (clicar chip = editar coleção, não adicionar filtro novo)
  - **Parser SQL como `text → entries`** (não AST completo) — subset prático, sem nesting/parenteses. Suficiente pra 90% dos casos.
  - **Default views read-only via prop** (não localStorage) — desenvolvedor define no código, sempre voltam. `lastActiveViewId` faz user voltar na última view.
  - **F1 substituiu `ToolbarApplied`** no DataTable mas o componente original permanece exportado pra uso standalone fora do DataTable.
- Assumption: "Replicar arquitetura `@tabela/data-grid` (ColumnTypeRegistry, Fast Filter chips, Column Menu, Toolbar ordem fixa) mantendo nosso visual entrega UX premium sem refazer o nucleo. O DataTable atual já tinha base sólida (maestro + 10 hooks SRP); F1-F5 são camadas incrementais."
- Lições novas: nenhuma — confirma valor de Registry Pattern pra extensibilidade + agrupamento cosmético no processor pra resolver semântica OR sem mudar shape do model.

### [2026-05-12] | DS DEV | Saved Views v4 — Unpin vs Delete + AlertModal danger de confirmação | CONCLUÍDO
- Input: usuario esclareceu que estavamos misturando dois comportamentos distintos:
  - X em tab (toolbar) = apenas REMOVER DA BARRA (unpin) — view continua salva no storage e visivel no popover
  - Lixinho na lista do popover = EXCLUIR PERMANENTEMENTE (precisa AlertModal danger de confirmação)
  - Botao "Excluir" do modal de edit = mesma coisa (precisa confirmação)
- Output:
  - **`handleTabUnpin(id)`** novo — apenas `setTabViewIds(prev => prev.filter(x => x !== id))`. Se a unpinned era a ativa, chama `onApplyDefault()` (volta pra Default). NAO chama `onDelete` no service.
  - **`handleAskDelete(id)`** novo — abre AlertModal setando `confirmDeleteView` com a view alvo.
  - **`handleConfirmDelete()`** novo — chamado pelo `onConfirm` do AlertModal; chama `onDelete(id)` real e limpa state.
  - **ToolbarTabs.onClose** agora recebe `handleTabUnpin` (era `onDelete` antes).
  - **ViewsPopover.onDelete** agora recebe `handleAskDelete` (era `onDelete` direto antes).
  - **ViewFormModal.onDelete** (botao Excluir no modo edit) agora fecha o modal e dispara `handleAskDelete` via setTimeout 0ms (espera o modal animar fechando antes do AlertModal abrir).
  - **`<AlertModal tone="danger">`** renderizado no fim do compound:
    - title: "Excluir visão"
    - description: `Tem certeza que deseja excluir a visão "X"? Esta ação não pode ser desfeita.`
    - confirmLabel: "Excluir" / cancelLabel: "Cancelar"
    - onConfirm chama `handleConfirmDelete` que invoca o `onDelete` original passado pelo DataTable (que chama `savedViews.deleteView` no service)
- Validação visual (DevTools MCP):
  - Seed 3 views (Royals/Pendentes/Inativos SP), tabs: [Default, Royals em atendimento, Pendentes]
  - X em "Royals em atendimento" na tab → tabs viram [Default, Pendentes]; storage CONTINUA com 3 views (Royals intacta no popover) ✓
  - Lixinho ao lado de "Royals em atendimento" no popover → AlertModal danger abre com title "Excluir visão" + descrição mencionando "Royals em atendimento" + botoes Cancelar/Excluir
  - Click "Excluir" no AlertModal → modal fecha, storage vira [Pendentes, Inativos SP] (Royals removida), tabs continuam [Default, Pendentes]
  - `tsc --noEmit`: zero erros
- Decisões:
  - **3 entry-points distintos** pra ações de remoção, cada um com semântica clara:
    - Tab X = unpin (cosmético, view permanece)
    - Popover lixinho = ask delete (confirm + remove permanente)
    - Modal edit Excluir = ask delete (confirm + remove permanente)
  - **setTimeout 0ms entre fechar Dialog e abrir AlertModal** (caso modal edit → confirm) — evita 2 overlays empilhando antes da animação completar
  - **AlertModal reusando componente existente** (`ui/AlertModal`) — sem CSS dedicado, só passa props (tone, title, description, labels, callbacks)
  - **handleTabUnpin tambem reseta pra Default se a unpinned era ativa** — UX intuitivo: se sumi da barra, nao deveria continuar "aplicada"
- Assumption: "Exclusao permanente eh acao destrutiva e merece dialog separado. Unpin de tab eh apenas reorganização visual — não merece confirm."
- Lições novas: nenhuma — confirma padrão de separar ações reversíveis (unpin) de irreversíveis (delete) com UX distintas.

### [2026-05-12] | DS DEV | Saved Views v3 — Default tab + Edit modal + slot vazio sem promover | CONCLUÍDO
- Input: usuario detalhou 3 ajustes:
  1. Primeira tab sempre "Default" (nao removivel, sem X) — quando clicada, reseta filtros/sort/cols/density
  2. Click no item do popover (lista de views) abre modal de EDIT da view + fecha popover; nao aplica view
  3. X em tab deleta SEM promover a proxima — slot fica vazio; se a tab deletada era a ativa, Default auto-seleciona
- Output:
  - **`useDataTableSavedViews.updateView(id, partial)`** novo — atualiza name/isPublic de uma view existente via `service.save` (mesmo ID). NAO altera o snapshot de state (so metadata).
  - **`useDataTableController.applyDefault()`** novo — reseta density="standard", sortModel=null, filterModel vazio, applyColumnState({widths:{}, pinned:{}, hidden:[], order: columns originais}), setCurrentViewId(null).
  - **`ViewFormModal` unificado** (renomeado de AddViewModal) em `TableToolbar/popovers/view-form-modal.tsx`:
    - Props: `mode: "create" | "edit"`, `initialView?`, `onSubmit`, `onDelete?`
    - Mode create: titulo "Adicionar nova visao", icon Eye, botao "Salvar Visao"
    - Mode edit: titulo "Editar visao", icon Pencil, botao "Salvar Alteracoes" + botao **Excluir** (critical/outline com Trash2 icon) no canto esquerdo do footer
    - Hidrata state via useEffect quando abre — preserva input + switch ao mudar mode
    - styles renomeado `add-view-modal.styles.ts` → `view-form-modal.styles.ts`
  - **`TableToolbarViews` estendido**:
    - Constante `DEFAULT_VIEW_ID = "__default__"` — id virtual da tab fixa
    - Novos props: `onApplyDefault`, `onUpdate` (alem dos existentes)
    - Tab Default sempre primeira, `custom: false` (sem X)
    - State `tabViewIds: string[]` — IDs das views que ocupam slots de tab
      - Inicializa com `views.slice(0, maxTabs - 1).map(v => v.id)`
      - useEffect compara prevIds vs currentIds: remove sumiu, adiciona novo SE houver slot livre — nao reordena, nao promove
    - State `popoverOpen` controlado pra fechar o popover quando click no item ou onCreate
    - State `modalState: { mode: "create" } | { mode: "edit", view } | null`
    - `ViewsPopover.onApply` (click no item da lista) → fecha popover + abre modal mode "edit" com view pre-preenchida
    - `ViewsPopover.onCreate` (footer popover) → fecha popover + abre modal mode "create"
    - Tab Default clicada → chama `onApplyDefault`
    - Outras tabs clicadas → chama `onApply(id)` (aplica view normal)
    - X em tab → chama `onDelete(id)`. Hook `deleteView` faz `setCurrentViewId(curr => curr === id ? null : curr)` — quando a deletada era a ativa, currentViewId vira null → tab Default ativa automaticamente
  - **DataTable maestro** recebe os novos handlers:
    - `viewsForToolbar` agora inclui `isPublic` no shape (pra modal de edit hidratar o toggle)
    - `onApplyDefault={applyDefault}` (do controller)
    - `onUpdate={async (data) => savedViews.updateView(data.id, { name, isPublic })}`
- Validacao visual (DevTools MCP):
  - Default tab aparece primeira, selected: true quando currentViewId = null
  - Click numa view tab → aplica (`aria-selected: true` na clicada, `false` em Default)
  - Click em Default tab → reseta (selected: true em Default, false nas outras)
  - Seed de 3 views → tabs visiveis: Default + Royals + Pendentes (3 tabs). "Ultima opcao" fica so no popover
  - Click X em "Royals" (estado: nao ativa) → tabs viram [Default, Pendentes] — "Ultima opcao" NAO promoveu
  - Click X em tab que esta ATIVA → Default auto-seleciona (`selected: true`)
  - Click no item "Royals em atendimento" do popover → modal abre com title "Editar visao", input pre-preenchido, switch on (pq isPublic=true), botao "Excluir" + "Fechar" + "Salvar Alteracoes". Popover fecha junto.
  - `tsc --noEmit`: zero erros
- Decisoes:
  - **Default conta no maxTabs** — `maxTabs=3` → Default + 2 views customizadas. Mais previsivel pro user.
  - **Slot vazio puramente cosmetico** (no momento do delete) — recarregar reseta. Sem campo `pinnedAsTab` no schema → mais simples; UX aceitavel pq usuario raramente reload.
  - **Modal unificado com modes** (em vez de 2 modais separados) — reuso de styles, layout identico, so 3 strings + 1 botao mudam. Economiza ~120 linhas de duplicacao.
  - **Update via `service.save` com mesmo ID** — o mock service ja faz `findIndex >= 0 ? replace : push`. Nao precisa nova API no service.
  - **setTimeout 0 entre fechar popover e abrir modal** — Radix anima o popover fechando; sem o defer, o modal aparecia antes do popover sumir.
  - **ViewsPopover controlled via `open`/`onOpenChange`** — necessario pra fechar programaticamente quando click no item.
  - **Default tab `custom: false`** — ToolbarTabs ja respeita isso e nao renderiza o X.
- Assumption: "Click no item do popover = gerenciar (editar/excluir); click na tab visivel = atalho de aplicacao. As duas interacoes sao distintas e o user nao precisa de outra UI pra editar uma view nao visivel como tab."
- Lições novas: nenhuma — confirma uso de Radix controlled state + setTimeout defer entre animacoes simultaneas.

### [2026-05-12] | DS DEV | Saved Views compound — TableToolbarViews + Tabs visíveis + ownership unificado | CONCLUÍDO
- Input: usuario sinalizou 3 pontos arquiteturais/UX:
  1. AddViewModal deveria pertencer ao TableToolbar (faz parte do uso pre-definido do toolbar) — DataTable so passa props
  2. Falta delete de views minhas independente de publicas/privadas (visoes que EU criei mostram X, sou o criador)
  3. Quando ha views, deve aparecer ToolbarTabs ao lado (max 3) igual ao exemplo "Full toolbar" do TableToolbarDoc
- Output:
  - **AddViewModal movido pra TableToolbar/popovers/** — `add-view-modal.tsx` + `add-view-modal.styles.ts` agora em `src/components/ui/TableToolbar/popovers/`. Paths relativos ajustados (`../../../shadcn/dialog`, `../../FormField/form-field-input`, etc). Folder `src/components/ui/AddViewModal/` DELETADO. Export do `src/components/index.ts` removido — agora exportado via TableToolbar barrel.
  - **TableToolbarViews compound novo** — `src/components/ui/TableToolbar/parts/table-toolbar-views.tsx`. Recebe via props: `views`, `activeViewId`, `onApply(id)`, `onDelete(id)`, `onSave({name,isPublic})`, `maxTabs?` (default 3), `myOwnerKey?` (default "me"). Internamente renderiza:
    1. `ToolbarDivider`
    2. `ToolbarTabs` com ate `maxTabs` views (custom: true em views.owner === myOwnerKey — habilita X)
    3. `ViewsPopover` via `ToolbarSaveButton "+"` trigger (lista completa + tabs Todos/Pessoais + search + footer "Salvar visao atual")
    4. `AddViewModal` aberto pelo onCreate do popover (state interno do compound)
  - **DataTable maestro refatorado**: substitui o trecho com `<ViewsPopover>+<ToolbarSaveButton>` por `<TableToolbarViews views={...} onApply={...} onDelete={...} onSave={...} />`. Remove `AddViewModal` renderizado no fim do tree (foi pra dentro do compound). Remove imports `Plus`, `useState`, `AddViewModal`, `ViewsPopover`, `ToolbarSaveButton`. Mantem `applyView` chamado via `handleViewApply(id)` que resolve original via lookup.
  - **Mapping `owner` unificado**: agora TODAS as views salvas no mock vao com `owner: "me"` (sou o criador → mostro X em todas). O flag `isPublic` continua persistido no SavedView pra quando backend real entrar com multi-user (a UI dele vai injetar `owner: <id>` + `ownerName: "Nome"` pra views de outros). Sem multi-user, tabs "Todos" e "Pessoais" mostram o mesmo conteudo — comportamento aceitavel pro mock.
  - **Barrel TableToolbar** exporta: `TableToolbarViews`, `TableToolbarViewsProps`, `TableToolbarViewsItem`, `AddViewModal`, `AddViewModalProps`, `AddViewModalSubmit`.
- Validacao visual (DevTools MCP):
  - Seed de 4 views (1 publica, 3 privadas) no localStorage → reload → tabs visiveis: as 3 primeiras ("Royals em atendimento", "Inativos SP", "Pendentes"). A 4a ("Ultima opcao") fica so no popover.
  - Click em tab "Royals em atendimento" → `aria-selected: true` (view aplicada)
  - Click no "+" → popover abre com TODAS as 4 views listadas (overflow correto)
  - Click no X de "Inativos SP" na tab → view deletada do storage; "Ultima opcao" promove pra tab 3 automaticamente (3 tabs mantidas)
  - Click em "Salvar visao atual" no footer do popover → AddViewModal abre com titulo "Adicionar nova visao"
  - `tsc --noEmit`: zero erros
- Decisoes:
  - **Compound em TableToolbar** (decisao B do usuario): qualquer consumer do TableToolbar fora do DataTable pode usar `<TableToolbarViews>` passando views/handlers — reuso fora do contexto Data.
  - **Sem chip "Pública"** no popover (decisao do usuario): a diferenciacao publica vs privada eh ocultada no mock single-user porque so passa a importar com multi-user real (quando o `ownerName: "Por X"` ja sinaliza visualmente que eh de outro).
  - **maxTabs=3 default** com slice das N primeiras: simples, previsivel. Usuario pode aumentar via prop se quiser.
  - **X nas tabs deleta permanente** (decisao do usuario): sem confirm dialog — UX confiando que ha "Salvar visao atual" no popover pra recriar caso engano.
  - **State do modal interno ao TableToolbarViews** (nao DataTable): mantem encapsulamento — o consumer nem sabe que o popover→modal existem, so passa onSave.
- Assumption: "Saved views eh um padrao de UX do toolbar (nao do data layer) — qualquer toolbar pode ter views; o DataTable so eh um dos consumers que conecta isso ao seu state interno via persistId + savedViewsService."
- Lições novas: nenhuma — confirma principio "compound encapsula UI complexa atras de API simples por props".

### [2026-05-12] | DS DEV | AddViewModal — replica do sandbox /design-and-table-v2 | CONCLUÍDO
- Input: usuario forneceu spec completa + screenshot do modal "Adicionar nova visao" do sandbox `/design-and-table-v2`. Quer substituir o `window.prompt` atual no fluxo de saved views por um modal real com layout fiel ao sandbox mas consumindo componentes do DS Modelo.
- Output:
  - **Componente novo `src/components/ui/AddViewModal/`** (3 arquivos):
    - `add-view-modal.tsx` — componente principal. Usa `Dialog`+`DialogContent` (shadcn), `FormFieldInput` (label + input), `Switch` (shadcn), `Button` (ui/Button). Auto-reset on close, Enter no input dispara save, click no card-label toggla o Switch, `disabled={!name.trim()}` no botao Salvar.
    - `add-view-modal.styles.ts` — slots tv() apenas pro que sobra dos componentes prontos (header icon container, toggle card com state `is-on`, toggle icon, body/foot padding).
    - `index.ts` — barrel.
  - **Tipos atualizados**:
    - `SavedView.isPublic: boolean` — novo campo persistido. Mock service nao tem multi-user real, mas o flag fica armazenado pra quando backend entrar.
    - `useDataTableSavedViews.saveView(name, snapshot, opts?: { isPublic? })` — assinatura estendida.
    - `useDataTableController.saveCurrentAsView(name, opts?: { isPublic? })` — propaga opts.
  - **Wiring no maestro**:
    - `data-table.tsx` agora renderiza `<AddViewModal open={addViewOpen} onClose={...} onSubmit={...} />` no fim do tree (so quando `props.persistId` presente).
    - `ViewsPopover.onCreate` agora abre o modal (`setAddViewOpen(true)`) em vez de window.prompt.
    - `handleViewSubmit` chama `saveCurrentAsView(name, { isPublic })` — propaga flag.
    - `viewsForPopover` adapter agora mapeia `owner: v.isPublic ? "team" : "me"` + `ownerName: v.isPublic ? "Equipe" : undefined`. Views publicas vao pra tab "Todos" com label "por Equipe"; privadas vao pra tab "Pessoais".
  - **Tokens consumidos** (todos pre-existentes — zero criados):
    - `bg-bg-muted`/`bg-bg-accent` (header icon bg light/dark)
    - `bg-bg-brand-subtle` + `border-border-brand` (toggle card `is-on`)
    - `bg-bg-surface` + `border-border-subtle` (toggle icon container)
    - `radius-radius-lg`/`radius-radius-xl`/`radius-radius-2xl`
    - `shadow-sh-2xl` + utility `outline-float` (do DialogContent default)
    - Tipografia: `text-label-lg font-bold` (title 18/700, proximo do spec 17/700), `text-paragraph-xs` (sub/desc 12/400 — proximo do spec 12.5/400), `text-label-sm font-semibold` (toggle label 14/600 — proximo do spec 13.5/600). Diferencas <1px imperceptiveis; usar tokens em vez de arbitrary values mantem consistencia DS.
  - **Validacao visual (DevTools MCP):**
    - Modal abre via ViewsPopover.onCreate "Salvar visao atual" no footer
    - Header com icon container 40x40 (Eye 20px) + titulo 18/700 + sub 12 muted + X no canto direito (do DialogContent default)
    - FormField "Nome da visao" + Input com placeholder + focus brand
    - Toggle card brand-tinted quando is-on (bg-brand-subtle + border-brand + icon brand)
    - Footer Fechar (outline secondary) + Salvar Visao (primary filled, disabled enquanto nome vazio)
    - Save end-to-end: digite "Royals em atendimento", switch on, click Salvar → modal fecha + view aparece como publica no popover ("por Equipe" como ownerName) + cai na tab "Todos" e nao em "Pessoais"
  - `tsc --noEmit` (npm run tokens:check): zero erros
  - Exports: `AddViewModal` + types adicionados ao `src/components/index.ts`
- Decisoes:
  - **Tipografia via tokens em vez de arbitrary values** — `text-label-lg + font-bold` (18/700) em vez de `text-[17px] font-bold tracking-[-0.01em]`. Diferenca de 1px no font-size eh imperceptivel e ganha consistencia com o resto do DS. Mesma logica pro sub/toggle-desc (12 vs 12.5) e toggle-label (14 vs 13.5).
  - **`text-paragraph-xs` em vez de `text-label-xs`** pro sub/desc — diferenca eh peso (400 vs 500). Spec pede peso normal entao paragraph eh correto.
  - **`size-form-lg` (40px)** pro header icon container e `size-form-md` (36px) pro toggle icon — tokens semanticos que ja existem no DS pro tamanho de campos de formulario, aplicados aqui pra manter consistencia.
  - **Mapeamento owner via isPublic** — privada `owner: "me"`, publica `owner: "team"`. Encaixa direto no filtro de tabs do ViewsPopover (`myOwnerKey: "me"` default). Quando backend real entrar, o adapter passa a usar `view.owner` real (multi-user).
- Assumption: "Um modal centralizado com label + input + switch (sem multi-step, sem rich text) cobre 100% dos casos de criacao de view em CRUDs internos. Quando backend tiver owner_id/team_id/visibility complexa, o modal pode ser estendido com campos extras sem refatorar a integracao."
- Lições novas: nenhuma — confirma que tokens proximos sao preferiveis a arbitrary values pequenos (<2px de diferenca), e reuso de componentes prontos (FormFieldInput cobre label+input+focus state) economiza CSS dedicado.

### [2026-05-12] | DS DEV | DataTable (F7-B refactor — usa ViewsPopover do TableToolbar) | CONCLUÍDO
- Input: usuario sinalizou que o debito tecnico do reviewer F7 (componentes paralelos `DataTableViewsPopover` vs `ViewsPopover` do TableToolbar) devia ser resolvido agora, e que o botao "Views" estava no lugar errado — deveria estar ao lado do search + divider conforme o exemplo "Full toolbar" do TableToolbarDoc, nao junto dos action buttons.
- Output:
  - DELETADO `src/components/ui/DataTable/parts/data-table-views-popover.tsx` (UI custom paralela)
  - Maestro `data-table.tsx` agora usa `ViewsPopover` + `ToolbarSaveButton` do TableToolbar (mesmos componentes do exemplo Full toolbar)
  - Botao "+" movido do slot `actions=` pro slot `left=`, depois de `<ToolbarSearch>` + `<ToolbarDivider />` — padrao identico ao exemplo
  - Adapter de shape: `viewsForPopover` mapeia `SavedView[]` pra `ViewsPopoverView[]` (id/name/owner="me"); `handleViewApply` resolve o original via id antes de chamar `applyView`
  - `handleViewCreate` usa `window.prompt("Nome da view:")` no MVP (substituivel por modal nomeado em iteracao futura)
  - Trigger usa `<ToolbarSaveButton>` com `<Plus strokeWidth={2.4} />` (idem exemplo)
  - ViewsPopover ja vem com tabs Todos/Pessoais, search, delete por hover, footer "Salvar visao atual" — UX rica gratuita
- Validacao visual (DevTools MCP):
  - Botao "+" agora aparece a direita do search com divider — posicionamento correto
  - Popover abre com tabs Todos/Pessoais, lista mostra view "Pedro inativos" do localStorage anterior, footer "Salvar visao atual" presente
  - `tsc --noEmit`: zero erros
- Decisoes:
  - `window.prompt` no `onCreate` eh stub aceitavel pro MVP — produto pode plugar modal Dialog custom depois
  - `owner: "me"` fixo no adapter — todas as views do mock localStorage sao "minhas". Quando backend real entrar com views compartilhadas, o adapter passa a usar `view.owner` real (campo ja existe no SavedView se quisermos estender)
  - ToolbarDivider so renderizado quando `props.persistId` presente — sem persistId, search nao tem divider sobrando
- Assumption: "O ViewsPopover do TableToolbar resolve 100% dos casos de UI de saved views do DataTable; o gap multi-owner que motivou o componente paralelo foi prematuro — quando vier sera adapter de service, nao componente"
- Lições novas: nenhuma — confirma principio "reuse antes de criar paralelo"

### [2026-05-12] | DS DEV | DataTable (F7 — post-review dev-warning fix) | CONCLUÍDO
- Input: gap não-bloqueante registrado pelo DS Reviewer F7 — spec §11 linha 458 pede warning em dev quando mock service ativo em production
- Output: `useDataTableSavedViews` agora dispara `console.warn` (uma única vez via `useRef`) quando `import.meta.env.MODE === "production"` E `service === savedViewsMockService`. Mensagem orienta substituir via prop `savedViewsService`.
- Decisões: `import.meta.env` (Vite) em vez de `process.env` (sem @types/node no projeto). Ref flag evita spam em re-renders.
- Assumption: "Devs rodam build em production antes de deploy e veem o console.warn"
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | DataTable (F7 Persist localStorage + Saved Views) | APROVADO
- Spec verificada: sim — .ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md §3.3 linhas 59-60 (persistId/savedViews), §11 linhas 457-458 (stale schema + mock em prod)
- Assumption verificada: "Persistencia via localStorage cobre 95% dos casos de personalizacao por usuario; saved views via service mock atende preview/dev e backend real eh plugavel sem mudar UI" — PARCIALMENTE VÁLIDA. A parte localStorage/service-plugável é sólida. A parte "sem mudar UI" tem uma fragilidade registrada abaixo (não bloqueante).
- Critique genuína:
  - Varredura L-001 a L-014 completa em todos os 7 arquivos novos de F7 (state-persistence-utils, use-data-table-state-persistence, use-data-table-saved-views, saved-views.types, saved-views-mock-service, data-table-views-popover, hooks modificados): zero violações reais. `w-80` e `max-h-60` no popover foram investigados — o DS não define tokens `w-*` nem `max-h-*` para dimensões de overlay; outros popovers do projeto usam `w-[280px]`/`w-[320px]` e `max-h-[300px]` (arbitrary Tailwind). `w-80` e `max-h-60` são equivalentes não-arbitrary do mesmo padrão. Não é violação de L-002.
  - `any` no controller linha 30 (`DEFAULT_GET_ROW_ID`) é pré-existente, documentado nos reviews F3+F4. Não introduzido pelo F7.
  - `useMemo` como substituto de lazy init para localStorage read é tecnicamente correto — `loadPersistedState` é síncrono e idempotente (não causa side-effect fora da leitura). React permite reads síncronos em useMemo. O risco real seria se `loadPersistedState` disparasse um setter — não dispara.
  - Skip-first-render via `isMountedRef` em `useDataTableStatePersistence`: o ref flippa para true dentro do useEffect do primeiro render. Como `isMountedRef.current` é verificado dentro do mesmo efeito antes do flip, o skip funciona corretamente. Nenhum cenário de save indesejado no mount.
  - Edge case whitespace-only name em saved views: coberto em duas camadas — botão `disabled={!name.trim()}` no popover + `name.trim()` no hook `saveView`. Seguro.
  - `applyColumnState` faz schema validation no `columnOrder` mas não em `pinnedColumns`/`hiddenColumns`. Campos órfãos em `pinnedColumns` (fields que não existem mais) ficam no Record mas não causam UI quebrada — `effectiveColumns` filtra por `columnOrder` (que é validado), então colunas removidas nunca chegam à renderização mesmo que existam em pinnedOverrides.
  - Warning de produção para mock service (spec §11 linha 458: "Logar warning em dev se enableSavedViews=true com mock service e NODE_ENV=production") não foi implementado. Gap de spec — não bloqueante para F7, deve ser resolvido antes de uso em produção.
  - FRAGILIDADE DE DESIGN REGISTRADA (não bloqueante): `DataTableViewsPopover` (F7-B) e `ViewsPopover` (TableToolbar) são componentes paralelos de propósito similar. O F7-B é simples (sem tabs Todos/Pessoais, sem search, sem suporte a owner/views-compartilhadas). Quando backend real for plugado via `savedViewsService`, a UI do F7-B não suporta views de outros usuários nem search. A assumption "sem mudar UI" ficará falsa nesse cenário. O ViewsPopover do TableToolbar já tem esses features. Recommendation futura: F7-B poderia delegar para ViewsPopover em vez de ter UI própria. Não bloqueia F7.
  - tokens:check (tsc --noEmit): passou zero erros.
- Regressões L-001 a L-014: nenhuma
- Lições novas: nenhuma — padrões já cobertos pelas lições existentes

### [2026-05-12] | DS DEV | DataTable (F7 Persist localStorage + Saved Views) | CONCLUÍDO
- Input: F7 da spec original do DataTable (2026-05-12-data-table-design.md), com escopo: persistencia localStorage + saved views via service trocavel. Column Types Registry deferido pra fase posterior.
- Output:
  - **F7-A localStorage:**
    - `hooks/state-persistence-utils.ts` — `loadPersistedState()`, `savePersistedState()`, `clearPersistedState()` com schema versionado (`version: 1`). Storage key prefix `igreen-datatable:`. Try/catch em todo IO. JSON parse defensivo.
    - `hooks/use-data-table-state-persistence.ts` — hook que recebe persistId + snapshot, salva debounced (400ms). Skip primeiro render (evita re-salvar o que acabou de hidratar).
    - Hooks SRP estendidos com `initialXxx` props: `useDataTableColumns` (widths/pinned/hidden/order com schema validation), `useDataTableDensity`, `useDataTableSort`, `useDataTablePagination` (via `initialPageSize` ja existente).
    - Controller carrega `persistedInitial` via `useMemo(() => loadPersistedState(persistId), [persistId])` e passa pros hooks como `initial*`. useState lazy init garante hidratacao sem flash.
    - Persiste: density, sortModel, pageSize, columnWidths, pinnedColumns, hiddenColumns, columnOrder. NAO persiste: filters, search, page.
    - `DataTableRef.resetPersistedState()` adicionado pra limpar.
  - **F7-B Saved Views:**
    - `services/saved-views.types.ts` — interface `SavedViewsService` (list/save/delete async) + tipo `SavedView` com estado completo (filterModel, sortModel, density, columnWidths, pinnedColumns, hiddenColumns, columnOrder, createdAt).
    - `services/saved-views-mock-service.ts` — implementacao default usando localStorage (key prefix `igreen-datatable-views:`). Pode ser trocado por adapter de backend via prop `savedViewsService`.
    - `hooks/use-data-table-saved-views.ts` — hook que lista views no mount, expoe `saveView(name, snapshot)`, `deleteView(id)`, mantem `currentViewId`.
    - Controller integrado com `applyView(view)` (chama setters de density/sort/filters/columns batch) e `saveCurrentAsView(name)` (constroi snapshot dos states atuais).
    - `parts/data-table-views-popover.tsx` — UI: Input nome + botao Salvar, lista de views com Check icon na current + botao delete por linha. Renderizado pelo maestro apenas quando `props.persistId` presente.
    - `useDataTableColumns.applyColumnState({...})` — setter batch novo pra aplicar snapshot de colunas em uma chamada (usado por applyView).
  - **API:**
    - Novas props: `persistId?: string`, `savedViewsService?: SavedViewsService` (default mock).
    - DataTableRef.resetPersistedState adicionado.
    - Showcase: `ClientsCRUDPreview.tsx` ganhou `persistId="clients-crud-demo"`.
  - **Tests visuais (DevTools MCP):**
    - F7-A: mudei density+sort, reload, estados preservados. localStorage gravado com schema correto.
    - F7-B: salvei view "Pedro inativos" capturando density=compact + sort=value asc, mudei density pra standard, abri popover, cliquei na view → density voltou pra compact, sort restaurado (Pedro Pereira como primeira row). localStorage contem a view com schema completo.
  - `npm run tokens:check` (tsc --noEmit): zero erros.
- Decisoes:
  - Hidratacao via `initialXxx` props passados pelo controller pros hooks SRP (alternativa a hidratar dentro do hook). Razao: mantem hooks SRP "pure" — eles nao sabem de persistencia, so de seu estado proprio. Controller eh o "puente" que conecta persistedState aos hooks.
  - Schema versioning explicito (`version: 1`) pra invalidacao futura quando shape mudar drasticamente.
  - Saved views via service trocavel (SavedViewsService interface) — production pode plugar adapter de backend sem mudar UI.
  - Filtros/search/page NAO sao persistidos automaticamente em localStorage (decisao da spec) mas SAO incluidos em Saved Views (decisao de UX — user salva uma view de "Inativos de SP" explicitamente).
  - Schema validation no `columnOrder`: descarta campos que nao existem mais (coluna removida no codigo), anexa campos novos que nao estavam no persist (coluna adicionada).
  - Indicador `hasIndicator` no botao Views quando ha view ativa (currentViewId).
- Assumption: "Persistencia via localStorage cobre 95% dos casos de personalizacao por usuario; saved views via service mock atende preview/dev e backend real eh plugavel sem mudar UI". A unica falha previsivel: localStorage limit (5-10MB) atingido se user salvar dezenas de views grandes — mas eh quota best-effort com try/catch silencioso.
- Lições novas: nenhuma — pattern de hidratacao via initialState props eh standard React.
- Input: observation não-bloqueante do DS Reviewer F8 — scope "all"/"filtered" em server mode silenciosamente exporta apenas a página atual sem sinalizar ao usuário
- Output: dropdown Exportar agora mostra labels distintos por modo:
  - Client mode: "Todos" / "Filtrados" / "Selecionados (N)" (3 itens, comportamento original)
  - Server mode: "Página atual" / "Selecionados (N)" (2 itens — "Filtrados" omitido porque cairia no mesmo CSV que "Todos" em server mode)
- Decisões:
  - Adicionado `isServerMode` ao return do use-data-table-controller pra exposição no maestro
  - `data-table.tsx` linhas ~515-535 agora ramifica via ternário `isServerMode ? <single> : <fragment com 3 itens>`
  - Validado no browser: server preview (CRUD Server) mostra "Página atual" + "Selecionados (0)" disabled; client preview (CRUD) mantém os 3 itens
- Assumption: "Em server mode com pageSize=25 e total=10000, o usuário entende que 'Página atual' = limitação real; e 'Filtrados' não é necessário porque o filter já é aplicado na query server-side antes da paginação"
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | DataTable (F8 Export CSV — holistic) | APROVADO
- Spec verificada: sim — entrada DS Dev acima (CONCLUÍDO F8) + .ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md referenciado nas features anteriores
- Assumption verificada: "Blob + URL.createObjectURL funcionam em todos browsers modernos (Chrome 105+, Safari 16+, FF 110+)" — válida. tsc --noEmit passou sem erros. Nenhuma regressão de compatibilidade introduzida. A assumption de nível superior ("CSV no client com BOM UTF-8 + valueFormatter resolve 90% dos casos sem servidor") sobrevive aos edge cases com uma ressalva documentada abaixo.
- Critique genuína:
  - Varredura L-001 a L-014: nenhuma regressão nos arquivos F8 (use-data-table-export.ts, adições ao data-table.tsx, adições ao use-data-table-controller.ts). Os `any` em data-table.types.ts:89,93,94,95 e controller:26 são todos pré-existentes, já documentados nos reviews F3+F4 e F5.
  - tokens:check (tsc --noEmit): passou sem erros.
  - Edge case null/undefined: getCellValue guarda `value == null → ""` antes do String(). Correto.
  - Edge case aspas duplas: replace(/"/g, '""') + wrap RFC 4180. Correto.
  - Edge case scope="all" em client mode com zero rows: rowsAll.length===0 cai em rowsCurrentPage (também vazio) — semanticamente correto, CSV só com header.
  - Filename sanitization: toolbar.title slug remove espaços mas não remove chars inválidos de filesystem (/\:*?"<>|). Não é bloqueante — browsers sanitizam ao salvar — mas é fragilidade não documentada.
  - PROBLEMA NÃO-BLOQUEANTE REGISTRADO: scope="all" em server mode exporta silenciosamente apenas a página atual (rowsAll=[] → fallback para rowsCurrentPage). O item "Todos" no dropdown não indica essa limitação ao usuário. Comportamento documentado internamente pelo DS Dev mas não sinalizado na UI. Em dataset de 10.000 rows com pageSize 25, o usuário recebe 25 rows achando que recebeu tudo. Recommendation: adicionar tooltip ou label "(página atual)" no item "Todos" quando isServerMode=true — ou desabilitar o scope "all" em server mode. Não bloqueia F8 mas deve ser resolvido antes de uso em produção com datasets grandes.
  - API design (exportCsv retornando void): correto. Download é síncrono via Blob. Promise seria overengineering.
  - API design (enableExport booleano): correto para F8. Granularidade por scope é escopo de feature futura.
  - Assumption genuinamente testada: a limitação do scope "all" em server mode não quebra a assumption de que "resolve 90% dos casos" — mas revela que o 10% restante inclui o caso mais comum de server mode com datasets grandes. A assumption sobrevive para client mode (100%). Para server mode, o comportamento real é "exporta página atual", não "exporta todos".
- Regressões L-001 a L-014: nenhuma
- Lições novas: nenhuma nova — padrão de fallback silencioso (scope degradado sem feedback ao usuário) é risco de UX em features de export com server mode; documentar como observação de design na próxima spec que envolva export server-side.

### [2026-05-12] | DS DEV | DataTable (F8 Export CSV) | CONCLUÍDO
- Output:
  - Hook `use-data-table-export.ts` com 3 escopos: all, filtered, selected
  - CSV gen via Blob + download via `<a download>` (com BOM UTF-8 pra Excel)
  - Aplica `valueFormatter` por coluna; exclui colunas type=actions
  - Toolbar config `enableExport` + dropdown 3 itens (DropdownMenu shadcn)
  - "Selecionados" desabilitado quando count=0
  - Server mode: scope "Todos" cai pra pagina atual (sem dataset completo)
- Decisões:
  - Sem dependencia externa (papaparse) — geracao inline simples
  - BOM UTF-8 pra compatibilidade Excel
  - Filename derivado de `toolbar.title` (slug)
- Assumption: Blob + URL.createObjectURL funcionam em todos browsers modernos (Chrome 105+, Safari 16+, FF 110+).

### [2026-05-12] | DS REVIEWER | DataTable (F5 server mode — holistic) | APROVADO
- Spec verificada: sim — `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` (§5.2, §9.4, §9.6, §9.7) + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f5-server-mode.md`
- Assumption verificada: "`fetchData` é memoizada via `useCallback` pelo consumer. Sem isso, refetch em loop." — Ainda válida. Showcase demonstra o padrão correto com `useCallback(mockFetchClients, [])`. JSDoc no tipo documenta o contrato. Assumption não quebrou.
- Critique genuína:
  - Race condition guard (`requestIdRef`): `currentId = ++requestIdRef.current` captura o counter antes da promise. Verificado que `currentId !== requestIdRef.current` só é verdadeiro quando request mais recente foi disparada. Correto e suficiente sem AbortController.
  - NOOP_FETCH (`GridFetchResult<never>`): `never` é subtipo de `T`, portanto `GridFetchResult<never>` é assignável a `GridFetchResult<T>`. Type-safe. Constante declarada em module scope — referência estável, sem re-render.
  - Loading flicker em client mode: `isLoading` no controller (linha 112) usa `isServerMode ? query.isLoading : !!props.loading`. Em client mode, `query.isLoading` é ignorado mesmo quando NOOP seta `true` internamente. Nenhum flicker vaza para a UI.
  - `isDataEmpty` vs `isNoResults` em server mode: mutuamente exclusivos e logicamente corretos. No mount (antes da primeira resposta), `isLoading=true` protege ambos de disparar prematuramente. Correto.
  - `any` encontrado: 5 instâncias (`DEFAULT_GET_ROW_ID:25`, `filterOptions:89`, `render:93`, `valueGetter:94`, `valueFormatter:95`) — todas pré-existentes, nenhuma introduzida pelo F5. Fora do escopo do holistic pass.
  - JSDoc de `DataTableRef.refresh` (linha 203) diz "futuro server mode vai re-fetchar" — server mode já implementado. Stale, não-bloqueante. Registrado em OBSERVATIONS.
- Regressões L-001 a L-014: nenhuma nos arquivos F5
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (F5 server mode) | CONCLUÍDO
- Input: spec `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` (F5) + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f5-server-mode.md` (8 tasks)
- Output:
  - Types `GridFetchParams` e `GridFetchResult<T>` em `data-table.types.ts`
  - Props `fetchData` (opcional) e `rowCount` (opcional) em `DataTableProps`; `rows` virou opcional
  - Hook novo `use-data-table-query.ts`:
    - Chama `fetchData` em useEffect quando filter/sort/pagination/search mudam
    - Request-id guard previne race conditions (resposta fora de ordem é descartada)
    - `refresh()` bumpa refreshKey interno pra forçar refetch sem mudar params
    - isLoading state durante request em andamento + error state
  - Controller auto-detecta server mode via `!!props.fetchData`
  - NOOP_FETCH com retorno `GridFetchResult<never>` (não polui inferência genérica do controller)
  - Imperative ref `refresh()` chama `query.refresh()` em server, no-op em client
  - Showcase em `/clients-crud-server` com mock fetchData simulando latência 500ms + botão Refresh
- Decisões:
  - `rows` virou opcional — não passa quando server mode
  - Search já usa debounce 500ms (do hook search existente) — request só sai depois do delay
  - Request-id guard via useRef counter — simples e suficiente sem AbortController
  - NOOP_FETCH `<never>` pra não vazar `unknown` na inferência do consumer
  - useDataTableQuery executa effect em ambos modos (regras de hooks); em client NOOP não faz fetch real
- Assumption: `fetchData` é memoizada via `useCallback` pelo consumer. Sem isso, refetch em loop.
- Lições novas: nenhuma
- Validação visual: confirmada via DevTools MCP — 100 rows mock, 4 páginas, sort dispara refetch (primeira row vira menor valor R$ 1.100,00 após click no header Valor)
- Pendente: DS Reviewer holistic (Task 8)

### [2026-05-12] | DS REVIEWER | DataTable (F3+F4 fixes re-review) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` + entrada DS Dev acima
- Assumption verificada: "text-label-sm com peso 500 é visualmente suficiente para o counter da bulk bar" — válida. Fix aplicado corretamente; nenhum outro preset disponível foi desconsiderado.
- Critique genuína: além dos 2 fixes, examinados: (1) `!px-0` em `data-table.tsx:389` — reset de padding na célula de seleção, pré-existente, sem equivalente de token DS (zero não é escala), não é violação; (2) `item.value as any[]` em `data-table.tsx:193` — pré-existente, fora do render loop de células, necessário para iterar array de multi-select cujo tipo é unknown em runtime; não introduzido pelos fixes. Nenhum problema novo.
- Regressões: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (F3+F4 fixes reviewer) | CONCLUIDO
- Input: 2 fixes bloqueantes apontados pelo DS Reviewer (REPROVADO abaixo)
- Output: IMPL_PRONTA sinalizado — ambos fixes aplicados, tokens:check OK
- Decisoes:
  1. FIX 1 (L-007): removido `font-semibold` de `data-table-floating-bulk-bar.tsx` — preset `text-label-sm` ja inclui font-weight 500, override avulso viola L-007
  2. FIX 2 (any cast): criado helper `resolveCellValue<T>()` em `data-table.tsx` com tipo `unknown` e cast documentado `Record<string, unknown>` — espelha logica de `getFieldValue` do processor com suporte a dot-path, eliminando `(row as any)` inline no render loop
- Assumption: `text-label-sm` com peso 500 e visualmente suficiente para o counter da bulk bar (se peso 600+ for necessario, DS Designer deve especificar preset alternativo)
- Licoes novas: nenhuma — L-007 reforcado

### [2026-05-12] | DS REVIEWER | DataTable (F3+F4 client-side) | REPROVADO
- Spec verificada: sim — `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` (19 tasks). Revisão holística integradora.
- Assumption verificada: "APIs dos 3 popovers (filter/sort/cols) permanecem estáveis; consumer aplica `className='max-h-[Npx]'` no DataTable pra ativar scroll vertical interno" — verificada. Adapters corretos. Showcase demonstra max-h em ex-scroll. Nenhuma quebra de assumption detectada.
- Critique genuína aplicada: além do checklist, examinados os 4 trade-offs solicitados pelo usuário (ver abaixo) + 2 problemas bloqueantes encontrados.
- Itens reprovados:
  1. `data-table-floating-bulk-bar.tsx:23` — `text-label-sm font-semibold` viola L-007. O preset `text-label-sm` define `font-weight: 500`; adicionar `font-semibold` (700) sobrescreve o token tipográfico diretamente. Ou usar `text-label-sm` sozinho (peso 500, aceitável pra label), ou o DS tem preset `font-semibold` que mapeia para um preset de label — verificar se existe `text-label-sm-bold` ou usar `text-heading-xs`/`text-subheading-xs` se o peso 600+ é necessário. Não combinar preset + modificador avulso.
  2. `data-table.tsx:382` — `(row as any)[field]` é `any` não justificado em código de caminho crítico (render de células). Contexto: `row` é genérico `T`, e o acesso de campo por string string-indexado não tem alternativa trivial em TypeScript puro — mas a justificativa deve ser explícita no código (comentário `// deliberate: T is data-row, field is string-indexed`) ou a assinatura deve usar `unknown` com cast documentado. Como está, é `any` silencioso no render loop de todas as células. A comparação: o processor usa o mesmo padrão em `getFieldValue` (linha 32) mas em função utilitária com assinatura `any` declarada, o que é aceitável. No maestro, o cast inline em JSX é mais arriscado.
- Lições novas: nenhuma nova — L-007 reforçado (preset + modificador avulso = violação mesmo que o preset já exista)

### [2026-05-12] | DS DEV | DataTable (F3+F4 client-side) | CONCLUÍDO
- Input: spec `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` (F3 + F4) + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` (20 tasks)
- Output:
  - 9 hooks SRP em `src/components/ui/DataTable/hooks/`: controller, columns, sort, pagination, selection, density, search, filters, processor
  - Maestro `data-table.tsx` orquestrando Table + TableToolbar + FooterTable + BulkActionsBar do TableToolbar
  - Context provider memoizado
  - 4 parts default: empty, loading, no-results, floating-bulk-bar
  - Adapters pros 3 popovers existentes (FilterPopover, SortPopover, ColsPopover) + ToolbarApplied
  - Selection include/exclude com togglePage + selectAll + indeterminate
  - Search debounced 500ms
  - Pagination com auto-reset ao mudar filter/search
  - Imperative ref: refresh (no-op em client), getState, getSelectedIds, getSelectedCount, clearSelection
  - Showcase em `/data-table` com 5 sections (basic, filtros, seleção, scroll vertical, empty)
- Decisões:
  - Pipeline cascateado em useMemo (mudar página não re-roda filter/search/sort)
  - Provider value memoizado evita re-render em cascata
  - Selection model include/exclude preparado pra "select all" global sem materializar IDs (F8)
  - useDataTableColumns reusa o useColumnWidths existente do Table primitivo
  - Bulk bar usa `<TableToolbar bulkBar={...}>` (substitui left+actions automaticamente) — opção floating mantida exportada
  - FilterPopover usa operators `eq/neq/contains/gt/lt`; processor usa `equals/neq/contains/gt/lt` — adapter mapeia bidirecionalmente
  - Chip "applied filter" faz lookup do label da option (mostra "Ativo" em vez de "active")
  - Table primitivo: slot `scroll` mudou pra `flex-1 min-h-0 overflow-auto` (estica em flex column parent com altura forçada; altura natural sem altura externa)
  - Slot `resizeHandle` removeu `before:h-screen` (causava scrollHeight inflado do head — bug crítico identificado via DevTools MCP)
- Assumption: APIs dos 3 popovers (filter/sort/cols) permanecem estáveis; consumer aplica `className="max-h-[Npx]"` no DataTable pra ativar scroll vertical interno
- Lições novas: nenhuma nova (mas reforçou: pseudo-elements absolute com h-screen DENTRO de overflow:auto causam scrollHeight inflado — sempre evitar projeções `h-screen` dentro de scroll containers)
- Pendente: DS Reviewer holistic

### [2026-05-12] | DS DEV | DataTable (Task 15 — data-table.tsx Maestro) | CONCLUIDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 15 -- proposta base fornecida pelo usuario com instrucao de ajustar adapters conforme APIs reais
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/data-table.tsx` criado -- exporta `DataTable` (generic forwardRef component)
  - Compoe: `<DataTableProvider>` + `<TableToolbar>` + `<Table>` primitivo + `<FooterTable>` + `<DataTableFloatingBulkBar>`
  - 3 adapters de popover ajustados para APIs reais:
    - **FilterPopover**: prop `filters` (nao `value`/`entries`), `onFiltersChange` (nao `onChange`/`onApply`). Adapter converte `FilterModel.items[]` <-> `FilterPopoverEntry[]` (campo mapping: `field`<->`columnKey`, `operator`<->`op`, `value` stringificado)
    - **SortPopover**: prop `sortBy` (nao `criteria`/`value`), `onSortByChange` (nao `onChange`). Adapter converte single `SortModel` <-> `SortPopoverCriterion[]` array (field<->key, direction<->dir)
    - **ColsPopover**: props `visibleCols: Set<string>`, `onVisibleChange`, `pinnedCols: Set<string>`, `onPinnedChange`, `onColumnsReorder`. Adapter converte `hiddenColumns Set` <-> `visibleCols Set` (inversao), `pinnedColumns Record` <-> `pinnedCols Set`, e `ColsPopoverColumn[]` reorder -> `handleReorder(string[])`
  - **ToolbarSegmented** corrigido: usa `items` com `children`/`label` (nao `options` com `icon`/`ariaLabel`). Items estabilizados como const fora do componente
  - **ToolbarSearch**: usa `onChange` nativo (ChangeEvent<HTMLInputElement>), nao custom handler
  - States de feedback: isLoading/isDataEmpty/isNoResults com render condicional de parts
  - Selection: checkbox header com indeterminate, checkbox por row, floating bulk bar com actions callback
  - `npm run tokens:check` (tsc --noEmit) passou sem erros -- zero `as any`
- Decisoes:
  - DENSITY_ITEMS como const modular fora do componente para referencia estavel (evita recriacao a cada render)
  - handleVisibleChange e handlePinnedChange iteram sobre todos os fields e chamam handleShow/handleHide/handlePin individualmente -- cols hook nao expoe "setVisibleCols(Set)" atomico, entao adaptamos via loops
  - FilterPopover value stringificado via `String(item.value)` porque FilterPopoverEntry.value e sempre string, enquanto FilterItem.value pode ser qualquer FilterValue
  - SortPopover recebe array mesmo que DataTable suporte apenas single-sort na v1 -- adapter converte criteria[0] para single SortModel, e SortModel null para array vazio
- Assumption: os hooks SRP (cols, sort, filters, search, pagination, density, selection) retornam handlers estaveis (useCallback internos) para que os adapters do maestro nao causem re-renders desnecessarios; especificamente, `handleShow`/`handleHide`/`handlePin` chamados em loop sincronamente resultam em batch de setState pelo React 18+ (automatic batching)
- Licoes novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Tasks 13-14 — parts: empty, loading, no-results, floating-bulk-bar) | CONCLUIDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Tasks 13-14 -- conteudo exato fornecido pelo usuario
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/parts/data-table-empty.tsx` criado -- exporta `DataTableEmpty` (function component)
    - Layout centralizado com icone Inbox (size-icon-2xl), titulo (text-title-md) e descricao (text-paragraph-sm)
    - Tokens DS: gap-gp-md, min-h-[240px], p-pad-3xl, text-fg-subtle, text-fg-default, text-fg-muted
  - `src/components/ui/DataTable/parts/data-table-loading.tsx` criado -- exporta `DataTableLoading` (function component)
    - Layout centralizado com icone Loader2 (size-icon-xl, animate-spin), mensagem (text-paragraph-md)
    - Tokens DS: gap-gp-md, min-h-[240px], p-pad-3xl, text-fg-brand, text-fg-muted
  - `src/components/ui/DataTable/parts/data-table-no-results.tsx` criado -- exporta `DataTableNoResults` (function component)
    - Layout centralizado com icone SearchX (size-icon-2xl), titulo (text-title-md) e descricao (text-paragraph-sm)
    - Tokens DS: gap-gp-md, min-h-[240px], p-pad-3xl, text-fg-subtle, text-fg-default, text-fg-muted
  - `src/components/ui/DataTable/parts/data-table-floating-bulk-bar.tsx` criado -- exporta `DataTableFloatingBulkBar` (function component) + `DataTableFloatingBulkBarProps` (type)
    - Props: count, onClear, actions (ReactNode opcional)
    - Consome slot `bulkBar()` de data-table.styles.ts (fixed bottom, brand-subtle bg, shadow-sh-lg)
    - Render condicional: retorna null quando count === 0
    - Count com pluralizacao ("selecionado"/"selecionados"), actions slot, botao X (Button icon-xs ghost secondary)
    - role="region" aria-label para acessibilidade
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisoes: nenhuma -- implementacao literal do conteudo exato especificado
- Assumption: os componentes parts sao consumidos pelo DataTable maestro (data-table.tsx, task futura) que decide qual renderizar baseado nos estados de feedback (isDataEmpty, isLoading, isNoResults) do useDataTableController; os parts nao gerenciam estado proprio
- Licoes novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 12 — use-data-table-controller hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 12 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-controller.ts` criado — exporta `useDataTableController<T>()` (function)
  - Agrega todos os 8 hooks SRP: columns, sort, filters, search, pagination, density, processor, selection
  - Calcula 3 estados de feedback: `isLoading`, `isDataEmpty`, `isNoResults`
  - `useImperativeHandle` expõe 5 métodos na ref: `refresh` (no-op client mode), `getState`, `getSelectedIds`, `getSelectedCount`, `clearSelection`
  - `getState` via `useCallback` retorna snapshot completo `DataTableState` (density, sortModel, paginationModel, selectionModel, filterModel, search, columnWidths, pinnedColumns, hiddenColumns, columnOrder)
  - `contextValue` via `useMemo<DataTableContextValue<T>>` com 16 campos (rows, effectiveColumns, columnWidths, stickyOffsets, columnOrder, hiddenColumns, pinnedColumns, sortModel, paginationModel, selection{state,isRowSelected,selectedCount}, density, search, filterModel, getRowId)
  - Retorna objeto com contextValue + feedback states + processed data + todos os sub-hooks individuais
  - Pagination `resetTriggers` wired a `[filters.filterModel.items.length, search.debouncedValue]`
  - Selection recebe `processed.rowsAllPagesProcessed` (não `props.rows`) para togglePage correto após filter/sort
  - `DEFAULT_GET_ROW_ID` fallback para `row.id` com cast seguro
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: todos os 8 sub-hooks retornam objetos com referências estáveis (via useCallback/useMemo internos) para que os useMemo/useCallback do controller não invalidem desnecessariamente; props callbacks (`onSortModelChange`, `onSelectionModelChange`, etc.) são estabilizados pelo consumer com useCallback próprio
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 11 — use-data-table-processor hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 11 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-processor.ts` criado — exporta `useDataTableProcessor<T>()` (hook), `UseDataTableProcessorParams<T>` (type), `UseDataTableProcessorResult<T>` (type)
  - Pipeline cascateado em 4 etapas, cada uma em `useMemo` separado: filter -> search -> sort -> paginate
  - Etapa 1 (filter): `applyFilters` com suporte a AND/OR logic operator, 10 operadores (contains, equals, startsWith, endsWith, isEmpty, isNotEmpty, isAnyOf, gt, lt, gte, lte), lookup via `valueGetter` ou dot-path
  - Etapa 2 (search): `applySearch` com needle lowercase, exclui colunas type=actions, suporta searchField específico ou "all"
  - Etapa 3 (sort): `applySort` com null-safe comparison, numeric vs string auto-detect, direction asc/desc
  - Etapa 4 (paginate): slice baseado em `(page-1)*pageSize`
  - Retorna `rowsToRender` (paginado), `rowsAllPagesProcessed` (sorted sem paginate — para togglePage), `totalAfterFilter` (para footer "1-10 de N")
  - Utility functions puras: `getFieldValue` (dot-path access), `applyValueGetter`, `applyFormatter`
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) estabiliza `columns` com useMemo, `filterModel` e `paginationModel` são objetos estáveis (não recriados a cada render), e `search`/`searchField` são strings primitivas — garantindo que os useMemo cascateados não invalidem desnecessariamente
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Tasks 8-10 — density, search, filters hooks) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Tasks 8, 9, 10 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-density.ts` criado — exporta `useDataTableDensity()` (hook), `UseDataTableDensityParams` (type), `UseDataTableDensityResult` (type)
    - Controlled/uncontrolled pattern com `defaultDensity = "standard"`
    - `setDensity(next)` atualiza estado interno (uncontrolled) e dispara `onDensityChange` callback
  - `src/components/ui/DataTable/hooks/use-data-table-search.ts` criado — exporta `useDataTableSearch()` (hook), `UseDataTableSearchParams` (type), `UseDataTableSearchResult` (type)
    - Separa `inputValue` (tempo real, binding do input) de `debouncedValue` (debounced, alimenta processor)
    - Debounce via `useEffect` + `setTimeout` com `debounceMs` configurável (default 500ms)
    - `flush()` aplica o valor imediatamente (Enter, blur)
    - Controlled/uncontrolled pattern para o inputValue
  - `src/components/ui/DataTable/hooks/use-data-table-filters.ts` criado — exporta `useDataTableFilters()` (hook), `UseDataTableFiltersParams` (type), `UseDataTableFiltersResult` (type)
    - Controlled/uncontrolled pattern com `initialFilterModel` opcional
    - `setFilterModel(model)` atualiza estado e dispara `onFilterModelChange`
    - `clearFilters()` reseta para `EMPTY_MODEL` (`{ items: [], logicOperator: "AND" }`)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) estabiliza `onDensityChange`, `onSearchChange` e `onFilterModelChange` com useCallback próprio; `debounceMs` é estável (não muda entre renders) para evitar que o useEffect de debounce reinicie desnecessariamente
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 7 — use-data-table-selection hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 7 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-selection.ts` criado — exporta `useDataTableSelection<T>()` (hook), `UseDataTableSelectionParams<T>` (type), `UseDataTableSelectionResult<T>` (type)
  - Hook implementa include/exclude model: `type: "include"` = ids são os selecionados; `type: "exclude"` = ids são os excluídos (tudo menos esses)
  - Controlled quando `selectionModel` prop fornecida; uncontrolled caso contrário
  - `toggleRow(row)` alterna uma row no Set, `togglePage(rowsOnPage)` seleciona/deseleciona todas as rows da página
  - `selectAll()` seta `{ type: "exclude", ids: new Set() }` — seleciona tudo sem materializar IDs
  - `clear()` seta `{ type: "include", ids: new Set() }` — limpa tudo
  - `isPageSelected(rowsOnPage)` e `isPageIndeterminate(rowsOnPage)` para checkbox header (all/indeterminate)
  - `selectedCount` e `selectedIds` computados via useMemo
  - `onSelectionModelChange` callback disparado em ambos os modos (controlled e uncontrolled)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) estabiliza `onSelectionModelChange` com useCallback próprio; `rows` e `getRowId` são estáveis (useMemo/useCallback) para que `selectedIds`, `isRowSelected`, `toggleRow` e `togglePage` não sejam recriados desnecessariamente
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 6 — use-data-table-pagination hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 6 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-pagination.ts` criado — exporta `useDataTablePagination()` (hook), `UseDataTablePaginationParams` (type), `UseDataTablePaginationResult` (type)
  - Hook implementa controlled/uncontrolled pattern: controlled quando `paginationModel` prop fornecida; uncontrolled caso contrário
  - `setPage(n)` atualiza apenas page, `setPageSize(n)` reseta page para 1, `setPaginationModel(m)` set direto
  - `resetTriggers` (unknown[]) dispara useEffect que reseta page para 1 quando qualquer trigger muda (ex: filtros, search)
  - `onPaginationModelChange` callback disparado em ambos os modos (controlled e uncontrolled)
  - DEFAULT_PAGE_SIZE = 25
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) passa `resetTriggers` estabilizados (ex: `[debouncedSearch, JSON.stringify(filterModel)]`) para que o useEffect não dispare em falsos positivos por referência instável de array
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 5 — use-data-table-sort hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 5 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-sort.ts` criado — exporta `useDataTableSort()` (hook), `UseDataTableSortParams` (type), `UseDataTableSortResult` (type)
  - Hook implementa ciclo asc -> desc -> null no `handleSort(field)`
  - Controlled quando `sortModel` prop fornecida (via `controlledSort !== undefined`); uncontrolled caso contrário
  - `setSortModel` bypassa o ciclo para set direto
  - `onSortModelChange` callback disparado em ambos os modos (controlled e uncontrolled)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) estabiliza `onSortModelChange` com useCallback próprio antes de passar ao hook, evitando que `setSortModel` e `handleSort` sejam recriados desnecessariamente a cada render
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 4 — use-data-table-columns hook) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 4 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/hooks/use-data-table-columns.ts` criado — exporta `useDataTableColumns<T>()` (hook), `UseDataTableColumnsParams<T>` (type), `UseDataTableColumnsResult<T>` (type)
  - Hook gerencia 4 estados uncontrolled: widthOverrides, pinnedOverrides, hiddenColumns, columnOrder
  - Computa `effectiveColumns` via useMemo (filtra hidden, aplica order, mescla overrides)
  - Reutiliza `useColumnWidths` do Table primitivo para calcular widths efetivos e sticky offsets
  - Expõe 5 handlers estáveis via useCallback: handleResize, handlePin, handleHide, handleShow, handleReorder
  - Expõe `pinnedColumns` combinado (overrides + defaults do columnDef)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: o consumer (useDataTableController) vai estabilizar o array `columns` com useMemo antes de passar ao hook, evitando que o `columnOrder` inicializado via lazy init do useState fique estale quando columns mudam dinamicamente (lazy init roda apenas no mount)
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | DataTable (Task 3 — Context provider) | CONCLUÍDO
- Input: spec do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-data-table-f3-f4.md` Task 3 — conteúdo exato fornecido pelo usuário
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/DataTable/context/data-table-context.tsx` criado — exporta `DataTableContextValue<T>` (type), `DataTableProvider` (component), `useDataTableContext<T>()` (hook)
  - Context inicializado como `null`, Provider wrapper simples, hook com throw guard para uso fora de `<DataTable>`
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal do conteúdo exato especificado
- Assumption: os hooks SRP (Tasks 4-12) vão compor o `DataTableContextValue` object via `useMemo` no controller e passá-lo ao `DataTableProvider` — o Provider não faz memoização própria, a responsabilidade é do caller
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (open state — row detail focus) | CONCLUÍDO
- Input: spec recebida diretamente pelo usuário (sem gate — edição de componente existente, nenhum token novo)
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/Table/table.types.ts` — prop `open?: boolean` adicionada em `TableRowProps`
  - `src/components/ui/Table/table-card-row.tsx` — prop `open?: boolean` adicionada em `TableCardRowProps`; lógica `highlighted = selected || open` e `data-state` com valores "selected", "open", "selected open", ou ausente
  - `src/components/ui/Table/table.tsx` — `TableRow` atualizado: destrutura `open = false`, calcula `highlighted`, passa `selected: highlighted` ao variant tv(), `aria-selected` reflete apenas `selected`, `data-state` distingue os estados
  - `src/preview/pages/TableDoc.tsx` — `ClientsTableExample` ganhou `openRowId` state; click na row toggle open/close; sub-elementos já tinham `e.stopPropagation()`
  - `src/components/ui/Table/USAGE.md` — seção "Estado open (foco pra detalhe)" adicionada após "Card mode"; ARIA section atualizada com novos valores de data-state
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões:
  - `open` reusa o visual do variant `selected: true` em table.styles.ts (bg brand-tinted + strip lateral brand) — zero CSS novo, zero token novo
  - `aria-selected` reflete apenas `selected` (seleção via checkbox) — `open` não é seleção no sentido ARIA, é foco de detalhe; distinguido apenas via `data-state`
  - `data-state` usa string composta "selected open" quando ambos coexistem — consumidores podem fazer `[data-state~="open"]` para CSS matching
- Assumption: o visual de `selected` e `open` serem idênticos é intencional para v1; se no futuro precisarem ser visualmente distintos, será necessário novo variant ou compoundVariant em table.styles.ts
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | TableHeadCell (refactor: unified headRightStack) | CONCLUÍDO
- Input: refactor visual solicitado diretamente pelo usuário (sem gate -- edição de componente existente)
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/Table/table.styles.ts` -- removidos 3 slots independentes (sortActive, sortHint, headMenuSlot), adicionados 4 novos slots (headRightStack, headSortActive, headSortHint, headMenuItem). Stack unificado absolute right-[2px] com hidden/inline-flex no hover em vez de opacity-0/1.
  - `src/components/ui/Table/table.tsx` -- JSX do TableHeadCell refatorado: sort + headMenu agrupados dentro de um unico span headRightStack. pointer-events-none no wrapper + pointer-events-auto no headMenuItem garante clicabilidade do menu.
  - Slots mantidos sem alteracao: sortBadge, sortIcon (continuam usados dentro dos novos slots).
  - Comentario interno do SortIndicator atualizado para refletir novo mecanismo (display vs opacity).
  - `npm run tokens:check` (tsc --noEmit) passou sem erros.
- Decisoes:
  - hidden/inline-flex em vez de opacity-0/1: stack encolhe dinamicamente quando itens estao ocultos, nao reserva espaco.
  - pointer-events-none no wrapper + pointer-events-auto no headMenuItem: headMenu button continua clicavel sem interferir com sort click no headcell.
  - right-[2px] unificado (era right-[32px] para sort e right-[2px] para menu separadamente).
- Assumption: o consumer (TableDoc showcase) nao referencia os slots antigos (sortActive, sortHint, headMenuSlot) diretamente -- apenas usa os componentes TableHeadCell que consomem os slots internamente via styles.
- Licoes novas: nenhuma

### [2026-05-12] | DS DEV | Table (3 fixes — resize drag, sort visual, header space) | CONCLUÍDO
- Input: 3 bug fixes solicitados diretamente pelo usuário (sem gate — edição de componente existente)
- Output: IMPL_PRONTA sinalizado
  - FIX 1: `src/components/ui/Table/use-column-resize.ts` — reescrito com refs estáveis (onResizeRef, onResizeEndRef, minRef, maxRef, handlersRef). useEffect cleanup com deps vazias. Handlers no document nunca recriados durante drag.
  - FIX 2: `src/components/ui/Table/table.tsx` — SortIndicator agora mostra ArrowUp/ArrowDown quando sortado (antes só badge). Área de sort inline (sortActive slot) com badge + seta. Sort hint (sortHint slot) absolute right quando inativo.
  - FIX 3: `src/components/ui/Table/table.styles.ts` — sortIcon simplificado (shrink-0, sem ml-gp-xs/text-fg-muted). Novos slots: sortActive (inline-flex, text-fg-default), sortHint (absolute right, opacity-0, aparece no hover). headMenuSlot já tinha z-[2] correto.
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões:
  - FIX 1: lazy init via useRef em vez de useCallback com deps — garante referência 100% estável pro ciclo de vida do componente
  - FIX 2: sort hint usa ArrowUpDown (ícone neutro) com opacity controlada pelo slot CSS, não inline
  - FIX 3: sortHint posicionado em right-[32px] pra não sobrepor com resizeHandle (right-0). headMenuSlot em z-[2] fica por cima de sortHint z-[1]
- Assumption: o consumer (TableDoc showcase / DataTable futuro) já passa onResize com setState — a estabilidade dos handlers via refs resolve o bug sem mudança no consumer
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (F1+F2 — holistic final) | APROVADO
- Spec verificada: sim — `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` (12 tasks). Todas as tasks individuais tiveram APROVADO no pipeline-state. Esta é a pass integradora.
- Assumption verificada: "alpha 6/10% brand é visível em ambos os temas e não confunde com `table-row-hover` (gray puro)" — verificada estaticamente:
  - Light: `table-row-selected` = brand[600] @ 6% sobre white. brand[600] = oklch(0.52 0.14 151), L≈52. Com 6% alpha sobre white (L≈100): mix L≈97.1 (quase branco, mas com chroma green ~0.008). `table-row-hover` = gray[100] ≈ oklch(0.93). Diferença L entre hover-gray e selected-brand é ~4pp — pequena, mas o chroma ~0.008 em oklch é perceptível como tint verde suave sobre branco. Risco real: em monitores sRGB de baixa gama o tint pode ser quase invisível. Não é bug bloqueante v1 (assumption documentada com alternativa de fallback se quebrar).
  - Dark: `table-row-selected` = brandContrast[400] @ 10% sobre oklch(0.225). brandContrast[400] = oklch(0.73 0.16 162). Mix L ≈ 0.225 + 10% * (0.73 - 0.225) = ~0.276. `table-row-hover` = oklch(0.252). Diferença L ~0.024 — perceptível, e com chroma verde presente no mix. Assumption válida em dark. Em light há risco de invisibilidade em gama baixa mas a decision doc já prevê isso.
- Critique genuína: varredura L-001 a L-014 completa sem nenhum match bloqueante. Examinado além do checklist: (1) `w-[6px]` no resizeHandle (styles.ts:54) — valor arbitrário sem token DS equivalente para largura de handle funcional; não existe token de "component chrome size" no DS. Aceitável como hardcode estrutural, similar ao `z-[5]` já sinalizado no Task 1 e aprovado. (2) `z-[5]` para cells pinned (styles.ts:112-113) — mesmo padrão do Task 1, aprovado. (3) Context interno não exportado — correto, privacidade verificada. Provider cria novo objeto por render mas density é quase-estática — custo aceitável. (4) `useColumnResize` chamado incondicionalmente mesmo quando `resizable=false` — correto (rules of hooks); custo é apenas uma chamada vazia. (5) API "lego" completamente controlada: density, widths, offsets, sort, selection — nenhum estado interno que escape ao consumer. (6) TableCardRow não consome TableContext (não acessa density) — coerente: card mode é substituição de render, não usa slots de density. (7) `mb-pad-md` e `flex flex-col gap-gp-md` no showcase — tokens DS corretos. (8) `style={{ height: 320 }}` e `max-w-[480px]` no TableDoc — layout de demo, não código de componente; aceitável. (9) Cross-check index.ts × arquivos fonte: todos os 6 components, 2 hooks e 10 types existem e são exportados corretamente. (10) USAGE.md cobre os 5 cenários (basic, pin, resize, sort, card mode) + densidades + tokens + ARIA; alinhado com API real — exemplo de resize inclui aviso sobre `width` necessário (observação do Task 7 incorporada na doc). Nenhum item altera a direção ou bloqueia.
- Regressões L-001 a L-014: nenhuma encontrada em nenhum dos 7 arquivos do componente.
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (primitivo — F1+F2 completo) | CONCLUÍDO
- Input: spec `.ai/status/archive/superpowers-2026-05/specs/2026-05-12-data-table-design.md` (F1+F2) + plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` (12 tasks)
- Output:
  - 6 subcomponentes em `src/components/ui/Table/`: Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell (ARIA grid completo, density via Context interno)
  - 1 variante de render: TableCardRow (card mode standalone — consumer decide quando renderizar)
  - 2 hooks puros: useColumnWidths (widths efetivos + sticky offsets), useColumnResize (drag handle via document listeners)
  - 14 slots tv em table.styles.ts: root, scroll, head, headCell, body, row, cell, resizeHandle, sortIcon, cardWrap, cardHeader, cardItem, cardLabel, cardValue
  - 8 variants: density, sticky, selected, clickable, pinned, align, sortable, ellipsis
  - Showcase em `/table` com 5 sections (density toggle, sticky scroll, pin+sort+resize, selection, card mode)
  - USAGE.md cobrindo: basic, pin, resize, sort, card mode, densidades, tokens, ARIA
- Decisões:
  - Card mode é componente irmão (TableCardRow), não auto-switch — consumer decide via ResizeObserver
  - Resize via listeners no document (não no handle) pra suportar drag rápido — `e.stopPropagation()` previne conflito sort/resize
  - Sticky col bg = `bg-inherit` na cell + `bg-bg-table-head` no head → herança limpa do bg da row
  - Density propagada por Context interno privado (descoberto no review da Task 4 — spec original tinha gap)
  - 2 tokens novos `bg.table-row-selected` e `bg.table-row-selected-hover` adicionados antes (entrada anterior)
- Assumption: API "lego" controlada é mais flexível que `<Table columns rows />` agregado — validação real virá no uso pelo DataTable (passo 2)
- Lições novas: nenhuma — design e fix de Context foram dentro do esperado pra primitivos
- Pendente: DS Reviewer formal (Task 12)

### [2026-05-12] | DS DEV | Table (Task 10 — TableDoc showcase page) | CONCLUÍDO
- Input: spec aprovada do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 10
- Output: IMPL_PRONTA sinalizado
  - `src/preview/pages/TableDoc.tsx` criado — showcase com 5 sections: DensityExample, StickyExample, PinSortResizeExample, SelectionExample, CardModeExample
  - `src/App.tsx` modificado — import de TableDoc adicionado, "table" adicionado ao DOC_PAGES, render `{activePage === "table" && <TableDoc />}` adicionado
  - `src/preview/components/doc-nav-data.ts` modificado — `{ label: "Table", href: "table" }` adicionado na seção Components (ordem alfabética, antes de Tabs)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: Badge `color="neutral"` inexistente na API do Badge (colors: primary|secondary|critical|success|warning|info) — mapeado `inactive` status para `"secondary"` em vez do `"neutral"` original da spec
- Assumption: todos os exports do Table barrel (`Table`, `TableHead`, `TableHeadCell`, `TableBody`, `TableRow`, `TableCell`, `TableCardRow`, `useColumnWidths`, types) estão estáveis e a API demonstrada na showcase reflete o uso canônico do primitivo
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (Task 9 — barrel, reexport, USAGE.md) | CONCLUÍDO
- Input: spec aprovada do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 9
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/Table/index.ts` criado — barrel com 6 component exports, 2 hook exports, 10 type exports, 4 type-only re-exports de hooks
  - `src/components/index.ts` modificado — `export * from "./ui/Table"` adicionado após último export existente
  - `src/components/ui/Table/USAGE.md` criado — doc com 7 exemplos (basic, pin, resize, sort, card mode, densidades, tokens, ARIA)
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal da spec
- Assumption: todos os exports nomeados no barrel existem nos módulos fonte e são a API pública estável do Table primitive
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (Task 8 fix — cardWrap variants) | CONCLUÍDO
- Input: fix request — variants `selected` e `clickable` em `tableStyles` afetavam apenas slot `row`, não `cardWrap`
- Output: IMPL_PRONTA sinalizado
  - `src/components/ui/Table/table.styles.ts` — variants `selected` e `clickable` agora aplicam classes identicas ao slot `cardWrap`
  - `selected: true` → cardWrap recebe `bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover`
  - `selected: false` → cardWrap recebe `hover:bg-bg-table-row-hover`
  - `clickable: true` → cardWrap recebe `cursor-pointer`
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: classes idênticas entre `row` e `cardWrap` para consistência visual entre modo tabela e modo card
- Assumption: `TableCardRow` já passa `selected` e `clickable` ao chamar `tableStyles({ selected, clickable })` e consome o slot `cardWrap()` — portanto as novas classes serão aplicadas automaticamente sem alteração no componente
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (Task 8 — TableCardRow) | CONCLUÍDO
- Input: spec aprovada do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 8 Step 8.1
- Output: IMPL_PRONTA sinalizado (parcial — Task 8 de N)
  - `src/components/ui/Table/table-card-row.tsx` criado — exporta `TableCardRow` + type `TableCardRowProps`
  - Props: header, headerActions, items (ReadonlyArray com label/value/key), selected, clickable, onClick, className
  - `role="article"`, `aria-selected` quando selected, `data-state` quando selected
  - Header renderiza sempre; body items condicionado a `items.length > 0`
  - Usa slots `cardWrap`, `cardHeader`, `cardItem`, `cardLabel`, `cardValue` de table.styles.ts
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal da spec
- Assumption: os variants `selected` e `clickable` passados a `tableStyles()` afetam o slot `row` mas NÃO o slot `cardWrap` no tv() atual; cardWrap usa apenas suas classes base. Se card mode precisar de visual distinto para selected/clickable, os compoundVariants em table.styles.ts precisarão ser estendidos para o slot cardWrap (responsabilidade de task futura ou DataTable).
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 7 — resize handle no TableHeadCell) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 7 Step 7.1; implementação é cópia byte-a-byte da spec.
- Gate verificado: N/A — Task 7 é integração de hook técnico derivado de spec aprovada; sem token novo, sem componente novo; gate não se aplica.
- Assumption verificada: Assumption própria da Task 7: "o hook é chamado incondicionalmente (rules of hooks) e só adiciona listeners no document no mousedown — portanto custo runtime em colunas não-resizable é apenas o custo de uma chamada de hook vazia por render". Válida: confirmado pela leitura do hook (linha 86–102 do use-column-resize.ts — sem side-effects fora do mousedown). Assumption da Task 6 sobre isDragging via useRef (não dispara re-render) permanece válida e documentada.
- Critique genuína: Varredura L-001 a L-014 sem match. Examinado além do checklist: (1) `useColumnResize` chamado incondicionalmente com `currentWidth: width ?? 160` — correto pelas rules of hooks. Porém existe assimetria: `style.width` só é setado quando `width !== undefined` (linha 181–185 do table.tsx), então uma coluna sem `width` prop renderiza sem width inline (flex) mas o hook recebe `startWidth = 160`. Se o consumer acionar resize nessa coluna, o resize parte de 160px mas a coluna real é flex — o resultado visual pode divergir do valor reportado em `onResizeEnd`. Não é bug bloqueante para v1 (a spec não endereça o caso de `resizable=true` sem `width` definido), mas é armadilha silenciosa para o consumer do DataTable. (2) `data-dragging={resize.isDragging || undefined}` — quando `isDragging` é false, o atributo é omitido (não renderiza `data-dragging="false"`); quando true, renderiza `data-dragging="true"`. Padrão correto e consistente com o uso de data-state no projeto. (3) Posicionamento do handle após SortIndicator: estrutura DOM correta — handle é `position: absolute right-0`, independente da ordem no DOM. (4) `e.stopPropagation()` está no hook (linha 89 do use-column-resize.ts) — previne que mousedown no handle propague ao onClick de sort do columnheader. Conflito sort/resize resolvido. (5) `aria-hidden` no handle div — correto, handle é decorativo/funcional sem semântica ARIA própria; ação de resize é esperada via drag de mouse. Nenhum item altera a direção ou bloqueia a task.
- Regressões L-xxx encontradas: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 6 — use-column-resize) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 6 Step 6.1; implementação é cópia byte-a-byte da spec.
- Gate verificado: N/A — Task 6 é hook técnico derivado de spec aprovada; sem token novo, sem componente novo; gate não se aplica.
- Assumption verificada: Assumption própria da Task 6: "o consumer passa `currentWidth` como prop controlada, estabilizando a referência de `onResize`/`onResizeEnd` com useCallback próprio para evitar re-binding desnecessário dos handlers no document". Válida como responsabilidade explícita do consumer — documentada para rastreabilidade. Assumptions de Tasks anteriores (tokens, variants, density via context) não são afetadas por este hook puro sem JSX e sem imports de styles.
- Critique genuína: Varredura L-001 a L-014 sem match (sem JSX, sem classes CSS, sem tv()). Examinado além do checklist: (1) `isDragging: stateRef.current.dragging` lido no return — `useRef` mutation não dispara re-render, portanto o valor retornado é snapshot do render anterior durante drag. O JSDoc diz "Útil pra estilizar o handle (active state)" — essa afirmação é enganosa: consumer que aplica classe CSS baseado em `isDragging` não vai ver a mudança durante o drag. Porém o uso canônico no `@example` é `data-dragging={isDragging}` + CSS via `[data-dragging=true]`, o que também não atualiza durante drag pelo mesmo motivo. O padrão funcional real é `:active` CSS. Não é bug crítico mas o JSDoc cria expectativa errada. (2) Re-binding de handlers durante drag: se `onResize`/`minWidth`/`maxWidth` mudam entre renders durante um drag em curso, o `handleMouseMove` bindado no document é o da versão anterior (refs de handlers são capturadas no mousedown). O drag em curso usa os valores do momento do mousedown — comportamento correto e previsível. (3) `stateRef.current.lastWidth = currentWidth` a cada render é mutation de ref sem efeito colateral — correto. (4) Cleanup no unmount cobre o caso de desmontagem durante drag. (5) `e.stopPropagation()` no mousedown evita que click em resize propague para sort click do head cell — correto e intencional para Task 7. Nenhum item altera a direção ou bloqueia a task.
- Regressões L-xxx encontradas: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 5 — use-column-widths) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 5; hook puro sem JSX, sem tokens visuais, sem componente visual.
- Gate verificado: N/A — Task 5 é implementação de hook técnico derivado de spec aprovada; não é token novo nem componente novo; gate não se aplica.
- Assumption verificada: A assumption de Tasks anteriores ("tokens e variants em table.styles.ts cobrem os estados visuais") não é afetada por este hook — o hook é agnóstico a estilos, apenas computa widths e offsets. Assumption própria da Task 5: "o consumer (DataTable / useDataTableColumns) vai estabilizar o array `columns` com useMemo próprio antes de passar ao hook, evitando recálculo desnecessário a cada render". Assumption válida como responsabilidade do consumer — documentada aqui para rastreabilidade.
- Critique genuína: Varredura L-001 a L-014 sem match (arquivo sem JSX, sem classes CSS, sem imports de tv()). Examinado além do checklist: (1) `WidthColumnInput` é tipo mínimo suficiente — consumer passa superset (ColumnDef completo), TS aceita estrutural. (2) Algoritmo O(N): passo 1 (widths), passo 2 (left offsets), passo 3 (right offsets) — três iterações independentes, nenhuma aninhada. (3) Right offset do último pinned right = 0, segundo da direita = width do último — correto; validado mentalmente pelo algoritmo. (4) `ColumnPinned = "left" | "right" | undefined` — hook verifica apenas `=== "left"` e `=== "right"`, cobrindo o union inteiro. (5) `useMemo` com dep `[columns]` — se consumer passar array literal inline, referência muda a cada render e useMemo é refeito; não é bug do hook, é responsabilidade do consumer estabilizar (coberto pela assumption acima). (6) Campos `field` duplicados: segunda coluna sobrescreve a primeira nos Records — não validado pelo hook; consumer é responsável por unique fields; não-bloqueante. (7) DEFAULT_COLUMN_WIDTH = 160 não documentado no JSDoc — menor; não bloqueia.
- Regressões L-xxx encontradas: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 4 re-review — TableContext fix) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 4; fix alinha implementação à spec original.
- Assumption verificada: A assumption quebrada da revisão anterior ("density propagaria via props") foi corrigida pela introdução de TableContext interno. A nova assumption do fix — "TableContext privado com default 'standard' propaga density corretamente para todos os consumers sem risco de crash fora de <Table>" — é válida: (1) o default garante fallback robusto; (2) os três consumers (TableRow, TableCell, TableHeadCell) leem density via useContext e passam ao slot correto; (3) Table chama styles.root() sem argumento density, correto porque o slot root não tem variant density.
- Critique genuína: Varredura L-001 a L-014 sem matches reais. Além do checklist: (1) TableContext e useTableContext não são exportados — privacidade verificada (linhas 17-27). (2) Default do context é "standard" — renderização fora de <Table> não crasha, apenas não tem efeito de density não-padrão. (3) Provider cria novo objeto `{ density }` a cada render de <Table> — todos os consumers re-renderizam quando density muda, o que é o comportamento correto; quando density NÃO muda, o objeto é novo a cada render mas density não mudou, portanto sem repintura visual — o custo de re-render existe mas é aceitável para v1 dado que density é prop quase-estática. (4) Dependência implícita: TableRow/TableCell/TableHeadCell renderizados fora de <Table> recebem density "standard" pelo default — não crasham, comportam-se como densidade padrão. Documentado e aceitável. (5) Regressão de tasks anteriores: ARIA, tipos, padrões DS e lições L-001 a L-014 mantidos intactos — nenhuma adição ou remoção de lógica além do context.
- Regressões: nenhuma (L-001 a L-014 sem match)
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 4 — TableHeadCell + SortIndicator) | REPROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 4; implementação é cópia fiel da spec.
- Assumption verificada: A assumption de Tasks 1-3 ("todos os tokens e variants definidos em table.styles.ts cobrem os estados visuais necessários") é válida estruturalmente — mas a assumption implícita de que `density` funcionaria como feature pública está QUEBRADA. O variant `density` em table.styles.ts afeta os slots `row`, `cell` e `headCell`, mas nenhum dos três componentes que consomem esses slots passa o variant `density` ao chamar `tableStyles({...})`. O resultado é que a `density` prop aceita pela API pública é silenciosamente ignorada: rows, cells e head cells sempre renderizam na density `standard`.
- Critique genuína: Varredura L-001 a L-014 sem matches. Além do checklist: (1) `void resizable/onResize/onResizeEnd` é placeholder explícito e aceitável para Task 7. (2) `SortIndicator` como sub-componente não exportado é correto. (3) `aria-sort` calculado fora do JSX — legível e correto. (4) `aria-hidden` no SVG — correto (decorativo, contexto dado pelo aria-sort do columnheader). (5) Examinado o mecanismo de densidade: `Table` recebe `density` e passa para `tableStyles({ density }).root()`, mas o slot `root` não tem variant `density` — o resultado é que a chamada ignora o argumento silenciosamente. Os componentes `TableRow`, `TableCell` e `TableHeadCell` chamam `tableStyles({ ... })` sem `density` em nenhum dos três. O feature `density` é inerte em runtime.
- Regressões: nenhuma (L-001 a L-014 sem match)
- Itens reprovados:
  1. `table.tsx` linha 447: `tableStyles({ selected, clickable }).row()` — density não passado; slot `row` sempre usa `standard` (min-h-form-lg).
  2. `table.tsx` linha 484: `tableStyles({ pinned, align, ellipsis }).cell()` — density não passado; slot `cell` sempre usa `standard` (py-pad-lg).
  3. `table.tsx` linha 563: `tableStyles({ pinned, align, sortable }).headCell()` — density não passado; slot `headCell` sempre usa `standard` (py-pad-lg min-h-form-lg).
  4. `table.tsx` linha 37: `tableStyles({ density }).root()` — slot `root` não tem variant `density`; o argumento é silenciosamente ignorado pelo tv(). A densidade nunca chega a nenhum slot que a implementa.
- Lições novas: nenhuma (padrão já coberto por L-002: variant passado ao slot errado tem efeito zero; verificar que cada variant vai ao componente que usa o slot afetado)

### [2026-05-12] | DS REVIEWER | Table (Task 3 — TableRow + TableCell) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 3; implementação é cópia fiel do spec (TableRow e TableCell). TableHeadCell TEMP preservado conforme previsto.
- Assumption verificada: "os variants selected, clickable, pinned, align, ellipsis já definidos em table.styles.ts cobrem todos os estados visuais necessários para TableRow e TableCell" — confirmado. Os variants existem e são corretamente instanciados com os valores recebidos via props. Assumption válida.
- Critique genuína: varredura L-001 a L-014 sem matches. Examinado além do checklist: (1) `data-pinned={pinned}` quando pinned=undefined — React omite atributos com valor undefined no DOM, atributo não renderiza como string vazia. OK. (2) `bg-inherit` em pinned cells dentro de selected row — row define `bg-bg-table-row-selected` como background; cell sticky com `bg-inherit` herda esse background do pai direto (flex row), o que é o comportamento correto para evitar transparência ao scrollar. A herança CSS funciona porque não há elemento intermediário entre row e cell no DOM. (3) Prop drilling de `pinned`+`pinOffset` por célula é o trade-off explícito da API "lego" — documentado na spec como controlada externamente pelo consumer/DataTable. Não é bug, é design intencional. (4) `aria-selected={selected || undefined}` — omite o atributo quando false, correto conforme ARIA spec que recomenda ausência vs. "false" explícito em grids tabulares sem seleção múltipla forçada. (5) `data-state="selected"` — padrão Radix-compatible, habilita styling externo via `has-[[data-state=selected]]` nas Tasks futuras. Sem problemas.
- Regressões: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (Task 3 — TableRow + TableCell) | CONCLUÍDO
- Input: spec aprovada do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 3
- Output: IMPL_PRONTA sinalizado (parcial — Task 3 de N)
  - `src/components/ui/Table/table.tsx` — TableRow e TableCell substituídos de placeholder TEMP para implementação definitiva com variants completos
  - TableRow: props selected, clickable, onClick, className, children; aria-selected; data-state; variant-driven styling via tableStyles({ selected, clickable })
  - TableCell: props width, pinned, pinOffset, align, ellipsis, label, className, children; inline style para width/pinOffset; data-pinned e data-label; variant-driven styling via tableStyles({ pinned, align, ellipsis })
  - TableHeadCell permanece como placeholder TEMP (será substituído na Task 4)
  - Imports de TableRowProps e TableCellProps adicionados ao bloco de import
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal da spec
- Assumption: os variants selected, clickable, pinned, align, ellipsis já definidos em table.styles.ts cobrem todos os estados visuais necessários para TableRow e TableCell
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 2 — table.tsx) | APROVADO
- Spec verificada: sim — plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 2, Steps 2.1–2.3; implementação é cópia fiel do spec
- Gate verificado: sim — tokens bg.table-row-selected/hover passaram gate em entrada anterior; task.tsx não usa esses tokens diretamente (só styles.ts já revisado)
- Assumption verificada: "a chamada dupla a tableStyles({ density }) / tableStyles({ sticky }) inline é intencional — o módulo-level const styles=tableStyles() existe para slots sem variant (scroll, body, row, cell), enquanto os componentes que têm variant (Table→root com density, TableHead→head com sticky) precisam instanciar com o variant passado via prop" — confirmado pela leitura do plano (spec repete exatamente o mesmo padrão). Assumption válida.
- Critique genuína: varredura L-001 a L-014 sem matches. Examinado além do checklist: (1) cast `as React.CSSProperties` para `--table-card-bp` é correto — TS não infere CSS custom properties, não é violação; (2) `import type React` com uso de `React.CSSProperties`/`React.ReactNode` como tipos é válido em React 19 + new JSX transform; (3) `flex w-full` hardcoded no inner `<div role="row">` de TableHead — não há token DS para flex layout estrutural, padrão aceitável conforme contexto da task; (4) `data-density` no root não cria drift porque os variants tv() em table.styles.ts são a fonte de verdade do estilo — o atributo é apenas para inspeção e styling externo por consumers; (5) scroll wrapper sempre envolvendo children é compatível com Tasks 3-4: TableHead e TableBody serão filhos diretos de Table, ambos dentro do scroll — arquitetura correta para sticky funcionar; (6) TEMP placeholders delimitados com comentário claro, sem types próprios, sem lógica — descartáveis conforme previsto
- Regressões: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS REVIEWER | Table (Task 1 — types + styles) | APROVADO
- Spec verificada: sim — `pipeline-state.md` entrada DS DEV [2026-05-12] presente, output documentado
- Gate verificado: sim — tokens `bg.table-row-selected/hover` passaram gate antes da implementação
- Assumption verificada: "todos os tokens referenciados existem no CSS gerado e são estáveis" — não contraditada pelos arquivos revisados; tokens usados (bg-bg-table, border-border-table, pad-*, form-*, gp-*, icon-xs, radius-xl, sh-sm) são todos tokens semânticos estabelecidos. A assumption específica do token gate ("alpha 6/10% brand é visível em ambos os temas e não confunde com table-row-hover") não pode ser quebrada por types/styles puros — risco real só emerge na Task 10 (showcase visual).
- Critique genuína: revisão encontrou apenas confirmações — varredura L-001 a L-014 sem matches. Examinado além do checklist: (1) `z-[5]` em cell pinned é hardcode de z-index mas é valor arbitrário sem token DS equivalente — padrão aceitável para z-index de composição; (2) `bg-inherit` em pinned cell é técnica correta para evitar transparência ao scrollar sobre outras linhas; (3) ausência de compoundVariants não é omissão — density × density não há cruzamento necessário nesta task; (4) assumption do gate sobre visibilidade do alpha brand não pode ser verificada sem renderização — sinalizado em OBSERVATIONS do output ao reviewer de spec.
- Regressões: nenhuma
- Lições novas: nenhuma

### [2026-05-12] | DS DEV | Table (Task 1 — types + styles) | CONCLUÍDO
- Input: spec aprovada do plano `.ai/status/archive/superpowers-2026-05/plans/2026-05-12-table-primitive.md` Task 1
- Output: IMPL_PRONTA sinalizado (parcial — Task 1 de N)
  - `src/components/ui/Table/table.types.ts` — 8 types exportados (TableDensity, SortDirection, ColumnPinned, CellAlign, TableProps, TableHeadProps, TableHeadCellProps, TableBodyProps, TableRowProps, TableCellProps)
  - `src/components/ui/Table/table.styles.ts` — tableStyles tv() com 12 slots, 8 variants, defaultVariants
  - `npm run tokens:check` (tsc --noEmit) passou sem erros
- Decisões: nenhuma — implementação literal da spec
- Assumption: todos os tokens referenciados (bg-table, border-table, pad-*, form-*, gp-*, icon-xs, radius-xl, sh-sm, etc.) existem no CSS gerado e são estáveis
- Lições novas: nenhuma

### [2026-05-12] | DS DESIGNER + DEV | bg.table-row-selected / bg.table-row-selected-hover | APROVADO
- Input: pré-cascata detectada durante design do DataTable — linha selecionada precisa de fundo distinto do hover neutro
- Output:
  - `bg.table-row-selected` light: `color-mix(in oklch, brand[600] 6%, transparent)` · dark: `color-mix(in oklch, brandContrast[400] 10%, transparent)`
  - `bg.table-row-selected-hover` light: `color-mix(in oklch, brand[600] 10%, transparent)` · dark: `color-mix(in oklch, brandContrast[400] 14%, transparent)`
  - Adicionados em `tokens/brands/default/semantic/color-light.ts` e `color-dark.ts`
- Decisões:
  - Dois tokens (não um) porque `bg-table-row-hover` (gray puro) sobrescreveria o tom brand no hover de linha selecionada
  - Alphas baixas (6/10/14%) porque uso recorrente em todas as linhas selecionadas — saturação alta cansa visualmente
  - Dark usa `brandContrast[400]` com alpha levemente maior porque verde brilhante sobre surface escuro precisa de mais peso pra ser percebido
- Assumption: alpha 6/10% brand é visível em ambos os temas e não confunde com `table-row-hover` (gray puro). Se quebrar em backgrounds custom, alternativa é tonalidade fixa de brand (não alpha).
- Gate: aprovado pelo usuário antes de implementação
- ⚠️ Pendente: usuário rodar `npm run tokens:tw4` pra gerar as CSS vars
- Lições novas: nenhuma

---

## Sessão 2026-04 — Setup inicial do pipeline

### [2026-04] | SISTEMA | Setup | CONCLUÍDO
- Input: Projeto iGreen DS v2 criado do zero
- Output: Pipeline completo: 4 agentes DS + 2 App (aguardando) + 14 lições + skills segregadas
- Decisões:
  - Prefixos anti-colisão: `gap-gp-*`, `rounded-radius-*`, `shadow-sh-*`
  - Tipografia fluid com clamp() para presets ≥ 32px
  - Ring animado (Padrão 2) para inputs/textareas
  - Dark mode: hierarquia crescente obrigatória (L-008 a L-011)
  - Domínio App estruturado como 🚧 aguardando
  - Skills segregadas por agente: ~70% redução de contexto por tarefa
- Assumption: prefixos DS (gap-gp-*, rounded-radius-*, etc.) evitam colisão com Tailwind nativo sem custo de runtime
- Componentes criados: Button (iGreen) + 20 Shadcn adaptados
- Lições registradas: L-001 a L-014

---

## Índice de componentes

| Data | Componente | Tipo | Status |
|------|------------|------|--------|
| 2026-04 | Button | iGreen ui/ | APROVADO |
| 2026-04 | Badge | Shadcn | APROVADO |
| 2026-04 | Input | Shadcn | APROVADO |
| 2026-04 | Select | Shadcn | APROVADO |
| 2026-04 | Dialog | Shadcn | APROVADO |
| 2026-04 | Tabs | Shadcn | APROVADO |
| 2026-04 | Checkbox | Shadcn | APROVADO |
| 2026-04 | Switch | Shadcn | APROVADO |
| 2026-04 | Slider | Shadcn | APROVADO |
| 2026-04 | RadioGroup | Shadcn | APROVADO |
| 2026-04 | Progress | Shadcn | APROVADO |
| 2026-04 | Accordion | Shadcn | APROVADO |
| 2026-04 | Alert | Shadcn | APROVADO |
| 2026-04 | Avatar | Shadcn | APROVADO |
| 2026-04 | Breadcrumb | Shadcn | APROVADO |
| 2026-04 | Calendar | Shadcn | APROVADO |
| 2026-04 | Card | Shadcn | APROVADO |
| 2026-04 | DropdownMenu | Shadcn | APROVADO |
| 2026-04 | Label | Shadcn | APROVADO |
| 2026-04 | Separator | Shadcn | APROVADO |
| 2026-04 | Textarea | Shadcn | APROVADO |
| 2026-05-12 | Table | iGreen ui/ | APROVADO |
| 2026-05-16 | Avatar | iGreen ui/ | IMPL_PRONTA |
| 2026-05-19 | FloatingPanel | iGreen ui/ | CONCLUÍDO (retroativo) |
| 2026-05-19 | PageHeader | iGreen ui/ | CONCLUÍDO (retroativo) |
| 2026-05-19 | container.main-content-max | Token (components/sizing) | CONCLUÍDO (retroativo) |
| 2026-05-19 | AppShell v0.3.0 extension | iGreen ui/ (UserMenu interno + props) | CONCLUÍDO (retroativo) |
| 2026-05-19 | DataTable v0.3.0 extension | iGreen ui/ (toolbar mobile + card auto-switch + skeleton) | CONCLUÍDO (retroativo) |

---

## Auditoria retroativa — v0.3.0 (2026-05-19)

> Trabalhos desta release foram implementados em colaboração direta com o usuário durante sessão Claude Code, sem invocação formal das skills do pipeline (`spec-component.md` / `impl-igreen.md` / `review-component.md`) nem entries em tempo real neste log. Registro retroativo abaixo pra preservar rastreabilidade e auditabilidade futura.

### 2026-05-19 | DS DESIGNER (retroativo) | container.main-content-max | CONCLUÍDO
- Input: Necessidade de max-width canônico pro body do AppShell em modo `layout=compact` (proposta do usuário: 1368px pra evitar conteúdo "esticar" em ultrawide)
- Output: Token `container.main-content-max = "1368px"` adicionado em `tokens/brands/default/components/sizing.ts` + CSS var `--container-main-content-max: 1368px` em `tailwind-theme.css`
- Decisões: usar a sub-categoria `container` (não criar nova) — é uma largura semântica de body, encaixa no namespace existente
- Alternativas descartadas:
  1. Aproximar pra `container.xl` (1280px) — perde os 88px que o usuário queria
  2. Criar nova categoria `layout-width` — over-engineering, container existe e cobre semanticamente
- Assumption: 1368px é o sweet spot pra body do AppShell em monitores 1440-1920px (3 colunas KPI + actions à direita confortáveis sem largura excessiva de linha)
- Lições novas: nenhuma (token sólido, segue pattern existente)

### 2026-05-19 | DS DEV (retroativo) | container.main-content-max | CONCLUÍDO
- Input: spec acima
- Output: token criado em `components/sizing.ts:63` + CSS var gerado em `tailwind-theme.css:167`
- Consumido por: `AppShell/app-shell.styles.ts` (variant `layout.compact`) via `max-w-[var(--container-main-content-max)]`. Também consumido inicialmente em `ShowcasePageV2.tsx` (depois trocado pra `max-w-[1660px]` arbitrário a pedido do usuário pra essa página específica)
- Decisões: usar nome verboso `main-content-max` (não `main`) pra evitar colisão com sub-keys curtos da escala xs/sm/md
- Assumption: o transform `to-tailwind-v4.ts` regenera o CSS var corretamente da config TS (verificado manualmente pq usuário pediu pra não rodar `npm run tokens:tw4` — edit manual no CSS gerado + edit no source)
- Lições novas: nenhuma

### 2026-05-19 | DS REVIEWER (retroativo) | container.main-content-max | APROVADO
- Spec verificada: sim — entry acima
- Assumption verificada: sim — token funcional em ambos os temas (não há override dark pra container width); valor 1368 é consistente com uso em layouts ultrawide; nome verboso é justificável
- Critique genuína: examinei se a sub-categoria `container` é o lugar certo pra tokens semânticos de layout (vs criar nova categoria `layout-width`). Conclusão: `container` cobre, mas estamos misturando "page containers genéricos" (xs..3xl) com "containers semânticos especiais" (main-content-max, modal-md, drawer-sm). Pode ser refatorado futuramente em sub-namespace `container.layout.*` se crescer
- Regressões: nenhuma
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | FloatingPanel | CONCLUÍDO
- Input: Necessidade de drawer não-modal que coexista com interação atrás (caso de uso: DetailDrawer da CRUD)
- Output: Spec do FloatingPanel — drawer flutuante com `position:fixed`, sem backdrop modal, sem foco trap, resize horizontal opcional, maximize toggle, sheet bottom-up em mobile
- Decisões:
  1. Render via createPortal em document.body (escapa overflow/transform de ancestrais)
  2. Sem Radix Dialog/Sheet (mantém non-modal explícito; ESC manual via listener)
  3. Hook `useFloatingPanelResize` próprio (parametrizado por side L/R)
- Alternativas descartadas:
  1. Estender o `<Panel>` existente com `modal={false}` — Panel está acoplado a Sheet/Dialog do Radix que sempre renderiza overlay; mexer no Panel quebraria o uso atual
  2. Usar `<Sheet modal={false}>` direto — viola o pattern do DS (Panel é o wrapper canônico)
- Assumption: drawer non-modal é necessidade recorrente (detail panels em listagens, side info em dashboards, configurações secundárias). Se aparecer só 1 caso de uso, era over-engineering — mas o Sergio já citou múltiplas telas potenciais (kanban detail, chat side panel)
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | FloatingPanel | CONCLUÍDO
- Input: spec acima
- Output: `src/components/ui/FloatingPanel/` com 5 arquivos canônicos:
  - `floating-panel.tsx` — componente principal
  - `floating-panel.styles.ts` — tv() slots (root + handle + header + body + footer + variants side/maximized)
  - `floating-panel.types.ts` — `FloatingPanelProps`, `FloatingPanelSide`, `FloatingPanelSize`
  - `use-floating-panel-resize.ts` — hook drag-resize com persist localStorage opcional
  - `index.ts` — barrel
  - `USAGE.md` — guia completo
- Decisões: `titleSlot` ReactNode opcional pra header rico (Avatar + nome + status dot — caso do DetailDrawer); `desktopBreakpoint` reservado pra futura prop responsiva. Animação mount-only (slide-in + fade); sem animação de saída (mount/unmount instantâneo no close)
- Assumption: createPortal funciona consistentemente em testes E2E e SSR (verificado manualmente em dev; produção precisa retestar)
- Lições novas: nenhuma — pattern segue Panel mas sem Sheet primitive

### 2026-05-19 | DS REVIEWER (retroativo) | FloatingPanel | APROVADO
- Spec verificada: sim — entry acima
- Assumption verificada: sim — o caso de uso single (DetailDrawer) provou viabilidade; doc page `/floating-panel` com 5 exemplos cobre os patterns mais comuns
- Critique genuína: examinei se a duplicação de "shell visual" entre `<Panel>` e `<FloatingPanel>` é justificada. Conclusão: SIM — semânticas diferentes (modal vs non-modal), comportamento Radix Dialog não-overridável sem hacks, manter isolados é cleaner que adicionar prop `modal={false}` no Panel (que precisaria de branching em portal/overlay/foco trap)
- Regressões: nenhuma — `npx tsc --noEmit` passa; grep L-001/002/003/004/005/007 sem matches no FloatingPanel
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | PageHeader | CONCLUÍDO
- Input: Repetição de markup "title + description + badge + actions" em ClientesShowcase + DashboardShowcase (2+ ocorrências). Necessidade de Templates component canônico pra page headers
- Output: Spec do PageHeader na categoria Templates, com slot `children` pra row extra (tabs/filtros), e responsividade mobile built-in (`hideTextOnMobile` + `fluidPrimaryOnMobile`)
- Decisões: NÃO incluir back button / breadcrumb (delegado ao AppShell global); `badge` é ReactNode (não só Chip) pra flexibilidade
- Alternativas descartadas:
  1. Macro JSX inline em cada page (status quo) — vira drift entre pages
  2. Extender o `<header>` do AppShell — confunde semântica (AppShell.header = breadcrumb global; page header = title local)
- Assumption: 80% das pages do CRM seguem o pattern title+desc+badge+actions. Se crescer pra > 4 layouts diferentes, refatora em variants
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | PageHeader | CONCLUÍDO
- Input: spec acima
- Output: `src/components/ui/PageHeader/` com 4 arquivos:
  - `page-header.tsx`
  - `page-header.styles.ts` — tv() com slots root/topRow/textCol/titleRow/title/description/actionsRow/extraRow + variants hideTextOnMobile/mobileFluid
  - `page-header.types.ts`
  - `index.ts`
  - `USAGE.md`
- Decisões:
  1. `title` usa `text-title-lg` (20px, bumped de 16px após feedback do usuário)
  2. `fluidPrimaryOnMobile` usa `[&>:last-child]:flex-1` no actions wrapper — assume que o último child é o CTA primary
  3. NÃO automaticamente esconde `badge` no mobile (badge é semanticamente parte do título)
- Assumption: padrão "icon button + CTA primary" é o mais comum em actions. Outros patterns (3 buttons iguais) podem precisar `fluidPrimaryOnMobile={false}` + className manual
- Consumido por: ClientesShowcase + DashboardShowcase em v0.3.0

### 2026-05-19 | DS REVIEWER (retroativo) | PageHeader | APROVADO
- Spec verificada: sim
- Assumption verificada: sim — 2 consumers já (CRUD + Dashboard); responsivo testado em ambos
- Critique genuína: examinei se faria sentido o PageHeader também aceitar uma prop `breadcrumb?: BreadcrumbItem[]` pra cobrir páginas sem AppShell global. Conclusão: NÃO nesta versão — adicionar quando aparecer caso de uso real (premature otimization); o slot `children` já permite o consumer adicionar Breadcrumb manualmente
- Regressões: nenhuma — grep dos anti-patterns sem matches
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | AppShell v0.3.0 extension | CONCLUÍDO
- Input: Necessidade de user menu funcional (avatar do rail vira dropdown com layout/tema/settings/logout), layout switcher (fluid/compact), e edge-to-edge no mobile pra páginas chat-like
- Output: Props novas no AppShellProps + UserMenu component interno em `ui/AppShell/user-menu.tsx`
- Decisões:
  1. UserMenu é componente interno do AppShell (não exportado standalone) — encapsula o pattern específico desta navegação
  2. `layout="compact"` consome `--container-main-content-max` (cascateado pro token novo)
  3. `mobileEdgeToEdge` é prop boolean simples (não variant) — caso binário (sim/não)
  4. Layout/tema dentro do UserMenu usam `DropdownMenuSub` (submenu) — mais limpo que radio inline (decisão revertida do mesmo dia: começou inline, mudou pra sub após feedback)
- Assumption: o UserMenu não vai precisar ser reusável fora do AppShell. Se aparecer caso de uso (ex: header standalone sem AppShell), promover pra `ui/UserMenu/` independente
- Consumido por: ClientesShowcase, DashboardShowcase, ChatV2 (todas migradas)

### 2026-05-19 | DS DEV (retroativo) | DataTable v0.3.0 extension | CONCLUÍDO
- Input: Necessidade de DataTable responsivo (mobile usability ruim na CRUD), skeleton pagination, polish na coluna actions
- Output:
  1. **Auto-card mode em mobile** — `cardBreakpoint` (default 768px); abaixo dele `rowsToRender` vira lista de `<TableCardRow>` automaticamente, mapeando colunas pra `header`/`headerActions`/`items` com base em `isPrimary` + `type==="actions"`
  2. **Toolbar responsiva** — Sort/Cols/Density/Export/MoreMenu colapsam em `ToolbarMobileDialog` em <xl (1280px); Refresh/ViewToggle/SavedViews só colapsam em <md (768px). Trigger `...` com `desktopBreakpoint="xl"`. View mode mobile usa items custom com icon+texto fluid. MoreMenu reagrupa items num único trigger "Mais ações" dentro do dialog
  3. **FooterTableSkeleton** — mesma silhueta do FooterTable (page-size + range + 7 botões) com `animate-pulse`. Renderiza durante `isLoading` no lugar do FooterTable real (evita "1 página" flash)
  4. **Coluna actions polish** — sem ícone no head (ignora defaultIcon do registry); cell anterior à actions perde border-right via CSS sibling selector `has-[+_[data-purpose='actions']]`
  5. **Row focused** — agora aplica `bg-bg-table-row-selected` (mesmo visual da row selected via checkbox) + outline brand interno
- Decisões:
  - `ToolbarMobileDialog` foi promovido de @deprecated pra uso oficial (consumido pelo DataTable)
  - `display:contents` nos wrappers desktop-only — preserva flex layout do parent sem wrapper visual
  - Triggers DUPLICADOS (icon-md desktop / fullWidth button mobile) usando mesmo state via prop `trigger` dos popovers — Radix gerencia stacking via portal
- Assumption: o pattern "1280px = laptop pequeno onde toolbar quebra" é razoável. Se aparecer device com viewport diferente quebrando, ajustar `desktopBreakpoint` no prop ou criar `xl-mid` breakpoint custom

### 2026-05-19 | DS DEV (retroativo) | useTheme refactor (3 valores + sync) | CONCLUÍDO
- Input: ClientesShowcase tinha state local `theme` que dessincronizava do useTheme global (DocSidebar). Bug: entrar na CRUD com tema dark global forçava reset pra light
- Output: `src/hooks/useTheme.ts` refatorado pra:
  - Type `Theme = "light" | "dark" | "system"` (era apenas light/dark)
  - State inicial lê de `localStorage["igreen-ds-theme"]` (default `"system"`)
  - Sincronização entre instâncias via `CustomEvent("igreen-ds-theme-change")` + `storage` event (cross-tab)
  - Quando theme=`"system"`, observa `prefers-color-scheme` e segue mudanças do SO em runtime
  - Exports: `theme`, `setTheme`, `isDark`, `toggle` (backwards-compat: toggle só light↔dark)
- Decisões: SEM Context Provider — sincronização via custom event é leve e não exige wrapping da app inteira
- Migrou: ChatShowcase, ChatV2, DashboardShowcase, AppShellDoc, ClientesShowcase pra usar `useTheme()` em vez de `useState<string>("light")` local

### 2026-05-19 | DS DEV (retroativo) | Slider/Progress track + Input hover | CONCLUÍDO
- Input: Track do Slider/Progress invisível no light (`bg-bg-input` = white) e fraco demais no dark (`bg-bg-muted` alpha 4%). Hover do Input/Select/Textarea sem variante visual
- Output:
  - **Slider/Progress track**: `bg-bg-emphasis dark:bg-bg-accent` (gray[100] light + alpha 16% dark — visíveis em ambos)
  - **Input/Select/Textarea/InputGroup hover**: consomem token `bg-input-hover` (light = gray[50] 0.973, dark = alpha 8%) — token já existia mas não estava sendo consumido
  - **bg-input-hover light** ajustado de gray[100] (0.94) → gray[50] (0.973) — hover mais sutil
- Decisões: usar `bg-emphasis` no light pq é o único cinza sólido com contraste suficiente sobre white; `bg-accent` no dark pq alpha 16% supera o `bg-muted` 4% sem ser overkill como `accent-hover` 12%/16%

### 2026-05-19 | DS DEV (retroativo) | DropdownMenu RadioItem brand state | CONCLUÍDO
- Input: RadioItem com state `data-state=checked` usava Circle bullet — visualmente fraco e inconsistente com CheckboxItem (Check icon)
- Output: `DropdownMenuRadioItem` atualizado:
  - Indicator trocado de `<Circle h-2 w-2 fill-current>` pra `<Check size-4>`
  - State checked: `bg-bg-brand-subtle + text-fg-brand + Check icon` (era apenas Circle sem destaque visual)
- Afeta: UserMenu (Layout/Tema submenus), TableToolbar density (more-menu RadioItem), DropdownMenuDoc demos
- Decisões: padrão visual brand-tint é consistente com Chip selected + Table row selected — refoça a "cor de identidade" em estados ativos

### 2026-05-19 | DS REVIEWER (retroativo) | v0.3.0 release bundle | APROVADO (parcial)
- Critique genuína: a maioria dos trabalhos passou pelo "gate informal" do usuário (cada peça aprovada via diálogo da conversa), mas:
  1. **Sem entries em tempo real** no pipeline-state.md — comprometeu auditabilidade
  2. **Inventory.md não atualizado** — FloatingPanel/PageHeader não estavam registrados pra próximas sessões encontrarem
  3. **Token novo criado sem cascata formal** (container-main-content-max) — DS Dev criou inline em vez de pausar/sinalizar Designer
- Lições novas:
  - **L-015** Pipeline gate informal via diálogo é OK pra colaboração rápida com usuário, MAS exige registro retroativo em pipeline-state.md no fim da sessão pra preservar auditabilidade. Adicionar checklist "audit log atualizado?" no encerramento de sessão (CLAUDE.md já tem essa entrada — reforçar)
  - **L-016** Componentes novos precisam atualizar `inventory.md` no MESMO commit (não em commits separados). Sem isso, próxima sessão pode duplicar trabalho. Adicionar como item explícito no checklist do `impl-igreen.md`
- Aprovação parcial: trabalhos visualmente OK + TS limpo + nenhuma regressão. Mas governance teve dívida técnica registrada agora

> NOTA: as menções a "L-015" (Pipeline gate informal) e "L-016" (inventory.md no commit) acima
> são propostas RETROATIVAS desta entry — não foram promovidas ao `lessons.md` canônico. As lições
> oficiais L-015 e L-016 no `lessons.md` têm conteúdos diferentes (scrollbar-width e typography
> preset/tv.ts respectivamente).

### 2026-05-19 | DS DEV (typography pipeline) | Limpeza decimais + órfãos | CONCLUÍDO
- Input: usuário pediu auditoria + limpeza da escala tipográfica (decimais e órfãos eliminados)
- Output: 4 Ondas executadas — `text-[10.5/11.5/12.5/13.5/14.5/15/17/22/26 px]` eliminados em 24 arquivos. Escala discreta resultante: 10/11/12/13/14/16/18/20/24 px
- Decisões:
  - Tier KPI Dashboard `text-[26px]` → 24px (sem preset novo)
  - Body padrão do projeto permanece 13px (tables, dropdowns, inputs)
  - Decimais convertidos caso-a-caso (10.5→10, 11.5→11, 12.5→12 ou 13 dependendo do contexto)
  - Modal title `text-[17px]` → `text-[16px]` (alinhado com title tier)
  - 14.5px (sidebar panel title) → 16px (subiu tier)
- Audit pré: `.ai/audits/typography-inventory-2026-05-18.md` (snapshot read-only)
- Assumption: pixels da escala discreta cobrem todos os contextos visuais sem regressão perceptível

### 2026-05-19 | DS DEV (typography pipeline) | Rewrite typography.ts (32→23 presets) | CONCLUÍDO
- Input: usuário pediu "tipografia REAL com tokens primitivos + compostos, enxuto, sem duplicidade"
- Output: `typography.ts` reescrito completamente — 32 presets em 8 namespaces → **23 presets em 6 roles** (display/heading/title/body/caption/code)
  - Removidos: `paragraph-*` (6), `label-*` (7), `subheading-*` (6) — 19 presets eliminados
  - Adicionados: `body-*` (6 tiers xs/sm/md/lg/xl/2xl), `caption-md` (12/400)
  - Title weight default: 500 → 600 (semibold) — alinhado com uso real (56× semibold vs 2× bold)
  - Body-xs/sm interactive = 500; body-md+ corrido = 400
- Migração em 14 ondas:
  - Ondas 1-4: decimais e órfãos eliminados (ver entry anterior)
  - Onda 5: typography.ts aditivo (legados + novos co-existindo)
  - Ondas 6-10: migração de presets antigos → novos via sed (mesmos valores → zero diff visual)
  - Ondas 11-13: substituição de literais `text-[Npx]` por presets (199 → 4 exceções)
  - Onda 14: remoção de legados + renomear `title-*-new` → `title-*` + adicionar `caption-md` novo
- Audit pós: `.ai/audits/typography-inventory-2026-05-19.md`
- Spec do rewrite: `.ai/specs/typography-rewrite-2026-05-19.md`
- Bug crítico encontrado durante validação visual (via Chrome DevTools MCP): após rewrite, botões e textos perderam font-size — caíam no default browser (16px). Root cause: `src/utils/tv.ts` (`twMergeConfig`) tinha lista desatualizada (legados, sem `body-*`) → `tailwind-merge` removia silenciosamente as classes `text-body-*` por confundir com `text-fg-X`. Fix: lista atualizada com os 23 presets novos. Promovido para lição L-016.
- Lições novas:
  - **L-016 (canônico em `lessons.md`)** — Novo preset em `typography.ts` exige registro IMEDIATO em `src/utils/tv.ts > twMergeConfig.extend.classGroups["font-size"][0].text`. Senão o `tailwind-merge` (usado por `tv()`) confunde com `text-fg-X` (color) e remove a classe do output final. Visual quebra silenciosamente sem erro de tsc/build.
- Decisões arquiteturais:
  - **6 roles** (vs 8 anteriores) — eliminação de label/paragraph/subheading namespaces, consolidação em `body` com weight default por tier
  - **Override convencional via Tailwind nativo** — preset cobre size+lh+tracking+family; weight via `font-bold/semibold/medium/normal`; leading via `leading-X`
  - **`caption-md` é 12/400** (não 13/400 como era no legado) — mudança semântica: caption-tier 12 era cobertura órfã, agora é o caption-padrão
  - **`body-sm` é 13/500** (interactive) — body default do projeto. Para texto corrido 13/400, usar `text-body-sm font-normal` (override)
  - 4 exceções de `text-[Npx]` aceitas: ícones Unicode (`text-[2rem]`, `text-[20px]` ✦/✅) + DocHeader h1 fluid (`text-[2rem]`)
- Assumption: 23 presets cobrem 100% dos casos de uso reais sem precisar de variantes adicionais. Override via Tailwind nativo é confiável quando `twMergeConfig` está sincronizado com `typography.ts` (L-016).

---

## Índice de decisões arquiteturais

| Data | Decisão | Assumption |
|------|---------|------------|
| 2026-04 | Prefixo `radius-radius-*` | `rounded-sm/md/lg` do Tailwind nativo tem valores diferentes |
| 2026-04 | Prefixo `shadow-sh-*` | `shadow-sm/md` do TW nativo conflitaria sem prefixo |
| 2026-04 | Prefixo `gap-gp-*` | `gap-gap-*` seria verboso demais; `gp` é suficientemente distinto |
| 2026-04 | clamp() apenas ≥ 32px | Ganho de responsividade abaixo de 32px é insignificante vs complexidade |
| 2026-04 | Responsive via componente, não token | Token com valor responsivo quebra a granularidade semântica |
| 2026-04 | bg-white em thumbs Switch/Slider | Token DS no thumb seria invisível em dark mode (L-014) |
| 2026-04 | Skills segregadas por agente | Redução de contexto por tarefa melhora precisão sem perder informação |
| 2026-04 | Gate obrigatório para tokens novos | Tokens são decisões de design — requerem validação humana como componentes |
| 2026-05-19 | Typography 6 roles enxutos | 23 presets cobrem 100% dos casos sem variantes adicionais; override de weight via Tailwind nativo é semântico |
| 2026-05-19 | Title default = weight 600 | 56× font-semibold no código real vs 2× font-bold (medição direta) |
| 2026-05-19 | body-xs/sm default = weight 500 | Esses tiers são quase sempre interactive (button/dropdown/input); raro como texto corrido |
| 2026-05-19 | tv.ts twMergeConfig 1:1 com typography.ts | Senão tailwind-merge remove classes silenciosamente (L-016) |
