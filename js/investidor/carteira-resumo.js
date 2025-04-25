document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://191.239.116.115:8080';
    
    class CurrentWalletComponent {
        constructor() {
            this.loadingElement = document.getElementById('loading-assets');
            this.assetsTableContainer = document.getElementById('assets-table-container');
            this.carteiraTitle = document.querySelector('.assets-header h2');
        }
        
        async initialize() {
            console.log("Inicializando componente de carteira atual");
            console.log("localStorage values on init:", {
                selectedWalletId: localStorage.getItem('selectedWalletId'),
                selectedPortfolio: localStorage.getItem('selectedPortfolio')
            });
            
            this.setupEventListeners();
            await this.loadCurrentWallet();
        }
        
        setupEventListeners() {
            // Listen for portfolio change events from the header dropdown
            document.addEventListener('portfolioChanged', async (event) => {
                console.log('Evento portfolioChanged recebido:', event.detail.portfolio);
                // Save selected wallet ID to localStorage - já deve estar sendo feito no header, mas garantimos aqui
                localStorage.setItem('selectedWalletId', event.detail.portfolio.id);
                localStorage.setItem('selectedPortfolio', event.detail.portfolio.nome);
                
                // Reload wallet data with the new selection
                await this.loadCurrentWallet();
            });
        }
        
        async loadCurrentWallet() {
            this.showLoading();
            
            try {
                // Get selected wallet ID from localStorage
                const selectedWalletId = this.getSelectedWalletId();
                
                if (!selectedWalletId) {
                    console.log("Nenhum ID de carteira encontrado, mostrando mensagem");
                    this.showNoWalletSelected();
                    return;
                }
                
                console.log("Carregando carteira com ID:", selectedWalletId);
                
                // Get authentication token
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('Usuário não autenticado');
                    this.showNoWalletSelected();
                    return;
                }
                
                // Load wallet details
                const walletResponse = await fetch(`${API_URL}/wallets/${selectedWalletId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log("Resposta da API de carteira:", walletResponse.status);
                
                if (!walletResponse.ok) {
                    throw new Error(`Erro ao carregar carteira: ${walletResponse.status}`);
                }
                
                const walletData = await walletResponse.json();
                console.log("Dados da carteira recebidos:", walletData);
                this.currentWallet = walletData.data;
                
                // Update section title with wallet name
                const walletName = this.currentWallet?.nome || localStorage.getItem('selectedPortfolio') || 'Sem nome';
                if (this.carteiraTitle) {
                    this.carteiraTitle.textContent = `Carteira: ${walletName}`;
                }
                
                // Load wallet assets
                const assetsResponse = await fetch(`${API_URL}/wallets/${selectedWalletId}/assets`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log("Resposta da API de ativos:", assetsResponse.status);
                
                if (!assetsResponse.ok) {
                    throw new Error(`Erro ao carregar ativos: ${assetsResponse.status}`);
                }
                
                const assetsData = await assetsResponse.json();
                console.log("Dados dos ativos recebidos:", assetsData);
                this.currentAssets = assetsData.data || [];
                
                // Render wallet data and assets
                this.renderWalletData();
                
                // Update charts if the function exists
                if (typeof updateChartsWithWalletData === 'function') {
                    updateChartsWithWalletData(this.currentWallet, this.currentAssets);
                }
                
            } catch (error) {
                console.error('Erro ao carregar carteira atual:', error);
                this.showErrorMessage(error.message);
            }
        }
        
        getSelectedWalletId() {
            // Check if there's a selected wallet ID in localStorage
            const selectedWalletId = localStorage.getItem('selectedWalletId');
            console.log("ID da carteira obtido do localStorage:", selectedWalletId);
            
            // If no specific ID, try to fetch the first available wallet
            if (!selectedWalletId) {
                console.log('ID da carteira não encontrado no localStorage');
                this.fetchFirstAvailableWallet();
                return null;
            }
            
            return selectedWalletId;
        }
        
        async fetchFirstAvailableWallet() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return;
                
                console.log("Buscando primeira carteira disponível...");
                
                const response = await fetch(`${API_URL}/wallets`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log("Resposta da API de carteiras:", response.status);
                
                if (!response.ok) return;
                
                const result = await response.json();
                const carteiras = result.data.data || [];
                
                console.log("Carteiras disponíveis:", carteiras);
                
                if (carteiras.length > 0) {
                    console.log("Primeira carteira encontrada:", carteiras[0]);
                    localStorage.setItem('selectedWalletId', carteiras[0].id);
                    localStorage.setItem('selectedPortfolio', carteiras[0].nome);
                    
                    // Reload wallet
                    this.loadCurrentWallet();
                } else {
                    console.log("Nenhuma carteira encontrada");
                }
            } catch (error) {
                console.error('Erro ao buscar primeira carteira disponível:', error);
            }
        }
        
        renderWalletData() {
            if (!this.currentWallet) {
                this.showNoWalletSelected();
                return;
            }
            
            // Create content for assets section based on available data
            let content = `
                <div class="wallet-summary">
                    <h3>${this.currentWallet.nome || 'Minha Carteira'}</h3>
                    <div class="wallet-info">
                        <div class="info-item">
                            <span class="label">Valor Total:</span>
                            <span class="value">${this.formatCurrency(this.currentWallet.saldo_total || 0)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            // Render assets table if they exist
            if (this.currentAssets && this.currentAssets.length > 0) {
                content += `
                    <div class="assets-table-wrapper">
                        <table class="assets-table">
                            <thead>
                                <tr>
                                    <th>Símbolo</th>
                                    <th>Tipo</th>
                                    <th>Quantidade</th>
                                    <th>Preço Compra</th>
                                    <th>Valor Atual</th>
                                    <th>Retorno</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                this.currentAssets.forEach(asset => {
                    // Calculate asset return
                    const investedValue = asset.preco_compra * asset.quantidade;
                    const currentValue = asset.valor_atual || investedValue;
                    const assetReturn = currentValue - investedValue;
                    const assetReturnPercentage = investedValue > 0 ? (assetReturn / investedValue) * 100 : 0;
                    const returnClass = assetReturnPercentage >= 0 ? 'positive-return' : 'negative-return';
                    
                    content += `
                        <tr>
                            <td>${asset.simbolo}</td>
                            <td>${this.formatAssetType(asset.tipo)}</td>
                            <td>${asset.quantidade}</td>
                            <td>${this.formatCurrency(asset.preco_compra)}</td>
                            <td>${this.formatCurrency(asset.valor_atual || asset.preco_compra)}</td>
                            <td class="${returnClass}">${assetReturnPercentage.toFixed(2)}%</td>
                            <td>${this.formatDate(asset.data_compra)}</td>
                        </tr>
                    `;
                });
                
                content += `
                            </tbody>
                        </table>
                    </div>
                `;
            } else {
                content += `
                    <div class="no-assets-message">
                        <p>Nenhum ativo encontrado nesta carteira.</p>
                    </div>
                `;
            }
            
            // Update assets section content
            this.assetsTableContainer.innerHTML = content;
            this.hideLoading();
        }
        
        formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        }
        
        formatDate(dateString) {
            if (!dateString) return 'Data não disponível';
            
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch (error) {
                return 'Data inválida';
            }
        }
        
        formatAssetType(type) {
            const types = {
                'acao': 'Ação',
                'fii': 'FII',
                'renda_fixa': 'Renda Fixa',
                'cripto': 'Criptomoeda'
            };
            
            return types[type] || type;
        }
        
        showLoading() {
            if (this.loadingElement) {
                this.loadingElement.style.display = 'block';
            }
            
            // Hide other elements if they exist
            if (this.assetsTableContainer) {
                const children = this.assetsTableContainer.children;
                for (let i = 0; i < children.length; i++) {
                    if (children[i] !== this.loadingElement) {
                        children[i].style.display = 'none';
                    }
                }
            }
        }
        
        hideLoading() {
            if (this.loadingElement) {
                this.loadingElement.style.display = 'none';
            }
        }
        
        showNoWalletSelected() {
            this.hideLoading();
            if (this.assetsTableContainer) {
                const selectedPortfolioName = localStorage.getItem('selectedPortfolio') || 'não selecionada';
                
                this.assetsTableContainer.innerHTML = `
                    <div class="no-wallet-selected">
                        <p>Nenhum ativo encontrado na carteira "${selectedPortfolioName}".</p>
                        <p>Selecione outra carteira no menu superior ou adicione ativos a esta carteira.</p>
                    </div>
                `;
                
                // Update the title as well
                if (this.carteiraTitle) {
                    this.carteiraTitle.textContent = `Carteira: ${selectedPortfolioName}`;
                }
            }
        }
        
        showErrorMessage(message) {
            this.hideLoading();
            if (this.assetsTableContainer) {
                this.assetsTableContainer.innerHTML = `
                    <div class="error-message">
                        <p>Erro: ${message}</p>
                        <button id="try-again-btn" class="btn-primary">Tentar Novamente</button>
                    </div>
                `;
                
                // Add event to try again button
                const tryAgainBtn = document.getElementById('try-again-btn');
                if (tryAgainBtn) {
                    tryAgainBtn.addEventListener('click', () => {
                        this.loadCurrentWallet();
                    });
                }
            }
        }
    }
    
    // Function to update charts with wallet data
    function updateChartsWithWalletData(wallet, assets) {
        // Check if chart elements exist
        const patrimonioChart = document.getElementById('patrimonioChart');
        const assetsDistributionChart = document.getElementById('assetsDistributionChart');
        
        if (!patrimonioChart || !assetsDistributionChart) {
            console.log('Elementos dos gráficos não encontrados');
            return;
        }
        
        if (!window.Chart) {
            console.error('Chart.js não está disponível');
            return;
        }
        
        // Example of data for asset distribution chart
        if (assets && assets.length > 0) {
            updateAssetsDistributionChart(assets);
        }
        
        // Note: The patrimony evolution chart would need historical data
        // that would probably come from another API endpoint
    }
    
    function updateAssetsDistributionChart(assets) {
        const ctx = document.getElementById('assetsDistributionChart').getContext('2d');
        const legendContainer = document.getElementById('pie-chart-legend');
        
        // Aggregate data by asset type
        const assetsByType = assets.reduce((acc, asset) => {
            const type = asset.tipo || 'outro';
            const currentValue = asset.valor_atual || (asset.preco_compra * asset.quantidade);
            
            if (!acc[type]) {
                acc[type] = 0;
            }
            
            acc[type] += currentValue;
            return acc;
        }, {});
        
        // Format data for chart
        const types = Object.keys(assetsByType);
        const data = Object.values(assetsByType);
        const typeColors = {
            'acao': '#FF6384',
            'fii': '#36A2EB',
            'renda_fixa': '#FFCE56',
            'cripto': '#4BC0C0',
            'outro': '#9966FF'
        };
        
        const colors = types.map(type => typeColors[type] || '#9966FF');
        const typeLabels = {
            'acao': 'Ações',
            'fii': 'Fundos Imobiliários',
            'renda_fixa': 'Renda Fixa',
            'cripto': 'Criptomoedas',
            'outro': 'Outros'
        };
        
        const labels = types.map(type => typeLabels[type] || type);
        if (window.assetsChart) {
            window.assetsChart.destroy();
        }
        window.assetsChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Update custom legend
        if (legendContainer) {
            let legendHTML = '';
            
            types.forEach((type, index) => {
                const value = assetsByType[type];
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                
                legendHTML += `
                    <div class="legend-item">
                        <span class="color-box" style="background-color: ${colors[index]}"></span>
                        <span class="label">${labels[index]}</span>
                        <span class="value">${formatCurrency(value)} (${percentage}%)</span>
                    </div>
                `;
            });
            
            legendContainer.innerHTML = legendHTML;
        }
    }
    
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
    
    // Initialize current wallet component
    const currentWalletComponent = new CurrentWalletComponent();
    currentWalletComponent.initialize();
    
    // Expose updateChartsWithWalletData function globally
    window.updateChartsWithWalletData = updateChartsWithWalletData;
});