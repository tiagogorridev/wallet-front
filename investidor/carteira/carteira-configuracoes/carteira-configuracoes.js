document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o header
  initHeader();

  // Inicializar os perfis de investidor
  initInvestorProfiles();

  // Inicializar a alocação
  initAllocation();

  // Inicializar os botões de salvar
  initSaveButtons();
});

// Função para inicializar o header
function initHeader() {
  const header = document.getElementById('investidor-header');

  // Conteúdo do header
  header.innerHTML = `
      <div class="header-logo">InvestDash</div>
      <div class="header-nav">
          <a href="#" class="header-nav-item active">Dashboard</a>
          <a href="#" class="header-nav-item">Carteiras</a>
          <a href="#" class="header-nav-item">Transações</a>
          <a href="#" class="header-nav-item">Relatórios</a>
          <a href="#" class="header-nav-item">Configurações</a>
      </div>
      <div class="header-actions">
          <div class="header-user">
              <div class="user-avatar">U</div>
              <span>Usuário</span>
          </div>
      </div>
  `;

  // Adicionar eventos aos links do header
  const navItems = header.querySelectorAll('.header-nav-item');
  navItems.forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          navItems.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
      });
  });
}

// Função para inicializar os perfis de investidor
function initInvestorProfiles() {
  const profileOptions = document.querySelectorAll('.profile-option');

  profileOptions.forEach(option => {
      option.addEventListener('click', function() {
          profileOptions.forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');

          // Aqui você pode adicionar lógica para alterar alocações baseadas no perfil
          const profileType = this.getAttribute('data-profile');
          updateAllocationByProfile(profileType);
      });
  });
}

// Função para atualizar alocações baseadas no perfil selecionado
function updateAllocationByProfile(profileType) {
  const cryptoInput = document.getElementById('crypto-allocation');
  const fixedIncomeInput = document.getElementById('fixed-income-allocation');
  const stocksInput = document.getElementById('stocks-allocation');

  switch(profileType) {
      case 'conservative':
          cryptoInput.value = 10;
          fixedIncomeInput.value = 80;
          stocksInput.value = 10;
          break;
      case 'moderate':
          cryptoInput.value = 30;
          fixedIncomeInput.value = 50;
          stocksInput.value = 20;
          break;
      case 'aggressive':
          cryptoInput.value = 50;
          fixedIncomeInput.value = 20;
          stocksInput.value = 30;
          break;
  }

  // Atualizar o total
  updateTotalAllocation();
}

// Função para inicializar a alocação
function initAllocation() {
  const allocationInputs = document.querySelectorAll('.allocation-value');

  allocationInputs.forEach(input => {
      input.addEventListener('input', updateTotalAllocation);
  });

  // Inicializar o total
  updateTotalAllocation();
}

// Função para atualizar o total da alocação
function updateTotalAllocation() {
  const cryptoValue = parseInt(document.getElementById('crypto-allocation').value) || 0;
  const fixedIncomeValue = parseInt(document.getElementById('fixed-income-allocation').value) || 0;
  const stocksValue = parseInt(document.getElementById('stocks-allocation').value) || 0;

  const total = cryptoValue + fixedIncomeValue + stocksValue;
  const totalElement = document.getElementById('total-allocation');

  totalElement.textContent = total + '%';

  // Alterar a cor se o total não for 100%
  if (total !== 100) {
      totalElement.style.color = 'var(--red)';
  } else {
      totalElement.style.color = 'var(--ambar)';
  }
}

// Função para inicializar os botões de salvar
function initSaveButtons() {
  // Botão salvar dados da carteira
  const saveAccountBtn = document.getElementById('save-account');
  saveAccountBtn.addEventListener('click', function() {
      const portfolioName = document.getElementById('portfolio-name').value;
      const currencySelect = document.getElementById('currency-select');
      const selectedCurrency = currencySelect.options[currencySelect.selectedIndex].text;

      alert(`Carteira "${portfolioName}" com moeda "${selectedCurrency}" salva com sucesso!`);
  });

  // Botão salvar alocação
  const saveAllocationBtn = document.getElementById('save-allocation');
  saveAllocationBtn.addEventListener('click', function() {
      const cryptoValue = document.getElementById('crypto-allocation').value;
      const fixedIncomeValue = document.getElementById('fixed-income-allocation').value;
      const stocksValue = document.getElementById('stocks-allocation').value;

      const total = parseInt(cryptoValue) + parseInt(fixedIncomeValue) + parseInt(stocksValue);

      if (total !== 100) {
          alert('A soma das alocações deve ser exatamente 100%');
          return;
      }

      alert(`Alocação salva com sucesso! Criptomoedas: ${cryptoValue}%, Renda Fixa: ${fixedIncomeValue}%, Ações: ${stocksValue}%`);
  });
}
