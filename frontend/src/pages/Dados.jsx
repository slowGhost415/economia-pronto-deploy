import { useState } from 'react';
import { carregarDadosStorage, calcularVariacaoPercentual } from '../data/dadosEconomicos';

const Dados = () => {
    const [dados] = useState(() => carregarDadosStorage());
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [abaAtiva, setAbaAtiva] = useState('precos');
    const d = dados.dadosEconomicos;
    const chavesOrdenadas = Object.keys(d.produtos);

    const periodosFiltrados = filtroPeriodo
        ? d.periodos.map((p, i) => ({ p, i })).filter(({ p }) => p.toLowerCase().includes(filtroPeriodo.toLowerCase()))
        : d.periodos.map((p, i) => ({ p, i }));

    const exportarCSV = () => {
        const nomes = chavesOrdenadas.map(k => d.produtos[k].nome);
        const header = ['Período', ...nomes, 'Selic (%)'];
        const rows = d.periodos.map((periodo, idx) => {
            const valores = chavesOrdenadas.map(k => d.produtos[k].dados[idx].toFixed(2));
            return [periodo, ...valores, d.selic[idx].toFixed(2)];
        });
        const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dados_analise_cariri.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const variacoes = chavesOrdenadas.map(chave => {
        const produto = d.produtos[chave];
        const inicial = produto.dados[0];
        const final = produto.dados[produto.dados.length - 1];
        const delta = final - inicial;
        const perc = calcularVariacaoPercentual(inicial, final);
        const maxVal = Math.max(...produto.dados);
        const minVal = Math.min(...produto.dados);
        return { chave, produto, inicial, final, delta, perc, maxVal, minVal };
    }).sort((a, b) => b.perc - a.perc);

    const maioresAltas = variacoes.slice(0, 3);
    const maioresQuedas = [...variacoes].sort((a, b) => a.perc - b.perc).slice(0, 3);
    const selicAtual = d.selic[d.selic.length - 1];
    const selicInicial = d.selic[0];
    const selicVar = selicInicial ? (((selicAtual - selicInicial) / selicInicial) * 100) : 0;
    const ipcaAcum = d.inflacao.reduce((a, b) => a + b, 0);

    const abas = [
        { id: 'precos', label: 'Preços Mensais' },
        { id: 'variacoes', label: 'Variações' },
        { id: 'selic', label: 'Selic & Inflação' },
    ];

    return (
        <main className="ec-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
                <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                    <div className="ec-indicador-label">Selic atual</div>
                    <div className="ec-indicador-valor">{selicAtual?.toFixed(2)}%</div>
                    <div className="ec-indicador-sub" style={{ color: selicVar >= 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                        {selicVar >= 0 ? '+' : ''}{selicVar.toFixed(1)}% no período
                    </div>
                </div>
                <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                    <div className="ec-indicador-label">IPCA acumulado</div>
                    <div className="ec-indicador-valor">{ipcaAcum.toFixed(2)}%</div>
                    <div className="ec-indicador-sub">{d.periodos[0]} — {d.periodos[d.periodos.length - 1]}</div>
                </div>
                <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                    <div className="ec-indicador-label">Maior alta</div>
                    <div className="ec-indicador-valor" style={{ fontSize: '1.1rem', color: 'var(--c-danger)' }}>
                        {maioresAltas[0]?.produto.nome}
                    </div>
                    <div className="ec-indicador-sub" style={{ color: 'var(--c-danger)' }}>
                        +{maioresAltas[0]?.perc.toFixed(1)}%
                    </div>
                </div>
                <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                    <div className="ec-indicador-label">Produtos monitorados</div>
                    <div className="ec-indicador-valor">{chavesOrdenadas.length}</div>
                    <div className="ec-indicador-sub">{d.periodos.length} meses de histórico</div>
                </div>
            </div>

            <div className="ec-fin-tabs" style={{ marginBottom: 20 }}>
                {abas.map(a => (
                    <button key={a.id} className={`ec-fin-tab${abaAtiva === a.id ? ' active' : ''}`} onClick={() => setAbaAtiva(a.id)}>
                        {a.label}
                    </button>
                ))}
            </div>

            {abaAtiva === 'precos' && (
                <div className="ec-card">
                    <div className="ec-card-header">
                        <h2 style={{ margin: 0 }}>Preços Mensais</h2>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                className="ec-input"
                                style={{ margin: 0, width: 160 }}
                                placeholder="Filtrar período..."
                                value={filtroPeriodo}
                                onChange={e => setFiltroPeriodo(e.target.value)}
                            />
                            <button className="ec-btn ec-btn-sec" onClick={exportarCSV}>Exportar CSV</button>
                            <button className="ec-btn ec-btn-sec" onClick={() => window.print()}>Imprimir</button>
                        </div>
                    </div>
                    <p style={{ marginBottom: 16, color: 'var(--c4)', fontSize: '0.88rem' }}>
                        Valores em R$ por período. {filtroPeriodo && <span style={{ color: 'var(--c-gold)' }}>{periodosFiltrados.length} resultado(s) filtrado(s).</span>}
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="ec-table">
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    {chavesOrdenadas.map(k => (
                                        <th key={k} style={{ color: d.produtos[k].cor }}>{d.produtos[k].nome}</th>
                                    ))}
                                    <th>Selic (%)</th>
                                    <th>IPCA (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodosFiltrados.map(({ p, i: idx }) => {
                                    const isLast = idx === d.periodos.length - 1;
                                    return (
                                        <tr key={p} style={isLast ? { background: 'rgba(255,255,255,0.03)' } : {}}>
                                            <td style={{ fontWeight: isLast ? 700 : 400, color: isLast ? 'var(--c5)' : undefined }}>{p}</td>
                                            {chavesOrdenadas.map(k => {
                                                const val = d.produtos[k].dados[idx];
                                                const prev = idx > 0 ? d.produtos[k].dados[idx - 1] : val;
                                                const subiu = val > prev;
                                                const caiu = val < prev;
                                                return (
                                                    <td key={k} style={{ color: subiu ? 'var(--c-danger)' : caiu ? 'var(--c-success)' : undefined }}>
                                                        {val.toFixed(2)}
                                                        {subiu && <span style={{ fontSize: '0.65rem', marginLeft: 3, opacity: 0.7 }}>▲</span>}
                                                        {caiu && <span style={{ fontSize: '0.65rem', marginLeft: 3, opacity: 0.7 }}>▼</span>}
                                                    </td>
                                                );
                                            })}
                                            <td>{d.selic[idx]?.toFixed(2)}%</td>
                                            <td>{d.inflacao[idx]?.toFixed(2)}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {abaAtiva === 'variacoes' && (
                <div className="ec-card">
                    <h2>Variações no Período</h2>
                    <p style={{ color: 'var(--c4)', fontSize: '0.88rem', marginBottom: 20 }}>
                        Comparativo entre {d.periodos[0]} e {d.periodos[d.periodos.length - 1]}.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                        <div style={{ background: 'rgba(224,82,82,0.07)', border: '1px solid rgba(224,82,82,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-danger)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Top 3 maiores altas</div>
                            {maioresAltas.map(v => (
                                <div key={v.chave} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: '0.88rem', color: 'var(--c5)' }}>{v.produto.nome}</span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--c-danger)' }}>+{v.perc.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: 'rgba(76,175,125,0.07)', border: '1px solid rgba(76,175,125,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-success)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Top 3 menores variações</div>
                            {maioresQuedas.map(v => (
                                <div key={v.chave} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: '0.88rem', color: 'var(--c5)' }}>{v.produto.nome}</span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--c-success)' }}>{v.perc >= 0 ? '+' : ''}{v.perc.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className="ec-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Inicial</th>
                                    <th>Final</th>
                                    <th>Min.</th>
                                    <th>Max.</th>
                                    <th>Variação</th>
                                    <th style={{ minWidth: 160 }}>Barra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variacoes.map(({ chave, produto, inicial, final, delta, perc, minVal, maxVal }) => {
                                    const barW = Math.min(100, Math.abs(perc) * 2);
                                    return (
                                        <tr key={chave}>
                                            <td style={{ fontWeight: 600, color: produto.cor }}>{produto.nome}</td>
                                            <td>R$ {inicial.toFixed(2)}</td>
                                            <td>R$ {final.toFixed(2)}</td>
                                            <td style={{ color: 'var(--c-success)' }}>R$ {minVal.toFixed(2)}</td>
                                            <td style={{ color: 'var(--c-danger)' }}>R$ {maxVal.toFixed(2)}</td>
                                            <td className={perc >= 0 ? 'ec-positivo' : 'ec-negativo'}>
                                                {perc >= 0 ? '+' : ''}{perc.toFixed(2)}%
                                            </td>
                                            <td>
                                                <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', minWidth: 120 }}>
                                                    <div style={{ height: '100%', width: `${barW}%`, background: perc >= 0 ? 'var(--c-danger)' : 'var(--c-success)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {abaAtiva === 'selic' && (
                <div className="ec-card">
                    <h2>Selic & Inflação</h2>
                    <p style={{ color: 'var(--c4)', fontSize: '0.88rem', marginBottom: 20 }}>
                        Histórico mensal da Taxa Selic e do IPCA (fonte: Banco Central do Brasil / IBGE).
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="ec-table">
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Selic (%)</th>
                                    <th>IPCA (%)</th>
                                    <th>Spread</th>
                                    <th style={{ minWidth: 180 }}>Selic — barra</th>
                                    <th style={{ minWidth: 180 }}>IPCA — barra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {d.periodos.map((periodo, idx) => {
                                    const selic = d.selic[idx];
                                    const ipca = d.inflacao[idx];
                                    const spread = selic - ipca;
                                    const maxSelic = Math.max(...d.selic);
                                    const maxIpca = Math.max(...d.inflacao);
                                    return (
                                        <tr key={periodo}>
                                            <td style={{ fontWeight: 600 }}>{periodo}</td>
                                            <td style={{ color: 'var(--c-success)', fontWeight: 600 }}>{selic?.toFixed(2)}%</td>
                                            <td style={{ color: ipca > 5 ? 'var(--c-danger)' : 'var(--c4)', fontWeight: 600 }}>{ipca?.toFixed(2)}%</td>
                                            <td style={{ color: spread >= 0 ? 'var(--c-success)' : 'var(--c-danger)', fontWeight: 600 }}>
                                                {spread >= 0 ? '+' : ''}{spread.toFixed(2)}%
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${(selic / maxSelic) * 100}%`, background: 'var(--c-success)', borderRadius: 99 }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--c4)', minWidth: 40 }}>{selic?.toFixed(2)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${(ipca / maxIpca) * 100}%`, background: ipca > 5 ? 'var(--c-danger)' : 'var(--c4)', borderRadius: 99 }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--c4)', minWidth: 40 }}>{ipca?.toFixed(2)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Dados;
