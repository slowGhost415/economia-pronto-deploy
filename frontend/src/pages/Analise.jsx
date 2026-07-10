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

const periodHighlightPlugin = {
    id: 'periodHighlight',
    beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea || !scales?.x || !chart.data.labels?.length) return;
        const labels = chart.data.labels;
        const startIndex = Math.max(0, labels.length - 3);
        const startX = scales.x.getPixelForValue(startIndex);
        const endX = chartArea.right;
        ctx.save();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.055)';
        ctx.fillRect(startX, chartArea.top, endX - startX, chartArea.bottom - chartArea.top);
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, chartArea.top);
        ctx.lineTo(startX, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
    },
    afterDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        ctx.save();
        ctx.fillStyle = '#91a3ba';
        ctx.font = '600 11px Manrope, sans-serif';
        ctx.fillText('recorte recente', chartArea.right - 92, chartArea.top + 16);
        ctx.restore();
    }
};

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

    useEffect(() => {
        document.title = 'Economic | Análise econômica, Selic, inflação e indicadores';
        let description = document.querySelector('meta[name="description"]');
        if (!description) {
            description = document.createElement('meta');
            description.setAttribute('name', 'description');
            document.head.appendChild(description);
        }
        description.setAttribute(
            'content',
            'Página de análise econômica com Selic, IPCA, inflação, preços, indicadores, gráficos, fontes e interpretação do cenário brasileiro.'
        );
    }, []);

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
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: produto.cor,
                    pointBorderColor: '#050505',
                    pointBorderWidth: 2
                });
            });
        }

        if (chkSelic) {
            datasets.push({
                label: 'Selic (%)',
                data: d.selic.slice(range.start, range.end),
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212,175,55,0.14)',
                yAxisID: 'taxa',
                tension: 0.35,
                pointRadius: 4,
                borderWidth: 3,
                pointBackgroundColor: '#d4af37',
                pointBorderColor: '#050505',
                pointBorderWidth: 2,
                borderDash: [6, 4]
            });
        }

        if (chkInflacao) {
            datasets.push({
                label: 'Inflação (IPCA)',
                data: d.inflacao.slice(range.start, range.end),
                borderColor: '#f2c866',
                backgroundColor: 'rgba(215,164,67,0.14)',
                yAxisID: 'taxa',
                tension: 0.35,
                pointRadius: 4,
                borderWidth: 3,
                pointBackgroundColor: '#f2c866',
                pointBorderColor: '#050505',
                pointBorderWidth: 2,
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
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e8e2d3',
                            usePointStyle: true,
                            padding: 18,
                            boxWidth: 10,
                            boxHeight: 10,
                            font: { size: 13, weight: '600' }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Preços, Selic e IPCA no período selecionado',
                        color: '#f3efe5',
                        padding: { bottom: 18 },
                        font: { size: 18, weight: 'bold' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(13, 17, 16, 0.97)',
                        borderColor: 'rgba(212, 175, 55, 0.28)',
                        borderWidth: 1,
                        titleColor: '#f3efe5',
                        bodyColor: '#e8e2d3',
                        padding: 12,
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
                    x: {
                        display: true,
                        title: { display: true, text: 'Período', color: '#c8b98b', font: { weight: '700' } },
                        ticks: { color: '#c8b98b', maxRotation: 0, autoSkipPadding: 18 },
                        grid: { color: 'rgba(211,220,232,0.07)', drawBorder: false }
                    },
                    preco: {
                        type: 'linear',
                        display: chkPrecos,
                        position: 'left',
                        title: { display: true, text: 'Preço (R$)', color: '#c8b98b', font: { weight: '700' } },
                        ticks: { color: '#c8b98b' },
                        grid: { color: 'rgba(211,220,232,0.08)', drawBorder: false }
                    },
                    taxa: {
                        type: 'linear',
                        display: chkSelic || chkInflacao,
                        position: 'right',
                        title: { display: true, text: 'Taxa (%)', color: '#c8b98b', font: { weight: '700' } },
                        ticks: { color: '#c8b98b' },
                        grid: { drawOnChartArea: false, drawBorder: false }
                    }
                },
                interaction: { mode: 'index', intersect: false }
            },
            plugins: [periodHighlightPlugin]
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

    const resetarZoom = () => {
        if (chartRef.current?.resetZoom) chartRef.current.resetZoom();
    };

    const produtos = obterProdutos();
    const dadosEconomicos = dados.dadosEconomicos;
    const rangeAtual = getPeriodoRange(dados);
    const periodoInicio = dadosEconomicos.periodos[rangeAtual.start] || dadosEconomicos.periodos[0] || '-';
    const periodoFim = dadosEconomicos.periodos[rangeAtual.end - 1] || dadosEconomicos.periodos[dadosEconomicos.periodos.length - 1] || '-';
    const selicAtual = dadosEconomicos.selic[dadosEconomicos.selic.length - 1];
    const inflacaoAtual = dadosEconomicos.inflacao[dadosEconomicos.inflacao.length - 1];
    const produtosSelecionados = selecao
        .map(chave => dadosEconomicos.produtos[chave])
        .filter(Boolean);
    const produtosResumo = produtosSelecionados.slice(0, 3).map(prod => prod.nome).join(', ');
    const seriesAtivas = [
        chkPrecos && 'Preços',
        chkSelic && 'Selic',
        chkInflacao && 'IPCA'
    ].filter(Boolean);
    const formatarVariacaoPontos = (serie) => {
        const recorte = serie.slice(rangeAtual.start, rangeAtual.end);
        if (recorte.length < 2) return null;
        const inicial = recorte[0];
        const final = recorte[recorte.length - 1];
        const delta = final - inicial;
        if (!Number.isFinite(delta) || Math.abs(delta) < 0.005) {
            return { direcao: 'neutra', texto: 'Estável no período' };
        }
        return {
            direcao: delta > 0 ? 'alta' : 'queda',
            texto: `${delta > 0 ? '+' : ''}${delta.toFixed(2)} p.p. no período`
        };
    };
    const variacaoSelicPeriodo = formatarVariacaoPontos(dadosEconomicos.selic);
    const variacaoInflacaoPeriodo = formatarVariacaoPontos(dadosEconomicos.inflacao);
    const statusVariacao = (variacao) => {
        if (!variacao) return 'Sem leitura';
        if (variacao.direcao === 'alta') return 'Alta';
        if (variacao.direcao === 'queda') return 'Queda';
        return 'Estável';
    };
    const calcularVariacaoSeriePercentual = (serie) => {
        const recorte = serie.slice(rangeAtual.start, rangeAtual.end);
        if (recorte.length < 2) return 0;
        const inicial = recorte[0];
        const final = recorte[recorte.length - 1];
        if (!inicial) return 0;
        return calcularVariacaoPercentual(inicial, final);
    };
    const variacoesProdutosPeriodo = produtosSelecionados
        .map(prod => ({
            nome: prod.nome,
            variacao: calcularVariacaoSeriePercentual(prod.dados)
        }))
        .sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao));
    const produtoMaiorMovimento = variacoesProdutosPeriodo[0];
    const interpretacaoSelic = variacaoSelicPeriodo?.direcao === 'alta'
        ? 'Juros mais altos tendem a encarecer crédito, financiamentos e parcelamentos.'
        : variacaoSelicPeriodo?.direcao === 'queda'
            ? 'Juros em queda podem aliviar o custo do crédito e estimular consumo e investimento.'
            : 'Selic estável sugere uma política monetária sem mudança relevante no recorte escolhido.';
    const interpretacaoInflacao = variacaoInflacaoPeriodo?.direcao === 'alta'
        ? 'Inflação em alta pressiona o orçamento e reduz o poder de compra.'
        : variacaoInflacaoPeriodo?.direcao === 'queda'
            ? 'Inflação em queda melhora a previsibilidade dos preços e ajuda o consumo.'
            : 'Inflação estável indica menor mudança no ritmo de preços no período.';
    const indicadoresAnalise = [
        {
            nome: 'Taxa Selic',
            valor: `${selicAtual?.toFixed(2)}%`,
            variacao: variacaoSelicPeriodo,
            descricao: 'Referência da última leitura disponível para juros básicos.',
            fonte: 'Fonte: BCB / SGS',
            atualizacao: dataAtualizacao
        },
        {
            nome: 'Inflação IPCA',
            valor: `${inflacaoAtual?.toFixed(2)}%`,
            variacao: variacaoInflacaoPeriodo,
            descricao: 'Inflação mensal monitorada na série carregada.',
            fonte: 'Fonte: BCB / SGS',
            atualizacao: dataAtualizacao
        },
        {
            nome: 'Produtos em análise',
            valor: produtosSelecionados.length,
            descricao: produtosResumo || 'Nenhum produto selecionado',
            fonte: 'Fonte: base local de preços',
            atualizacao: dataAtualizacao
        },
        {
            nome: 'Séries ativas',
            valor: `${seriesAtivas.length}/3`,
            descricao: seriesAtivas.length ? seriesAtivas.join(', ') : 'Nenhuma série ativa',
            fonte: 'Fonte: seleção atual do usuário',
            atualizacao: dataAtualizacao
        }
    ];
    const indicadoresEstruturais = [
        {
            nome: 'Selic',
            valor: `${selicAtual?.toFixed(2)}%`,
            status: 'Disponível',
            variacao: statusVariacao(variacaoSelicPeriodo),
            historico: `${periodoInicio} - ${periodoFim}`,
            fonte: 'BCB / SGS',
            atualizacao: dataAtualizacao || 'Aguardando atualização',
            explicacao: 'Taxa básica de juros usada como referência para crédito, renda fixa e decisões do Banco Central.',
            impacto: 'Afeta financiamentos, cartão, empréstimos, investimentos conservadores e custo das empresas.',
            interpretacao: interpretacaoSelic,
            disponivel: true
        },
        {
            nome: 'IPCA',
            valor: `${inflacaoAtual?.toFixed(2)}%`,
            status: 'Disponível',
            variacao: statusVariacao(variacaoInflacaoPeriodo),
            historico: `${periodoInicio} - ${periodoFim}`,
            fonte: 'BCB / SGS',
            atualizacao: dataAtualizacao || 'Aguardando atualização',
            explicacao: 'Indicador de inflação ao consumidor usado para acompanhar a variação geral de preços.',
            impacto: 'Mostra quanto o dinheiro perde ou ganha poder de compra ao longo do tempo.',
            interpretacao: interpretacaoInflacao,
            disponivel: true
        },
        {
            nome: 'Dólar',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Histórico futuro',
            fonte: 'Previsto: BCB PTAX / SGS',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Câmbio usado como referência para produtos importados, combustíveis e insumos dolarizados.',
            impacto: 'Pode afetar eletrônicos, trigo, combustíveis, viagens e custos de empresas.',
            interpretacao: 'Quando a série for conectada, este card poderá comparar câmbio com preços e inflação.',
            disponivel: false
        },
        {
            nome: 'Euro',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Histórico futuro',
            fonte: 'Previsto: fonte cambial oficial',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Moeda relevante para importações, viagens, contratos e comparação internacional.',
            impacto: 'Ajuda a entender custos ligados à Europa e variações de produtos importados.',
            interpretacao: 'Reservado para uma leitura futura de câmbio internacional.',
            disponivel: false
        },
        {
            nome: 'PIB',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Série futura',
            fonte: 'Previsto: IBGE',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Mede a produção de bens e serviços da economia.',
            impacto: 'Ajuda a avaliar crescimento, renda, emprego e atividade econômica.',
            interpretacao: 'Quando conectado, deve contextualizar se o cenário é de expansão ou desaceleração.',
            disponivel: false
        },
        {
            nome: 'Desemprego',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Série futura',
            fonte: 'Previsto: IBGE / PNAD',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Indica a parcela da força de trabalho que procura emprego e não encontra ocupação.',
            impacto: 'Afeta renda das famílias, consumo, inadimplência e pressão social.',
            interpretacao: 'Reservado para conectar mercado de trabalho ao consumo monitorado.',
            disponivel: false
        },
        {
            nome: 'Inflação acumulada',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'A definir',
            fonte: 'Previsto: série IPCA validada',
            atualizacao: 'Não calculado nesta etapa',
            explicacao: 'Mostra o efeito composto da inflação em um intervalo, como 12 meses.',
            impacto: 'Ajuda a traduzir a perda acumulada do poder de compra.',
            interpretacao: 'O espaço está pronto para receber o cálculo quando a regra for definida.',
            disponivel: false
        },
        {
            nome: 'Mercado financeiro',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Indicadores futuros',
            fonte: 'Previsto: fontes de mercado',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Pode reunir bolsa, juros futuros, renda fixa e expectativas de mercado.',
            impacto: 'Ajuda a entender apetite a risco, custo de capital e expectativas econômicas.',
            interpretacao: 'Reservado para uma visão de contexto financeiro sem misturar com dados já carregados.',
            disponivel: false
        },
        {
            nome: 'Balança comercial',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Série futura',
            fonte: 'Previsto: MDIC / Comex Stat',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Compara exportações e importações do país.',
            impacto: 'Ajuda a ler pressão cambial, setor externo e demanda por produtos brasileiros.',
            interpretacao: 'Faz sentido em uma etapa posterior para complementar a leitura de câmbio.',
            disponivel: false
        },
        {
            nome: 'Dívida pública',
            valor: 'Em breve',
            status: 'Estrutura preparada',
            variacao: 'Pendente',
            historico: 'Série futura',
            fonte: 'Previsto: Tesouro Nacional',
            atualizacao: 'Não conectado nesta página',
            explicacao: 'Acompanha o endividamento do governo e seu custo ao longo do tempo.',
            impacto: 'Pode influenciar juros, risco fiscal, impostos futuros e confiança de investidores.',
            interpretacao: 'Reservado para dar contexto fiscal aos indicadores monetários.',
            disponivel: false
        }
    ];
    const indicadoresDisponiveis = indicadoresEstruturais.filter(indicador => indicador.disponivel);
    const indicadoresPlanejados = indicadoresEstruturais.filter(indicador => !indicador.disponivel);
    const pontosAtencao = [
        {
            titulo: 'Juros e crédito',
            estado: statusVariacao(variacaoSelicPeriodo),
            texto: interpretacaoSelic,
            prioridade: variacaoSelicPeriodo?.direcao === 'alta' ? 'alta' : 'normal'
        },
        {
            titulo: 'Inflação e poder de compra',
            estado: statusVariacao(variacaoInflacaoPeriodo),
            texto: interpretacaoInflacao,
            prioridade: variacaoInflacaoPeriodo?.direcao === 'alta' ? 'alta' : 'normal'
        },
        {
            titulo: 'Produtos monitorados',
            estado: produtoMaiorMovimento ? `${produtoMaiorMovimento.variacao >= 0 ? '+' : ''}${produtoMaiorMovimento.variacao.toFixed(1)}%` : 'Sem seleção',
            texto: produtoMaiorMovimento
                ? `${produtoMaiorMovimento.nome} teve o maior movimento entre os produtos selecionados no período.`
                : 'Selecione produtos para destacar pressões específicas de preço.',
            prioridade: produtoMaiorMovimento && produtoMaiorMovimento.variacao > 0 ? 'alta' : 'normal'
        },
        {
            titulo: 'Cobertura de dados',
            estado: 'Em expansão',
            texto: 'Dólar, Euro, PIB, desemprego, balança comercial e dívida pública têm estrutura visual preparada, mas ainda não estão conectados nesta página.',
            prioridade: 'neutra'
        }
    ];
    const glossarioEconomico = [
        {
            termo: 'O que é a Selic?',
            definicao: 'É a taxa básica de juros da economia brasileira. Ela orienta o custo do dinheiro no país.'
        },
        {
            termo: 'Por que a inflação importa?',
            definicao: 'Porque mostra a variação dos preços e ajuda a medir se o salário compra mais ou menos.'
        },
        {
            termo: 'Como o dólar afeta os preços?',
            definicao: 'Uma alta do dólar pode encarecer produtos importados, combustíveis e insumos usados pela indústria.'
        },
        {
            termo: 'O que significa crescimento do PIB?',
            definicao: 'Significa aumento da produção da economia. Em geral, indica mais atividade, renda e demanda.'
        },
        {
            termo: 'Como interpretar correlação?',
            definicao: 'Correlação positiva indica movimentos parecidos; negativa indica movimentos opostos; fraca indica pouca relação.'
        },
        {
            termo: 'O que é inflação acumulada?',
            definicao: 'É a soma composta da variação de preços ao longo de um intervalo, como 12 meses.'
        }
    ];
    const fontesDados = [
        {
            nome: 'Banco Central do Brasil / SGS',
            uso: 'Séries de Selic e IPCA usadas nos indicadores e nas comparações.',
            status: 'Conectado'
        },
        {
            nome: 'Base local de preços',
            uso: 'Histórico dos produtos monitorados, categorias, cores e comparações.',
            status: 'Disponível'
        },
        {
            nome: 'Fontes futuras previstas',
            uso: 'Dólar, Euro, PIB, desemprego, balança comercial, dívida pública e mercado financeiro.',
            status: 'Preparado'
        }
    ];
    const linhasAnalise = analiseText ? analiseText.split('\n') : [];
    const linhasDadosAnalise = linhasAnalise.filter(linha =>
        linha.startsWith('Periodo')
        || linha.startsWith('Taxa Selic')
        || linha.startsWith('Inflacao')
        || linha.startsWith('Produtos monitorados')
    );
    const linhasInterpretacaoAnalise = linhasAnalise.filter(linha => !linhasDadosAnalise.includes(linha));
    const chartReadingCards = [
        {
            label: 'Periodo exibido',
            value: `${periodoInicio} - ${periodoFim}`,
            text: periodo === 'all' ? 'Todo o historico disponivel' : `Ultimos ${periodo} meses`
        },
        {
            label: 'Séries na análise',
            value: `${seriesAtivas.length}`,
            text: seriesAtivas.length ? seriesAtivas.join(', ') : 'Nenhuma serie ativa'
        },
        {
            label: 'Produto em destaque',
            value: produtoMaiorMovimento?.nome || 'Aguardando selecao',
            text: produtoMaiorMovimento ? `${produtoMaiorMovimento.variacao >= 0 ? '+' : ''}${produtoMaiorMovimento.variacao.toFixed(1)}% no periodo` : 'Selecione produtos para comparar'
        }
    ];

    return (
        <main id="conteudo-principal" className="ec-container analise-page">
            <section className="analise-hero">
                <div className="analise-hero-copy">
                    <span className="eyebrow">Painel de leitura econômica</span>
                    <h1>Resumo do cenário econômico.</h1>
                    <p>
                        Leitura técnica entre dados observados, tendências, pontos de atenção
                        e impacto no consumo.
                    </p>
                </div>

                <div className="analise-hero-summary">
                    <div>
                        <span>Período em foco</span>
                        <strong>{periodoInicio} - {periodoFim}</strong>
                    </div>
                    <div>
                        <span>Produtos selecionados</span>
                        <strong>{produtosSelecionados.length || 0}</strong>
                    </div>
                    <div>
                        <span>Séries ativas</span>
                        <strong>{[chkPrecos, chkSelic, chkInflacao].filter(Boolean).length}/3</strong>
                    </div>
                </div>
            </section>

            <section id="indicadores" className="analise-section-heading">
                <div>
                    <span className="eyebrow">Indicadores principais</span>
                    <h2>Leitura rápida do cenário atual</h2>
                    <p>
                        Os cards abaixo mostram apenas informações já disponíveis na página: Selic,
                        IPCA, produtos selecionados e séries ativas na comparação.
                    </p>
                </div>
                <div className="analise-section-meta">
                    <span>Última atualização</span>
                    <strong>{dataAtualizacao || '-'}</strong>
                </div>
            </section>

            <section className="analise-kpi-grid">
                {indicadoresAnalise.map((indicador) => (
                    <article key={indicador.nome} className="ec-indicador-card analise-kpi-card">
                        <div className="analise-kpi-topline">
                            <div className="ec-indicador-label">{indicador.nome}</div>
                            {indicador.variacao && (
                                <span className={`analise-trend-chip ${indicador.variacao.direcao}`}>
                                    {indicador.variacao.direcao === 'alta' ? 'Alta' : indicador.variacao.direcao === 'queda' ? 'Queda' : 'Estável'}
                                </span>
                            )}
                        </div>
                        <div className="ec-indicador-valor">{indicador.valor}</div>
                        {indicador.variacao && (
                            <div className={`analise-kpi-variation ${indicador.variacao.direcao}`}>
                                {indicador.variacao.direcao === 'alta' ? '▲' : indicador.variacao.direcao === 'queda' ? '▼' : '●'}
                                <span>{indicador.variacao.texto}</span>
                            </div>
                        )}
                        <div className="ec-indicador-sub">{indicador.descricao}</div>
                        <div className="analise-kpi-meta">
                            <span>{indicador.fonte}</span>
                            {indicador.atualizacao && <span>Atualizado em {indicador.atualizacao}</span>}
                        </div>
                    </article>
                ))}
            </section>

            <section className="analise-economic-map">
                <div className="analise-section-heading">
                    <div>
                        <span className="eyebrow">Indicadores conectados</span>
                        <h2>Dados disponíveis agora, com interpretação econômica.</h2>
                        <p>
                            Esta área destaca o que já está disponível para análise. Fontes futuras
                            aparecem separadas para não competir com os dados reais.
                        </p>
                    </div>
                    <div className="analise-section-meta">
                        <span>Cobertura atual</span>
                        <strong>Selic + IPCA + preços</strong>
                    </div>
                </div>

                <div className="analise-economic-grid">
                    {indicadoresDisponiveis.map((indicador) => (
                        <article
                            key={indicador.nome}
                            className={`analise-economic-card${indicador.disponivel ? '' : ' is-planned'}`}
                        >
                            <div className="analise-economic-card-head">
                                <div>
                                    <span>{indicador.nome}</span>
                                    <strong>{indicador.valor}</strong>
                                </div>
                                <em>{indicador.status}</em>
                            </div>

                            <dl className="analise-economic-facts">
                                <div>
                                    <dt>Variação</dt>
                                    <dd>{indicador.variacao}</dd>
                                </div>
                                <div>
                                    <dt>Histórico</dt>
                                    <dd>{indicador.historico}</dd>
                                </div>
                                <div>
                                    <dt>Fonte</dt>
                                    <dd>{indicador.fonte}</dd>
                                </div>
                                <div>
                                    <dt>Atualização</dt>
                                    <dd>{indicador.atualizacao}</dd>
                                </div>
                            </dl>

                            <div className="analise-economic-text">
                                <p><strong>Explicação simples:</strong> {indicador.explicacao}</p>
                                <p><strong>Impacto na vida real:</strong> {indicador.impacto}</p>
                                <p><strong>Interpretação:</strong> {indicador.interpretacao}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="analise-planned-sources">
                    <div>
                        <span className="eyebrow">Fontes planejadas</span>
                        <h3>Próximas integrações para ampliar a leitura macroeconômica.</h3>
                    </div>
                    <div className="analise-planned-list">
                        {indicadoresPlanejados.map((indicador) => (
                            <span key={indicador.nome}>{indicador.nome}</span>
                        ))}
                    </div>
                </div>
            </section>

            <div className="ec-card analise-config-card">
                <h2>Monte sua leitura</h2>

                <p>Escolha os sinais econômicos e produtos que deseja comparar no cenário.</p>
                <div className="ec-flex">
                    <div className="ec-flex-item">
                        <h3>Variáveis</h3>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkPrecos} onChange={e => setChkPrecos(e.target.checked)} /> Preços</label>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkSelic} onChange={e => setChkSelic(e.target.checked)} /> Selic</label>
                        <label className="ec-checkbox"><input type="checkbox" checked={chkInflacao} onChange={e => setChkInflacao(e.target.checked)} /> Inflação (IPCA)</label>
                    </div>
                    <div className="ec-flex-item">
                        <h3>Período</h3>
                        <label className="analise-field-label" htmlFor="analise-periodo">Período analisado</label>
                        <select id="analise-periodo" className="ec-select" value={periodo} onChange={e => setPeriodo(e.target.value)}>
                            <option value="12">Últimos 12 meses</option>
                            <option value="6">Últimos 6 meses</option>
                            <option value="3">Últimos 3 meses</option>
                            <option value="all">Todo histórico</option>
                        </select>
                        <button type="button" className="ec-btn" onClick={handleAtualizarAPI}>Atualizar dados oficiais</button>
                        <div style={{ marginTop: 10, fontSize: '0.9em', color: 'var(--c3)' }}>
                            <span>Última atualização: </span><span>{dataAtualizacao || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ec-card analise-products-card">
                <h2>Cesta de produtos</h2>
                <p>Pesquise por nome, categoria ou sinônimos e adicione os itens disponíveis à comparação.</p>

                <div style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: '1 1 260px' }}>
                            <label className="analise-field-label" htmlFor="analise-busca-produto">Buscar produto</label>
                            <div aria-hidden="true" style={{ position: 'absolute', left: 14, bottom: 14, color: 'var(--c3)', fontSize: '1rem', pointerEvents: 'none' }}>⌕</div>
                            <input
                                id="analise-busca-produto"
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
                                <button type="button" aria-label="Limpar busca" onClick={() => { setBusca(''); setResultadosBusca([]); }} style={{ position: 'absolute', right: 12, bottom: 9, background: 'none', border: 'none', color: 'var(--c3)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, minWidth: 38, minHeight: 38 }}>×</button>
                            )}
                        </div>
                        <button type="button" className="ec-btn ec-btn-sec" onClick={() => { setSelecao(obterProdutos().map(p => p.chave)); }}>Todos</button>
                        <button type="button" className="ec-btn ec-btn-sec" onClick={() => setSelecao([])}>Limpar</button>
                    </div>

                    {buscaFocada && resultadosBusca.length > 0 && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--c1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', marginTop: 6, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                            {resultadosBusca.map((prod, i) => {
                                const jaAtivo = selecao.includes(prod.chave);
                                const ini = prod.dados[0];
                                const fim = prod.dados[prod.dados.length - 1];
                                const perc = ini ? (((fim - ini) / ini) * 100) : 0;
                                return (
                                    <button
                                        type="button"
                                        key={prod.chave}
                                        className="analise-search-result"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selecionarResultado(prod)}
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
                                    </button>
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
                            <span key={chave} className="analise-selected-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${prod.cor}55`, borderRadius: 99, fontSize: '0.78rem', color: 'var(--c5)' }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: prod.cor, display: 'inline-block' }} />
                                {prod.nome}
                                <button
                                    type="button"
                                    className="analise-chip-remove"
                                    aria-label={`Remover ${prod.nome} da seleção`}
                                    onClick={() => setSelecao(prev => prev.filter(x => x !== chave))}
                                    style={{ background: 'none', border: 'none', color: 'var(--c3)', cursor: 'pointer', fontSize: '0.8rem', padding: 0, lineHeight: 1, marginLeft: 2 }}
                                >
                                    ×
                                </button>
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
                                                {perc >= 0 ? 'Alta ' : 'Queda '}{perc >= 0 ? '+' : ''}{perc.toFixed(1)}%
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div id="graficos" className="ec-card analise-chart-card">
                <div className="analise-chart-header">
                    <div>
                        <h2>Tendências do cenário</h2>
                        <p>Compare a evolução dos preços selecionados com Selic e IPCA no período escolhido.</p>
                    </div>
                    <div className="ec-chart-actions">
                        <button type="button" className="ec-btn ec-btn-sec" onClick={resetarZoom}>Resetar zoom</button>
                        <button type="button" className="ec-btn ec-btn-sec" onClick={exportarPNG}>Exportar PNG</button>
                        <button type="button" className="ec-btn ec-btn-sec" onClick={() => window.print()}>Imprimir relatório</button>
                    </div>
                </div>
                <div className="ec-chart-container analise-chart-scroll">
                    <div className="analise-chart-frame">
                        <canvas
                            ref={canvasRef}
                            role="img"
                            aria-label="Gráfico de linhas comparando preços selecionados, taxa Selic e inflação IPCA no período escolhido."
                        >
                            Gráfico de linhas com preços selecionados, taxa Selic e inflação IPCA.
                        </canvas>
                    </div>
                </div>
                <p className="analise-chart-note">
                    Use a legenda para identificar cada série. Preços usam o eixo da esquerda; Selic e IPCA usam o eixo da direita. A faixa em destaque marca o recorte mais recente.
                </p>
                <div className="analise-chart-insights" aria-label="Resumo da comparação">
                    {chartReadingCards.map((item) => (
                        <article key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </div>

            <div className="ec-card analise-compare-card">
                <h2>Comparação Produto vs Produto</h2>
                <p>Selecione dois produtos para comparar métricas de preço e calcular a correlação entre eles.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
                    <div>
                        <label className="analise-field-label" htmlFor="analise-produto-a">Produto A</label>
                        <select id="analise-produto-a" className="ec-select" value={prodA} onChange={e => setProdA(e.target.value)}>
                            {produtos.map(p => <option key={p.chave} value={p.chave}>{p.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="analise-field-label" htmlFor="analise-produto-b">Produto B</label>
                        <select id="analise-produto-b" className="ec-select" value={prodB} onChange={e => setProdB(e.target.value)}>
                            {produtos.map(p => <option key={p.chave} value={p.chave}>{p.nome}</option>)}
                        </select>
                    </div>
                </div>

                {comparacaoInfo && (
                    <>
                        <div className="analise-comparison-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 20 }}>
                            <div className="ec-indicador-card analise-comparison-stat" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">Correlação (r)</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.6rem', color: comparacaoInfo.corr > 0.3 ? 'var(--c-success)' : comparacaoInfo.corr < -0.3 ? 'var(--c-danger)' : 'var(--c4)' }}>
                                    {comparacaoInfo.corr.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub">{comparacaoInfo.sentido}</div>
                            </div>
                            <div className="ec-indicador-card analise-comparison-stat" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">{comparacaoInfo.pA.nome}</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.5rem' }}>
                                    R$ {comparacaoInfo.fimA.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub" style={{ color: comparacaoInfo.varA >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
                                    {comparacaoInfo.varA >= 0 ? 'Alta ' : 'Queda '}{comparacaoInfo.varA >= 0 ? '+' : ''}{comparacaoInfo.varA.toFixed(1)}% no período
                                </div>
                            </div>
                            <div className="ec-indicador-card analise-comparison-stat" style={{ padding: '18px 20px' }}>
                                <div className="ec-indicador-label">{comparacaoInfo.pB.nome}</div>
                                <div className="ec-indicador-valor" style={{ fontSize: '1.5rem' }}>
                                    R$ {comparacaoInfo.fimB.toFixed(2)}
                                </div>
                                <div className="ec-indicador-sub" style={{ color: comparacaoInfo.varB >= 0 ? 'var(--c-success)' : 'var(--c-danger)' }}>
                                    {comparacaoInfo.varB >= 0 ? 'Alta ' : 'Queda '}{comparacaoInfo.varB >= 0 ? '+' : ''}{comparacaoInfo.varB.toFixed(1)}% no período
                                </div>
                            </div>
                        </div>

                        <div className="analise-comparison-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
                            <div className="ec-indicador-card analise-range-panel" style={{ padding: '16px 20px' }}>
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

                            <div className="ec-indicador-card analise-range-panel" style={{ padding: '16px 20px' }}>
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

                        <div className="ec-insights analise-comparison-insight" style={{ marginTop: 12 }}>
                            {comparacaoInfo.interpretacao}
                        </div>
                    </>
                )}
            </div>

            <div className="ec-card analise-auto-card">
                <h2>Resumo do cenário</h2>
                <p>Resumo organizado entre dados observados e interpretação econômica.</p>
                <div className="analise-summary-grid">
                    <section className="analise-summary-panel">
                        <h3>Dados observados</h3>
                        <div className="analise-summary-list">
                            {linhasDadosAnalise.length
                                ? linhasDadosAnalise.map((linha, i) => <div key={i}>{linha}</div>)
                                : <div style={{ color: 'var(--c3)' }}>Selecione ao menos um produto para gerar a análise.</div>
                            }
                        </div>
                    </section>

                    <section className="analise-summary-panel analise-summary-panel-strong">
                        <h3>Interpretação</h3>
                        <div className="analise-summary-list">
                            {linhasInterpretacaoAnalise.length
                                ? linhasInterpretacaoAnalise.map((linha, i) => <div key={i}>{linha}</div>)
                                : <div style={{ color: 'var(--c3)' }}>Aguardando dados suficientes para destacar conclusões.</div>
                            }
                        </div>
                    </section>
                </div>
            </div>

            <section className="analise-watch-section">
                <div className="analise-section-heading">
                    <div>
                        <span className="eyebrow">Pontos de atenção</span>
                        <h2>O que observar antes de tirar conclusões</h2>
                        <p>
                            Estes blocos separam leitura econômica de dado bruto, ajudando a entender
                            onde há pressão, estabilidade ou necessidade de mais contexto.
                        </p>
                    </div>
                </div>

                <div className="analise-watch-grid">
                    {pontosAtencao.map((ponto) => (
                        <article key={ponto.titulo} className={`analise-watch-card ${ponto.prioridade}`}>
                            <div>
                                <span>{ponto.titulo}</span>
                                <strong>{ponto.estado}</strong>
                            </div>
                            <p>{ponto.texto}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="analise-knowledge-section">
                <article id="educacao-economica" className="ec-card analise-glossary-card">
                    <span className="eyebrow">Glossário econômico</span>
                    <h2>Economia explicada sem perder profundidade</h2>
                    <p>
                        Conceitos curtos para ajudar a interpretar os indicadores antes de comparar séries,
                        preços e tendências.
                    </p>

                    <div className="analise-glossary-grid">
                        {glossarioEconomico.map((item) => (
                            <div key={item.termo} className="analise-glossary-item">
                                <h3>{item.termo}</h3>
                                <p>{item.definicao}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article id="fontes-dados" className="ec-card analise-sources-card">
                    <span className="eyebrow">Fontes dos dados</span>
                    <h2>Origem, cobertura e atualização</h2>
                    <p>
                        A página mostra de forma explícita o que já está conectado e o que ainda é
                        apenas estrutura preparada para integração futura.
                    </p>

                    <div className="analise-sources-list">
                        {fontesDados.map((fonte) => (
                            <div key={fonte.nome} className="analise-source-item">
                                <div>
                                    <strong>{fonte.nome}</strong>
                                    <span>{fonte.uso}</span>
                                </div>
                                <em>{fonte.status}</em>
                            </div>
                        ))}
                    </div>

                    <div className="analise-update-box">
                        <span>Última atualização registrada</span>
                        <strong>{dataAtualizacao || '-'}</strong>
                        <p>
                            A atualização usa as fontes já disponíveis e mantém a distinção entre
                            dados carregados, base local e integrações futuras.
                        </p>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default Analise;
