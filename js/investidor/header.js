document.addEventListener('DOMContentLoaded', function() {
  const headerContainer = document.getElementById('header');
  const API_URL = 'http://191.239.116.115:8080';

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
        window.location.href = '../../index.html';
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
    const token = localStorage.getItem('accessToken');
    const nameSpan = portfolioSelector.querySelector('span');
    if (!token) {
      console.error('Token de autenticação não encontrado');
      if (nameSpan) {
        nameSpan.textContent = 'Carteira não encontrada';
      }
      
      const option = document.createElement('div');
      option.className = 'portfolio-option';
      option.innerHTML = '<span>Faça login novamente</span>';
      dropdown.appendChild(option);
      portfolioSelector.appendChild(dropdown);
      return;
    }
    
    fetch(`${API_URL}/wallets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao buscar carteiras');
      }
      return response.json();
    })
    .then(result => {
      if (result.error) {
        throw new Error(result.msg || 'Erro ao buscar carteiras');
      }
      
      const carteiras = result.data.data || [];
      const selectedPortfolioName = localStorage.getItem('selectedPortfolio') || (carteiras.length > 0 ? carteiras[0].nome : 'Carteira não encontrada');
      if (nameSpan) {
        nameSpan.textContent = selectedPortfolioName;
      }
      
      carteiras.forEach(carteira => {
        const option = document.createElement('div');
        option.className = 'portfolio-option';
        
        option.innerHTML = `
          <span>${carteira.nome}</span>
          <i class="fas fa-check ${selectedPortfolioName === carteira.nome ? 'visible' : 'hidden'}"></i>
        `;
        
        option.addEventListener('click', function() {
          if (nameSpan) nameSpan.textContent = carteira.nome;
          
          dropdown.style.display = 'none';
          const icon = portfolioSelector.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
          }
          
          localStorage.setItem('selectedPortfolio', carteira.nome);
          document.dispatchEvent(new CustomEvent('portfolioChanged', {
            detail: { portfolio: carteira }
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
      
      if (carteiras.length === 0) {
        const noPortfolio = document.createElement('div');
        noPortfolio.className = 'portfolio-option';
        noPortfolio.innerHTML = '<span>Nenhuma carteira encontrada</span>';
        dropdown.appendChild(noPortfolio);
      }
      
      portfolioSelector.appendChild(dropdown);
    })
    .catch(error => {
      console.error('Erro ao buscar carteiras:', error);
      if (nameSpan) {
        nameSpan.textContent = 'Carteira não encontrada';
      }
      
      const option = document.createElement('div');
      option.className = 'portfolio-option';
      option.innerHTML = '<span>Erro ao carregar carteiras</span>';
      dropdown.appendChild(option);
      portfolioSelector.appendChild(dropdown);
    });
    
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