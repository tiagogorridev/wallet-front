// Componente de Evolução do Patrimônio - Simplificado
class EvolutionPatrimonyComponent {
    constructor(containerId, filterContainerId = null) {
        this.containerId = containerId;
        this.filterContainerId = filterContainerId;
        this.chartInstance = null;
        this.months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        this.transactions = [];
        this.allData = { labels: [], data: [] };
    }

    initialize() {
        this.fetchTransactions();
        if (this.filterContainerId) {
            this.setupEventListeners();
        }
    }

    async fetchTransactions() {
        try {
            const result = await APIService.fetchFromAPI('/wallets', 'GET');
            const wallets = result.data.data || [];

            if (wallets.length === 0) {
                throw new Error('Nenhuma carteira encontrada');
            }

            const selectedWalletId = localStorage.getItem('selectedWalletId');
            const selectedWallet = wallets.find(wallet => wallet.id === parseInt(selectedWalletId)) || wallets[0];
            this.transactions = selectedWallet.transacoes || [];

            this.allData = this.processTransactionData();
            this.createChart();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            this.createChart(); // Create chart with empty data if fetch fails
        }
    }

    createChart() {
        const ctx = document.getElementById(this.containerId).getContext('2d');
        const { labels, data } = this.allData;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Evolução do Patrimônio',
                    data: data,
                    borderColor: '#FFA500',
                    backgroundColor: 'rgba(255, 165, 0, 0.2)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: '#FFFFFF',
                            callback: function (value) { return 'R$ ' + Number(value).toLocaleString(); }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    processTransactionData() {
        const labels = [];
        const data = [];
        let cumulativeValue = 0;

        // Sort transactions by date
        const sortedTransactions = [...this.transactions].sort((a, b) =>
            new Date(a.data_transacao) - new Date(b.data_transacao)
        );

        // Create monthly data points
        const monthlyData = {};

        sortedTransactions.forEach(transaction => {
            const date = new Date(transaction.data_transacao);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }

            // Add transaction value to monthly total
            const transactionValue = transaction.valor_total || (transaction.quantidade * transaction.valor_unitario);
            monthlyData[monthKey] += transactionValue;
        });

        // Convert monthly data to chart format
        Object.entries(monthlyData).forEach(([monthKey, value]) => {
            const [year, month] = monthKey.split('-');
            cumulativeValue += value;

            labels.push(`${this.months[parseInt(month) - 1]} / ${year}`);
            data.push(cumulativeValue);
        });

        return { labels, data };
    }

    updateChart(monthsToShow) {
        if (!this.chartInstance) return;

        let filteredLabels, filteredData;

        if (monthsToShow === 'all') {
            filteredLabels = this.allData.labels;
            filteredData = this.allData.data;
        } else {
            filteredLabels = this.allData.labels.slice(-monthsToShow);
            filteredData = this.allData.data.slice(-monthsToShow);
        }

        this.chartInstance.data.labels = filteredLabels;
        this.chartInstance.data.datasets[0].data = filteredData;
        this.chartInstance.update();
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll(`#${this.filterContainerId} .filter-option`);
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const value = button.getAttribute('data-value');
                this.updateChart(value === 'all' ? 'all' : parseInt(value));
            });
        });
    }
}

