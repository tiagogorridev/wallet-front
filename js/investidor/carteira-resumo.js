document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://191.239.116.115:8080';
    const elements = {
        portfolioHeader: document.querySelector('.assets-header h2'),
        assetsTableContainer: document.getElementById('assets-table-container'),
        loadingMessage: document.getElementById('loading-assets'),
        portfolioNameElement: document.querySelector('.portfolio-selector span'),
        walletNameInput: document.getElementById('wallet-name'),
        walletDescInput: document.getElementById('wallet-description'),
        pieChartLegend: document.getElementById('pie-chart-legend'),
        balanceElement: document.getElementById('portfolio-balance'),
        returnElement: document.getElementById('portfolio-return'),
        addAssetForm: document.getElementById('addAssetForm'),
        assetDropdown: document.getElementById('assetDropdown'),
        addAssetButton: document.getElementById('headerAddAssetBtn')
    };
    let evolutionChart = null;
    let distributionChart = null;

    class ModalComponent {
        constructor(modalId) {
            this.modal = document.getElementById(modalId);
            this.closeButton = this.modal ? this.modal.querySelector('.close-button') : null;
            this.cancelButton = this.modal ? this.modal.querySelector('.cancel-btn') : null;
        }
        
        initialize(triggerButtonId) {
            const triggerButton = document.getElementById(triggerButtonId);
            
            if (!this.modal || !triggerButton) return;
            
            triggerButton.addEventListener('click', () => this.openModal());
            
            if (this.closeButton) {
                this.closeButton.addEventListener('click', () => this.closeModal());
            }
            
            if (this.cancelButton) {
                this.cancelButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.closeModal();
                });
            }
            
            window.addEventListener('click', (event) => {
                if (event.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        openModal() {
            if (this.modal) {
                this.modal.style.display = 'flex';
                document.dispatchEvent(new CustomEvent('modalOpened', { 
                    detail: { modalId: this.modal.id } 
                }));
            }
        }

        closeModal() {
            if (this.modal) {
                this.modal.style.display = 'none';
                const form = this.modal.querySelector('form');
                if (form) form.reset();
            }
        }
    }

    initializeCharts();
    loadPortfolio();
    initializeModalComponents();
    
    if (elements.addAssetButton) {
        elements.addAssetButton.addEventListener('click', () => {
            loadAssetsDropdown();
        });
    }
    
    if (elements.addAssetForm) {
        elements.addAssetForm.addEventListener('submit', addAsset);
    }
    
    document.addEventListener('portfolioChanged', function(e) {
        if (e.detail && e.detail.portfolio) {
            updatePortfolioUI(e.detail.portfolio);
        }
    });
    
    function initializeCharts() {
        const evolutionComponent = new EvolutionPatrimonyComponent('patrimonioChart', 'patrimonyFilter');
        evolutionComponent.initialize();
        evolutionChart = evolutionComponent.chartInstance;
        
        const distributionComponent = new AssetsDistributionComponent('assetsDistributionChart', 'pie-chart-legend');
        distributionComponent.initialize();
        distributionChart = distributionComponent.chartInstance;
    }
    
    function initializeModalComponents() {
        const addAssetModal = new ModalComponent('addAssetModal');
        addAssetModal.initialize('headerAddAssetBtn');
        
        const modalTrigger = document.getElementById('headerAddAssetBtn');
        if (modalTrigger) {
            modalTrigger.addEventListener('click', () => setTimeout(loadAssetsDropdown, 100));
        }
    }

    // Função para calcular o saldo total com base nas transações
function calcularSaldoTotal(carteira) {
    // Verifica se existem transações
    if (!carteira.transacoes || !Array.isArray(carteira.transacoes) || carteira.transacoes.length === 0) {
      return 0; // Retorna 0 se não houver transações
    }
    
    // Calcula o saldo somando todos os valores totais das transações
    const saldoTotal = carteira.transacoes.reduce((total, transacao) => {
      // Verifica se o valor_total existe e é um número
      const valorTransacao = typeof transacao.valor_total === 'number' ? transacao.valor_total : 0;
      return total + valorTransacao;
    }, 0);
    
    return saldoTotal;
  }
  
  // Exemplo de como atualizar o saldo total na carteira
  function atualizarSaldoTotalCarteira(carteira) {
    carteira.saldo_total = calcularSaldoTotal(carteira);
    return carteira;
  }
  
  // Para implementação no arquivo carteira-resumo.js, você pode adicionar:
  document.addEventListener('DOMContentLoaded', function() {
    // Supondo que a carteira é obtida de uma API ou outro fonte de dados
    fetch(`${API_URL}/carteiras/${id_carteira}`)
      .then(response => response.json())
      .then(carteira => {
        // Atualiza o saldo total antes de exibir
        carteira = atualizarSaldoTotalCarteira(carteira);
        
        // Exibe as informações da carteira incluindo o saldo total atualizado
        exibirInformacoesCarteira(carteira);
      })
      .catch(error => {
        console.error("Erro ao obter dados da carteira:", error);
        mostrarMensagem("Erro ao carregar informações da carteira", "erro");
      });
  });
  
  // Função para exibir as informações da carteira na interface
  function exibirInformacoesCarteira(carteira) {
    document.getElementById('nome-carteira').textContent = carteira.nome;
    document.getElementById('descricao-carteira').textContent = carteira.descricao;
    document.getElementById('saldo-total').textContent = formatarValorMonetario(carteira.saldo_total);
    document.getElementById('rentabilidade').textContent = `${carteira.rentabilidade}%`;
    document.getElementById('total-aportado').textContent = formatarValorMonetario(carteira.total_aportado);
    
    // Exibe a lista de transações, se necessário
    exibirTransacoes(carteira.transacoes);
  }
  
  // Função auxiliar para formatar valores monetários
  function formatarValorMonetario(valor) {
    return valor !== null && valor !== undefined 
      ? `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`
      : 'R$ 0,00';
  }
    
    function loadPortfolio() {
        const selectedPortfolioName = localStorage.getItem('selectedPortfolio');
        const selectedWalletId = localStorage.getItem('selectedWalletId');
        
        if (selectedPortfolioName) {
            if (elements.portfolioNameElement) {
                elements.portfolioNameElement.textContent = selectedPortfolioName;
            }
            
            if (elements.portfolioHeader) {
                elements.portfolioHeader.textContent = `Carteira: ${selectedPortfolioName}`;
            }
            
            if (elements.walletNameInput) {
                elements.walletNameInput.value = selectedPortfolioName;
            }
        }
        
        if (selectedWalletId) {
            fetchWalletDetails(parseInt(selectedWalletId));
            
            if (elements.walletDescInput) {
                const walletDesc = localStorage.getItem('selectedWalletDescription');
                if (walletDesc) {
                    elements.walletDescInput.value = walletDesc;
                }
            }
        } else {
            fetchWallets();
        }
    }
    
    function fetchWalletDetails(walletId) {
        fetchFromAPI('/wallets', 'GET')
            .then(result => {
                const wallets = result.data.data || [];
                const selectedWallet = wallets.find(wallet => wallet.id === walletId);
                
                if (selectedWallet) {
                    saveWalletToLocalStorage(selectedWallet);
                    updatePortfolioUI(selectedWallet);
                } else if (wallets.length > 0) {
                    saveWalletToLocalStorage(wallets[0]);
                    updatePortfolioUI(wallets[0]);
                } else {
                    showErrorMessage('Nenhuma carteira encontrada');
                }
            })
            .catch(error => {
                showErrorMessage(`Erro ao carregar carteira: ${error.message}`);
                if (elements.portfolioHeader) {
                    elements.portfolioHeader.textContent = `Carteira: ${localStorage.getItem('selectedPortfolio') || "Não encontrada"}`;
                }
            });
    }
    
    function fetchWallets() {
        fetchFromAPI('/wallets', 'GET')
            .then(result => {
                const wallets = result.data.data || [];
                if (wallets.length > 0) {
                    saveWalletToLocalStorage(wallets[0]);
                    updatePortfolioUI(wallets[0]);
                } else {
                    showErrorMessage('Nenhuma carteira encontrada');
                }
            })
            .catch(error => {
                showErrorMessage(`Erro ao carregar carteiras: ${error.message}`);
            });
    }

    function fetchFromAPI(endpoint, method, body = null) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        if (body) options.body = JSON.stringify(body);
        
        return fetch(`${API_URL}${endpoint}`, options)
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    window.location.href = '../../index.html';
                    throw new Error('Sessão expirada. Por favor, faça login novamente.');
                }
                return response.json().then(data => {
                    throw new Error(data.msg || 'Erro ao acessar API');
                });
            }
            return response.json();
        })
        .then(result => {
            if (result.error) {
                throw new Error(result.msg || 'Erro na operação');
            }
            return result;
        });
    }
    
    function saveWalletToLocalStorage(wallet) {
        localStorage.setItem('selectedPortfolio', wallet.nome);
        localStorage.setItem('selectedWalletId', wallet.id.toString());
        if (wallet.descricao) {
            localStorage.setItem('selectedWalletDescription', wallet.descricao);
        }
    }
    
    function updatePortfolioUI(portfolioData) {
        if (elements.loadingMessage) {
            elements.loadingMessage.style.display = 'none';
        }
        
        if (elements.portfolioHeader) {
            elements.portfolioHeader.textContent = `Carteira: ${portfolioData.nome || "Sem nome"}`;
        }
        
        if (elements.balanceElement) {
            const saldoTotal = portfolioData.saldo_total || 0.00;
            elements.balanceElement.textContent = `R$ ${saldoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        if (elements.returnElement) {
            const rentabilidade = portfolioData.rentabilidade || 0.00;
            const rentabilidadeClass = rentabilidade >= 0 ? 'positive-return' : 'negative-return';
            elements.returnElement.textContent = `${rentabilidade.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
            elements.returnElement.className = rentabilidadeClass;
        }
        
        if (elements.assetsTableContainer) {
            elements.assetsTableContainer.innerHTML = '';
            
            const portfolioInfo = document.createElement('div');
            portfolioInfo.className = 'portfolio-info';
            
            const descriptionElement = document.createElement('p');
            descriptionElement.className = 'portfolio-description';
            descriptionElement.textContent = `Descrição: ${portfolioData.descricao || "Sem descrição"}`;
            portfolioInfo.appendChild(descriptionElement);
            
            elements.assetsTableContainer.appendChild(portfolioInfo);
            
            const assetsListDiv = document.createElement('div');
            assetsListDiv.className = 'assets-list';
            
            const assetsHeader = document.createElement('h3');
            assetsHeader.textContent = 'Ativos na Carteira';
            assetsListDiv.appendChild(assetsHeader);
            
            const assetsListingDiv = document.createElement('div');
            assetsListingDiv.id = 'assets-listing';
            
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-assets';
            loadingDiv.className = 'loading-message';
            loadingDiv.style.display = 'none';
            loadingDiv.innerHTML = '<p>Carregando ativos...</p>';
            assetsListingDiv.appendChild(loadingDiv);
            
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
            
            const transactions = portfolioData.transacoes || [];
            
            if (transactions.length > 0) {
                fetchFromAPI('/assets', 'GET')
                    .then(result => {
                        const assets = result.data.data || [];
                        const assetsById = {};
                        
                        assets.forEach(asset => {
                            assetsById[asset.id] = asset;
                        });
                        
                        const assetsMap = {};
                        
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
                        
                        populateTableBody(assetsMap, tableBody);
                        
                        assetsTable.appendChild(tableBody);
                        assetsListingDiv.appendChild(assetsTable);
                        assetsListDiv.appendChild(assetsListingDiv);
                        elements.assetsTableContainer.appendChild(assetsListDiv);
                        
                        updateDistributionChart(portfolioData);
                    })
                    .catch(error => {
                        // Se houver erro ao buscar ativos, usar apenas os dados das transações
                        const assetsMap = {};
                        
                        transactions.forEach(transaction => {
                            const assetId = transaction.id_ativo;
                            if (!assetId) return;
                            
                            if (!assetsMap[assetId]) {
                                assetsMap[assetId] = {
                                    id: assetId,
                                    nome: transaction.nome_ativo || 'Ativo sem nome',
                                    categoria: transaction.tipo || 'OUTROS',
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
                        
                        populateTableBody(assetsMap, tableBody);
                        
                        assetsTable.appendChild(tableBody);
                        assetsListingDiv.appendChild(assetsTable);
                        assetsListDiv.appendChild(assetsListingDiv);
                        elements.assetsTableContainer.appendChild(assetsListDiv);
                        
                        updateDistributionChart(portfolioData);
                    });
            } else {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-assets-message">
                            Nenhum ativo nesta carteira. Clique em "Adicionar Ativo" para começar.
                        </td>
                    </tr>
                `;
                
                assetsTable.appendChild(tableBody);
                assetsListingDiv.appendChild(assetsTable);
                assetsListDiv.appendChild(assetsListingDiv);
                elements.assetsTableContainer.appendChild(assetsListDiv);
                
                updateDistributionChart(portfolioData);
            }
        }
    }
    
    // Função auxiliar para popular o corpo da tabela
    function populateTableBody(assetsMap, tableBody) {
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
                    <span class="asset-category category-${getCategoryClass(asset.categoria)}">
                        ${getCategoryLabel(asset.categoria)}
                    </span>
                </td>
                <td>${asset.quantidade.toLocaleString('pt-BR', {minimumFractionDigits: 6, maximumFractionDigits: 6})}</td>
                <td>R$ ${currentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="${rendimento >= 0 ? 'positive-value' : 'negative-value'}">
                    ${rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
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
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-assets-message">
                        Nenhum ativo nesta carteira. Clique em "Adicionar Ativo" para começar.
                    </td>
                </tr>
            `;
        }
    }
    
    function displayAssetsFromTransactionsOnly(transactions, tableBody, assetsTable, assetsListingDiv, assetsListDiv) {
        const assetsMap = {};
        
        transactions.forEach(transaction => {
            const assetId = transaction.id_ativo;
            if (!assetId) return;
            
            if (!assetsMap[assetId]) {
                assetsMap[assetId] = {
                    id: assetId,
                    nome: transaction.nome_ativo || 'Ativo sem nome',
                    categoria: transaction.tipo || 'OUTROS',
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
            if (asset.quantidade <= 0) return;
            
            const row = document.createElement('tr');
            
            const currentValue = asset.valorUnitario;
            const totalValue = asset.quantidade * currentValue;
            const initialInvestment = asset.investimentoInicial;
            const profitLoss = totalValue - initialInvestment;
            const rendimento = initialInvestment > 0 ? (profitLoss / initialInvestment) * 100 : 0;
            
            row.innerHTML = `
                <td>${asset.nome}</td>
                <td>
                    <span class="asset-category category-${getCategoryClass(asset.categoria)}">
                        ${getCategoryLabel(asset.categoria)}
                    </span>
                </td>
                <td>${asset.quantidade.toLocaleString('pt-BR', {minimumFractionDigits: 6, maximumFractionDigits: 6})}</td>
                <td>R$ ${currentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>R$ ${totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="${rendimento >= 0 ? 'positive-value' : 'negative-value'}">
                    ${rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%
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
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-assets-message">
                        Nenhum ativo nesta carteira. Clique em "Adicionar Ativo" para começar.
                    </td>
                </tr>
            `;
        }
        
        assetsTable.appendChild(tableBody);
        assetsListingDiv.appendChild(assetsTable);
        assetsListDiv.appendChild(assetsListingDiv);
        elements.assetsTableContainer.appendChild(assetsListDiv);
    }

    function getCategoryClass(category) {
        const classes = {
            'CRIPTOMOEDAS': 'crypto',
            'ACOES': 'stocks',
            'RENDA_FIXA': 'fixed-income'
        };
        return classes[category] || 'other';
    }

    function getCategoryLabel(category) {
        const labels = {
            'CRIPTOMOEDAS': 'Criptomoedas',
            'ACOES': 'Ações',
            'RENDA_FIXA': 'Renda Fixa',
            'OUTROS': 'Outros'
        };
        return labels[category] || category;
    }
    
    function updateDistributionChart(portfolioData) {
        const allocations = portfolioData.alocacoes || {};
        
        if (allocations && distributionChart) {
            const distributionData = [
                { class: 'crypto', label: 'Criptomoedas', percentage: allocations.crypto || 0 },
                { class: 'fixed-income', label: 'Renda Fixa', percentage: allocations.rendaFixa || 0 },
                { class: 'stocks', label: 'Ações', percentage: allocations.acoes || 0 }
            ];
            
            const filteredData = distributionData.filter(item => item.percentage > 0);

            if (filteredData.length === 0) {
                filteredData.push(
                    { class: 'crypto', label: 'Criptomoedas', percentage: 50 },
                    { class: 'fixed-income', label: 'Renda Fixa', percentage: 50 }
                );
            }
            
            distributionChart.data.labels = filteredData.map(item => item.label);
            distributionChart.data.datasets[0].data = filteredData.map(item => item.percentage);
            distributionChart.update();
            
            updateChartLegend(filteredData);
        }
    }
    
    function updateChartLegend(data) {
        if (!elements.pieChartLegend) return;
        
        elements.pieChartLegend.innerHTML = '';
        data.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-color ${item.class}"></span>
                <span class="legend-label">${item.percentage}% ${item.label}</span>
            `;
            elements.pieChartLegend.appendChild(legendItem);
        });
    }
    
    function showErrorMessage(message) {
        if (elements.loadingMessage) {
            elements.loadingMessage.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }

    function loadAssetsDropdown() {
        const assetDropdown = document.getElementById('assetDropdown');
        
        if (!assetDropdown) return;
        
        assetDropdown.innerHTML = '<option value="">Carregando ativos...</option>';
        
        fetchFromAPI('/assets', 'GET')
            .then(result => {
                const assets = result.data.data || [];
                
                assetDropdown.innerHTML = '<option value="">Selecione um ativo</option>';
                
                if (!assets.length) {
                    assetDropdown.innerHTML = '<option value="">Nenhum ativo disponível</option>';
                    return;
                }
                
                const assetsByType = {};
                
                assets.forEach(asset => {
                    const type = asset.tipo;
                    if (!assetsByType[type]) {
                        assetsByType[type] = [];
                    }
                    assetsByType[type].push(asset);
                });
                
                for (const type in assetsByType) {
                    if (assetsByType[type].length > 0) {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = getTypeLabel(type);
                        
                        assetsByType[type].forEach(asset => {
                            const option = document.createElement('option');
                            option.value = asset.id;
                            option.textContent = asset.nome + (asset.simbolo ? ` (${asset.simbolo})` : '');
                            option.dataset.price = asset.preco_atual || '';
                            option.dataset.category = mapTypeToCategoryForForm(type);
                            option.dataset.name = asset.nome || '';
                            optgroup.appendChild(option);
                        });
                        
                        assetDropdown.appendChild(optgroup);
                    }
                }
                
                assetDropdown.addEventListener('change', function() {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption && selectedOption.value) {
                        const nameInput = document.getElementById('assetName');
                        const valueInput = document.getElementById('assetValuePerUnit');
                        const categorySelect = document.getElementById('assetCategory');
                        
                        if (nameInput) nameInput.value = selectedOption.dataset.name || selectedOption.textContent;
                        if (valueInput) valueInput.value = selectedOption.dataset.price || '';
                        if (categorySelect && selectedOption.dataset.category) {
                            categorySelect.value = selectedOption.dataset.category;
                        }
                    }
                });
            })
            .catch(error => {
                assetDropdown.innerHTML = '<option value="">Erro ao carregar ativos</option>';
                alert(`Erro ao carregar a lista de ativos: ${error.message}`);
            });
    }
    
    function getTypeLabel(type) {
        const labels = {
            'CRYPTO': 'Criptomoedas',
            'ACAO': 'Ações',
            'RENDA_FIXA': 'Renda Fixa'
        };
        return labels[type] || type;
    }

    function mapTypeToCategoryForForm(type) {
        const mapping = {
            'CRYPTO': 'CRIPTOMOEDAS',
            'ACAO': 'ACOES', 
            'RENDA_FIXA': 'RENDA_FIXA'
        };
        return mapping[type] || type;
    }
    
    function addAsset(event) {
        event.preventDefault();
        
        const assetName = document.getElementById('assetName').value;
        
        if (!assetName) {
            alert('Por favor, insira um nome para o ativo');
            return;
        }
        
        const assetCategory = document.getElementById('assetCategory').value;
        const assetValuePerUnit = parseFloat(document.getElementById('assetValuePerUnit').value);
        const assetQuantity = parseFloat(document.getElementById('assetQuantity').value);
        const datePicker = document.getElementById('assetPurchaseDate');
        const assetPurchaseDate = datePicker.value;
        
        if (assetCategory === 'ACOES' && !Number.isInteger(assetQuantity)) {
            alert('Para ações, a quantidade deve ser um número inteiro');
            return;
        }
        
        const token = localStorage.getItem('accessToken');
        const walletId = localStorage.getItem('selectedWalletId');
        
        if (!token || !walletId) {
            alert('Sessão expirada ou carteira não selecionada. Por favor, faça login novamente.');
            window.location.href = '../../index.html';
            return;
        }
        
        const transactionData = {
            id_carteira: parseInt(walletId),
            nome_ativo: assetName,
            tipo: "COMPRA",
            quantidade: assetQuantity,
            valor_unitario: assetValuePerUnit,
            data_transacao: assetPurchaseDate,
            taxa_corretagem: 0.0,
            notas: ""
        };
        
        fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.msg || 'Erro ao adicionar ativo');
                });
            }
            return response.json();
        })
        .then(result => {
            alert('Ativo adicionado com sucesso!');
            document.getElementById('addAssetModal').style.display = 'none';
            document.getElementById('addAssetForm').reset();
            
            const walletId = localStorage.getItem('selectedWalletId');
            if (walletId) {
                fetchWalletDetails(parseInt(walletId));
            }
        })
        .catch(error => {
            alert(`Erro ao adicionar ativo: ${error.message}`);
        });
    }
});