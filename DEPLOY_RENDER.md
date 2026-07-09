# Deploy no Render

Este projeto esta pronto para subir no Render usando o arquivo `render.yaml` da raiz.

## Solucao rapida para colocar no ar agora

Use o Render Blueprint. Nao use Vercel sozinho para este projeto, porque o
`vercel.json` publica apenas o frontend estatico. O app tambem precisa do
backend Express, Prisma e PostgreSQL para login, cadastro e dados do usuario.

## O que sera criado

- 1 banco Postgres: `economia-db`
- 1 Web Service Node: `economia-site`

O mesmo servico Node serve:

- a API em `/api`
- o site React gerado em `frontend/dist`

Assim o frontend usa `/api` no mesmo dominio em producao, sem depender de URL fixa do seu computador.

## Como publicar

1. Envie esta pasta para um repositorio no GitHub, GitLab ou Bitbucket.
2. No Render, clique em `New +` -> `Blueprint`.
3. Conecte o repositorio.
4. Confirme o arquivo `render.yaml`.
5. Clique em `Deploy Blueprint`.

O Render vai criar o banco, instalar dependencias, gerar o Prisma Client, montar as tabelas com `prisma db push`, compilar o React e iniciar o servidor.

Na primeira publicacao, aguarde ate o deploy terminar e abra a URL `onrender.com`
do servico `economia-site`.

## Variaveis de ambiente

O `render.yaml` ja configura automaticamente:

- `DATABASE_URL`: vem do banco `economia-db`
- `JWT_SECRET`: gerado pelo Render
- `NODE_ENV`: `production`

Voce so precisa adicionar variaveis manualmente se for usar outro dominio ou separar frontend/backend.

## Importante sobre o plano gratis

O plano gratis do Render serve para colocar no ar e testar. O Web Service pode
demorar cerca de um minuto para acordar quando fica sem visitas, e o Postgres
gratis expira depois de 30 dias. Para deixar o projeto definitivo, troque o
banco para um plano pago antes desse prazo.

## Validacao

Depois do deploy, abra:

- `https://SEU-SERVICO.onrender.com`
- `https://SEU-SERVICO.onrender.com/api/health`

O endpoint `/api/health` deve responder:

```json
{ "status": "ok" }
```

## Comandos equivalentes para outra hospedagem Node

Use estes comandos quando a plataforma pedir build e start:

```bash
npm run build
npm run db:push
npm start
```

Configure tambem:

- `DATABASE_URL`: URL de um banco PostgreSQL
- `JWT_SECRET`: qualquer texto forte e secreto
- `NODE_ENV=production`

## Execucao local

Para rodar localmente voce precisa de um PostgreSQL acessivel. Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL`.

Depois:

```bash
npm --prefix backend ci
npm --prefix frontend ci
cd backend && npx prisma db push && cd ..
python main.py
```

Abra `http://localhost:5173`.
