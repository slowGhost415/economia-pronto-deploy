// ============================================
// ANÁLISE ECONÔMICA CARIRI - SCRIPT PRINCIPAL
// ============================================

const STORAGE_KEY = 'analiseEconomicaStorage';
let dadosAtuais = null;
let chartAnalise = null;
let selecaoProdutos = [];

// Inicialização
// --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Script carregado');
    inicializarDados();
    ativarMenu();
    initTheme();

    // Registra plugin de zoom (Chart.js) caso esteja disponível
    if (typeof Chart !== 'undefined' && Chart.register) {
        const zoomPlugin = window.chartjsPluginZoom || window.ChartZoom || window.Zoom;
        if (zoomPlugin) Chart.register(zoomPlugin);
    }

    const pagina = document.body.dataset.page;
    if (pagina === 'index') initIndex();
    if (pagina === 'dados') initDados();
    if (pagina === 'analise') initAnalise();
});

function inicializarDados() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            dadosAtuais = JSON.parse(raw);
        } catch {
            dadosAtuais = null;
        }
    }

    if (!dadosAtuais || !dadosAtuais.dadosEconomicos) {
        dadosAtuais = {
            dadosEconomicos: clone(dadosEconomicos),
            meta: { lastUpdate: new Date().toISOString() }
        };
        salvarDados();
    }
}

function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosAtuais));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function ativarMenu() {
    const pagina = document.body.dataset.page;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.includes(pagina)) link.classList.add('active');
        else link.classList.remove('active');
    });
}

function initTheme() {
    const stored = localStorage.getItem('theme') || 'light';
    setTheme(stored);

    const btn = document.getElementById('btnTema');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const next = document.body.classList.contains('dark') ? 'light' : 'dark';
        setTheme(next);
    });
}

function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);

    const btn = document.getElementById('btnTema');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Página Inicial
// --------------------------------------------
function initIndex() {
    atualizarPainelRapido();
    atualizarSelicAPI().then(() => atualizarPainelRapido());
}

function atualizarPainelRapido() {
    const selicElem = document.getElementById('selicAtual');
    const inflacaoElem = document.getElementById('inflacaoAtual');
    const tendenciaElem = document.getElementById('tendenciaAtual');

    if (!dadosAtuais) return;
    const d = dadosAtuais.dadosEconomicos;

    const selic = d.selic[d.selic.length - 1];
    const inflacao = d.inflacao[d.inflacao.length - 1];
    const tendencia = calcularTendencia(d.selic);

    if (selicElem) selicElem.textContent = selic.toFixed(2) + '%';
    if (inflacaoElem) inflacaoElem.textContent = inflacao.toFixed(2) + '%';
    if (tendenciaElem) tendenciaElem.textContent = tendencia;
}

// Página de Dados
// --------------------------------------------
function initDados() {
    construirTabelaPrecos();
    construirTabelaVariacao();
    construirTabelaSelic();

    const btnExport = document.getElementById('btnExportCSV');
    if (btnExport) btnExport.addEventListener('click', exportarDadosCSV);
}

