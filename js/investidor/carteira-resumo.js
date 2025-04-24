const API_URL = '191.239.116.115:8080';
  
  class WalletComponent {
      constructor(containerId) {
          this.container = document.getElementById(containerId);
          this.walletApiService = new WalletApiService();
          this.wallets = [];
      }
      
      async initialize() {
          await this.loadWallets();
          this.renderWallets();
          this.setupEventListeners();
      }
      
      async loadWallets() {
          const loadingElement = document.getElementById('loading-assets');
          
          try {
              loadingElement.innerHTML = '<p>Carregando carteiras...</p>';
              this.wallets = await this.walletApiService.getWallets();
              
              if (this.wallets.length === 0) {
                  console.log('Usuário não possui carteiras cadastradas');
              } else {
                  console.log('Carteiras carregadas:', this.wallets);
              }
          } catch (error) {
              console.error('Falha ao carregar carteiras:', error);
              loadingElement.innerHTML = '<p class="error-message">Erro ao carregar carteiras. Tente novamente mais tarde.</p>';
          }
      }
      
      renderWallets() {
          // Limpa o container
          while (this.container.firstChild && this.container.firstChild.id !== 'loading-assets') {
              this.container.removeChild(this.container.firstChild);
          }
          
          const loadingElement = document.getElementById('loading-assets');
          
          if (this.wallets.length === 0) {
              loadingElement.innerHTML = '<p>Nenhuma carteira encontrada. Adicione sua primeira carteira!</p>';
              return;
          }
          
          // Esconde o loading
          loadingElement.style.display = 'none';
          
          // Renderiza as carteiras
          this.wallets.forEach(wallet => {
              const walletElement = this.createWalletElement(wallet);
              this.container.appendChild(walletElement);
          });
      }
      
      setupEventListeners() {
          // Modal para adicionar nova carteira
          const addWalletBtn = document.getElementById('add-wallet-btn');
          const walletModal = document.getElementById('add-wallet-modal');
          const walletCloseModal = walletModal.querySelector('.close-modal');
          const addWalletForm = document.getElementById('add-wallet-form');
          
          addWalletBtn.addEventListener('click', () => {
              walletModal.style.display = 'block';
          });
          
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
              
              const walletData = {
                  nome: walletName,
                  descricao: walletDescription
              };
              
              try {
                  const loadingElement = document.getElementById('loading-assets');
                  loadingElement.style.display = 'block';
                  loadingElement.innerHTML = '<p>Criando carteira...</p>';
                  
                  const newWallet = await this.walletApiService.createWallet(walletData);
                  
                  console.log('Nova carteira criada:', newWallet);
                  
                  // Recarrega as carteiras após criar uma nova
                  await this.loadWallets();
                  this.renderWallets();
                  
                  // Configura os event listeners novamente para as novas carteiras
                  this.setupWalletEventListeners();
                  
                  walletModal.style.display = 'none';
                  addWalletForm.reset();
              } catch (error) {
                  const loadingElement = document.getElementById('loading-assets');
                  loadingElement.style.display = 'block';
                  loadingElement.innerHTML = `<p class="error-message">Erro ao criar carteira: ${error.message}</p>`;
              }
          });
          
          // Modal para adicionar ativo
          const addAssetBtn = document.getElementById('add-asset-btn');
          const assetModal = document.getElementById('add-asset-modal');
          const assetCloseModal = assetModal.querySelector('.close-modal');
          const addAssetForm = document.getElementById('add-asset-form');
          
          addAssetBtn.addEventListener('click', () => {
              assetModal.style.display = 'block';
          });
          
          assetCloseModal.addEventListener('click', () => {
              assetModal.style.display = 'none';
          });
          
          window.addEventListener('click', (event) => {
              if (event.target === assetModal) {
                  assetModal.style.display = 'none';
              }
          });
          
          addAssetForm.addEventListener('submit', (event) => {
              event.preventDefault();
              const formData = {
                  type: document.getElementById('asset-type').value,
                  symbol: document.getElementById('asset-symbol').value,
                  quantity: parseFloat(document.getElementById('asset-quantity').value),
                  price: parseFloat(document.getElementById('asset-price').value),
                  date: document.getElementById('asset-date').value,
                  rating: parseInt(document.getElementById('asset-rating').value),
                  idealPercentage: parseFloat(document.getElementById('asset-ideal-percentage').value)
              };
              
              console.log('Novo ativo adicionado:', formData);
              assetModal.style.display = 'none';
              addAssetForm.reset();
          });
          
          // Configura os listeners para expandir/colapsar carteiras
          this.setupWalletEventListeners();
      }
      
      setupWalletEventListeners() {
          // Configurar listeners para expansão de carteiras
          document.querySelectorAll('.category-header').forEach(header => {
              header.addEventListener('click', () => {
                  const category = header.closest('.asset-category');
                  const content = category.querySelector('.category-content');
                  const icon = header.querySelector('.category-expand-icon');
                  
                  document.querySelectorAll('.asset-category').forEach(cat => {
                      if (cat !== category && cat.classList.contains('expanded')) {
                          cat.classList.remove('expanded');
                          cat.querySelector('.category-content').style.display = 'none';
                          cat.querySelector('.category-expand-icon').textContent = '►';
                      }
                  });
                  
                  if (category.classList.contains('expanded')) {
                      category.classList.remove('expanded');
                      content.style.display = 'none';
                      icon.textContent = '►';
                  } else {
                      category.classList.add('expanded');
                      content.style.display = 'block';
                      icon.textContent = '▼';
                  }
              });
          });
      }
  }
  
  // Inicializar o componente da carteira
  const walletComponent = new WalletComponent('assets-table-container');
  walletComponent.initialize();z