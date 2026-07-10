# API

## Base URL

Desenvolvimento:

```text
http://localhost:4000/api
```

Produção unificada:

```text
/api
```

## Autenticação

Rotas protegidas exigem header:

```http
Authorization: Bearer <token>
```

O token é retornado por:

- `POST /auth/signup`
- `POST /auth/login`

## Convenções

Formato de dados:

- JSON

Erros seguem o padrão:

```json
{ "error": "Mensagem do erro" }
```

Códigos comuns:

- `200`: sucesso.
- `201`: criado.
- `400`: entrada inválida.
- `401`: token ausente, inválido ou credenciais inválidas.
- `404`: recurso não encontrado.
- `409`: conflito, como email já cadastrado.
- `500`: erro interno.

## Health check

### GET `/health`

Resposta:

```json
{ "status": "ok" }
```

## Autenticação

### POST `/auth/signup`

Cria usuário.

Body:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "Senha1234"
}
```

Regras:

- `nome`: obrigatório, até 80 caracteres.
- `email`: obrigatório, formato válido, até 254 caracteres.
- `senha`: obrigatória, 8 a 128 caracteres, com letras e números.

Resposta `201`:

```json
{
  "message": "Usuario criado",
  "user": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@email.com"
  },
  "token": "jwt..."
}
```

### POST `/auth/login`

Autentica usuário.

Body:

```json
{
  "email": "maria@email.com",
  "senha": "Senha1234"
}
```

Resposta `200`:

```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@email.com"
  },
  "token": "jwt..."
}
```

### GET `/auth/profile`

Protegida.

Resposta:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "data_criacao": "2026-07-10T00:00:00.000Z"
}
```

## Interações

### POST `/interactions/log`

Protegida.

Registra uma ação do usuário.

Body:

```json
{
  "tipo_acao": "analise",
  "descricao": "Acessou análise econômica"
}
```

Resposta `201`:

```json
{
  "message": "Acao registrada",
  "interaction": {
    "id": 1,
    "userId": 1,
    "tipo_acao": "analise",
    "descricao": "Acessou análise econômica",
    "data": "2026-07-10T00:00:00.000Z"
  }
}
```

### GET `/interactions/history`

Protegida.

Retorna histórico de interações do usuário autenticado.

## Sistema

### GET `/system/dashboard`

Protegida.

Retorna usuário e interações recentes.

Resposta:

```json
{
  "user": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "data_criacao": "2026-07-10T00:00:00.000Z"
  },
  "interactions": []
}
```

### POST `/system/action`

Protegida.

Body:

```json
{
  "tipo_acao": "simulador",
  "descricao": "Acessou simulador"
}
```

## Transações

### GET `/transacoes`

Protegida.

Query params opcionais:

- `tipo`: `receita` ou `despesa`.
- `categoria`: categoria textual.
- `mes`: mês no formato `YYYY-MM`.

Exemplo:

```text
GET /transacoes?tipo=despesa&mes=2026-07
```

### POST `/transacoes`

Protegida.

Body:

```json
{
  "tipo": "despesa",
  "categoria": "Alimentação",
  "descricao": "Supermercado",
  "valor": 320.5,
  "data": "2026-07-10"
}
```

Regras:

- `tipo`: `receita` ou `despesa`.
- `categoria`: obrigatória.
- `descricao`: obrigatória.
- `valor`: maior que zero.
- `data`: opcional; se ausente, usa data atual.

### DELETE `/transacoes/:id`

Protegida.

Remove uma transação do usuário autenticado.

### GET `/transacoes/resumo`

Protegida.

Resposta:

```json
{
  "receitas": 5200,
  "despesas": 2180,
  "saldo": 3020,
  "gastosPorCategoria": {
    "Moradia": 1500,
    "Alimentação": 680
  },
  "alertas": [],
  "total": 3
}
```

## Metas

### GET `/metas`

Protegida.

Lista metas do usuário ordenadas por prazo.

### POST `/metas`

Protegida.

Body:

```json
{
  "nome": "Reserva de emergência",
  "valorAlvo": 15000,
  "prazo": "2026-12-31"
}
```

### PATCH `/metas/:id`

Protegida.

Atualiza progresso da meta.

Body:

```json
{
  "valorAtual": 6200
}
```

### DELETE `/metas/:id`

Protegida.

Remove meta do usuário autenticado.

## Investimentos

### GET `/investimentos`

Protegida.

Lista investimentos do usuário.

### POST `/investimentos`

Protegida.

Body:

```json
{
  "nome": "CDB 100% CDI",
  "tipo": "CDB",
  "valor": 10000,
  "taxa": 12.5
}
```

Regras:

- `nome`: obrigatório.
- `tipo`: obrigatório.
- `valor`: maior que zero.
- `taxa`: não pode ser negativa.

### DELETE `/investimentos/:id`

Protegida.

Remove investimento do usuário autenticado.
