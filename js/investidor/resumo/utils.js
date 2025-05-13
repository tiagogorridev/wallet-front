const Utils = {
    formatCurrency(value) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatPercentage(value) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    formatQuantity(value) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 6, maximumFractionDigits: 6 });
    },
    getCategoryClass(category) {
        const classes = {
            'CRIPTOMOEDAS': 'crypto',
            'ACOES': 'stocks',
        };
        return classes[category] || 'other';
    },
    getCategoryLabel(category) {
        const labels = {
            'CRIPTOMOEDAS': 'Criptomoedas',
            'ACOES': 'Ações',
        };
        return labels[category] || category;
    },
    getTypeLabel(type) {
        const labels = {
            'CRYPTO': 'Criptomoedas',
            'ACAO': 'Ações',
        };
        return labels[type] || type;
    },
    mapTypeToCategoryForForm(type) {
        const mapping = {
            'CRYPTO': 'CRIPTOMOEDAS',
            'ACAO': 'ACOES',
        };
        return mapping[type] || type;
    },
    getCategoryValueFromClass(className) {
        if (className.includes('category-crypto')) return 'CRIPTOMOEDAS';
        if (className.includes('category-stocks')) return 'ACOES';
        return 'CRIPTOMOEDAS';
    },
    showErrorMessage(element, message) {
        if (element) {
            element.innerHTML = `<p class="error-message">${message}</p>`;
            element.style.display = 'block';
        }
    }
};