class GraficoPorAtivos {
    constructor(chartContainerId, legendContainerId) {
        this.chartContainerId = chartContainerId;
        this.legendContainerId = legendContainerId;
        this.chartInstance = null;
        this.data = [];
    }

    initialize() {
        this.fetchAssetsDistribution();
    }

    async fetchAssetsDistribution() {
        try {
            const result = await APIService.fetchFromAPI('/wallets', 'GET');
            const wallets = result.data.data || [];
            if (wallets.length === 0) {
                throw new Error('Nenhuma carteira encontrada');
            }

            const selectedWalletId = localStorage.getItem('selectedWalletId');
            const selectedWallet = wallets.find(wallet => wallet.id === parseInt(selectedWalletId)) || wallets[0];

            // Processar as transações para calcular a distribuição
            const transactions = selectedWallet.transacoes || [];
            const assetsMap = {};
            let totalValue = 0;

            // Primeiro, buscar os ativos para ter informações completas
            const assetsResult = await APIService.fetchFromAPI('/assets', 'GET');
            const assets = assetsResult.data.data || [];
            const assetsById = {};
            assets.forEach(asset => {
                assetsById[asset.id] = asset;
            });

            // Calcular valores totais por ativo individual
            transactions.forEach(transaction => {
                const assetId = transaction.id_ativo;
                if (!assetId) return;

                const assetData = assetsById[assetId];
                const assetName = assetData ? `${assetData.nome} (${assetData.simbolo})` : transaction.nome_ativo;
                const category = transaction.tipo || (assetData && assetData.tipo) || 'OUTROS';

                if (!assetsMap[assetName]) {
                    assetsMap[assetName] = {
                        value: 0,
                        category: category
                    };
                }

                const transactionValue = transaction.valor_total || (transaction.quantidade * transaction.valor_unitario);
                assetsMap[assetName].value += transactionValue;
                totalValue += transactionValue;
            });

            // Converter para o formato necessário para o gráfico
            const assetsData = Object.entries(assetsMap).map(([assetName, data]) => ({
                class: this.getAssetClass(data.category),
                label: assetName,
                percentage: totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
                value: data.value.toFixed(2)
            }));

            this.data = assetsData;
            this.createChart();
            this.createLegend();
        } catch (error) {
            console.error('Error fetching assets distribution:', error);
            this.data = [];
            this.createChart();
            this.createLegend();
        }
    }

    getAssetClass(categoria) {
        const categoryMap = {
            'CRIPTOMOEDAS': 'crypto',
            'ACOES': 'stocks',
            'RENDA_FIXA': 'fixed-income',
            'FII': 'reits',
            'ETF': 'etf'
        };
        return categoryMap[categoria] || 'other';
    }

    createChart() {
        const ctx = document.getElementById(this.chartContainerId).getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: this.data.map(item => item.label),
                datasets: [{
                    data: this.data.map(item => item.percentage),
                    backgroundColor: [
                        '#FFA500', // crypto
                        '#6b7280', // stocks
                        '#10B981', // fixed-income
                        '#3B82F6', // reits
                        '#8B5CF6', // etf
                        '#EF4444'  // other
                    ],
                    hoverOffset: 2
                }]
            },
            options: this.getPieChartOptions()
        });
    }

    getPieChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const item = this.data[context.dataIndex];
                            return `${item.label}: ${item.percentage}% (R$ ${item.value})`;
                        }
                    }
                }
            }
        };
    }

    createLegend() {
        const legendContainer = document.getElementById(this.legendContainerId);
        if (!legendContainer) return;

        legendContainer.innerHTML = '';
        this.data.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color ${item.class}"></span>
                <span class="legend-label">${item.percentage}% ${item.label}</span>
                <span class="legend-value">R$ ${item.value}</span>
            `;
            legendContainer.appendChild(legendItem);
        });
    }
}

// Inicializar o gráfico quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new GraficoPorAtivos('grafico-por-ativos', 'grafico-por-ativos-legend').initialize();
}); 