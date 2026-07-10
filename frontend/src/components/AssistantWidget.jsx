import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const quickPrompts = [
  'Como calcular imposto de uma compra?',
  'Onde simulo CDB e CDI?',
  'Como comparar inflação e preços?',
  'Quais dados posso alterar?',
];

const routeHelp = {
  '/inicio': 'Use os mapas de decisão para escolher entre consumo, impostos, investimentos e educação.',
  '/analise': 'Aqui você escolhe período, produtos e sinais econômicos para comparar preços, Selic e IPCA.',
  '/dados': 'Nesta área você consulta histórico, categorias e tabelas de indicadores.',
  '/simulador': 'Use esta página para testar compra parcelada, impostos, inflação e juros compostos.',
  '/financeiro': 'Aqui ficam carteira, metas, transações e o verificador de investimentos.',
  '/educacao': 'Use a educação econômica para entender conceitos antes de interpretar números.',
  '/sobre': 'Esta página explica a proposta, fontes e limites informativos do Economic.',
};

const answerFor = (question, pathname) => {
  const q = String(question || '').toLowerCase();

  if (q.includes('imposto') || q.includes('compra') || q.includes('produto') || q.includes('link')) {
    return {
      text: 'Abra o Simulador e use a calculadora de compra. Você pode colar um link ou descrição, informar preço, frete, parcelas, juros, inflação e cenário de importação. O resultado separa produto, tributos, juros e custo real estimado.',
      to: '/simulador',
      label: 'Ir para calculadora',
    };
  }

  if (q.includes('cdi') || q.includes('cdb') || q.includes('invest') || q.includes('lci') || q.includes('lca')) {
    return {
      text: 'Vá para Investimentos. O verificador compara taxa, percentual do CDI, prazo e imposto de renda regressivo para estimar rendimento bruto e líquido.',
      to: '/financeiro',
      label: 'Ver investimentos',
    };
  }

  if (q.includes('inflação') || q.includes('inflacao') || q.includes('preço') || q.includes('preco') || q.includes('selic')) {
    return {
      text: 'Na Análise você pode selecionar produtos, período e sinais econômicos. A comparação mostra preços no eixo principal e Selic/IPCA como contexto macroeconômico.',
      to: '/analise',
      label: 'Abrir análise',
    };
  }

  if (q.includes('alterar') || q.includes('manipular') || q.includes('testar') || q.includes('editar')) {
    return {
      text: 'Você consegue testar cenários no Simulador, escolher produtos e período na Análise, filtrar tabelas em Indicadores e cadastrar valores na área Financeira. Dados oficiais são fonte de referência; cenários manuais ficam como simulação.',
      to: '/simulador',
      label: 'Testar cenário',
    };
  }

  return {
    text: routeHelp[pathname] || 'Escolha um tema: impostos, investimentos, inflação, produtos ou dados editáveis. Eu indico a área certa e explico o próximo passo.',
    to: '/inicio',
    label: 'Ver início',
  };
};

const AssistantWidget = ({ user }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Sou o guia do Economic. Pergunte sobre impostos, investimentos, inflação, comparações ou onde testar cenários.',
      to: '/simulador',
      label: 'Começar por simulação',
    },
  ]);

  const contextTip = useMemo(() => routeHelp[location.pathname] || routeHelp['/inicio'], [location.pathname]);

  if (!user) return null;

  const submit = (event) => {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    const answer = answerFor(trimmed, location.pathname);
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'assistant', ...answer }].slice(-6));
    setQuestion('');
  };

  const askQuick = (prompt) => {
    const answer = answerFor(prompt, location.pathname);
    setMessages((prev) => [...prev, { role: 'user', text: prompt }, { role: 'assistant', ...answer }].slice(-6));
    setOpen(true);
  };

  return (
    <aside className={`assistant-widget${open ? ' open' : ''}`} aria-label="Assistente do Economic">
      <button
        type="button"
        className="assistant-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>Ajuda</span>
        <strong>Guia</strong>
      </button>

      {open && (
        <div className="assistant-panel">
          <header>
            <span className="site-eyebrow">Assistente básico</span>
            <h2>Como posso ajudar?</h2>
            <p>{contextTip}</p>
          </header>

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>
                <p>{message.text}</p>
                {message.to && <Link to={message.to}>{message.label}</Link>}
              </div>
            ))}
          </div>

          <div className="assistant-prompts">
            {quickPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => askQuick(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="assistant-form">
            <label htmlFor="assistant-question">Pergunta</label>
            <div>
              <input
                id="assistant-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ex: quero simular um CDB..."
              />
              <button type="submit">Enviar</button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
};

export default AssistantWidget;
