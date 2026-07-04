import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    carregarDadosStorage,
    calcularTendencia,
    atualizarSelicAPI,
    buscarIndicadoresBCB
} from '../data/dadosEconomicos';
import { getSystemDashboard, performSystemAction } from '../services/systemService';
import EconomicOrb from '../components/EconomicOrb';
import AIAssistant from '../components/AIAssistant';

const Sparkline = ({ dados, cor }) => {
    if (!dados || dados.length < 2) return null;
    const min = Math.min(...dados);
    const max = Math.max(...dados);
    const range = max - min || 1;
    const w = 80, h = 32;
    const pts = dados.map((v, i) => {
        const x = (i / (dados.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    }).join(' ');
    const last = dados[dados.length - 1];
    const prev = dados[dados.length - 2];
    const trend = last >= prev ? cor || '#4caf7d' : '#e05252';
    return (
        <svg width={w} height={h} style={{ display: 'block', opacity: 0.85 }}>
            <polyline points={pts} fill="none" stroke={trend} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={(dados.length - 1) / (dados.length - 1) * w} cy={h - ((last - min) / range) * h} r="3" fill={trend} />
        </svg>
    );
};

const Inicio = ({ user }) => {
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [indicadores, setIndicadores] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [historico, setHistorico] = useState([]);

    useEffect(() => {
        const d = carregarDadosStorage();
        setDados(d);
        Promise.all([
            buscarIndicadoresBCB(),
            atualizarSelicAPI(d),
            getSystemDashboard().catch(() => ({ interactions: [] }))
        ]).then(([ind, dadosAtualizado, dashRes]) => {
            setIndicadores(ind);
            setDados({ ...dadosAtualizado });
            setHistorico((dashRes.interactions || []).slice(0, 6));
        }).finally(() => setCarregando(false));
    }, []);

    const registrarAcao = async (tipo_acao, descricao, destino) => {
        try {
            await performSystemAction({ tipo_acao, descricao });
            const res = await getSystemDashboard();
            setHistorico((res.interactions || []).slice(0, 6));
        } catch { }
        navigate(destino);
    };

    const tendencia = dados ? calcularTendencia(dados.dadosEconomicos.selic) : '-';
    const tendenciaIcone = tendencia === 'alta' ? '▲' : tendencia === 'queda' ? '▼' : '▬';
    const tendenciaCor = tendencia === 'alta' ? 'var(--c-danger)' : tendencia === 'queda' ? 'var(--c-success)' : 'var(--c4)';

    const tempoRelativo = (dataStr) => {
        const diff = (Date.now() - new Date(dataStr)) / 1000;
        if (diff < 60) return 'agora';
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        return `${Math.floor(diff / 86400)}d atrás`;
    };

    const formatarDataAtualizacao = (iso) => {
        if (!iso) return '-';
        return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderValor = (val, sufixo = '') => {
        if (carregando) return <span style={{ fontSize: '0.9rem', color: 'var(--c3)' }}>Buscando...</span>;
        if (val === null || val === undefined) return <span style={{ color: 'var(--c3)' }}>—</span>;
        return <>{Number(val).toFixed(2)}{sufixo}</>;
    };

    const selicAtual = indicadores?.selic;
    const ipcaAtual = indicadores?.ipca;
    const selicHist = indicadores?.selicHistorico || [];
    const ipcaHist = indicadores?.ipcaHistorico || [];
    const ipcaAcum = ipcaHist.length ? ipcaHist.reduce((a, b) => a + b, 0) : null;
    const selicMin = selicHist.length ? Math.min(...selicHist) : null;
    const selicMax = selicHist.length ? Math.max(...selicHist) : null;

    const acoes = [
        {
            id: 'analise', icon: '📊', titulo: 'Análise Avançada',
            desc: 'Gráficos interativos, correlação entre produtos, tendências e análise automática.',
            destino: '/analise', tipo: 'análise', descricao: 'Acessou análise avançada', cor: '#4A5C6A'
        },
        {
            id: 'dados', icon: '📋', titulo: 'Tabelas e Histórico',
            desc: 'Preços mensais, variações percentuais, histórico da Selic e exportação CSV.',
            destino: '/dados', tipo: 'dados', descricao: 'Acessou tabela de dados', cor: '#3D5166'
        },
        {
            id: 'financeiro', icon: '💰', titulo: 'Controle Financeiro',
            desc: 'Receitas, despesas, metas e carteira de investimentos pessoais.',
            destino: '/financeiro', tipo: 'financeiro', descricao: 'Acessou controle financeiro', cor: '#2E6B4F'
        },
        {
            id: 'simulador', icon: '📈', titulo: 'Simulador',
            desc: 'Projete seu patrimônio com juros compostos e aportes mensais.',
            destino: '/simulador', tipo: 'simulador', descricao: 'Acessou simulador financeiro', cor: '#5C4A1E'
        },
    ];

    return (
        <main className="ec-container">
            <div className="ec-hero">
                <div className="hero-copy">
                    <div className="ec-hero-badge">Sistema economico ativo</div>
                    <h1>Inteligencia visual para entender precos, juros e consumo.</h1>
                    <p>
                        Ola, {user?.nome?.split(' ')[0]}. Monitore Selic, IPCA, produtos essenciais,
                        financas pessoais, simulacoes e impostos em uma experiencia mais limpa e futurista.
                    </p>
                    <div className="ec-hero-actions">
                        <button className="ec-btn" onClick={() => registrarAcao('analise', 'Acessou analise avancada', '/analise')}>
                            Ver analise
                        </button>
                        <button className="ec-btn ec-btn-outline" onClick={() => registrarAcao('simulador', 'Acessou simulador financeiro', '/simulador')}>
                            Calcular cenarios
                        </button>
                    </div>
                    <div className="ec-hero-stats">
                        <div className="ec-hero-stat">
                            <div className="ec-hero-stat-value">11</div>
                            <div className="ec-hero-stat-label">Produtos</div>
                        </div>
                        <div className="ec-hero-stat">
                            <div className="ec-hero-stat-value">12m</div>
                            <div className="ec-hero-stat-label">Historico</div>
                        </div>
                        <div className="ec-hero-stat">
                            <div className="ec-hero-stat-value">BCB</div>
                            <div className="ec-hero-stat-label">Fonte oficial</div>
                        </div>
                        {indicadores?.lastUpdate && (
                            <div className="ec-hero-stat">
                                <div className="ec-hero-stat-value compact-stat">
                                    {formatarDataAtualizacao(indicadores.lastUpdate)}
                                </div>
                                <div className="ec-hero-stat-label">Atualizacao</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="hero-orb-panel">
                    <EconomicOrb />
                    <div className="orb-caption">
                        <span>Mapa 3D de pressao economica</span>
                        <strong>Selic + IPCA + consumo</strong>
                    </div>
                </div>
            </div>

            <div className="ec-section-title" style={{ marginBottom: 16 }}>Indicadores em tempo real</div>

            <div className="ec-indicadores-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 14 }}>
                {[
                    {
                        icon: '📈', label: 'Taxa Selic', valor: renderValor(selicAtual, '%'),
                        sub: 'Meta anual — Banco Central', hist: selicHist, cor: '#4caf7d',
                        badge: selicAtual ? (selicAtual > 10 ? { txt: 'Alta', c: 'var(--c-danger)' } : { txt: 'Baixa', c: 'var(--c-success)' }) : null
                    },
                    {
                        icon: '📉', label: 'Inflação IPCA', valor: renderValor(ipcaAtual, '%'),
                        sub: 'Variação mensal — IBGE', hist: ipcaHist, cor: '#e05252',
                        badge: ipcaAtual ? (ipcaAtual > 5 ? { txt: 'Acima da meta', c: 'var(--c-danger)' } : { txt: 'Dentro da meta', c: 'var(--c-success)' }) : null
                    },
                    {
                        icon: '🏦', label: 'CDI', valor: renderValor(indicadores?.cdi, '%'),
                        sub: 'Taxa diária — B3', hist: [], cor: '#9BA8AB', badge: null
                    },
                    {
                        icon: '💵', label: 'Dólar (PTAX)',
                        valor: carregando
                            ? <span style={{ fontSize: '0.9rem', color: 'var(--c3)' }}>Buscando...</span>
                            : indicadores?.dolar ? `R$ ${Number(indicadores.dolar).toFixed(2)}` : <span style={{ color: 'var(--c3)' }}>—</span>,
                        sub: 'Cotação média mensal — BCB', hist: [], cor: '#c9a84c', badge: null
                    },
                ].map((card, i) => (
                    <div key={i} className="ec-indicador-card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div className="ec-indicador-icon" style={{ marginBottom: 0 }}>{card.icon}</div>
                            {card.badge && (
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: card.badge.c + '22', color: card.badge.c, border: `1px solid ${card.badge.c}44` }}>
                                    {card.badge.txt}
                                </span>
                            )}
                        </div>
                        <div className="ec-indicador-label" style={{ marginTop: 10 }}>{card.label}</div>
                        <div className="ec-indicador-valor">{card.valor}</div>
                        <div className="ec-indicador-sub">{card.sub}</div>
                        {card.hist.length > 1 && (
                            <div style={{ marginTop: 8 }}>
                                <Sparkline dados={card.hist} cor={card.cor} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="ec-indicadores-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 28 }}>
                <div className="ec-indicador-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div className="ec-indicador-icon" style={{ marginBottom: 0 }}>📊</div>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: tendenciaCor }}>{tendenciaIcone}</span>
                    </div>
                    <div className="ec-indicador-label">Tendência Selic</div>
                    <div className="ec-indicador-valor" style={{ fontSize: '1.3rem', color: tendenciaCor }}>{tendencia}</div>
                    <div className="ec-indicador-sub">Baseado nos últimos 12 meses</div>
                </div>

                <div className="ec-indicador-card">
                    <div className="ec-indicador-icon">🔢</div>
                    <div className="ec-indicador-label">Selic — Intervalo (12m)</div>
                    <div className="ec-indicador-valor" style={{ fontSize: '1.1rem' }}>
                        {carregando ? '...' : selicMin !== null ? `${selicMin.toFixed(2)}% — ${selicMax.toFixed(2)}%` : '—'}
                    </div>
                    <div className="ec-indicador-sub">Mín. — Máx. no período</div>
                    {selicHist.length > 1 && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                                {selicHist.map((v, i) => {
                                    const pct = selicMax !== selicMin ? ((v - selicMin) / (selicMax - selicMin)) * 100 : 50;
                                    return (
                                        <div key={i} style={{ position: 'absolute', left: `${(i / (selicHist.length - 1)) * 94}%`, top: 0, width: '6%', height: '100%', background: `rgba(76,175,125,${0.3 + (pct / 100) * 0.7})` }} />
                                    );
                                })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--c3)', marginTop: 4 }}>
                                <span>{indicadores?.periodos?.[0] || ''}</span>
                                <span>{indicadores?.periodos?.[indicadores.periodos.length - 1] || ''}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="ec-indicador-card">
                    <div className="ec-indicador-icon">🔥</div>
                    <div className="ec-indicador-label">IPCA Acumulado (12m)</div>
                    <div className="ec-indicador-valor" style={{ fontSize: '1.3rem', color: ipcaAcum && ipcaAcum > 5 ? 'var(--c-danger)' : 'var(--c5)' }}>
                        {carregando ? '...' : ipcaAcum !== null ? `${ipcaAcum.toFixed(2)}%` : '—'}
                    </div>
                    <div className="ec-indicador-sub">Soma mensal dos últimos 12 meses</div>
                    {ipcaAcum !== null && !carregando && (
                        <div style={{ marginTop: 10, padding: '6px 10px', background: ipcaAcum > 5 ? 'rgba(224,82,82,0.1)' : 'rgba(76,175,125,0.1)', borderRadius: 8, fontSize: '0.78rem', color: ipcaAcum > 5 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                            {ipcaAcum > 5 ? 'Acima da meta de 5% ao ano' : 'Dentro da meta de 5% ao ano'}
                        </div>
                    )}
                </div>
            </div>

            <div className="ec-section-title" style={{ marginBottom: 16 }}>Acesso rápido</div>

            <div className="ec-acesso-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: 28 }}>
                {acoes.map(a => (
                    <button key={a.id} className="ec-acesso-card" onClick={() => registrarAcao(a.tipo, a.descricao, a.destino)} style={{ border: 'none', textAlign: 'left' }}>
                        <div className="ec-acesso-card-icon" style={{ background: a.cor + '55', fontSize: '1.5rem' }}>{a.icon}</div>
                        <div className="ec-acesso-card-info">
                            <h3>{a.titulo}</h3>
                            <p>{a.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            <AIAssistant />

            <div className="ec-section-title" style={{ marginBottom: 12 }}>Atividade recente</div>
            <div className="ec-historico-lista">
                {historico.length === 0 ? (
                    <div className="ec-historico-vazio">Nenhuma atividade registrada ainda. Explore as seções acima.</div>
                ) : (
                    historico.map(item => (
                        <div key={item.id} className="ec-historico-item">
                            <div className="ec-historico-dot"></div>
                            <div className="ec-historico-info">
                                <div className="ec-historico-acao">{item.tipo_acao}</div>
                                <div className="ec-historico-desc">{item.descricao}</div>
                            </div>
                            <div className="ec-historico-tempo">{tempoRelativo(item.data)}</div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};

export default Inicio;
