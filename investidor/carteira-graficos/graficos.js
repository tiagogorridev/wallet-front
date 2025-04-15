document.addEventListener('DOMContentLoaded', function() {
  const headerContainer = document.getElementById('header');
  if (headerContainer) {
    fetch('/investidor/header/header.html')
      .then(response => response.text())
      .then(data => {
        headerContainer.innerHTML = data;
        const headerStyle = document.createElement('link');
        headerStyle.rel = 'stylesheet';
        headerStyle.href = '/investidor/header/header.css';
        document.head.appendChild(headerStyle);
      })
      .catch(error => console.error('Erro ao carregar o header:', error));
  }

  const assetDistributionData = [
    { class: 'crypto', label: 'Criptomoedas', percentage: 50 },
    { class: 'fixed-income', label: 'Renda Fixa', percentage: 50 }
  ];

  const categoryDistributionData = [
    { class: 'stocks', label: 'Ações', percentage: 30 },
    { class: 'crypto', label: 'Criptomoedas', percentage: 40 },
    { class: 'fixed-income', label: 'Renda Fixa', percentage: 30 }
  ];

  const fullPerformanceData = [
    {
      periodo: 'Janeiro 2024',
      rentabilidade: '+2.3%',
      cdi: '+0.8%',
      ibovespa: '+1.5%',
      sp500: '+2.1%',
      bitcoin: '+5.2%'
    },
    {
      periodo: 'Fevereiro 2024',
      rentabilidade: '+1.7%',
      cdi: '+0.6%',
      ibovespa: '+1.8%',
      sp500: '+1.9%',
      bitcoin: '+4.5%'
    },
    {
      periodo: 'Janeiro 2025',
      rentabilidade: '+1.5%',
      cdi: '+0.7%',
      ibovespa: '+0.9%',
      sp500: '+1.8%',
      bitcoin: '+6.2%'
    },
    {
      periodo: 'Fevereiro 2025',
      rentabilidade: '-1.2%',
      cdi: '+0.7%',
      ibovespa: '-2.1%',
      sp500: '-1.5%',
      bitcoin: '-3.8%'
    },
    {
      periodo: 'Março 2025',
      rentabilidade: '+1.8%',
      cdi: '+0.8%',
      ibovespa: '+1.2%',
      sp500: '+1.7%',
      bitcoin: '+7.4%'
    }
  ];

  const patrimonyComponent = new EvolutionPatrimonyComponent('patrimonyEvolutionChart', 'patrimonyFilter');
  patrimonyComponent.initialize();

  const assetsDistributionComponent = new AssetsDistributionComponent('assetsDistributionChart', 'assetsDistributionLegend', assetDistributionData);
  assetsDistributionComponent.initialize();

  const categoryDistributionComponent = new AssetsDistributionComponent('categoryDistributionChart', 'categoryDistributionLegend', categoryDistributionData);
  categoryDistributionComponent.initialize();

  const assetsComponent = new AssetsComponent('assetCategoriesContainer', 'addAssetModal');
  assetsComponent.initialize();

  const annualReturnChart = new AnnualReturnChartComponent('annualReturnChart');
  annualReturnChart.initialize();

  const performanceTable = new PerformanceTableComponent('performanceTable', 'performanceFilter', fullPerformanceData);
  performanceTable.initialize();
});
