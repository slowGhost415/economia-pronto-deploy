import { useEffect, useState, useRef } from 'react';
import {
    listarTransacoes, criarTransacao, deletarTransacao, resumoFinanceiro,
    listarMetas, criarMeta, atualizarMeta, deletarMeta,
    listarInvestimentos, criarInvestimento, deletarInvestimento
} from '../services/financeiroService';
import { buscarIndicadoresBCB } from '../data/dadosEconomicos';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Legend, Title, Tooltip, ArcElement, DoughnutController } from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Legend, Title, Tooltip, ArcElement, DoughnutController);

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const TIPOS_INVESTIMENTO = ['CDB', 'LCI', 'LCA', 'Tesouro Selic', 'Tesouro IPCA+', 'Fundo DI', 'Ações', 'FIIs', 'Outros'];

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const annualizarTaxaDiaria = (taxaDiaria) => {
    const taxa = Number(taxaDiaria || 0);
    if (!Number.isFinite(taxa) || taxa <= 0) return null;
    return (Math.pow(1 + taxa / 100, 252) - 1) * 100;
};

const irRendaFixa = (dias, isento) => {
    if (isento) return 0;
    if (dias <= 180) return 22.5;
    if (dias <= 360) return 20;
    if (dias <= 720) return 17.5;
    return 15;
};

const perfisInvestimento = {
    CDB: { percentualCdi: 100, isento: false, liquidez: 'D+1', risco: 'Crédito privado com proteção do FGC dentro dos limites aplicáveis.' },
    LCI: { percentualCdi: 90, isento: true, liquidez: 'Carência', risco: 'Crédito privado isento de IR para pessoa física, conforme regra vigente.' },
    LCA: { percentualCdi: 90, isento: true, liquidez: 'Carência', risco: 'Crédito privado isento de IR para pessoa física, conforme regra vigente.' },
    'Tesouro Selic': { percentualCdi: 100, isento: false, liquidez: 'D+1', risco: 'Título público pós-fixado, sujeito a marcação a mercado.' },
    'Fundo DI': { percentualCdi: 95, isento: false, liquidez: 'D+0/D+1', risco: 'Verifique taxa de administração e come-cotas.' },
};