// Componente de Distribuição de Ativos - NÃO MODIFICADO CONFORME SOLICITADO
class AssetsDistributionComponent {
    constructor(chartContainerId, legendContainerId, data = null) {
        this.chartContainerId = chartContainerId;
        this.legendContainerId = legendContainerId;
        this.chartInstance = null;
        this.data = data || [];
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
            const categoriesMap = {};
            let totalValue = 0;

            // Primeiro, buscar os ativos para ter informações completas
            const assetsResult = await APIService.fetchFromAPI('/assets', 'GET');
            const assets = assetsResult.data.data || [];
            const assetsById = {};
            assets.forEach(asset => {
                assetsById[asset.id] = asset;
            });

            // Calcular valores totais por categoria
            transactions.forEach(transaction => {
                const assetId = transaction.id_ativo;
                if (!assetId) return;

                const assetData = assetsById[assetId];
                const category = transaction.tipo || (assetData && assetData.tipo) || 'OUTROS';

                if (!categoriesMap[category]) {
                    categoriesMap[category] = {
                        value: 0,
                        count: 0
                    };
                }

                const transactionValue = transaction.valor_total || (transaction.quantidade * transaction.valor_unitario);
                categoriesMap[category].value += transactionValue;
                categoriesMap[category].count++;
                totalValue += transactionValue;
            });

            // Converter para o formato necessário para o gráfico
            const assetsData = Object.entries(categoriesMap).map(([category, data]) => ({
                class: this.getAssetClass(category),
                label: this.getCategoryLabel(category),
                percentage: totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
                value: data.value.toFixed(2)
            }));

            this.data = assetsData;
            this.createChart();
            this.createLegend();
        } catch (error) {
            console.error('Error fetching assets distribution:', error);
            // Fallback para dados padrão se a busca falhar
            this.data = [
                { class: 'crypto', label: 'Criptomoedas', percentage: 0, value: 0 },
                { class: 'stocks', label: 'Ações', percentage: 0, value: 0 },
            ];
            this.createChart();
            this.createLegend();
        }
    }

    getAssetClass(categoria) {
        const categoryMap = {
            'CRIPTOMOEDAS': 'crypto',
            'ACOES': 'stocks',
        };
        return categoryMap[categoria] || 'other';
    }

    getCategoryLabel(categoria) {
        const labelMap = {
            'CRIPTOMOEDAS': 'Criptomoedas',
            'ACOES': 'Ações',
        };
        return labelMap[categoria] || categoria;
    }

    createChart() {
        const ctx = document.getElementById(this.chartContainerId).getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: this.data.map(item => item.label),
                datasets: [{
                    data: this.data.map(item => item.percentage),
                    backgroundColor: ['#FFA500', '#6b7280'],
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

    updateData(newData) {
        this.data = newData;
        this.chartInstance.data.labels = this.data.map(item => item.label);
        this.chartInstance.data.datasets[0].data = this.data.map(item => item.percentage);
        this.chartInstance.update();
        this.createLegend();
    }
}

// Componente simplificado de Ativos - Muito simplificado
class AssetsComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.isExpanded = false;
        this.cryptoAssets = [
            { symbol: 'BTC', quantidade: 0.05, precoMedio: 78500, precoAtual: 80000, variacao: '+1.91%', saldo: 4000 },
            { symbol: 'ETH', quantidade: 0.5, precoMedio: 4120, precoAtual: 4000, variacao: '-2.91%', saldo: 2000 }
        ];
    }

    initialize() {
        this.renderAssets();
    }

    renderAssets() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="asset-category ${this.isExpanded ? 'expanded' : ''}">
                <div class="category-header" onclick="document.querySelector('#${this.containerId} .asset-category').classList.toggle('expanded')">
                    <div class="category-expand-icon">${this.isExpanded ? '▼' : '►'}</div>
                    <div class="category-name">CRIPTOMOEDAS</div>
                    <div class="category-value">VALOR TOTAL: R$ 6.000,00</div>
                </div>
                ${this.isExpanded ? `
                <div class="category-content">
                    <table class="assets-table">
                        <thead>
                            <tr>
                                <th>Ativo</th>
                                <th>Quantidade</th>
                                <th>Preço Médio</th>
                                <th>Preço Atual</th>
                                <th>Variação</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.cryptoAssets.map(asset => `
                            <tr>
                                <td class="asset-name">${asset.symbol}</td>
                                <td>${asset.quantidade}</td>
                                <td>R$ ${asset.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td>R$ ${asset.precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td class="${asset.variacao.startsWith('+') ? 'positive' : asset.variacao.startsWith('-') ? 'negative' : ''}">${asset.variacao}</td>
                                <td>R$ ${asset.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
            </div>
        `;
    }
}

// Componente de Gráfico de Retorno Anual - Muito simplificado
class AnnualReturnChartComponent {
    constructor(containerId) {
        this.containerId = containerId;
    }

    initialize() {
        const ctx = document.getElementById(this.containerId).getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Rentabilidade 2025',
                    data: [2.5, -1.2, 3.8, 1.5, 2.1, -0.8, 4.2, 1.9, 2.7, 3.1, -1.5, 2.9],
                    backgroundColor: '#FFA500',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#FFFFFF',
                            callback: value => value + '%'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }
}

// Componente de Distribuição por Ativos Individuais
class AssetsIndividualDistributionComponent {
    constructor(chartContainerId, legendContainerId, data = null) {
        this.chartContainerId = chartContainerId;
        this.legendContainerId = legendContainerId;
        this.chartInstance = null;
        this.data = data || [];
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

    updateData(newData) {
        this.data = newData;
        this.chartInstance.data.labels = this.data.map(item => item.label);
        this.chartInstance.data.datasets[0].data = this.data.map(item => item.percentage);
        this.chartInstance.update();
        this.createLegend();
    }
}

// Inicialização simplificada
window.initComponents = () => {
    new EvolutionPatrimonyComponent('evolutionChart', 'evolutionFilter').initialize();
    new AssetsDistributionComponent('distributionChart', 'distributionLegend').initialize();
    new AssetsIndividualDistributionComponent('grafico-por-ativos', 'grafico-por-ativos-legend').initialize();
};

// Registrar componentes
window.EvolutionPatrimonyComponent = EvolutionPatrimonyComponent;
window.AssetsDistributionComponent = AssetsDistributionComponent;
window.AssetsComponent = AssetsComponent;
window.AnnualReturnChartComponent = AnnualReturnChartComponent;
window.AssetsIndividualDistributionComponent = AssetsIndividualDistributionComponent;