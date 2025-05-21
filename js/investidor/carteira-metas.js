const API_URL = 'http://191.239.116.115:8080';
let filteredGoals = [];
let currentFilter = 'all';
let currentEditingGoal = null;

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

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  fetchGoals().then((goals) => {
    console.log('goals carregadas:', goals);
    filteredGoals = goals;
    applyFilter('all');
    updateGoalStats();
    setupEventListeners();
  }).catch(error => {
    console.error('Erro ao inicializar aplicação:', error);
  });
}

async function fetchGoals() {
  try {
    const response = await fetch(`${API_URL}/goals`);
    if (!response.ok) {
      throw new Error('Falha ao carregar as goals');
    }
    const data = await response.json();
    
    // Verifica se data é um array
    if (!Array.isArray(data)) {
      console.warn('API não retornou um array de goals:', data);
      // Se data não for um array, mas tiver uma propriedade que seja um array
      if (data && typeof data === 'object') {
        for (const key in data) {
          if (Array.isArray(data[key])) {
            return data[key];
          }
        }
      }
      // Se não conseguir encontrar um array, retorna array vazio
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar goals:', error);
    return [];
  }
}

function setupEventListeners() {
  openAddGoalModalBtn.addEventListener('click', openAddGoalModal);
  closeAddModalBtn.addEventListener('click', closeModal);
  closeEditModalBtn.addEventListener('click', closeModal);

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  addGoalForm.addEventListener('submit', onSubmitAdd);
  editGoalForm.addEventListener('submit', onSubmitEdit);

  goalTabs.forEach(tab => {
    tab.addEventListener('click', (event) => {
      const filter = event.target.dataset.filter;
      applyFilter(filter);

      goalTabs.forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    });
  });
}

function openAddGoalModal() {
  addGoalModal.style.display = 'flex';
}

async function openEditGoalModal(goalId) {
  try {
    console.log('Buscando detalhes da meta:', goalId);
    
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro da API (buscar meta):', errorText);
      throw new Error(`Falha ao carregar os detalhes da meta: ${response.status} ${response.statusText}`);
    }
    
    const goal = await response.json();
    console.log('Meta carregada:', goal);
    
    currentEditingGoal = goal;

    if (!currentEditingGoal) {
      console.error('Meta não encontrada ou inválida');
      return;
    }

    // Formata a data para o formato esperado pelo input type="date"
    let [day, month, year] = currentEditingGoal.data_final.split('/');
    let formattedDate = `${year}-${month}-${day}`;
    
    // Extrair o tipo de ativo da descrição
    let assetType = getAssetTypeFromDescription(currentEditingGoal.descricao);

    document.getElementById('edit-id').value = currentEditingGoal.id;
    document.getElementById('edit-title').value = getGoalTitle(currentEditingGoal.descricao);
    document.getElementById('edit-completionDate').value = formattedDate;
    document.getElementById('edit-targetValue').value = currentEditingGoal.valor_meta;
    document.getElementById('edit-assetType').value = assetType;

    editGoalModal.style.display = 'flex';
  } catch (error) {
    console.error('Erro ao buscar detalhes da meta:', error);
  }
}

function getAssetTypeFromDescription(description) {
  if (description) {
    description = description.toLowerCase();
    if (description.includes('cripto') || description.includes('bitcoin')) return 'criptoativos';
    if (description.includes('ações') || description.includes('acoes')) return 'acoes';
  }
}

function closeModal() {
  addGoalModal.style.display = 'none';
  editGoalModal.style.display = 'none';

  addGoalForm.reset();
  editGoalForm.reset();

  clearValidationErrors(addGoalForm);
  clearValidationErrors(editGoalForm);

  currentEditingGoal = null;
}

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

function validateForm(form) {
  let isValid = true;

  clearValidationErrors(form);

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

async function onSubmitAdd(event) {
  event.preventDefault();

  if (!validateForm(addGoalForm)) return;

  const title = document.getElementById('title').value;
  const assetType = document.getElementById('assetType').value;
  const completionDate = document.getElementById('completionDate').value;
  const targetValue = parseFloat(document.getElementById('targetValue').value);

  const formattedEndDate = formatDate(completionDate);
  const description = createDescription(title, assetType);

  // Criar objeto de meta conforme a estrutura do banco de dados
  const newGoal = {
    valor_meta: targetValue,
    data_final: formattedEndDate,
    descricao: description,
    id_carteira: 1  // Presumindo um valor padrão, ajuste conforme necessário
  };

  try {
    console.log('Enviando meta para API:', JSON.stringify(newGoal));
    
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newGoal)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro da API:', errorText);
      throw new Error(`Falha ao adicionar meta: ${response.status} ${response.statusText}`);
    }

    const goals = await fetchGoals();
    applyFilter(currentFilter);
    updateGoalStats();
    closeModal();
  } catch (error) {
    console.error('Erro ao adicionar meta:', error);
  }
}

async function onSubmitEdit(event) {
  event.preventDefault();

  if (!validateForm(editGoalForm) || !currentEditingGoal) return;

  const id = parseInt(document.getElementById('edit-id').value);
  const title = document.getElementById('edit-title').value;
  const targetValue = parseFloat(document.getElementById('edit-targetValue').value);
  const completionDate = document.getElementById('edit-completionDate').value;
  const assetType = document.getElementById('edit-assetType').value;
  const status = document.getElementById('edit-status').value;
  
  const description = createDescription(title, assetType);
  
  const updatedGoal = {
    id,
    valor_meta: targetValue,
    data_final: formatDate(completionDate),
    descricao: description,
    id_carteira: currentEditingGoal.id_carteira || 1
  };

  try {
    console.log('Enviando atualização para API:', JSON.stringify(updatedGoal));
    
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updatedGoal)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro da API (edição):', errorText);
      throw new Error(`Falha ao atualizar meta: ${response.status} ${response.statusText}`);
    }

    const goals = await fetchGoals();
    applyFilter(currentFilter);
    updateGoalStats();
    closeModal();
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
  }
}

