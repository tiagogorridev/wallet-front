// Modelo de dados
let goals = [
  {
    id: 1,
    title: 'Reserva de Emergência',
    subtitle: 'Curto prazo • Essencial',
    icon: 'reserve',
    currentValue: 3500,
    targetValue: 6000,
    targetDate: '31/12/2025',
    strategy: '100% Renda Fixa',
    status: 'in_progress'
  },
  {
    id: 2,
    title: 'Viagem para Europa',
    subtitle: 'Médio prazo • Lazer',
    icon: 'vacation',
    currentValue: 15000,
    targetValue: 15000,
    targetDate: '15/01/2025',
    strategy: '100% Criptos',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Entrada para Imóvel',
    subtitle: 'Longo prazo • Patrimonial',
    icon: 'house',
    currentValue: 35000,
    targetValue: 100000,
    targetDate: '01/01/2028',
    strategy: '100% FIIS',
    status: 'in_progress'
  }
];

let filteredGoals = [];
let currentFilter = 'all';
let currentEditingGoal = null;

// DOM Elements
const addGoalModal = document.getElementById('addGoalModal');
const editGoalModal = document.getElementById('editGoalModal');
const addGoalForm = document.getElementById('addGoalForm');
const editGoalForm = document.getElementById('editGoalForm');
const openAddGoalModalBtn = document.getElementById('openAddGoalModalBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const closeEditModalBtn = document.getElementById('closeEditModalBtn');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');
const goalsList = document.getElementById('goalsList');
const goalTabs = document.querySelectorAll('.goal-tab');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar a página
  applyFilter('all');
  updateGoalStats();

  // Adicionar event listeners para os modais
  openAddGoalModalBtn.addEventListener('click', openAddGoalModal);
  closeAddModalBtn.addEventListener('click', closeModal);
  closeEditModalBtn.addEventListener('click', closeModal);

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Event listeners para formulários
  addGoalForm.addEventListener('submit', onSubmitAdd);
  editGoalForm.addEventListener('submit', onSubmitEdit);

  // Event listeners para as abas de filtro
  goalTabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
      const filter = event.target.dataset.filter;
      applyFilter(filter);

      // Atualizar a classe ativa
      goalTabs.forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    });
  });
});

// Funções de modal
function openAddGoalModal() {
  addGoalModal.style.display = 'flex';
}

function openEditGoalModal(goalId) {
  currentEditingGoal = goals.find(goal => goal.id === goalId);

  if (!currentEditingGoal) return;

  // Extrair dados da data
  let [day, month, year] = currentEditingGoal.targetDate.split('/');
  let formattedDate = `${year}-${month}-${day}`;

  // Determinando o tipo de ativo
  let assetType = '';
  if (currentEditingGoal.strategy.includes('Renda Fixa')) {
    assetType = 'renda_fixa';
  } else if (currentEditingGoal.strategy.includes('Criptos')) {
    assetType = 'criptoativos';
  } else if (currentEditingGoal.strategy.includes('FIIs')) {
    assetType = 'fiis';
  } else if (currentEditingGoal.strategy.includes('Ações')) {
    assetType = 'acoes';
  }

  // Determinando o prazo
  let term = '';
  if (currentEditingGoal.subtitle.includes('Curto prazo')) {
    term = 'curto';
  } else if (currentEditingGoal.subtitle.includes('Médio prazo')) {
    term = 'medio';
  } else if (currentEditingGoal.subtitle.includes('Longo prazo')) {
    term = 'longo';
  }

  // Preencher o formulário
  document.getElementById('edit-id').value = currentEditingGoal.id;
  document.getElementById('edit-title').value = currentEditingGoal.title;
  document.getElementById('edit-term').value = term;
  document.getElementById('edit-completionDate').value = formattedDate;
  document.getElementById('edit-targetValue').value = currentEditingGoal.targetValue;
  document.getElementById('edit-currentValue').value = currentEditingGoal.currentValue;
  document.getElementById('edit-assetType').value = assetType;

  editGoalModal.style.display = 'flex';
}

