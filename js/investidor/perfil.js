const API_URL = "http://191.239.116.115:8080";

// INICIALIZAÇÃO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  const profileFromUrl = new URLSearchParams(window.location.search).get(
    "profile"
  );
  if (
    profileFromUrl &&
    ["CONSERVADOR", "MODERADO", "ARROJADO"].includes(profileFromUrl)
  )
    selectInvestorProfile(profileFromUrl);

  fetchUserData();
  initSaveButton();
  initProfiles();
});

// BUSCAR DADOS DO USUÁRIO
function fetchUserData() {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => (r.ok ? r.json() : Promise.reject("Erro")))
    .then((data) => {
      const user = data?.data?.data?.[0] || data?.data?.user;
      if (user) {
        localStorage.setItem("userInfo", JSON.stringify(user));
        fillUserData(user);
      }
    })
    .catch(() => {
      const saved = localStorage.getItem("userInfo");
      if (saved) fillUserData(JSON.parse(saved));
    });
}

// PREENCHER DADOS NA TELA
function fillUserData(user) {
  if (user.nome) document.getElementById("user-name").value = user.nome;
  if (user.email) document.getElementById("user-email").value = user.email;
  if (user.estilo_investidor) selectInvestorProfile(user.estilo_investidor);
}

// SELECIONAR PERFIL DE INVESTIDOR
function selectInvestorProfile(type) {
  const map = {
    CONSERVADOR: "conservative",
    MODERADO: "moderate",
    ARROJADO: "aggressive",
  };
  document.querySelectorAll(".profile-option").forEach((opt) => {
    opt.classList.toggle(
      "selected",
      opt.getAttribute("data-profile") === (map[type] || "conservative")
    );
  });
}

// BOTÃO SALVAR DADOS PESSOAIS
function initSaveButton() {
  document
    .getElementById("save-personal-data")
    ?.addEventListener("click", () => {
      const name = document.getElementById("user-name").value;
      if (!name) return alert("Por favor, preencha o campo de nome!");

      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      stored.nome = name;
      localStorage.setItem("userInfo", JSON.stringify(stored));
      updateServer({ nome: name }, "Nome atualizado com sucesso!");
    });
}

// SELEÇÃO DE PERFIS DE INVESTIDOR
function initProfiles() {
  const profileMap = {
    conservative: "CONSERVADOR",
    moderate: "MODERADO",
    aggressive: "ARROJADO",
  };
  const nameMap = {
    conservative: "Conservador",
    moderate: "Moderado",
    aggressive: "Arrojado",
  };

  document.querySelectorAll(".profile-option").forEach((opt) => {
    opt.addEventListener("click", function () {
      document
        .querySelectorAll(".profile-option")
        .forEach((o) => o.classList.remove("selected"));
      this.classList.add("selected");

      const type = this.getAttribute("data-profile");
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      stored.estilo_investidor = profileMap[type];
      localStorage.setItem("userInfo", JSON.stringify(stored));

      updateServer(
        { estilo_investidor: profileMap[type] },
        `Perfil de investidor alterado para ${nameMap[type]}`
      );
    });
  });
}

// ATUALIZAR DADOS NO SERVIDOR
function updateServer(data, msg) {
  const token = localStorage.getItem("accessToken");
  if (!token) return alert("Erro: Usuário não autenticado");

  const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
  if (stored.id && stored.id !== "null") data.id = stored.id;

  fetch(`${API_URL}/users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((r) =>
      r.ok
        ? r.text().then((t) => (t ? JSON.parse(t) : { success: true }))
        : Promise.reject("Erro")
    )
    .then((res) => {
      if (res?.data?.user) {
        const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
        localStorage.setItem(
          "userInfo",
          JSON.stringify({ ...info, ...res.data.user })
        );
      }
      alert(msg);
    })
    .catch((e) => alert(`Erro: ${e}`));
}
