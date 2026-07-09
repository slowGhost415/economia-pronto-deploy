import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Badge,
    CTASection,
    EducationCard,
    SectionHeader
} from '../components/SiteComponents';

const trilhas = [
    {
        title: 'Comece por aqui',
        level: 'Básico',
        time: '8 min',
        description: 'Entenda juros, inflação e poder de compra antes de entrar nos gráficos.',
        example: 'Exemplo: por que seu mercado muda mesmo quando seu salário não muda.'
    },
    {
        title: 'Inflação e poder de compra',
        level: 'Básico',
        time: '12 min',
        description: 'Aprenda a diferença entre inflação cair e preços caírem.',
        example: 'Exemplo: IPCA menor ainda pode significar preços subindo mais devagar.'
    },
    {
        title: 'Juros, crédito e Selic',
        level: 'Intermediário',
        time: '15 min',
        description: 'Veja como a taxa básica influencia financiamento, cartão e renda fixa.',
        example: 'Exemplo: Selic alta costuma encarecer crédito e reduzir consumo.'
    },
    {
        title: 'Câmbio e preços',
        level: 'Intermediário',
        time: '10 min',
        description: 'Entenda por que dólar alto pode aparecer no combustível e no pão.',
        example: 'Exemplo: produtos com insumos importados sentem o câmbio primeiro.'
    },
    {
        title: 'Orçamento pessoal',
        level: 'Básico',
        time: '9 min',
        description: 'Conecte inflação, juros e renda com decisões do mês.',
        example: 'Exemplo: priorizar dívida cara quando juros sobem.'
    },
    {
        title: 'Investimentos básicos',
        level: 'Intermediário',
        time: '14 min',
        description: 'Compare renda fixa, juros compostos e risco sem promessa financeira.',
        example: 'Exemplo: rentabilidade bruta não é a mesma coisa que ganho real.'
    }
];

const conceitos = [
    {
        categoria: 'Juros',
        title: 'O que é Selic?',
        definition: 'É a taxa básica de juros da economia brasileira.',
        example: 'Quando ela sobe, crédito costuma ficar mais caro.',
        site: 'Aparece nos indicadores, no gráfico comparativo e nas leituras de cenário.',
        why: 'Ajuda a entender financiamento, renda fixa, cartão e ritmo do consumo.',
        mistake: 'Achar que Selic é a taxa exata cobrada em qualquer empréstimo.',
        question: 'Se a Selic sobe, o crédito tende a ficar mais barato ou mais caro?'
    },
    {
        categoria: 'Inflação',
        title: 'Inflação caiu. Os preços caíram?',
        definition: 'Não necessariamente. Pode significar que os preços estão subindo mais devagar.',
        example: 'Um produto que subia 1% ao mês pode passar a subir 0,3%.',
        site: 'O IPCA ajuda a comparar pressão de preços com produtos monitorados.',
        why: 'Evita confundir desaceleração de inflação com queda generalizada de preços.',
        mistake: 'Interpretar inflação menor como tudo mais barato no mercado.',
        question: 'Inflação menor sempre significa preço menor?'
    },
    {
        categoria: 'Câmbio',
        title: 'Como o dólar afeta os preços?',
        definition: 'O câmbio influencia produtos importados e insumos usados por empresas.',
        example: 'Combustível, trigo, eletrônicos e viagens podem sentir dólar alto.',
        site: 'A seção de fontes planejadas reserva espaço para integrar câmbio aos gráficos.',
        why: 'Ajuda a entender pressões que chegam ao consumidor indiretamente.',
        mistake: 'Achar que o dólar só importa para quem viaja.',
        question: 'Dólar alto pode afetar produtos nacionais com insumos importados?'
    },
    {
        categoria: 'Renda',
        title: 'O que é poder de compra?',
        definition: 'É a quantidade de bens e serviços que sua renda consegue comprar.',
        example: 'Se o salário fica igual e os preços sobem, o poder de compra cai.',
        site: 'A análise cruza inflação e produtos para mostrar pressão no consumo.',
        why: 'É uma forma prática de traduzir economia para o dia a dia.',
        mistake: 'Olhar apenas o salário nominal e ignorar inflação.',
        question: 'Salário igual com preços maiores melhora ou piora o poder de compra?'
    },
    {
        categoria: 'Governo',
        title: 'O que significa crescimento do PIB?',
        definition: 'PIB mede a produção de bens e serviços da economia.',
        example: 'Quando a economia produz mais, pode haver mais emprego e renda.',
        site: 'Está no roadmap de indicadores para contextualizar atividade econômica.',
        why: 'Ajuda a separar inflação, renda e crescimento real.',
        mistake: 'Achar que PIB maior resolve automaticamente todos os problemas.',
        question: 'PIB mostra produção econômica ou preço de um único produto?'
    },
    {
        categoria: 'Investimentos',
        title: 'O que são juros compostos?',
        definition: 'São juros calculados sobre o valor inicial e sobre juros acumulados.',
        example: 'Um investimento cresce mais rápido quando o rendimento é reinvestido.',
        site: 'O simulador mostra projeções com aportes, prazo e taxa.',
        why: 'Ajuda a planejar objetivos sem depender de promessa de ganho.',
        mistake: 'Ignorar prazo e comparar apenas a taxa mensal.',
        question: 'Juros compostos dependem só da taxa ou também do tempo?'
    }
];

