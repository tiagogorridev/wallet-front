document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "http://191.239.116.115:8080";
  const mensagemElement = document.getElementById("mensagem");
  const passwordFields = document.querySelectorAll(".password-toggle");

  // TOGGLE DE SENHA
  if (passwordFields.length > 0) {
    passwordFields.forEach((toggle) => {
      toggle.addEventListener("click", function (event) {
        const passwordField = event.currentTarget.previousElementSibling;
        const icon = event.currentTarget.querySelector("i");
        if (passwordField.type === "password") {
          passwordField.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          passwordField.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });
    });
  }

  // MOSTRAR MENSAGEM
  function mostrarMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem-feedback ${tipo}`;
    mensagemElement.style.display = "block";
    setTimeout(() => {
      mensagemElement.style.display = "none";
    }, 5000);
  }

  // VALIDAR FORMULARIO
  function validarFormulario() {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("password").value;
    const confirmSenha = document.getElementById("confirmPassword").value;

    if (!nome || !email || !senha || !confirmSenha) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarMensagem("Por favor, insira um email válido.", "erro");
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

  // ENVIAR CADASTRO
  async function enviarCadastro(dadosUsuario) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosUsuario),
        credentials: "include",
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors && responseData.errors.length > 0) {
          throw new Error(
            responseData.errors[0] ||
              responseData.msg ||
              "Erro ao realizar cadastro"
          );
        }
        throw new Error(responseData.msg || "Erro ao realizar cadastro");
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

  // LOGIN APOS CADASTRO
  async function loginAposCadastro(email, senha) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        if (window.AuthService) {
          window.AuthService.handleSuccessfulLogin(data);
        } else {
          const token =
            data.token ||
            data.access_token ||
            (data.data && (data.data.token || data.data.access_token));
          const userData =
            data.usuario ||
            data.user ||
            (data.data && (data.data.usuario || data.data.user));

          localStorage.setItem("accessToken", token);
          localStorage.setItem("userInfo", JSON.stringify(userData));
          localStorage.setItem("authTimestamp", Date.now().toString());
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // REDIRECIONAR POR PERFIL
  function redirecionarPorPerfil(perfil) {
    switch (perfil) {
      case "USUARIO":
        window.location.href = "../investidor/resumo.html";
        break;
      case "ADMINISTRADOR":
        window.location.href = "../administrador/resumo.html";
        break;
      case "ANALISTA":
        window.location.href = "../analista/dashboard-analista.html";
        break;
      default:
        window.location.href = "../index.html";
    }
  }

  // FORM SUBMIT
  document
    .getElementById("cadastroForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!validarFormulario()) {
        return;
      }

      const perfilSelecionado = document.getElementById("perfil")
        ? document.getElementById("perfil").value
        : "USUARIO";

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("password").value;

      const dadosUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        perfil: perfilSelecionado,
      };

      const resultado = await enviarCadastro(dadosUsuario);

      if (resultado) {
        mostrarMensagem(
          "Cadastro realizado com sucesso! Realizando login automático...",
          "sucesso"
        );

        const loginSucesso = await loginAposCadastro(email, senha);

        if (loginSucesso) {
          mostrarMensagem(
            "Login realizado com sucesso! Redirecionando para a página de login...",
            "sucesso"
          );
          setTimeout(() => {
            redirecionarPorPerfil(perfilSelecionado);
          }, 2000);
        } else {
          mostrarMensagem(
            "Cadastro realizado, mas o login automático falhou. Redirecionando para a página de login...",
            "aviso"
          );
          setTimeout(() => {
            window.location.href = "../../index.html";
          }, 3000);
        }

        this.reset();
      }
    });
});
