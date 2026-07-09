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
        document.title = 'Economic | Projeto full stack';
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute('content', 'Conheça a arquitetura do Economic: React, Vite, Node.js, Express, Prisma, PostgreSQL, JWT, dashboards econômicos e modo demonstração.');
    }, []);

    const funcoes = [
        ['Dashboard econômico', 'Resumo de Selic, IPCA, produtos monitorados, fontes e última atualização.'],
        ['Análise interativa', 'Filtros por período, seleção de produtos, zoom no gráfico, exportação PNG e impressão.'],
        ['Indicadores e tabelas', 'Consultas por produto, categoria e periodo com exportacao CSV.'],
        ['Simulador financeiro', 'Projeção de juros compostos, aportes e cenários de prazo.'],
        ['Educação econômica', 'Glossário, conceitos e exemplos conectados ao dashboard.'],
        ['Modo visitante', 'Avaliadores conseguem navegar sem criar conta ou depender de credenciais.']
    ];

    const stack = [
        ['Frontend', 'React 18, Vite, React Router, CSS responsivo e componentes reutilizáveis.'],
        ['Backend', 'Node.js, Express, middlewares, CORS, Helmet, rate limit e rotas REST.'],
        ['Banco', 'Prisma ORM com PostgreSQL no Render e modelos para usuários, metas, transações e investimentos.'],
        ['Segurança', 'Autenticação JWT, rotas protegidas, validação de token e modo demo sem gravar credenciais.'],
        ['Visualização', 'Chart.js, zoom/pan, tabelas responsivas, exportação e leitura textual do contexto.'],
        ['Deploy', 'Render com health check, build automatizado e frontend servido pelo backend em produção.']
    ];

        const roadmap = ['Code splitting adicional', 'Open Graph com imagem dedicada', 'Mais fontes oficiais', 'Dashboard público parcial', 'Testes automatizados', 'Relatório PDF'];

    return (
        <main className="site-page about-page">
            <section className="site-inner-hero site-shell">
                <Badge tone="cyan">Projeto Economic</Badge>
                <h1>Uma plataforma full stack para leitura de indicadores econômicos.</h1>
                <p>
                    O projeto demonstra arquitetura web completa: interface responsiva, API, banco,
                    autenticação, modo visitante, gráficos, filtros e páginas de educação financeira.
                </p>
            </section>

            <section className="site-section site-shell split-section">
                <SectionHeader
                    eyebrow="Objetivo"
                    title="Transformar dados econômicos em uma experiência de produto."
                    description="A proposta é mostrar domínio de frontend, backend, banco, UX de dashboards e clareza de comunicação para usuários não especialistas."
                />
                <div className="mission-panel">
                    <InsightCard title="Para recrutadores" description="O modo demo abre a plataforma sem cadastro e permite avaliar rotas, filtros, gráficos e responsividade rapidamente." tone="cyan" />
                    <InsightCard title="Para usuários" description="Os módulos separam dados brutos, interpretação, simulação e educação para reduzir confusão na leitura econômica." tone="amber" />
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Funcionalidades"
                    title="O que já está navegável no produto."
                    description="Os cards abaixo são atalhos reais para áreas do site, sem elementos que parecem clicáveis mas não levam a lugar algum."
                />
                <div className="feature-grid about-feature-grid">
                    {funcoes.map(([title, description], index) => (
                        <FeatureCard
                            key={title}
                            marker={String(index + 1).padStart(2, '0')}
                            title={title}
                            description={description}
                            action="Abrir modulo"
                            to={index === 0 ? '/inicio' : index === 1 ? '/analise' : index === 2 ? '/dados' : index === 3 ? '/simulador' : index === 4 ? '/educacao' : '/demo'}
                        />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Arquitetura"
                    title="Stack e decisões técnicas do projeto."
                    description="A página destaca as escolhas usadas para construir o produto e facilita conversas técnicas em entrevista."
                />
                <div className="source-grid tech-stack-grid">
                    {stack.map(([title, description], index) => (
                        <SourceStatusCard
                            key={title}
                            title={title}
                            status={index < 4 ? 'Implementado' : 'Em uso'}
                            tone={index % 3 === 0 ? 'cyan' : index % 3 === 1 ? 'green' : 'amber'}
                            description={description}
                        />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell about-transparency">
                <article>
                    <Badge tone="green">Dados e fontes</Badge>
                    <h2>Separação clara entre dado conectado e estrutura futura.</h2>
                    <p>
                        Selic, IPCA e a base local de preços aparecem como dados disponíveis. PIB,
                        câmbio, desemprego e dívida pública aparecem como roadmap para não simular
                        dados que ainda não foram integrados.
                    </p>
                </article>
                <article>
                    <Badge tone="amber">Limites</Badge>
                    <h2>O produto informa, mas não recomenda investimento.</h2>
                    <p>
                        A leitura econômica serve como apoio educativo. O site não substitui
                        orientação financeira, fiscal, contábil ou de investimento feita por profissional.
                    </p>
                </article>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Roadmap"
                    title="Próximas melhorias planejadas."
                    description="A evolução prioriza performance, fontes oficiais, compartilhamento profissional e relatórios."
                />
                <div className="roadmap-grid">
                    {roadmap.map((item) => <span key={item}>{item}</span>)}
                </div>
            </section>

            <div className="site-shell">
                <CTASection
                    title="Abra a demonstração ou veja a análise principal."
                    description="O fluxo de avaliação recomendado é: demo, análise, indicadores, simulador e página do projeto."
                    primary={{ to: '/demo', label: 'Abrir demo' }}
                    secondary={{ to: '/analise', label: 'Ver análise' }}
                />
            </div>
        </main>
    );
};

export default Sobre;
