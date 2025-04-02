document.addEventListener('DOMContentLoaded', () => {
  // Chart references
  const patrimonioChartCanvas = document.getElementById('patrimonioChart');
  const assetsDistributionChartCanvas = document.getElementById('assetsDistributionChart');

  // Category elements
  const fiisCategory = document.getElementById('fiis-category');
  const cryptoCategory = document.getElementById('crypto-category');

  // Modal elements
  const addAssetBtn = document.getElementById('add-asset-btn');
  const modal = document.getElementById('add-asset-modal');
  const closeModal = document.querySelector('.close-modal');
  const addAssetForm = document.getElementById('add-asset-form');

  // Period selector
  const periodSelector = document.getElementById('period-selector');

  // Initialize charts
  let patrimonioChart = createPatrimonioChart(patrimonioChartCanvas, 12);
  let assetsDistributionChart = createAssetsDistributionChart(assetsDistributionChartCanvas);

  // Event Listeners
  periodSelector.addEventListener('change', () => {
    const selectedPeriod = periodSelector.value;
    updateChartByPeriod(selectedPeriod, patrimonioChart);
  });

  // Toggle category expansion
  fiisCategory.querySelector('.category-header').addEventListener('click', () => {
    toggleCategoryExpansion(fiisCategory, cryptoCategory);
  });

  cryptoCategory.querySelector('.category-header').addEventListener('click', () => {
    toggleCategoryExpansion(cryptoCategory, fiisCategory);
  });

  // Modal functionality
  addAssetBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  addAssetForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = {
      type: document.getElementById('asset-type').value,
      symbol: document.getElementById('asset-symbol').value,
      quantity: document.getElementById('asset-quantity').value,
      price: document.getElementById('asset-price').value,
      date: document.getElementById('asset-date').value,
      rating: document.getElementById('asset-rating').value,
      idealPercentage: document.getElementById('asset-ideal-percentage').value
    };

    console.log('New asset added:', formData);
    modal.style.display = 'none';
    addAssetForm.reset();
  });
});

// Function to create the patrimônio chart
function createPatrimonioChart(canvas, monthsToShow) {
  const ctx = canvas.getContext('2d');
  const today = new Date();
  const labels = [];
  const data = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(getMonthYearLabel(date));
    data.push(generateMonthlyValue(date));
  }

  return new Chart(ctx, {
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
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
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
    }
  });
}

// Function to create the assets distribution chart
function createAssetsDistributionChart(canvas) {
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Criptomoedas', 'Renda Fixa'],
      datasets: [{
        data: [50, 50],
        backgroundColor: ['#F39C12', '#6b7280'],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Update chart based on selected period
function updateChartByPeriod(periodOption, chart) {
  let monthsToShow;
  switch(periodOption) {
    case '3 MESES':
      monthsToShow = 3;
      break;
    case '6 MESES':
      monthsToShow = 6;
      break;
    case '12 MESES':
      monthsToShow = 12;
      break;
    case '24 MESES':
      monthsToShow = 24;
      break;
    default:
      monthsToShow = 12;
  }

  updatePatrimonioChart(chart, monthsToShow);
}

// Update patrimônio chart with new data
function updatePatrimonioChart(chart, monthsToShow) {
  const today = new Date();
  const labels = [];
  const data = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    labels.push(getMonthYearLabel(date));
    data.push(generateMonthlyValue(date));
  }

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

// Toggle expansion of asset categories
function toggleCategoryExpansion(categoryToToggle, otherCategory) {
  // Close other category if open
  if (otherCategory.classList.contains('expanded')) {
    otherCategory.classList.remove('expanded');
    otherCategory.querySelector('.category-expand-icon').textContent = '►';
  }

  // Toggle current category
  if (categoryToToggle.classList.contains('expanded')) {
    categoryToToggle.classList.remove('expanded');
    categoryToToggle.querySelector('.category-expand-icon').textContent = '►';
  } else {
    categoryToToggle.classList.add('expanded');
    categoryToToggle.querySelector('.category-expand-icon').textContent = '▼';
  }
}

// Helper function to get month/year label
function getMonthYearLabel(date) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[date.getMonth()]} / ${date.getFullYear()}`;
}

// Generate sample monthly value for the chart
function generateMonthlyValue(date) {
  const baseValue = 10000;
  const monthIndex = date.getMonth();
  const fluctuation = Math.sin(monthIndex) * 1000;
  return baseValue + fluctuation;
}
