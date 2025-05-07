const PortfolioManager = {
    elements: {},
    evolutionChart: null,
    distributionChart: null,

    setElements(elementsConfig) {
        this.elements = elementsConfig;
    },

    setCharts(charts) {
        this.evolutionChart = charts.evolutionChart;
        this.distributionChart = charts.distributionChart; 
    },

    loadPortfolio() {
        const selectedPortfolioName = localStorage.getItem('selectedPortfolio');
        const selectedWalletId = localStorage.getItem('selectedWalletId');

        if (selectedPortfolioName) {
            if (this.elements.portfolioNameElement) {
                this.elements.portfolioNameElement.textContent = selectedPortfolioName;
            }

            if (this.elements.portfolioHeader) {
                this.elements.portfolioHeader.textContent = `Carteira: ${selectedPortfolioName}`;
            }

            if (this.elements.walletNameInput) {
                this.elements.walletNameInput.value = selectedPortfolioName;
            }
        }

        if (selectedWalletId) {
            this.fetchWalletDetails(parseInt(selectedWalletId));

            if (this.elements.walletDescInput) {
                const walletDesc = localStorage.getItem('selectedWalletDescription');
                if (walletDesc) {
                    this.elements.walletDescInput.value = walletDesc;
                }
            }
        } else {
            this.fetchWallets();
        }
    },

    fetchWalletDetails(walletId) {
        APIService.fetchFromAPI('/wallets', 'GET')
            .then(result => {
                const wallets = result.data.data || [];
                const selectedWallet = wallets.find(wallet => wallet.id === walletId);

                if (selectedWallet) {
                    this.saveWalletToLocalStorage(selectedWallet);
                    this.updatePortfolioUI(selectedWallet);
                } else if (wallets.length > 0) {
                    this.saveWalletToLocalStorage(wallets[0]);
                    this.updatePortfolioUI(wallets[0]);
                } else {
                    Utils.showErrorMessage(this.elements.loadingMessage, 'Nenhuma carteira encontrada');
                }
            })
            .catch(error => {
                Utils.showErrorMessage(this.elements.loadingMessage, `Erro ao carregar carteira: ${error.message}`);
                if (this.elements.portfolioHeader) {
                    this.elements.portfolioHeader.textContent = `Carteira: ${localStorage.getItem('selectedPortfolio') || "Não encontrada"}`;
                }
            });
    },

    fetchWallets() {
        APIService.getWallets()
            .then(result => {
                const wallets = result.data.data || [];
                if (wallets.length > 0) {
                    this.saveWalletToLocalStorage(wallets[0]);
                    this.updatePortfolioUI(wallets[0]);
                } else {
                    Utils.showErrorMessage(this.elements.loadingMessage, 'Nenhuma carteira encontrada');
                }
            })
            .catch(error => {
                Utils.showErrorMessage(this.elements.loadingMessage, `Erro ao carregar carteiras: ${error.message}`);
            });
    },

    saveWalletToLocalStorage(wallet) {
        localStorage.setItem('selectedPortfolio', wallet.nome);
        localStorage.setItem('selectedWalletId', wallet.id.toString());
        if (wallet.descricao) {
            localStorage.setItem('selectedWalletDescription', wallet.descricao);
        }
    },

    updatePortfolioUI(portfolioData) {
        if (this.elements.loadingMessage) {
            this.elements.loadingMessage.style.display = 'none';
        }

        if (this.elements.portfolioHeader) {
            this.elements.portfolioHeader.textContent = `Carteira: ${portfolioData.nome || "Sem nome"}`;
        }

        if (this.elements.assetsTableContainer) {
            this.renderPortfolioDetails(portfolioData);
        }

        ChartManagement.updateDistributionChart(portfolioData, this.distributionChart, this.elements.pieChartLegend);
    },

    renderPortfolioDetails(portfolioData) {
        this.elements.assetsTableContainer.innerHTML = '';

        const portfolioInfo = document.createElement('div');
        portfolioInfo.className = 'portfolio-info';

        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'portfolio-description';
        descriptionElement.textContent = `Descrição: ${portfolioData.descricao || "Sem descrição"}`;
        portfolioInfo.appendChild(descriptionElement);

        this.elements.assetsTableContainer.appendChild(portfolioInfo);

        const assetsListDiv = document.createElement('div');
        assetsListDiv.className = 'assets-list';

        const assetsHeader = document.createElement('h3');
        assetsHeader.textContent = 'Ativos na Carteira';
        assetsListDiv.appendChild(assetsHeader);

        const assetsListingDiv = this.createAssetsListingContainer();
        assetsListDiv.appendChild(assetsListingDiv);
        
        this.elements.assetsTableContainer.appendChild(assetsListDiv);

        const transactions = portfolioData.transacoes || [];

        if (transactions.length > 0) {
            this.processPortfolioTransactions(transactions, assetsListingDiv);
        } else {
            this.renderEmptyPortfolio(assetsListingDiv);
        }
    },

    createAssetsListingContainer() {
        const assetsListingDiv = document.createElement('div');
        assetsListingDiv.id = 'assets-listing';

        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-assets';
        loadingDiv.className = 'loading-message';
        loadingDiv.style.display = 'none';
        loadingDiv.innerHTML = '<p>Carregando ativos...</p>';
        assetsListingDiv.appendChild(loadingDiv);

        return assetsListingDiv;
    },

    processPortfolioTransactions(transactions, assetsListingDiv) {
        APIService.fetchFromAPI('/assets', 'GET')
            .then(result => {
                const assets = result.data.data || [];
                const assetsById = {};

                assets.forEach(asset => {
                    assetsById[asset.id] = asset;
                });

                const assetsMap = this.createAssetsMapFromTransactions(transactions, assetsById);
                const tableContainer = this.createAssetsTable(assetsMap);
                assetsListingDiv.appendChild(tableContainer);
            })
            .catch(error => {
                const assetsMap = this.createAssetsMapFromTransactions(transactions);
                const tableContainer = this.createAssetsTable(assetsMap);
                assetsListingDiv.appendChild(tableContainer);
            });
    },

    createAssetsMapFromTransactions(transactions, assetsById = {}) {
        const assetsMap = {};
        let totalBalance = 0;

        transactions.forEach(transaction => {
            const assetId = transaction.id_ativo;
            if (!assetId) return;

            if (!assetsMap[assetId]) {
                const assetData = assetsById[assetId];

                assetsMap[assetId] = {
                    id: assetId,
                    nome: (assetData && assetData.nome) || transaction.nome_ativo || 'Ativo sem nome',
                    simbolo: (assetData && assetData.simbolo) || '',
                    categoria: transaction.tipo || (assetData && assetData.tipo) || 'OUTROS',
                    quantidade: 0,
                    valorUnitario: transaction.valor_unitario || 0,
                    valorTotal: 0,
                    rendimento: 0,
                    investimentoInicial: 0
                };
            }

            assetsMap[assetId].quantidade += transaction.quantidade;
            assetsMap[assetId].investimentoInicial += transaction.valor_total || (transaction.quantidade * transaction.valor_unitario);
        });

        Object.values(assetsMap).forEach(asset => {
            if (asset.quantidade > 0) {
                const currentValue = asset.valorUnitario;
                const totalValue = asset.quantidade * currentValue;
                totalBalance += totalValue;
            }
        });

        this.updatePortfolioSummary(assetsMap, totalBalance);

        return assetsMap;
    },

    updatePortfolioSummary(assetsMap, totalBalance) {
        if (this.elements.balanceElement) {
            this.elements.balanceElement.textContent = `R$ ${Utils.formatCurrency(totalBalance)}`;
        }

        if (this.elements.returnElement) {
            const totalInvestment = Object.values(assetsMap).reduce((sum, asset) => sum + asset.investimentoInicial, 0);
            const rentabilidade = totalInvestment > 0 ? ((totalBalance - totalInvestment) / totalInvestment) * 100 : 0;
            const rentabilidadeClass = rentabilidade >= 0 ? 'positive-return' : 'negative-return';
            this.elements.returnElement.textContent = `${Utils.formatPercentage(rentabilidade)}%`;
            this.elements.returnElement.className = rentabilidadeClass;
        }
    },

    createAssetsTable(assetsMap) {
        const assetsTable = document.createElement('table');
        assetsTable.className = 'assets-table';
        assetsTable.id = 'assets-table';

        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Valor Atual</th>
                <th>Valor Total</th>
                <th>Rendimento</th>
                <th>Ações</th>
            </tr>
        `;
        assetsTable.appendChild(tableHead);

        const tableBody = document.createElement('tbody');
        tableBody.id = 'assets-table-body';

        this.populateTableBody(assetsMap, tableBody);
        assetsTable.appendChild(tableBody);

        return assetsTable;
    },

    populateTableBody(assetsMap, tableBody) {
        tableBody.innerHTML = '';

        Object.values(assetsMap).forEach(asset => {
            if (asset.quantidade <= 0) return;

            const row = document.createElement('tr');

            const currentValue = asset.valorUnitario;
            const totalValue = asset.quantidade * currentValue;
            const initialInvestment = asset.investimentoInicial;
            const profitLoss = totalValue - initialInvestment;
            const rendimento = initialInvestment > 0 ? (profitLoss / initialInvestment) * 100 : 0;

            const displayName = asset.simbolo ? `${asset.nome} (${asset.simbolo})` : asset.nome;

            row.innerHTML = `
                <td>${displayName}</td>
                <td>
                    <span class="asset-category category-${Utils.getCategoryClass(asset.categoria)}">
                        ${Utils.getCategoryLabel(asset.categoria)}
                    </span>
                </td>
                <td>${Utils.formatQuantity(asset.quantidade)}</td>
                <td>R$ ${Utils.formatCurrency(currentValue)}</td>
                <td>R$ ${Utils.formatCurrency(totalValue)}</td>
                <td class="${rendimento >= 0 ? 'positive-value' : 'negative-value'}">
                    ${Utils.formatPercentage(rendimento)}%
                </td>
                <td>
                    <button class="btn-icon edit-asset" data-asset-id="${asset.id}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-icon delete-asset" data-asset-id="${asset.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        if (tableBody.children.length === 0) {
            this.renderEmptyTableMessage(tableBody);
        }
    },

    renderEmptyTableMessage(tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-assets-message">
                    Nenhum ativo nesta carteira. Clique em "Adicionar Ativo" para começar.
                </td>
            </tr>
        `;
    },

    renderEmptyPortfolio(assetsListingDiv) {
        if (this.elements.balanceElement) {
            this.elements.balanceElement.textContent = 'R$ 0,00';
        }

        if (this.elements.returnElement) {
            this.elements.returnElement.textContent = '0,00%';
            this.elements.returnElement.className = 'positive-return';
        }

        const assetsTable = document.createElement('table');
        assetsTable.className = 'assets-table';
        assetsTable.id = 'assets-table';

        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Valor Atual</th>
                <th>Valor Total</th>
                <th>Rendimento</th>
                <th>Ações</th>
            </tr>
        `;
        assetsTable.appendChild(tableHead);

        const tableBody = document.createElement('tbody');
        tableBody.id = 'assets-table-body';

        this.renderEmptyTableMessage(tableBody);
        assetsTable.appendChild(tableBody);
        assetsListingDiv.appendChild(assetsTable);
    }
};

window.PortfolioManager = PortfolioManager;