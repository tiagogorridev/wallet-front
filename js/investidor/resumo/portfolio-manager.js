// GERENCIADOR DE PORTFÓLIO - CARREGAMENTO E EXIBIÇÃO DA CARTEIRA
const PortfolioManager = {
  elements: {},
  evolutionChart: null,
  distributionChart: null,

  // CONFIGURAÇÃO DOS ELEMENTOS DOM
  setElements(elementsConfig) {
    this.elements = elementsConfig;
  },

  // CONFIGURAÇÃO DOS GRÁFICOS
  setCharts(charts) {
    this.evolutionChart = charts.evolutionChart;
    this.distributionChart = charts.distributionChart;
  },

  // CARREGAMENTO INICIAL DO PORTFÓLIO
  loadPortfolio() {
    const selectedPortfolioName = localStorage.getItem("selectedPortfolio");
    const selectedWalletId = localStorage.getItem("selectedWalletId");

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
        const walletDesc = localStorage.getItem("selectedWalletDescription");
        if (walletDesc) {
          this.elements.walletDescInput.value = walletDesc;
        }
      }
    } else {
      this.fetchWallets();
    }
  },

  // BUSCA DETALHES DA CARTEIRA ESPECÍFICA
  fetchWalletDetails(walletId) {
    this.showLoading();
    APIService.getWalletById(walletId)
      .then((result) => {
        const walletData = result.data;
        if (walletData) {
          this.saveWalletToLocalStorage(walletData);
          this.updatePortfolioUI(walletData);
        } else {
          this.fetchWallets();
        }
      })
      .catch((error) => {
        this.hideLoading();
        Utils.showErrorMessage(
          this.elements.loadingMessage,
          `Erro: ${error.message}`
        );
        if (this.elements.portfolioHeader) {
          this.elements.portfolioHeader.textContent = `Carteira: ${
            localStorage.getItem("selectedPortfolio") || "Não encontrada"
          }`;
        }
      });
  },

  // BUSCA TODAS AS CARTEIRAS
  fetchWallets() {
    this.showLoading();
    APIService.getWallets()
      .then((result) => {
        const wallets = result.data.data || [];
        if (wallets.length > 0) {
          this.saveWalletToLocalStorage(wallets[0]);
          this.updatePortfolioUI(wallets[0]);
        } else {
          Utils.showErrorMessage(
            this.elements.loadingMessage,
            "Nenhuma carteira encontrada"
          );
        }
      })
      .catch((error) => {
        this.hideLoading();
        Utils.showErrorMessage(
          this.elements.loadingMessage,
          `Erro: ${error.message}`
        );
      });
  },

  // SALVA CARTEIRA NO LOCALSTORAGE
  saveWalletToLocalStorage(wallet) {
    localStorage.setItem("selectedPortfolio", wallet.nome);
    localStorage.setItem("selectedWalletId", wallet.id.toString());
    if (wallet.descricao) {
      localStorage.setItem("selectedWalletDescription", wallet.descricao);
    }
  },

  // EXIBE LOADING
  showLoading() {
    if (this.elements.loadingMessage) {
      this.elements.loadingMessage.style.display = "block";
    }
    const chartContainer = document.querySelector(".pie-chart-container");
    if (chartContainer) {
      const loadingDiv = document.createElement("div");
      loadingDiv.id = "loading-chart";
      loadingDiv.className = "loading-message";
      loadingDiv.innerHTML = "<p>Carregando distribuição...</p>";
      chartContainer.appendChild(loadingDiv);
    }
  },

  // OCULTA LOADING
  hideLoading() {
    if (this.elements.loadingMessage) {
      this.elements.loadingMessage.style.display = "none";
    }
    const loadingChart = document.getElementById("loading-chart");
    if (loadingChart) {
      loadingChart.remove();
    }
  },

  // ATUALIZA INTERFACE COM DADOS DO PORTFÓLIO
  updatePortfolioUI(portfolioData) {
    this.hideLoading();

    if (this.elements.portfolioHeader) {
      this.elements.portfolioHeader.textContent = `Carteira: ${
        portfolioData.nome || "Sem nome"
      }`;
    }

    if (this.elements.assetsTableContainer) {
      this.renderPortfolioDetails(portfolioData);
    }

    let assets = portfolioData.ativos || [];

    if (!assets.length && portfolioData.transacoes) {
      const assetsMap = this.createAssetsMapFromTransactions(
        portfolioData.transacoes
      );
      assets = Object.values(assetsMap);
    }

    const balanceToShow = portfolioData.saldo_total || 0;

    if (this.elements.balanceElement) {
      this.elements.balanceElement.textContent = `R$ ${Utils.formatCurrency(
        balanceToShow
      )}`;
    }

    if (
      this.elements.returnElement &&
      portfolioData.rentabilidade !== undefined
    ) {
      const rentabilidade = parseFloat(portfolioData.rentabilidade) * 100;
      const rentabilidadeClass =
        rentabilidade >= 0 ? "positive-return" : "negative-return";
      this.elements.returnElement.textContent = `${Utils.formatPercentage(
        rentabilidade
      )}%`;
      this.elements.returnElement.className = rentabilidadeClass;
    }

    // ATUALIZAÇÃO DOS GRÁFICOS
    if (this.distributionChart && portfolioData.assetDistribution) {
      const distributionData = portfolioData.assetDistribution.map((item) => ({
        class: item.category.toLowerCase(),
        label: item.category,
        percentage: item.percentage,
        value: item.value,
      }));
      this.distributionChart.updateData(distributionData);
    } else if (this.distributionChart && assets.length > 0) {
      const totalValue = this.calculateTotalBalance(assets);
      const categories = {};

      assets.forEach((asset) => {
        const category = asset.categoria || "OUTROS";
        const value =
          asset.valor_total ||
          asset.quantidade * (asset.preco_atual || asset.valor_unitario);

        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += value;
      });

      const distributionData = Object.keys(categories).map((category) => {
        const value = categories[category];
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        return {
          class: Utils.getCategoryClass(category).toLowerCase(),
          label: Utils.getCategoryLabel(category),
          percentage: percentage,
          value: value,
        };
      });

      this.distributionChart.updateData(distributionData);
    }
  },

  // CÁLCULO DO SALDO TOTAL
  calculateTotalBalance(assets) {
    let total = 0;

    if (Array.isArray(assets)) {
      assets.forEach((asset) => {
        if (asset.quantidade > 0) {
          const value =
            asset.valor_total ||
            asset.quantidade * (asset.preco_atual || asset.valor_unitario);
          total += value;
        }
      });
    }

    return total;
  },

  // RENDERIZAÇÃO DOS DETALHES DO PORTFÓLIO
  renderPortfolioDetails(portfolioData) {
    this.elements.assetsTableContainer.innerHTML = "";

    const portfolioInfo = document.createElement("div");
    portfolioInfo.className = "portfolio-info";
    const descriptionElement = document.createElement("p");
    descriptionElement.className = "portfolio-description";
    descriptionElement.textContent = `Descrição: ${
      portfolioData.descricao || "Sem descrição"
    }`;
    portfolioInfo.appendChild(descriptionElement);
    this.elements.assetsTableContainer.appendChild(portfolioInfo);

    const assetsListDiv = document.createElement("div");
    assetsListDiv.className = "assets-list";
    const assetsHeader = document.createElement("h3");
    assetsHeader.textContent = "Ativos na Carteira";
    assetsListDiv.appendChild(assetsHeader);

    const assetsListingDiv = this.createAssetsListingContainer();
    assetsListDiv.appendChild(assetsListingDiv);
    this.elements.assetsTableContainer.appendChild(assetsListDiv);

    const transactions = portfolioData.transacoes || [];

    if (transactions.length > 0) {
      this.processPortfolioTransactions(portfolioData, assetsListingDiv);
    } else {
      this.renderEmptyPortfolio(assetsListingDiv);
    }
  },

  // CRIAÇÃO DO CONTAINER DE LISTAGEM
  createAssetsListingContainer() {
    const assetsListingDiv = document.createElement("div");
    assetsListingDiv.id = "assets-listing";

    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loading-assets";
    loadingDiv.className = "loading-message";
    loadingDiv.style.display = "none";
    loadingDiv.innerHTML = "<p>Carregando ativos...</p>";
    assetsListingDiv.appendChild(loadingDiv);

    return assetsListingDiv;
  },

  // PROCESSAMENTO DAS TRANSAÇÕES DO PORTFÓLIO
  processPortfolioTransactions(portfolioData, assetsListingDiv) {
    const assets = portfolioData.ativos || [];
    if (assets.length > 0) {
      const tableContainer = this.createAssetsTable(assets);
      assetsListingDiv.appendChild(tableContainer);
    } else {
      const transactions = portfolioData.transacoes || [];
      APIService.fetchFromAPI("/assets", "GET")
        .then((result) => {
          const assetsApi = result.data.data || [];
          const assetsById = {};
          assetsApi.forEach((asset) => {
            assetsById[asset.id] = asset;
          });
          const assetsMap = this.createAssetsMapFromTransactions(
            transactions,
            assetsById
          );
          const tableContainer = this.createAssetsTable(
            Object.values(assetsMap)
          );
          assetsListingDiv.appendChild(tableContainer);
        })
        .catch((error) => {
          const assetsMap = this.createAssetsMapFromTransactions(transactions);
          const tableContainer = this.createAssetsTable(
            Object.values(assetsMap)
          );
          assetsListingDiv.appendChild(tableContainer);
        });
    }
  },

  // CRIAÇÃO DO MAPA DE ATIVOS A PARTIR DAS TRANSAÇÕES
  createAssetsMapFromTransactions(transactions, assetsById = {}) {
    const assetsMap = {};

    transactions.forEach((transaction) => {
      const assetId = transaction.id_ativo;
      if (!assetId) return;

      if (!assetsMap[assetId]) {
        const assetData = assetsById[assetId];
        assetsMap[assetId] = {
          id: assetId,
          nome:
            (assetData && assetData.nome) ||
            transaction.nome_ativo ||
            "Ativo sem nome",
          simbolo: (assetData && assetData.simbolo) || "",
          categoria:
            transaction.tipo || (assetData && assetData.tipo) || "OUTROS",
          quantidade: 0,
          valor_unitario: transaction.valor_unitario || 0,
          preco_atual:
            (assetData && assetData.preco_atual) ||
            transaction.valor_unitario ||
            0,
          valor_total: 0,
          investimento_inicial: 0,
          transaction_id: transaction.id,
        };
      }

      assetsMap[assetId].quantidade += transaction.quantidade;
      assetsMap[assetId].investimento_inicial +=
        transaction.valor_total ||
        transaction.quantidade * transaction.valor_unitario;
    });

    Object.values(assetsMap).forEach((asset) => {
      if (asset.quantidade > 0) {
        const currentValue = asset.preco_atual || asset.valor_unitario;
        asset.valor_total = asset.quantidade * currentValue;
      }
    });

    return assetsMap;
  },

  // FORMATAÇÃO INTELIGENTE DE QUANTIDADE
  formatSmartQuantity(quantity) {
    if (quantity % 1 === 0) {
      return quantity.toLocaleString("pt-BR");
    }

    const formatted = quantity.toFixed(2);
    return parseFloat(formatted).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  },

  // CRIAÇÃO DA TABELA DE ATIVOS
  createAssetsTable(assets) {
    const assetsTable = document.createElement("table");
    assetsTable.className = "assets-table";
    assetsTable.id = "assets-table";

    const tableHead = document.createElement("thead");
    tableHead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Valor de Compra</th>
                <th>Valor Comprado</th>
                <th>Ações</th>
            </tr>
        `;
    assetsTable.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    tableBody.id = "assets-table-body";

    this.populateTableBody(assets, tableBody);
    assetsTable.appendChild(tableBody);

    return assetsTable;
  },

  // PREENCHIMENTO DO CORPO DA TABELA
  populateTableBody(assets, tableBody) {
    tableBody.innerHTML = "";

    assets.forEach((asset) => {
      if (asset.quantidade <= 0) return;

      const row = document.createElement("tr");
      row.dataset.assetId = asset.id;
      if (asset.transaction_id) {
        row.dataset.transactionId = asset.transaction_id;
      }

      const purchaseValue = asset.valor_unitario;
      const currentPrice = asset.preco_atual || asset.valor_unitario;
      const currentTotalValue = asset.quantidade * currentPrice;

      const displayName = asset.simbolo
        ? `${asset.nome} (${asset.simbolo})`
        : asset.nome;
      const formattedQuantity = this.formatSmartQuantity(asset.quantidade);

      row.innerHTML = `
                <td>${displayName}</td>
                <td>
                    <span class="asset-category category-${Utils.getCategoryClass(
                      asset.categoria
                    )}">
                        ${Utils.getCategoryLabel(asset.categoria)}
                    </span>
                </td>
                <td>${formattedQuantity}</td>
                <td>R$ ${Utils.formatCurrency(purchaseValue)}</td>
                <td>R$ ${Utils.formatCurrency(currentTotalValue)}</td>
                <td>
                    <button class="btn-icon edit-asset" data-asset-id="${
                      asset.id
                    }">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-icon delete-asset" data-asset-id="${
                      asset.transaction_id || asset.id
                    }">
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

  // MENSAGEM DE TABELA VAZIA
  renderEmptyTableMessage(tableBody) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-assets-message">
                    Nenhum ativo nesta carteira. Clique em "Adicionar Ativo" para começar.
                </td>
            </tr>
        `;
  },

  // RENDERIZAÇÃO DE PORTFÓLIO VAZIO
  renderEmptyPortfolio(assetsListingDiv) {
    if (this.elements.balanceElement) {
      this.elements.balanceElement.textContent = "R$ 0,00";
    }

    if (this.elements.returnElement) {
      this.elements.returnElement.textContent = "0,00%";
      this.elements.returnElement.className = "positive-return";
    }

    const assetsTable = document.createElement("table");
    assetsTable.className = "assets-table";
    assetsTable.id = "assets-table";

    const tableHead = document.createElement("thead");
    tableHead.innerHTML = `
            <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Valor de Compra</th>
                <th>Valor Comprado</th>
                <th>Ações</th>
            </tr>
        `;
    assetsTable.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    tableBody.id = "assets-table-body";

    this.renderEmptyTableMessage(tableBody);
    assetsTable.appendChild(tableBody);
    assetsListingDiv.appendChild(assetsTable);
  },
};

window.PortfolioManager = PortfolioManager;
