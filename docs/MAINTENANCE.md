# Guia de manutenção

## Comandos úteis

Instalar backend:

```bash
npm --prefix backend install
```

Instalar frontend:

```bash
npm --prefix frontend install
```

Rodar backend:

```bash
npm --prefix backend run dev
```

Rodar frontend:

```bash
npm --prefix frontend run dev
```

Rodar sistema completo:

```bash
python main.py
```

Sincronizar banco:

```bash
npm --prefix backend run db:push
```

Gerar Prisma Client:

```bash
npm --prefix backend run prisma:generate
```

Build:

```bash
npm run build
```

Testes do backend:

```bash
npm --prefix backend test
```

Auditoria:

```bash
npm audit --audit-level=high
npm --prefix backend audit --audit-level=high
npm --prefix frontend audit --audit-level=high
```

## Como adicionar uma página no frontend

1. Crie o componente em `frontend/src/pages/NovaPagina.jsx`.
2. Adicione lazy import em `frontend/src/App.jsx`.
3. Adicione `<Route>` dentro de `<Routes>`.
4. Se for rota protegida, envolva com `ProtectedRoute`.
5. Adicione link no `Header.jsx` e, se fizer sentido, no `Footer.jsx`.
6. Atualize documentação em `docs/PRODUCT.md`.

## Como adicionar endpoint na API

1. Crie ou edite controller em `backend/src/controllers`.
2. Crie ou edite rota em `backend/src/routes`.
3. Registre rota em `backend/src/index.js`.
4. Proteja com `authMiddleware` quando houver dados de usuário.
5. Valide entradas no controller.
6. Use `try/catch` e retorne erros claros.
7. Adicione teste em `backend/tests`.
8. Atualize `docs/API.md`.

## Como adicionar modelo no banco

1. Edite `backend/prisma/schema.prisma`.
2. Rode:

```bash
npm --prefix backend run db:push
npm --prefix backend run prisma:generate
```

3. Atualize controllers, rotas e serviços.
4. Atualize `ensureDatabase.js` se o deploy depender dele.
5. Atualize `docs/ARCHITECTURE.md`.

## Como adicionar indicador econômico

1. Identifique fonte confiável.
2. Se for SGS, encontre o código da série.
3. Adicione chamada em `buscarIndicadoresBCB`.
4. Defina cache e fallback.
5. Atualize UI em `Analise.jsx`, `Dados.jsx` ou `Inicio.jsx`.
6. Explique fonte e status em `docs/DATA_AND_SIMULATIONS.md`.

## Diagnóstico de problemas comuns

### Frontend abre, mas API falha

Verifique:

- backend rodando em `http://localhost:4000`;
- `VITE_API_URL`, se usada;
- CORS em `FRONTEND_URL`;
- token salvo no `localStorage`;
- resposta de `/api/health`.

### Login falha sempre

Verifique:

- `JWT_SECRET` definido;
- `DATABASE_URL` correto;
- tabelas criadas;
- usuário cadastrado;
- senha com mínimo exigido.

### Erro Prisma

Rode:

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run db:push
```

Se houver processo prendendo arquivos no Windows, encerre processos Node antes de regenerar.

### Render demora para abrir

No plano gratuito, o serviço pode estar acordando. Aguarde e teste:

```text
https://seu-dominio/api/health
```

### Banco vazio no Render

Verifique logs do serviço e se `DATABASE_URL` foi injetado pelo banco do blueprint. O projeto chama `ensureDatabase` no start quando `DATABASE_URL` existe.

## Checklist antes de enviar para produção

- Build passa.
- Testes passam.
- Auditoria sem vulnerabilidades altas.
- `DATABASE_URL` aponta para banco correto.
- `JWT_SECRET` forte e privado.
- `NODE_ENV=production`.
- Domínio correto configurado em `FRONTEND_URL`, se necessário.
- `/api/health` responde.
- Modo demonstração funciona.
- Login/cadastro funcionam.
- Rotas protegidas não abrem sem token.
- Mobile sem overflow horizontal.

## Convenções de implementação

- Manter lógica de dados separada da apresentação visual.
- Preferir componentes reutilizáveis em `frontend/src/components`.
- Evitar dados fictícios sem sinalizar como demonstração, planejado ou simulação.
- Separar dados brutos de interpretação.
- Manter endpoints protegidos por usuário.
- Atualizar documentação junto com mudanças de API, banco ou fluxo de produto.
