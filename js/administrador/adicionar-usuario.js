document.addEventListener("DOMContentLoaded", function () {
  // Configuração inicial e elementos DOM
  const API_URL = "http://191.239.116.115:8080";
  const msg = document.createElement("div");
  msg.id = "mensagem";
  msg.className = "feedback-message";
  msg.style.display = "none";
  document.querySelector(".users-section").appendChild(msg);

  const pwd = document.getElementById("password");
  const confirmPwd = document.getElementById("confirm-password");
  const form = document.getElementById("user-form");

  // Toggle de visibilidade das senhas
  document
    .getElementById("togglePassword")
    .addEventListener("click", function () {
      const type = pwd.type === "password" ? "text" : "password";
      pwd.type = type;
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });

  document
    .getElementById("toggleConfirmPassword")
    .addEventListener("click", function () {
      const type = confirmPwd.type === "password" ? "text" : "password";
      confirmPwd.type = type;
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });

  // Função para exibir mensagens de feedback
  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `feedback-message ${type}`;
    msg.style.display = "block";
    setTimeout(() => (msg.style.display = "none"), 5000);
  }

  // Validação do formulário
  function validate() {
    const nome = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = pwd.value;
    const confirmSenha = confirmPwd.value;
    const perfil = document.getElementById("role").value;

    if (!nome || !email || !senha || !confirmSenha || !perfil) {
      showMsg("Preencha todos os campos obrigatórios.", "erro");
      return false;
    }
    if (senha.length < 6) {
      showMsg("A senha deve ter pelo menos 6 caracteres.", "erro");
      return false;
    }
    if (senha !== confirmSenha) {
      showMsg("As senhas não coincidem.", "erro");
      return false;
    }
    return true;
  }

  // Comunicação com a API
  async function sendData(data) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.errors?.[0] || result.msg || "Erro ao adicionar usuário"
        );
      }
      return result;
    } catch (error) {
      showMsg(error.message || "Erro ao conectar com o servidor", "erro");
      return null;
    }
  }

  // Mapeamento de perfis de usuário
  const profileMap = {
    admin: "ADMIN",
    analyst: "ANALISTA",
    investor: "USUARIO",
  };

  // Submissão do formulário
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validate()) return;

    const role = document.getElementById("role").value;
    const mappedRole = profileMap[role] || "USUARIO";

    const userData = {
      nome: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      senha: pwd.value,
      perfil: mappedRole,
    };

    const result = await sendData(userData);
    if (result?.data) {
      showMsg(
        `Usuário ${mappedRole.toLowerCase()} adicionado com sucesso!`,
        "sucesso"
      );
      setTimeout(() => this.reset(), 2000);
    }
  });

  // Botão cancelar
  document
    .querySelector(".cancel-btn")
    .addEventListener("click", () => window.history.back());
});
