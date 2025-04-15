document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'http://191.239.116.115:8080';
  const mensagemElement = document.getElementById("mensagem");
  const passwordFields = document.querySelectorAll('.password-toggle');
  if (passwordFields.length > 0) {
    passwordFields.forEach(toggle => {
      toggle.addEventListener('click', function(event) {
        togglePassword(event);
      });
    });
  }

  function togglePassword(event) {
    const passwordField = event.currentTarget.previousElementSibling;
    const icon = event.currentTarget.querySelector('i');

    if (passwordField.type === "password") {
      passwordField.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }

  function mostrarMensagem(texto, tipo) {
    mensagemElement.textContent = texto;
    mensagemElement.className = `mensagem-feedback ${tipo}`;
    mensagemElement.style.display = "block";
    setTimeout(() => {
      mensagemElement.style.display = "none";
    }, 5000);
  }

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

  async function enviarCadastro(dadosUsuario) {
    try {
      console.log("Dados sendo enviados:", dadosUsuario);
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosUsuario),
      });

      console.log("Status da resposta:", response.status);
      
      const responseData = await response.json();
      console.log("Resposta recebida:", responseData);
      
      if (!response.ok) {
        if (responseData.errors && responseData.errors.length > 0) {
          throw new Error(responseData.errors[0] || responseData.msg || "Erro ao realizar cadastro");
        }
        throw new Error(responseData.msg || "Erro ao realizar cadastro");
      }

      return responseData;
    } catch (error) {
      console.error("Erro de cadastro:", error);
      mostrarMensagem(error.message || "Erro ao conectar com o servidor", "erro");
      return null;
    }
  }

  document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const dadosUsuario = {
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      senha: document.getElementById("password").value,
      perfil: "USUARIO"
    };

    const resultado = await enviarCadastro(dadosUsuario);

    if (resultado) {
      mostrarMensagem("Cadastro realizado com sucesso!", "sucesso");
      setTimeout(() => {
        window.location.href = "../login/login.html";
      }, 2000);
      this.reset();
    }
  });
});