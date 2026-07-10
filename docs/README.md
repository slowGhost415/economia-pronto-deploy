# Documentação do Economic

Esta pasta concentra a documentação profissional do projeto Economic. Ela foi organizada para atender três públicos:

- avaliadores/recrutadores que querem entender o valor do projeto rapidamente;
- desenvolvedores que precisam rodar, manter ou evoluir a aplicação;
- usuários que querem saber o que cada módulo faz e quais limites existem.

## Mapa da documentação

| Documento | Objetivo |
| --- | --- |
| [PRODUCT.md](PRODUCT.md) | Explica a proposta, módulos, jornadas e funcionalidades do usuário. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Mostra arquitetura, fluxo de dados, estrutura de pastas e modelo do banco. |
| [SETUP_AND_DEPLOYMENT.md](SETUP_AND_DEPLOYMENT.md) | Ensina instalação local, build, variáveis de ambiente e deploy no Render. |
| [API.md](API.md) | Documenta endpoints, autenticação, contratos de entrada e respostas. |
| [DATA_AND_SIMULATIONS.md](DATA_AND_SIMULATIONS.md) | Descreve fontes, cache, dados locais, fórmulas e limites das simulações. |
| [SECURITY.md](SECURITY.md) | Resume controles de segurança, autenticação, CORS, Helmet, rate limit e riscos. |
| [MAINTENANCE.md](MAINTENANCE.md) | Guia prático para testar, evoluir e diagnosticar problemas. |

## Resumo executivo

Economic é uma plataforma web para organizar indicadores econômicos, preços essenciais, educação econômica e simulações financeiras em uma experiência acessível. O objetivo do projeto é demonstrar domínio de frontend, backend, autenticação, banco relacional, visualização de dados, deploy e preocupação com produto.

## Fluxo principal

1. O visitante entra pela página pública de autenticação.
2. Pode criar conta, fazer login ou acessar o modo demonstração.
3. Após autenticação, navega por `Início`, `Análises`, `Indicadores`, `Simulador`, `Investimentos`, `Educação` e `Sobre`.
4. A API protege dados de usuário com JWT.
5. O frontend usa dados locais e séries públicas do Banco Central para compor indicadores.
6. O backend persiste dados privados do usuário: transações, metas, investimentos e histórico de interações.

## Status do projeto

O projeto está funcional para demonstração, avaliação técnica e deploy no Render. As integrações econômicas externas são usadas com cache local no navegador. Algumas fontes planejadas aparecem como roadmap quando ainda não há conexão real implementada.
