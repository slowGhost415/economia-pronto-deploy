# Instalação e deploy

## Requisitos

- Node.js `>=20.19 <21`
- npm
- PostgreSQL
- Python 3, opcional para usar `main.py`

No Windows, o repositório também inclui um Node portátil em `tools/`, usado em alguns fluxos locais.

## Variáveis de ambiente

Arquivo recomendado:

- `backend/.env`

Variáveis obrigatórias:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/economia"
JWT_SECRET="segredo-longo-e-forte"
```

Variáveis recomendadas:

```env
NODE_ENV="development"
```

Variáveis opcionais:

```env
FRONTEND_URL="https://seu-frontend.com"
VITE_API_URL="https://sua-api.com/api"
```

Use `FRONTEND_URL` quando frontend e backend estiverem em domínios diferentes. Em produção unificada pelo Express, o frontend usa `/api` e não precisa de `VITE_API_URL`.

## Instalação local

Na raiz:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Configure o `.env` do backend:

```bash
copy backend\.env.example backend\.env
```

Se `backend/.env.example` não existir no checkout, crie `backend/.env` manualmente com `DATABASE_URL` e `JWT_SECRET`.

Sincronize o banco:

```bash
npm --prefix backend run db:push
```

## Desenvolvimento local

Opção 1, sistema completo:

```bash
python main.py
```

Opção 2, processos separados:

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/api/health`

## Build de produção local

```bash
npm run build
npm run db:push
npm start
```

Resultado:

- frontend compilado em `frontend/dist`;
- backend servido em `http://localhost:4000`;
- API disponível em `/api`;
- SPA React servida pelo Express.

## Deploy no Render

O arquivo `render.yaml` define:

- banco PostgreSQL `economia-db`;
- web service `economia-site`;
- build command: `npm run render:build`;
- start command: `npm run render:start`;
- health check: `/api/health`.

Passos:

1. Suba o repositório para GitHub, GitLab ou Bitbucket.
2. No Render, escolha `New +` e depois `Blueprint`.
3. Selecione o repositório.
4. Confirme o `render.yaml`.
5. Inicie o deploy.

Variáveis geradas/configuradas pelo blueprint:

- `DATABASE_URL`
- `JWT_SECRET`
- `NODE_ENV=production`
- `NODE_VERSION=20`

## Observações sobre Render gratuito

- O serviço pode dormir quando fica sem acesso.
- O primeiro acesso após inatividade pode demorar.
- Bancos gratuitos podem ter prazo limitado conforme política do Render.
- Para uso permanente, prefira plano pago ou outro banco PostgreSQL estável.

## Deploy em outro provedor Node

Configure:

```env
DATABASE_URL="..."
JWT_SECRET="..."
NODE_ENV="production"
```

Use:

```bash
npm run render:build
npm run render:start
```

Ou, se a plataforma separar build/start:

```bash
npm run build
npm start
```

## Validação pós-deploy

Abra:

```text
https://seu-dominio/api/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

Depois valide:

- página inicial pública;
- modo demonstração;
- login/cadastro;
- rota `/inicio`;
- rota `/analise`;
- rota `/simulador`;
- rota `/financeiro`.
