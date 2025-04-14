document.addEventListener('DOMContentLoaded', function() {
  initHeader();
  initInvestorProfiles();
  initAllocation();
  initSaveButtons();
});

function initHeader() {
  const header = document.getElementById('investidor-header');
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

  const navItems = header.querySelectorAll('.header-nav-item');
  navItems.forEach(item => {
      item.addEventListener('click', function(e) {
          e.preventDefault();
          navItems.forEach(i => i.classList.remove('active'));
          this.classList.add('active');
      });
  });
}

function initInvestorProfiles() {
  const profileOptions = document.querySelectorAll('.profile-option');
  profileOptions.forEach(option => {
      option.addEventListener('click', function() {
          profileOptions.forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
          const profileType = this.getAttribute('data-profile');
          updateAllocationByProfile(profileType);
      });
  });
}

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
  updateTotalAllocation();
}

function initAllocation() {
  const allocationInputs = document.querySelectorAll('.allocation-value');
  allocationInputs.forEach(input => {
      input.addEventListener('input', updateTotalAllocation);
  });
  updateTotalAllocation();
}

function updateTotalAllocation() {
  const cryptoValue = parseInt(document.getElementById('crypto-allocation').value) || 0;
  const fixedIncomeValue = parseInt(document.getElementById('fixed-income-allocation').value) || 0;
  const stocksValue = parseInt(document.getElementById('stocks-allocation').value) || 0;

  const total = cryptoValue + fixedIncomeValue + stocksValue;
  const totalElement = document.getElementById('total-allocation');

  totalElement.textContent = total + '%';
  totalElement.style.color = (total !== 100) ? 'var(--red)' : 'var(--ambar)';
}

function initSaveButtons() {
  const saveAccountBtn = document.getElementById('save-account');
  saveAccountBtn.addEventListener('click', function() {
      const portfolioName = document.getElementById('portfolio-name').value;
      const currencySelect = document.getElementById('currency-select');
      const selectedCurrency = currencySelect.options[currencySelect.selectedIndex].text;

      alert(`Carteira "${portfolioName}" com moeda "${selectedCurrency}" salva com sucesso!`);
  });

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
