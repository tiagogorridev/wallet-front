const SERVLET_URL = "http://localhost:8080/mywallet/api/usuarios";
const mensagemElement = document.getElementById("mensagem");

function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const toggleIcon = event.currentTarget.querySelector('i');

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
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
  const dataNascimento = document.getElementById("dataNascimento").value;
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("password").value;
  const confirmSenha = document.getElementById("confirmPassword").value;

  if (!nome || !dataNascimento || !email || !senha || !confirmSenha) {
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
    const response = await fetch(SERVLET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosUsuario),
      credentials: 'same-origin'
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const resultado = await response.json();

      if (response.ok) {
        mostrarMensagem("Cadastro realizado com sucesso!", "sucesso");
        setTimeout(() => {
          window.location.href = "../login/login.html";
        }, 2000);
        return resultado;
      } else {
        mostrarMensagem(resultado.mensagem || "Erro ao realizar cadastro.", "erro");
        return null;
      }
    } else {
      const texto = await response.text();
      mostrarMensagem("Resposta do servidor não é um JSON válido: " + texto, "erro");
      return null;
    }
  } catch (error) {
    mostrarMensagem("Erro de conexão. Verifique se o servidor Java está rodando.", "erro");
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
    dataNascimento: document.getElementById("dataNascimento").value,
    email: document.getElementById("email").value.trim(),
    senha: document.getElementById("password").value
  };

  const resultado = await enviarCadastro(dadosUsuario);

  if (resultado && resultado.status === "sucesso") {
    this.reset();
  }
});