function construirTabelaPrecos() {
    const container = document.getElementById('tabelaPrecos');
    if (!container) return;

    const d = dadosAtuais.dadosEconomicos;
    const produtos = Object.keys(d.produtos).map(chave => ({ chave, ...d.produtos[chave] }));

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');

    headRow.appendChild(createCell('Período', 'th'));
    produtos.forEach(p => headRow.appendChild(createCell(p.nome, 'th')));
    headRow.appendChild(createCell('Selic (%)', 'th'));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    d.periodos.forEach((periodo, idx) => {
        const tr = document.createElement('tr');
        tr.appendChild(createCell(periodo, 'td'));
        produtos.forEach(p => {
            const valor = p.dados[idx];
            tr.appendChild(createCell(valor.toFixed(2), 'td'));
        });
        const selicValor = d.selic[idx];
        tr.appendChild(createCell(`${selicValor.toFixed(2)}%`, 'td'));
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    container.innerHTML = '';
    container.appendChild(table);
}

function construirTabelaVariacao() {
    const container = document.getElementById('tabelaVariacao');
    if (!container) return;

    const d = dadosAtuais.dadosEconomicos;
    const produtos = Object.entries(d.produtos);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Produto', 'Inicial', 'Final', 'Variação', 'Percentual'].forEach(label => headRow.appendChild(createCell(label, 'th')));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    produtos.forEach(([chave, produto]) => {
        const inicial = produto.dados[0];
        const final = produto.dados[produto.dados.length - 1];
        const delta = final - inicial;
        const percentual = calcularVariacaoPercentual(inicial, final);

        const tr = document.createElement('tr');
        tr.appendChild(createCell(produto.nome, 'td'));
        tr.appendChild(createCell(`R$ ${inicial.toFixed(2)}`, 'td'));
        tr.appendChild(createCell(`R$ ${final.toFixed(2)}`, 'td'));
        tr.appendChild(createCell(`${delta >= 0 ? '+' : ''}R$ ${delta.toFixed(2)}`, 'td'));
        const percCell = createCell(`${percentual >= 0 ? '+' : ''}${percentual.toFixed(2)}%`, 'td');
        percCell.className = percentual >= 0 ? 'variacao-positiva' : 'variacao-negativa';
        tr.appendChild(percCell);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

function construirTabelaSelic() {
    const container = document.getElementById('tabelaSelic');
    if (!container) return;

    const d = dadosAtuais.dadosEconomicos;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(createCell('Período', 'th'));
    headRow.appendChild(createCell('Selic (%)', 'th'));
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    d.periodos.forEach((periodo, idx) => {
        const tr = document.createElement('tr');
        tr.appendChild(createCell(periodo, 'td'));
        tr.appendChild(createCell(`${d.selic[idx].toFixed(2)}%`, 'td'));
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

function createCell(text, tag = 'td') {
    const cell = document.createElement(tag);
    cell.textContent = text;
    return cell;
}

function exportarDadosCSV() {
    if (!dadosAtuais) return;
    const d = dadosAtuais.dadosEconomicos;
    const produtos = Object.keys(d.produtos).map(key => d.produtos[key].nome);
    const header = ['Período', ...produtos, 'Selic (%)'];

    const rows = d.periodos.map((periodo, idx) => {
        const valores = produtos.map((_, i) => {
            const chave = Object.keys(d.produtos)[i];
            return d.produtos[chave].dados[idx].toFixed(2);
        });
        return [periodo, ...valores, d.selic[idx].toFixed(2)];
    });

    const csv = [header, ...rows]
        .map(r => r.map(v => `"${v}"`).join(';'))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dados_analise_cariri.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Página de Análise
// --------------------------------------------
function initAnalise() {
    const produtos = obterProdutos();
    selecaoProdutos = produtos.slice(0, 4).map(p => p.chave);

    construirListaProdutos();
    configurarEventosAnalise();
    bindExportButtons();
    initComparacao();

    atualizarPainelAtualizacao();
    atualizarGraficoAnalise();
    atualizarAnaliseAutomatica();
}

function construirListaProdutos() {
    const container = document.getElementById('produtosLista');
    if (!container) return;

    const produtos = obterProdutos();
    const categorias = [...new Set(produtos.map(p => p.categoria))];

    container.innerHTML = '';

    categorias.forEach(cat => {
        const cabecalho = document.createElement('h3');
        cabecalho.textContent = cat;
        container.appendChild(cabecalho);

        produtos.filter(p => p.categoria === cat).forEach(prod => {
            const wrapper = document.createElement('label');
            wrapper.className = 'produto-checkbox';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = prod.chave;
            checkbox.checked = selecaoProdutos.includes(prod.chave);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (!selecaoProdutos.includes(prod.chave)) selecaoProdutos.push(prod.chave);
                } else {
                    selecaoProdutos = selecaoProdutos.filter(x => x !== prod.chave);
                }
                wrapper.classList.toggle('active', checkbox.checked);
                atualizarGraficoAnalise();
                atualizarAnaliseAutomatica();
            });

            const span = document.createElement('span');
            span.textContent = prod.nome;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(span);
            if (checkbox.checked) wrapper.classList.add('active');
            container.appendChild(wrapper);
        });
    });
}

function configurarEventosAnalise() {
    const chkPrecos = document.getElementById('chkPrecos');
    const chkSelic = document.getElementById('chkSelic');
    const chkInflacao = document.getElementById('chkInflacao');
    const filtroPeriodo = document.getElementById('filtroPeriodo');
    const btnAtualizar = document.getElementById('btnAtualizarDados');
    const btnBuscar = document.getElementById('btnBuscarProduto');
    const busca = document.getElementById('buscaProduto');

    if (chkPrecos) chkPrecos.addEventListener('change', () => { atualizarGraficoAnalise(); atualizarAnaliseAutomatica(); });
    if (chkSelic) chkSelic.addEventListener('change', () => { atualizarGraficoAnalise(); atualizarAnaliseAutomatica(); });
    if (chkInflacao) chkInflacao.addEventListener('change', () => { atualizarGraficoAnalise(); atualizarAnaliseAutomatica(); });
    if (filtroPeriodo) filtroPeriodo.addEventListener('change', () => { atualizarGraficoAnalise(); atualizarAnaliseAutomatica(); });

    if (btnAtualizar) btnAtualizar.addEventListener('click', async () => {
        await atualizarSelicAPI(true);
        atualizarPainelAtualizacao();
        atualizarGraficoAnalise();
        atualizarAnaliseAutomatica();
    });

    const buscarProduto = () => {
        if (!busca) return;
        const termo = busca.value.trim().toLowerCase();
        if (!termo) return;
        const produto = obterProdutos().find(p => p.nome.toLowerCase().includes(termo) || p.chave.toLowerCase().includes(termo));
        if (!produto) {
            alert(`Produto não encontrado: "${termo}".`);
            return;
        }
        if (!selecaoProdutos.includes(produto.chave)) selecaoProdutos.push(produto.chave);
        construirListaProdutos();
        atualizarGraficoAnalise();
        atualizarAnaliseAutomatica();
    };

    if (btnBuscar) btnBuscar.addEventListener('click', buscarProduto);
    if (busca) busca.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscarProduto(); });
}

function atualizarPainelAtualizacao() {
    const el = document.getElementById('dataAtualizacao');
    if (!el) return;
    const data = dadosAtuais.meta?.lastUpdate ? new Date(dadosAtuais.meta.lastUpdate) : null;
    el.textContent = data ? data.toLocaleString('pt-BR') : '-';
}

function atualizarGraficoAnalise() {
    const canvas = document.getElementById('graficoAnalise');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const d = dadosAtuais.dadosEconomicos;
    const periodo = getPeriodo();
    const labels = d.periodos.slice(periodo.start, periodo.end);

    const datasets = [];
    const chkPrecos = document.getElementById('chkPrecos');
    const chkSelic = document.getElementById('chkSelic');
    const chkInflacao = document.getElementById('chkInflacao');

    if (chkPrecos?.checked) {
        selecaoProdutos.forEach(chave => {
            const produto = d.produtos[chave];
            if (!produto) return;
            datasets.push({
                label: produto.nome,
                data: produto.dados.slice(periodo.start, periodo.end),
                borderColor: produto.cor,
                backgroundColor: produto.cor + '33',
                yAxisID: 'preco',
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6
            });
        });
    }

    if (chkSelic?.checked) {
        datasets.push({
            label: 'Selic (%)',
            data: d.selic.slice(periodo.start, periodo.end),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.15)',
            yAxisID: 'taxa',
            tension: 0.35,
            pointRadius: 4,
            borderDash: [6, 4]
        });
    }

    if (chkInflacao?.checked) {
        datasets.push({
            label: 'Inflação (IPCA)',
            data: d.inflacao.slice(periodo.start, periodo.end),
            borderColor: '#1abc9c',
            backgroundColor: 'rgba(26, 188, 156, 0.15)',
            yAxisID: 'taxa',
            tension: 0.35,
            pointRadius: 4,
            borderDash: [4, 4]
        });
    }

    if (chartAnalise) chartAnalise.destroy();

    chartAnalise = new Chart(ctx, {
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
                            const texto = dadosAtuais.dadosEconomicos.contexto[idx];
                            return texto ? [`Contexto: ${texto}`] : [];
                        }
                    }
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                        modifierKey: 'ctrl'
                    }
                }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Período' } },
                preco: {
                    type: 'linear',
                    display: chkPrecos?.checked,
                    position: 'left',
                    title: { display: true, text: 'Preço (R$)' }
                },
                taxa: {
                    type: 'linear',
                    display: (chkSelic?.checked || chkInflacao?.checked),
                    position: 'right',
                    title: { display: true, text: 'Taxa (%)' },
                    grid: { drawOnChartArea: false }
                }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

