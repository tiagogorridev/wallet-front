document.addEventListener('DOMContentLoaded', function() {
    setupPeriodFilter();
    setupViewButtons();
    setupTaskButtons();
});

function setupPeriodFilter() {
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', function() {
            updateDashboardData(this.value);
        });
    }
}

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
    
    document.querySelector('.stats-section .stat-card:nth-child(1) .stat-value').textContent = statsData.carteiras;
    document.querySelector('.stats-section .stat-card:nth-child(1) .stat-change').textContent = statsData.carteirasChange;
    document.querySelector('.stats-section .stat-card:nth-child(2) .stat-value').textContent = statsData.clientes;
    document.querySelector('.stats-section .stat-card:nth-child(2) .stat-change').textContent = statsData.clientesChange;
}

function setupViewButtons() {
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const portfolioName = this.closest('.portfolio-item').querySelector('h3').textContent;
            alert(`Visualizando detalhes da carteira: ${portfolioName}`);
        });
    });
}

function setupTaskButtons() {
    const completeButtons = document.querySelectorAll('.complete-btn');
    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskItem = this.closest('.task-item');
            
            taskItem.style.opacity = '0.5';
            setTimeout(() => {
                taskItem.style.height = '0';
                taskItem.style.margin = '0';
                taskItem.style.padding = '0';
                taskItem.style.overflow = 'hidden';
                
                setTimeout(() => {
                    taskItem.remove();
                    if (document.querySelectorAll('.task-item').length === 0) {
                        document.querySelector('.task-list').innerHTML = '<p class="no-tasks">Nenhuma tarefa pendente</p>';
                    }
                }, 300);
            }, 300);
        });
    });
}
