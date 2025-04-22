// Executa verificação antes do carregamento completo da página
(function() {
    const API_URL = 'http://191.239.116.115:8080';
    
    // Verifica se o usuário está autenticado
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
    
    // Redireciona para página de login
    function redirecionarParaLogin() {
        window.location.replace('/html/login.html');
    }
    
    // Verifica permissões baseado no tipo de página
    function verificarPermissao() {
        const auth = verificarAutenticacao();
        if (!auth) return;
        
        const paginaAtual = window.location.pathname;
        
        // Verifica se é uma página de administrador
        const ehPaginaAdmin = paginaAtual.includes('/administrador/') || paginaAtual.includes('/analista/');
        
        // Verifica se é uma página de usuário/investidor
        const ehPaginaUsuario = paginaAtual.includes('/investidor/') || paginaAtual.includes('/usuario/');
        
        // Verifica se é a página de login (permitido para todos)
        const ehPaginaLogin = paginaAtual.includes('/login.html');
        
        // Apenas admin e analista podem acessar páginas de admin
        if (ehPaginaAdmin && auth.perfil !== 'ADMIN' && auth.perfil !== 'ANALISTA') {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        // Apenas usuários investidores podem acessar páginas de usuário/investidor
        if (ehPaginaUsuario && (auth.perfil === 'ADMIN' || auth.perfil === 'ANALISTA' || 
            (auth.perfil !== 'USUARIO' && auth.perfil !== 'CONSERVADOR' && 
             auth.perfil !== 'MODERADO' && auth.perfil !== 'ARROJADO'))) {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        // Se não estiver em nenhuma página específica, redireciona para a página correta
        if (!ehPaginaAdmin && !ehPaginaUsuario && !ehPaginaLogin) {
            redirecionarUsuarioPorPerfil(auth.perfil);
            return false;
        }
        
        return true;
    }
    
    // Redireciona o usuário para a página correta baseado no perfil
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
    
    // Executa verificação imediatamente
    verificarPermissao();
})();

// Após a página carregar, adiciona funcionalidades adicionais
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está autenticado
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
    
    // Atualiza informações do usuário na página, se existirem elementos para isso
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
    
    // Função para logout
    function logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        window.location.replace('/html/login.html');
    }
    
    // Adiciona o evento de logout se existir um botão de logout na página
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Atualiza informações do usuário na página
    atualizarInfoUsuario();
});