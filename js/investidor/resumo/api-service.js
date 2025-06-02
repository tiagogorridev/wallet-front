const APIService = {
  API_URL: "http://191.239.116.115:8080",

  // MÉTODO PRINCIPAL PARA REQUISIÇÕES
  async fetchFromAPI(endpoint, method, body = null) {
    const token = localStorage.getItem("accessToken");
    if (!token)
      throw new Error("Sessão expirada. Por favor, faça login novamente.");

    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${this.API_URL}${endpoint}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "../../index.html";
        throw new Error("Sessão expirada. Por favor, faça login novamente.");
      }

      const errorData = await response.json();
      throw new Error(errorData.msg || "Erro ao acessar API");
    }

    return response.json();
  },

  // MÉTODOS DE CARTEIRA
  getWallets: function () {
    return this.fetchFromAPI("/wallets", "GET");
  },
  getWalletById: function (walletId) {
    return this.fetchFromAPI(`/wallets/${walletId}`, "GET");
  },

  // MÉTODOS DE ATIVOS
  getAssets: function () {
    return this.fetchFromAPI("/assets", "GET");
  },

  // MÉTODOS DE TRANSAÇÕES
  addTransaction: function (data) {
    return this.fetchFromAPI("/transactions", "POST", data);
  },
  sellAsset: function (id) {
    return this.fetchFromAPI(`/transactions/${id}`, "DELETE");
  },
  deleteTransaction: function (id) {
    return this.sellAsset(id);
  },

  // MÉTODOS DE NOTÍCIAS
  getNews: function () {
    return this.fetchFromAPI("/news", "GET");
  },
  addNews: function (data) {
    return this.fetchFromAPI("/news", "POST", data);
  },

  async updateNews(newsId, newsData) {
    const id = parseInt(newsId);
    if (isNaN(id)) throw new Error("ID da notícia inválido");

    const formattedData = {
      id,
      titulo: newsData.titulo,
      conteudo: newsData.conteudo,
      categoria: newsData.categoria,
    };

    return this.fetchFromAPI(`/news?id=${id}`, "PUT", formattedData);
  },

  deleteNews: function (id) {
    return this.fetchFromAPI(`/news?id=${id}`, "DELETE");
  },
};

// EXPOSIÇÃO GLOBAL
window.APIService = APIService;
