const API_URL = '191.239.116.115:8080';

document.addEventListener('DOMContentLoaded', function() {
    const portfolioNameInput = document.getElementById('portfolio-name');
    if (portfolioNameInput) {
        portfolioNameInput.value = "";
        portfolioNameInput.placeholder = "Carregando...";
    }
    loadSelectedPortfolio();
    initAllocation();
    initSaveButtons();
    document.addEventListener('portfolioChanged', function(e) {
        if (e.detail && e.detail.portfolio) {
            updatePortfolioUI(e.detail.portfolio);
        }
    });
});

function loadSelectedPortfolio() {
    const selectedPortfolioName = localStorage.getItem('selectedPortfolio');
    const selectedWalletId = localStorage.getItem('selectedWalletId');
    
    if (selectedPortfolioName) {
        const portfolioNameInput = document.getElementById('portfolio-name');
        if (portfolioNameInput) {
            portfolioNameInput.value = selectedPortfolioName;
        }
    }
    
    if (selectedWalletId) {
        fetchWalletDetails(selectedWalletId);
    } else {
        loadPortfolioFromBackend();
    }
}

function fetchWalletDetails(walletId) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }
    
    fetch(`http://${API_URL}/wallets/${walletId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar detalhes da carteira');
        }
        return response.json();
    })
    .then(result => {
        if (result.error) {
            throw new Error(result.msg || 'Erro ao carregar detalhes da carteira');
        }
        
        if (result.data && result.data.data) {
            updatePortfolioUI(result.data.data);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        const portfolioNameInput = document.getElementById('portfolio-name');
        if (portfolioNameInput) {
            portfolioNameInput.value = localStorage.getItem('selectedPortfolio') || "Carteira não encontrada";
        }
    });
}

function loadPortfolioFromBackend() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
    }
    
    fetch(`http://${API_URL}/wallets`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar carteiras');
        }
        return response.json();
    })
    .then(result => {
        if (result.error) {
            throw new Error(result.msg || 'Erro ao carregar carteiras');
        }
        
        const carteiras = result.data.data || [];
        if (carteiras.length > 0) {
            // Se houver carteiras, selecionar a primeira
            const primeiraCarteira = carteiras[0];
            localStorage.setItem('selectedPortfolio', primeiraCarteira.nome);
            localStorage.setItem('selectedWalletId', primeiraCarteira.id);
            updatePortfolioUI(primeiraCarteira);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        const portfolioNameInput = document.getElementById('portfolio-name');
        if (portfolioNameInput) {
            portfolioNameInput.value = "Carteira não encontrada";
            portfolioNameInput.disabled = true;
        }
    });
}

function updatePortfolioUI(portfolioData) {
    const portfolioNameInput = document.getElementById('portfolio-name');
    const currencySelect = document.getElementById('currency-select');
    
    if (!portfolioData) {
        if (portfolioNameInput) {
            portfolioNameInput.value = "Carteira não encontrada";
            portfolioNameInput.disabled = true;
        }
        return;
    }
    
    if (portfolioNameInput) {
        portfolioNameInput.value = portfolioData.nome || portfolioData.name || "Sem nome";
    }
    
    if (currencySelect && (portfolioData.moeda || portfolioData.currency)) {
        const currencyValue = portfolioData.moeda || portfolioData.currency;
        for (let i = 0; i < currencySelect.options.length; i++) {
            if (currencySelect.options[i].text.includes(currencyValue)) {
                currencySelect.selectedIndex = i;
                break;
            }
        }
    }
    
    const allocations = portfolioData.alocacoes || portfolioData.allocations;
    if (allocations) {
        const cryptoInput = document.getElementById('crypto-allocation');
        const fixedIncomeInput = document.getElementById('fixed-income-allocation');
        const stocksInput = document.getElementById('stocks-allocation');
        
        if (cryptoInput && (allocations.crypto !== undefined || allocations.criptomoedas !== undefined)) {
            cryptoInput.value = allocations.crypto || allocations.criptomoedas || 0;
        }
        
        if (fixedIncomeInput && (allocations.fixedIncome !== undefined || allocations.rendaFixa !== undefined)) {
            fixedIncomeInput.value = allocations.fixedIncome || allocations.rendaFixa || 0;
        }
        
        if (stocksInput && (allocations.stocks !== undefined || allocations.acoes !== undefined)) {
            stocksInput.value = allocations.stocks || allocations.acoes || 0;
        }
        
        updateTotalAllocation();
    }
}

function initAllocation() {
    const allocationInputs = document.querySelectorAll('.allocation-value');
    allocationInputs.forEach(input => {
        input.addEventListener('input', updateTotalAllocation);
    });
    updateTotalAllocation();
    const savedProfile = localStorage.getItem('investorProfile');
    if (savedProfile) {
        updateAllocationByProfile(savedProfile);
    }
}

