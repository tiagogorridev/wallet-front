/**
 * Componente de Evolução do Patrimônio
 */
class EvolutionPatrimonyComponent {
  constructor(containerId, filterContainerId = null) {
    this.containerId = containerId;
    this.filterContainerId = filterContainerId;
    this.chartInstance = null;
    this.months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  }

  initialize() {
    this.createChart();
    if (this.filterContainerId) {
      this.setupEventListeners();
    }
  }

  createChart() {
    const ctx = document.getElementById(this.containerId).getContext('2d');
    const today = new Date();
    const labels = [];
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(this.getMonthYearLabel(date));
      data.push(this.generateMonthlyValue(date));
    }

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Evolução do Patrimônio',
          data: data,
          borderColor: '#FFA500',
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: this.getLineChartOptions()
    });
  }

  getMonthYearLabel(date) {
    return `${this.months[date.getMonth()]} / ${date.getFullYear()}`;
  }

  generateMonthlyValue(date) {
    const baseValue = 10000;
    const randomVariation = Math.random() * 2000 - 1000;
    return baseValue + randomVariation;
  }

  getLineChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: '#FFFFFF',
            callback: function(value) {
              return 'R$ ' + Number(value).toLocaleString();
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#FFFFFF'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        }
      }
    };
  }

  updateChart(monthsToShow) {
    if (!this.chartInstance) return;

    const today = new Date();
    const labels = [];
    const data = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(this.getMonthYearLabel(date));
      data.push(this.generateMonthlyValue(date));
    }

    this.chartInstance.data.labels = labels;
    this.chartInstance.data.datasets[0].data = data;
    this.chartInstance.update();
  }

  setupEventListeners() {
    const filterButtons = document.querySelectorAll(`#${this.filterContainerId} .filter-option`);
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const monthsValue = button.getAttribute('data-value');
        this.updateChart(parseInt(monthsValue));
      });
    });
  }
}

/**
 * Componente de Ativos na Carteira
 */
class AssetsDistributionComponent {
  constructor(chartContainerId, legendContainerId, data = null) {
    this.chartContainerId = chartContainerId;
    this.legendContainerId = legendContainerId;
    this.chartInstance = null;

    // Dados padrão caso não seja fornecido
    this.data = data || [
      { class: 'crypto', label: 'Criptomoedas', percentage: 50 },
      { class: 'fixed-income', label: 'Renda Fixa', percentage: 50 }
    ];
  }

  initialize() {
    this.createChart();
    this.createLegend();
  }