async function deleteGoal(goalId) {
  try {
    const response = await fetch(`${API_URL}/goals/${goalId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta de erro da API (exclusão):', errorText);
      throw new Error(`Falha ao deletar meta: ${response.status} ${response.statusText}`);
    }

    const goals = await fetchGoals();
    applyFilter(currentFilter);
    updateGoalStats();
  } catch (error) {
    console.error('Erro ao deletar meta:', error);
  }
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
}

function createDescription(title, assetType) {
  const strategyText = getStrategyText(assetType);
  return `${title} - ${strategyText}`;
}

function getStrategyText(assetType) {
  switch(assetType) {
    case 'criptoativos': return '100% Criptoativos';
    case 'acoes': return '100% Ações';
  }
}

async function applyFilter(filter) {
  currentFilter = filter;
  
  try {
    const goals = await fetchGoals();
    
    if (!Array.isArray(goals)) {
      console.error('Goals não é um array:', goals);
      filteredGoals = [];
    } else {
      switch (filter) {
        case 'all':
          filteredGoals = [...goals];
          break;
        default:
          filteredGoals = [...goals];
      }
    }

    renderGoals();
  } catch (error) {
    console.error('Erro ao aplicar filtro:', error);
  }
}

function renderGoals() {
  goalsList.innerHTML = '';

  filteredGoals.forEach(goal => {
    const progressPercentage = goal.progresso || 0;
    
    // Não calculamos o valor atual - vem do backend
    const currentValue = goal.valor_atual || 0;

    const goalCard = document.createElement('div');
    goalCard.className = 'goal-card';
    goalCard.dataset.id = goal.id;

    // Determinar o ícone com base na descrição
    let iconClass = getIconForGoal(goal.descricao);

    goalCard.innerHTML = `
      <div class="goal-header">
        <div class="goal-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="goal-title">
          <h3>${getGoalTitle(goal.descricao)}</h3>
          <p>${getGoalSubtitle(goal.descricao)}</p>
        </div>
        <div class="goal-actions">
          <button class="edit-goal-btn" onclick="openEditGoalModal(${goal.id})">
            <i class="fas fa-pencil"></i>
          </button>
          <button class="delete-goal-btn" onclick="deleteGoal(${goal.id})">
            <i class="fas fa-trash"></i>
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
            <span class="detail-value">R$ ${parseFloat(currentValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Meta:</span>
            <span class="detail-value">R$ ${parseFloat(goal.valor_meta).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Data conclusão:</span>
            <span class="detail-value">${goal.data_final}</span>
          </div>
          <div class="goal-detail">
            <span class="detail-label">Estratégia:</span>
            <span class="detail-value">${getStrategyFromDescription(goal.descricao)}</span>
          </div>
        </div>
      </div>
    `;

    goalsList.appendChild(goalCard);
  });
}

function getIconForGoal(description) {
  if (!description) return 'fa-regular fa-circle-dot';
  
  description = description.toLowerCase();
  if (description.includes('emergência') || description.includes('emergencia') || description.includes('reserva')) {
    return 'fa-regular fa-piggy-bank';
  }
  if (description.includes('férias') || description.includes('ferias') || description.includes('viagem')) {
    return 'fa-regular fa-plane';
  }
  if (description.includes('casa') || description.includes('imóvel') || description.includes('imovel')) {
    return 'fa-regular fa-house';
  }
  return 'fa-regular fa-circle-dot';
}

function getGoalTitle(description) {
  if (!description) return 'Meta';
  
  // Extrai o título da descrição (assumindo que é a primeira parte até o primeiro hífen)
  const parts = description.split('-');
  return parts[0].trim();
}

function getGoalSubtitle(description) {
  if (!description) return '';
  
  // Extrai o subtítulo da descrição (assumindo que é o restante após o primeiro hífen)
  const parts = description.split('-');
  if (parts.length > 1) {
    return parts.slice(1).join('-').trim();
  }
  return '';
}

function getStrategyFromDescription(description) {
  if (!description) return '';
  
  // Extrai a estratégia da descrição (assumindo que é a última parte após o último hífen)
  const parts = description.split('-');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return '';
}

async function updateGoalStats() {
  try {
    const goals = await fetchGoals();
    
    if (!Array.isArray(goals)) {
      console.error('Goals não é um array em updateGoalStats:', goals);
      return;
    }
    

    // Obter o total a alcançar diretamente da API, sem cálculos
    const totalTarget = goals.reduce((sum, goal) => {
        return sum + goal.valor_meta;
    }, 0);

    const statCards = document.querySelectorAll('.goal-stat-card');
    if (statCards.length >= 3) {
      statCards[0].querySelector('.stat-value').textContent = activeGoals;
      statCards[1].querySelector('.stat-value').textContent = completedGoals;
      statCards[2].querySelector('.stat-value').textContent = `R$ ${totalTarget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

      const totalGoals = activeGoals + completedGoals;
      const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      statCards[0].querySelector('.progress').style.width = `${totalGoals > 0 ? (activeGoals / totalGoals) * 100 : 0}%`;
      statCards[1].querySelector('.progress').style.width = `${overallProgress}%`;
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

window.openEditGoalModal = openEditGoalModal;
window.deleteGoal = deleteGoal;