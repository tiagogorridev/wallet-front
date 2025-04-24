(function() {
    const API_URL = 'http://191.239.116.115:8080';
    
    function verificarAutenticacao() {
        const token = localStorage.getItem('accessToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (!token || !userInfo) {
            redirecionarParaLogin();
            return false;
        }
        
        try {
            const user = JSON.parse(userInfo);
            return {
                autenticado: true,
                perfil: user.perfil,
                nome: user.nome,
                email: user.email
            };
        } catch (error) {
            console.error('Erro ao processar informações do usuário');
            redirecionarParaLogin();
            return false;
        }
    }
    
    function redirecionarParaLogin() {
        window.location.replace('../../index.html');
    }
    
    function verificarPermissao() {
        const auth = verificarAutenticacao();
        if (!auth) return;
        
        const paginaAtual = window.location.pathname;
        const ehPaginaAdmin = paginaAtual.includes('/administrador/') || paginaAtual.includes('/analista/');
        const ehPaginaUsuario = paginaAtual.includes('/investidor/') || paginaAtual.includes('/usuario/');
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
        switch(perfil) {
            case 'ADMIN':
            case 'ANALISTA':
                window.location.replace('/html/administrador/dashboard.html');
                break;
            case 'USUARIO':
            case 'CONSERVADOR':
            case 'MODERADO':
            case 'ARROJADO':
                window.location.replace('/html/investidor/resumo.html');
                break;
            default:
                redirecionarParaLogin();
        }
    }
    verificarPermissao();
})();

document.addEventListener('DOMContentLoaded', function() {
    function verificarAutenticacao() {
        const token = localStorage.getItem('accessToken');
        const userInfo = localStorage.getItem('userInfo');
        
        if (!token || !userInfo) {
            return false;
        }
        
        try {
            const user = JSON.parse(userInfo);
            return {
                autenticado: true,
                perfil: user.perfil,
                nome: user.nome,
                email: user.email
            };
        } catch (error) {
            return false;
        }
    }
    
    function atualizarInfoUsuario() {
        const auth = verificarAutenticacao();
        if (!auth) return;
        
        const nomeElement = document.getElementById('nomeUsuario');
        const emailElement = document.getElementById('emailUsuario');
        const perfilElement = document.getElementById('perfilUsuario');
        
        if (nomeElement) nomeElement.textContent = auth.nome;
        if (emailElement) emailElement.textContent = auth.email;
        if (perfilElement) perfilElement.textContent = auth.perfil;
    }
    
    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        window.location.replace('../../index.html');
    }
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    atualizarInfoUsuario();
});