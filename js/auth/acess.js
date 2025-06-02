(function () {
  // VERIFICAR SE USUARIO ESTA AUTENTICADO
  function verificarAutenticacao() {
    if (!AuthService.isAuthenticated()) {
      redirecionarParaLogin();
      return false;
    }
    const userInfo = AuthService.getUserInfo();
    if (!userInfo) {
      redirecionarParaLogin();
      return false;
    }
    AuthService.startRefreshToken();
    return {
      autenticado: true,
      perfil: userInfo.perfil,
      nome: userInfo.nome,
      email: userInfo.email,
    };
  }

  // REDIRECIONAR PARA LOGIN
  function redirecionarParaLogin() {
    window.location.replace("../../index.html");
  }

  // VERIFICAR PERMISSOES POR PAGINA
  function verificarPermissao() {
    const auth = verificarAutenticacao();
    if (!auth) return;

    const paginaAtual = window.location.pathname;
    const ehPaginaAdmin = paginaAtual.includes("/administrador/");
    const ehPaginaAnalista = paginaAtual.includes("/analista/");
    const ehPaginaInvestidor = paginaAtual.includes("/investidor/");
    const ehPaginaLogin = paginaAtual.includes("index.html");

    if (ehPaginaAdmin && auth.perfil !== "ADMIN") {
      redirecionarUsuarioPorPerfil(auth.perfil);
      return false;
    }
    if (ehPaginaAnalista && auth.perfil !== "ANALISTA") {
      redirecionarUsuarioPorPerfil(auth.perfil);
      return false;
    }
    if (ehPaginaInvestidor && auth.perfil !== "USUARIO") {
      redirecionarUsuarioPorPerfil(auth.perfil);
      return false;
    }
    if (
      !ehPaginaLogin &&
      ((auth.perfil === "ADMIN" && !ehPaginaAdmin) ||
        (auth.perfil === "ANALISTA" && !ehPaginaAnalista) ||
        (auth.perfil === "USUARIO" && !ehPaginaInvestidor))
    ) {
      redirecionarUsuarioPorPerfil(auth.perfil);
      return false;
    }
    return true;
  }

  // REDIRECIONAR POR PERFIL
  function redirecionarUsuarioPorPerfil(perfil) {
    switch (perfil) {
      case "ADMIN":
        window.location.replace("../administrador/dashboard.html");
        break;
      case "ANALISTA":
        window.location.replace("../analista/dashboard-analista.html");
        break;
      case "USUARIO":
        window.location.replace("../investidor/resumo.html");
        break;
      default:
        redirecionarParaLogin();
    }
  }

  verificarPermissao();
  window.addEventListener("tokenRefreshed", verificarPermissao);
})();

// ATUALIZAR INFO DO USUARIO NA INTERFACE
document.addEventListener("DOMContentLoaded", function () {
  function atualizarInfoUsuario() {
    const userInfo = AuthService.getUserInfo();
    if (!userInfo) return;

    const nomeElement = document.getElementById("nomeUsuario");
    const emailElement = document.getElementById("emailUsuario");
    const perfilElement = document.getElementById("perfilUsuario");

    if (nomeElement) nomeElement.textContent = userInfo.nome;
    if (emailElement) emailElement.textContent = userInfo.email;
    if (perfilElement) perfilElement.textContent = userInfo.perfil;
  }

  // BOTAO DE LOGOUT
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => AuthService.logout());
  }

  atualizarInfoUsuario();
  window.addEventListener("tokenRefreshed", atualizarInfoUsuario);
});