function closeModal() {
  addGoalModal.style.display = 'none';
  editGoalModal.style.display = 'none';

  // Resetar formulários
  addGoalForm.reset();
  editGoalForm.reset();

  // Limpar mensagens de erro
  clearValidationErrors(addGoalForm);
  clearValidationErrors(editGoalForm);

  currentEditingGoal = null;
}

// Função para limpar mensagens de erro de validação
function clearValidationErrors(form) {
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(element => {
    element.style.display = 'none';
  });

  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.classList.remove('invalid');
  });
}

// Funções de formulário
function validateForm(form) {
  let isValid = true;

  // Resetar mensagens de erro
  clearValidationErrors(form);

  // Validar cada campo
  const fields = form.querySelectorAll('input[required], select[required]');
  fields.forEach(field => {
    const errorId = field.id.includes('edit-') ?
      `${field.id}Error` :
      `${field.id.replace('edit-', '')}Error`;

    const errorElement = document.getElementById(errorId);

    if (!field.value.trim()) {
      field.classList.add('invalid');
      if (errorElement) errorElement.style.display = 'block';
      isValid = false;
    }
    else if (field.type === 'text' && field.minLength && field.value.length < field.minLength) {
      field.classList.add('invalid');
      if (errorElement) errorElement.style.display = 'block';
      isValid = false;
    }
    else if (field.type === 'number' && field.min && Number(field.value) < Number(field.min)) {
      field.classList.add('invalid');
      if (errorElement) errorElement.style.display = 'block';
      isValid = false;
    }
  });

  return isValid;
}

function onSubmitAdd(event) {
  event.preventDefault();

  if (!validateForm(addGoalForm)) return;

  const title = document.getElementById('title').value;
  const assetType = document.getElementById('assetType').value;
  const term = document.getElementById('term').value;
  const completionDate = document.getElementById('completionDate').value;
  const targetValue = parseFloat(document.getElementById('targetValue').value);

  // Formatar data
  const dateObj = new Date(completionDate);
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

  // Determinar texto do termo
  let termText = '';
  switch(term) {
    case 'curto':
      termText = 'Curto prazo';
      break;
    case 'medio':
      termText = 'Médio prazo';
      break;
    case 'longo':
      termText = 'Longo prazo';
      break;
  }

  // Determinar estratégia
  let strategy = '';
  switch(assetType) {
    case 'renda_fixa':
      strategy = '100% Renda Fixa';
      break;
    case 'criptoativos':
      strategy = '100% Criptoativos';
      break;
    case 'fiis':
      strategy = '100% FIIs';
      break;
    case 'acoes':
      strategy = '100% Ações';
      break;
  }

  // Criar nova meta
  const newGoal = {
    id: goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1,
    title: title,
    subtitle: `${termText} • Personalizado`,
    icon: 'custom',
    currentValue: 0,
    targetValue: targetValue,
    targetDate: formattedDate,
    strategy: strategy,
    status: 'in_progress'
  };

  goals.push(newGoal);
  applyFilter(currentFilter);
  updateGoalStats();
  closeModal();
}

function onSubmitEdit(event) {
  event.preventDefault();

  if (!validateForm(editGoalForm) || !currentEditingGoal) return;

  const id = parseInt(document.getElementById('edit-id').value);
  const title = document.getElementById('edit-title').value;
  const term = document.getElementById('edit-term').value;
  const targetValue = parseFloat(document.getElementById('edit-targetValue').value);
  const currentValue = parseFloat(document.getElementById('edit-currentValue').value);
  const completionDate = document.getElementById('edit-completionDate').value;
  const assetType = document.getElementById('edit-assetType').value;

  // Formatar data
  const dateObj = new Date(completionDate);
  const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

  // Determinar estratégia
  let strategy = '';
  switch(assetType) {
    case 'renda_fixa':
      strategy = '100% Renda Fixa';
      break;
    case 'criptoativos':
      strategy = '100% Criptoativos';
      break;
    case 'fiis':
      strategy = '100% FIIs';
      break;
    case 'acoes':
      strategy = '100% Ações';
      break;
  }

  // Determinar texto do termo
  let termText = '';
  switch(term) {
    case 'curto':
      termText = 'Curto prazo';
      break;
    case 'medio':
      termText = 'Médio prazo';
      break;
    case 'longo':
      termText = 'Longo prazo';
      break;
  }

  // Extrair categoria da meta atual
  let category = currentEditingGoal.subtitle.split('•')[1]?.trim() || '';
  let subtitle = `${termText} • ${category}`;

  // Atualizar a meta
  const index = goals.findIndex(g => g.id === id);
  if (index !== -1) {
    goals[index] = {
      ...goals[index],
      title,
      subtitle,
      targetValue,
      currentValue,
      targetDate: formattedDate,
      strategy,
      status: currentValue >= targetValue ? 'completed' : 'in_progress'
    };
  }

  applyFilter(currentFilter);
  updateGoalStats();
  closeModal();
}

