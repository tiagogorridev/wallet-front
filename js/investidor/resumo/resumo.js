document.addEventListener('DOMContentLoaded', function () {
    const elementsConfig = {
        portfolioHeader: document.querySelector('.assets-header h2'),
        assetsTableContainer: document.getElementById('assets-table-container'),
        loadingMessage: document.getElementById('loading-assets'),
        portfolioNameElement: document.querySelector('.portfolio-selector span'),
        walletNameInput: document.getElementById('wallet-name'),
        walletDescInput: document.getElementById('wallet-description'),
        pieChartLegend: document.getElementById('pie-chart-legend'),
        balanceElement: document.getElementById('portfolio-balance'),
        returnElement: document.getElementById('portfolio-return'),
        addAssetForm: document.getElementById('addAssetForm'),
        assetDropdown: document.getElementById('assetDropdown'),
        addAssetButton: document.getElementById('headerAddAssetBtn')
    };

    if (typeof PortfolioManager !== 'undefined') {
        PortfolioManager.setElements(elementsConfig);
    }

    if (typeof ChartManager !== 'undefined') {
        const chartsManager = new ChartManager();
        chartsManager.initialize();
        window.chartsManagerInstance = chartsManager;

        if (typeof PortfolioManager !== 'undefined') {
            PortfolioManager.setCharts(chartsManager);
        }
    }

    if (typeof PortfolioManager !== 'undefined') {
        PortfolioManager.loadPortfolio();
    }

    initializeModalComponents();

    if (elementsConfig.addAssetButton) {
        elementsConfig.addAssetButton.addEventListener('click', () => {
            if (typeof AssetManager !== 'undefined') {
                AssetManager.loadAssetsDropdown();
            }
        });
    }

    if (elementsConfig.addAssetForm) {
        elementsConfig.addAssetForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (typeof AssetManager !== 'undefined') {
                AssetManager.addAsset(event);
            }
        });
    }

    document.addEventListener('portfolioChanged', function (e) {
        if (e.detail && e.detail.portfolio && typeof PortfolioManager !== 'undefined') {
            PortfolioManager.updatePortfolioUI(e.detail.portfolio);
        }
    });

    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('edit-asset') ||
            (event.target.parentElement && event.target.parentElement.classList.contains('edit-asset'))) {

            const button = event.target.classList.contains('edit-asset') ?
                event.target : event.target.parentElement;

            const assetId = button.dataset.assetId;
            if (typeof AssetManager !== 'undefined') {
                AssetManager.openEditAssetModal(assetId);
            }
        }

        if (event.target.classList.contains('delete-asset') ||
            (event.target.parentElement && event.target.parentElement.classList.contains('delete-asset'))) {

            const button = event.target.classList.contains('delete-asset') ?
                event.target : event.target.parentElement;

            const assetId = button.dataset.assetId;
            if (confirm('Tem certeza que deseja remover este ativo da carteira?')) {
                if (typeof AssetManager !== 'undefined') {
                    AssetManager.deleteAsset(assetId);
                }
            }
        }
    });
});

function initializeModalComponents() {
    if (typeof createModal === 'function') {
        const addAssetModal = createModal('addAssetModal');
        addAssetModal.initialize('headerAddAssetBtn');

        const editAssetModal = createModal('editAssetModal');
        editAssetModal.initialize();
    }

    const modalTrigger = document.getElementById('headerAddAssetBtn');
    if (modalTrigger) {
        modalTrigger.addEventListener('click', () => {
            setTimeout(() => {
                if (typeof AssetManager !== 'undefined') {
                    AssetManager.loadAssetsDropdown();
                }
            }, 100);
        });
    }

    const editAssetForm = document.getElementById('editAssetForm');
    if (editAssetForm) {
        editAssetForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (typeof AssetManager !== 'undefined') {
                AssetManager.updateAsset(event);
            }
        });
    }
}