# Economic Backend

API Node.js/Express responsável por autenticação, persistência de dados do usuário e histórico de interações da plataforma Economic.

## Stack

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Helmet
- CORS
- express-rate-limit

## Rodar localmente

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Variáveis obrigatórias em `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/economia"
JWT_SECRET="segredo-forte"
```

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Inicia a API com nodemon. |
| `npm start` | Inicia a API em modo produção. |
| `npm test` | Executa testes com o runner nativo do Node. |
| `npm run prisma:generate` | Gera Prisma Client. |
| `npm run db:push` | Sincroniza schema Prisma com banco. |
| `npm run prisma:migrate` | Cria migration de desenvolvimento. |

## Endpoints principais

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/transacoes`
- `POST /api/transacoes`
- `GET /api/transacoes/resumo`
- `GET /api/metas`
- `POST /api/metas`
- `GET /api/investimentos`
- `POST /api/investimentos`
- `GET /api/health`

Documentação completa: [`../docs/API.md`](../docs/API.md).

## Segurança

A API aplica autenticação JWT, hash de senha com bcrypt, Helmet/CSP, rate limit, CORS controlado e limite de payload JSON. Detalhes em [`../docs/SECURITY.md`](../docs/SECURITY.md).