function updateAllocationByProfile(profileType) {
    const cryptoInput = document.getElementById('crypto-allocation');
    const fixedIncomeInput = document.getElementById('fixed-income-allocation');
    const stocksInput = document.getElementById('stocks-allocation');

    if (!cryptoInput || !fixedIncomeInput || !stocksInput) return;

    switch(profileType) {
        case 'conservative':
            cryptoInput.value = 10;
            fixedIncomeInput.value = 80;
            stocksInput.value = 10;
            break;
        case 'moderate':
            cryptoInput.value = 30;
            fixedIncomeInput.value = 50;
            stocksInput.value = 20;
            break;
        case 'aggressive':
            cryptoInput.value = 50;
            fixedIncomeInput.value = 20;
            stocksInput.value = 30;
            break;
    }
    updateTotalAllocation();
}

function updateTotalAllocation() {
    const cryptoElement = document.getElementById('crypto-allocation');
    const fixedIncomeElement = document.getElementById('fixed-income-allocation');
    const stocksElement = document.getElementById('stocks-allocation');
    const totalElement = document.getElementById('total-allocation');
    
    if (!cryptoElement || !fixedIncomeElement || !stocksElement || !totalElement) return;
    
    const cryptoValue = parseInt(cryptoElement.value) || 0;
    const fixedIncomeValue = parseInt(fixedIncomeElement.value) || 0;
    const stocksValue = parseInt(stocksElement.value) || 0;

    const total = cryptoValue + fixedIncomeValue + stocksValue;

    totalElement.textContent = total + '%';
    totalElement.style.color = (total !== 100) ? 'var(--red)' : 'var(--ambar)';
}

function initSaveButtons() {
    const saveAccountBtn = document.getElementById('save-account');
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', function() {
            const portfolioName = document.getElementById('portfolio-name').value;
            const currencySelect = document.getElementById('currency-select');
            const selectedCurrency = currencySelect.options[currencySelect.selectedIndex].text;
            const selectedWalletId = localStorage.getItem('selectedWalletId');
            
            if (!selectedWalletId) {
                alert('Nenhuma carteira selecionada');
                return;
            }
            saveWalletDetails(selectedWalletId, portfolioName, selectedCurrency);
        });
    }
    
    const saveAllocationBtn = document.getElementById('save-allocation');
    if (saveAllocationBtn) {
        saveAllocationBtn.addEventListener('click', function() {
            const cryptoValue = document.getElementById('crypto-allocation').value;
            const fixedIncomeValue = document.getElementById('fixed-income-allocation').value;
            const stocksValue = document.getElementById('stocks-allocation').value;

            const total = parseInt(cryptoValue) + parseInt(fixedIncomeValue) + parseInt(stocksValue);

            if (total !== 100) {
                alert('A soma das alocações deve ser exatamente 100%');
                return;
            }
            
            const selectedWalletId = localStorage.getItem('selectedWalletId');
            if (!selectedWalletId) {
                alert('Nenhuma carteira selecionada');
                return;
            }
            saveWalletAllocations(selectedWalletId, {
                crypto: parseInt(cryptoValue),
                rendaFixa: parseInt(fixedIncomeValue),
                acoes: parseInt(stocksValue)
            });
        });
    }
}

function saveWalletDetails(walletId, name, currency) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('Token de autenticação não encontrado');
        alert('Sessão expirada. Por favor, faça login novamente.');
        return;
    }
    const currencyCode = currency.match(/\(([^)]+)\)/)[1];
    
    fetch(`http://${API_URL}/wallets/${walletId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: name,
            moeda: currencyCode
        })
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '../../index.html';
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.error) {
            throw new Error(result.msg || 'Erro ao salvar dados da carteira');
        }
        localStorage.setItem('selectedPortfolio', name);
        const headerPortfolioName = document.querySelector('.portfolio-selector span');
        if (headerPortfolioName) {
            headerPortfolioName.textContent = name;
        }
        
        alert(`Carteira "${name}" com moeda "${currency}" salva com sucesso!`);
    })
    .catch(error => {
        console.error('Erro ao salvar carteira:', error);
        alert(`Erro ao salvar carteira: ${error.message}`);
    });
}

function saveWalletAllocations(walletId, allocations) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('Token de autenticação não encontrado');
        alert('Sessão expirada. Por favor, faça login novamente.');
        return;
    }
    
    fetch(`http://${API_URL}/wallets/${walletId}/alocacoes`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(allocations)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '../../index.html';
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        if (result.error) {
            throw new Error(result.msg || 'Erro ao salvar alocações');
        }
        
        alert(`Alocação salva com sucesso! Criptomoedas: ${allocations.crypto}%, Renda Fixa: ${allocations.rendaFixa}%, Ações: ${allocations.acoes}%`);
    })
    .catch(error => {
        console.error('Erro ao salvar alocações:', error);
        alert(`Erro ao salvar alocações: ${error.message}`);
    });
}