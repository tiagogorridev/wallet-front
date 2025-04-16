document.addEventListener('DOMContentLoaded', function() {
  const headerContainer = document.getElementById('header');

  if (headerContainer) {
    fetch('../../html/investidor/header.html')
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        initializeHeader();
      })
      .catch(error => console.error('Erro ao carregar o header:', error));
  } else {
    initializeHeader();
  }

  function initializeHeader() {
    const addAssetButton = document.getElementById('headerAddAssetBtn');
    if (addAssetButton) {
      addAssetButton.addEventListener('click', function() {
        const modal = document.getElementById('addAssetModal');
        if (modal) {
          modal.style.display = 'flex';
        } else {
          document.dispatchEvent(new CustomEvent('openAddAssetModal'));
        }
      });
    }
    
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = '../../../html/auth/login.html';
      });
    }

    markActivePage();
    updateInvestmentSummary();
    initializePortfolioDropdown();
  }

  function markActivePage() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(function(item) {
      const href = item.getAttribute('href') || '';
      item.classList.remove('active');
      
      if (currentPath.includes(href)) {
        item.classList.add('active');
      }
    });
    
    if (!document.querySelector('.nav-item.active') && 
        (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      const homeItem = document.querySelector('.nav-item:first-child');
      if (homeItem) homeItem.classList.add('active');
    }
  }

  function updateInvestmentSummary() {
    const patrimonioTotal = document.querySelector('.summary-value:nth-of-type(1)');
    const rentabilidade = document.querySelector('.summary-value:nth-of-type(2)');
    const mesAtual = document.querySelector('.summary-value:nth-of-type(3)');

    if (patrimonioTotal && localStorage.getItem('patrimonioTotal')) {
      patrimonioTotal.textContent = localStorage.getItem('patrimonioTotal');
    }

    if (rentabilidade && localStorage.getItem('rentabilidade')) {
      const valor = parseFloat(localStorage.getItem('rentabilidade'));
      rentabilidade.textContent = (valor >= 0 ? '+' : '') + valor + '%';
      rentabilidade.className = 'summary-value ' + (valor >= 0 ? 'positive' : 'negative');
    }

    if (mesAtual && localStorage.getItem('mesAtual')) {
      const valor = parseFloat(localStorage.getItem('mesAtual'));
      mesAtual.textContent = (valor >= 0 ? '+' : '') + valor + '%';
      mesAtual.className = 'summary-value ' + (valor >= 0 ? 'positive' : 'negative');
    }
  }

  function initializePortfolioDropdown() {
    const portfolioSelector = document.querySelector('.portfolio-selector');
    if (!portfolioSelector || portfolioSelector.querySelector('.portfolio-dropdown')) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'portfolio-dropdown';
    dropdown.style.display = 'none';

    const portfolios = JSON.parse(localStorage.getItem('userPortfolios')) || [
      { id: 1, name: 'Carteira Principal' },
      { id: 2, name: 'Carteira de Viagem' },
      { id: 3, name: 'Carteira Aposentadoria' }
    ];

    portfolios.forEach(portfolio => {
      const option = document.createElement('div');
      option.className = 'portfolio-option';
      
      const currentName = portfolioSelector.querySelector('span')?.textContent || 'Carteira Principal';
      
      option.innerHTML = `
        <span>${portfolio.name}</span>
        <i class="fas fa-check ${currentName === portfolio.name ? 'visible' : 'hidden'}"></i>
      `;
      
      option.addEventListener('click', function() {
        const nameSpan = portfolioSelector.querySelector('span');
        if (nameSpan) nameSpan.textContent = portfolio.name;
        
        dropdown.style.display = 'none';
        const icon = portfolioSelector.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
        
        localStorage.setItem('selectedPortfolio', portfolio.name);
        document.dispatchEvent(new CustomEvent('portfolioChanged', {
          detail: { portfolio: portfolio }
        }));
        
        document.querySelectorAll('.portfolio-option i').forEach(i => {
          i.classList.add('hidden');
          i.classList.remove('visible');
        });
        
        option.querySelector('i')?.classList.add('visible');
        option.querySelector('i')?.classList.remove('hidden');
      });
      
      dropdown.appendChild(option);
    });
    
    portfolioSelector.appendChild(dropdown);
    portfolioSelector.addEventListener('click', function(e) {
      if (e.target.closest('.portfolio-option')) return;
      
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
      
      const icon = portfolioSelector.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-chevron-up', !isVisible);
        icon.classList.toggle('fa-chevron-down', isVisible);
      }
    });

    document.addEventListener('click', function(e) {
      if (!portfolioSelector.contains(e.target)) {
        dropdown.style.display = 'none';
        const icon = portfolioSelector.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
      }
    });
  }
});