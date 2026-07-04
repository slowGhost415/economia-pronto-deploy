export const dadosEconomicos = {
    periodos: ["Jan/25","Fev/25","Mar/25","Abr/25","Mai/25","Jun/25","Jul/25","Ago/25","Set/25","Out/25","Nov/25","Dez/25"],
    produtos: {
        arroz:    { nome:"Arroz (kg)",      categoria:"Alimentos",    dados:[24.50,25.00,25.50,26.00,27.00,27.50,28.00,28.50,28.00,27.00,26.50,26.00], cor:"#8B4513" },
        feijao:   { nome:"Feijão (kg)",     categoria:"Alimentos",    dados:[9.50,9.80,10.00,10.50,11.00,11.50,12.00,12.50,12.00,11.50,11.00,10.50],  cor:"#DC143C" },
        cafe:     { nome:"Café (kg)",       categoria:"Alimentos",    dados:[18.00,18.30,18.70,19.00,19.50,19.80,20.20,20.50,20.30,20.00,19.70,19.40],cor:"#6F4E37" },
        acucar:   { nome:"Açúcar (kg)",     categoria:"Alimentos",    dados:[4.20,4.30,4.40,4.55,4.70,4.80,4.90,5.00,4.90,4.80,4.70,4.60],           cor:"#c8a000" },
        leite:    { nome:"Leite (L)",       categoria:"Alimentos",    dados:[5.80,6.00,6.20,6.50,6.80,7.00,7.20,7.50,7.00,6.80,6.50,6.20],           cor:"#aaaacc" },
        carne:    { nome:"Carne (kg)",      categoria:"Alimentos",    dados:[32.00,33.00,34.00,35.00,36.00,37.00,37.50,38.00,37.50,37.00,36.50,36.00],cor:"#8B0000" },
        oleo:     { nome:"Óleo (L)",        categoria:"Alimentos",    dados:[8.50,8.70,9.00,9.50,10.00,10.50,11.00,11.50,11.00,10.50,10.00,9.50],    cor:"#FFD700" },
        gasolina: { nome:"Gasolina (L)",    categoria:"Combustíveis", dados:[5.50,5.60,5.70,5.80,5.90,6.00,6.10,6.20,6.00,5.90,5.80,5.70],          cor:"#555555" },
        etanol:   { nome:"Etanol (L)",      categoria:"Combustíveis", dados:[4.40,4.50,4.60,4.70,4.80,4.90,5.00,5.10,5.00,4.90,4.80,4.70],          cor:"#FF6F00" },
        energia:  { nome:"Energia (kWh)",   categoria:"Serviços",     dados:[0.90,0.92,0.95,0.97,1.00,1.02,1.05,1.07,1.05,1.03,1.00,0.98],          cor:"#1E90FF" },
        internet: { nome:"Internet (Mbps)", categoria:"Serviços",     dados:[120,122,125,127,130,132,135,138,136,134,132,130],                        cor:"#2E8B57" }
    },
    selic:    [10.50,10.50,10.75,11.00,11.25,11.50,11.25,11.00,10.75,10.50,10.25,10.00],
    inflacao: [4.5,4.7,4.9,5.1,5.3,5.5,5.4,5.2,5.0,4.8,4.6,4.4],
    contexto: {
        0: "Inflação começa a subir após aumento de preços internacionais.",
        3: "Política monetária responde com aumento gradual da Selic.",
        6: "Dois trimestres de redução na taxa Selic; inflação dá sinais de estabilização.",
        9: "Demanda interna moderada; cortes de juros geram alívio no crédito.",
        11: "Fechamento do ano com preços ainda fortes, mas com luzes de desaceleração."
    }
};

export function obterProdutos() {
    return Object.keys(dadosEconomicos.produtos).map(chave => ({
        chave,
        ...dadosEconomicos.produtos[chave]
    }));
}

export function obterProdutosPorCategoria(categoria) {
    return obterProdutos().filter(p => p.categoria === categoria);
}

const SINONIMOS = {
    arroz: ['arroz', 'rice', 'cereal', 'grao', 'grão'],
    feijao: ['feijao', 'feijão', 'bean', 'beans', 'legume'],
    cafe: ['cafe', 'café', 'coffee', 'capuccino', 'expresso'],
    acucar: ['acucar', 'açúcar', 'sugar', 'adocante', 'adoçante', 'doce'],
    leite: ['leite', 'milk', 'laticinios', 'laticínios', 'dairy'],
    carne: ['carne', 'meat', 'beef', 'boi', 'frango', 'proteina', 'proteína', 'churrasco'],
    oleo: ['oleo', 'óleo', 'oil', 'gordura', 'frituras', 'soja'],
    gasolina: ['gasolina', 'combustivel', 'combustível', 'gas', 'gasolina', 'posto', 'tanque'],
    etanol: ['etanol', 'alcool', 'álcool', 'flex', 'biocombustivel', 'biocombustível'],
    energia: ['energia', 'luz', 'eletricidade', 'kwh', 'conta de luz', 'electricity'],
    internet: ['internet', 'banda larga', 'wifi', 'rede', 'mbps', 'conexao', 'conexão', 'provedor'],
};

function normalizar(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '').trim();
}

