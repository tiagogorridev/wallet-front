document.addEventListener('DOMContentLoaded', function() {
    initAllocation();
    initSaveButtons();
});

function initAllocation() {
    const allocationInputs = document.querySelectorAll('.allocation-value');
    allocationInputs.forEach(input => {
        input.addEventListener('input', updateTotalAllocation);
    });
    updateTotalAllocation();
    const savedProfile = localStorage.getItem('investorProfile');
    if (savedProfile) {
        updateAllocationByProfile(savedProfile);
    }
}

function updateAllocationByProfile(profileType) {
    const cryptoInput = document.getElementById('crypto-allocation');
    const fixedIncomeInput = document.getElementById('fixed-income-allocation');
    const stocksInput = document.getElementById('stocks-allocation');

    if (!cryptoInput || !fixedIncomeInput || !stocksInput) return;

    switch(profileType) {
        case 'conservative':
            cryptoInput.value = 10;
            fixedIncomeInput.value = 80;
            stocksInput.value = 10;
            break;
        case 'moderate':
            cryptoInput.value = 30;
            fixedIncomeInput.value = 50;
            stocksInput.value = 20;
            break;
        case 'aggressive':
            cryptoInput.value = 50;
            fixedIncomeInput.value = 20;
            stocksInput.value = 30;
            break;
    }
    updateTotalAllocation();
}

function updateTotalAllocation() {
    const cryptoElement = document.getElementById('crypto-allocation');
    const fixedIncomeElement = document.getElementById('fixed-income-allocation');
    const stocksElement = document.getElementById('stocks-allocation');
    const totalElement = document.getElementById('total-allocation');
    
    if (!cryptoElement || !fixedIncomeElement || !stocksElement || !totalElement) return;
    
    const cryptoValue = parseInt(cryptoElement.value) || 0;
    const fixedIncomeValue = parseInt(fixedIncomeElement.value) || 0;
    const stocksValue = parseInt(stocksElement.value) || 0;

    const total = cryptoValue + fixedIncomeValue + stocksValue;

    totalElement.textContent = total + '%';
    totalElement.style.color = (total !== 100) ? 'var(--red)' : 'var(--ambar)';
}

function initSaveButtons() {
    const saveAccountBtn = document.getElementById('save-account');
    if (saveAccountBtn) {
        saveAccountBtn.addEventListener('click', function() {
            const portfolioName = document.getElementById('portfolio-name').value;
            const currencySelect = document.getElementById('currency-select');
            const selectedCurrency = currencySelect.options[currencySelect.selectedIndex].text;

            alert(`Carteira "${portfolioName}" com moeda "${selectedCurrency}" salva com sucesso!`);
        });
    }
    const saveAllocationBtn = document.getElementById('save-allocation');
    if (saveAllocationBtn) {
        saveAllocationBtn.addEventListener('click', function() {
            const cryptoValue = document.getElementById('crypto-allocation').value;
            const fixedIncomeValue = document.getElementById('fixed-income-allocation').value;
            const stocksValue = document.getElementById('stocks-allocation').value;

            const total = parseInt(cryptoValue) + parseInt(fixedIncomeValue) + parseInt(stocksValue);

            if (total !== 100) {
                alert('A soma das alocações deve ser exatamente 100%');
                return;
            }

            alert(`Alocação salva com sucesso! Criptomoedas: ${cryptoValue}%, Renda Fixa: ${fixedIncomeValue}%, Ações: ${stocksValue}%`);
        });
    }
}