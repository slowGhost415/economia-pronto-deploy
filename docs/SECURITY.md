# Segurança

## Objetivo

Este documento descreve os controles de segurança existentes no projeto e pontos que devem ser observados antes de uso em produção real.

## Autenticação

O sistema usa JWT.

Fluxo:

1. Usuário faz login ou cadastro.
2. Backend valida credenciais.
3. Backend assina token com `JWT_SECRET`.
4. Frontend armazena token em `localStorage`.
5. Axios envia o token no header `Authorization`.
6. Middleware valida o token em rotas protegidas.

Arquivo:

```text
backend/src/middlewares/authMiddleware.js
```

## Senhas

As senhas são armazenadas com bcrypt.

Regras no cadastro:

- mínimo de 8 caracteres;
- máximo de 128 caracteres;
- exige letras e números.

Arquivo:

```text
backend/src/controllers/authController.js
```

## Validação de entrada

O backend valida:

- email;
- senha;
- nome;
- datas;
- IDs numéricos;
- valores positivos;
- tipo de transação;
- taxa de investimento não negativa.

Entradas inválidas retornam `400` ou `401`, conforme o caso.

## CORS

Em desenvolvimento, são aceitos:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Em produção, somente origens configuradas em `FRONTEND_URL` são aceitas quando houver frontend separado. Se o frontend for servido pelo próprio Express, chamadas relativas para `/api` funcionam no mesmo domínio.

Arquivo:

```text
backend/src/index.js
```

## Helmet e CSP

O backend usa Helmet com Content Security Policy.

Diretivas principais:

- `default-src 'self'`
- `object-src 'none'`
- `base-uri 'self'`
- `script-src 'self'`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `font-src 'self' https://fonts.gstatic.com data:`
- `img-src 'self' data: blob:`
- `connect-src 'self' https://api.bcb.gov.br`
- `frame-ancestors 'self'`

## Rate limit

Há dois limites:

- API geral: 300 requisições por 15 minutos.
- Autenticação: 25 tentativas por 10 minutos.

Biblioteca:

- `express-rate-limit`

## Limite de corpo JSON

O backend limita JSON a `32kb`:

```js
app.use(express.json({ limit: '32kb' }));
```

Isso reduz risco de payloads excessivos.

## Headers

O backend remove:

```js
app.disable('x-powered-by');
```

Também usa:

```js
app.set('trust proxy', 1);
```

Necessário para rate limit e IP correto atrás de proxy como Render.

## Banco de dados

O acesso ao banco é feito por Prisma Client. As operações usam filtros por `userId`, garantindo que o usuário só acesse seus próprios recursos nas rotas de transações, metas e investimentos.

## Auditoria de dependências

Comandos:

```bash
npm audit --audit-level=high
npm --prefix backend audit --audit-level=high
npm --prefix frontend audit --audit-level=high
```

## Pontos de atenção antes de produção real

- Avaliar troca de `localStorage` por cookie HttpOnly se o projeto passar a lidar com dados sensíveis.
- Adicionar recuperação de senha.
- Adicionar verificação de email.
- Adicionar logs estruturados.
- Adicionar migrations versionadas em vez de depender apenas de `db push`/`ensureDatabase`.
- Adicionar monitoramento de erro e uptime.
- Criar política de privacidade se dados reais forem coletados.
- Evitar expor detalhes de erro em ambiente de produção.

## Responsabilidade de uso

O projeto apresenta dados e simulações com caráter informativo. Não deve ser usado como ferramenta oficial de declaração fiscal, recomendação de investimento ou decisão tributária sem validação profissional.
