const Utils = {
  // FORMATAÇÃO DE VALORES
  formatCurrency: (value) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  formatPercentage: (value) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  formatQuantity: (value) =>
    value.toLocaleString("pt-BR", {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }),

  // MAPEAMENTO DE CATEGORIAS E CLASSES
  getCategoryClass: (category) =>
    ({ CRIPTOMOEDAS: "crypto", ACOES: "stocks" }[category] || "other"),
  getCategoryLabel: (category) =>
    ({ CRIPTOMOEDAS: "Criptomoedas", ACOES: "Ações" }[category] || category),
  getTypeLabel: (type) =>
    ({ CRYPTO: "Criptomoedas", ACAO: "Ações" }[type] || type),
  mapTypeToCategoryForForm: (type) =>
    ({ CRYPTO: "CRIPTOMOEDAS", ACAO: "ACOES" }[type] || type),

  // CONVERSÃO DE CLASSE PARA CATEGORIA
  getCategoryValueFromClass(className) {
    if (className.includes("category-crypto")) return "CRIPTOMOEDAS";
    if (className.includes("category-stocks")) return "ACOES";
    return "CRIPTOMOEDAS";
  },

  // EXIBIÇÃO DE MENSAGENS DE ERRO
  showErrorMessage(element, message) {
    if (element) {
      element.innerHTML = `<p class="error-message">${message}</p>`;
      element.style.display = "block";
    }
  },
};
