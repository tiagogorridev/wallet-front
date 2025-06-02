class ChartManager {
  constructor() {
    // INICIALIZAÇÃO DOS GRÁFICOS E DADOS
    this.evolutionChart = null;
    this.distributionChart = null;
    this.portfolioData = null;
    this.assetsData = null;
  }

  // INICIALIZAÇÃO PRINCIPAL
  initialize() {
    this.initEvolutionChart();
    this.initDistributionChart();
    this.setupEventListeners();
  }

  // INICIALIZAÇÃO DO GRÁFICO DE EVOLUÇÃO
  initEvolutionChart() {
    if (!document.getElementById("patrimonioChart")) return;
    this.evolutionChart = new EvolutionPatrimonyComponent(
      "patrimonioChart",
      "patrimonyFilter"
    );
    this.evolutionChart.initialize();
  }

  // INICIALIZAÇÃO DO GRÁFICO DE DISTRIBUIÇÃO
  initDistributionChart() {
    if (!document.getElementById("assetsDistributionChart")) return;
    this.distributionChart = new AssetsDistributionComponent(
      "assetsDistributionChart",
      "pie-chart-legend"
    );
    this.distributionChart.initialize();
  }

  // CONFIGURAÇÃO DOS EVENT LISTENERS
  setupEventListeners() {
    document.addEventListener("portfolio-updated", (e) => {
      if (e.detail?.portfolioData) {
        this.updateCharts(e.detail.portfolioData);
      }
    });
  }

  // ATUALIZAÇÃO DOS GRÁFICOS
  updateCharts(data) {
    if (data.portfolioHistory && this.evolutionChart) {
      const labels = data.portfolioHistory.map((item) => item.date);
      const values = data.portfolioHistory.map((item) => item.value);
      this.portfolioData = { labels, values };

      const activeFilter = document.querySelector(
        "#patrimonyFilter .filter-option.active"
      );
      if (activeFilter) {
        const monthsValue = activeFilter.getAttribute("data-value");
        this.evolutionChart.updateChart(
          monthsValue === "all" ? "all" : parseInt(monthsValue)
        );
      }
    }

    if (data.assetDistribution && this.distributionChart) {
      this.assetsData = data.assetDistribution.map((item) => ({
        class: item.category.toLowerCase(),
        label: item.category,
        percentage: item.percentage,
      }));
      this.distributionChart.updateData(this.assetsData);
    }
  }
}

// EXPOSIÇÃO GLOBAL E INICIALIZAÇÃO
window.ChartManager = ChartManager;

document.addEventListener("DOMContentLoaded", () => {
  const chartsManager = new ChartManager();
  chartsManager.initialize();
  window.chartsManagerInstance = chartsManager;
});
