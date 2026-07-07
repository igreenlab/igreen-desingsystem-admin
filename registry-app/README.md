# iGreen DS — registry (deploy dedicado)

Next mínimo que serve o registry shadcn do DS com **auth Bearer**. Deploy próprio
na Vercel — **não** usar o preview Vite (estático, sem runtime pro token).

## Como funciona
- `app/r/[name]/route.ts` valida `Authorization: Bearer ${IGREEN_TOKEN}` e serve o
  item de `app/registry-data.ts`. Sem token / errado → **401**; inexistente → **404**.
  A rota é `force-dynamic` + `Cache-Control: no-store` — nunca cacheia no edge.
- `app/registry-data.ts` é o **embed do registry, COMMITADO** (self-contained pro
  deploy — não depende de `../public/r` no Vercel). Regenerado por
  `scripts/copy-registry.mjs` a partir do `public/r` do DS (quando presente; senão
  mantém o commitado).

> ⛔ **Por que NÃO existe `public/` aqui.** Arquivos em `public/` no Next são
> servidos pelo **edge/CDN ANTES do route handler** — nenhuma auth os alcança.
> Servir os JSON como estático em `/r/*` deixa o registry **público**. Toda a
> entrega passa pela route handler lendo do embed (dir não-público). Não criar
> `public/r/` neste projeto.

## ⚠️ Furo de auth observado em prod (2026-06-16) — causa e cuidado
`curl` sem token em `…/r/button.json` voltou **200** (deveria ser 401). Headers da
resposta (`X-Vercel-Cache: HIT`, `Content-Disposition: inline; filename=…`,
`Cache-Control: public`) = **arquivo estático servido pelo CDN**, não a route
handler. Causa: o projeto Vercel estava apontando pra **raiz do DS (Vite)**, cujo
`vite build` copia `public/r/*.json` pro `dist/` e a Vercel serve cru em `/r/*`,
fora de qualquer auth. **A route handler nunca rodou.**

**Checklist pra não repetir:**
- **Root Directory do projeto Vercel = `registry-app`** (Next.js), NÃO a raiz do DS.
- O domínio `igreen-registry.vercel.app` aponta pro projeto `registry-app` — **não**
  pro preview Vite do DS.
- Confirmar no deploy: `GET /r/button.json` **sem** `Authorization` → **401**.
  Se vier 200 com `X-Vercel-Cache`/`Content-Disposition`, ainda está servindo
  estático → root dir errado.

## Atualizar o registry (quando muda componente/token no DS)
```bash
# na raiz do DS — BUMP a version antes (o carimbo usa package.json.version):
npm run registry:build                 # tokens:tw4 → registry:stamp → shadcn build → public/r
cd registry-app
node scripts/copy-registry.mjs          # regenera app/registry-data.ts de ../public/r
git add app/registry-data.ts && git commit -m "chore(registry): rebuild rN"
```

## Deploy (Vercel)
1. Novo projeto Vercel neste repo, **Root Directory = `registry-app`** (Next.js
   auto-detectado). Domínio sugerido: `igreen-registry.vercel.app`.
2. Env var (Production + Preview): **`IGREEN_TOKEN`** = segredo forte.
3. Deploy. (Não precisa "include files outside root" — o `registry-data.ts` é
   self-contained.)

```bash
# alternativa CLI:
cd registry-app
vercel link
vercel env add IGREEN_TOKEN production   # cola o segredo
vercel deploy --prod
```

## Esquema do IGREEN_TOKEN
- **Segredo único compartilhado.** No Vercel = env var `IGREEN_TOKEN`.
- No consumidor: `.env.local` → `IGREEN_TOKEN=<mesmo segredo>` + no `components.json`:
  ```json
  "registries": {
    "@igreen": {
      "url": "https://igreen-registry.vercel.app/r/{name}.json",
      "headers": { "Authorization": "Bearer ${IGREEN_TOKEN}" }
    }
  }
  ```
- **Rotação** = trocar a env no Vercel + redistribuir aos consumidores.
- **Per-consumer** (revogar individual) = evolução futura (lista de tokens válidos).

## Validado localmente (2026-06-16)
- auth: com token → **200**; sem/errado → **401**; inexistente → **404**.
- `shadcn add @igreen/button` via endpoint autenticado → trouxe **button + tv**;
  **sem token falhou**; **tsc 0** no consumidor.
