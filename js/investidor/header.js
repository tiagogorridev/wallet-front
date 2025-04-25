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
      if ((!localStorage.getItem('selectedPortfolio') || !localStorage.getItem('selectedWalletId')) && carteiras.length > 0) {
        localStorage.setItem('selectedPortfolio', carteiras[0].nome);
        localStorage.setItem('selectedWalletId', carteiras[0].id);
      }
      
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
          localStorage.setItem('selectedWalletId', carteira.id);
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
      
      const newWalletOption = document.createElement('div');
      newWalletOption.className = 'portfolio-option new-wallet-option';
      newWalletOption.innerHTML = `
        <span><i class="fas fa-plus"></i> Nova Carteira</span>
      `;
      newWalletOption.addEventListener('click', function(e) {
        e.stopPropagation();
        const walletModal = document.getElementById('add-wallet-modal');
        if (walletModal) {
          walletModal.style.display = 'block';
          dropdown.style.display = 'none';
          const icon = portfolioSelector.querySelector('i');
          if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
          }
        } else {
          document.dispatchEvent(new CustomEvent('openWalletModal'));
        }
      });
      dropdown.appendChild(newWalletOption);
      
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

  document.addEventListener('openWalletModal', function() {
    console.log('Modal de carteira não encontrado na página atual');
  });
  function initializeWalletModal() {
    const addWalletModal = document.getElementById('add-wallet-modal');
    if (!addWalletModal) {
      createWalletModal();
    }
    setupWalletModalEvents();
  }

  function createWalletModal() {
    const modalHtml = `
    <div id="add-wallet-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Nova Carteira</h2>
            <form id="add-wallet-form">
                <div class="form-group">
                    <label for="wallet-name">Nome da Carteira</label>
                    <input type="text" id="wallet-name" required>
                </div>
                <div class="form-group">
                    <label for="wallet-description">Descrição</label>
                    <textarea id="wallet-description"></textarea>
                </div>
                <button type="submit" class="btn-submit">Criar Carteira</button>
            </form>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  function setupWalletModalEvents() {
    const walletModal = document.getElementById('add-wallet-modal');
    const walletCloseModal = walletModal?.querySelector('.close-modal');
    const addWalletForm = document.getElementById('add-wallet-form');
    
    if (!walletModal || !walletCloseModal || !addWalletForm) return;
    walletCloseModal.addEventListener('click', () => {
      walletModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
      if (event.target === walletModal) {
        walletModal.style.display = 'none';
      }
    });
    addWalletForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const walletName = document.getElementById('wallet-name').value;
      const walletDescription = document.getElementById('wallet-description').value;
      
      if (!walletName.trim()) {
        alert('O nome da carteira é obrigatório');
        return;
      }
      
      const walletData = {
        nome: walletName,
        descricao: walletDescription
      };
      
      try {
        let loadingMessage = document.createElement('div');
        loadingMessage.id = 'loading-message';
        loadingMessage.style.position = 'fixed';
        loadingMessage.style.top = '50%';
        loadingMessage.style.left = '50%';
        loadingMessage.style.transform = 'translate(-50%, -50%)';
        loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loadingMessage.style.color = 'white';
        loadingMessage.style.padding = '20px';
        loadingMessage.style.borderRadius = '5px';
        loadingMessage.style.zIndex = '1000';
        loadingMessage.textContent = 'Criando carteira...';
        document.body.appendChild(loadingMessage);
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }
        
        const response = await fetch(`${API_URL}/wallets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(walletData)
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '../../index.html';
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          }
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.msg || 'Erro ao criar carteira');
        }
        
        console.log('Nova carteira criada:', result.data.data);
        if (result.data && result.data.data) {
          localStorage.setItem('selectedWalletId', result.data.data.id);
          localStorage.setItem('selectedPortfolio', result.data.data.nome);
          document.dispatchEvent(new CustomEvent('portfolioChanged', {
            detail: { portfolio: result.data.data }
          }));
        }
        document.querySelector('.portfolio-dropdown')?.remove();
        initializePortfolioDropdown();
        walletModal.style.display = 'none';
        addWalletForm.reset();
        document.body.removeChild(loadingMessage);
        let successMessage = document.createElement('div');
        successMessage.style.position = 'fixed';
        successMessage.style.top = '50%';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translate(-50%, -50%)';
        successMessage.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
        successMessage.style.color = 'white';
        successMessage.style.padding = '20px';
        successMessage.style.borderRadius = '5px';
        successMessage.style.zIndex = '1000';
        successMessage.textContent = 'Carteira criada com sucesso!';
        document.body.appendChild(successMessage);
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
        
      } catch (error) {
        console.error('Erro ao criar carteira:', error);
        const loadingMsg = document.getElementById('loading-message');
        if (loadingMsg) {
          document.body.removeChild(loadingMsg);
        }
        let errorMessage = document.createElement('div');
        errorMessage.style.position = 'fixed';
        errorMessage.style.top = '50%';
        errorMessage.style.left = '50%';
        errorMessage.style.transform = 'translate(-50%, -50%)';
        errorMessage.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        errorMessage.style.color = 'white';
        errorMessage.style.padding = '20px';
        errorMessage.style.borderRadius = '5px';
        errorMessage.style.zIndex = '1000';
        errorMessage.textContent = `Erro ao criar carteira: ${error.message}`;
        document.body.appendChild(errorMessage);
        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 5000);
      }
    });
  }
  initializeWalletModal();
});