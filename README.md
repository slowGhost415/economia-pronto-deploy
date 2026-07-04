# Sistema Web de Analise Economica

Aplicacao web com frontend React/Vite, backend Express, autenticacao JWT e banco PostgreSQL via Prisma.

## Estrutura

- `frontend/`: interface React.
- `backend/`: API Express e Prisma.
- `render.yaml`: blueprint para publicar no Render.
- `DEPLOY_RENDER.md`: passo a passo de publicacao.

## Rodar localmente

Requisitos:

- Node.js 18+
- Python 3.6+ para usar `main.py`
- PostgreSQL

Configure o backend:

```bash
copy backend\.env.example backend\.env
```

Edite `backend/.env` e ajuste `DATABASE_URL` para o seu PostgreSQL.

Instale dependencias e crie as tabelas:

```bash
npm --prefix backend ci
npm --prefix frontend ci
cd backend && npx prisma db push && cd ..
```

Inicie em desenvolvimento:

```bash
python main.py
```

URLs locais:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Rodar em producao local

```bash
npm run build
npm run db:push
npm start
```

Depois abra `http://localhost:4000`. Nessa forma, o backend serve o site React compilado e a API no mesmo dominio.

## Deploy

O caminho recomendado e Render com Blueprint:

1. Envie o projeto para GitHub, GitLab ou Bitbucket.
2. No Render, escolha `New +` -> `Blueprint`.
3. Selecione o repositorio.
4. Confirme o arquivo `render.yaml`.
5. Aguarde o deploy.

Mais detalhes em `DEPLOY_RENDER.md`.

## Variaveis de ambiente

Para hospedagem Node generica:

- `DATABASE_URL`: URL PostgreSQL.
- `JWT_SECRET`: segredo forte para tokens JWT.
- `NODE_ENV=production`.

Opcional:

- `FRONTEND_URL`: necessario apenas se frontend e backend forem publicados em dominios diferentes.
- `VITE_API_URL`: necessario apenas se o frontend for compilado separado do backend.
