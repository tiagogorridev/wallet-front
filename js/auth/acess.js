(function () {
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
            email: userInfo.email
        };
    }

    function redirecionarParaLogin() {
        window.location.replace('../../index.html');
    }

    function verificarPermissao() {
        const auth = verificarAutenticacao();
        if (!auth) return;

        const paginaAtual = window.location.pathname;
        const ehPaginaAdmin = paginaAtual.includes('/administrador/')
        const ehPaginaUsuario = paginaAtual.includes('/investidor/');
        const ehPaginaLogin = paginaAtual.includes('../../index.html');
        if (ehPaginaAdmin && auth.perfil !== 'ADMIN' && auth.perfil !== 'ANALISTA') {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        if (ehPaginaUsuario && (auth.perfil === 'ADMIN' || auth.perfil === 'ANALISTA' ||
            (auth.perfil !== 'USUARIO' && auth.perfil !== 'CONSERVADOR' &&
                auth.perfil !== 'MODERADO' && auth.perfil !== 'ARROJADO'))) {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        if (!ehPaginaAdmin && !ehPaginaUsuario && !ehPaginaLogin) {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }

        return true;
    }

    function redirecionarUsuarioPorPerfil(perfil) {
        switch (perfil) {
            case 'ADMIN':
            case 'ANALISTA':
                window.location.replace('../html/administrador/dashboard.html');
                break;
            case 'USUARIO':
                window.location.replace('../html/investidor/resumo.html');
                break;
            default:
                redirecionarParaLogin();
        }
    }
    verificarPermissao();
})();

document.addEventListener('DOMContentLoaded', function () {
    function atualizarInfoUsuario() {
        const userInfo = AuthService.getUserInfo();
        if (!userInfo) return;

        const nomeElement = document.getElementById('nomeUsuario');
        const emailElement = document.getElementById('emailUsuario');
        const perfilElement = document.getElementById('perfilUsuario');

        if (nomeElement) nomeElement.textContent = userInfo.nome;
        if (emailElement) emailElement.textContent = userInfo.email;
        if (perfilElement) perfilElement.textContent = userInfo.perfil;
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => AuthService.logout());
    }

    atualizarInfoUsuario();
});