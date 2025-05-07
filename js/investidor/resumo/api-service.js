const APIService = {
    API_URL: 'http://191.239.116.115:8080',

    async fetchFromAPI(endpoint, method, body = null) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        const options = {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${this.API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('accessToken');
                window.location.href = '../../index.html';
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }
            
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Erro ao acessar API');
        }
        
        return response.json();
    },

    async getWallets() {
        return this.fetchFromAPI('/wallets', 'GET');
    },

    async getWalletById(walletId) {
        return this.fetchFromAPI(`/wallets/${walletId}`, 'GET');
    },

    async getAssets() {
        return this.fetchFromAPI('/assets', 'GET');
    },

    async addTransaction(transactionData) {
        return this.fetchFromAPI('/transactions', 'POST', transactionData);
    },

    async updateTransaction(transactionId, transactionData) {
        return this.fetchFromAPI(`/transactions/${transactionId}`, 'PUT', transactionData);
    },

    async deleteTransaction(transactionId) {
        return this.fetchFromAPI(`/transactions/${transactionId}`, 'DELETE');
    }
};

window.APIService = APIService;