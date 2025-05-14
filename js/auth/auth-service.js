const AuthService = {
    API_URL: 'http://191.239.116.115:8080',
    REFRESH_INTERVAL: 4 * 60 * 1000,
    refreshTimer: null,
    
    initialize() {
        if (this.isAuthenticated()) {
            this.startRefreshToken();
        }
    },
    
    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.handleSuccessfulLogin(data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro durante o login:', error);
            return false;
        }
    },
    
    handleSuccessfulLogin(data) {
        const token = data.token || data.access_token || (data.data && (data.data.token || data.data.access_token));
        const userData = data.usuario || data.user || (data.data && (data.data.usuario || data.data.user));
        
        if (!token || !userData) {
            throw new Error('Dados de autenticação incompletos');
        }
        
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        this.startRefreshToken();
    },
    
    async refreshToken() {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return false;
            
            const response = await fetch(`${this.API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const newToken = data.token || data.access_token;
                if (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    
                    const event = new CustomEvent('tokenRefreshed', { 
                        detail: { token: newToken } 
                    });
                    window.dispatchEvent(event);
                    
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao refresh token:', error);
            return false;
        }
    },
    
    startRefreshToken() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(async () => {
            const success = await this.refreshToken();
            if (!success) {
                this.logout();
            }
        }, this.REFRESH_INTERVAL);
    },
    
    stopRefreshToken() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    },
    
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        this.stopRefreshToken();
        window.location.href = '../../index.html';
    },
    
    isAuthenticated() {
        return !!localStorage.getItem('accessToken');
    },
    
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    getToken() {
        return localStorage.getItem('accessToken');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthService.initialize();
});

window.AuthService = AuthService;