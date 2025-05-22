const AuthService = {
    API_URL: 'http://191.239.116.115:8080',
    TOKEN_EXPIRY_TIME: 15 * 60 * 1000,

    initialize() {
        // Check token expiration on initialization
        if (this.isAuthenticated()) {
            const tokenTimestamp = parseInt(localStorage.getItem('tokenTimestamp') || '0');
            const now = Date.now();

            // If token is about to expire or has expired, attempt login with stored credentials
            if (now - tokenTimestamp > this.TOKEN_EXPIRY_TIME) {
                this.handleTokenExpiration();
            }
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Login error:', errorData);
                return false;
            }

            const data = await response.json();

            // Store credentials for silent refresh
            if (email && password) {
                this.storeCredentials(email, password);
            }

            this.storeAuthData(data);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    },

    storeCredentials(email, password) {
        // Store encrypted credentials for silent refresh
        // This is a simple encoding - in production, use more secure methods
        const encodedCreds = btoa(`${email}:${password}`);
        sessionStorage.setItem('auth_creds', encodedCreds);
    },

    getStoredCredentials() {
        const encodedCreds = sessionStorage.getItem('auth_creds');
        if (!encodedCreds) return null;

        try {
            const decodedCreds = atob(encodedCreds);
            const [email, password] = decodedCreds.split(':');
            return { email, password };
        } catch (e) {
            return null;
        }
    },

    storeAuthData(data) {
        const token = data.access_token || data.data?.access_token;
        const userData = data.usuario || data.user || data.data?.usuario || data.data?.user;

        if (!token || !userData) {
            throw new Error('Incomplete authentication data');
        }

        localStorage.setItem('accessToken', token);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('tokenTimestamp', Date.now().toString());
    },

    async handleTokenExpiration() {
        const credentials = this.getStoredCredentials();

        // If we have stored credentials, attempt silent login
        if (credentials) {
            const success = await this.login(credentials.email, credentials.password);

            if (!success) {
                this.logout(false); // Logout without redirect
                return false;
            }
            return true;
        } else {
            this.logout();
            return false;
        }
    },

    logout(redirect = true) {
        // Clear all auth data from storage
        this.clearAuthData();

        // Call the logout endpoint (if it's implemented)
        try {
            fetch(`${this.API_URL}/auth/logout`, {
                method: 'DELETE', // Notice: Changed from POST to DELETE based on backend code
                headers: this.getAuthHeaders(),
                credentials: 'include'
            }).catch(() => { });
        } finally {
            if (redirect) {
                window.location.href = '../../index.html';
            }
        }
    },

    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('tokenTimestamp');
        sessionStorage.removeItem('auth_creds');
    },

    isAuthenticated() {
        const token = this.getToken();
        const timestamp = parseInt(localStorage.getItem('tokenTimestamp') || '0');
        const now = Date.now();

        // Check if token exists and hasn't expired
        return !!token && (now - timestamp < this.TOKEN_EXPIRY_TIME);
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

document.addEventListener('DOMContentLoaded', () => {
    AuthService.initialize();
});

// Create a timer to check token expiration every minute
setInterval(() => {
    if (AuthService.isAuthenticated()) {
        const tokenTimestamp = parseInt(localStorage.getItem('tokenTimestamp') || '0');
        const now = Date.now();
        const timeElapsed = now - tokenTimestamp;

        // If token is about to expire (within 30 seconds), perform silent refresh
        if (timeElapsed > (AuthService.TOKEN_EXPIRY_TIME - 30000)) {
            console.log('Token about to expire, attempting silent refresh');
            AuthService.handleTokenExpiration();
        }
    }
}, 60000); // Check every minute

const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
    const isAuthEndpoint = url.includes('/auth/');

    if (isAuthEndpoint) {
        return originalFetch(url, options);
    }

    // Check for authentication before making request
    if (!AuthService.isAuthenticated()) {
        // Try silent login if we have credentials
        const credentials = AuthService.getStoredCredentials();
        if (credentials) {
            const success = await AuthService.handleTokenExpiration();
            if (!success) {
                window.location.href = '../../index.html';
                throw new Error('Session expired');
            }
        } else {
            window.location.href = '../../index.html';
            throw new Error('Not authenticated');
        }
    }

    // Add authorization header
    options.headers = options.headers || {};
    if (!options.headers['Authorization']) {
        options.headers['Authorization'] = `Bearer ${AuthService.getToken()}`;
    }


    try {
        const response = await originalFetch(url, options);

        // Handle 401/403 responses
        if (response.status === 401 || response.status === 403) {
            // Try silent login
            const success = await AuthService.handleTokenExpiration();

            if (success) {
                options.headers['Authorization'] = `Bearer ${AuthService.getToken()}`;
                return originalFetch(url, options);
            } else {
                AuthService.logout();
                throw new Error('Session expired');
            }
        }

        return response;
    } catch (error) {
        if (error.message === 'Session expired' || error.message === 'Not authenticated') {
            throw error;
        }

        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            const networkError = new Error('Server connection error');
            networkError.isNetworkError = true;
            throw networkError;
        }

        throw error;
    }
};

window.AuthService = AuthService;