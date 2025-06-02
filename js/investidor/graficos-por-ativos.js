class GraficoPorAtivos {
  // CONSTRUTOR - INICIALIZAÇÃO DA CLASSE
  constructor(chartContainerId, legendContainerId) {
    this.chartContainerId = chartContainerId;
    this.legendContainerId = legendContainerId;
    this.chartInstance = null;
    this.data = [];
  }

  // INICIALIZAÇÃO PRINCIPAL
  initialize() {
    this.fetchAssetsDistribution();
  }

  // BUSCA E PROCESSAMENTO DOS DADOS DA API
  async fetchAssetsDistribution() {
    try {
      const result = await APIService.fetchFromAPI("/wallets", "GET");
      const wallets = result.data.data || [];
      if (wallets.length === 0) throw new Error("Nenhuma carteira encontrada");

      const selectedWalletId = localStorage.getItem("selectedWalletId");
      const selectedWallet =
        wallets.find((wallet) => wallet.id === parseInt(selectedWalletId)) ||
        wallets[0];
      const transactions = selectedWallet.transacoes || [];
      const assetsMap = {};
      let totalValue = 0;

      const assetsResult = await APIService.fetchFromAPI("/assets", "GET");
      const assets = assetsResult.data.data || [];
      const assetsById = {};
      assets.forEach((asset) => (assetsById[asset.id] = asset));

      // CÁLCULO DE VALORES POR ATIVO
      transactions.forEach((transaction) => {
        const assetId = transaction.id_ativo;
        if (!assetId) return;

        const assetData = assetsById[assetId];
        const assetName = assetData
          ? `${assetData.nome} (${assetData.simbolo})`
          : transaction.nome_ativo;
        const category =
          transaction.tipo || (assetData && assetData.tipo) || "OUTROS";

        if (!assetsMap[assetName]) {
          assetsMap[assetName] = { value: 0, category: category };
        }

        const transactionValue =
          transaction.valor_total ||
          transaction.quantidade * transaction.valor_unitario;
        assetsMap[assetName].value += transactionValue;
        totalValue += transactionValue;
      });

      // CONVERSÃO PARA FORMATO DO GRÁFICO
      this.data = Object.entries(assetsMap).map(([assetName, data]) => ({
        class: this.getAssetClass(data.category),
        label: assetName,
        percentage:
          totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
        value: data.value.toFixed(2),
      }));

      this.createChart();
      this.createLegend();
    } catch (error) {
      console.error("Error fetching assets distribution:", error);
      this.data = [];
      this.createChart();
      this.createLegend();
    }
  }

  // MAPEAMENTO DE CATEGORIAS
  getAssetClass(categoria) {
    const categoryMap = {
      CRIPTOMOEDAS: "crypto",
      ACOES: "stocks",
      RENDA_FIXA: "fixed-income",
      FII: "reits",
      ETF: "etf",
    };
    return categoryMap[categoria] || "other";
  }

  // CRIAÇÃO DO GRÁFICO
  createChart() {
    const ctx = document.getElementById(this.chartContainerId).getContext("2d");
    this.chartInstance = new Chart(ctx, {
      type: "pie",
      data: {
        labels: this.data.map((item) => item.label),
        datasets: [
          {
            data: this.data.map((item) => item.percentage),
            backgroundColor: [
              "#FFA500",
              "#6b7280",
              "#10B981",
              "#3B82F6",
              "#8B5CF6",
              "#EF4444",
            ],
            hoverOffset: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const item = this.data[context.dataIndex];
                return `${item.label}: ${item.percentage}% (R$ ${item.value})`;
              },
            },
          },
        },
      },
    });
  }

  // CRIAÇÃO DA LEGENDA
  createLegend() {
    const legendContainer = document.getElementById(this.legendContainerId);
    if (!legendContainer) return;

    legendContainer.innerHTML = "";
    this.data.forEach((item) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `
        <span class="legend-color ${item.class}"></span>
        <span class="legend-label">${item.percentage}% ${item.label}</span>
        <span class="legend-value">R$ ${item.value}</span>
      `;
      legendContainer.appendChild(legendItem);
    });
  }
}

// INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener("DOMContentLoaded", () => {
  new GraficoPorAtivos(
    "grafico-por-ativos",
    "grafico-por-ativos-legend"
  ).initialize();
});
