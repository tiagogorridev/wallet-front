// DADOS MOCK
const mockData = {
  users: {
    total: 1250,
    new: 45,
    activationRate: 78.5,
    retentionRate: 92.3,
    growthRate: 12.5,
    newGrowth: 8.2,
    activationGrowth: 3.1,
    retentionGrowth: 1.8,
  },
  investments: {
    totalValue: 12500000,
    averagePerUser: 10000,
    newCount: 156,
    avgDiversification: 4.2,
    growthRate: 15.8,
    averageGrowth: 7.2,
    newCountGrowth: 12.5,
    diversificationGrowth: 5.3,
  },
};

// FUNÇÃO FORMATAR MOEDA
function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// FUNÇÃO ATUALIZAR VARIAÇÃO
function updateVariation(elementId, value) {
  const element = document.getElementById(elementId);
  const prefix = value >= 0 ? "+" : "";
  element.textContent = `${prefix}${value.toFixed(1)}%`;
  element.className = `variation ${value >= 0 ? "positive" : "negative"}`;
}

// INICIALIZAÇÃO GERAL
document.addEventListener("DOMContentLoaded", function () {
  initializeUserSection();
  initializeInvestmentSection();
  initializeTimeFilters();
});

// SEÇÃO USUÁRIOS
function initializeUserSection() {
  document.getElementById("total-users").textContent =
    mockData.users.total.toLocaleString("pt-BR");
  document.getElementById("new-users").textContent =
    mockData.users.new.toLocaleString("pt-BR");
  document.getElementById("activation-rate").textContent =
    mockData.users.activationRate.toFixed(1) + "%";
  document.getElementById("retention-rate").textContent =
    mockData.users.retentionRate.toFixed(1) + "%";

  updateVariation("users-variation", mockData.users.growthRate);
  updateVariation("new-users-variation", mockData.users.newGrowth);
  updateVariation("activation-variation", mockData.users.activationGrowth);
  updateVariation("retention-variation", mockData.users.retentionGrowth);
}

// SEÇÃO INVESTIMENTOS
function initializeInvestmentSection() {
  document.getElementById("total-invested").textContent = formatCurrency(
    mockData.investments.totalValue
  );
  document.getElementById("avg-investment").textContent = formatCurrency(
    mockData.investments.averagePerUser
  );
  document.getElementById("new-investments").textContent =
    mockData.investments.newCount.toLocaleString("pt-BR");
  document.getElementById("diversification").textContent =
    mockData.investments.avgDiversification.toFixed(1) + " categorias";

  updateVariation("investment-variation", mockData.investments.growthRate);
  updateVariation(
    "avg-investment-variation",
    mockData.investments.averageGrowth
  );
  updateVariation(
    "new-investments-variation",
    mockData.investments.newCountGrowth
  );
  updateVariation(
    "diversification-variation",
    mockData.investments.diversificationGrowth
  );
}

// FILTROS TEMPO
function initializeTimeFilters() {
  document
    .getElementById("user-time-filter")
    .addEventListener("change", function () {
      console.log("Período usuários:", this.value);
    });

  document
    .getElementById("investment-time-filter")
    .addEventListener("change", function () {
      console.log("Período investimentos:", this.value);
    });
}
