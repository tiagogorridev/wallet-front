const API_URL = 'http://191.239.116.115:8080';
const endpoint = '/goals';

const GoalManager = {
    goals: [],
    activeGoals: 0,
    completedGoals: 0,
    totalValue: 0,
    walletBalance: 0, // Campo para armazenar o saldo total da carteira

    init() {
        this.setupEventListeners();
        this.loadGoals();
        this.loadWalletBalance(); // Carregar saldo da carteira
    },

    setupEventListeners() {
        // Botões para abrir modais
        document.getElementById('openAddGoalModalBtn').addEventListener('click', () => this.openModal('addGoalModal'));
        
        // Botões para fechar modais
        document.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.closest('.modal-overlay').id;
                this.closeModal(modalId);
            });
        });

        // Submissão de formulários
        document.getElementById('addGoalForm').addEventListener('submit', (e) => this.addGoal(e));
        document.getElementById('editGoalForm').addEventListener('submit', (e) => this.updateGoal(e));
        
        // Filtros de metas
        document.querySelectorAll('.goal-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelector('.goal-tab.active').classList.remove('active');
                e.target.classList.add('active');
                this.filterGoals(e.target.dataset.filter);
            });
        });
    },

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    },

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    },

    // Função para carregar o saldo total da carteira
    loadWalletBalance() {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const walletId = localStorage.getItem('selectedWalletId') || localStorage.getItem('walletId') || localStorage.getItem('id_carteira');
        
        if (!token || !walletId) {
            console.log('Token ou ID da carteira não encontrado para carregar saldo');
            return;
        }

        // Buscar dados da carteira
        fetch(`${API_URL}/wallets/${walletId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erro ao carregar saldo da carteira:', data.msg);
                return;
            }
            
            const walletData = data.data;
            // Usar o saldo_total da carteira como saldo disponível
            this.walletBalance = walletData.saldo_total || 0;
            
            console.log('Saldo da carteira carregado:', this.walletBalance);
            
            // Atualizar os cards das metas com o novo saldo
            this.updateGoalStats();
            this.renderGoals();
        })
        .catch(error => {
            console.error('Erro ao buscar saldo da carteira:', error);
        });
    },

    loadGoals() {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        
        if (!token) {
            alert('Token não encontrado. Por favor, faça login novamente.');
            window.location.href = '../../index.html';
            return;
        }

        fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.msg || 'Erro ao carregar metas');
            }
            this.goals = data.data.data || [];
            this.updateGoalStats();
            this.renderGoals();
        })
        .catch(error => {
            console.error('Erro ao carregar metas:', error);
            alert(`Erro ao carregar metas: ${error.message}`);
        });
    },

    updateGoalStats() {
        this.activeGoals = this.goals.filter(goal => goal.meta_status === 'ATIVA').length;
        this.completedGoals = this.goals.filter(goal => goal.meta_status === 'CONCLUIDA').length;
        this.totalValue = this.goals.reduce((sum, goal) => sum + parseFloat(goal.valor_meta || 0), 0);

        document.querySelectorAll('.goal-stat-card .stat-value')[0].textContent = this.activeGoals;
        document.querySelectorAll('.goal-stat-card .stat-value')[1].textContent = this.completedGoals;
        document.querySelectorAll('.goal-stat-card .stat-value')[2].textContent = `R$ ${this.totalValue.toFixed(2).replace('.', ',')}`;
    },

    renderGoals() {
        const goalsList = document.getElementById('goalsList');
        goalsList.innerHTML = '';

        if (this.goals.length === 0) {
            goalsList.innerHTML = '<div class="empty-goals">Nenhuma meta encontrada.</div>';
            return;
        }

        const filter = document.querySelector('.goal-tab.active').dataset.filter;
        const filteredGoals = filter === 'all' ? this.goals : 
                             filter === 'active' ? this.goals.filter(goal => goal.meta_status === 'ATIVA') : 
                             this.goals.filter(goal => goal.meta_status === 'CONCLUIDA');

        filteredGoals.forEach(goal => {
            // Usar o saldo da carteira como progresso atual
            const currentProgress = this.walletBalance;
            const targetValue = parseFloat(goal.valor_meta);
            const progress = targetValue > 0 ? (currentProgress / targetValue) * 100 : 0;
            
            // Formatação dos valores
            const formattedCurrentProgress = currentProgress.toFixed(2).replace('.', ',');
            const formattedTarget = targetValue.toFixed(2).replace('.', ',');
            
            const goalCard = document.createElement('div');
            goalCard.className = `goal-card ${goal.meta_status === 'CONCLUIDA' ? 'completed' : ''}`;
            goalCard.dataset.id = goal.id;
            
            goalCard.innerHTML = `
                <div class="goal-header">
                    <h3>${goal.descricao}</h3>
                    <div class="goal-actions">
                        <button class="edit-goal" onclick="GoalManager.openEditModal(${goal.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-goal" onclick="GoalManager.deleteGoal(${goal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(progress, 100)}%;"></div>
                    </div>
                    <div class="progress-info">
                        <span class="current-value">R$ ${formattedCurrentProgress}</span>
                        <span class="target-value">R$ ${formattedTarget}</span>
                    </div>
                </div>
                <div class="goal-dates">
                    <div class="date-item">
                        <span class="status-badge ${goal.meta_status === 'ATIVA' ? 'active' : 'completed'}">
                            ${goal.meta_status === 'ATIVA' ? 'Ativa' : 'Concluída'}
                        </span>
                    </div>
                </div>
            `;
            
            goalsList.appendChild(goalCard);
        });
    },

    filterGoals(filter) {
        this.renderGoals();
    },

    addGoal(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const walletId = localStorage.getItem('selectedWalletId') || localStorage.getItem('walletId') || localStorage.getItem('id_carteira');
        
        if (!token) {
            alert('Token não encontrado. Por favor, faça login novamente.');
            return;
        }
        
        const description = document.getElementById('description').value;
        const completionDate = document.getElementById('completionDate').value;
        const targetValue = parseFloat(document.getElementById('targetValue').value);
        
        // Validações
        if (!description) {
            document.getElementById('descriptionError').style.display = 'block';
            return;
        }
        
        if (!completionDate) {
            document.getElementById('completionDateError').style.display = 'block';
            return;
        }
        
        if (!targetValue || targetValue <= 0) {
            document.getElementById('targetValueError').style.display = 'block';
            return;
        }
        
        // Preparar dados da meta (incluindo carteira se disponível)
        const goalData = {
            descricao: description,
            valor_meta: targetValue,
            data_final: completionDate
        };
        
        // Adicionar carteira se disponível
        if (walletId) {
            goalData.id_carteira = parseInt(walletId);
        }
        
        console.log('Enviando dados da meta:', goalData); // Para depuração
        
        fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.msg || 'Erro ao criar meta');
            }
            alert('Meta criada com sucesso!');
            this.closeModal('addGoalModal');
            document.getElementById('addGoalForm').reset();
            this.loadGoals();
            this.loadWalletBalance(); // Recarregar saldo após criar meta
        })
        .catch(error => {
            console.error('Erro ao criar meta:', error);
            alert(`Erro ao criar meta: ${error.message}`);
        });
    },

    openEditModal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) {
            alert('Meta não encontrada');
            return;
        }
        
        document.getElementById('edit-id').value = goal.id;
        document.getElementById('edit-title').value = goal.descricao;
        document.getElementById('edit-targetValue').value = goal.valor_meta;
        document.getElementById('edit-status').value = goal.meta_status;
        
        if (goal.data_final) {
            const date = new Date(goal.data_final);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('edit-completionDate').value = formattedDate;
        }
        
        this.openModal('editGoalModal');
    },

    updateGoal(event) {
        event.preventDefault();
        
        const goalId = document.getElementById('edit-id').value;
        const completionDate = document.getElementById('edit-completionDate').value;
        const targetValue = parseFloat(document.getElementById('edit-targetValue').value);
        const status = document.getElementById('edit-status').value;
        
        // Validações
        if (!description) {
            document.getElementById('edit-titleError').style.display = 'block';
            return;
        }
        
        if (!completionDate) {
            document.getElementById('edit-completionDateError').style.display = 'block';
            return;
        }
        
        if (!targetValue || targetValue <= 0) {
            document.getElementById('edit-targetValueError').style.display = 'block';
            return;
        }
        
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const walletId = localStorage.getItem('selectedWalletId') || localStorage.getItem('walletId') || localStorage.getItem('id_carteira');
        
        if (!token) {
            alert('Token não encontrado. Por favor, faça login novamente.');
            return;
        }
        
        // Preparar dados da meta
        const goalData = {
            id: parseInt(goalId),
            descricao: description,
            valor_meta: targetValue,
            data_final: completionDate
        };
        
        // Adicionar carteira se disponível
        if (walletId) {
            goalData.id_carteira = parseInt(walletId);
        }
        
        fetch(`${API_URL}${endpoint}/${goalId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.msg || 'Erro ao atualizar meta');
            }
            alert('Meta atualizada com sucesso!');
            this.closeModal('editGoalModal');
            this.loadGoals();
            this.loadWalletBalance(); // Recarregar saldo após atualizar meta
        })
        .catch(error => {
            console.error('Erro ao atualizar meta:', error);
            alert(`Erro ao atualizar meta: ${error.message}`);
        });
    },

    deleteGoal(goalId) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
            
            if (!token) {
                alert('Token não encontrado. Por favor, faça login novamente.');
                return;
            }
            
            fetch(`${API_URL}${endpoint}/${goalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.msg || 'Erro ao excluir meta');
                }
                alert('Meta excluída com sucesso!');
                this.loadGoals();
            })
            .catch(error => {
                console.error('Erro ao excluir meta:', error);
                alert(`Erro ao excluir meta: ${error.message}`);
            });
        }
    },

    // Função para atualizar o saldo manualmente (pode ser chamada quando houver mudanças na carteira)
    refreshWalletBalance() {
        this.loadWalletBalance();
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    GoalManager.init();
});

// Escutar mudanças na carteira para atualizar o saldo automaticamente
document.addEventListener('portfolioChanged', function(e) {
    if (e.detail && e.detail.portfolio) {
        // Atualizar o saldo da carteira quando houver mudanças no portfólio
        GoalManager.walletBalance = e.detail.portfolio.saldo_total || 0;
        console.log('Saldo atualizado via evento portfolioChanged:', GoalManager.walletBalance);
        GoalManager.renderGoals();
    }
});