document.addEventListener('DOMContentLoaded', function() {
    function checkAuthAndPermission() {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.log('Usuário não autenticado. Redirecionando para login...');
            window.location.href = '/login.html';
            return;
        }
        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
            console.log('Informações do usuário não encontradas. Redirecionando para login...');
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
            return;
        }
        try {
            const userInfo = JSON.parse(userInfoString);
            const perfil = userInfo.perfil;
            const currentPath = window.location.pathname.toLowerCase();
            
            if (perfil === 'USUARIO') {
                if (!currentPath.includes('/investidor/') && !currentPath.includes('/common/')) {
                    console.log('Acesso negado: Usuários comuns só podem acessar páginas de investidor');
                    window.location.href = '/investidor/carteira-resumo/resumo.html';
                }
            } else if (perfil === 'ADMIN' || perfil === 'ANALISTA') {
                if (!currentPath.includes('/administrador/') && !currentPath.includes('/common/')) {
                    console.log('Acesso negado: Administradores só podem acessar páginas de administrador');
                    if (perfil === 'ADMIN') {
                        window.location.href = '/administrador/dashboard/dashboard.html';
                    } else {
                        window.location.href = '/administrador/resumo-administrador.html';
                    }
                }
            } else {
                console.log('Perfil desconhecido. Redirecionando para login...');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('userInfo');
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/login.html';
        }
    }
    window.performLogout = function() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login.html';
    }
    checkAuthAndPermission();
});