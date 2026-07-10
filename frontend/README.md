# Economic Frontend

Aplicação React/Vite da plataforma Economic. Contém a experiência visual, navegação, modo demonstração, análise econômica, simuladores, área financeira e educação econômica.

## Stack

- React 18
- Vite
- React Router
- Axios
- Chart.js
- Three.js

## Rodar localmente

```bash
npm install
npm run dev
```

URL padrão:

```text
http://localhost:5173
```

O backend deve estar disponível em:

```text
http://localhost:4000/api
```

Em produção, quando servido pelo Express, a API é chamada por `/api`.

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Inicia Vite em desenvolvimento. |
| `npm run build` | Gera build em `frontend/dist`. |
| `npm run preview` | Serve o build localmente para prévia. |

## Rotas principais

- `/`: acesso, login, cadastro e demonstração.
- `/demo`: entrada direta em modo demonstração.
- `/inicio`: home autenticada.
- `/analise`: análise econômica.
- `/dados`: indicadores e tabelas.
- `/simulador`: compras, impostos, juros, inflação e patrimônio.
- `/financeiro`: transações, metas, investimentos e verificador.
- `/educacao`: educação econômica.
- `/sobre`: descrição do projeto.

Documentação de produto: [`../docs/PRODUCT.md`](../docs/PRODUCT.md).

## Observações

- O modo demonstração usa `localStorage` e não persiste dados no banco.
- O assistente é local e baseado em regras.
- Dados externos do Banco Central são cacheados no navegador por 1 hora.
