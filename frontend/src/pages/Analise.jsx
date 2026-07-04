import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Title,
    Tooltip,
    Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
    carregarDadosStorage,
    salvarDadosStorage,
    obterProdutos,
    calcularTendencia,
    calcularVariacaoPercentual,
    calculoCorrelacaoPearson,
    atualizarSelicAPI,
    buscarIndicadoresBCB,
    pesquisarProduto
} from '../data/dadosEconomicos';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend, Title, Tooltip, Filler, zoomPlugin);

const Analise = () => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const [dados, setDados] = useState(() => carregarDadosStorage());
    const [selecao, setSelecao] = useState(() => {
        const prods = Object.keys(carregarDadosStorage().dadosEconomicos.produtos);
        return prods.slice(0, 4);
    });
    const [chkPrecos, setChkPrecos] = useState(true);
    const [chkSelic, setChkSelic] = useState(true);
    const [chkInflacao, setChkInflacao] = useState(true);
    const [periodo, setPeriodo] = useState('12');
    const [busca, setBusca] = useState('');
    const [resultadosBusca, setResultadosBusca] = useState([]);
    const [buscaFocada, setBuscaFocada] = useState(false);
    const [produtoDestaque, setProdutoDestaque] = useState(null);
    const inputBuscaRef = useRef(null);
    const [prodA, setProdA] = useState('');
    const [prodB, setProdB] = useState('');
    const [comparacaoInfo, setComparacaoInfo] = useState(null);
    const [analiseText, setAnaliseText] = useState('');
    const [dataAtualizacao, setDataAtualizacao] = useState('');

    const getPeriodoRange = useCallback((d) => {
        const total = d.dadosEconomicos.periodos.length;
        if (periodo === 'all') return { start: 0, end: total };
        const num = parseInt(periodo, 10) || 12;
        return { start: Math.max(0, total - num), end: total };
    }, [periodo]);

    useEffect(() => {
        const prods = Object.keys(dados.dadosEconomicos.produtos);
        if (!prodA) setProdA(prods[0] || '');
        if (!prodB) setProdB(prods[1] || prods[0] || '');
        if (dados.meta?.lastUpdate) {
            setDataAtualizacao(new Date(dados.meta.lastUpdate).toLocaleString('pt-BR'));
        }
    }, [dados]);

    useEffect(() => {
        if (!prodA || !prodB) return;
        const d = dados.dadosEconomicos;
        const pA = d.produtos[prodA];
        const pB = d.produtos[prodB];
        if (!pA || !pB) return;
        const serieA = pA.dados;
        const serieB = pB.dados;
        const corr = calculoCorrelacaoPearson(serieA, serieB);
        const sentido = corr > 0.6 ? 'forte positiva' : corr > 0.1 ? 'moderada positiva' : corr < -0.6 ? 'forte negativa' : corr < -0.1 ? 'moderada negativa' : 'fraca';
        const minA = Math.min(...serieA), maxA = Math.max(...serieA);
        const minB = Math.min(...serieB), maxB = Math.max(...serieB);
        const iniA = serieA[0], fimA = serieA[serieA.length - 1];
        const iniB = serieB[0], fimB = serieB[serieB.length - 1];
        const varA = iniA ? (((fimA - iniA) / iniA) * 100) : 0;
        const varB = iniB ? (((fimB - iniB) / iniB) * 100) : 0;
        let interpretacao = '';
        if (corr > 0.6) interpretacao = `${pA.nome} e ${pB.nome} sobem e descem juntos — provavelmente sofrem dos mesmos fatores de custo (ex: logística, câmbio ou commodities).`;
        else if (corr > 0.1) interpretacao = `Há uma relação moderada entre os dois produtos. Movimentos em ${pA.nome} tendem a ser seguidos parcialmente por ${pB.nome}.`;
        else if (corr < -0.6) interpretacao = `Correlação negativa forte: quando ${pA.nome} sobe, ${pB.nome} tende a cair. Podem disputar o mesmo orçamento do consumidor.`;
        else if (corr < -0.1) interpretacao = `Relação inversa moderada entre os produtos no período analisado.`;
        else interpretacao = `Os preços de ${pA.nome} e ${pB.nome} se moveram de forma independente no período — pouca influência mútua detectada.`;
        setComparacaoInfo({ corr, sentido, pA, pB, minA, maxA, minB, maxB, varA, varB, fimA, fimB, interpretacao, serieA, serieB });
    }, [prodA, prodB, dados]);

    useEffect(() => {
        const d = dados.dadosEconomicos;
        const tendSelic = calcularTendencia(d.selic);
        const tendInflacao = calcularTendencia(d.inflacao);

        const selicAtual = d.selic[d.selic.length - 1];
        const selicInicio = d.selic[0];
        const ipcaAtual = d.inflacao[d.inflacao.length - 1];
        const ipcaInicio = d.inflacao[0];
        const varSelic = selicInicio ? (((selicAtual - selicInicio) / selicInicio) * 100).toFixed(1) : '0.0';
        const varIpca = ipcaInicio ? (((ipcaAtual - ipcaInicio) / ipcaInicio) * 100).toFixed(1) : '0.0';

        const nomes = selecao.slice(0, 3).map(k => d.produtos[k]?.nome).filter(Boolean);
        const lista = nomes.length ? nomes.join(', ') : 'nenhum produto selecionado';

        const variacoesProdutos = selecao.map(k => {
            const prod = d.produtos[k];
            if (!prod) return null;
            const ini = prod.dados[0];
            const fim = prod.dados[prod.dados.length - 1];
            const perc = ini ? (((fim - ini) / ini) * 100).toFixed(1) : '0.0';
            return { nome: prod.nome, perc: parseFloat(perc) };
        }).filter(Boolean);

        const maisCaro = variacoesProdutos.sort((a, b) => b.perc - a.perc)[0];

        let linhas = [];

        linhas.push(`Periodo analisado: ${d.periodos[0]} a ${d.periodos[d.periodos.length - 1]}.`);
        linhas.push(`Taxa Selic: ${selicAtual?.toFixed(2)}% (${tendSelic === 'alta' ? 'subiu' : tendSelic === 'queda' ? 'caiu' : 'estavel'} ${Math.abs(varSelic)}% no periodo).`);
        linhas.push(`Inflacao (IPCA): ${ipcaAtual?.toFixed(2)}% (${tendInflacao === 'alta' ? 'subiu' : tendInflacao === 'queda' ? 'caiu' : 'estavel'} ${Math.abs(varIpca)}% no periodo).`);

        if (nomes.length > 0) {
            linhas.push(`Produtos monitorados: ${lista}.`);
        }
        if (maisCaro) {
            const dir = maisCaro.perc >= 0 ? 'maior alta' : 'maior queda';
            linhas.push(`${dir === 'maior alta' ? 'Maior alta' : 'Maior queda'} entre os selecionados: ${maisCaro.nome} (${maisCaro.perc > 0 ? '+' : ''}${maisCaro.perc.toFixed(1)}%).`);
        }

        if (tendSelic === 'alta' && tendInflacao === 'alta') {
            linhas.push('Cenario de alta da Selic com inflacao crescente: credito mais caro e pressao sobre precos de consumo.');
        } else if (tendSelic === 'queda' && tendInflacao === 'queda') {
            linhas.push('Cenario favoravel: juros e inflacao em queda estimulam consumo e ampliam o poder de compra.');
        } else if (tendSelic === 'alta' && tendInflacao === 'queda') {
            linhas.push('Selic em alta enquanto a inflacao recua: politica monetaria contracionista com efeito positivo sobre os precos.');
        } else if (tendSelic === 'queda' && tendInflacao === 'alta') {
            linhas.push('Atencao: inflacao subindo com Selic em queda pode indicar pressao futura sobre o poder de compra.');
        } else {
            linhas.push('Indicadores relativamente estaveis no periodo. Acompanhe as proximas leituras para identificar novas tendencias.');
        }

        setAnaliseText(linhas.join('\n'));
    }, [selecao, chkSelic, chkInflacao, dados, periodo]);

    useEffect(() => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const d = dados.dadosEconomicos;
        const range = getPeriodoRange(dados);
        const labels = d.periodos.slice(range.start, range.end);
        const datasets = [];

        if (chkPrecos) {
            selecao.forEach(chave => {
                const produto = d.produtos[chave];
                if (!produto) return;
                datasets.push({
                    label: produto.nome,
                    data: produto.dados.slice(range.start, range.end),
                    borderColor: produto.cor,
                    backgroundColor: produto.cor + '33',
                    yAxisID: 'preco',
                    tension: 0.35,
                    pointRadius: 4,
                    pointHoverRadius: 6
                });
            });
        }

        if (chkSelic) {
            datasets.push({
                label: 'Selic (%)',
                data: d.selic.slice(range.start, range.end),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231,76,60,0.15)',
                yAxisID: 'taxa',
                tension: 0.35,
                pointRadius: 4,
                borderDash: [6, 4]
            });
        }

        if (chkInflacao) {
            datasets.push({
                label: 'Inflação (IPCA)',
                data: d.inflacao.slice(range.start, range.end),
                borderColor: '#1abc9c',
                backgroundColor: 'rgba(26,188,156,0.15)',
                yAxisID: 'taxa',
                tension: 0.35,
                pointRadius: 4,
                borderDash: [4, 4]
            });
        }

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 14 } },
                    title: { display: true, text: 'Comparativo de Preços, Selic e Inflação', font: { size: 16, weight: 'bold' } },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: ctx => {
                                const val = ctx.parsed.y;
                                const unit = ctx.dataset.yAxisID === 'preco' ? 'R$' : '%';
                                return `${ctx.dataset.label}: ${unit} ${val.toFixed(2)}`;
                            },
                            afterBody: ctx => {
                                const idx = ctx[0]?.dataIndex;
                                const texto = d.contexto[idx + range.start];
                                return texto ? [`Contexto: ${texto}`] : [];
                            }
                        }
                    },
                    zoom: {
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
                        pan: { enabled: true, mode: 'x', modifierKey: 'ctrl' }
                    }
                },
                scales: {
                    x: { display: true, title: { display: true, text: 'Período' } },
                    preco: {
                        type: 'linear',
                        display: chkPrecos,
                        position: 'left',
                        title: { display: true, text: 'Preço (R$)' }
                    },
                    taxa: {
                        type: 'linear',
                        display: chkSelic || chkInflacao,
                        position: 'right',
                        title: { display: true, text: 'Taxa (%)' },
                        grid: { drawOnChartArea: false }
                    }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });
    }, [dados, selecao, chkPrecos, chkSelic, chkInflacao, periodo, getPeriodoRange]);

    const handleBuscaChange = (valor) => {
        setBusca(valor);
        if (valor.trim().length >= 1) {
            const resultados = pesquisarProduto(valor);
            setResultadosBusca(resultados.slice(0, 6));
        } else {
            setResultadosBusca([]);
        }
    };

    const selecionarResultado = (produto) => {
        if (!selecao.includes(produto.chave)) setSelecao(prev => [...prev, produto.chave]);
        setProdutoDestaque(produto.chave);
        setBusca('');
        setResultadosBusca([]);
        setTimeout(() => setProdutoDestaque(null), 2500);
    };

    const handleBusca = () => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return;
        const produto = obterProdutos().find(p =>
            p.nome.toLowerCase().includes(termo) || p.chave.toLowerCase().includes(termo)
        );
        if (!produto) { alert(`Produto não encontrado: "${termo}".`); return; }
        if (!selecao.includes(produto.chave)) setSelecao(prev => [...prev, produto.chave]);
    };

    const handleAtualizarAPI = async () => {
        await buscarIndicadoresBCB(true);
        const atualizado = await atualizarSelicAPI(dados, true);
        setDados({ ...atualizado });
        salvarDadosStorage(atualizado);
        if (atualizado.meta?.lastUpdate) {
            setDataAtualizacao(new Date(atualizado.meta.lastUpdate).toLocaleString('pt-BR'));
        }
    };

    const exportarPNG = () => {
        if (!chartRef.current) return;
        const url = chartRef.current.toBase64Image();
        const link = document.createElement('a');
        link.href = url;
        link.download = 'grafico_analise.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const produtos = obterProdutos();

    return (
        <main className="ec-container">
            <div className="ec-card">
                <h2>Configuração da Análise</h2>

                <p>Escolha quais variáveis devem ser exibidas no gráfico e quais produtos você quer comparar.</p>
                <div className="ec-flex">
                    <div className="ec-flex-item">
                        <h3>Variáveis</h3>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkPrecos} onChange={e => setChkPrecos(e.target.checked)} /> Preços</label>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkSelic} onChange={e => setChkSelic(e.target.checked)} /> Selic</label>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkInflacao} onChange={e => setChkInflacao(e.target.checked)} /> Inflação (IPCA)</label>
                    </div>
                    <div className="ec-flex-item">
                        <h3>Período</h3>
                        <select className="ec-select" value={periodo} onChange={e => setPeriodo(e.target.value)}>
                            <option value="12">Últimos 12 meses</option>
                            <option value="6">Últimos 6 meses</option>
                            <option value="3">Últimos 3 meses</option>
                            <option value="all">Todo histórico</option>
                        </select>
                        <button className="ec-btn" onClick={handleAtualizarAPI}>Atualizar dados (API)</button>
                        <div style={{ marginTop: 10, fontSize: '0.9em', color: 'var(--c3)' }}>
                            <span>Última atualização: </span><span>{dataAtualizacao || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ec-card">
                <h2>Seleção de Produtos</h2>
                <p>Pesquise qualquer produto pelo nome, categoria ou sinônimos. O sistema encontra automaticamente os dados disponíveis.</p>

                <div style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c3)', fontSize: '1rem', pointerEvents: 'none' }}>🔍</div>
                            <input
                                ref={inputBuscaRef}
                                type="text"
                                className="ec-input"
                                style={{ margin: 0, paddingLeft: 40 }}
                                placeholder="Pesquisar: arroz, combustível, energia, internet..."
                                value={busca}
                                onChange={e => handleBuscaChange(e.target.value)}
                                onFocus={() => setBuscaFocada(true)}
                                onBlur={() => setTimeout(() => setBuscaFocada(false), 180)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && resultadosBusca.length > 0) selecionarResultado(resultadosBusca[0]);
                                    if (e.key === 'Escape') { setBusca(''); setResultadosBusca([]); }
                                }}
                                autoComplete="off"
                            />
                            {busca && (
                                <button onClick={() => { setBusca(''); setResultadosBusca([]); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--c3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                            )}
                        </div>
                        <button className="ec-btn ec-btn-sec" onClick={() => { setSelecao(obterProdutos().map(p => p.chave)); }}>Todos</button>
                        <button className="ec-btn ec-btn-sec" onClick={() => setSelecao([])}>Limpar</button>
                    </div>

                    {buscaFocada && resultadosBusca.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--c1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', marginTop: 6, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                            {resultadosBusca.map((prod, i) => {
                                const jaAtivo = selecao.includes(prod.chave);
                                const ini = prod.dados[0];
                                const fim = prod.dados[prod.dados.length - 1];
                                const perc = ini ? (((fim - ini) / ini) * 100) : 0;
                                return (
                                    <div key={prod.chave} onMouseDown={() => selecionarResultado(prod)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: i < resultadosBusca.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: jaAtivo ? 'rgba(155,168,171,0.06)' : 'transparent', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = jaAtivo ? 'rgba(155,168,171,0.06)' : 'transparent'}
                                    >
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: prod.cor, flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--c5)', fontSize: '0.9rem' }}>{prod.nome}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--c4)' }}>{prod.categoria}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--c5)' }}>R$ {fim.toFixed(2)}</div>
                                            <div style={{ fontSize: '0.75rem', color: perc >= 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>{perc >= 0 ? '+' : ''}{perc.toFixed(1)}%</div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: jaAtivo ? 'var(--c-success)' : 'var(--c3)', flexShrink: 0, width: 60, textAlign: 'right' }}>
                                            {jaAtivo ? '✓ ativo' : '+ adicionar'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {buscaFocada && busca.trim().length >= 2 && resultadosBusca.length === 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--c1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', marginTop: 6, padding: '14px 16px', boxShadow: 'var(--shadow-md)' }}>
                            <div style={{ color: 'var(--c3)', fontSize: '0.88rem' }}>Nenhum produto encontrado para "<strong style={{ color: 'var(--c4)' }}>{busca}</strong>".</div>
                            <div style={{ color: 'var(--c3)', fontSize: '0.78rem', marginTop: 4 }}>Tente: arroz, carne, gasolina, energia, internet...</div>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--c4)', fontWeight: 600 }}>{selecao.length} produto(s) selecionado(s)</span>
                    {selecao.length > 0 && selecao.map(chave => {
                        const prod = dados.dadosEconomicos.produtos[chave];
                        if (!prod) return null;
                        return (
                            <span key={chave} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${prod.cor}55`, borderRadius: 99, fontSize: '0.78rem', color: 'var(--c5)' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: prod.cor, display: 'inline-block' }} />
                                {prod.nome}
                                <button onClick={() => setSelecao(prev => prev.filter(x => x !== chave))} style={{ background: 'none', border: 'none', color: 'var(--c3)', cursor: 'pointer', fontSize: '0.8rem', padding: 0, lineHeight: 1, marginLeft: 2 }}>✕</button>
                            </span>
                        );
                    })}
                </div>

                <div className="ec-produtos-lista">
                    {[...new Set(obterProdutos().map(p => p.categoria))].map(cat => (
                        <div key={cat}>
                            <h3>{cat}</h3>
                            {obterProdutos().filter(p => p.categoria === cat).map(prod => {
                                const ativo = selecao.includes(prod.chave);
                                const destaque = produtoDestaque === prod.chave;
                                const ini = prod.dados[0];
                                const fim = prod.dados[prod.dados.length - 1];
                                const perc = ini ? (((fim - ini) / ini) * 100) : 0;
                                return (
                                    <label key={prod.chave}
                                        className={`ec-produto-checkbox${ativo ? ' active' : ''}`}
                                        style={destaque ? { outline: `2px solid ${prod.cor}`, outlineOffset: 2, transition: 'outline 0.3s' } : {}}
                                    >
                                        <input type="checkbox" checked={ativo}
                                            onChange={e => {
                                                if (e.target.checked) setSelecao(prev => [...prev, prod.chave]);
                                                else setSelecao(prev => prev.filter(x => x !== prod.chave));
                                            }}
                                        />
                                        <span style={{ flex: 1 }}>{prod.nome}</span>
                                        {ativo && (
                                            <span style={{ fontSize: '0.72rem', color: perc >= 0 ? 'var(--c-danger)' : 'var(--c-success)', fontWeight: 700, marginLeft: 'auto' }}>
                                                {perc >= 0 ? '+' : ''}{perc.toFixed(1)}%
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="ec-card">
                <h2>Gráfico Interativo</h2>
                <div className="ec-chart-actions">
                    <button className="ec-btn ec-btn-sec" onClick={exportarPNG}>Exportar PNG</button>
                    <button className="ec-btn ec-btn-sec" onClick={() => window.print()}>Imprimir relatório</button>
                </div>
                <div className="ec-chart-container">
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>

            <div className="ec-card">
                <h2>Comparação Produto vs Produto</h2>
                <p>Selecione dois produtos para comparar métricas de preço e calcular a correlação entre eles.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--c5)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Produto A</label>
                        <select className="ec-select" value={prodA} onChange={e => setProdA(e.target.value)}>
                            {produtos.map(p => <option key={p.chave} value={p.chave}>{p.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--c5)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Produto B</label>
                        <select className="ec-select" value={prodB} onChange={e => setProdB(e.target.value)}>
                            {produtos.map(p => <option key={p.chave} value={p.chave}>{p.nome}</option>)}
                        </select>
                    </div>
                </div>

                {comparacaoInfo && (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                            <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">Correlação (r)</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.6rem', color: comparacaoInfo.corr > 0.3 ? 'var(--c-success)' : comparacaoInfo.corr < -0.3 ? 'var(--c-danger)' : 'var(--c4)' }}>
                                    {comparacaoInfo.corr.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub">{comparacaoInfo.sentido}</div>
                            </div>
                            <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">{comparacaoInfo.pA.nome}</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.5rem' }}>
                                    R$ {comparacaoInfo.fimA.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub" style={{ color: comparacaoInfo.varA >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
                                    {comparacaoInfo.varA >= 0 ? '+' : ''}{comparacaoInfo.varA.toFixed(1)}% no período
                                </div>
                            </div>
                            <div className="ec-indicador-card" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">{comparacaoInfo.pB.nome}</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.5rem' }}>
                                    R$ {comparacaoInfo.fimB.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub" style={{ color: comparacaoInfo.varB >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
                                    {comparacaoInfo.varB >= 0 ? '+' : ''}{comparacaoInfo.varB.toFixed(1)}% no período
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                            <div className="ec-indicador-card" style={{ padding: '16px 20px' }}>
                                <div className="ec-indicador-label" style={{ marginBottom: 12 }}>Amplitude de preço</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { label: comparacaoInfo.pA.nome, min: comparacaoInfo.minA, max: comparacaoInfo.maxA, cor: comparacaoInfo.pA.cor },
                                        { label: comparacaoInfo.pB.nome, min: comparacaoInfo.minB, max: comparacaoInfo.maxB, cor: comparacaoInfo.pB.cor }
                                    ].map(item => {
                                        const globalMax = Math.max(comparacaoInfo.maxA, comparacaoInfo.maxB);
                                        const pctMin = (item.min / globalMax) * 100;
                                        const pctMax = (item.max / globalMax) * 100;
                                        return (
                                            <div key={item.label}>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--c4)', marginBottom: 4 }}>{item.label}</div>
                                                <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
                                                    <div style={{ position: 'absolute', left: `${pctMin}%`, width: `${pctMax - pctMin}%`, height: '100%', background: item.cor, borderRadius: 99, opacity: 0.85 }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--c3)', marginTop: 3 }}>
                                                    <span>Min: R$ {item.min.toFixed(2)}</span>
                                                    <span>Max: R$ {item.max.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="ec-indicador-card" style={{ padding: '16px 20px' }}>
                                <div className="ec-indicador-label" style={{ marginBottom: 12 }}>Evolução mês a mês</div>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                                    {comparacaoInfo.serieA.map((vA, i) => {
                                        const vB = comparacaoInfo.serieB[i];
                                        const allVals = [...comparacaoInfo.serieA, ...comparacaoInfo.serieB];
                                        const maxV = Math.max(...allVals);
                                        const hA = (vA / maxV) * 56;
                                        const hB = (vB / maxV) * 56;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                <div style={{ width: '45%', height: hA, background: comparacaoInfo.pA.cor, borderRadius: '3px 3px 0 0', opacity: 0.85 }} title={`${comparacaoInfo.pA.nome}: R$ ${vA}`} />
                                                <div style={{ width: '45%', height: hB, background: comparacaoInfo.pB.cor, borderRadius: '3px 3px 0 0', opacity: 0.85 }} title={`${comparacaoInfo.pB.nome}: R$ ${vB}`} />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--c4)' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 2, background: comparacaoInfo.pA.cor }} />
                                        {comparacaoInfo.pA.nome}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--c4)' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 2, background: comparacaoInfo.pB.cor }} />
                                        {comparacaoInfo.pB.nome}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ec-insights" style={{ marginTop: 12 }}>
                            {comparacaoInfo.interpretacao}
                        </div>
                    </>
                )}
            </div>

            <div className="ec-card">
                <h2>Análise Automática</h2>
                <div className="ec-insights">
                    {analiseText
                        ? analiseText.split('\n').map((linha, i) => (
                            <div key={i} style={{ marginBottom: i < analiseText.split('\n').length - 1 ? 8 : 0 }}>{linha}</div>
                        ))
                        : <div style={{ color: 'var(--c3)' }}>Selecione ao menos um produto para gerar a análise.</div>
                    }
                </div>
            </div>
        </main>
    );
};

export default Analise;
