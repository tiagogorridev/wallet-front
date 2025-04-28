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
    handleWalletForm();
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
      const selectedWalletId = localStorage.getItem('selectedWalletId');
      
      let selectedCarteira = null;
      if (selectedWalletId) {
        const numericId = parseInt(selectedWalletId);
        selectedCarteira = carteiras.find(c => c.id === numericId);
      }
      
      if (!selectedCarteira && carteiras.length > 0) {
        selectedCarteira = carteiras[0];
        localStorage.setItem('selectedPortfolio', selectedCarteira.nome);
        localStorage.setItem('selectedWalletId', selectedCarteira.id.toString());
      }
      
      const selectedPortfolioName = selectedCarteira ? selectedCarteira.nome : 'Carteira não encontrada';
      if (nameSpan) {
        nameSpan.textContent = selectedPortfolioName;
      }
      
      carteiras.forEach(carteira => {
        const option = document.createElement('div');
        option.className = 'portfolio-option';
        
        const isSelected = selectedCarteira && carteira.id === selectedCarteira.id;
        
        option.innerHTML = `
          <span>${carteira.nome}</span>
          <i class="fas fa-check ${isSelected ? 'visible' : 'hidden'}"></i>
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
          localStorage.setItem('selectedWalletId', carteira.id.toString());
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
      
      if (selectedCarteira) {
        document.dispatchEvent(new CustomEvent('portfolioChanged', {
          detail: { portfolio: selectedCarteira }
        }));
      }
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

  function handleWalletForm() {
    const addWalletForm = document.getElementById('add-wallet-form');
    const walletModal = document.getElementById('add-wallet-modal');
    const closeModal = walletModal?.querySelector('.close-modal');
    
    if (!walletModal) {
      console.error('Modal de carteira não encontrado');
      return;
    }
    
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        walletModal.style.display = 'none';
      });
    }
    
    if (addWalletForm) {
      addWalletForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário enviado');
        
        const walletName = document.getElementById('wallet-name').value;
        const walletDescription = document.getElementById('wallet-description').value;
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          alert('Você precisa estar logado para criar uma carteira');
          return;
        }
        
        console.log('Enviando requisição para criar carteira:', {
          nome: walletName,
          descricao: walletDescription
        });
        
        fetch(`${API_URL}/wallets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome: walletName,
            descricao: walletDescription
          })
        })
        .then(response => {
          console.log('Resposta recebida:', response);
          if (!response.ok) {
            throw new Error('Falha ao criar carteira');
          }
          return response.json();
        })
        .then(result => {
          console.log('Resultado:', result);
          if (result.error) {
            throw new Error(result.msg || 'Erro ao criar carteira');
          }
          
          alert('Carteira criada com sucesso!');
          walletModal.style.display = 'none';
          
          document.getElementById('wallet-name').value = '';
          document.getElementById('wallet-description').value = '';
          
          initializePortfolioDropdown();
        })
        .catch(error => {
          console.error('Erro ao criar carteira:', error);
          alert('Erro ao criar carteira: ' + error.message);
        });
      });
    } else {
      console.error('Formulário de carteira não encontrado');
    }
    
    window.addEventListener('click', function(e) {
      if (e.target === walletModal) {
        walletModal.style.display = 'none';
      }
    });
  }

  document.addEventListener('openWalletModal', function() {
    console.log('Modal de carteira não encontrado na página atual');
  });
});