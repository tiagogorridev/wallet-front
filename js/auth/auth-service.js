/**
 * Enhanced Authentication Service
 * Handles login, token refresh, and session management with improved error handling
 * and support for both localStorage and cookies
 */
const AuthService = {
    API_URL: 'http://191.239.116.115:8080',
    REFRESH_INTERVAL: 4 * 60 * 1000, // 4 minutes
    refreshTimer: null,
    isRefreshing: false,
    failedAttempts: 0,
    maxFailedAttempts: 5,
    
    initialize() {
        if (this.isAuthenticated()) {
            this.startRefreshToken();
            this.setupTokenRefreshListener();
        }
    },
    
    setupTokenRefreshListener() {
        window.addEventListener('tokenRefreshed', () => {
            this.failedAttempts = 0;
            console.log('Token atualizado com sucesso');
        });
    },
    
    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: password }),
                // Enable credentials to allow cookie storage from response
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.handleSuccessfulLogin(data);
                return true;
            }
            
            console.error('Falha no login:', data.message || 'Erro desconhecido');
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
        
        // Store in localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        
        // For some browser scenarios that might use cookies, store a timestamp
        // to detect if cookies were cleared while localStorage persists
        localStorage.setItem('authTimestamp', Date.now().toString());
        
        this.startRefreshToken();
        this.setupTokenRefreshListener();
    },
    
    async refreshToken() {
        if (this.isRefreshing) return true;
        
        try {
            this.isRefreshing = true;
            const token = this.getToken();
            
            if (!token) {
                console.error('Não há token para atualizar');
                return false;
            }
            
            const response = await fetch(`${this.API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // Enable credentials to ensure cookies are sent
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const newToken = data.token || data.access_token;
                
                if (newToken) {
                    localStorage.setItem('accessToken', newToken);
                    localStorage.setItem('authTimestamp', Date.now().toString());
                    
                    const event = new CustomEvent('tokenRefreshed', { 
                        detail: { token: newToken } 
                    });
                    window.dispatchEvent(event);
                    
                    this.failedAttempts = 0;
                    return true;
                }
            } else {
                // Check specific auth errors
                if (response.status === 401 || response.status === 403) {
                    this.failedAttempts++;
                    
                    // Check for specific error messages
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            if (errorData.message.includes('cookie') || 
                                errorData.message.includes('Cookie')) {
                                console.error('Erro de cookies detectado:', errorData.message);
                                // Force logout on cookie issues
                                this.logout();
                                return false;
                            }
                        }
                    } catch (e) {
                        // If can't parse response, continue with normal flow
                    }
                    
                    console.warn(`Falha na atualização do token: ${this.failedAttempts}/${this.maxFailedAttempts}`);
                }
                
                if (this.failedAttempts >= this.maxFailedAttempts) {
                    console.error('Limite máximo de falhas de autenticação atingido');
                    this.logout(); // Full logout is safer than silent
                    return false;
                }
                
                return true;
            }
        } catch (error) {
            console.error('Erro ao refresh token:', error);
            this.failedAttempts++;
            
            // On network errors, be more lenient
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.warn('Erro de rede durante refresh. Tentativa:', this.failedAttempts);
                return this.failedAttempts < this.maxFailedAttempts * 2; // Double tolerance for network errors
            }
            
            return this.failedAttempts < this.maxFailedAttempts;
        } finally {
            this.isRefreshing = false;
        }
    },
    
    startRefreshToken() {
        this.stopRefreshToken(); // Ensure we don't have multiple timers
        
        this.refreshTimer = setInterval(async () => {
            // Check for token-cookie mismatch before refresh
            if (!this.validateTokenIntegrity()) {
                console.error('Inconsistência detectada entre token e cookies');
                this.logout();
                return;
            }
            
            const success = await this.refreshToken();
            
            if (success) {
                console.log('Token ainda válido, próximo refresh em 4 minutos');
            } else {
                console.warn('Falha completa no refresh do token, parando o timer');
                this.stopRefreshToken();
            }
        }, this.REFRESH_INTERVAL);
        
        console.log('Timer de refresh iniciado');
    },
    
    stopRefreshToken() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('Timer de refresh parado');
        }
    },
    
    // Validate that we don't have a situation where localStorage has a token but cookies were cleared
    validateTokenIntegrity() {
        const token = localStorage.getItem('accessToken');
        const timestamp = localStorage.getItem('authTimestamp');
        
        // If we have a token but no timestamp, something is wrong
        if (token && !timestamp) {
            console.error('Token existe mas não há timestamp de autenticação');
            return false;
        }
        
        // Check if cookies exist by testing document.cookie
        // This is a basic check and might need to be adjusted based on your specific cookie setup
        const hasCookies = document.cookie.length > 0;
        
        // If API requires cookies but they're not present despite having a token, consider it invalid
        if (token && !hasCookies) {
            console.warn('Token existe mas não há cookies - potencial dessincronização');
            // We're returning true here as some setups might not use cookies,
            // but this is where you'd add additional validation if needed
        }
        
        return true;
    },
    
    // Always do a full logout for consistency
    logout() {
        this.clearAuthData();
        
        // Try to clear any session cookies by sending a logout request
        if (this.getToken()) {
            // Fire and forget - don't wait for response
            fetch(`${this.API_URL}/auth/logout`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            }).catch(e => console.warn('Erro ao fazer logout no servidor:', e));
        }
        
        window.location.href = '../../index.html';
    },
    
    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authTimestamp');
        this.stopRefreshToken();
        this.failedAttempts = 0;
    },
    
    isAuthenticated() {
        return !!this.getToken() && this.validateTokenIntegrity();
    },
    
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    getToken() {
        return localStorage.getItem('accessToken');
    },
    
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthService.initialize();
});

// Enhanced fetch interceptor with better error handling
const originalFetch = window.fetch;
window.fetch = async function(url, options = {}) {
    // Don't intercept auth endpoints
    const isAuthEndpoint = url.includes('/auth/');
    if (isAuthEndpoint && !url.includes('/auth/refresh')) {
        return originalFetch(url, options);
    }
    
    // Check authentication for protected routes
    if (!AuthService.isAuthenticated() && !isAuthEndpoint) {
        console.warn('Tentativa de requisição sem autenticação. Redirecionando para login...');
        window.location.href = '../../index.html';
        throw new Error('Não autenticado');
    }
    
    // Add auth headers and ensure credentials are included
    options.headers = options.headers || {};
    if (!options.headers['Authorization'] && AuthService.isAuthenticated()) {
        options.headers['Authorization'] = `Bearer ${AuthService.getToken()}`;
    }
    
    // Always include credentials to ensure cookies are sent
    options.credentials = options.credentials || 'include';
    
    try {
        const response = await originalFetch(url, options);
        
        // Handle auth errors
        if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
            console.log('Erro de autenticação detectado, tentando refresh do token...');
            
            // Check for cookie-specific errors
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                try {
                    const clone = response.clone();
                    const errorData = await clone.json();
                    
                    if (errorData && errorData.message && 
                        (errorData.message.includes('cookie') || errorData.message.includes('Cookie'))) {
                        console.error('Erro de cookies detectado:', errorData.message);
                        AuthService.logout();
                        throw new Error('Sessão expirada - problema com cookies');
                    }
                } catch (e) {
                    // Continue with normal flow if we can't parse the response
                }
            }
            
            // Try to refresh the token
            const refreshSuccess = await AuthService.refreshToken();
            
            if (refreshSuccess) {
                console.log('Refresh bem-sucedido, refazendo a requisição original');
                options.headers['Authorization'] = `Bearer ${AuthService.getToken()}`;
                return originalFetch(url, options);
            } else {
                console.error('Refresh falhou, redirecionando para login');
                AuthService.logout();
                throw new Error('Sessão expirada');
            }
        }
        
        return response;
    } catch (error) {
        if (['Sessão expirada', 'Não autenticado'].includes(error.message)) {
            throw error; // Already handled
        }
        
        console.error('Erro na requisição:', error);
        
        // Handle network errors without automatic redirect
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            console.warn('Erro de conexão detectado. Continuando a navegação...');
            // Create a custom error with a flag for UI handling
            const networkError = new Error('Erro de conexão com o servidor');
            networkError.isNetworkError = true;
            throw networkError;
        }
        
        throw error;
    }
};

window.AuthService = AuthService;