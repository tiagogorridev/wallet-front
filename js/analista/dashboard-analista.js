// Inicialização do documento
document.addEventListener('DOMContentLoaded', function() {
    setupPeriodFilter();
});

// Configuração do filtro de período
function setupPeriodFilter() {
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', function() {
            updateDashboardData(this.value);
        });
    }
}

// Atualização dos dados do dashboard com base no período selecionado
function updateDashboardData(days) {
    let statsData;
    
    switch(days) {
        case '30':
            statsData = { carteiras: 18, clientes: 47, carteirasChange: '+2.5%', clientesChange: '+5.2%' };
            break;
        case '60':
            statsData = { carteiras: 16, clientes: 42, carteirasChange: '+4.1%', clientesChange: '+3.7%' };
            break;
        case '90':
            statsData = { carteiras: 14, clientes: 38, carteirasChange: '+7.8%', clientesChange: '+8.3%' };
            break;
    }
    
    // Atualização dos elementos de estatísticas na interface
    document.querySelector('.stats-section .stat-card:nth-child(1) .stat-value').textContent = statsData.carteiras;
    document.querySelector('.stats-section .stat-card:nth-child(1) .stat-change').textContent = statsData.carteirasChange;
    document.querySelector('.stats-section .stat-card:nth-child(2) .stat-value').textContent = statsData.clientes;
    document.querySelector('.stats-section .stat-card:nth-child(2) .stat-change').textContent = statsData.clientesChange;
}