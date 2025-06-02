const API_URL = "191.239.116.115:8080";
let currentWallet = null;
let elementos = {};

// INICIALIZACAO DO SISTEMA
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "../../index.html";
    return;
  }

  cacheElementos();

  const walletId = localStorage.getItem("selectedWalletId");
  if (walletId) {
    loadWalletById(walletId);
  }

  setupEventListeners();
});

// CACHE DOS ELEMENTOS HTML
function cacheElementos() {
  elementos = {
    portfolioName: document.getElementById("portfolio-name"),
    portfolioDesc: document.getElementById("portfolio-description"),
    portfolioToDelete: document.getElementById("portfolio-to-delete"),
    deleteModal: document.querySelector(".modal-overlay"),
  };
}

// CARREGAMENTO DA CARTEIRA
async function loadWalletById(walletId) {
  const token = localStorage.getItem("accessToken");

  try {
    const response = await fetch(`http://${API_URL}/wallets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Erro ao carregar dados da carteira");

    const data = await response.json();
    if (data.data && data.data.data) {
      const carteira = data.data.data.find((c) => c.id === parseInt(walletId));
      if (carteira) {
        loadWalletData(carteira);
      } else {
        throw new Error("Carteira não encontrada");
      }
    }
  } catch (error) {
    console.error("Erro ao carregar carteira:", error);
    if (elementos.portfolioName)
      elementos.portfolioName.value = "Erro ao carregar";
    mostrarErro(
      "Erro ao carregar dados da carteira. Tente novamente mais tarde."
    );
  }
}

function loadWalletData(wallet) {
  currentWallet = wallet;
  if (elementos.portfolioName)
    elementos.portfolioName.value = wallet.nome || "";
  if (elementos.portfolioDesc)
    elementos.portfolioDesc.value = wallet.descricao || "";
  if (elementos.portfolioToDelete)
    elementos.portfolioToDelete.textContent = wallet.nome || "";
}

// CONFIGURACAO DOS EVENT LISTENERS
function setupEventListeners() {
  const saveBtn = document.getElementById("save-account");
  const deleteBtn = document.getElementById("delete-portfolio");
  const confirmBtn = document.getElementById("confirm-delete");
  const cancelBtn = document.getElementById("cancel-delete");

  if (saveBtn) saveBtn.addEventListener("click", saveWalletInfo);
  if (deleteBtn)
    deleteBtn.addEventListener(
      "click",
      () => (elementos.deleteModal.style.display = "flex")
    );
  if (confirmBtn) confirmBtn.addEventListener("click", deleteWallet);
  if (cancelBtn)
    cancelBtn.addEventListener(
      "click",
      () => (elementos.deleteModal.style.display = "none")
    );
}

// SALVAMENTO DAS INFORMACOES DA CARTEIRA
async function saveWalletInfo() {
  if (!currentWallet) return;

  const walletId = localStorage.getItem("selectedWalletId");
  const name = elementos.portfolioName ? elementos.portfolioName.value : "";
  const description = elementos.portfolioDesc
    ? elementos.portfolioDesc.value
    : "";

  if (!name || name.trim() === "") {
    mostrarErro("O nome da carteira não pode ser vazio.");
    return;
  }

  try {
    const walletData = {
      id: parseInt(walletId),
      descricao: description,
    };

    if (name !== currentWallet.nome) {
      walletData.nome = name;
    }

    const response = await requisicaoAPI("PUT", "wallets", walletData);

    if (response.ok) {
      const updatedWallet = { ...currentWallet, descricao: description };

      if (name !== currentWallet.nome) {
        updatedWallet.nome = name;
        localStorage.setItem("selectedPortfolio", name);
      }

      currentWallet = updatedWallet;
      mostrarSucesso("Carteira atualizada com sucesso!");

      document.dispatchEvent(
        new CustomEvent("portfolioUpdated", {
          detail: { portfolio: updatedWallet },
        })
      );
    } else {
      mostrarErro(
        `Erro ao atualizar carteira: ${
          response.data.msg || "Falha na operação"
        }`
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar carteira:", error);
    mostrarErro("Erro ao conectar ao servidor. Tente novamente mais tarde.");
  }
}

// EXCLUSAO DA CARTEIRA
async function deleteWallet() {
  if (!currentWallet) return;

  const walletId = localStorage.getItem("selectedWalletId");
  if (!walletId) {
    mostrarErro("ID da carteira não encontrado.");
    elementos.deleteModal.style.display = "none";
    return;
  }

  try {
    const response = await requisicaoAPI("DELETE", `wallets?id=${walletId}`);

    if (response.ok) {
      elementos.deleteModal.style.display = "none";
      localStorage.removeItem("selectedPortfolio");
      localStorage.removeItem("selectedWalletId");
      mostrarSucesso("Carteira excluída com sucesso!");

      document.dispatchEvent(
        new CustomEvent("walletDeleted", {
          detail: { walletId: walletId },
        })
      );

      window.location.href = "../../html/investidor/resumo.html";
    } else {
      mostrarErro(
        `Erro ao excluir carteira: ${response.data.msg || "Falha na operação"}`
      );
    }
  } catch (error) {
    console.error("Erro ao excluir carteira:", error);
    mostrarErro("Erro ao conectar ao servidor. Tente novamente mais tarde.");
  } finally {
    elementos.deleteModal.style.display = "none";
  }
}

// FUNCOES AUXILIARES
async function requisicaoAPI(metodo, endpoint, dados = null) {
  const token = localStorage.getItem("accessToken");
  const opcoes = {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (dados && (metodo === "POST" || metodo === "PUT")) {
    opcoes.body = JSON.stringify(dados);
  }

  const response = await fetch(`http://${API_URL}/${endpoint}`, opcoes);
  const data = await response.json();

  return { ok: response.ok, data: data };
}

function mostrarErro(mensagem) {
  alert(mensagem);
}

function mostrarSucesso(mensagem) {
  alert(mensagem);
}