const categorias = ['Todos', 'Juros', 'Preços', 'Inflação', 'Renda', 'Investimentos', 'Governo', 'Mercado'];

const quizzes = [
    ['A inflação caiu. Isso significa que os preços caíram?', 'Não sempre. Muitas vezes significa que os preços continuam subindo, só que em ritmo menor.'],
    ['Selic alta é boa ou ruim?', 'Depende. Pode ajudar a controlar inflação, mas costuma encarecer crédito e esfriar consumo.'],
    ['Dólar alto afeta quais produtos?', 'Importados, combustíveis, insumos industriais, viagens e produtos nacionais com componentes dolarizados.']
];

const Educacao = () => {
    const [busca, setBusca] = useState('');
    const [categoria, setCategoria] = useState('Todos');
    const [quizAberto, setQuizAberto] = useState(0);

    useEffect(() => {
        document.title = 'Economic | Educação econômica';
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute('content', 'Aprenda Selic, inflação, câmbio, PIB, consumo, orçamento e investimentos com exemplos simples conectados aos indicadores do Economic.');
    }, []);

    const conceitosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        return conceitos.filter((item) => {
            const categoriaOk = categoria === 'Todos' || item.categoria === categoria || (categoria === 'Preços' && item.categoria === 'Inflação');
            const buscaOk = !termo || [item.title, item.definition, item.example, item.categoria].join(' ').toLowerCase().includes(termo);
            return categoriaOk && buscaOk;
        });
    }, [busca, categoria]);

    return (
        <main className="site-page education-page">
            <section className="site-inner-hero site-shell">
                <Badge tone="cyan">Educação econômica</Badge>
                <h1>Educação econômica para entender o que muda no seu bolso.</h1>
                <p>
                    Aprenda Selic, inflação, câmbio, PIB, consumo e finanças pessoais com
                    explicações curtas, exemplos práticos e conexão com os indicadores do site.
                </p>
                <div className="hero-actions">
                    <a className="ec-btn" href="#trilhas">Ver trilhas</a>
                    <a className="ec-btn ec-btn-outline" href="#glossario">Buscar conceitos</a>
                </div>
            </section>

            <section id="trilhas" className="site-section site-shell">
                <SectionHeader
                    eyebrow="Trilhas de aprendizado"
                    title="Escolha um caminho e aprenda pelo impacto real."
                    description="Cada trilha combina conceito, exemplo cotidiano e conexão com os indicadores do Economic."
                />
                <div className="education-grid">
                    {trilhas.map((trilha) => <EducationCard key={trilha.title} {...trilha} />)}
                </div>
            </section>

            <section id="glossario" className="site-section site-shell">
                <SectionHeader
                    eyebrow="Glossário inteligente"
                    title="Busque por categoria, conceito ou exemplo."
                    description="O objetivo é explicar economia sem simplificar demais: definição, uso no site, erro comum e pergunta de fixação."
                />

                <div className="education-toolbar">
                    <label>
                        Buscar conceito
                        <input
                            className="ec-input"
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            placeholder="Ex: Selic, inflação, dólar..."
                        />
                    </label>
                    <div className="education-categories" aria-label="Categorias do glossário">
                        {categorias.map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={categoria === item ? 'active' : ''}
                                onClick={() => setCategoria(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="concept-grid">
                    {conceitosFiltrados.map((item) => (
                        <article key={item.title} className="concept-card">
                            <div className="concept-card-top">
                                <Badge>{item.categoria}</Badge>
                                <Link to="/analise#graficos">Ver no gráfico</Link>
                            </div>
                            <h3>{item.title}</h3>
                            <dl>
                                <div><dt>Definição simples</dt><dd>{item.definition}</dd></div>
                                <div><dt>Exemplo do dia a dia</dt><dd>{item.example}</dd></div>
                                <div><dt>Como aparece no site</dt><dd>{item.site}</dd></div>
                                <div><dt>Por que importa</dt><dd>{item.why}</dd></div>
                                <div><dt>Erro comum</dt><dd>{item.mistake}</dd></div>
                            </dl>
                            <p className="concept-question">{item.question}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Quiz rápido"
                    title="Teste a leitura antes de voltar aos dados."
                    description="Perguntas curtas para evitar interpretações comuns, mas equivocadas."
                />
                <div className="quiz-grid">
                    {quizzes.map(([question, answer], index) => (
                        <button
                            type="button"
                            key={question}
                            className={`quiz-card ${quizAberto === index ? 'open' : ''}`}
                            onClick={() => setQuizAberto(index)}
                        >
                            <span>Pergunta {index + 1}</span>
                            <strong>{question}</strong>
                            {quizAberto === index && <p>{answer}</p>}
                        </button>
                    ))}
                </div>
            </section>

            <div className="site-shell">
                <CTASection
                    title="Conecte o conceito com os indicadores reais."
                    description="Depois de aprender, volte para a análise e observe como juros, inflação e preços aparecem nos gráficos."
                    primary={{ to: '/analise', label: 'Abrir análise' }}
                    secondary={{ to: '/dados', label: 'Ver indicadores' }}
                />
            </div>
        </main>
    );
};

export default Educacao;
