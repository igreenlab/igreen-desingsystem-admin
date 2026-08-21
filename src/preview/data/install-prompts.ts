/**
 * Prompts prontos pra colar no Claude Code — FONTE ÚNICA.
 *
 * Moram aqui, e não na página, porque são citados em DUAS: a Início (`LandingDoc`) e a
 * Installation. Duplicar um texto de 50 linhas em dois arquivos é como as coisas divergem
 * neste repo — aconteceu com as skills (repo × payload) e com a doc que ensinava a CLI
 * `@0.1.0`. Editando aqui, as duas mudam juntas.
 */

/* ═════════════════════════════════════════════════════════════════════════════
   Prompts — o atalho de quem usa Claude Code

   Dois trabalhos diferentes, dois prompts: INSTALAR (uma vez) e CONSTRUIR (o
   primeiro pedido de verdade). O de construir é um PEDIDO-EXEMPLO — menu com 3
   categorias + um cadastro completo — escrito NA VOZ DE UM USUÁRIO, de
   propósito: zero nome de componente (nada de AppShell/DataTable/drawer) e
   zero seção "como fazer". As nuances que guiam a IA ficam em linguagem de
   gente ("sem recarregar a página" → renderLink; "dá pra filtrar por status"
   → filtro nativo; "painel lateral com o formulário" → drawer + FormField), e
   o COMO é papel do kit (ds:link / scaffold copiam .claude/) — a única menção
   técnica é o próprio ds:link, pra IA saber que os comandos e padrões vêm
   dele. Até 2026-08-21 este card carregava o dump técnico inteiro; o operador
   não-técnico colava e recebia perguntas sobre alias e tv() em vez de uma
   tela. Não reintroduza nomes de componente aqui: quem sabe o nome não
   precisa do prompt, e quem precisa do prompt não sabe o nome.
   ═════════════════════════════════════════════════════════════════════════════ */

export const PROMPT_INSTALAR = `Instale o iGreen Design System neste projeto como submódulo git e configure tudo. Não me pergunte nada que você possa verificar no repositório.

1. Adicione o submódulo:
   git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
   git submodule update --init --recursive
   ⛔ NÃO rode npm install dentro de design-system/. Você não builda o DS, e um segundo
   node_modules cria uma cópia extra de React — "Invalid hook call" em qualquer componente
   com hook, além de erros de tipo por dois @types/react no mesmo programa. As dependências
   vão na RAIZ (passo 2).

2. Instale na RAIZ as dependências de runtime — o submódulo entrega código-fonte, não pacote:
   npm i tailwind-variants tailwind-merge clsx lucide-react @radix-ui/react-dialog @radix-ui/react-slot
   Componente novo pede mais (@tanstack/react-virtual no DataTable, recharts no Chart,
   @dnd-kit no Kanban, cmdk no Combobox). O erro do bundler diz exatamente qual falta.

3. Configure DOIS aliases, não um — no tsconfig E no bundler:
     "@ds" → design-system/src   (o que EU uso nos imports)
     "@"   → design-system/src   (o que o DS usa INTERNAMENTE, em 700 imports)
   Sem o segundo, o build quebra no primeiro componente: Cannot find module '@/utils/tv'.
   No tsconfig, paths RELATIVOS e SEM baseUrl (removido no TypeScript 7):
     "paths": { "@ds/*": ["./design-system/src/*"], "@/*": ["./design-system/src/*"] }
   No vite, use import.meta.dirname (não __dirname, que não existe em ESM) e acrescente
   resolve.dedupe: ["react", "react-dom"].
   Se este projeto já usa "@/" pro código dele, renomeie o dele (ex.: "@app/*") e me avise.

4. Importe o tema UMA vez no CSS de entrada, DEPOIS do @import "tailwindcss":
   @import "../design-system/src/styles/theme/tailwind-theme.css";
   Não precisa de @source: o submódulo está dentro da raiz, então o scan do
   Tailwind já o alcança.

5. Copie as fontes Geist. Sem isso a falha é SILENCIOSA: o dev server devolve o index.html
   no lugar do .woff2 e os 27 presets caem em system-ui, sem erro no console.
   mkdir -p public/fonts && cp design-system/public/fonts/*.woff2 public/fonts/

6. Se eu for usar marca diferente da default, importe também o overlay
   design-system/src/styles/theme/brand-<id>.css DEPOIS do tema base, e aplique
   data-theme="<id>" no <html>. Importar o CSS sem o atributo é no-op silencioso.

7. Rode o ds-link, que é o que dá kit de IA pro projeto:
   npm --prefix design-system run ds:link
   Ele copia skills/commands/rules pro .claude/ daqui e escreve
   .claude/ds-config.json com mode:"submodule". Reinicie o Claude Code em seguida —
   slash command só é registrado no início da sessão, então /ds-create-crud,
   /ds-create-list e /ds-create-dashboard só aparecem depois do restart.

8. VALIDE com os QUATRO checks antes de dizer que acabou. O Button sozinho NÃO basta: ele
   não usa hook nenhum, então renderiza certo mesmo com React duplicado no bundle.
   a) Button: confirme cor E spacing/radius (só a cor = tema não importado).
   b) Um componente com hook/context — AppShell, FloatingPanel ou DataTable — renderizando
      sem "Invalid hook call". É este check que prova que não há React duplicado.
   c) document.fonts.check("16px Geist") === true. Status HTTP não serve: o dev server
      devolve 200 com o index.html para arquivo inexistente.
   d) npx tsc --noEmit limpo na raiz.

Regras: nunca edite arquivos dentro de design-system/ — é submódulo, e customização
acontece na composição, no meu projeto. Ao atualizar (git pull --recurse-submodules),
re-rode o ds:link.`;

export const PROMPT_CONSTRUIR = `Monte um sistema com o iGreen Design System: a estrutura de navegação e uma primeira tela funcionando de verdade.

O que eu quero ver:

1. Um menu lateral com 3 categorias, cada uma com 2 ou 3 itens:
   - Cadastros: Clientes · Fornecedores · Produtos
   - Operações: Pedidos · Faturas
   - Relatórios: Visão geral · Exportações
   (pode trocar os nomes pelo meu negócio se eu disser qual é)

2. Cada item do menu abre uma tela própria, sem recarregar a página.
   Só a tela de CLIENTES nasce pronta — as outras ficam com um aviso
   simples de "em construção", pra eu ir pedindo uma por vez depois.

3. Clientes é uma tela de cadastro completa:
   - uma tabela com as colunas nome, e-mail, cidade, status e criado em
   - dá pra filtrar por status, buscar e passar de página
   - um botão "Novo cliente" abre um painel lateral com o formulário
   - cada linha tem ações de editar e excluir
   - use dados de exemplo (uns 30 registros), que depois eu troco pelos reais

Observação: este projeto deve ter o kit de IA do design system instalado —
se ainda não tiver, rode o ds:link dele antes de começar. Com o kit, os
comandos e padrões do sistema já vêm prontos: siga o que ele manda e não
invente componente ou estilo por fora.

No final, me mostre o sistema rodando: o menu navegando nas 3 categorias e
o cadastro de Clientes criando, editando e excluindo.`;

export const PROMPTS = [
  {
    id: "instalar",
    label: "Instalar o DS",
    resumo: "Cole uma vez, no projeto vazio",
    texto: PROMPT_INSTALAR,
  },
  {
    id: "construir",
    label: "Construir telas",
    resumo: "Pedido-exemplo: shell + CRUD",
    texto: PROMPT_CONSTRUIR,
  },
] as const;
