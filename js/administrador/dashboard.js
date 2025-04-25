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
            "Renda Fixa": 18.5,
            "Criptomoedas": 10.3,
            "FIIs": 8.9,
            "Tesouro Direto": 4.3
        }
    },
    
    categories: {
        byUsers: {
            "Criptomoedas": {
                count: 876,
                growth: 41.5,
                icon: "bitcoin"
            },
            "Ações": {
                count: 743,
                growth: 18.2,
                icon: "chart-line"
            },
            "Fundos": {
                count: 592,
                growth: 9.7,
                icon: "landmark"
            },
            "FIIs": {
                count: 476,
                growth: 22.6,
                icon: "building"
            },
            "Renda Fixa": {
                count: 387,
                growth: -2.3,
                icon: "university"
            },
            "Tesouro Direto": {
                count: 284,
                growth: 3.8,
                icon: "coins"
            }
        },
        byInvestment: {
            "Ações": 3045782.45,
            "Fundos": 1950233.84,
            "Renda Fixa": 1586640.04,
            "Criptomoedas": 883672.57,
            "FIIs": 762948.51,
            "Tesouro Direto": 368686.6
        }
    }
};

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

// Formatar valor como moeda (R$)
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

document.addEventListener('DOMContentLoaded', function() {
    initializeUserSection();
    initializeInvestmentSection();
    initializeCategoriesSection();
    setupFilterEvents();
});

function initializeUserSection() {
    document.getElementById('total-users').textContent = mockData.users.totalCount.toLocaleString('pt-BR');
    document.getElementById('new-users').textContent = mockData.users.newUsers.toLocaleString('pt-BR');
    document.getElementById('activation-rate').textContent = mockData.users.activationRate.toFixed(1) + '%';
    document.getElementById('retention-rate').textContent = mockData.users.retentionRate.toFixed(1) + '%';
    updateVariation('users-variation', mockData.users.growthRate);
    updateVariation('new-users-variation', mockData.users.newUsersGrowth);
    updateVariation('activation-variation', mockData.users.activationGrowth);
    updateVariation('retention-variation', mockData.users.retentionGrowth);
    createUserGrowthChart(30);
}

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

function initializeCategoriesSection() {
    const topCategories = Object.entries(mockData.categories.byUsers)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 4);
    
    topCategories.forEach((category, index) => {
        const cardId = `category-card-${index + 1}`;
        const card = document.getElementById(cardId);
        
        if (card) {
            const [name, data] = category;
            const iconElement = card.querySelector('i');
            const titleElement = card.querySelector('h3');
            const valueElement = card.querySelector('.value');
            const variationElement = card.querySelector('.variation');
            iconElement.className = `fas fa-${data.icon}`;
            titleElement.textContent = name;
            valueElement.textContent = `${data.count.toLocaleString('pt-BR')} usuários`;
            updateVariation(variationElement, data.growth);
        }
    });
    createCategoriesPopularityChart();
    createInvestmentByCategoryChart();
}

function updateVariation(elementIdOrElement, value) {
    const element = typeof elementIdOrElement === 'string' 
        ? document.getElementById(elementIdOrElement) 
        : elementIdOrElement;
    
    if (element) {
        element.textContent = (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
        element.className = value >= 0 
            ? 'variation positive' 
            : 'variation negative';
    }
}

function setupFilterEvents() {
    document.getElementById('user-time-filter').addEventListener('change', function() {
        const days = parseInt(this.value);
        createUserGrowthChart(days);
    });
    
    document.getElementById('investment-time-filter').addEventListener('change', function() {
        const days = parseInt(this.value);
        createInvestmentChart(days);
    });
    
    document.getElementById('category-time-filter').addEventListener('change', function() {
    });
}

function createUserGrowthChart(days) {
    const ctx = document.getElementById('users-growth-chart').getContext('2d');
    const data = mockData.users.history.slice(-days - 1);
    if (window.usersGrowthChart) {
        window.usersGrowthChart.destroy();
    }
    
    window.usersGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [
                {
                    label: 'Total de Usuários',
                    data: data.map(item => item.users),
                    backgroundColor: 'rgba(255, 177, 0, 0.1)',
                    borderColor: 'rgba(255, 177, 0, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Novos Usuários (diário)',
                    data: data.map(item => item.newUsers),
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1,
                    type: 'bar'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ccc'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#999',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#999'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

function createInvestmentChart(days) {
    const ctx = document.getElementById('investment-chart').getContext('2d');
    const data = mockData.investments.history.slice(-days - 1);
    if (window.investmentChart) {
        window.investmentChart.destroy();
    }
    
    window.investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.date),
            datasets: [
                {
                    label: 'Total Investido (R$)',
                    data: data.map(item => item.value),
                    backgroundColor: 'rgba(0, 220, 130, 0.1)',
                    borderColor: 'rgba(0, 220, 130, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ccc'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#999',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#999',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

function createInvestmentDistributionChart() {
    const ctx = document.getElementById('investment-distribution-chart').getContext('2d');
    const data = mockData.investments.distribution;
    if (window.investmentDistributionChart) {
        window.investmentDistributionChart.destroy();
    }
    
    const colors = [
        'rgba(255, 177, 0, 0.8)',
        'rgba(0, 123, 255, 0.8)',
        'rgba(0, 220, 130, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(54, 162, 235, 0.8)'
    ];
    
    window.investmentDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [
                {
                    data: Object.values(data),
                    backgroundColor: colors,
                    borderColor: '#1E1E1E',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ccc'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

function createCategoriesPopularityChart() {
    const ctx = document.getElementById('categories-popularity-chart').getContext('2d');
    const categories = mockData.categories.byUsers;
    if (window.categoriesPopularityChart) {
        window.categoriesPopularityChart.destroy();
    }
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1].count - a[1].count);
    window.categoriesPopularityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedCategories.map(item => item[0]),
            datasets: [
                {
                    label: 'Número de Usuários',
                    data: sortedCategories.map(item => item[1].count),
                    backgroundColor: 'rgba(255, 177, 0, 0.8)',
                    borderColor: 'rgba(255, 177, 0, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#999'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        color: '#999'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            }
        }
    });
}

function createInvestmentByCategoryChart() {
    const ctx = document.getElementById('investment-by-category-chart').getContext('2d');
    const data = mockData.categories.byInvestment;
    if (window.investmentByCategoryChart) {
        window.investmentByCategoryChart.destroy();
    }
    
    const sortedData = Object.entries(data)
        .sort((a, b) => b[1] - a[1]);
    
    const colors = [
        'rgba(255, 177, 0, 0.8)',
        'rgba(0, 123, 255, 0.8)',
        'rgba(0, 220, 130, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(54, 162, 235, 0.8)'
    ];
    
    window.investmentByCategoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: sortedData.map(item => item[0]),
            datasets: [
                {
                    data: sortedData.map(item => item[1]),
                    backgroundColor: colors,
                    borderColor: '#1E1E1E',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ccc'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}