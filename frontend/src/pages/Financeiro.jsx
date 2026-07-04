import { useEffect, useState, useRef } from 'react';
import {
    listarTransacoes, criarTransacao, deletarTransacao, resumoFinanceiro,
    listarMetas, criarMeta, atualizarMeta, deletarMeta,
    listarInvestimentos, criarInvestimento, deletarInvestimento
} from '../services/financeiroService';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Legend, Title, Tooltip, ArcElement, DoughnutController } from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Legend, Title, Tooltip, ArcElement, DoughnutController);

const CATEGORIAS_DESPESA = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Outros'];
const CATEGORIAS_RECEITA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const TIPOS_INVESTIMENTO = ['Renda Fixa', 'Tesouro Direto', 'CDB', 'Ações', 'FIIs', 'Criptomoedas', 'Outros'];

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Financeiro = () => {
    const [aba, setAba] = useState('dashboard');
    const [resumo, setResumo] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [metas, setMetas] = useState([]);
    const [investimentos, setInvestimentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [notif, setNotif] = useState(null);

    const [formTx, setFormTx] = useState({ tipo: 'despesa', categoria: 'Alimentação', descricao: '', valor: '', data: '' });
    const [formMeta, setFormMeta] = useState({ nome: '', valorAlvo: '', prazo: '' });
    const [formInv, setFormInv] = useState({ nome: '', tipo: 'Renda Fixa', valor: '', taxa: '' });
    const [filtroMes, setFiltroMes] = useState('');

    const barChartRef = useRef(null);
    const doughnutRef = useRef(null);
    const barChartInstance = useRef(null);
    const doughnutInstance = useRef(null);

    const mostrarNotif = (type, message) => {
        setNotif({ type, message });
        setTimeout(() => setNotif(null), 3000);
    };

    const carregar = async () => {
        setCarregando(true);
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

    useEffect(() => { carregar(); }, [filtroMes]);

    useEffect(() => {
        if (aba !== 'dashboard' || !resumo) return;
        const labels = Object.keys(resumo.gastosPorCategoria);
        const valores = Object.values(resumo.gastosPorCategoria);

        if (doughnutInstance.current) { doughnutInstance.current.destroy(); doughnutInstance.current = null; }
        if (doughnutRef.current && labels.length > 0) {
            doughnutInstance.current = new Chart(doughnutRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{ data: valores, backgroundColor: ['#4A5C6A','#9BA8AB','#CCD0CF','#253745','#6B7C88','#3D5166','#8FA0A8'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#CCD0CF', padding: 12 } } } }
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
                        backgroundColor: ['#4caf7d', '#e05252', resumo.saldo >= 0 ? '#4caf7d' : '#e05252'],
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { color: '#9BA8AB' }, grid: { color: '#253745' } },
                        y: { ticks: { color: '#9BA8AB', callback: v => `R$ ${v.toLocaleString('pt-BR')}` }, grid: { color: '#253745' } }
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
        try {
            await criarInvestimento({ ...formInv, valor: parseFloat(formInv.valor), taxa: parseFloat(formInv.taxa) });
            setFormInv({ nome: '', tipo: 'Renda Fixa', valor: '', taxa: '' });
            mostrarNotif('success', 'Investimento adicionado');
            carregar();
        } catch (err) {
            mostrarNotif('error', err?.response?.data?.error || 'Erro ao adicionar investimento');
        }
    };

    const totalInvestido = investimentos.reduce((s, i) => s + i.valor, 0);
    const rendimentoEstimado = investimentos.reduce((s, i) => s + i.valor * (i.taxa / 100), 0);

    const abas = [
        { id: 'dashboard', label: 'Resumo' },
        { id: 'transacoes', label: 'Transações' },
        { id: 'metas', label: 'Metas' },
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

            {aba === 'dashboard' && (
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
                                        <button className="ec-btn-delete" onClick={async () => { await deletarTransacao(t.id); carregar(); }} title="Remover">&#10005;</button>
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
                                            <button className="ec-btn-delete" onClick={async () => { await deletarMeta(m.id); carregar(); }} title="Remover">&#10005;</button>
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
                                                onBlur={async (e) => { if (e.target.value) { await atualizarMeta(m.id, parseFloat(e.target.value)); e.target.value = ''; carregar(); } }} />
                                        </div>
                                    </div>
                                );
                            })
                        }
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
                                        <button className="ec-btn-delete" onClick={async () => { await deletarInvestimento(inv.id); carregar(); }} title="Remover">&#10005;</button>
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