function getPeriodo() {
    const filtro = document.getElementById('filtroPeriodo');
    const total = dadosAtuais.dadosEconomicos.periodos.length;
    const valor = filtro?.value || '12';
    if (valor === 'all') return { start: 0, end: total };
    const num = parseInt(valor, 10) || 12;
    return { start: Math.max(0, total - num), end: total };
}

function atualizarAnaliseAutomatica() {
    const elemento = document.getElementById('analiseText');
    if (!elemento) return;

    const d = dadosAtuais.dadosEconomicos;
    const tendenciaSelic = calcularTendencia(d.selic);
    const tendenciaInflacao = calcularTendencia(d.inflacao);

    const produtos = selecaoProdutos
        .slice(0, 3)
        .map(chave => d.produtos[chave]?.nome)
        .filter(Boolean);

    const listaProdutos = produtos.length ? produtos.join(', ') : 'produtos selecionados';

    let texto = `A Selic apresenta tendência de ${tendenciaSelic} e a inflação está ${tendenciaInflacao}. `;
    texto += `Os dados de ${listaProdutos} ajudam a entender como essas variáveis impactam o poder de compra. `;

    if (tendenciaSelic === 'alta' && tendenciaInflacao === 'alta') {
        texto += 'Esse cenário costuma reduzir o poder de crédito e pressionar preços de mercado.';
    } else if (tendenciaSelic === 'queda' && tendenciaInflacao === 'queda') {
        texto += 'Taxas mais baixas costumam estimular consumo e podem levar a maior dinamismo na economia.';
    } else {
        texto += 'Observe o comportamento de cada indicador para identificar possíveis mudanças de tendência.';
    }

    elemento.textContent = texto;
}

