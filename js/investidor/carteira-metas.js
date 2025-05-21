const API_URL = 'http://191.239.116.115:8080';
const endpoint = '/goals';

const GoalManager = {
    goals: [],
    activeGoals: 0,
    completedGoals: 0,
    totalValue: 0,

    init() {
        this.setupEventListeners();
        this.loadGoals();
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

    // Função auxiliar para obter o ID do usuário do localStorage ou fazer uma chamada API para buscar por email
    getUserId() {
        // Primeiro, tenta obter diretamente do localStorage
        let userId = localStorage.getItem('userId');
        
        if (userId) {
            return userId;
        }
        
        // Tenta obter o email do usuário do objeto userInfo
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                const userInfo = JSON.parse(userInfoStr);
                
                // Se tivermos o email, podemos usá-lo para identificar o usuário
                if (userInfo && userInfo.email) {
                    // Retorna o email, que será usado como identificador temporário
                    return userInfo.email;
                }
            } catch (e) {
                console.error('Erro ao analisar userInfo:', e);
            }
        }
        
        return null;
    },

    loadGoals() {
        const walletId = localStorage.getItem('selectedWalletId');
        if (!walletId) {
            alert('Carteira não selecionada. Por favor, faça login novamente.');
            window.location.href = '../../index.html';
            return;
        }

        fetch(`${API_URL}${endpoint}?id_carteira=${walletId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
            const progress = goal.progresso ? parseFloat(goal.progresso) / parseFloat(goal.valor_meta) * 100 : 0;
            const formattedProgress = (goal.progresso || 0).toFixed(2).replace('.', ',');
            const formattedTarget = parseFloat(goal.valor_meta).toFixed(2).replace('.', ',');
            
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
                        <div class="progress" style="width: ${progress}%;"></div>
                    </div>
                    <div class="progress-info">
                        <span class="current-value">R$ ${formattedProgress}</span>
                        <span class="target-value">R$ ${formattedTarget}</span>
                    </div>
                </div>
                <div class="goal-dates">
                    <div class="date-item">
                        <span class="date-label">Início:</span>
                        <span class="date-value">${new Date(goal.data_inicial).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Status:</span>
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
    
    const walletId = localStorage.getItem('selectedWalletId');
    if (!walletId) {
        alert('Carteira não selecionada. Por favor, faça login novamente.');
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
    
    // Obter o identificador do usuário
    const userInfoStr = localStorage.getItem('userInfo');
    let userId = null;
    
    if (userInfoStr) {
        try {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo.id; // Certifique-se de que este é o ID numérico do usuário
        } catch (e) {
            console.error('Erro ao analisar userInfo:', e);
        }
    }
    
    if (!userId) {
        userId = localStorage.getItem('userId');
    }
    
    if (!userId) {
        alert('Usuário não identificado. Por favor, faça login novamente.');
        return;
    }
    
    // Preparar dados da meta
    const goalData = {
        id_usuario: parseInt(userId), // Garantir que é um número
        id_carteira: parseInt(walletId),
        descricao: description,
        valor_meta: targetValue,
        data_final: completionDate,
        meta_status: 'ATIVA'
    };
    
    console.log('Enviando dados da meta:', goalData); // Para depuração
    
    fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
        const description = document.getElementById('edit-title').value;
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
        
        const walletId = localStorage.getItem('selectedWalletId');
        // Obter o identificador do usuário
        const userIdentifier = this.getUserId();
        if (!userIdentifier) {
            alert('Usuário não identificado. Por favor, faça login novamente.');
            return;
        }
        
        // Preparar dados da meta
        const goalData = {
            id: parseInt(goalId),
            id_carteira: parseInt(walletId),
            descricao: description,
            valor_meta: targetValue,
            data_final: completionDate,
            meta_status: status
        };
        
        // Se o identificador parece ser um ID numérico, inclui id_usuario
        if (!isNaN(userIdentifier)) {
            goalData.id_usuario = parseInt(userIdentifier);
        }
        
        fetch(`${API_URL}${endpoint}/${goalId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
        })
        .catch(error => {
            console.error('Erro ao atualizar meta:', error);
            alert(`Erro ao atualizar meta: ${error.message}`);
        });
    },

    deleteGoal(goalId) {
        if (confirm('Tem certeza que deseja excluir esta meta?')) {
            fetch(`${API_URL}${endpoint}/${goalId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
    }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    GoalManager.init();
});