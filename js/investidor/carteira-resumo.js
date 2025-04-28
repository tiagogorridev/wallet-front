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
        returnElement: document.getElementById('portfolio-return')
    };
    let evolutionChart = null;
    let distributionChart = null;

    initializeCharts();
    loadPortfolio();
    initializeModalComponents();
    
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
                console.error('Erro:', error);
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
                console.error('Erro:', error);
                showErrorMessage(`Erro ao carregar carteiras: ${error.message}`);
            });
    }

    function fetchFromAPI(endpoint, method) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        return fetch(`${API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    window.location.href = '../../index.html';
                    throw new Error('Sessão expirada. Por favor, faça login novamente.');
                }
                throw new Error('Erro ao acessar API');
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
        
        const portfolioInfo = document.createElement('div');
        portfolioInfo.className = 'portfolio-info';
        
        const descriptionElement = document.createElement('p');
        descriptionElement.className = 'portfolio-description';
        descriptionElement.textContent = `Descrição: ${portfolioData.descricao || "Sem descrição"}`;
        portfolioInfo.appendChild(descriptionElement);
        
        if (elements.assetsTableContainer) {
            elements.assetsTableContainer.innerHTML = '';
            elements.assetsTableContainer.appendChild(portfolioInfo);
        }
        
        updateDistributionChart(portfolioData);
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
});

class ModalComponent {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeButton = this.modal.querySelector('.close-button');
        this.cancelButton = this.modal.querySelector('.cancel-btn');
    }
    
    initialize(triggerButtonId) {
        const triggerButton = document.getElementById(triggerButtonId);
        
        triggerButton.addEventListener('click', () => this.openModal());
        this.closeButton.addEventListener('click', () => this.closeModal());
        
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => this.closeModal());
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.modal.style.display = 'block';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
    }
}