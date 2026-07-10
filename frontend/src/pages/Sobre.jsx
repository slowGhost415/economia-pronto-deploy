import { useEffect } from 'react';
import {
    Badge,
    CTASection,
    FeatureCard,
    InsightCard,
    SectionHeader,
    SourceStatusCard
} from '../components/SiteComponents';

const Sobre = () => {
    useEffect(() => {
        document.title = 'Economic | Sobre a plataforma';
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute('content', 'Conheça o Economic: uma plataforma para acompanhar indicadores econômicos, preços, simulações financeiras, fontes de dados e educação econômica.');
    }, []);

    const funcoes = [
        ['Cenário econômico', 'Resumo de Selic, IPCA, preços monitorados, fontes e data de atualização.'],
        ['Análise interativa', 'Filtros por período, seleção de produtos, leitura de tendências e exportação visual.'],
        ['Indicadores e tabelas', 'Consulta de produtos, categorias, séries mensais e variações acumuladas.'],
        ['Simulador econômico', 'Compra real, tributos, parcelas, inflação, juros compostos e comparação de cenários.'],
        ['Verificador de investimentos', 'Comparação de CDI, prazo, IR regressivo, isenção, liquidez e rendimento líquido.'],
        ['Educação econômica', 'Glossário, perguntas frequentes e exemplos ligados ao cotidiano.'],
        ['Assistente básico', 'Guia local para orientar o usuário pelas principais áreas do site.']
    ];

    const fontes = [
        ['Banco Central / SGS', 'Conectado', 'Séries oficiais usadas para acompanhar juros, inflação e indicadores monetários.'],
        ['Base local de preços', 'Disponível', 'Histórico de produtos essenciais para comparar consumo, categorias e variações.'],
        ['Câmbio, PIB e emprego', 'Em integração', 'Espaços preparados para ampliar a leitura macroeconômica sem inventar dados.'],
        ['Atualizações', 'Monitorado', 'Cada indicador exibe fonte e data quando a informação está disponível.']
    ];

    const proximosIndicadores = [
        'Dólar e Euro',
        'PIB',
        'Desemprego',
        'Inflação acumulada',
        'Balança comercial',
        'Dívida pública',
        'Mais produtos essenciais',
        'Relatórios de cenário'
    ];

    return (
        <main className="site-page about-page">
            <section className="site-inner-hero site-shell">
                <Badge tone="cyan">Sobre o Economic</Badge>
                <h1>Economia explicada com dados, contexto e impacto real.</h1>
                <p>
                    O Economic organiza indicadores econômicos, preços essenciais, simulações e
                    educação financeira para ajudar a entender como juros, inflação e consumo se conectam.
                </p>
            </section>

            <section className="site-section site-shell split-section">
                <SectionHeader
                    eyebrow="Propósito"
                    title="Tornar indicadores econômicos mais úteis para a vida real."
                    description="A plataforma combina dados, interpretação e linguagem simples para que a leitura econômica seja prática, confiável e fácil de revisitar."
                />
                <div className="mission-panel">
                    <InsightCard
                        title="Para decisões do dia a dia"
                        description="Entenda como inflação, juros e preços afetam orçamento, crédito, consumo e planejamento pessoal."
                        tone="cyan"
                    />
                    <InsightCard
                        title="Para aprender sem complicar"
                        description="Cada seção separa indicador, fonte, explicação e impacto para evitar leitura rasa ou confusa."
                        tone="amber"
                    />
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Áreas do site"
                    title="Uma navegação organizada por necessidade."
                    description="Os cards abaixo levam para áreas reais do Economic, com foco em análise, consulta, simulação e aprendizado."
                />
                <div className="feature-grid about-feature-grid">
                    {funcoes.map(([title, description], index) => (
                        <FeatureCard
                            key={title}
                            marker={String(index + 1).padStart(2, '0')}
                            title={title}
                            description={description}
                            action="Abrir área"
                            to={index === 0 ? '/inicio' : index === 1 ? '/analise' : index === 2 ? '/dados' : index === 3 ? '/simulador' : index === 4 ? '/financeiro' : index === 5 ? '/educacao' : '/inicio'}
                        />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Fontes"
                    title="Dados com origem visível e limites claros."
                    description="O site mostra o que está disponível, o que está em integração e onde cada indicador deve ser interpretado com cuidado."
                />
                <div className="source-grid source-detail-grid">
                    {fontes.map(([title, status, description], index) => (
                        <SourceStatusCard
                            key={title}
                            title={title}
                            status={status}
                            tone={index % 3 === 0 ? 'green' : index % 3 === 1 ? 'cyan' : 'amber'}
                            description={description}
                        />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell about-transparency">
                <article>
                    <Badge tone="green">Interpretação</Badge>
                    <h2>O dado aparece junto do contexto.</h2>
                    <p>
                        Selic, IPCA e preços monitorados são apresentados com explicações curtas
                        para diferenciar número bruto, tendência e possível impacto no orçamento.
                    </p>
                </article>
                <article>
                    <Badge tone="amber">Limites</Badge>
                    <h2>Informação econômica não é recomendação financeira.</h2>
                    <p>
                        As análises ajudam a entender o cenário, mas não substituem orientação
                        profissional financeira, fiscal, contábil ou de investimento.
                    </p>
                </article>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Próximas integrações"
                    title="Novos indicadores para ampliar a leitura do cenário."
                    description="A estrutura já prevê indicadores adicionais, mas eles só aparecem como dado ativo quando houver fonte confiável disponível."
                />
                <div className="roadmap-grid">
                    {proximosIndicadores.map((item) => <span key={item}>{item}</span>)}
                </div>
            </section>

            <div className="site-shell">
                <CTASection
                    title="Comece pela análise principal ou explore os conceitos."
                    description="Compare indicadores, leia o resumo do cenário e use a educação econômica para entender cada conceito antes de interpretar os números."
                    primary={{ to: '/analise', label: 'Ver análise' }}
                    secondary={{ to: '/educacao', label: 'Aprender conceitos' }}
                />
            </div>
        </main>
    );
};

export default Sobre;
