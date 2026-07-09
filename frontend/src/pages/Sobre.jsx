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
        description.setAttribute('content', 'Conheça a missão do Economic, fontes de dados, limitações, privacidade, transparência e roadmap de indicadores econômicos.');
    }, []);

    const funcoes = [
        ['Monitora indicadores', 'Selic, IPCA, CDI e séries planejadas para ampliar o cenário.'],
        ['Compara séries', 'Cruza preços, juros e inflação em períodos selecionados.'],
        ['Organiza preços', 'Mantém produtos essenciais agrupados por categoria.'],
        ['Explica conceitos', 'Traduz indicadores em impacto no consumo e no orçamento.'],
        ['Simula cenários', 'Projeta juros compostos, aportes e decisões financeiras.'],
        ['Mostra limitações', 'Diferencia dado conectado, base local e fonte planejada.']
    ];

    const roadmap = ['Dólar', 'Euro', 'PIB', 'Desemprego', 'Dívida pública', 'Balança comercial', 'Mais produtos', 'Mais gráficos', 'Mais aulas'];

    return (
        <main className="site-page about-page">
            <section className="site-inner-hero site-shell">
                <Badge tone="cyan">Sobre o Economic</Badge>
                <h1>Uma plataforma visual para acompanhar economia sem ruído.</h1>
                <p>
                    O Economic organiza indicadores, preços, gráficos e explicações para ajudar
                    estudantes, consumidores e pessoas comuns a entenderem mudanças econômicas.
                </p>
            </section>

            <section className="site-section site-shell split-section">
                <SectionHeader
                    eyebrow="Missão"
                    title="Tornar economia mais compreensível, sem transformar tudo em promessa."
                    description="A plataforma une dados, visualização e educação para explicar o que muda no crédito, no mercado, nos preços e no orçamento."
                />
                <div className="mission-panel">
                    <InsightCard title="Dados com contexto" description="Indicadores isolados confundem. Por isso, o Economic aproxima números de explicações curtas e fontes visíveis." tone="cyan" />
                    <InsightCard title="Clareza para decisões" description="O objetivo é informar melhor, não substituir orientação financeira profissional." tone="amber" />
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="O que a plataforma faz"
                    title="Uma base para análise, aprendizado e simulação."
                    description="Os módulos foram redesenhados para parecerem partes de um produto digital, não telas internas soltas."
                />
                <div className="feature-grid about-feature-grid">
                    {funcoes.map(([title, description], index) => (
                        <FeatureCard key={title} marker={String(index + 1).padStart(2, '0')} title={title} description={description} action="Conhecer módulo" to={index < 3 ? '/dados' : '/educacao'} />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Fontes de dados"
                    title="Transparência sobre origem, cobertura e desenvolvimento."
                    description="O site evita misturar dado real com estrutura futura. Quando algo ainda não está conectado, aparece como roadmap ou fonte planejada."
                />
                <div className="source-grid">
                    <SourceStatusCard title="Banco Central / SGS" status="Conectado" tone="green" description="Séries de juros, inflação e indicadores monetários usados nos cards e gráficos." />
                    <SourceStatusCard title="Base local de preços" status="Disponível" tone="cyan" description="Produtos monitorados para comparação, histórico mensal e variações." />
                    <SourceStatusCard title="Fontes futuras" status="Roadmap" tone="amber" description="IBGE, Tesouro Nacional, câmbio e dados externos planejados para próximas versões." />
                </div>
            </section>

            <section className="site-section site-shell about-transparency">
                <article>
                    <Badge tone="amber">Limitações e transparência</Badge>
                    <h2>Informação econômica não é recomendação individual.</h2>
                    <p>
                        Este site tem finalidade educativa e informativa. As informações não substituem
                        orientação financeira, fiscal, contábil ou de investimento feita por profissional habilitado.
                    </p>
                </article>
                <article>
                    <Badge tone="green">Segurança e privacidade</Badge>
                    <h2>Uso de dados pessoais é limitado ao funcionamento da conta.</h2>
                    <p>
                        Simulações e leituras econômicas devem ser usadas como apoio de estudo. O projeto
                        mantém autenticação para acesso e separa dados do usuário das fontes econômicas públicas.
                    </p>
                </article>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Roadmap"
                    title="Próximas integrações planejadas."
                    description="A evolução prioriza fontes oficiais, gráficos mais claros e educação conectada ao dashboard."
                />
                <div className="roadmap-grid">
                    {roadmap.map((item) => <span key={item}>{item}</span>)}
                </div>
            </section>

            <div className="site-shell">
                <CTASection
                    title="Explore os indicadores ou aprenda os conceitos antes de analisar."
                    description="A plataforma foi pensada para alternar entre dados, gráficos e explicações sem perder contexto."
                    primary={{ to: '/dados', label: 'Explorar indicadores' }}
                    secondary={{ to: '/educacao', label: 'Aprender economia' }}
                />
            </div>
        </main>
    );
};

export default Sobre;