function scoreMatch(produto, termoNorm) {
    const chaveNorm = normalizar(produto.chave);
    const nomeNorm = normalizar(produto.nome);
    const catNorm = normalizar(produto.categoria);
    const sins = (SINONIMOS[produto.chave] || []).map(normalizar);

    if (chaveNorm === termoNorm || nomeNorm === termoNorm) return 100;
    if (sins.includes(termoNorm)) return 90;
    if (nomeNorm.startsWith(termoNorm) || chaveNorm.startsWith(termoNorm)) return 80;
    if (nomeNorm.includes(termoNorm) || chaveNorm.includes(termoNorm)) return 70;
    if (sins.some(s => s.startsWith(termoNorm))) return 65;
    if (sins.some(s => s.includes(termoNorm))) return 55;
    if (catNorm.includes(termoNorm)) return 40;

    const palavras = termoNorm.split(/\s+/);
    const matchPalavras = palavras.filter(p => nomeNorm.includes(p) || chaveNorm.includes(p) || sins.some(s => s.includes(p)));
    if (matchPalavras.length > 0) return 30 + (matchPalavras.length / palavras.length) * 20;

    return 0;
}

export function pesquisarProduto(termo) {
    if (!termo || termo.trim().length < 1) return [];
    const termoNorm = normalizar(termo);
    const produtos = obterProdutos();
    return produtos
        .map(p => ({ ...p, score: scoreMatch(p, termoNorm) }))
        .filter(p => p.score > 0)
        .sort((a, b) => b.score - a.score);
}

export function calcularTendencia(arr) {
    if (!Array.isArray(arr) || arr.length < 3) return 'estável';
    const inicio = arr[0];
    const fim = arr[arr.length - 1];
    if (fim > inicio * 1.03) return 'alta';
    if (fim < inicio * 0.97) return 'queda';
    return 'estável';
}

export function calcularVariacaoPercentual(inicial, final) {
    if (typeof inicial !== 'number' || typeof final !== 'number' || inicial === 0) return 0;
    return ((final - inicial) / inicial) * 100;
}

export function calculoCorrelacaoPearson(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;
    const n = a.length;
    const mediaA = a.reduce((sum, v) => sum + v, 0) / n;
    const mediaB = b.reduce((sum, v) => sum + v, 0) / n;
    let somaNumerador = 0, somaDenA = 0, somaDenB = 0;
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

const STORAGE_KEY = 'analiseEconomicaStorage';
const INDICADORES_KEY = 'indicadoresBCB';
const CACHE_HORAS = 1;

export function carregarDadosStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.dadosEconomicos) return parsed;
        } catch { /* ignore */ }
    }
    const inicial = {
        dadosEconomicos: JSON.parse(JSON.stringify(dadosEconomicos)),
        meta: { lastUpdate: new Date().toISOString() }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
    return inicial;
}

export function salvarDadosStorage(dados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

async function fetchSerie(codigo, qtd = 12) {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/${qtd}?formato=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`SGS ${codigo}: status ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) throw new Error(`SGS ${codigo}: vazio`);
    return json;
}

function parseValor(str) {
    if (typeof str === 'number') return str;
    return parseFloat(String(str).replace(',', '.')) || 0;
}

export async function buscarIndicadoresBCB(force = false) {
    const raw = localStorage.getItem(INDICADORES_KEY);
    if (raw && !force) {
        try {
            const cached = JSON.parse(raw);
            const diff = (Date.now() - new Date(cached.lastUpdate).getTime()) / 1000 / 3600;
            if (diff < CACHE_HORAS) return cached;
        } catch { /* ignore */ }
    }

    const resultado = {
        selic: null,
        ipca: null,
        cdi: null,
        dolar: null,
        ipcaHistorico: [],
        selicHistorico: [],
        periodos: [],
        lastUpdate: new Date().toISOString(),
        erro: null
    };

    const [selicRes, ipcaRes, cdiRes, dolarRes] = await Promise.allSettled([
        fetchSerie(11, 12),
        fetchSerie(13522, 12),
        fetchSerie(1, 1),
        fetchSerie(3698, 1)
    ]);

    if (selicRes.status === 'fulfilled') {
        const arr = selicRes.value;
        resultado.selicHistorico = arr.map(i => parseValor(i.valor));
        resultado.selic = resultado.selicHistorico[resultado.selicHistorico.length - 1];
        resultado.periodos = arr.map(i => {
            const [d, m, y] = i.data.split('/');
            return `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][parseInt(m) - 1]}/${y.slice(2)}`;
        });
    }

    if (ipcaRes.status === 'fulfilled') {
        const arr = ipcaRes.value;
        resultado.ipcaHistorico = arr.map(i => parseValor(i.valor));
        resultado.ipca = resultado.ipcaHistorico[resultado.ipcaHistorico.length - 1];
    }

    if (cdiRes.status === 'fulfilled') {
        resultado.cdi = parseValor(cdiRes.value[0].valor);
    }

    if (dolarRes.status === 'fulfilled') {
        resultado.dolar = parseValor(dolarRes.value[0].valor);
    }

    localStorage.setItem(INDICADORES_KEY, JSON.stringify(resultado));
    return resultado;
}

export async function atualizarSelicAPI(dadosAtual, force = false) {
    const meta = dadosAtual.meta || {};
    const agora = Date.now();
    const ultima = meta.lastUpdate ? new Date(meta.lastUpdate).getTime() : 0;
    if (!force && agora - ultima < 1000 * 60 * 60 * CACHE_HORAS) return dadosAtual;

    try {
        const ind = await buscarIndicadoresBCB(force);
        if (ind.selicHistorico.length > 0 && ind.ipcaHistorico.length > 0) {
            const atualizado = {
                ...dadosAtual,
                dadosEconomicos: {
                    ...dadosAtual.dadosEconomicos,
                    selic: ind.selicHistorico,
                    inflacao: ind.ipcaHistorico,
                    periodos: ind.periodos.length === 12 ? ind.periodos : dadosAtual.dadosEconomicos.periodos
                },
                meta: { lastUpdate: new Date().toISOString() }
            };
            salvarDadosStorage(atualizado);
            return atualizado;
        }
    } catch (err) {
        console.warn('Falha ao atualizar via API:', err.message);
    }
    return dadosAtual;
}