// Funções de filtro e exibição
function applyFilter(filter) {
  currentFilter = filter;

  switch (filter) {
    case 'all':
      filteredGoals = [...goals];
      break;
    case 'in_progress':
      filteredGoals = goals.filter(goal => goal.status === 'in_progress');
      break;
    case 'completed':
      filteredGoals = goals.filter(goal => goal.status === 'completed');
      break;
  }

  renderGoals();
}

function renderGoals() {
  goalsList.innerHTML = '';

  filteredGoals.forEach(goal => {
    const progressPercentage = calculateProgressPercentage(goal);
    const progressClass = goal.status === 'completed' ? 'completed' : '';

    const goalCard = document.createElement('div');
    goalCard.className = 'goal-card';
    goalCard.dataset.id = goal.id;

    // Determine icon class based on goal.icon
    let iconClass = 'fa-regular';
    switch(goal.icon) {
      case 'reserve':
        iconClass += ' fa-piggy-bank';
        break;
      case 'vacation':
        iconClass += ' fa-plane';
        break;
      case 'house':
        iconClass += ' fa-house';
        break;
      default:
        iconClass += ' fa-circle-dot';
    }

    goalCard.innerHTML = `
      <div class="goal-header">
        <div class="goal-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="goal-title">
          <h3>${goal.title}</h3>
          <p>${goal.subtitle}</p>
        </div>
        <div class="goal-actions">
          <button class="edit-goal-btn" onclick="openEditGoalModal(${goal.id})">
            <i class="fas fa-pencil"></i>
          </button>
        </div>
      </div>
      <div class="goal-body">
        <div class="goal-progress">
          <div class="progress-bar ${progressClass}">
            <div class="progress" style="width: ${progressPercentage}%"></div>
          </div>
          <div class="progress-label">
            <span>${progressPercentage.toFixed(0)}%</span>
          </div>
        </div>
        <div class="goal-details">
          <div class="goal-detail">
            <span class="detail-label">Valor atual:</span>
            <span class="detail-value">R$ ${goal.currentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Meta:</span>
            <span class="detail-value">R$ ${goal.targetValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Data conclusão:</span>
            <span class="detail-value">${goal.targetDate}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Estratégia:</span>
            <span class="detail-value">${goal.strategy}</span>
          </div>
        </div>
      </div>
    `;

    goalsList.appendChild(goalCard);
  });
}

function updateGoalStats() {
  const totalGoals = goals.length;
  const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  const totalTarget = goals.reduce((sum, goal) => {
    return goal.status === 'in_progress' ? sum + (goal.targetValue - goal.currentValue) : sum;
  }, 0);

  // Atualizar os cards de estatísticas
  const statCards = document.querySelectorAll('.goal-stat-card');
  if (statCards.length >= 3) {
    statCards[0].querySelector('.stat-value').textContent = inProgressGoals;
    statCards[1].querySelector('.stat-value').textContent = completedGoals;
    statCards[2].querySelector('.stat-value').textContent = `R$ ${totalTarget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    // Atualizar as barras de progresso
    const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    statCards[0].querySelector('.progress').style.width = `${(inProgressGoals / totalGoals) * 100}%`;
    statCards[1].querySelector('.progress').style.width = `${overallProgress}%`;
  }
}

function calculateProgressPercentage(goal) {
  return (goal.currentValue / goal.targetValue) * 100;
}

// Função global necessária para o evento de clique inline
window.openEditGoalModal = openEditGoalModal;