function calcularTendencia(arr) {
    if (!Array.isArray(arr) || arr.length < 3) return 'estável';
    const inicio = arr[0];
    const fim = arr[arr.length - 1];
    if (fim > inicio * 1.03) return 'alta';
    if (fim < inicio * 0.97) return 'queda';
    return 'estável';
}

function calcularVariacaoPercentual(inicial, final) {
    if (typeof inicial !== 'number' || typeof final !== 'number' || inicial === 0) return 0;
    return ((final - inicial) / inicial) * 100;
}

function calculoCorrelacaoPearson(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
    const n = a.length;
    const mediaA = a.reduce((sum, v) => sum + v, 0) / n;
    const mediaB = b.reduce((sum, v) => sum + v, 0) / n;
    let somaNumerador = 0;
    let somaDenA = 0;
    let somaDenB = 0;

    for (let i = 0; i < n; i++) {
        const da = a[i] - mediaA;
        const db = b[i] - mediaB;
        somaNumerador += da * db;
        somaDenA += da * da;
        somaDenB += db * db;
    }

    const denom = Math.sqrt(somaDenA * somaDenB);
    if (denom === 0) return 0;
    return somaNumerador / denom;
}

function exportarGraficoPNG() {
    if (!chartAnalise) return;
    const url = chartAnalise.toBase64Image();
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grafico_analise.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function imprimirRelatorio() {
    window.print();
}

function bindExportButtons() {
    const btnPNG = document.getElementById('btnExportPNG');
    const btnPrint = document.getElementById('btnImprimir');
    const btnPrintDados = document.getElementById('btnImprimirDados');

    if (btnPNG) btnPNG.addEventListener('click', exportarGraficoPNG);
    if (btnPrint) btnPrint.addEventListener('click', imprimirRelatorio);
    if (btnPrintDados) btnPrintDados.addEventListener('click', imprimirRelatorio);
}

function initComparacao() {
    const selectA = document.getElementById('selectProdA');
    const selectB = document.getElementById('selectProdB');
    const info = document.getElementById('comparacaoInfo');
    if (!selectA || !selectB || !info) return;

    const produtos = obterProdutos();
    selectA.innerHTML = '';
    selectB.innerHTML = '';

    produtos.forEach(prod => {
        const optA = document.createElement('option');
        optA.value = prod.chave;
        optA.textContent = prod.nome;
        selectA.appendChild(optA);

        const optB = document.createElement('option');
        optB.value = prod.chave;
        optB.textContent = prod.nome;
        selectB.appendChild(optB);
    });

    selectA.value = produtos[0]?.chave || ''; 
    selectB.value = produtos[1]?.chave || produtos[0]?.chave || '';

    const atualizar = () => {
        const chaveA = selectA.value;
        const chaveB = selectB.value;
        if (!chaveA || !chaveB) return;
        const d = dadosAtuais.dadosEconomicos;
        const serieA = d.produtos[chaveA]?.dados || [];
        const serieB = d.produtos[chaveB]?.dados || [];
        const corr = calculoCorrelacaoPearson(serieA, serieB);
        const formatted = (corr * 100).toFixed(1);
        const sentido = corr > 0.1 ? 'positiva' : corr < -0.1 ? 'negativa' : 'fraca';
        info.textContent = `Correlação ${sentido} (r = ${corr.toFixed(2)} / ${formatted}%) entre ${d.produtos[chaveA]?.nome} e ${d.produtos[chaveB]?.nome}.`;
    };

    selectA.addEventListener('change', atualizar);
    selectB.addEventListener('change', atualizar);
    atualizar();
}

// Integração com API Selic
// --------------------------------------------
async function atualizarSelicAPI(force = false) {
    const meta = dadosAtuais.meta || {};
    const agora = Date.now();
    const ultima = meta.lastUpdate ? new Date(meta.lastUpdate).getTime() : 0;

    // Cache de 6h
    if (!force && agora - ultima < 1000 * 60 * 60 * 6) {
        console.log('Usando dados em cache');
        return;
    }

    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json';

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const json = await response.json();
        if (!Array.isArray(json) || json.length === 0) throw new Error('Resposta vazia');

        const ultimos = json.slice(-12);
        const selicAtualizada = ultimos.map(item => parseFloat(item.valor.replace(',', '.')) || 0);

        if (selicAtualizada.length === 12) {
            dadosAtuais.dadosEconomicos.selic = selicAtualizada;
            dadosAtuais.meta.lastUpdate = new Date().toISOString();
            salvarDados();
            console.log('Selic atualizada via API');
        }
    } catch (erro) {
        console.warn('Falha ao atualizar Selic:', erro.message);
    }
}

