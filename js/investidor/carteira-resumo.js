const API_URL = '191.239.116.115:8080';

document.addEventListener('DOMContentLoaded', () => {
  const evolutionPatrimonyComponent = new EvolutionPatrimonyComponent('patrimonioChart', 'patrimonyFilter');
  evolutionPatrimonyComponent.initialize();
  
  const assetsDistributionComponent = new AssetsDistributionComponent('assetsDistributionChart', 'pie-chart-legend');
  assetsDistributionComponent.initialize();
  
  class WalletApiService {
      async getWallets() {
          try {
              const response = await fetch(`http://${API_URL}/wallets`, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                  },
                  credentials: 'include'
              });
              
              const result = await response.json();
              
              if (result.error) {
                  throw new Error(result.msg || 'Erro ao buscar carteiras');
              }
              
              return result.data?.data || [];
          } catch (error) {
              console.error('Erro ao buscar carteiras:', error);
              return [];
          }
      }

      async createWallet(walletData) {
          let timeoutId;
          
          try {
              const timeoutPromise = new Promise((_, reject) => {
                  timeoutId = setTimeout(() => {
                      reject(new Error('Tempo limite excedido ao criar carteira'));
                  }, 10000);
              });
              
              const fetchPromise = fetch(`http://${API_URL}/wallets`, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                  },
                  credentials: 'include',
                  body: JSON.stringify(walletData)
              });
              
              const response = await Promise.race([fetchPromise, timeoutPromise]);
              clearTimeout(timeoutId);
              
              const result = await response.json();
              
              if (result.error) {
                  throw new Error(result.msg || 'Erro ao criar carteira');
              }
              
              return result.data.data;
          } catch (error) {
              if (timeoutId) clearTimeout(timeoutId);
              console.error('Erro ao criar carteira:', error);
              throw error;
          }
      }
  }
  
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
              loadingElement.innerHTML = `
                  <p class="error-message">Erro ao carregar carteiras: ${error.message}</p>
                  <button id="retry-loading" class="retry-btn">Tentar novamente</button>
              `;
              
              document.getElementById('retry-loading')?.addEventListener('click', () => {
                  this.loadWallets();
              });
              
              return;
          }
      }
      
      renderWallets() {
          while (this.container.firstChild && this.container.firstChild.id !== 'loading-assets') {
              this.container.removeChild(this.container.firstChild);
          }
          
          const loadingElement = document.getElementById('loading-assets');
          
          if (this.wallets.length === 0) {
              loadingElement.innerHTML = '<p>Nenhuma carteira encontrada. Adicione sua primeira carteira!</p>';
              return;
          }
          
          loadingElement.style.display = 'none';
          
          this.wallets.forEach(wallet => {
              const walletElement = this.createWalletElement(wallet);
              this.container.appendChild(walletElement);
          });
      }
      
      createWalletElement(wallet) {
          const walletElement = document.createElement('div');
          walletElement.className = 'asset-category';
          walletElement.id = `wallet-${wallet.id}`;
          
          walletElement.innerHTML = `
              <div class="category-header">
                  <span class="category-expand-icon">►</span>
                  <span class="category-name">${wallet.nome}</span>
                  <span class="category-description">${wallet.descricao || ''}</span>
              </div>
              <div class="category-content" style="display: none;">
                  <div class="assets-list">
                      <p>Carregando ativos...</p>
                  </div>
              </div>
          `;
          
          return walletElement;
      }
      
      setupEventListeners() {
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
                  
                  await this.loadWallets();
                  this.renderWallets();
                  
                  this.setupWalletEventListeners();
                  
                  walletModal.style.display = 'none';
                  addWalletForm.reset();
              } catch (error) {
                  const loadingElement = document.getElementById('loading-assets');
                  loadingElement.style.display = 'block';
                  loadingElement.innerHTML = `<p class="error-message">Erro ao criar carteira: ${error.message}</p>`;
              }
          });
          
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
          
          this.setupWalletEventListeners();
      }
      
      setupWalletEventListeners() {
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
  
  const walletComponent = new WalletComponent('assets-table-container');
  walletComponent.initialize();
});