  createChart() {
    const ctx = document.getElementById(this.chartContainerId).getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.data.map(item => item.label),
        datasets: [{
          data: this.data.map(item => item.percentage),
          backgroundColor: ['#FFA500', '#6b7280', '#22C55E', '#3b82f6', '#ec4899'],
          hoverOffset: 4
        }]
      },
      options: this.getPieChartOptions()
    });
  }

  getPieChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    };
  }

  createLegend() {
    const legendContainer = document.getElementById(this.legendContainerId);
    if (!legendContainer) return;

    legendContainer.innerHTML = '';
    this.data.forEach(item => {
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <span class="legend-color ${item.class}"></span>
        <span class="legend-label">${item.percentage}% ${item.label}</span>
      `;
      legendContainer.appendChild(legendItem);
    });
  }

  updateData(newData) {
    this.data = newData;

    // Atualizar gráfico
    this.chartInstance.data.labels = this.data.map(item => item.label);
    this.chartInstance.data.datasets[0].data = this.data.map(item => item.percentage);
    this.chartInstance.update();

    // Atualizar legenda
    this.createLegend();
  }
}

/**
 * Componente de Ativos
 *
 */
class AssetsComponent {
  constructor(containerId, modalId = null) {
    this.containerId = containerId;
    this.modalId = modalId;

    // Categorias padrão
    this.assetCategories = [
      { name: 'FIS', isExpanded: false },
      { name: 'CRIPTOMOEDAS', isExpanded: false },
      { name: 'AÇÕES', isExpanded: false },
      { name: 'RENDA FIXA', isExpanded: false }
    ];

    // Exemplo de ativos criptomoedas
    this.cryptoAssets = [
      {
        symbol: 'BTC',
        quantidade: 0.05,
        precoMedio: 78500,
        precoAtual: 80000,
        variacao: '+1.91%',
        rentabilidade: '+1.91%',
        saldo: 4000,
        variacao24h: '+2.3%',
        variacao30d: '+15.7%',
        nota: 9,
        percentCarteira: '40.00%',
        percentIdeal: '30.00%',
        comprar: 'NÃO'
      },
      {
        symbol: 'ETH',
        quantidade: 0.5,
        precoMedio: 4120,
        precoAtual: 4000,
        variacao: '-2.91%',
        rentabilidade: '-2.91%',
        saldo: 2000,
        variacao24h: '-1.2%',
        variacao30d: '+5.4%',
        nota: 8,
        percentCarteira: '20.00%',
        percentIdeal: '15.00%',
        comprar: 'SIM'
      },
      {
        symbol: 'UNI',
        quantidade: 20,
        precoMedio: 50,
        precoAtual: 45,
        variacao: '-10.00%',
        rentabilidade: '-10.00%',
        saldo: 900,
        variacao24h: '-2.50%',
        variacao30d: '-8.70%',
        nota: 7,
        percentCarteira: '9.00%',
        percentIdeal: '5.00%',
        comprar: 'NÃO'
      }
    ];
  }

  initialize() {
    this.renderAssetCategories();
    if (this.modalId) {
      this.setupModalListeners();
    }
  }

  getValueClass(value) {
    if (value.startsWith('+')) {
      return 'positive';
    } else if (value.startsWith('-')) {
      return 'negative';
    }
    return '';
  }

  renderAssetCategories() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = '';

    this.assetCategories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = `asset-category ${category.isExpanded ? 'expanded' : ''}`;

      // Criar cabeçalho da categoria
      const headerDiv = document.createElement('div');
      headerDiv.className = 'category-header';
      headerDiv.innerHTML = `
        <div class="category-expand-icon">${category.isExpanded ? '▼' : '►'}</div>
        <div class="category-name">${category.name}</div>
        <div class="category-count">
          ${category.name === 'CRIPTOMOEDAS' ? '12 ATIVOS' : '0 ATIVOS'}
        </div>
        <div class="category-value">
          VALOR TOTAL: ${category.name === 'CRIPTOMOEDAS' ? 'R$ 5.000,00' : 'R$ 0,00'}
        </div>
        <div class="category-variation">VARIAÇÃO: 0,00%</div>
        <div class="category-percentage">
          % NA CARTEIRA: ${category.name === 'CRIPTOMOEDAS' ? '50%' : '0,00%'}
          (META: ${category.name === 'CRIPTOMOEDAS' ? '30%' : '20%'})
        </div>
      `;

      // Adicionar evento para expandir/colapsar
      headerDiv.addEventListener('click', () => this.toggleCategoryExpansion(category));
      categoryDiv.appendChild(headerDiv);

      // Adicionar conteúdo da categoria se estiver expandida
      if (category.isExpanded) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'category-content';
        contentDiv.addEventListener('click', (e) => e.stopPropagation());

        if (category.name === 'CRIPTOMOEDAS') {
          const table = document.createElement('table');
          table.className = 'assets-table';
          table.innerHTML = `
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Quantidade</th>
                <th>Preço Médio</th>
                <th>Preço Atual</th>
                <th>Variação</th>
                <th>Rentabilidade</th>
                <th>Saldo</th>
                <th>Variação (24h)</th>
                <th>Variação (30d)</th>
                <th>Minha Nota</th>
                <th>% Carteira</th>
                <th>% Ideal</th>
                <th>Comprar?</th>
              </tr>
            </thead>
            <tbody>
              ${this.cryptoAssets.map(asset => `
                <tr>
                  <td class="asset-name">
                    <div class="asset-icon crypto"></div>
                    ${asset.symbol}
                  </td>
                  <td>${asset.quantidade}</td>
                  <td>R$ ${asset.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>R$ ${asset.precoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="${this.getValueClass(asset.variacao)}">${asset.variacao}</td>
                  <td class="${this.getValueClass(asset.rentabilidade)}">${asset.rentabilidade}</td>
                  <td>R$ ${asset.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="${this.getValueClass(asset.variacao24h)}">${asset.variacao24h}</td>
                  <td class="${this.getValueClass(asset.variacao30d)}">${asset.variacao30d}</td>
                  <td><div class="rating">${asset.nota}</div></td>
                  <td>${asset.percentCarteira}</td>
                  <td>${asset.percentIdeal}</td>
                  <td class="buy-status">${asset.comprar}</td>
                </tr>
              `).join('')}
            </tbody>
          `;
          contentDiv.appendChild(table);
        } else if (category.name === 'FIS') {
          const table = document.createElement('table');
          table.className = 'assets-table';
          table.innerHTML = `
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Quantidade</th>
                <th>Preço Médio</th>
                <th>Preço Atual</th>
                <th>Variação</th>
                <th>Rentabilidade</th>
                <th>Saldo</th>
                <th>Variação (24h)</th>
                <th>Variação (30d)</th>
                <th>Minha Nota</th>
                <th>% Carteira</th>
                <th>% Ideal</th>
                <th>Comprar?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="asset-name">
                  <div class="asset-icon fis"></div>
                  HGLG11
                </td>
                <td>0,00</td>
                <td>R$ 0,00</td>
                <td>R$ 0,00</td>
                <td class="negative">-0,00%</td>
                <td class="negative">-0,00%</td>
                <td>R$ 0</td>
                <td class="negative">-0,00%</td>
                <td class="negative">-0,00%</td>
                <td><div class="rating">10</div></td>
                <td>0,00%</td>
                <td>0,00%</td>
                <td class="buy-status">NÃO</td>
              </tr>
            </tbody>
          `;
          contentDiv.appendChild(table);
        } else {
          // Para outras categorias sem dados específicos
          const emptyMsg = document.createElement('div');
          emptyMsg.className = 'empty-category-message';
          emptyMsg.textContent = 'Não há ativos nesta categoria.';
          contentDiv.appendChild(emptyMsg);
        }

        categoryDiv.appendChild(contentDiv);
      }

      container.appendChild(categoryDiv);
    });
  }

  toggleCategoryExpansion(category) {
    this.assetCategories.forEach(cat => {
      if (cat !== category) {
        cat.isExpanded = false;
      }
    });
    category.isExpanded = !category.isExpanded;
    this.renderAssetCategories();
  }

  setupModalListeners() {
    const modal = document.getElementById(this.modalId);
    if (!modal) return;

    const addButtons = document.querySelectorAll('#addAssetBtn, #headerAddAssetBtn');
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.cancel-btn');

    addButtons.forEach(button => {
      button.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    });

    [closeButton, cancelButton].forEach(button => {
      if (button) {
        button.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Formulário para adicionar ativo
    const addAssetForm = modal.querySelector('#addAssetForm');
    if (addAssetForm) {
      addAssetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
          symbol: document.getElementById('assetSymbol').value,
          category: document.getElementById('assetCategory').value,
          quantity: parseFloat(document.getElementById('assetQuantity').value),
          price: parseFloat(document.getElementById('assetPrice').value),
          rating: parseInt(document.getElementById('assetRating').value),
          idealPercentage: parseFloat(document.getElementById('assetIdealPercentage').value)
        };

        console.log('Novo ativo adicionado:', formData);

        // Aqui você adicionaria a lógica para adicionar o ativo aos dados

        modal.style.display = 'none';
        addAssetForm.reset();
      });
    }
  }

  updateAssets(newAssets) {
    // Método para atualizar os ativos
    this.cryptoAssets = newAssets;
    this.renderAssetCategories();
  }
}

/**
 * Componente de Gráfico de Rentabilidade Anual
 */
class AnnualReturnChartComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.chartInstance = null;
  }

  initialize() {
    this.createChart();
  }

  createChart() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const ctx = document.getElementById(this.containerId).getContext('2d');

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [{
          label: 'Rentabilidade 2025',
          data: [2.5, -1.2, 3.8, 1.5, 2.1, -0.8, 4.2, 1.9, 2.7, 3.1, -1.5, 2.9],
          backgroundColor: '#FFA500',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#FFFFFF',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#FFFFFF'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });

    return this.chartInstance;
  }

  updateData(newData) {
    if (!this.chartInstance) return;

    this.chartInstance.data.datasets[0].data = newData;
    this.chartInstance.update();
  }
}

/**
 * Componente de Tabela de Performance
 */
class PerformanceTableComponent {
  constructor(tableId, filterId, data) {
    this.tableId = tableId;
    this.filterId = filterId;
    this.fullPerformanceData = data;
  }

  initialize() {
    this.setupTable();
    this.setupEventListeners();
  }

  getValueClass(value) {
    if (value.startsWith('+')) {
      return 'positive';
    } else if (value.startsWith('-')) {
      return 'negative';
    }
    return '';
  }

  setupTable() {
    const performanceTable = document.getElementById(this.tableId);
    if (!performanceTable) return;

    // Inicializar com 12 meses
    this.updatePerformanceTable('12 MESES');
  }

  updatePerformanceTable(timeframe) {
    const performanceTable = document.getElementById(this.tableId);
    if (!performanceTable) return;

    const monthsMap = {
      '3 MESES': 3,
      '6 MESES': 6,
      '12 MESES': 12,
      '24 MESES': 24
    };

    const monthsToShow = monthsMap[timeframe] || 12;
    const performanceTableData = this.fullPerformanceData.slice(-monthsToShow);

    const tableBody = performanceTable.querySelector('tbody');
    tableBody.innerHTML = '';

    performanceTableData.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.periodo}</td>
        <td class="${this.getValueClass(item.rentabilidade)}">${item.rentabilidade}</td>
        <td>${item.cdi}</td>
        <td class="${this.getValueClass(item.ibovespa)}">${item.ibovespa}</td>
        <td class="${this.getValueClass(item.sp500)}">${item.sp500}</td>
        <td class="${this.getValueClass(item.bitcoin)}">${item.bitcoin}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  setupEventListeners() {
    const performanceFilterButtons = document.querySelectorAll(`#${this.filterId} .filter-option`);
    performanceFilterButtons.forEach(button => {
      button.addEventListener('click', () => {
        performanceFilterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const value = button.textContent.trim();
        this.updatePerformanceTable(value);
      });
    });
  }

  updateData(newData) {
    this.fullPerformanceData = newData;

    // Re-render the table with current filter
    const activeFilter = document.querySelector(`#${this.filterId} .filter-option.active`);
    if (activeFilter) {
      this.updatePerformanceTable(activeFilter.textContent.trim());
    } else {
      this.updatePerformanceTable('12 MESES');
    }
  }
}

// Exportar os componentes para uso global
window.EvolutionPatrimonyComponent = EvolutionPatrimonyComponent;
window.AssetsDistributionComponent = AssetsDistributionComponent;
window.AssetsComponent = AssetsComponent;
window.AnnualReturnChartComponent = AnnualReturnChartComponent;
window.PerformanceTableComponent = PerformanceTableComponent;
