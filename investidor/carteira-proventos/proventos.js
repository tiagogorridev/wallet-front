document.addEventListener('DOMContentLoaded', function() {
  const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const yearlyData = {
    2024: {
      totalReceived: 1195.50,
      monthlyAverage: 207.30,
      yield: 3.8,
      annualProjection: 2334.60,
      monthlyData: [
        { month: 'Jan', value: 125.40 },
        { month: 'Fev', value: 145.20 },
        { month: 'Mar', value: 285.75 },
        { month: 'Abr', value: 95.30 },
        { month: 'Mai', value: 125.80 },
        { month: 'Jun', value: 175.40 },
        { month: 'Jul', value: 165.20 },
        { month: 'Ago', value: 210.80 },
        { month: 'Set', value: 115.60 },
        { month: 'Out', value: 180.50 },
        { month: 'Nov', value: 230.20 },
        { month: 'Dez', value: 290.10 }
      ]
    },
    2025: {
      totalReceived: 1345.25,
      monthlyAverage: 224.20,
      yield: 4.3,
      annualProjection: 2690.50,
      monthlyData: [
        { month: 'Jan', value: 225.20 },
        { month: 'Fev', value: 165.20 },
        { month: 'Mar', value: 320.75 },
        { month: 'Abr', value: 95.30 },
        { month: 'Mai', value: 125.80 },
        { month: 'Jun', value: 175.40 },
        { month: 'Jul', value: 165.20 },
        { month: 'Ago', value: 220.80 },
        { month: 'Set', value: 115.60 },
        { month: 'Out', value: 190.50 },
        { month: 'Nov', value: 240.20 },
        { month: 'Dez', value: 300.10 }
      ]
    },
    2026: {
      totalReceived: 1495.80,
      monthlyAverage: 248.30,
      yield: 4.8,
      annualProjection: 2991.60,
      monthlyData: [
        { month: 'Jan', value: 5.40 },
        { month: 'Fev', value: 185.60 },
        { month: 'Mar', value: 350.75 },
        { month: 'Abr', value: 110.30 },
        { month: 'Mai', value: 145.80 },
        { month: 'Jun', value: 195.40 },
        { month: 'Jul', value: 185.20 },
        { month: 'Ago', value: 240.80 },
        { month: 'Set', value: 135.60 },
        { month: 'Out', value: 210.50 },
        { month: 'Nov', value: 260.20 },
        { month: 'Dez', value: 320.10 }
      ]
    }
  };

  const incomeData = [
    {
      date: '20/03/2025',
      asset: 'PETR4',
      incomeType: 'Dividendo',
      quantity: 50,
      valuePerShare: 2.35,
      totalValue: 117.50,
      yield: 2.8
    },
    {
      date: '15/03/2025',
      asset: 'VALE3',
      incomeType: 'Dividendo',
      quantity: 30,
      valuePerShare: 1.85,
      totalValue: 55.50,
      yield: 2.8
    },
    {
      date: '10/03/2025',
      asset: 'Tesouro IPCA+',
      incomeType: 'Juros',
      quantity: 1,
      valuePerShare: 78.25,
      totalValue: 78.25,
      yield: 2.8
    },
    {
      date: '05/03/2025',
      asset: 'ITUB4',
      incomeType: 'Dividendo',
      quantity: 45,
      valuePerShare: 0.95,
      totalValue: 42.75,
      yield: 2.8
    },
    {
      date: '01/03/2025',
      asset: 'CDB Banco XYZ',
      incomeType: 'Juros',
      quantity: 1,
      valuePerShare: 55.80,
      totalValue: 55.80,
      yield: 2.8
    }
  ];

  let chartInstance = null;
  let selectedYear = new Date().getFullYear();
  let selectedPeriodo = '12 MESES';
  let selectedDetalhePeriodo = '12 MESES';
  let selectedDetalheTipo = 'TODOS';
  let filteredIncomeData = [...incomeData];
  let monthlyData = [];

  initializeApp();

  function initializeApp() {
    createPatrimonioChart(12);
    updateIncomeSummaryCards();
    updateMonthlyBars();
    renderIncomeTable(filteredIncomeData);
    setupEventListeners();
  }

  function setupEventListeners() {
    const periodFilters = document.querySelectorAll('.filtro-data .option');
    periodFilters.forEach(filter => {
      filter.addEventListener('click', function() {
        const periodo = this.textContent;
        selectedPeriodo = periodo;
        updatePeriodFilter('.chart-section .filtro-data', periodo);

        const monthMap = {
          '3 MESES': 3,
          '6 MESES': 6,
          '12 MESES': 12,
          '24 MESES': 24
        };
        const months = monthMap[periodo] || 12;
        updatePatrimonioChart(months);
      });
    });

    document.querySelector('.year-nav.prev').addEventListener('click', navigatePrevYear);
    document.querySelector('.year-nav.next').addEventListener('click', navigateNextYear);

    const detailsPeriodFilters = document.querySelectorAll('.income-details-section .filtro-data .option');
    detailsPeriodFilters.forEach(filter => {
      filter.addEventListener('click', function() {
        const periodo = this.textContent;
        selectedDetalhePeriodo = periodo;
        updatePeriodFilter('.income-details-section .filtro-data', periodo);
        filterIncomeData();
      });
    });

    const assetTypeFilters = document.querySelectorAll('.filtro-tipos-ativo .option');
    assetTypeFilters.forEach(filter => {
      filter.addEventListener('click', function() {
        const tipo = this.textContent;
        selectedDetalheTipo = tipo;
        updatePeriodFilter('.filtro-tipos-ativo', tipo);
        filterIncomeData();
      });
    });

    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(btn => {
      btn.addEventListener('click', function() {
      });
    });

    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach(page => {
      page.addEventListener('click', function() {
        document.querySelectorAll('.page-number').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
      });
    });
  }

  function updatePeriodFilter(selectorPath, selectedOption) {
    const filterElement = document.querySelector(`${selectorPath} .selected-option`);
    if (filterElement) {
      filterElement.textContent = selectedOption;
    }
  }

  function navigatePrevYear() {
    const availableYears = Object.keys(yearlyData).map(Number);
    const currentIndex = availableYears.indexOf(selectedYear);

    if (currentIndex > 0) {
      selectedYear = availableYears[currentIndex - 1];
      document.querySelector('.current-year').textContent = selectedYear;
      updateIncomeSummaryCards();
      updateMonthlyBars();
    }
  }

  function navigateNextYear() {
    const availableYears = Object.keys(yearlyData).map(Number);
    const currentIndex = availableYears.indexOf(selectedYear);

    if (currentIndex < availableYears.length - 1) {
      selectedYear = availableYears[currentIndex + 1];
      document.querySelector('.current-year').textContent = selectedYear;
      updateIncomeSummaryCards();
      updateMonthlyBars();
    }
  }

  function isFutureMonth(monthIndex) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return (selectedYear > currentYear) ||
           (selectedYear === currentYear && monthIndex > currentMonth);
  }

  function getBarHeight(value) {
    const maxValue = Math.max(...yearlyData[selectedYear].monthlyData.map(m => m.value));
    return (value / maxValue) * 100;
  }

  function getComparisonClass(currentValue, prevValue) {
    if (!prevValue) return 'neutral';
    return currentValue >= prevValue ? 'positive' : 'negative';
  }

  function calculatePercentageChange(oldValue, newValue) {
    if (!oldValue || oldValue === 0) return '+0%';
    const change = ((newValue - oldValue) / oldValue) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  function updateIncomeSummaryCards() {
    const currentYearData = yearlyData[selectedYear];
    const prevYearData = yearlyData[selectedYear - 1] || { totalReceived: 0, monthlyAverage: 0, yield: 0, annualProjection: 0 };

    document.querySelector('.summary-card:nth-child(1) .card-value').textContent =
      `R$ ${currentYearData.totalReceived.toFixed(2)}`;

    const totalComparisonElem = document.querySelector('.summary-card:nth-child(1) .card-comparison');
    totalComparisonElem.textContent =
      calculatePercentageChange(prevYearData.totalReceived, currentYearData.totalReceived);
    totalComparisonElem.className =
      `card-comparison ${getComparisonClass(currentYearData.totalReceived, prevYearData.totalReceived)}`;

    document.querySelector('.summary-card:nth-child(2) .card-value').textContent =
      `R$ ${currentYearData.monthlyAverage.toFixed(2)}`;

    const avgComparisonElem = document.querySelector('.summary-card:nth-child(2) .card-comparison');
    avgComparisonElem.textContent =
      calculatePercentageChange(prevYearData.monthlyAverage, currentYearData.monthlyAverage);
    avgComparisonElem.className =
      `card-comparison ${getComparisonClass(currentYearData.monthlyAverage, prevYearData.monthlyAverage)}`;

    document.querySelector('.summary-card:nth-child(3) .card-value').textContent =
      `${currentYearData.yield.toFixed(1)}%`;

    const yieldComparisonElem = document.querySelector('.summary-card:nth-child(3) .card-comparison');
    yieldComparisonElem.textContent =
      calculatePercentageChange(prevYearData.yield, currentYearData.yield);
    yieldComparisonElem.className =
      `card-comparison ${getComparisonClass(currentYearData.yield, prevYearData.yield)}`;

    document.querySelector('.summary-card:nth-child(4) .card-value').textContent =
      `R$ ${currentYearData.annualProjection.toFixed(2)}`;

    const projComparisonElem = document.querySelector('.summary-card:nth-child(4) .card-comparison');
    projComparisonElem.textContent =
      calculatePercentageChange(prevYearData.annualProjection, currentYearData.annualProjection);
    projComparisonElem.className =
      `card-comparison ${getComparisonClass(currentYearData.annualProjection, prevYearData.annualProjection)}`;
  }

  function updateMonthlyBars() {
    monthlyData = [...yearlyData[selectedYear].monthlyData];

    const barsContainer = document.querySelector('.monthly-distribution-bars');
    barsContainer.innerHTML = '';

    monthlyData.forEach((monthData, i) => {
      const future = isFutureMonth(i);
      const height = getBarHeight(monthData.value);

      const monthBar = document.createElement('div');
      monthBar.className = `month-bar ${future ? 'future' : ''}`;

      monthBar.innerHTML = `
        <div class="bar-container">
          <div class="bar-value ${future ? 'future-bar' : ''}" style="height: ${height}%;"></div>
        </div>
        <div class="month-value">R$ ${monthData.value.toFixed(2)}</div>
        <div class="month-name">${monthData.month} / ${selectedYear}</div>
      `;

      barsContainer.appendChild(monthBar);
    });
  }

  function filterIncomeData() {
    filteredIncomeData = incomeData.filter(income => {
      const incomeDate = parseDate(income.date);
      const currentDate = new Date();

      const timeRangeValid = isValidTimeRange(incomeDate, currentDate, selectedDetalhePeriodo);
      const incomeTypeValid = isValidIncomeType(income.incomeType, selectedDetalheTipo);

      return timeRangeValid && incomeTypeValid;
    });

    renderIncomeTable(filteredIncomeData);
  }

  function parseDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  function isValidTimeRange(incomeDate, currentDate, timeRangeFilter) {
    const monthsDiff = monthsDifference(incomeDate, currentDate);

    switch (timeRangeFilter) {
      case '3 MESES': return monthsDiff <= 3;
      case '6 MESES': return monthsDiff <= 6;
      case '12 MESES': return monthsDiff <= 12;
      case '24 MESES': return monthsDiff <= 24;
      default: return true;
    }
  }

  function isValidIncomeType(incomeType, incomeTypeFilter) {
    switch (incomeTypeFilter) {
      case 'TODOS': return true;
      case 'DIVIDENDOS': return incomeType === 'Dividendo';
      case 'JUROS': return incomeType === 'Juros';
      case 'ALUGUÉIS': return incomeType === 'Aluguel';
      default: return true;
    }
  }

  function monthsDifference(date1, date2) {
    return Math.abs(
      (date2.getFullYear() - date1.getFullYear()) * 12 +
      (date2.getMonth() - date1.getMonth())
    );
  }

  function renderIncomeTable(data) {
    const tableBody = document.querySelector('.income-table tbody');
    tableBody.innerHTML = '';

    data.forEach(income => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${income.date}</td>
        <td class="asset-name">
          <div class="asset-icon ${income.incomeType === 'Dividendo' ? 'stock' : 'fixed-income'}"></div>
          ${income.asset}
        </td>
        <td>
          <span class="income-type ${income.incomeType === 'Dividendo' ? 'dividend' : 'interest'}">
            ${income.incomeType}
          </span>
        </td>
        <td>${income.quantity}</td>
        <td>R$ ${income.valuePerShare.toFixed(2)}</td>
        <td>R$ ${income.totalValue.toFixed(2)}</td>
        <td>
          <span class="rendimento-value">${income.yield.toFixed(1)}</span>
          <span class="rendimento-trend positive">▲</span>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function createPatrimonioChart(monthsToShow) {
    const canvas = document.querySelector('#patrimonioChart');
    const ctx = canvas.getContext('2d');

    if (chartInstance) {
      chartInstance.destroy();
    }

    const labels = getChartLabels(monthsToShow);
    const data = getChartData(monthsToShow);

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Evolução dos Proventos',
          data: data,
          borderColor: '#FFA500',
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: getChartOptions()
    });
  }

  function updatePatrimonioChart(monthsToShow) {
    if (!chartInstance) return;

    const labels = getChartLabels(monthsToShow);
    const data = getChartData(monthsToShow);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
  }

  function getChartLabels(monthsToShow) {
    const labels = [];
    const currentDate = new Date();

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      labels.push(getMonthYearLabel(date));
    }
    return labels;
  }

  function getChartData(monthsToShow) {
    const data = [];
    const currentDate = new Date();

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const monthName = MONTHS[date.getMonth()];

      if (yearlyData[year]) {
        const monthData = yearlyData[year].monthlyData.find(m => m.month === monthName);
        data.push(monthData ? monthData.value : 0);
      } else {
        data.push(0);
      }
    }

    return data;
  }

  function getMonthYearLabel(date) {
    return `${MONTHS[date.getMonth()]} / ${date.getFullYear()}`;
  }

  function getChartOptions() {
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
              return 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
});
