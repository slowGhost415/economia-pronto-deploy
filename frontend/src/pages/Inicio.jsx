import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    carregarDadosStorage,
    atualizarSelicAPI,
    buscarIndicadoresBCB
} from '../data/dadosEconomicos';
import { getSystemDashboard, performSystemAction } from '../services/systemService';
import EconomicOrb from '../components/EconomicOrb';
import {
    Badge,
    CTASection,
    FeatureCard,
    InsightCard,
    MetricCard,
    SectionHeader,
    SourceStatusCard
} from '../components/SiteComponents';

const MiniTrend = ({ values = [], tone = 'cyan' }) => {
    if (values.length < 2) return <div className={`mini-trend ${tone}`} aria-hidden="true" />;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 46 - ((value - min) / range) * 42;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg className="mini-trend" viewBox="0 0 100 52" role="img" aria-label="Tendência do indicador">
            <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const Inicio = ({ user }) => {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [indicadores, setIndicadores] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [historico, setHistorico] = useState([]);
    const [focoAtivo, setFocoAtivo] = useState('consumo');

    useEffect(() => {
        document.title = 'Economic | Indicadores econômicos, preços e simulações';
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute('content', 'Economic reúne indicadores econômicos, preços essenciais, simulações financeiras e educação econômica em uma leitura clara e interativa.');
        const d = carregarDadosStorage();
        setDados(d);
        Promise.all([
            buscarIndicadoresBCB(),
            atualizarSelicAPI(d),
            user?.demo ? Promise.resolve({ interactions: [] }) : getSystemDashboard().catch(() => ({ interactions: [] }))
        ]).then(([ind, dadosAtualizado, dashRes]) => {
            setIndicadores(ind);
            setDados({ ...dadosAtualizado });
            setHistorico((dashRes.interactions || []).slice(0, 4));
        }).finally(() => setCarregando(false));
    }, [user?.demo]);

    const registrarAcao = async (tipo_acao, descricao, destino) => {
        if (!user?.demo) {
            try {
                await performSystemAction({ tipo_acao, descricao });
                const res = await getSystemDashboard();
                setHistorico((res.interactions || []).slice(0, 4));
            } catch { /* registro secundário */ }
        }
        navigate(destino);
    };

    const formatarDataAtualizacao = (iso) => {
        if (!iso) return 'Fonte planejada';
        return new Date(iso).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatarHoraAtualizacao = (iso) => {
        if (!iso) return 'Aguardando conexão';
        return new Date(iso).toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const valor = (number, suffix = '') => {
        if (carregando) return '...';
        if (number === null || number === undefined) return 'Em breve';
        return `${Number(number).toFixed(2)}${suffix}`;
    };

    const produtosCount = dados ? Object.keys(dados.dadosEconomicos.produtos).length : 0;
    const selicHist = indicadores?.selicHistorico || dados?.dadosEconomicos.selic || [];
    const ipcaHist = indicadores?.ipcaHistorico || dados?.dadosEconomicos.inflacao || [];
    const ultimaAtualizacao = indicadores?.lastUpdate || dados?.meta?.lastUpdate;

    const features = [
        {
            marker: '01',
            title: 'Análise de cenário',
            description: 'Compare preços, Selic e IPCA com tendência, correlação, impacto no consumo e exportação do gráfico.',
            action: 'Abrir análises',
            onClick: () => registrarAcao('analise', 'Acessou análise econômica', '/analise')
        },
        {
            marker: '02',
            title: 'Indicadores econômicos',
            description: 'Consulte séries, variações, preços mensais e histórico em uma área analítica limpa.',
            action: 'Ver indicadores',
            onClick: () => registrarAcao('dados', 'Acessou indicadores', '/dados')
        },
        {
            marker: '03',
            title: 'Simulador financeiro',
            description: 'Projete juros compostos, aportes e cenários financeiros sem perder o contexto econômico.',
            action: 'Simular cenários',
            onClick: () => registrarAcao('simulador', 'Acessou simulador', '/simulador')
        },
        {
            marker: '04',
            title: 'Educação econômica',
            description: 'Aprenda Selic, inflação, câmbio, PIB e consumo com exemplos conectados aos dados.',
            action: 'Aprender conceitos',
            to: '/educacao'
        }
    ];

    const focusOptions = [
        {
            id: 'consumo',
            label: 'Consumo',
            eyebrow: 'IPCA + cesta local',
            title: 'Entenda onde a inflação pesa no carrinho.',
            description: 'Compare a inflação oficial com alimentos, combustíveis e serviços para enxergar o impacto no orçamento mensal.',
            bullets: ['Produtos monitorados', 'Tendência por período', 'Leitura de impacto'],
            action: 'Abrir análise de consumo',
            destino: '/analise',
            tone: 'cyan'
        },
        {
            id: 'credito',
            label: 'Crédito',
            eyebrow: 'Selic + juros',
            title: 'Simule decisões antes de assumir parcelas.',
            description: 'Veja como juros compostos, aportes e prazo mudam o resultado financeiro em cenários simples de comparar.',
            bullets: ['Simulação rápida', 'Cenários de prazo', 'Efeito dos juros'],
            action: 'Ir para o simulador',
            destino: '/simulador',
            tone: 'amber'
        },
        {
            id: 'precos',
            label: 'Preços',
            eyebrow: 'Séries e tabelas',
            title: 'Acompanhe indicadores e histórico com clareza.',
            description: 'Use filtros para consultar produtos, variações mensais e séries econômicas sem depender de planilhas soltas.',
            bullets: ['Filtros por categoria', 'Histórico mensal', 'Fontes visíveis'],
            action: 'Ver dados econômicos',
            destino: '/dados',
            tone: 'green'
        },
        {
            id: 'aprendizado',
            label: 'Aprendizado',
            eyebrow: 'Conceitos econômicos',
            title: 'Aprenda o conceito e volte ao dado com contexto.',
            description: 'Revise Selic, inflação, câmbio, PIB e orçamento com explicações curtas conectadas à vida real.',
            bullets: ['Glossário prático', 'Perguntas rápidas', 'Exemplos do dia a dia'],
            action: 'Explorar educação',
            destino: '/educacao',
            tone: 'neutral'
        }
    ];

    const focoSelecionado = focusOptions.find((item) => item.id === focoAtivo) || focusOptions[0];

    const trilhas = ['Selic', 'Inflação', 'Câmbio', 'PIB', 'Consumo', 'Orçamento', 'Juros compostos', 'Impostos'];

    return (
        <main className="site-page home-page">
            <section className="home-hero site-shell">
                <div className="home-hero-copy">
                    <Badge tone="cyan">Análise econômica aplicada</Badge>
                    <h1>Entenda juros, inflação e preços em uma leitura clara.</h1>
                    <p>
                        Compare Selic, IPCA, produtos essenciais e cenários financeiros com
                        contexto, fontes e explicações simples para decisões mais conscientes.
                    </p>
                    <div className="hero-actions">
                        <button type="button" className="ec-btn" onClick={() => registrarAcao('analise', 'Começou análise pela Home', '/analise')}>
                            Começar análise
                        </button>
                        <Link className="ec-btn ec-btn-outline" to="/educacao">
                            Explorar educação econômica
                        </Link>
                    </div>

                    <div className="home-metrics-row" aria-label="Indicadores rápidos">
                        <MetricCard label="Selic atual" value={valor(indicadores?.selic, '%')} meta="BCB / SGS" tone="cyan" />
                        <MetricCard label="IPCA" value={valor(indicadores?.ipca, '%')} meta="Inflação monitorada" tone="amber" />
                        <MetricCard label="Produtos monitorados" value={produtosCount || '...'} meta="Base local" />
                        <MetricCard
                            label="Última atualização"
                            value={formatarDataAtualizacao(ultimaAtualizacao)}
                            trend={formatarHoraAtualizacao(ultimaAtualizacao)}
                            meta="Cache local"
                            variant="compact"
                        />
                    </div>
                </div>

                <aside className="home-visual-panel" aria-label="Painel de sinais econômicos">
                    <div className="visual-panel-glass">
                        <div className="visual-panel-head">
                            <span>Cenário econômico</span>
                            <strong>Juros, preços e consumo</strong>
                        </div>
                        <div className="orb-stage">
                            <EconomicOrb />
                        </div>
                        <div className="visual-panel-overlay">
                            <span>Leitura do momento</span>
                            <strong>Indicadores, tendências e impacto no orçamento</strong>
                        </div>
                        <div className="market-signal-grid">
                            <div className="floating-signal-card">
                                <span>Selic x IPCA</span>
                                <MiniTrend values={selicHist} />
                            </div>
                            <div className="floating-signal-card bottom">
                                <span>Poder de compra</span>
                                <MiniTrend values={ipcaHist} tone="amber" />
                            </div>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="site-section site-shell interactive-focus-section" aria-label="Escolha de foco de navegação econômica">
                <SectionHeader
                    eyebrow="Explore do seu jeito"
                    title="Escolha um foco e o site indica o melhor caminho."
                    description="A navegação fica mais prática: você seleciona o assunto, entende o contexto e segue direto para a área certa."
                />
                <div className="focus-lab">
                    <div className="focus-tabs" role="tablist" aria-label="Focos de navegação econômica">
                        {focusOptions.map((option) => (
                            <button
                                key={option.id}
                                id={`focus-tab-${option.id}`}
                                type="button"
                                role="tab"
                                aria-selected={option.id === focoAtivo}
                                aria-controls={`focus-panel-${option.id}`}
                                onClick={() => setFocoAtivo(option.id)}
                            >
                                <span>{option.eyebrow}</span>
                                <strong>{option.label}</strong>
                            </button>
                        ))}
                    </div>

                    <article
                        id={`focus-panel-${focoSelecionado.id}`}
                        className={`focus-panel ${focoSelecionado.tone}`}
                        role="tabpanel"
                        aria-labelledby={`focus-tab-${focoSelecionado.id}`}
                    >
                        <div>
                            <span className="focus-kicker">{focoSelecionado.eyebrow}</span>
                            <h3>{focoSelecionado.title}</h3>
                            <p>{focoSelecionado.description}</p>
                        </div>
                        <div className="focus-checklist" aria-label="Recursos deste foco">
                            {focoSelecionado.bullets.map((item, index) => (
                                <span key={item}>
                                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                                    {item}
                                </span>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="ec-btn"
                            onClick={() => registrarAcao('foco_home', `Escolheu foco ${focoSelecionado.label}`, focoSelecionado.destino)}
                        >
                            {focoSelecionado.action}
                        </button>
                    </article>
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="O que o Economic faz"
                    title="Módulos claros, dados rastreáveis e interações úteis."
                    description="Cada área resolve uma parte do fluxo: observar indicadores, comparar séries, simular decisões, aprender conceitos e consultar as fontes."
                />
                <div className="feature-grid">
                    {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
                </div>
            </section>

            <section className="site-section site-shell split-section">
                <SectionHeader
                    eyebrow="Como funciona"
                    title="Uma sequência simples para entender o cenário."
                    description="A navegação foi pensada como site: primeiro contexto, depois dados, análise e aprendizado."
                />
                <div className="steps-rail">
                    {[
                        ['Escolha os indicadores', 'Selecione período, produtos e séries econômicas que deseja acompanhar.'],
                        ['Compare preços, Selic e IPCA', 'Veja tendências e relações entre custo de vida, juros e inflação.'],
                        ['Entenda o impacto', 'Leia interpretações curtas sobre consumo, crédito e orçamento pessoal.']
                    ].map(([title, text], index) => (
                        <InsightCard
                            key={title}
                            eyebrow={`Passo ${index + 1}`}
                            title={title}
                            description={text}
                            tone={index === 1 ? 'cyan' : 'neutral'}
                        />
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Visão rápida"
                    title="Um retrato dos principais sinais econômicos."
                    description="A visão combina indicadores, tendência e interpretação para mostrar contexto antes da análise completa."
                >
                    <Link className="ec-btn ec-btn-outline" to="/analise#graficos">Ver gráficos</Link>
                </SectionHeader>

                <div className="market-preview">
                    <div className="preview-main-chart">
                        <div className="preview-chart-head">
                            <span>Comparativo econômico</span>
                            <Badge tone="green">Fonte conectada</Badge>
                        </div>
                        <div className="preview-chart-lines" aria-hidden="true">
                            <span className="line-one" />
                            <span className="line-two" />
                            <span className="line-three" />
                        </div>
                        <p>Preços usam eixo de valores; Selic e IPCA entram como pressão macroeconômica para leitura do consumo.</p>
                    </div>
                    <div className="preview-side-list">
                        <MetricCard label="Produtos" value={produtosCount || 0} meta="alimentos, combustíveis e serviços" />
                        <MetricCard
                            label="Dólar PTAX"
                            value={carregando ? '...' : indicadores?.dolar ? `R$ ${Number(indicadores.dolar).toFixed(2)}` : 'Em breve'}
                            meta="Fonte planejada ou cache BCB"
                            tone="amber"
                        />
                        <InsightCard title="Insight principal" description="Quando juros e inflação caminham juntos, o crédito e o orçamento costumam sentir primeiro." tone="cyan" />
                    </div>
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Educação econômica"
                    title="Aprenda o conceito e volte para o dado com mais clareza."
                    description="As trilhas conectam explicações curtas com indicadores reais da plataforma."
                />
                <div className="learning-chip-grid">
                    {trilhas.map((item) => (
                        <Link key={item} to="/educacao" className="learning-chip">{item}</Link>
                    ))}
                </div>
            </section>

            <section className="site-section site-shell">
                <SectionHeader
                    eyebrow="Confiança e fontes"
                    title="Transparência sobre o que está conectado e o que vem depois."
                    description="O site separa dados disponíveis de fontes planejadas para evitar placeholders dominando a experiência."
                />
                <div className="source-grid">
                    <SourceStatusCard title="Banco Central / SGS" status="Conectado" tone="green" description="Selic, IPCA, CDI e séries oficiais usadas nos indicadores." />
                    <SourceStatusCard title="Base local de preços" status="Disponível" tone="cyan" description="Histórico de produtos essenciais usado em comparações e tabelas." />
                    <SourceStatusCard title="PIB, desemprego e dívida" status="Roadmap" tone="amber" description="Fontes planejadas para ampliar a leitura macroeconômica." />
                </div>
            </section>

            {historico.length > 0 && (
                <section className="site-section site-shell compact-section">
                    <SectionHeader
                        eyebrow="Atividade recente"
                        title={`Olá, ${user?.nome?.split(' ')[0] || 'usuário'}. Continue de onde parou.`}
                        description="Suas últimas ações ajudam a retomar o fluxo sem transformar a Home em painel interno."
                    />
                    <div className="activity-strip">
                        {historico.map((item) => (
                            <div key={item.id}>
                                <strong>{item.tipo_acao}</strong>
                                <span>{item.descricao}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="site-shell">
                <CTASection
                    title="Comece a transformar dados econômicos em decisões mais claras."
                    description="Abra a análise para comparar séries ou siga pela educação econômica para entender os conceitos antes dos gráficos."
                    primary={{ to: '/analise', label: 'Ver análise' }}
                    secondary={{ to: '/educacao', label: 'Aprender conceitos' }}
                />
            </div>
        </main>
    );
};

export default Inicio;
