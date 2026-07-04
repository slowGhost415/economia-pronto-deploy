// Dados econômicos da região do Cariri - 2025/2026
const dadosEconomicos = {
    // Períodos (meses)
    periodos: ["Jan/25", "Fev/25", "Mar/25", "Abr/25", "Mai/25", "Jun/25", "Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25", "Dez/25"],

    // Preços de produtos (em R$), categorizados por tipo
    produtos: {
        arroz: {
            nome: "Arroz (kg)",
            categoria: "Alimentos",
            dados: [24.50, 25.00, 25.50, 26.00, 27.00, 27.50, 28.00, 28.50, 28.00, 27.00, 26.50, 26.00],
            cor: "#8B4513"
        },
        feijao: {
            nome: "Feijão (kg)",
            categoria: "Alimentos",
            dados: [9.50, 9.80, 10.00, 10.50, 11.00, 11.50, 12.00, 12.50, 12.00, 11.50, 11.00, 10.50],
            cor: "#DC143C"
        },
        cafe: {
            nome: "Café (kg)",
            categoria: "Alimentos",
            dados: [18.00, 18.30, 18.70, 19.00, 19.50, 19.80, 20.20, 20.50, 20.30, 20.00, 19.70, 19.40],
            cor: "#6F4E37"
        },
        acucar: {
            nome: "Açúcar (kg)",
            categoria: "Alimentos",
            dados: [4.20, 4.30, 4.40, 4.55, 4.70, 4.80, 4.90, 5.00, 4.90, 4.80, 4.70, 4.60],
            cor: "#F4A460"
        },
        leite: {
            nome: "Leite (L)",
            categoria: "Alimentos",
            dados: [5.80, 6.00, 6.20, 6.50, 6.80, 7.00, 7.20, 7.50, 7.00, 6.80, 6.50, 6.20],
            cor: "#F0F8FF"
        },
        carne: {
            nome: "Carne (kg)",
            categoria: "Alimentos",
            dados: [32.00, 33.00, 34.00, 35.00, 36.00, 37.00, 37.50, 38.00, 37.50, 37.00, 36.50, 36.00],
            cor: "#8B0000"
        },
        oleo: {
            nome: "Óleo (L)",
            categoria: "Alimentos",
            dados: [8.50, 8.70, 9.00, 9.50, 10.00, 10.50, 11.00, 11.50, 11.00, 10.50, 10.00, 9.50],
            cor: "#FFD700"
        },
        gasolina: {
            nome: "Gasolina (L)",
            categoria: "Combustíveis",
            dados: [5.50, 5.60, 5.70, 5.80, 5.90, 6.00, 6.10, 6.20, 6.00, 5.90, 5.80, 5.70],
            cor: "#1C1C1C"
        },
        etanol: {
            nome: "Etanol (L)",
            categoria: "Combustíveis",
            dados: [4.40, 4.50, 4.60, 4.70, 4.80, 4.90, 5.00, 5.10, 5.00, 4.90, 4.80, 4.70],
            cor: "#FF6F00"
        },
        energia: {
            nome: "Energia (kWh)",
            categoria: "Serviços",
            dados: [0.90, 0.92, 0.95, 0.97, 1.00, 1.02, 1.05, 1.07, 1.05, 1.03, 1.00, 0.98],
            cor: "#1E90FF"
        },
        internet: {
            nome: "Internet (Mbps)",
            categoria: "Serviços",
            dados: [120, 122, 125, 127, 130, 132, 135, 138, 136, 134, 132, 130],
            cor: "#2E8B57"
        }
    },

    // Taxa Selic simulada (%)
    selic: [10.50, 10.50, 10.75, 11.00, 11.25, 11.50, 11.25, 11.00, 10.75, 10.50, 10.25, 10.00],

    // Inflação simulada (IPCA) (%)
    inflacao: [4.5, 4.7, 4.9, 5.1, 5.3, 5.5, 5.4, 5.2, 5.0, 4.8, 4.6, 4.4],

    // Contexto econômico por período (índice do mês)
    contexto: {
        0: "Inflação começa a subir após aumento de preços internacionais.",
        3: "Política monetária responde com aumento gradual da Selic.",
        6: "Dois trimestres de redução na taxa Selic; inflação dá sinais de estabilização.",
        9: "Demanda interna moderada; cortes de juros geram alívio no crédito.",
        11: "Fechamento do ano com preços ainda fortes, mas com luzes de desaceleração."
    }
};

// Função auxiliar para obter todos os produtos
function obterProdutos() {
    return Object.keys(dadosEconomicos.produtos).map(chave => ({
        chave: chave,
        ...dadosEconomicos.produtos[chave]
    }));
}

// Função auxiliar para obter produtos por categoria
function obterProdutosPorCategoria(categoria) {
    return obterProdutos().filter(prod => prod.categoria === categoria);
}
