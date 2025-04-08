document.addEventListener('DOMContentLoaded', function() {
  const headerContainer = document.getElementById('header');

  if (headerContainer) {
    // Carrega o conteúdo do header via fetch
    fetch('../../header/header.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao carregar o header: ' + response.status);
        }
        return response.text();
      })
      .then(data => {
        // Insere o HTML do header
        headerContainer.innerHTML = data;

        // Inicializa funcionalidades específicas do header
        initializeHeader();
      })
      .catch(error => {
        console.error('Erro ao carregar o header:', error);
        // Tenta um caminho alternativo caso o primeiro falhe
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
    // Se o container não for encontrado, inicializa o header diretamente
    initializeHeader();
  }

  // Função para inicializar o header
  function initializeHeader() {
    // Inicializar o botão de adicionar ativo no header
    const addAssetButton = document.getElementById('headerAddAssetBtn');
    if (addAssetButton) {
      addAssetButton.addEventListener('click', function() {
        // Tenta encontrar o modal na página
        const modal = document.getElementById('addAssetModal');
        if (modal) {
          modal.style.display = 'flex';
        } else {
          // Emite um evento personalizado que a página pode escutar
          const event = new CustomEvent('openAddAssetModal');
          document.dispatchEvent(event);
        }
      });
    }

    // Marca a página atual como ativa no menu
    markActivePage();

    // Atualiza os valores do patrimônio dinamicamente
    updateInvestmentSummary();
  }

  // Função para marcar a página atual como ativa
  function markActivePage() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      // Remove qualquer classe ativa existente
      item.classList.remove('active');

      // Verifica se o href do link corresponde à rota atual
      if (currentPath.includes(item.getAttribute('href'))) {
        item.classList.add('active');
      } else if (item.getAttribute('href').includes('resumo') &&
                (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
        // Marca a página de resumo como ativa se estiver na raiz
        item.classList.add('active');
      }
    });
  }

  // Função para atualizar os valores do resumo de investimentos
  function updateInvestmentSummary() {
    const patrimonioTotal = document.querySelector('.summary-value:nth-of-type(1)');
    const rentabilidade = document.querySelector('.summary-value:nth-of-type(2)');
    const mesAtual = document.querySelector('.summary-value:nth-of-type(3)');

    if (patrimonioTotal && rentabilidade && mesAtual) {
      // Aqui você pode implementar a lógica para buscar os valores reais
      // Por enquanto, são valores estáticos

      // Exemplo de atualização baseada em dados armazenados
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

  // portfolio

// Adicione este código ao seu header.js ou substitua a parte existente
// Adicione logs para depuração

// Função para inicializar o dropdown da carteira
function initializePortfolioDropdown() {
  console.log("Inicializando dropdown de carteira...");

  const portfolioSelector = document.querySelector('.portfolio-selector');
  console.log("Elemento seletor de carteira encontrado:", portfolioSelector);

  if (!portfolioSelector) {
    console.error("Elemento .portfolio-selector não encontrado!");
    return;
  }

  // Verifique se o dropdown já existe (para evitar duplicação)
  if (portfolioSelector.querySelector('.portfolio-dropdown')) {
    console.log("Dropdown já inicializado, pulando...");
    return;
  }

  // Create dropdown element
  const dropdown = document.createElement('div');
  dropdown.className = 'portfolio-dropdown';
  dropdown.style.display = 'none';
  console.log("Dropdown criado");

  // Get sample portfolios from localStorage or use defaults
  const portfolios = JSON.parse(localStorage.getItem('userPortfolios')) || [
    { id: 1, name: 'Carteira Principal' },
    { id: 2, name: 'Carteira de Viagem' },
    { id: 3, name: 'Carteira Aposentadoria' }
  ];
  console.log("Carteiras carregadas:", portfolios);

  // Populate dropdown with portfolio options
  portfolios.forEach(portfolio => {
    const option = document.createElement('div');
    option.className = 'portfolio-option';

    // Verifica se o span existe antes de acessá-lo
    const currentPortfolioName = portfolioSelector.querySelector('span') ?
        portfolioSelector.querySelector('span').textContent : 'Carteira Principal';

    option.innerHTML = `
      <span>${portfolio.name}</span>
      <i class="fas fa-check ${currentPortfolioName === portfolio.name ? 'visible' : 'hidden'}"></i>
    `;

    option.addEventListener('click', function() {
      console.log("Opção de carteira clicada:", portfolio.name);

      // Verifica se o span existe antes de modificá-lo
      const portfolioNameSpan = portfolioSelector.querySelector('span');
      if (portfolioNameSpan) {
        portfolioNameSpan.textContent = portfolio.name;
      }

      // Hide dropdown
      dropdown.style.display = 'none';

      // Toggle arrow icon
      const icon = portfolioSelector.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }

      // Save selected portfolio to localStorage
      localStorage.setItem('selectedPortfolio', portfolio.name);

      // Broadcast event for other components to update
      document.dispatchEvent(new CustomEvent('portfolioChanged', {
        detail: { portfolio: portfolio }
      }));

      // Update check marks
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

  // Add "Create New Portfolio" option
  const createNewOption = document.createElement('div');
  createNewOption.className = 'portfolio-option create-new';
  createNewOption.innerHTML = `
    <i class="fas fa-plus-circle"></i>
    <span>Criar Nova Carteira</span>
  `;

  createNewOption.addEventListener('click', function() {
    console.log("Opção de criar nova carteira clicada");

    // Show modal for creating new portfolio
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
    console.log("Modal criado e adicionado ao DOM");

    // Show modal with animation
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);

    // Close modal function
    const closeModal = function() {
      modal.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    };

    // Add event listeners for modal actions
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);

    modal.querySelector('.modal-confirm').addEventListener('click', function() {
      const nameInput = document.getElementById('portfolioName');
      const typeSelect = document.getElementById('portfolioType');

      if (!nameInput || !typeSelect) {
        console.error("Elementos do formulário não encontrados!");
        return;
      }

      const name = nameInput.value.trim();
      const type = typeSelect.value;

      console.log("Tentando criar carteira:", { name, type });

      if (name) {
        // Create new portfolio
        const newPortfolio = {
          id: portfolios.length > 0 ? Math.max(...portfolios.map(p => p.id)) + 1 : 1,
          name: name,
          type: type,
          createdAt: new Date().toISOString()
        };

        // Add to portfolios array
        portfolios.push(newPortfolio);

        // Save to localStorage
        localStorage.setItem('userPortfolios', JSON.stringify(portfolios));
        console.log("Nova carteira salva:", newPortfolio);

        // Broadcast event
        document.dispatchEvent(new CustomEvent('portfolioCreated', {
          detail: { portfolio: newPortfolio }
        }));

        // Close modal
        closeModal();

        // Refresh dropdown
        location.reload();
      }
    });

    // Hide dropdown
    dropdown.style.display = 'none';
    const icon = portfolioSelector.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  });

  dropdown.appendChild(createNewOption);

  // Append dropdown to the header
  portfolioSelector.appendChild(dropdown);
  console.log("Dropdown adicionado ao seletor de carteira");

  // Toggle dropdown on click
  portfolioSelector.addEventListener('click', function(e) {
    console.log("Clique no seletor de carteira detectado");

    if (e.target.closest('.portfolio-option')) {
      console.log("Clique dentro de uma opção, pulando toggle");
      return;
    }

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    console.log("Alternou visibilidade do dropdown:", dropdown.style.display);

    // Toggle arrow icon
    const icon = portfolioSelector.querySelector('i');
    if (icon) {
      if (isVisible) {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      } else {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      }
    }
  });

  // Close dropdown when clicking outside
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

// Modificar sua função initializeHeader para incluir a inicialização do dropdown
function initializeHeader() {
  console.log("Inicializando cabeçalho...");

  // Inicializar o botão de adicionar ativo no header
  const addAssetButton = document.getElementById('headerAddAssetBtn');
  if (addAssetButton) {
    addAssetButton.addEventListener('click', function() {
      // Tenta encontrar o modal na página
      const modal = document.getElementById('addAssetModal');
      if (modal) {
        modal.style.display = 'flex';
      } else {
        // Emite um evento personalizado que a página pode escutar
        const event = new CustomEvent('openAddAssetModal');
        document.dispatchEvent(event);
      }
    });
  }

  // Marca a página atual como ativa no menu
  markActivePage();

  // Atualiza os valores do patrimônio dinamicamente
  updateInvestmentSummary();

  // Inicializa o dropdown de carteira
  initializePortfolioDropdown();
}

// Se você já estiver chamando initializeHeader em outro lugar do código,
// não precisa do bloco abaixo
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM totalmente carregado");
  const headerContainer = document.getElementById('header');

  if (!headerContainer) {
    console.log("Container de header não encontrado, inicializando diretamente");
    initializeHeader();
  }
  // O resto da lógica para carregar o header via fetch está mantido no seu código original
});

});
