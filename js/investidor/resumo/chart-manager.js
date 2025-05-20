class ChartManager {
    constructor() {
        this.evolutionChart = null;
        this.distributionChart = null;
        this.portfolioData = null;
        this.assetsData = null;
    }

    initialize() {
        this.initEvolutionChart();
        this.initDistributionChart();
        this.setupEventListeners();
    }

    initEvolutionChart() {
        const ctx = document.getElementById('patrimonioChart');
        if (!ctx) return;

        this.evolutionChart = new EvolutionPatrimonyComponent('patrimonioChart', 'patrimonyFilter');
        this.evolutionChart.initialize();
    }

    initDistributionChart() {
        const ctx = document.getElementById('assetsDistributionChart');
        if (!ctx) return;

        this.distributionChart = new AssetsDistributionComponent(
            'assetsDistributionChart',
            'pie-chart-legend'
        );
        this.distributionChart.initialize();
    }

    setupEventListeners() {
        document.addEventListener('portfolio-updated', (event) => {
            if (event.detail && event.detail.portfolioData) {
                this.updateCharts(event.detail.portfolioData);
            }
        });
    }

    updateCharts(data) {
        if (data.portfolioHistory && this.evolutionChart) {
            const labels = data.portfolioHistory.map(item => item.date);
            const values = data.portfolioHistory.map(item => item.value);

            this.portfolioData = { labels, values };

            const activeFilter = document.querySelector('#patrimonyFilter .filter-option.active');
            if (activeFilter) {
                const monthsValue = activeFilter.getAttribute('data-value');
                this.evolutionChart.updateChart(monthsValue === 'all' ? 'all' : parseInt(monthsValue));
            }
        }

        if (data.assetDistribution && this.distributionChart) {
            this.assetsData = data.assetDistribution.map(item => ({
                class: item.category.toLowerCase(),
                label: item.category,
                percentage: item.percentage
            }));

            this.distributionChart.updateData(this.assetsData);
        }
    }
}

window.ChartManager = ChartManager;

document.addEventListener('DOMContentLoaded', () => {
    const chartsManager = new ChartManager();
    chartsManager.initialize();

    window.chartsManagerInstance = chartsManager;
});