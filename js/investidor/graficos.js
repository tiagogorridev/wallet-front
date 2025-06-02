// COMPONENTE - EVOLUÇÃO DO PATRIMÔNIO
class EvolutionPatrimonyComponent {
    constructor(containerId, filterContainerId = null) {
        this.containerId = containerId;
        this.filterContainerId = filterContainerId;
        this.chartInstance = null;
        this.transactions = [];
        this.allData = { labels: [], data: [] };
    }

    initialize() {
        this.setupEventListeners();
        this.fetchTransactions();
    }

    // BUSCAR TRANSAÇÕES DA API
    async fetchTransactions() {
        try {
            const result = await APIService.fetchFromAPI("/wallets", "GET");
            const wallets = result.data.data || [];

            if (wallets.length === 0) {
                throw new Error("Nenhuma carteira encontrada");
            }

            const selectedWalletId = localStorage.getItem("selectedWalletId");
            const selectedWallet =
                wallets.find((wallet) => wallet.id === parseInt(selectedWalletId)) ||
                wallets[0];
            this.transactions = selectedWallet.transacoes || [];

            this.allData = this.processTransactionData();
            this.createChart();

            const activeFilter = document.querySelector(
                `#${this.filterContainerId} .filter-option.active`
            );
            if (activeFilter) {
                const value = activeFilter.getAttribute("data-value");
                this.updateChart(value === "all" ? "all" : parseInt(value));
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            this.createChart();
        }
    }

    // CRIAR GRÁFICO DE LINHA
    createChart() {
        const ctx = document.getElementById(this.containerId).getContext("2d");
        const { labels, data } = this.allData;

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Evolução do Patrimônio",
                        data: data,
                        borderColor: "#FFA500",
                        backgroundColor: "rgba(255, 165, 0, 0.2)",
                        tension: 0.4,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: "#FFFFFF",
                            callback: function (value) {
                                return "R$ " + Number(value).toLocaleString();
                            },
                        },
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                    x: {
                        ticks: { color: "#FFFFFF" },
                        grid: { color: "rgba(255, 255, 255, 0.1)" },
                    },
                },
            },
        });
    }

    // PROCESSAR DADOS DAS TRANSAÇÕES
    processTransactionData() {
        const labels = [];
        const data = [];
        let cumulativeValue = 0;

        const sortedTransactions = [...this.transactions].sort(
            (a, b) => new Date(a.data_transacao) - new Date(b.data_transacao)
        );

        sortedTransactions.forEach((transaction) => {
            const date = new Date(transaction.data_transacao);
            const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(
                date.getMonth() + 1
            )
                .toString()
                .padStart(2, "0")}/${date.getFullYear()}`;

            const transactionValue =
                transaction.valor_total ||
                transaction.quantidade * transaction.valor_unitario;
            cumulativeValue += transactionValue;

            labels.push(formattedDate);
            data.push(cumulativeValue);
        });

        return { labels, data };
    }

    // ATUALIZAR GRÁFICO COM FILTRO
    updateChart(monthsToShow) {
        if (!this.chartInstance || !this.allData.labels.length) return;

        let filteredLabels, filteredData;

        if (monthsToShow === "all") {
            filteredLabels = this.allData.labels;
            filteredData = this.allData.data;
        } else {
            const today = new Date();
            const monthsAgo = new Date();
            monthsAgo.setMonth(today.getMonth() - monthsToShow);

            // Encontrar o índice da primeira transação dentro do período
            const startIndex = this.allData.labels.findIndex((label) => {
                const [day, month, year] = label.split('/');
                const date = new Date(year, month - 1, day);
                return date >= monthsAgo;
            });

            // Se não encontrar nenhuma transação no período, usar o índice 0
            const validStartIndex = startIndex === -1 ? 0 : startIndex;

            filteredLabels = this.allData.labels.slice(validStartIndex);
            filteredData = this.allData.data.slice(validStartIndex);
        }

        this.chartInstance.data.labels = filteredLabels;
        this.chartInstance.data.datasets[0].data = filteredData;
        this.chartInstance.update();
    }

    // CONFIGURAR EVENTOS DOS FILTROS
    setupEventListeners() {
        if (!this.filterContainerId) return;

        const filterButtons = document.querySelectorAll(
            `#${this.filterContainerId} .filter-option`
        );
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                filterButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");
                const value = button.getAttribute("data-value");
                this.updateChart(value === "all" ? "all" : parseInt(value));
            });
        });
    }
}

