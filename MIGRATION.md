# Runbook — migração do setup pessoal → empresa

> **Status:** preparado, **NÃO executado**. Hoje tudo roda no pessoal (snksergio).
> Quando for migrar pra empresa (igreenlab), siga este arquivo de cima pra baixo.
> A arquitetura **não muda** — só trocam *identificadores* (nome npm) e *hosts*
> (Vercel/git). É mecânico.

---

## 1. Tabela de identificadores (a fonte única)

Preencha a coluna **Alvo (empresa)** quando decidir os valores, e use-a como
referência em todos os passos abaixo.

| O que | Atual (pessoal) | Alvo (empresa) — preencher |
|---|---|---|
| Scope/pacote npm do CLI | `@snksergio/create-design-system` | `@<org>/create-design-system` |
| Org/repo Git | `snksergio/igreen-admin-desingsystem` (remote `mirror`) | `igreenlab/igreen-desingsystem-admin` (remote `origin` — **já existe**) |
| URL do registry (Vercel) | `https://igreen-registry.vercel.app/r/{name}.json` | `https://<registry-empresa>/r/{name}.json` |
| URL do showcase (Vercel) | `https://igreen-desingsystem-admin.vercel.app` | `https://<showcase-empresa>` |
| Token do registry (Bearer) | `IGREEN_TOKEN` atual | novo token gerado no deploy da empresa |

---

## 2. Pré-requisitos (acessos)

- [ ] Acesso ao **org npm** da empresa (pra publicar `@<org>/...`).
- [ ] Acesso ao **time Vercel** da empresa (pra criar os 2 projetos: registry + showcase).
- [ ] Permissão de push no **repo GitHub** `igreenlab/...` (origin já aponta pra lá).

---

## 3. Passos (na ordem)

### 3.1 — Git (trivial: o remote já existe)
Hoje o canal de trabalho é `mirror` (snksergio). Pra empresa, `origin` (igreenlab)
já está configurado:
```bash
git remote -v          # origin = igreenlab (alvo), mirror = snksergio (atual)
git push origin main   # leva o código pro repo da empresa
```
> Decisão: manter o mirror pessoal como backup ou remover? (`git remote remove mirror`)

### 3.2 — Registry na Vercel (empresa)
1. Criar projeto Vercel na conta da empresa a partir do mesmo repo (pasta `registry-app/`).
2. Setar a env `IGREEN_TOKEN` (novo Bearer) no projeto.
3. Anotar a URL final → vira o **Alvo (empresa)** da tabela.

### 3.3 — Showcase na Vercel (empresa)
1. Criar projeto Vercel apontando pra raiz (build do preview app).
2. Anotar a URL → **Alvo** da tabela.

### 3.4 — Sweep de URL/scope (find/replace dirigido)
Localize **todas** as ocorrências (assim nada é esquecido se algo mudou de lugar):
```bash
# registry URL (funcional — components.json + scripts do template):
grep -rIl "igreen-registry.vercel.app" --exclude-dir=node_modules --exclude-dir=.git .

# showcase URL:
grep -rIl "igreen-desingsystem-admin.vercel.app" --exclude-dir=node_modules --exclude-dir=.git .

# scope/repo:
grep -rIl "snksergio" --exclude-dir=node_modules --exclude-dir=.git .
```
**Funcionais (TROCAR):**
- `cli/templates/default/components.json` — `registries.@igreen.url`
- `cli/templates/default/scripts/{igreen-add,igreen-update,igreen-drift,doctor}.mjs` — `const REGISTRY`
- `cli/templates/default/_welcome.tsx` — "Catálogo visual: …"
- `cli/package.json` — `name` (`@<org>/create-design-system`)
- `cli/templates/default/CLAUDE.md`, `README.md`, `cli/README.md`, `DISTRIBUICAO.md` — comandos `npx`/`npm create`, URLs, link do catálogo

**NÃO tocar (registro histórico — são audit log, não config):**
- `.ai/status/lessons.md`, `.ai/status/pipeline-state.md`, `.ai/status/archive/**`
- `.ai/audits/**`, `.ai/specs/**`
- `src/preview/pages/updates-data.ts` (changelog histórico)
- USAGE embarcado em `registry-app/app/registry-data.ts` (regenerado pelo `registry:build`)

### 3.5 — npm (republicar sob o novo scope)
1. No `cli/package.json`: trocar `name` pro novo scope (passo 3.4 já fez).
2. Publicar: `cd cli && npm publish --access public` (logado no org da empresa).
3. Depreciar o antigo pra direcionar quem usa o nome velho:
   ```bash
   npm deprecate @snksergio/create-design-system "Movido para @<org>/create-design-system"
   ```

### 3.6 — Re-stamp + rebuild do registry
Com a URL/scope novos no código:
```bash
npm run registry:build   # regenera /r/*.json + embed com os valores novos
```
Deploy do `registry-app` (passo 3.2) publica o registry atualizado.

---

## 4. Validação pós-migração

- [ ] `npx @<org>/create-design-system@latest teste-empresa` cria projeto.
- [ ] Dentro dele: `npm run igreen:add -- button` puxa do registry novo (sem 401).
- [ ] `npm run dev` sobe e renderiza (tema/cn/tv ok).
- [ ] Favicon = logo iGreen, aba = `iGreen - teste-empresa`.
- [ ] Link do catálogo no welcome aponta pro showcase da empresa.
- [ ] Consumidores antigos (ex: projetos de teste) seguem funcionando OU foram
      migrados (trocar `components.json.url` + `.env.local` token).

---

## 5. Tornar a próxima migração ainda mais barata (opcional, fazer junto)

Hoje a URL do registry está repetida em **5 arquivos** do template
(`components.json` + 4 scripts). Dá pra extrair pra um `scripts/_ds-registry.mjs`
(`export const REGISTRY = …`) que os 4 scripts importam — aí o consumidor (e a
migração) mexe em 1 lugar no lado dos scripts. `components.json` continua à parte
(é JSON, não importa módulo). Não foi feito agora pra não adicionar churn antes da
hora; avalie quando migrar.

---

## Resumo

Migração = **trocar a tabela da §1 + 2 deploys Vercel + 1 republish npm + push pro
origin**. Sem mudança de arquitetura. Uma sessão focada, seguindo este runbook.
O risco real é consistência da URL+token do registry — a §3.4 (grep) garante que
nada fica pra trás.
