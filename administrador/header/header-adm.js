document.addEventListener('DOMContentLoaded', function() {
  const headerContainer = document.getElementById('admin-header');

  if (headerContainer) {
    fetch('../header/header-adm.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar o header: ' + response.status);
        }
        return response.text();
      })
      .then(data => {
        headerContainer.innerHTML = data;
        initializeHeader();
      })
      .catch(error => {
        fetch('../header/header.html')
          .then(response => {
            if (!response.ok) {
              throw new Error('Erro ao carregar o header (caminho alternativo): ' + response.status);
            }
            return response.text();
          })
          .then(data => {
            headerContainer.innerHTML = data;
            initializeHeader();
          })
          .catch(err => console.error('Erro ao carregar o header (caminho alternativo):', err));
      });
  } else {
    initializeHeader();
  }

  function initializeHeader() {
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        localStorage.clear();
        window.location.href = '../../pages/login/login.html';
      });
    }

    const addAssetButton = document.getElementById('headerAddAssetBtn');
    if (addAssetButton) {
      addAssetButton.addEventListener('click', function() {
        const modal = document.getElementById('addAssetModal');
        if (modal) {
          modal.style.display = 'flex';
        } else {
          const event = new CustomEvent('openAddAssetModal');
          document.dispatchEvent(event);
        }
      });
    }

    markActivePage();
    updateInvestmentSummary();
    initializePortfolioDropdown();
  }

  function markActivePage() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    let itemAtivado = false;

    navItems.forEach(function(item) {
      const href = item.getAttribute('href') || '';
      item.classList.remove('active');

      const hrefParts = href.split('/');
      const hrefPage = hrefParts[hrefParts.length - 1];
      const hrefDir = hrefParts[hrefParts.length - 2];

      const pathParts = currentPath.split('/');
      const currentPage = pathParts[pathParts.length - 1];
      const currentDir = pathParts[pathParts.length - 2];

      if (currentPath.includes(href) || currentPage.includes(hrefPage) || currentDir.includes(hrefDir)) {
        item.classList.add('active');
        itemAtivado = true;
      }
    });

    if (!itemAtivado && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
      const dashboardItem = document.querySelector('.nav-item:first-child');
      if (dashboardItem) {
        dashboardItem.classList.add('active');
      }
    }

    navItems.forEach(function(item) {
      item.removeEventListener('click', navClickHandler);
      item.addEventListener('click', navClickHandler);
    });
  }

  function navClickHandler() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(navItem) {
      navItem.classList.remove('active');
    });
    this.classList.add('active');
  }

  function updateInvestmentSummary() {
    const patrimonioTotal = document.querySelector('.summary-value:nth-of-type(1)');
    const rentabilidade = document.querySelector('.summary-value:nth-of-type(2)');
    const mesAtual = document.querySelector('.summary-value:nth-of-type(3)');

    if (patrimonioTotal && rentabilidade && mesAtual) {
      if (localStorage.getItem('patrimonioTotal')) {
        patrimonioTotal.textContent = localStorage.getItem('patrimonioTotal');
      }

      if (localStorage.getItem('rentabilidade')) {
        const rentabilidadeValor = parseFloat(localStorage.getItem('rentabilidade'));
        rentabilidade.textContent = (rentabilidadeValor >= 0 ? '+' : '') + rentabilidadeValor + '%';
        rentabilidade.className = 'summary-value ' + (rentabilidadeValor >= 0 ? 'positive' : 'negative');
      }

      if (localStorage.getItem('mesAtual')) {
        const mesAtualValor = parseFloat(localStorage.getItem('mesAtual'));
        mesAtual.textContent = (mesAtualValor >= 0 ? '+' : '') + mesAtualValor + '%';
        mesAtual.className = 'summary-value ' + (mesAtualValor >= 0 ? 'positive' : 'negative');
      }
    }
  }

  function initializePortfolioDropdown() {
    const portfolioSelector = document.querySelector('.portfolio-selector');

    if (!portfolioSelector) {
      return;
    }

    if (portfolioSelector.querySelector('.portfolio-dropdown')) {
      return;
    }

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

      const currentPortfolioName = portfolioSelector.querySelector('span') ?
          portfolioSelector.querySelector('span').textContent : 'Carteira Principal';

      option.innerHTML = `
        <span>${portfolio.name}</span>
        <i class="fas fa-check ${currentPortfolioName === portfolio.name ? 'visible' : 'hidden'}"></i>
      `;

      option.addEventListener('click', function() {
        const portfolioNameSpan = portfolioSelector.querySelector('span');
        if (portfolioNameSpan) {
          portfolioNameSpan.textContent = portfolio.name;
        }

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

        document.querySelectorAll('.portfolio-option i').forEach(icon => {
          icon.classList.add('hidden');
          icon.classList.remove('visible');
        });

        const checkmark = option.querySelector('i');
        if (checkmark) {
          checkmark.classList.add('visible');
          checkmark.classList.remove('hidden');
        }
      });

      dropdown.appendChild(option);
    });

    const createNewOption = document.createElement('div');
    createNewOption.className = 'portfolio-option create-new';
    createNewOption.innerHTML = `
      <i class="fas fa-plus-circle"></i>
      <span>Criar Nova Carteira</span>
    `;

    createNewOption.addEventListener('click', function() {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.id = 'createPortfolioModal';
      modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>Criar Nova Carteira</h2>
            <i class="fas fa-times close-modal"></i>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="portfolioName">Nome da Carteira</label>
              <input type="text" id="portfolioName" placeholder="Digite o nome da carteira">
            </div>
            <div class="form-group">
              <label for="portfolioType">Tipo de Carteira</label>
              <select id="portfolioType">
                <option value="geral">Geral</option>
                <option value="acoes">Ações</option>
                <option value="fiis">FIIs</option>
                <option value="internacional">Internacional</option>
                <option value="cripto">Criptomoedas</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-cancel">Cancelar</button>
            <button class="modal-confirm">Criar Carteira</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);

      const closeModal = function() {
        modal.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(modal);
        }, 300);
      };

      modal.querySelector('.close-modal').addEventListener('click', closeModal);
      modal.querySelector('.modal-cancel').addEventListener('click', closeModal);

      modal.querySelector('.modal-confirm').addEventListener('click', function() {
        const nameInput = document.getElementById('portfolioName');
        const typeSelect = document.getElementById('portfolioType');

        if (!nameInput || !typeSelect) {
          return;
        }

        const name = nameInput.value.trim();
        const type = typeSelect.value;

        if (name) {
          const newPortfolio = {
            id: portfolios.length > 0 ? Math.max(...portfolios.map(p => p.id)) + 1 : 1,
            name: name,
            type: type,
            createdAt: new Date().toISOString()
          };

          portfolios.push(newPortfolio);
          localStorage.setItem('userPortfolios', JSON.stringify(portfolios));

          document.dispatchEvent(new CustomEvent('portfolioCreated', {
            detail: { portfolio: newPortfolio }
          }));

          closeModal();
        }
      });
    });

    dropdown.appendChild(createNewOption);
    portfolioSelector.appendChild(dropdown);

    const icon = portfolioSelector.querySelector('i');
    if (icon) {
      icon.addEventListener('click', function() {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
      });
    }
  }
});