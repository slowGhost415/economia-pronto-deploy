# Dados e simulações

## Fontes de dados

O projeto usa dois grupos de dados:

1. Dados locais demonstrativos em `frontend/src/data/dadosEconomicos.js`.
2. Séries públicas do Banco Central via SGS/BCData.

## Base local de produtos

Arquivo:

```text
frontend/src/data/dadosEconomicos.js
```

Produtos monitorados:

- Arroz
- Feijão
- Café
- Açúcar
- Leite
- Carne
- Óleo
- Gasolina
- Etanol
- Energia
- Internet

Cada item possui:

- nome;
- categoria;
- série mensal;
- cor para visualização.

Essa base é demonstrativa e serve para análise visual, comparação e testes de interface.

## Banco Central SGS

A função `buscarIndicadoresBCB` consulta:

```text
https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados/ultimos/{qtd}?formato=json
```

Séries usadas:

| Indicador | Código SGS | Uso |
| --- | ---: | --- |
| Selic | `11` | Histórico e referência de juros |
| IPCA | `13522` | Histórico de inflação |
| CDI | `12` | Referência para verificador de investimentos |
| Dólar | `3698` | Referência cambial quando disponível |

O resultado é cacheado no `localStorage` por 1 hora para reduzir chamadas externas e melhorar a experiência.

Chaves de cache:

- `indicadoresBCB`
- `analiseEconomicaStorage`

## Busca de produtos

A busca de produtos usa:

- nome do produto;
- chave interna;
- categoria;
- sinônimos;
- normalização de acentos;
- pontuação por similaridade simples.

Funções principais:

- `obterProdutos`
- `obterProdutosPorCategoria`
- `pesquisarProduto`
- `calcularTendencia`
- `calcularVariacaoPercentual`
- `calculoCorrelacaoPearson`

## Simulador de compra

Componente:

```text
frontend/src/components/SmartTaxSearch.jsx
```

Entradas:

- link, produto ou descrição;
- modo: importado, nacional ou manual;
- preço;
- frete;
- seguro;
- dólar;
- parcelas;
- juros ao mês;
- inflação esperada ao ano;
- alíquotas manuais.

Saídas:

- custo estimado à vista;
- parcela estimada;
- imposto de importação;
- ICMS;
- IPI;
- PIS;
- COFINS;
- juros do parcelamento;
- efeito da inflação no prazo;
- distribuição entre esfera federal, estadual e crédito.

## Estimativa de importação

O simulador considera:

- valor aduaneiro aproximado = produto + frete + seguro;
- Remessa Conforme para diferenciar site certificado e não certificado;
- imposto de importação;
- ICMS calculado de forma aproximada por dentro;
- desconto estimado quando aplicável em compras internacionais acima de US$ 50 no regime considerado.

Limite importante: regras variam por NCM, estado, regime tributário, loja, câmbio e data. A simulação é educativa.

## Simulador de patrimônio

Página:

```text
frontend/src/pages/Simulador.jsx
```

Entradas:

- capital inicial;
- aporte mensal;
- taxa de juros;
- periodicidade;
- período.

Saída:

- projeção de patrimônio por juros compostos;
- comparação entre aportes e rendimento.

## Verificador de investimentos

Página:

```text
frontend/src/pages/Financeiro.jsx
```

Entradas:

- tipo de aplicação;
- valor aplicado;
- prazo em dias;
- percentual do CDI;
- taxa prefixada opcional;
- isenção de IR;
- liquidez.

Cálculos:

- taxa anual de referência;
- rendimento bruto;
- alíquota de IR;
- imposto estimado;
- rendimento líquido;
- equivalente líquido em percentual do CDI.

Perfis pré-configurados:

- CDB
- LCI
- LCA
- Tesouro Selic
- Fundo DI

## IR regressivo de renda fixa

Regra aplicada no verificador:

| Prazo | Alíquota |
| --- | ---: |
| Até 180 dias | 22,5% |
| 181 a 360 dias | 20% |
| 361 a 720 dias | 17,5% |
| Acima de 720 dias | 15% |

Aplicações marcadas como isentas usam alíquota 0 no simulador.

## Precisão e responsabilidade

Todas as simulações são aproximações educativas. O sistema não substitui:

- contador;
- consultor tributário;
- consultor financeiro;
- documentação oficial de produto financeiro;
- nota fiscal;
- classificação fiscal de mercadoria;
- análise de suitability.

## Fontes públicas recomendadas para conferência

- Banco Central SGS/BCData: `https://www4.bcb.gov.br/pec/series/port/aviso.asp?frame=1`
- Endpoint SGS em formato JSON: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/12?formato=json`
- Receita Federal, compras internacionais: `https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/preciso-pagar-impostos-nas-compras-internacionais/quanto-pagarei-de-imposto`
- Receita Federal, tabelas de imposto de renda: `https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026`
