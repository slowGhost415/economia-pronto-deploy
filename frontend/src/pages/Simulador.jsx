import { useState, useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler } from 'chart.js';
import EconomicOrb from '../components/EconomicOrb';
import SmartTaxSearch from '../components/SmartTaxSearch';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Tooltip, Filler);

const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const calcJurosCompostos = (principal, taxaMensal, meses) => {
    const serie = [];
    let acumulado = principal;
    for (let i = 1; i <= meses; i++) {
        acumulado = acumulado * (1 + taxaMensal / 100);
        serie.push(parseFloat(acumulado.toFixed(2)));
    }
    return serie;
};

const calcComAporte = (principal, aporte, taxaMensal, meses) => {
    const serie = [];
    let acumulado = principal;
    for (let i = 1; i <= meses; i++) {
        acumulado = acumulado * (1 + taxaMensal / 100) + aporte;
        serie.push(parseFloat(acumulado.toFixed(2)));
    }
    return serie;
};

const Simulador = () => {
    const [principal, setPrincipal] = useState('10000');
    const [taxa, setTaxa] = useState('12');
    const [meses, setMeses] = useState('24');
    const [aporte, setAporte] = useState('500');
    const [taxaBase, setTaxaBase] = useState('mensal');
    const [resultado, setResultado] = useState(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    const calcular = () => {
        const p = parseFloat(principal) || 0;
        const t = parseFloat(taxa) || 0;
        const m = parseInt(meses) || 12;
        const ap = parseFloat(aporte) || 0;
        const taxaMensal = taxaBase === 'anual' ? (Math.pow(1 + t / 100, 1 / 12) - 1) * 100 : t;

        const serieSemAporte = calcJurosCompostos(p, taxaMensal, m);
        const serieComAporte = calcComAporte(p, ap, taxaMensal, m);

        const finalSem = serieSemAporte[serieSemAporte.length - 1];
        const finalCom = serieComAporte[serieComAporte.length - 1];
        const totalAportado = p + ap * m;
        const rendimento = finalCom - totalAportado;

        setResultado({ serieSemAporte, serieComAporte, finalSem, finalCom, totalAportado, rendimento, taxaMensal });
    };

    useEffect(() => {
        if (!resultado || !chartRef.current) return;
        if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
        const labels = Array.from({ length: resultado.serieSemAporte.length }, (_, i) => `M${i + 1}`);
        chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Sem aportes',
                        data: resultado.serieSemAporte,
                        borderColor: '#4A5C6A',
                        backgroundColor: 'rgba(74,92,106,0.15)',
                        tension: 0.35, pointRadius: 0, fill: true,
                    },
                    {
                        label: 'Com aportes mensais',
                        data: resultado.serieComAporte,
                        borderColor: '#c9a84c',
                        backgroundColor: 'rgba(201,168,76,0.15)',
                        tension: 0.35, pointRadius: 0, fill: true,
                    },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#CCD0CF' } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } }
                },
                scales: {
                    x: { ticks: { color: '#9BA8AB', maxTicksLimit: 12 }, grid: { color: '#253745' } },
                    y: { ticks: { color: '#9BA8AB', callback: v => `R$ ${(v / 1000).toFixed(0)}k` }, grid: { color: '#253745' } }
                }
            }
        });
        return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [resultado]);

    const mesesOpcoes = [6, 12, 24, 36, 60, 120, 240, 360];

    return (
        <main className="ec-container">
            <section className="simulator-hero">
                <div>
                    <span className="eyebrow">Laboratorio economico</span>
                    <h1>Simule patrimonio, custo real e impacto tributario.</h1>
                    <p>Compare juros compostos, aportes e precificacao com impostos em uma unica area de decisao.</p>
                </div>
                <div className="mini-orb">
                    <EconomicOrb compact />
                </div>
            </section>

            <SmartTaxSearch />

            <div className="ec-card">
                <h2>Simulador Financeiro</h2>
                <p>Projete o crescimento do seu patrimônio com juros compostos.</p>
                <div className="ec-fin-form-row" style={{ flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
                    <div className="ec-fin-field">
                        <label>Capital inicial (R$)</label>
                        <input className="ec-input" type="number" min="0" step="100" value={principal} onChange={e => setPrincipal(e.target.value)} />
                    </div>
                    <div className="ec-fin-field">
                        <label>Aporte mensal (R$)</label>
                        <input className="ec-input" type="number" min="0" step="50" value={aporte} onChange={e => setAporte(e.target.value)} />
                    </div>
                    <div className="ec-fin-field">
                        <label>Taxa de juros (%)</label>
                        <input className="ec-input" type="number" min="0" step="0.1" value={taxa} onChange={e => setTaxa(e.target.value)} />
                    </div>
                    <div className="ec-fin-field">
                        <label>Periodicidade da taxa</label>
                        <select className="ec-select" value={taxaBase} onChange={e => setTaxaBase(e.target.value)}>
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                        </select>
                    </div>
                    <div className="ec-fin-field">
                        <label>Período</label>
                        <select className="ec-select" value={meses} onChange={e => setMeses(e.target.value)}>
                            {mesesOpcoes.map(m => (
                                <option key={m} value={m}>{m >= 12 ? `${m / 12} ano${m / 12 > 1 ? 's' : ''}` : `${m} meses`}</option>
                            ))}
                        </select>
                    </div>
                    <div className="ec-fin-field" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
                        <button className="ec-btn" onClick={calcular}>Simular</button>
                    </div>
                </div>
            </div>

            {resultado && (
                <>
                    <div className="ec-indicadores-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Saldo final (sem aportes)</div>
                            <div className="ec-indicador-valor ec-positivo">{fmt(resultado.finalSem)}</div>
                            <div className="ec-indicador-sub">Apenas juros compostos</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Saldo final (com aportes)</div>
                            <div className="ec-indicador-valor ec-positivo">{fmt(resultado.finalCom)}</div>
                            <div className="ec-indicador-sub">Capital + aportes + juros</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Total aportado</div>
                            <div className="ec-indicador-valor">{fmt(resultado.totalAportado)}</div>
                            <div className="ec-indicador-sub">Capital + aportes mensais</div>
                        </div>
                        <div className="ec-indicador-card">
                            <div className="ec-indicador-label">Rendimento líquido</div>
                            <div className="ec-indicador-valor ec-positivo">+{fmt(resultado.rendimento)}</div>
                            <div className="ec-indicador-sub">Ganho sobre o aportado</div>
                        </div>
                    </div>

                    <div className="ec-card">
                        <h3>Projeção de crescimento</h3>
                        <div className="ec-chart-container" style={{ height: 300 }}>
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>

                    <div className="ec-card">
                        <h3>Comparativo mensal</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="ec-table">
                                <thead>
                                    <tr>
                                        <th>Mês</th>
                                        <th>Sem aportes</th>
                                        <th>Com aportes</th>
                                        <th>Diferença</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.serieSemAporte.filter((_, i) => i % Math.ceil(resultado.serieSemAporte.length / 12) === 0 || i === resultado.serieSemAporte.length - 1).map((val, idx, arr) => {
                                        const realIdx = resultado.serieSemAporte.indexOf(val);
                                        const comAporte = resultado.serieComAporte[realIdx];
                                        return (
                                            <tr key={realIdx}>
                                                <td>Mês {realIdx + 1}</td>
                                                <td>{fmt(val)}</td>
                                                <td>{fmt(comAporte)}</td>
                                                <td className="ec-positivo">+{fmt(comAporte - val)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </main>
    );
};

export default Simulador;
