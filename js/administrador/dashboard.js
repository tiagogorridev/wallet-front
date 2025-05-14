// DADOS MOCK PARA DASHBOARD
const mockData = {
    users: {
        totalCount: 1287,
        growthRate: 23.5,
        newUsers: 157,
        newUsersGrowth: 18.2,
        activationRate: 76.8,
        activationGrowth: 5.3,
        retentionRate: 68.5,
        retentionGrowth: -2.1,
        history: generateUserData(365)
    },
    
    investments: {
        totalValue: 8576432.67,
        growthRate: 15.7,
        averagePerUser: 6662.34,
        averageGrowth: 8.9,
        newCount: 342,
        newCountGrowth: 12.4,
        avgDiversification: 3.2,
        diversificationGrowth: 6.7,
        history: generateInvestmentData(365),
        distribution: {
            "Ações": 35.2,
            "Fundos": 22.8,
            "Criptomoedas": 10.3,
            "Tesouro Direto": 4.3
        }
    }
};

// FUNÇÕES UTILITÁRIAS
function generateUserData(days) {
    const data = [];
    let userCount = 1000;
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dailyChange = Math.floor(Math.random() * 25) - 5;
        userCount = Math.max(1000, userCount + dailyChange);
        
        data.push({
            date: formatDate(date),
            users: userCount,
            newUsers: Math.max(0, dailyChange)
        });
    }
    
    return data;
}

function generateInvestmentData(days) {
    const data = [];
    let totalValue = 7000000;
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dailyChangePercent = (Math.random() * 1.5) - 0.5;
        const dailyChange = totalValue * (dailyChangePercent / 100);
        totalValue = Math.max(7000000, totalValue + dailyChange);
        
        data.push({
            date: formatDate(date),
            value: totalValue
        });
    }
    
    return data;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// INICIALIZAÇÃO DO DASHBOARD
document.addEventListener('DOMContentLoaded', function() {
    initializeUserSection();
    initializeInvestmentSection();
    setupFilterEvents();
});

// SEÇÃO DE USUÁRIOS
function initializeUserSection() {
    document.getElementById('total-users').textContent = mockData.users.totalCount.toLocaleString('pt-BR');
    document.getElementById('new-users').textContent = mockData.users.newUsers.toLocaleString('pt-BR');
    document.getElementById('activation-rate').textContent = mockData.users.activationRate.toFixed(1) + '%';
    document.getElementById('retention-rate').textContent = mockData.users.retentionRate.toFixed(1) + '%';
    
    updateVariation('users-variation', mockData.users.growthRate);
    updateVariation('new-users-variation', mockData.users.newUsersGrowth);
    updateVariation('activation-variation', mockData.users.activationGrowth);
    updateVariation('retention-variation', mockData.users.retentionGrowth);
}

// SEÇÃO DE INVESTIMENTOS
function initializeInvestmentSection() {
    document.getElementById('total-invested').textContent = formatCurrency(mockData.investments.totalValue);
    document.getElementById('avg-investment').textContent = formatCurrency(mockData.investments.averagePerUser);
    document.getElementById('new-investments').textContent = mockData.investments.newCount.toLocaleString('pt-BR');
    document.getElementById('diversification').textContent = mockData.investments.avgDiversification.toFixed(1) + ' categorias';
    
    updateVariation('investment-variation', mockData.investments.growthRate);
    updateVariation('avg-investment-variation', mockData.investments.averageGrowth);
    updateVariation('new-investments-variation', mockData.investments.newCountGrowth);
    updateVariation('diversification-variation', mockData.investments.diversificationGrowth);
    
    createInvestmentChart(30);
    createInvestmentDistributionChart();
}

// UTILITÁRIOS DE UI
function updateVariation(elementId, value) {
    const element = document.getElementById(elementId);
    
    if (element) {
        element.textContent = (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
        element.className = value >= 0 ? 'variation positive' : 'variation negative';
    }
}
