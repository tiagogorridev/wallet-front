class ChartsManager {
    constructor() {
        this.evolutionChart = null;
        this.distributionChart = null;
        
        this.portfolioData = null;
        this.assetsData = null;
    }

    initialize() {
        this.loadPortfolioData()
            .then(() => {
                this.initEvolutionChart();
                this.initDistributionChart();
                
                this.setupEventListeners();
            })
            .catch(error => {
                console.error('Erro ao carregar dados do portfólio:', error);
                this.initWithMockData();
            });
    }

    async loadPortfolioData() {
        try {
            this.loadMockData();
        } catch (error) {
            console.error('Erro ao carregar dados da API:', error);
            throw error;
        }
    }

    loadMockData() {
        this.portfolioData = {
            labels: [],
            values: []
        };
        
        const today = new Date();
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = `${months[date.getMonth()]} / ${date.getFullYear()}`;
            
            const baseValue = 450000;
            const randomVariation = Math.random() * 100000 - 50000;
            const value = baseValue + randomVariation;
            
            this.portfolioData.labels.push(monthLabel);
            this.portfolioData.values.push(value);
        }
        
        this.assetsData = [
            { class: 'crypto', label: 'Criptomoedas', percentage: 60 },
            { class: 'stocks', label: 'Ações', percentage: 25 },
            { class: 'fixed-income', label: 'Renda Fixa', percentage: 15 }
        ];
    }

    initEvolutionChart() {
        this.evolutionChart = new EvolutionPatrimonyComponent('patrimonioChart', 'patrimonyFilter');
        
        if (this.portfolioData) {
            this.evolutionChart.generateMonthlyValue = (date) => {
                const index = this.portfolioData.labels.findIndex(label => 
                    label.includes(this.evolutionChart.months[date.getMonth()]));
                    
                return index >= 0 ? this.portfolioData.values[index] : 0;
            };
        }
        
        this.evolutionChart.initialize();
    }

    initDistributionChart() {
        this.distributionChart = new AssetsDistributionComponent(
            'assetsDistributionChart', 
            'pie-chart-legend', 
            this.assetsData
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
                this.evolutionChart.updateChart(parseInt(monthsValue));
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

    initWithMockData() {
        this.loadMockData();
        this.initEvolutionChart();
        this.initDistributionChart();
        this.setupEventListeners();
    }
}

window.ChartsManager = ChartsManager;

document.addEventListener('DOMContentLoaded', () => {
    const chartsManager = new ChartsManager();
    chartsManager.initialize();
    
    window.chartsManagerInstance = chartsManager;
});