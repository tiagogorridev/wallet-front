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

        // Garante que o refresh token está ativo
        AuthService.startRefreshToken();

        return {
            autenticado: true,
            perfil: userInfo.perfil,
            nome: userInfo.nome,
            email: userInfo.email
        };
    }

    function redirecionarParaLogin() {
        // Usa replace para evitar problemas com o botão de voltar do navegador
        window.location.replace('../../index.html');
    }

    function verificarPermissao() {
        const auth = verificarAutenticacao();
        if (!auth) return;

        const paginaAtual = window.location.pathname;
        const ehPaginaAdmin = paginaAtual.includes('/administrador/');
        const ehPaginaAnalista = paginaAtual.includes('/analista/');
        const ehPaginaInvestidor = paginaAtual.includes('/investidor/');
        const ehPaginaLogin = paginaAtual.includes('index.html');
        
        // Regra 1: Apenas ADMIN pode acessar páginas de administrador
        if (ehPaginaAdmin && auth.perfil !== 'ADMIN') {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        // Regra 2: Apenas ANALISTA pode acessar páginas de analista
        if (ehPaginaAnalista && auth.perfil !== 'ANALISTA') {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        // Regra 3: Apenas USUARIO pode acessar páginas de investidor
        if (ehPaginaInvestidor && auth.perfil !== 'USUARIO') {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        // Se estiver em uma página que não corresponde ao seu perfil e não é a página de login
        if (!ehPaginaLogin && 
            ((auth.perfil === 'ADMIN' && !ehPaginaAdmin) || 
             (auth.perfil === 'ANALISTA' && !ehPaginaAnalista) || 
             (auth.perfil === 'USUARIO' && !ehPaginaInvestidor))) {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }

        return true;
    }

    function redirecionarUsuarioPorPerfil(perfil) {
        switch (perfil) {
            case 'ADMIN':
                window.location.replace('../administrador/dashboard.html');
                break;
            case 'ANALISTA':
                window.location.replace('../analista/dashboard-analista.html');
                break;
            case 'USUARIO':
                window.location.replace('../investidor/resumo.html');
                break;
            default:
                redirecionarParaLogin();
        }
    }
    
    // Executa verificação ao carregar a página
    verificarPermissao();
    
    // Adiciona listener para eventos de atualização de token
    window.addEventListener('tokenRefreshed', () => {
        console.log('Token atualizado, verificando permissões');
        verificarPermissao();
    });
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

    // Atualiza informações do usuário
    atualizarInfoUsuario();
    
    // Registra listener para atualizar informações quando o token for atualizado
    window.addEventListener('tokenRefreshed', atualizarInfoUsuario);
});