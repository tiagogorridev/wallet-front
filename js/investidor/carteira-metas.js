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

    // Mapeia o tipo de ativo a partir da descrição da meta ou usa um valor padrão
    let assetType = getAssetTypeFromDescription(currentEditingGoal.descricao);
    
    // Mapeia o prazo com base na data inicial e final
    let term = getTermFromDates(currentEditingGoal.data_inicial, currentEditingGoal.data_final);

    document.getElementById('edit-id').value = currentEditingGoal.id;
    document.getElementById('edit-title').value = currentEditingGoal.descricao;
    document.getElementById('edit-term').value = term;
    document.getElementById('edit-completionDate').value = formattedDate;
    document.getElementById('edit-targetValue').value = currentEditingGoal.valor_meta;
    document.getElementById('edit-currentValue').value = (currentEditingGoal.valor_meta * currentEditingGoal.progresso / 100).toFixed(2);
    document.getElementById('edit-assetType').value = assetType;

    editGoalModal.style.display = 'flex';
  } catch (error) {
    console.error('Erro ao buscar detalhes da meta:', error);
  }
}

function getAssetTypeFromDescription(description) {
  if (description) {
    description = description.toLowerCase();
    if (description.includes('renda fixa')) return 'renda_fixa';
    if (description.includes('cripto') || description.includes('bitcoin')) return 'criptoativos';
    if (description.includes('ações') || description.includes('acoes')) return 'acoes';
  }
  // Valor padrão
  return 'renda_fixa';
}

function getTermFromDates(startDate, endDate) {
  try {
    // Converte as datas para objetos Date
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    // Calcula a diferença em meses
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (diffMonths <= 12) return 'curto';
    if (diffMonths <= 36) return 'medio';
    return 'longo';
  } catch (e) {
    console.error('Erro ao calcular prazo:', e);
    return 'medio'; // Valor padrão
  }
}

function parseDate(dateString) {
  if (!dateString) return new Date();
  
  // Tenta fazer o parse da data em formato DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  
  // Se falhar, tenta fazer o parse direto
  return new Date(dateString);
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
  const term = document.getElementById('term').value;
  const completionDate = document.getElementById('completionDate').value;
  const targetValue = parseFloat(document.getElementById('targetValue').value);

  const today = new Date();
  const formattedStartDate = formatDate(today);
  const formattedEndDate = formatDate(completionDate);
  const description = createDescription(title, term, assetType);

  // Criar objeto de meta conforme a estrutura do banco de dados
  const newGoal = {
    data_inicial: formattedStartDate,
    valor_meta: targetValue,
    data_final: formattedEndDate,
    progresso: 0,
    descricao: description,
    meta_status: 'EM_ANDAMENTO',
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
  const term = document.getElementById('edit-term').value;
  const targetValue = parseFloat(document.getElementById('edit-targetValue').value);
  const currentValue = parseFloat(document.getElementById('edit-currentValue').value);
  const completionDate = document.getElementById('edit-completionDate').value;
  const assetType = document.getElementById('edit-assetType').value;

  // Calcular o progresso com base no valor atual e valor alvo
  const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
  
  // Definir o status com base no progresso
  const status = progress >= 100 ? 'CONCLUIDA' : 'EM_ANDAMENTO';
  
  const description = createDescription(title, term, assetType);
  
  const updatedGoal = {
    id,
    data_inicial: currentEditingGoal.data_inicial,
    valor_meta: targetValue,
    data_final: formatDate(completionDate),
    progresso: progress,
    descricao: description,
    meta_status: status,
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

function createDescription(title, term, assetType) {
  const termText = getTermText(term);
  const strategyText = getStrategyText(assetType);
  return `${title} - ${termText} - ${strategyText}`;
}

function getTermText(term) {
  switch(term) {
    case 'curto': return 'Curto prazo';
    case 'medio': return 'Médio prazo';
    case 'longo': return 'Longo prazo';
    default: return 'Médio prazo';
  }
}

function getStrategyText(assetType) {
  switch(assetType) {
    case 'renda_fixa': return '100% Renda Fixa';
    case 'criptoativos': return '100% Criptoativos';
    case 'acoes': return '100% Ações';
    default: return '100% Renda Fixa';
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
        case 'in_progress':
          filteredGoals = goals.filter(goal => goal.meta_status === 'EM_ANDAMENTO');
          break;
        case 'completed':
          filteredGoals = goals.filter(goal => goal.meta_status === 'CONCLUIDA');
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
    const progressClass = goal.meta_status === 'CONCLUIDA' ? 'completed' : '';
    
    // Calcular o valor atual baseado no progresso e valor meta
    const currentValue = (goal.valor_meta * progressPercentage / 100).toFixed(2);

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
    
    const totalGoals = goals.length;
    const inProgressGoals = goals.filter(g => g.meta_status === 'EM_ANDAMENTO').length;
    const completedGoals = goals.filter(g => g.meta_status === 'CONCLUIDA').length;

    const totalTarget = goals.reduce((sum, goal) => {
      if (goal.meta_status === 'EM_ANDAMENTO') {
        const currentValue = (goal.valor_meta * (goal.progresso || 0)) / 100;
        return sum + (goal.valor_meta - currentValue);
      }
      return sum;
    }, 0);

    const statCards = document.querySelectorAll('.goal-stat-card');
    if (statCards.length >= 3) {
      statCards[0].querySelector('.stat-value').textContent = inProgressGoals;
      statCards[1].querySelector('.stat-value').textContent = completedGoals;
      statCards[2].querySelector('.stat-value').textContent = `R$ ${totalTarget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

      const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
      statCards[0].querySelector('.progress').style.width = `${totalGoals > 0 ? (inProgressGoals / totalGoals) * 100 : 0}%`;
      statCards[1].querySelector('.progress').style.width = `${overallProgress}%`;
    }
  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
  }
}

window.openEditGoalModal = openEditGoalModal;
window.deleteGoal = deleteGoal;