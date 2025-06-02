document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("login-message");
  const passwordToggle = document.querySelector(".password-toggle");
  const passwordInput = document.getElementById("password");

  // TOGGLE DE SENHA
  passwordToggle.addEventListener("click", function () {
    const icon = this.querySelector("i");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.replace("pi-eye", "pi-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.replace("pi-eye-slash", "pi-eye");
    }
  });

  // FORM SUBMIT
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      showMessage("Por favor, preencha todos os campos.", "error");
      return;
    }

    showMessage("Autenticando...", "info");

    try {
      const success = await AuthService.login(email, password);
      if (success) {
        showMessage("Login realizado com sucesso!", "success");
        const userInfo = AuthService.getUserInfo();
        setTimeout(() => redirectUserByProfile(userInfo.perfil), 1000);
      } else {
        showMessage(
          "Falha na autenticação. Verifique suas credenciais.",
          "error"
        );
      }
    } catch (error) {
      showMessage(
        "Erro ao conectar ao servidor. Tente novamente mais tarde.",
        "error"
      );
    }
  });

  // REDIRECIONAR POR PERFIL
  function redirectUserByProfile(profile) {
    const routes = {
      ADMIN: "./html/administrador/dashboard.html",
      ANALISTA: "./html/analista/dashboard-analista.html",
      USUARIO: "./html/investidor/resumo.html",
    };

    const route = routes[profile];
    if (route) {
      window.location.href = route;
    } else {
      showMessage("Tipo de perfil desconhecido: " + profile, "error");
    }
  }

  // MOSTRAR MENSAGEM
  function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = "feedback-message " + type;

    const colors = {
      error: "#c62828",
      success: "#2e7d32",
      info: "#1565c0",
    };

    loginMessage.style.color = colors[type] || "";
  }
});
