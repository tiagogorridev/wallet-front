document.addEventListener("DOMContentLoaded", function () {
  // Constantes e inicialização
  const API_URL = "http://191.239.116.115:8080";
  const mensagemElement = document.createElement("div");
  mensagemElement.id = "mensagem";
  mensagemElement.className = "feedback-message";
  mensagemElement.style.display = "none";
  document.querySelector(".users-section").appendChild(mensagemElement);

  // Elementos DOM
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirm-password");
  const togglePassword = document.getElementById("togglePassword");
  const toggleConfirmPassword = document.getElementById(
    "toggleConfirmPassword"
  );
  const userForm = document.getElementById("user-form");

  // Eventos de visibilidade de senha
  togglePassword.addEventListener("click", function () {
    const type =
      passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

  toggleConfirmPassword.addEventListener("click", function () {
    const type =
      confirmPasswordField.getAttribute("type") === "password"
        ? "text"
        : "password";
    confirmPasswordField.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

  // Funções auxiliares
  function mostrarMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `feedback-message ${tipo}`;
    mensagemElement.style.display = "block";
    setTimeout(() => {
      mensagemElement.style.display = "none";
    }, 5000);
  }

  function validarFormulario() {
    const nome = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = passwordField.value;
    const confirmSenha = confirmPasswordField.value;
    const perfil = document.getElementById("role").value;

    if (!nome || !email || !senha || !confirmSenha || !perfil) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
      return false;
    }

    if (senha.length < 6) {
      mostrarMensagem("A senha deve ter pelo menos 6 caracteres.", "erro");
      return false;
    }

    if (senha !== confirmSenha) {
      mostrarMensagem("As senhas não coincidem.", "erro");
      return false;
    }

    return true;
  }

  // Função de comunicação com a API
  async function enviarCadastro(dadosUsuario) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dadosUsuario),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors && responseData.errors.length > 0) {
          throw new Error(
            responseData.errors[0] ||
              responseData.msg ||
              "Erro ao adicionar usuário"
          );
        }
        throw new Error(responseData.msg || "Erro ao adicionar usuário");
      }

      return responseData;
    } catch (error) {
      mostrarMensagem(
        error.message || "Erro ao conectar com o servidor",
        "erro"
      );
      return null;
    }
  }

  // Mapeamento de perfis
  function mapearPerfil(valor) {
    const mapeamento = {
      admin: "ADMIN",
      analyst: "ANALISTA",
      investor: "USUARIO",
    };
    return mapeamento[valor] || "USUARIO";
  }

  // Evento de submissão do formulário
  userForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const tipoUsuario = document.getElementById("role").value;
    const perfilMapeado = mapearPerfil(tipoUsuario);

    const dadosUsuario = {
      nome: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      senha: passwordField.value,
      perfil: perfilMapeado,
    };

    const resultado = await enviarCadastro(dadosUsuario);

    if (resultado && resultado.data) {
      mostrarMensagem(
        `Usuário ${perfilMapeado.toLowerCase()} adicionado com sucesso!`,
        "sucesso"
      );
      setTimeout(() => {
        this.reset();
      }, 2000);
    }
  });

  // Botão cancelar
  document.querySelector(".cancel-btn").addEventListener("click", function () {
    window.history.back();
  });
});
