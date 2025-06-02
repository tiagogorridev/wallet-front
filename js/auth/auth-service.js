const AuthService = {
  API_URL: "http://191.239.116.115:8080",
  TOKEN_EXPIRY_TIME: 15 * 60 * 1000,

  // INICIALIZAR SERVICO
  initialize() {
    if (this.isAuthenticated()) {
      const tokenTimestamp = parseInt(
        localStorage.getItem("tokenTimestamp") || "0"
      );
      const now = Date.now();
      if (now - tokenTimestamp > this.TOKEN_EXPIRY_TIME) {
        this.handleTokenExpiration();
      }
    }
  },

  // REALIZAR LOGIN
  async login(email, password) {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (email && password) {
        this.storeCredentials(email, password);
      }
      this.storeAuthData(data);
      return true;
    } catch (error) {
      return false;
    }
  },

  // ARMAZENAR CREDENCIAIS
  storeCredentials(email, password) {
    const encodedCreds = btoa(`${email}:${password}`);
    sessionStorage.setItem("auth_creds", encodedCreds);
  },

  // RECUPERAR CREDENCIAIS
  getStoredCredentials() {
    const encodedCreds = sessionStorage.getItem("auth_creds");
    if (!encodedCreds) return null;
    try {
      const decodedCreds = atob(encodedCreds);
      const [email, password] = decodedCreds.split(":");
      return { email, password };
    } catch (e) {
      return null;
    }
  },

  // ARMAZENAR DADOS DE AUTENTICACAO
  storeAuthData(data) {
    const token = data.access_token || data.data?.access_token;
    const userData =
      data.usuario || data.user || data.data?.usuario || data.data?.user;

    if (!token || !userData) {
      throw new Error("Incomplete authentication data");
    }

    localStorage.setItem("accessToken", token);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("tokenTimestamp", Date.now().toString());
  },

  // LIDAR COM EXPIRACAO DO TOKEN
  async handleTokenExpiration() {
    const credentials = this.getStoredCredentials();
    if (credentials) {
      const success = await this.login(credentials.email, credentials.password);
      if (!success) {
        this.logout(false);
        return false;
      }
      return true;
    } else {
      this.logout();
      return false;
    }
  },

  // REALIZAR LOGOUT
  logout(redirect = true) {
    this.clearAuthData();
    try {
      fetch(`${this.API_URL}/auth/logout`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }).catch(() => {});
    } finally {
      if (redirect) {
        window.location.href = "../../index.html";
      }
    }
  },

  // LIMPAR DADOS DE AUTENTICACAO
  clearAuthData() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("tokenTimestamp");
    sessionStorage.removeItem("auth_creds");
  },

  // VERIFICAR SE ESTA AUTENTICADO
  isAuthenticated() {
    const token = this.getToken();
    const timestamp = parseInt(localStorage.getItem("tokenTimestamp") || "0");
    const now = Date.now();
    return !!token && now - timestamp < this.TOKEN_EXPIRY_TIME;
  },

  // OBTER INFO DO USUARIO
  getUserInfo() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  // OBTER TOKEN
  getToken() {
    return localStorage.getItem("accessToken");
  },

  // OBTER HEADERS DE AUTENTICACAO
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// INICIALIZAR SERVICO
document.addEventListener("DOMContentLoaded", () => {
  AuthService.initialize();
});

// VERIFICAR EXPIRACAO A CADA MINUTO
setInterval(() => {
  if (AuthService.isAuthenticated()) {
    const tokenTimestamp = parseInt(
      localStorage.getItem("tokenTimestamp") || "0"
    );
    const now = Date.now();
    const timeElapsed = now - tokenTimestamp;
    if (timeElapsed > AuthService.TOKEN_EXPIRY_TIME - 30000) {
      AuthService.handleTokenExpiration();
    }
  }
}, 60000);

// INTERCEPTAR FETCH PARA ADICIONAR AUTENTICACAO
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
  const isAuthEndpoint = url.includes("/auth/");
  if (isAuthEndpoint) {
    return originalFetch(url, options);
  }

  // VERIFICAR AUTENTICACAO
  if (!AuthService.isAuthenticated()) {
    const credentials = AuthService.getStoredCredentials();
    if (credentials) {
      const success = await AuthService.handleTokenExpiration();
      if (!success) {
        window.location.href = "../../index.html";
        throw new Error("Session expired");
      }
    } else {
      window.location.href = "../../index.html";
      throw new Error("Not authenticated");
    }
  }

  // ADICIONAR HEADER DE AUTORIZACAO
  options.headers = options.headers || {};
  if (!options.headers["Authorization"]) {
    options.headers["Authorization"] = `Bearer ${AuthService.getToken()}`;
  }

  try {
    const response = await originalFetch(url, options);
    if (response.status === 401 || response.status === 403) {
      const success = await AuthService.handleTokenExpiration();
      if (success) {
        options.headers["Authorization"] = `Bearer ${AuthService.getToken()}`;
        return originalFetch(url, options);
      } else {
        AuthService.logout();
        throw new Error("Session expired");
      }
    }
    return response;
  } catch (error) {
    if (
      error.message === "Session expired" ||
      error.message === "Not authenticated"
    ) {
      throw error;
    }
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      const networkError = new Error("Server connection error");
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
};

window.AuthService = AuthService;
