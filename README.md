# Economic

Plataforma web de análise econômica, educação financeira e simulação de cenários para consumo, impostos, inflação, juros e investimentos.

O projeto combina uma interface React moderna com uma API Express, autenticação JWT, persistência em PostgreSQL via Prisma e dados econômicos consultados em fontes públicas quando disponíveis. A experiência principal foi pensada para desktop/web, com responsividade para tablet e celular.

## Principais recursos

- Modo demonstração para avaliação rápida sem cadastro.
- Login e cadastro com JWT.
- Home institucional com navegação por objetivos econômicos.
- Página de análise com Selic, IPCA, produtos essenciais, comparações e interpretação.
- Página de indicadores com tabelas, histórico e leitura de variações.
- Simulador de compras com preço, frete, seguro, dólar, impostos, parcelas, juros e inflação.
- Área financeira com transações, metas, carteira e verificador de investimentos baseado em CDI, prazo, IR e liquidez.
- Educação econômica com explicações simples sobre indicadores.
- Assistente básico local para orientar o usuário dentro do site.
- Deploy unificado no Render: backend serve a API e o frontend compilado.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, Vite, React Router, Chart.js, Three.js, Axios |
| Backend | Node.js, Express, Prisma, JWT, Helmet, CORS, express-rate-limit |
| Banco | PostgreSQL |
| Deploy | Render Blueprint |
| Testes | Node test runner, Playwright para checagens visuais |

## Estrutura rápida

```text
.
├── backend/        # API Express, Prisma, autenticação e regras de persistência
├── frontend/       # Aplicação React/Vite
├── docs/           # Documentação técnica e de produto
├── interface/      # Protótipo estático legado
├── usuarios/       # Telas HTML legadas
├── render.yaml     # Blueprint do Render
└── main.py         # Launcher local para backend + frontend
```

## Rodar localmente

Requisitos:

- Node.js `>=20.19 <21`
- PostgreSQL acessível
- Python 3, apenas se quiser usar `python main.py`

Instale dependências:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Configure `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/economia"
JWT_SECRET="troque-por-um-segredo-forte"
NODE_ENV="development"
```

Crie/sincronize o banco:

```bash
npm --prefix backend run db:push
```

Inicie em desenvolvimento:

```bash
python main.py
```

URLs locais:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

## Build de produção local

```bash
npm run build
npm run db:push
npm start
```

Depois abra `http://localhost:4000`. Nesse modo, o Express serve a pasta `frontend/dist` e a API no mesmo domínio.

## Documentação completa

- [Índice da documentação](docs/README.md)
- [Visão de produto](docs/PRODUCT.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Instalação e deploy](docs/SETUP_AND_DEPLOYMENT.md)
- [API](docs/API.md)
- [Dados e simulações](docs/DATA_AND_SIMULATIONS.md)
- [Segurança](docs/SECURITY.md)
- [Guia de manutenção](docs/MAINTENANCE.md)

## Deploy

O deploy recomendado é pelo Render usando `render.yaml`. O blueprint cria:

- 1 banco PostgreSQL.
- 1 Web Service Node.

O serviço Node compila o frontend, gera o Prisma Client, inicia o backend e serve tudo no mesmo domínio. Detalhes em [Instalação e deploy](docs/SETUP_AND_DEPLOYMENT.md) e [DEPLOY_RENDER.md](DEPLOY_RENDER.md).

## Observações importantes

- Os dados exibidos têm caráter informativo e educacional.
- As simulações de impostos, inflação, juros e investimentos são estimativas, não aconselhamento financeiro, tributário ou fiscal.
- O assistente é local e baseado em regras; não usa API externa de IA.
- As pastas `interface/` e `usuarios/` são artefatos legados/protótipos estáticos e não fazem parte do fluxo principal React/Express.