// COMPONENTE - DISTRIBUIÇÃO DE ATIVOS POR CATEGORIA
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

    // BUSCAR DISTRIBUIÇÃO DE ATIVOS DA API
    async fetchAssetsDistribution() {
        try {
            const result = await APIService.fetchFromAPI("/wallets", "GET");
            const wallets = result.data.data || [];
            if (wallets.length === 0) {
                throw new Error("Nenhuma carteira encontrada");
            }

            const selectedWalletId = localStorage.getItem("selectedWalletId");
            const selectedWallet =
                wallets.find((wallet) => wallet.id === parseInt(selectedWalletId)) ||
                wallets[0];

            const transactions = selectedWallet.transacoes || [];
            const categoriesMap = {};
            let totalValue = 0;

            const assetsResult = await APIService.fetchFromAPI("/assets", "GET");
            const assets = assetsResult.data.data || [];
            const assetsById = {};
            assets.forEach((asset) => {
                assetsById[asset.id] = asset;
            });

            transactions.forEach((transaction) => {
                const assetId = transaction.id_ativo;
                if (!assetId) return;

                const assetData = assetsById[assetId];
                const category =
                    (assetData && assetData.tipo) || transaction.tipo || "OUTROS";

                if (!categoriesMap[category]) {
                    categoriesMap[category] = { value: 0 };
                }

                const transactionValue =
                    transaction.valor_total ||
                    transaction.quantidade * transaction.valor_unitario;
                categoriesMap[category].value += transactionValue;
                totalValue += transactionValue;
            });

            const assetsData = Object.entries(categoriesMap).map(
                ([category, data]) => ({
                    class: this.getAssetClass(category),
                    label: this.getCategoryLabel(category),
                    percentage:
                        totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
                    value: data.value.toFixed(2),
                })
            );

            this.data = assetsData;
            this.createChart();
            this.createLegend();
        } catch (error) {
            console.error("Error fetching assets distribution:", error);
            this.data = [];
            this.createChart();
            this.createLegend();
        }
    }

    // MAPEAR CLASSE DO ATIVO
    getAssetClass(categoria) {
        const categoryMap = {
            CRIPTOMOEDAS: "crypto",
            ACOES: "stocks",
            COMPRA: "crypto",
            VENDA: "crypto",
            OUTROS: "other",
        };
        return categoryMap[categoria] || "other";
    }

    // MAPEAR LABEL DA CATEGORIA
    getCategoryLabel(categoria) {
        const labelMap = {
            CRIPTOMOEDAS: "Crypto",
            ACOES: "Ações",
            COMPRA: "Crypto",
            VENDA: "Crypto",
            OUTROS: "Outros",
        };
        return labelMap[categoria] || categoria;
    }

    // CRIAR GRÁFICO DE PIZZA
    createChart() {
        const ctx = document.getElementById(this.chartContainerId).getContext("2d");
        this.chartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: this.data.map((item) => item.label),
                datasets: [
                    {
                        data: this.data.map((item) => item.percentage),
                        backgroundColor: ["#FFA500", "#6b7280"],
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

    // CRIAR LEGENDA
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

    // ATUALIZAR DADOS
    updateData(newData) {
        this.data = newData;
        this.chartInstance.data.labels = this.data.map((item) => item.label);
        this.chartInstance.data.datasets[0].data = this.data.map(
            (item) => item.percentage
        );
        this.chartInstance.update();
        this.createLegend();
    }
}

// COMPONENTE - DISTRIBUIÇÃO POR ATIVOS INDIVIDUAIS
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

    // BUSCAR DISTRIBUIÇÃO INDIVIDUAL DA API
    async fetchAssetsDistribution() {
        try {
            const result = await APIService.fetchFromAPI("/wallets", "GET");
            const wallets = result.data.data || [];
            if (wallets.length === 0) {
                throw new Error("Nenhuma carteira encontrada");
            }

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
            assets.forEach((asset) => {
                assetsById[asset.id] = asset;
            });

            transactions.forEach((transaction) => {
                const assetId = transaction.id_ativo;
                if (!assetId) return;

                const assetData = assetsById[assetId];
                const assetName = assetData
                    ? `${assetData.nome} (${assetData.simbolo})`
                    : transaction.nome_ativo;
                const category =
                    (assetData && assetData.tipo) || transaction.tipo || "OUTROS";

                if (!assetsMap[assetName]) {
                    assetsMap[assetName] = { value: 0, category: category };
                }

                const transactionValue =
                    transaction.valor_total ||
                    transaction.quantidade * transaction.valor_unitario;
                assetsMap[assetName].value += transactionValue;
                totalValue += transactionValue;
            });

            const assetsData = Object.entries(assetsMap).map(([assetName, data]) => ({
                class: this.getAssetClass(data.category),
                label: assetName,
                percentage:
                    totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(2) : 0,
                value: data.value.toFixed(2),
            }));

            this.data = assetsData;
            this.createChart();
            this.createLegend();
        } catch (error) {
            console.error("Error fetching assets distribution:", error);
            this.data = [];
            this.createChart();
            this.createLegend();
        }
    }

    // MAPEAR CLASSE DO ATIVO INDIVIDUAL
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

    // CRIAR GRÁFICO DE PIZZA INDIVIDUAL
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

    // CRIAR LEGENDA INDIVIDUAL
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

    // ATUALIZAR DADOS INDIVIDUAIS
    updateData(newData) {
        this.data = newData;
        this.chartInstance.data.labels = this.data.map((item) => item.label);
        this.chartInstance.data.datasets[0].data = this.data.map(
            (item) => item.percentage
        );
        this.chartInstance.update();
        this.createLegend();
    }
}

// INICIALIZAÇÃO DOS COMPONENTES
window.initComponents = () => {
    new EvolutionPatrimonyComponent(
        "evolutionChart",
        "evolutionFilter"
    ).initialize();
    new AssetsDistributionComponent(
        "distributionChart",
        "distributionLegend"
    ).initialize();
    new AssetsIndividualDistributionComponent(
        "grafico-por-ativos",
        "grafico-por-ativos-legend"
    ).initialize();
};

// REGISTRAR COMPONENTES GLOBALMENTE
window.EvolutionPatrimonyComponent = EvolutionPatrimonyComponent;
window.AssetsDistributionComponent = AssetsDistributionComponent;
window.AssetsIndividualDistributionComponent =
    AssetsIndividualDistributionComponent;
