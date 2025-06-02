document.addEventListener("DOMContentLoaded", function () {
  // CONFIGURAÇÃO DOS ELEMENTOS DOM
  const elements = {
    portfolioHeader: document.querySelector(".assets-header h2"),
    assetsTableContainer: document.getElementById("assets-table-container"),
    loadingMessage: document.getElementById("loading-assets"),
    portfolioNameElement: document.querySelector(".portfolio-selector span"),
    walletNameInput: document.getElementById("wallet-name"),
    walletDescInput: document.getElementById("wallet-description"),
    pieChartLegend: document.getElementById("pie-chart-legend"),
    balanceElement: document.getElementById("portfolio-balance"),
    returnElement: document.getElementById("portfolio-return"),
    addAssetForm: document.getElementById("addAssetForm"),
    assetDropdown: document.getElementById("assetDropdown"),
    addAssetButton: document.getElementById("headerAddAssetBtn"),
  };

  // INICIALIZAÇÃO DO PORTFOLIO MANAGER
  if (typeof PortfolioManager !== "undefined") {
    PortfolioManager.setElements(elements);
  }

  // INICIALIZAÇÃO DO CHART MANAGER
  if (typeof ChartManager !== "undefined") {
    const charts = new ChartManager();
    charts.initialize();
    window.chartsManagerInstance = charts;

    if (typeof PortfolioManager !== "undefined") {
      PortfolioManager.setCharts(charts);
    }
  }

  // CARREGAMENTO INICIAL DO PORTFOLIO
  if (typeof PortfolioManager !== "undefined") {
    PortfolioManager.loadPortfolio();
  }

  // INICIALIZAÇÃO DOS MODAIS
  initializeModals();

  // EVENT LISTENERS PARA BOTÕES
  if (elements.addAssetButton) {
    elements.addAssetButton.addEventListener("click", () => {
      if (typeof AssetManager !== "undefined") {
        AssetManager.loadAssetsDropdown();
      }
    });
  }

  if (elements.addAssetForm) {
    elements.addAssetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof AssetManager !== "undefined") {
        AssetManager.addAsset(e);
      }
    });
  }

  // LISTENER PARA MUDANÇAS NO PORTFOLIO
  document.addEventListener("portfolioChanged", function (e) {
    if (e.detail?.portfolio && typeof PortfolioManager !== "undefined") {
      PortfolioManager.updatePortfolioUI(e.detail.portfolio);
    }
  });

  // LISTENERS PARA EDIÇÃO E EXCLUSÃO DE ATIVOS
  document.addEventListener("click", function (e) {
    const target = e.target.classList.contains("edit-asset")
      ? e.target
      : e.target.parentElement?.classList.contains("edit-asset")
      ? e.target.parentElement
      : null;

    if (target) {
      const assetId = target.dataset.assetId;
      if (typeof AssetManager !== "undefined") {
        AssetManager.openEditAssetModal(assetId);
      }
      return;
    }

    const deleteTarget = e.target.classList.contains("delete-asset")
      ? e.target
      : e.target.parentElement?.classList.contains("delete-asset")
      ? e.target.parentElement
      : null;

    if (deleteTarget) {
      const assetId = deleteTarget.dataset.assetId;
      if (confirm("Tem certeza que deseja remover este ativo da carteira?")) {
        if (typeof AssetManager !== "undefined") {
          AssetManager.deleteAsset(assetId);
        }
      }
    }
  });
});

// FUNÇÃO DE INICIALIZAÇÃO DOS MODAIS
function initializeModals() {
  if (typeof createModal === "function") {
    const addModal = createModal("addAssetModal");
    addModal.initialize("headerAddAssetBtn");

    const editModal = createModal("editAssetModal");
    editModal.initialize();
  }

  const trigger = document.getElementById("headerAddAssetBtn");
  if (trigger) {
    trigger.addEventListener("click", () => {
      setTimeout(() => {
        if (typeof AssetManager !== "undefined") {
          AssetManager.loadAssetsDropdown();
        }
      }, 100);
    });
  }

  const editForm = document.getElementById("editAssetForm");
  if (editForm) {
    editForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof AssetManager !== "undefined") {
        AssetManager.updateAsset(e);
      }
    });
  }
}
