# Visão de produto

## Proposta

Economic é uma plataforma de análise econômica e simulação financeira com foco em clareza. O site ajuda o usuário a entender como juros, inflação, preços, impostos e investimentos afetam decisões do cotidiano.

O projeto evita ser apenas uma tela de dados: cada área combina indicador, contexto, explicação e ação prática.

## Público-alvo

- Pessoas que querem entender indicadores econômicos sem linguagem excessivamente técnica.
- Usuários que desejam simular compras, parcelas, impostos e inflação.
- Usuários que querem organizar finanças pessoais, metas e investimentos.
- Recrutadores ou avaliadores técnicos que precisam ver um projeto full web funcional.

## Funcionalidades por área

### Acesso e demonstração

Rotas:

- `/`
- `/demo`

Recursos:

- Login com email e senha.
- Cadastro de usuário.
- Modo demonstração sem necessidade de conta.
- Aviso de carregamento quando o serviço do Render está acordando.

O modo demonstração usa dados locais e não grava informações permanentes no banco.

### Início

Rota:

- `/inicio`

Recursos:

- Visão institucional do produto.
- Indicadores rápidos de Selic, IPCA, produtos monitorados e última atualização.
- Globo/visual 3D interativo com objetivos conectados a áreas reais:
  - consumo;
  - impostos;
  - investimentos;
  - educação econômica.
- Trilhas de navegação por interesse.
- Cards de módulos principais.
- Fontes conectadas e planejadas.

### Análises

Rota:

- `/analise`

Recursos:

- Resumo do cenário econômico.
- Indicadores principais.
- Seleção de período.
- Seleção de produtos essenciais.
- Comparação visual de preços, Selic e IPCA.
- Busca por produto e sinônimos.
- Exportação da visualização.
- Interpretações separadas dos dados brutos.
- Fontes e status de atualização.

### Indicadores

Rota:

- `/dados`

Recursos:

- Tabelas de preços mensais.
- Variações por produto.
- Histórico de Selic e IPCA.
- Indicadores de maiores altas e menores variações.
- Exportação de CSV.

### Simulador

Rota:

- `/simulador`

Recursos:

- Calculadora de compra com link, nome ou descrição do produto.
- Entrada manual de preço, frete, seguro e dólar.
- Simulação de produto importado, nacional ou manual.
- Estimativa de Imposto de Importação, ICMS, IPI, PIS e COFINS quando aplicável.
- Parcelamento com juros mensais.
- Impacto estimado da inflação no prazo.
- Destino do custo estimado: federal, estadual e crédito.
- Histórico local de cenários guardados.
- Simulador de patrimônio com juros compostos e aportes recorrentes.

### Investimentos e finanças

Rota:

- `/financeiro`

Abas:

- Resumo
- Transações
- Metas
- Verificador
- Investimentos

Recursos:

- Cadastro de receitas e despesas.
- Resumo de saldo, receitas, despesas e alertas.
- Metas financeiras com atualização de progresso.
- Cadastro de investimentos.
- Verificador de aplicações com:
  - valor aplicado;
  - prazo em dias;
  - percentual do CDI;
  - taxa prefixada opcional;
  - isenção de IR;
  - liquidez;
  - rendimento bruto;
  - IR estimado;
  - rendimento líquido;
  - equivalente líquido em percentual do CDI.

### Educação econômica

Rota:

- `/educacao`

Recursos:

- Conceitos de Selic, IPCA, câmbio, PIB, poder de compra e juros.
- Explicações curtas ligadas às áreas do site.
- Perguntas educativas para reduzir dependência de termos técnicos.

### Sobre

Rota:

- `/sobre`

Recursos:

- Objetivo da plataforma.
- Módulos disponíveis.
- Fontes e status de dados.
- Limites informativos.

### Assistente básico

Componente:

- `frontend/src/components/AssistantWidget.jsx`

Recursos:

- Ajuda contextual por rota.
- Perguntas rápidas.
- Respostas sobre impostos, investimentos, inflação, compras e navegação.

Importante: o assistente é local e baseado em regras. Ele não usa LLM, OpenAI ou outro serviço externo.

## Limites do produto

- Simulações são estimativas educativas.
- O cálculo tributário não substitui classificação fiscal, nota fiscal, NCM, regra estadual ou consulta profissional.
- O verificador de investimento não representa recomendação de compra.
- Algumas fontes macroeconômicas aparecem como planejadas até haver integração real.
- Dados de produtos essenciais são base local demonstrativa.