const Financeiro = ({ user }) => {
    const [aba, setAba] = useState('resumo');
    const [resumo, setResumo] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [metas, setMetas] = useState([]);
    const [investimentos, setInvestimentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [notif, setNotif] = useState(null);
    const [benchmarks, setBenchmarks] = useState({ cdiAnual: null, selicAnual: null, lastUpdate: null });

    const [formTx, setFormTx] = useState({ tipo: 'despesa', categoria: 'Alimentação', descricao: '', valor: '', data: '' });
    const [formMeta, setFormMeta] = useState({ nome: '', valorAlvo: '', prazo: '' });
    const [formInv, setFormInv] = useState({ nome: '', tipo: 'CDB', valor: '', taxa: '' });
    const [verificador, setVerificador] = useState({
        tipo: 'CDB',
        valor: '10000',
        prazoDias: '720',
        percentualCdi: '100',
        taxaPrefixada: '',
        isento: 'nao',
        liquidez: 'D+1',
    });
    const [filtroMes, setFiltroMes] = useState('');

    const barChartRef = useRef(null);
    const doughnutRef = useRef(null);
    const barChartInstance = useRef(null);
    const doughnutInstance = useRef(null);
    const isDemo = Boolean(user?.demo);

    const mostrarNotif = (type, message) => {
        setNotif({ type, message });
        setTimeout(() => setNotif(null), 3000);
    };

    const carregar = async () => {
        setCarregando(true);
        if (isDemo) {
            const demoTransacoes = [
                { id: 1, tipo: 'receita', categoria: 'Salário', descricao: 'Receita demonstrativa', valor: 5200, data: new Date().toISOString() },
                { id: 2, tipo: 'despesa', categoria: 'Moradia', descricao: 'Aluguel demonstrativo', valor: 1500, data: new Date().toISOString() },
                { id: 3, tipo: 'despesa', categoria: 'Alimentação', descricao: 'Mercado demonstrativo', valor: 680, data: new Date().toISOString() },
            ];
            const demoInvestimentos = [
                { id: 1, nome: 'CDB 100% CDI', tipo: 'CDB', valor: 10000, taxa: 10.65 },
                { id: 2, nome: 'LCI 90% CDI', tipo: 'LCI', valor: 8000, taxa: 9.6 },
            ];
            const receitas = demoTransacoes.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
            const despesas = demoTransacoes.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
            setTransacoes((prev) => prev.length ? prev : demoTransacoes);
            setMetas((prev) => prev.length ? prev : [{ id: 1, nome: 'Reserva de emergência', valorAlvo: 15000, valorAtual: 6200, prazo: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString() }]);
            setInvestimentos((prev) => prev.length ? prev : demoInvestimentos);
            setResumo({
                receitas,
                despesas,
                saldo: receitas - despesas,
                gastosPorCategoria: { Moradia: 1500, Alimentação: 680 },
                alertas: ['Modo demonstração: dados salvos apenas nesta sessão.'],
            });
            setCarregando(false);
            return;
        }
        try {
            const [res, txs, mts, invs] = await Promise.all([
                resumoFinanceiro(),
                listarTransacoes(filtroMes ? { mes: filtroMes } : {}),
                listarMetas(),
                listarInvestimentos(),
            ]);
            setResumo(res);
            setTransacoes(txs);
            setMetas(mts);
            setInvestimentos(invs);
        } catch {
            mostrarNotif('error', 'Erro ao carregar dados financeiros');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => { carregar(); }, [filtroMes, isDemo]);

    useEffect(() => {
        let mounted = true;
        buscarIndicadoresBCB()
            .then((indicadores) => {
                if (!mounted) return;
                setBenchmarks({
                    cdiAnual: annualizarTaxaDiaria(indicadores?.cdi) || 10.65,
                    selicAnual: annualizarTaxaDiaria(indicadores?.selic) || 10.65,
                    lastUpdate: indicadores?.lastUpdate || null,
                });
            })
            .catch(() => {
                if (mounted) setBenchmarks({ cdiAnual: 10.65, selicAnual: 10.65, lastUpdate: null });
            });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (aba !== 'resumo' || !resumo) return;
        const labels = Object.keys(resumo.gastosPorCategoria);
        const valores = Object.values(resumo.gastosPorCategoria);

        if (doughnutInstance.current) { doughnutInstance.current.destroy(); doughnutInstance.current = null; }
        if (doughnutRef.current && labels.length > 0) {
            doughnutInstance.current = new Chart(doughnutRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{ data: valores, backgroundColor: ['#d4af37','#b8860b','#f0d98a','#8c6f25','#5f4a17','#c8a84a','#fff1b8'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#f5e7bd', padding: 12 } } } }
            });
        }

        if (barChartInstance.current) { barChartInstance.current.destroy(); barChartInstance.current = null; }
        if (barChartRef.current) {
            barChartInstance.current = new Chart(barChartRef.current.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Receitas', 'Despesas', 'Saldo'],
                    datasets: [{
                        label: 'R$',
                        data: [resumo.receitas, resumo.despesas, resumo.saldo],
                        backgroundColor: ['#d4af37', '#d76a5f', resumo.saldo >= 0 ? '#d4af37' : '#d76a5f'],
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#bba46a' }, grid: { color: 'rgba(212,175,55,0.12)' } },
                        y: { ticks: { color: '#bba46a', callback: v => `R$ ${v.toLocaleString('pt-BR')}` }, grid: { color: 'rgba(212,175,55,0.12)' } }
                    }
                }
            });
        }
        return () => {
            if (barChartInstance.current) barChartInstance.current.destroy();
            if (doughnutInstance.current) doughnutInstance.current.destroy();
        };
    }, [aba, resumo]);

    const submitTransacao = async (e) => {
        e.preventDefault();
        if (isDemo) {
            const nova = {
                id: Date.now(),
                ...formTx,
                valor: parseFloat(formTx.valor),
                data: formTx.data ? new Date(formTx.data).toISOString() : new Date().toISOString(),
            };
            setTransacoes((prev) => [nova, ...prev]);
            setFormTx({ tipo: 'despesa', categoria: 'Alimentação', descricao: '', valor: '', data: '' });
            mostrarNotif('success', 'Transação adicionada na demonstração');
            return;
        }
        try {
            await criarTransacao({ ...formTx, valor: parseFloat(formTx.valor) });
            setFormTx({ tipo: 'despesa', categoria: 'Alimentação', descricao: '', valor: '', data: '' });
            mostrarNotif('success', 'Transação registrada');
            carregar();
        } catch (err) {
            mostrarNotif('error', err?.response?.data?.error || 'Erro ao registrar transação');
        }
    };

    const submitMeta = async (e) => {
        e.preventDefault();
        if (isDemo) {
            setMetas((prev) => [{
                id: Date.now(),
                nome: formMeta.nome,
                valorAlvo: parseFloat(formMeta.valorAlvo),
                valorAtual: 0,
                prazo: formMeta.prazo,
            }, ...prev]);
            setFormMeta({ nome: '', valorAlvo: '', prazo: '' });
            mostrarNotif('success', 'Meta criada na demonstração');
            return;
        }
        try {
            await criarMeta({ ...formMeta, valorAlvo: parseFloat(formMeta.valorAlvo) });
            setFormMeta({ nome: '', valorAlvo: '', prazo: '' });
            mostrarNotif('success', 'Meta criada');
            carregar();
        } catch (err) {
            mostrarNotif('error', err?.response?.data?.error || 'Erro ao criar meta');
        }
    };

    const submitInvestimento = async (e) => {
        e.preventDefault();
        if (isDemo) {
            setInvestimentos((prev) => [{
                id: Date.now(),
                ...formInv,
                valor: parseFloat(formInv.valor),
                taxa: parseFloat(formInv.taxa),
            }, ...prev]);
            setFormInv({ nome: '', tipo: 'CDB', valor: '', taxa: '' });
            mostrarNotif('success', 'Investimento adicionado na demonstração');
            return;
        }
        try {
            await criarInvestimento({ ...formInv, valor: parseFloat(formInv.valor), taxa: parseFloat(formInv.taxa) });
            setFormInv({ nome: '', tipo: 'CDB', valor: '', taxa: '' });
            mostrarNotif('success', 'Investimento adicionado');
            carregar();
        } catch (err) {
            mostrarNotif('error', err?.response?.data?.error || 'Erro ao adicionar investimento');
        }
    };

    const aplicarPerfil = (tipo) => {
        const perfil = perfisInvestimento[tipo] || perfisInvestimento.CDB;
        setVerificador((prev) => ({
            ...prev,
            tipo,
            percentualCdi: String(perfil.percentualCdi),
            isento: perfil.isento ? 'sim' : 'nao',
            liquidez: perfil.liquidez,
        }));
    };

    const totalInvestido = investimentos.reduce((s, i) => s + i.valor, 0);
    const rendimentoEstimado = investimentos.reduce((s, i) => s + i.valor * (i.taxa / 100), 0);
    const cdiReferencia = Number(benchmarks.cdiAnual || 10.65);
    const selicReferencia = Number(benchmarks.selicAnual || cdiReferencia);
    const diasVerificador = Math.max(1, Number.parseInt(verificador.prazoDias, 10) || 1);
    const valorVerificador = Math.max(0, Number(verificador.valor || 0));
    const taxaAnualVerificador = verificador.taxaPrefixada
        ? Number(verificador.taxaPrefixada)
        : cdiReferencia * (Number(verificador.percentualCdi || 0) / 100);
    const rendimentoBruto = valorVerificador * (Math.pow(1 + taxaAnualVerificador / 100, diasVerificador / 365) - 1);
    const aliquotaIr = irRendaFixa(diasVerificador, verificador.isento === 'sim');
    const impostoEstimado = Math.max(0, rendimentoBruto * (aliquotaIr / 100));
    const rendimentoLiquido = rendimentoBruto - impostoEstimado;
    const rentabilidadeLiquida = valorVerificador > 0 ? (rendimentoLiquido / valorVerificador) * (365 / diasVerificador) * 100 : 0;
    const equivalenteCdi = cdiReferencia > 0 ? (rentabilidadeLiquida / cdiReferencia) * 100 : 0;
    const avaliacaoInvestimento = equivalenteCdi >= 100
        ? 'Competitivo frente ao CDI no cenário informado.'
        : equivalenteCdi >= 85
            ? 'Razoável, mas compare liquidez, risco e isenção.'
            : 'Abaixo do CDI de referência; vale buscar alternativas.';

    const abas = [
        { id: 'resumo', label: 'Resumo' },
        { id: 'transacoes', label: 'Transações' },
        { id: 'metas', label: 'Metas' },
        { id: 'verificador', label: 'Verificador' },
        { id: 'investimentos', label: 'Investimentos' },
    ];

    return (
        <main className="ec-container">
            {notif && <div className={`toast ${notif.type}`}>{notif.message}</div>}

            <div className="ec-fin-tabs">
                {abas.map(a => (
                    <button key={a.id} className={`ec-fin-tab${aba === a.id ? ' active' : ''}`} onClick={() => setAba(a.id)}>
                        {a.label}
                    </button>
                ))}
            </div>

            {aba === 'resumo' && (
                <>
                    <div className="ec-indicadores-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Total Receitas</div>
                            <div className="ec-indicador-valor ec-positivo">{carregando ? '...' : fmt(resumo?.receitas || 0)}</div>
                            <div className="ec-indicador-sub">Entradas registradas</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Total Despesas</div>
                            <div className="ec-indicador-valor ec-negativo">{carregando ? '...' : fmt(resumo?.despesas || 0)}</div>
                            <div className="ec-indicador-sub">Saídas registradas</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Saldo Atual</div>
                            <div className={`ec-indicador-valor ${(resumo?.saldo || 0) >= 0 ? 'ec-positivo' : 'ec-negativo'}`}>
                                {carregando ? '...' : fmt(resumo?.saldo || 0)}
                            </div>
                            <div className="ec-indicador-sub">Receitas - Despesas</div>
                        </div>
                    </div>

                    {resumo?.alertas?.length > 0 && (
                        <div className="ec-card ec-alerta-card">
                            <h3>Alertas</h3>
                            {resumo.alertas.map((a, i) => (
                                <div key={i} className="ec-alerta-item">{a}</div>
                            ))}
                        </div>
                    )}

                    <div className="ec-fin-charts-grid">
                        <div className="ec-card">
                            <h3>Entradas vs Saídas</h3>
                            <div className="ec-chart-container" style={{ height: 220 }}>
                                <canvas ref={barChartRef}></canvas>
                            </div>
                        </div>
                        <div className="ec-card">
                            <h3>Gastos por Categoria</h3>
                            <div className="ec-chart-container" style={{ height: 220 }}>
                                {resumo && Object.keys(resumo.gastosPorCategoria).length > 0
                                    ? <canvas ref={doughnutRef}></canvas>
                                    : <div className="ec-vazio">Nenhuma despesa registrada ainda.</div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="ec-card">
                        <h3>Últimas 5 transações</h3>
                        {transacoes.slice(0, 5).length === 0
                            ? <div className="ec-vazio">Nenhuma transação registrada.</div>
                            : transacoes.slice(0, 5).map(t => (
                                <div key={t.id} className="ec-historico-item">
                                    <div className="ec-historico-dot" style={{ background: t.tipo === 'receita' ? 'var(--c-success)' : 'var(--c-danger)' }}></div>
                                    <div className="ec-historico-info">
                                        <div className="ec-historico-acao">{t.categoria} — {t.descricao}</div>
                                        <div className="ec-historico-desc">{new Date(t.data).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div className={t.tipo === 'receita' ? 'ec-positivo' : 'ec-negativo'} style={{ fontWeight: 600 }}>
                                        {t.tipo === 'receita' ? '+' : '-'}{fmt(t.valor)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </>
            )}

            {aba === 'transacoes' && (
                <>
                    <div className="ec-card">
                        <h3>Nova Transação</h3>
                        <form className="ec-fin-form" onSubmit={submitTransacao}>
                            <div className="ec-fin-form-row">
                                <div className="ec-fin-field">
                                    <label>Tipo</label>
                                    <select className="ec-select" value={formTx.tipo} onChange={e => setFormTx(p => ({ ...p, tipo: e.target.value, categoria: e.target.value === 'receita' ? 'Salário' : 'Alimentação' }))}>
                                        <option value="despesa">Despesa</option>
                                        <option value="receita">Receita</option>
                                    </select>
                                </div>
                                <div className="ec-fin-field">
                                    <label>Categoria</label>
                                    <select className="ec-select" value={formTx.categoria} onChange={e => setFormTx(p => ({ ...p, categoria: e.target.value }))}>
                                        {(formTx.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="ec-fin-field" style={{ flex: 2 }}>
                                    <label>Descrição</label>
                                    <input className="ec-input" placeholder="Ex: Supermercado" value={formTx.descricao} onChange={e => setFormTx(p => ({ ...p, descricao: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Valor (R$)</label>
                                    <input className="ec-input" type="number" min="0.01" step="0.01" placeholder="0,00" value={formTx.valor} onChange={e => setFormTx(p => ({ ...p, valor: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Data</label>
                                    <input className="ec-input" type="date" value={formTx.data} onChange={e => setFormTx(p => ({ ...p, data: e.target.value }))} />
                                </div>
                            </div>
                            <button className="ec-btn" type="submit">Registrar</button>
                        </form>
                    </div>

                    <div className="ec-card">
                        <div className="ec-card-header">
                            <h3 style={{ margin: 0 }}>Histórico</h3>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <label style={{ color: 'var(--c4)', fontSize: '0.85rem' }}>Filtrar mês:</label>
                                <input className="ec-input" type="month" value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ width: 160 }} />
                                {filtroMes && <button className="ec-btn ec-btn-sec" onClick={() => setFiltroMes('')}>Limpar</button>}
                            </div>
                        </div>
                        {transacoes.length === 0
                            ? <div className="ec-vazio">Nenhuma transação encontrada.</div>
                            : transacoes.map(t => (
                                <div key={t.id} className="ec-historico-item">
                                    <div className="ec-historico-dot" style={{ background: t.tipo === 'receita' ? 'var(--c-success)' : 'var(--c-danger)' }}></div>
                                    <div className="ec-historico-info">
                                        <div className="ec-historico-acao">{t.categoria} — {t.descricao}</div>
                                        <div className="ec-historico-desc">{new Date(t.data).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span className={t.tipo === 'receita' ? 'ec-positivo' : 'ec-negativo'} style={{ fontWeight: 600 }}>
                                            {t.tipo === 'receita' ? '+' : '-'}{fmt(t.valor)}
                                        </span>
                                        <button className="ec-btn-delete" onClick={async () => { if (isDemo) { setTransacoes(prev => prev.filter(item => item.id !== t.id)); return; } await deletarTransacao(t.id); carregar(); }} title="Remover">&#10005;</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </>
            )}

            {aba === 'metas' && (
                <>
                    <div className="ec-card">
                        <h3>Nova Meta</h3>
                        <form className="ec-fin-form" onSubmit={submitMeta}>
                            <div className="ec-fin-form-row">
                                <div className="ec-fin-field" style={{ flex: 2 }}>
                                    <label>Nome da meta</label>
                                    <input className="ec-input" placeholder="Ex: Reserva de emergência" value={formMeta.nome} onChange={e => setFormMeta(p => ({ ...p, nome: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Valor alvo (R$)</label>
                                    <input className="ec-input" type="number" min="1" step="0.01" placeholder="0,00" value={formMeta.valorAlvo} onChange={e => setFormMeta(p => ({ ...p, valorAlvo: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Prazo</label>
                                    <input className="ec-input" type="date" value={formMeta.prazo} onChange={e => setFormMeta(p => ({ ...p, prazo: e.target.value }))} required />
                                </div>
                            </div>
                            <button className="ec-btn" type="submit">Criar Meta</button>
                        </form>
                    </div>

                    <div className="ec-metas-lista">
                        {metas.length === 0
                            ? <div className="ec-card ec-vazio">Nenhuma meta criada ainda.</div>
                            : metas.map(m => {
                                const perc = Math.min(100, (m.valorAtual / m.valorAlvo) * 100);
                                const diasRestantes = Math.ceil((new Date(m.prazo) - Date.now()) / 86400000);
                                return (
                                    <div key={m.id} className="ec-card ec-meta-card">
                                        <div className="ec-meta-header">
                                            <span className="ec-meta-nome">{m.nome}</span>
                                            <button className="ec-btn-delete" onClick={async () => { if (isDemo) { setMetas(prev => prev.filter(item => item.id !== m.id)); return; } await deletarMeta(m.id); carregar(); }} title="Remover">&#10005;</button>
                                        </div>
                                        <div className="ec-meta-valores">
                                            <span>{fmt(m.valorAtual)} <span style={{ color: 'var(--c4)' }}>de {fmt(m.valorAlvo)}</span></span>
                                            <span style={{ color: diasRestantes < 0 ? 'var(--c-danger)' : 'var(--c4)', fontSize: '0.85rem' }}>
                                                {diasRestantes < 0 ? 'Prazo vencido' : `${diasRestantes}d restantes`}
                                            </span>
                                        </div>
                                        <div className="ec-meta-barra-bg">
                                            <div className="ec-meta-barra-fill" style={{ width: `${perc}%`, background: perc >= 100 ? 'var(--c-success)' : 'var(--c-gold)' }}></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                                            <input className="ec-input" type="number" min="0" step="0.01" placeholder="Atualizar valor atual" style={{ flex: 1 }}
                                                onBlur={async (e) => { if (e.target.value) { const valorAtual = parseFloat(e.target.value); if (isDemo) { setMetas(prev => prev.map(item => item.id === m.id ? { ...item, valorAtual } : item)); e.target.value = ''; return; } await atualizarMeta(m.id, valorAtual); e.target.value = ''; carregar(); } }} />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </>
            )}

            {aba === 'verificador' && (
                <>
                    <section className="investment-check-hero">
                        <div>
                            <span className="eyebrow">Verificador de investimentos</span>
                            <h1>Compare CDI, prazo, imposto e liquidez antes de aplicar.</h1>
                            <p>
                                Use como simulação educativa: ajuste taxa, prazo, isenção e valor para comparar
                                CDB, LCI, LCA, Tesouro Selic e fundos DI.
                            </p>
                        </div>
                        <div className="benchmark-grid">
                            <article>
                                <span>CDI referência</span>
                                <strong>{cdiReferencia.toFixed(2)}% a.a.</strong>
                            </article>
                            <article>
                                <span>Selic referência</span>
                                <strong>{selicReferencia.toFixed(2)}% a.a.</strong>
                            </article>
                            <article>
                                <span>Atualização</span>
                                <strong>{benchmarks.lastUpdate ? new Date(benchmarks.lastUpdate).toLocaleDateString('pt-BR') : 'Cache local'}</strong>
                            </article>
                        </div>
                    </section>

                    <div className="investment-check-grid">
                        <div className="ec-card">
                            <h2>Cenário de aplicação</h2>
                            <p>Selecione um perfil ou informe uma taxa prefixada para substituir o percentual do CDI.</p>

                            <div className="investment-profile-row">
                                {Object.keys(perfisInvestimento).map((tipo) => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        className={verificador.tipo === tipo ? 'active' : ''}
                                        onClick={() => aplicarPerfil(tipo)}
                                    >
                                        {tipo}
                                    </button>
                                ))}
                            </div>

                            <div className="ec-fin-form-row" style={{ flexWrap: 'wrap', gap: 16, marginTop: 18 }}>
                                <div className="ec-fin-field">
                                    <label>Valor aplicado</label>
                                    <input className="ec-input" type="number" min="0" step="100" value={verificador.valor} onChange={(e) => setVerificador(p => ({ ...p, valor: e.target.value }))} />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Prazo em dias</label>
                                    <input className="ec-input" type="number" min="1" step="30" value={verificador.prazoDias} onChange={(e) => setVerificador(p => ({ ...p, prazoDias: e.target.value }))} />
                                </div>
                                <div className="ec-fin-field">
                                    <label>% do CDI</label>
                                    <input className="ec-input" type="number" min="0" step="1" value={verificador.percentualCdi} onChange={(e) => setVerificador(p => ({ ...p, percentualCdi: e.target.value, taxaPrefixada: '' }))} />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Taxa prefixada a.a. opcional</label>
                                    <input className="ec-input" type="number" min="0" step="0.01" value={verificador.taxaPrefixada} onChange={(e) => setVerificador(p => ({ ...p, taxaPrefixada: e.target.value }))} placeholder="Ex: 12.35" />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Isento de IR?</label>
                                    <select className="ec-select" value={verificador.isento} onChange={(e) => setVerificador(p => ({ ...p, isento: e.target.value }))}>
                                        <option value="nao">Não</option>
                                        <option value="sim">Sim</option>
                                    </select>
                                </div>
                                <div className="ec-fin-field">
                                    <label>Liquidez</label>
                                    <input className="ec-input" value={verificador.liquidez} onChange={(e) => setVerificador(p => ({ ...p, liquidez: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div className="ec-card investment-result-card">
                            <span className="eyebrow">Resultado estimado</span>
                            <h2>{avaliacaoInvestimento}</h2>
                            <div className="investment-result-list">
                                <div><span>Taxa usada</span><strong>{taxaAnualVerificador.toFixed(2)}% a.a.</strong></div>
                                <div><span>Rendimento bruto</span><strong>{fmt(rendimentoBruto)}</strong></div>
                                <div><span>IR estimado</span><strong>{aliquotaIr.toFixed(1)}% / {fmt(impostoEstimado)}</strong></div>
                                <div><span>Rendimento líquido</span><strong>{fmt(rendimentoLiquido)}</strong></div>
                                <div><span>Equivalente líquido</span><strong>{equivalenteCdi.toFixed(1)}% do CDI</strong></div>
                                <div><span>Liquidez</span><strong>{verificador.liquidez}</strong></div>
                            </div>
                            <p>
                                {perfisInvestimento[verificador.tipo]?.risco || 'Compare risco, prazo, emissor, garantia, liquidez e tributação antes de decidir.'}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {aba === 'investimentos' && (
                <>
                    <div className="ec-indicadores-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Total Investido</div>
                            <div className="ec-indicador-valor ec-positivo">{fmt(totalInvestido)}</div>
                            <div className="ec-indicador-sub">{investimentos.length} aplicações</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Rendimento Estimado (anual)</div>
                            <div className="ec-indicador-valor ec-positivo">+ {fmt(rendimentoEstimado)}</div>
                            <div className="ec-indicador-sub">Baseado nas taxas cadastradas</div>
                        </div>
                    </div>

                    <div className="ec-card">
                        <h3>Novo Investimento</h3>
                        <form className="ec-fin-form" onSubmit={submitInvestimento}>
                            <div className="ec-fin-form-row">
                                <div className="ec-fin-field" style={{ flex: 2 }}>
                                    <label>Nome</label>
                                    <input className="ec-input" placeholder="Ex: Tesouro Selic 2027" value={formInv.nome} onChange={e => setFormInv(p => ({ ...p, nome: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Tipo</label>
                                    <select className="ec-select" value={formInv.tipo} onChange={e => setFormInv(p => ({ ...p, tipo: e.target.value }))}>
                                        {TIPOS_INVESTIMENTO.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="ec-fin-field">
                                    <label>Valor (R$)</label>
                                    <input className="ec-input" type="number" min="0.01" step="0.01" placeholder="0,00" value={formInv.valor} onChange={e => setFormInv(p => ({ ...p, valor: e.target.value }))} required />
                                </div>
                                <div className="ec-fin-field">
                                    <label>Taxa anual (%)</label>
                                    <input className="ec-input" type="number" min="0" step="0.01" placeholder="Ex: 12.5" value={formInv.taxa} onChange={e => setFormInv(p => ({ ...p, taxa: e.target.value }))} required />
                                </div>
                            </div>
                            <button className="ec-btn" type="submit">Adicionar</button>
                        </form>
                    </div>

                    <div className="ec-card">
                        <h3>Carteira</h3>
                        {investimentos.length === 0
                            ? <div className="ec-vazio">Nenhum investimento cadastrado.</div>
                            : investimentos.map(inv => (
                                <div key={inv.id} className="ec-historico-item">
                                    <div className="ec-historico-dot" style={{ background: 'var(--c-gold)' }}></div>
                                    <div className="ec-historico-info">
                                        <div className="ec-historico-acao">{inv.nome}</div>
                                        <div className="ec-historico-desc">{inv.tipo} — {inv.taxa}% a.a.</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--c5)' }}>{fmt(inv.valor)}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--c-success)' }}>+{fmt(inv.valor * (inv.taxa / 100))}/ano</div>
                                        </div>
                                        <button className="ec-btn-delete" onClick={async () => { if (isDemo) { setInvestimentos(prev => prev.filter(item => item.id !== inv.id)); return; } await deletarInvestimento(inv.id); carregar(); }} title="Remover">&#10005;</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </>
            )}
        </main>
    );
};

export default Financeiro;
