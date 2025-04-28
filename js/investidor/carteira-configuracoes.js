const API_URL = '191.239.116.115:8080';
let currentWallet = null;
let elementos = {};

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        window.location.href = '../../index.html';
        return;
    }

    cacheElementos();

    document.addEventListener('portfolioChanged', (e) => {
        if (e.detail && e.detail.portfolio) {
            loadWalletData(e.detail.portfolio);
        }
    });

    const walletId = localStorage.getItem('selectedWalletId');
    
    if (walletId) {
        loadWalletById(walletId);
    }

    setupAllocationInputs();
    setupEventListeners();
});

function cacheElementos() {
    elementos = {
        portfolioName: document.getElementById('portfolio-name'),
        portfolioDesc: document.getElementById('portfolio-description'),
        portfolioToDelete: document.getElementById('portfolio-to-delete'),
        totalAllocation: document.getElementById('total-allocation'),
        deleteModal: document.querySelector('.modal-overlay'),
        cryptoAllocation: document.getElementById('crypto-allocation'),
        fixedIncomeAllocation: document.getElementById('fixed-income-allocation'),
        stocksAllocation: document.getElementById('stocks-allocation')
    };
}

async function loadWalletById(walletId) {
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`http://${API_URL}/wallets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados da carteira');
        }
        
        const data = await response.json();
        
        if (data.data && data.data.data) {
            const numericWalletId = parseInt(walletId);
            const carteiras = data.data.data;
            const carteira = carteiras.find(c => c.id === numericWalletId);
            
            if (carteira) {
                loadWalletData(carteira);
            } else {
                throw new Error('Carteira não encontrada');
            }
        } else {
            throw new Error('Dados da carteira não encontrados');
        }
    } catch (error) {
        console.error('Erro ao carregar carteira:', error);
        if (elementos.portfolioName) {
            elementos.portfolioName.value = 'Erro ao carregar';
        }
        mostrarErro('Erro ao carregar dados da carteira. Tente novamente mais tarde.');
    }
}

function loadWalletData(wallet) {
    currentWallet = wallet;
    
    if (elementos.portfolioName) elementos.portfolioName.value = wallet.nome || '';
    if (elementos.portfolioDesc) elementos.portfolioDesc.value = wallet.descricao || '';
    if (elementos.portfolioToDelete) elementos.portfolioToDelete.textContent = wallet.nome || '';
}

function setupAllocationInputs() {
    const allocationInputs = document.querySelectorAll('.allocation-value');
    
    allocationInputs.forEach(input => {
        input.addEventListener('input', updateTotalAllocation);
    });
    
    updateTotalAllocation();
}

function updateTotalAllocation() {
    const inputs = document.querySelectorAll('.allocation-value');
    let total = 0;
    
    inputs.forEach(input => {
        const value = parseInt(input.value) || 0;
        total += value;
    });
    
    if (elementos.totalAllocation) {
        elementos.totalAllocation.textContent = total + '%';
        elementos.totalAllocation.classList.toggle('error', total !== 100);
    }
}

function setupEventListeners() {
    const elementos = {
        saveAccountBtn: document.getElementById('save-account'),
        deletePortfolioBtn: document.getElementById('delete-portfolio'),
        saveAllocationBtn: document.getElementById('save-allocation'),
        confirmDeleteBtn: document.getElementById('confirm-delete'),
        cancelDeleteBtn: document.getElementById('cancel-delete')
    };
    
    if (elementos.saveAccountBtn) {
        elementos.saveAccountBtn.addEventListener('click', saveWalletInfo);
    }
    
    if (elementos.deletePortfolioBtn) {
        elementos.deletePortfolioBtn.addEventListener('click', () => {
            document.querySelector('.modal-overlay').style.display = 'flex';
        });
    }
    
    if (elementos.saveAllocationBtn) {
        elementos.saveAllocationBtn.addEventListener('click', saveAllocation);
    }
    
    if (elementos.confirmDeleteBtn) {
        elementos.confirmDeleteBtn.addEventListener('click', deleteWallet);
    }
    
    if (elementos.cancelDeleteBtn) {
        elementos.cancelDeleteBtn.addEventListener('click', () => {
            document.querySelector('.modal-overlay').style.display = 'none';
        });
    }
}

async function saveWalletInfo() {
    if (!currentWallet) return;
    
    const token = localStorage.getItem('accessToken');
    const walletId = localStorage.getItem('selectedWalletId');
    const name = elementos.portfolioName ? elementos.portfolioName.value : '';
    const description = elementos.portfolioDesc ? elementos.portfolioDesc.value : '';
    
    if (!name || name.trim() === '') {
        mostrarErro('O nome da carteira não pode ser vazio.');
        return;
    }
    
    try {
        const walletData = {
            id: parseInt(walletId)
        };
        
        if (name !== currentWallet.nome) {
            walletData.nome = name;
        }
        
        walletData.descricao = description;
        const response = await requisicaoAPI('PUT', 'wallets', walletData);
        
        if (response.ok) {
            const updatedWallet = {
                ...currentWallet,
                descricao: description
            };
            
            if (name !== currentWallet.nome) {
                updatedWallet.nome = name;
                localStorage.setItem('selectedPortfolio', name);
            }
            
            currentWallet = updatedWallet;
            
            mostrarSucesso('Carteira atualizada com sucesso!');
            
            document.dispatchEvent(new CustomEvent('portfolioUpdated', {
                detail: { portfolio: updatedWallet }
            }));
        } else {
            const errorMsg = response.data.msg || 'Falha na operação';
            console.error('Erro detalhado:', response.data);
            mostrarErro(`Erro ao atualizar carteira: ${errorMsg}`);
        }
    } catch (error) {
        console.error('Erro ao atualizar carteira:', error);
        mostrarErro('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
}

async function saveAllocation() {
    if (!currentWallet) return;
    
    const walletId = localStorage.getItem('selectedWalletId');
    
    const cryptoAllocation = parseInt(elementos.cryptoAllocation?.value) || 0;
    const fixedIncomeAllocation = parseInt(elementos.fixedIncomeAllocation?.value) || 0;
    const stocksAllocation = parseInt(elementos.stocksAllocation?.value) || 0;
    
    const total = cryptoAllocation + fixedIncomeAllocation + stocksAllocation;
    
    if (total !== 100) {
        mostrarErro('A soma das alocações deve ser igual a 100%.');
        return;
    }
    
    try {
        const allocationData = {
            walletId: parseInt(walletId),
            allocations: [
                { category: 'CRYPTO', percentage: cryptoAllocation },
                { category: 'RENDA_FIXA', percentage: fixedIncomeAllocation },
                { category: 'ACOES', percentage: stocksAllocation }
            ]
        };
        
        const response = await requisicaoAPI('PUT', 'wallets', allocationData);
        
        if (response.ok) {
            mostrarSucesso('Alocações atualizadas com sucesso!');
        } else {
            mostrarErro(`Erro ao atualizar alocações: ${response.data.msg || 'Falha na operação'}`);
        }
    } catch (error) {
        console.error('Erro ao atualizar alocações:', error);
        mostrarErro('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
}

async function deleteWallet() {
    if (!currentWallet) return;
    
    const walletId = localStorage.getItem('selectedWalletId');
    
    if (!walletId) {
        mostrarErro('ID da carteira não encontrado.');
        document.querySelector('.modal-overlay').style.display = 'none';
        return;
    }
    
    try {
        const response = await requisicaoAPI('DELETE', `wallets?id=${walletId}`);
        
        if (response.ok) {
            document.querySelector('.modal-overlay').style.display = 'none';
            localStorage.removeItem('selectedPortfolio');
            localStorage.removeItem('selectedWalletId');
            mostrarSucesso('Carteira excluída com sucesso!');
            
            document.dispatchEvent(new CustomEvent('walletDeleted', {
                detail: { walletId: walletId }
            }));
            
            window.location.href = '../../html/investidor/resumo.html';
        } else {
            mostrarErro(`Erro ao excluir carteira: ${response.data.msg || 'Falha na operação'}`);
        }
    } catch (error) {
        console.error('Erro ao excluir carteira:', error);
        mostrarErro('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    } finally {
        document.querySelector('.modal-overlay').style.display = 'none';
    }
}

async function requisicaoAPI(metodo, endpoint, dados = null) {
    const token = localStorage.getItem('accessToken');
    
    const opcoes = {
        method: metodo,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (dados && (metodo === 'POST' || metodo === 'PUT')) {
        opcoes.body = JSON.stringify(dados);
    }
    
    const response = await fetch(`http://${API_URL}/${endpoint}`, opcoes);
    const data = await response.json();
    
    return {
        ok: response.ok,
        data: data
    };
}

function mostrarErro(mensagem) {
    alert(mensagem);
}

function mostrarSucesso(mensagem) {
    alert(mensagem);
}