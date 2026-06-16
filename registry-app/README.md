# iGreen DS — registry (deploy dedicado)

Next mínimo que serve o registry shadcn do DS com **auth Bearer**. Deploy próprio
na Vercel — **não** usar o preview Vite (estático, sem runtime pro token).

## Como funciona
- `app/r/[name]/route.ts` valida `Authorization: Bearer ${IGREEN_TOKEN}` e serve o
  item de `app/registry-data.ts`. Sem token / errado → **401**; inexistente → **404**.
- `app/registry-data.ts` é o **embed do registry, COMMITADO** (self-contained pro
  deploy — não depende de `../public/r` no Vercel). Regenerado por
  `scripts/copy-registry.mjs` a partir do `public/r` do DS (quando presente; senão
  mantém o commitado).

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
