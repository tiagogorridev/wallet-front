document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('admin-header');
    if (headerContainer) {
        // Tenta carregar o cabeçalho com tratamento de erro embutido
        fetch('../../html/administrador/header-adm.html')
            .then(response => response.ok ? response.text() : Promise.reject())
            .then(data => {
                headerContainer.innerHTML = data;
                initializeHeader();
            })
            .catch(() => {
                // Tenta caminho alternativo
                fetch('../../html/administrador/header-adm.html')
                    .then(response => response.text())
                    .then(data => {
                        headerContainer.innerHTML = data;
                        initializeHeader();
                    })
                    .catch(err => console.error('Falha ao carregar o cabeçalho:', err));
            });
    } else {
        initializeHeader();
    }
});

// Inicializa as funcionalidades do cabeçalho
function initializeHeader() {
    // Configura o botão de logout
    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../../index.html';
        });
    }
    
    // Marca a página ativa e configura eventos de navegação
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    let activeFound = false;
    
    navItems.forEach(item => {
        // Remove eventos antigos e adiciona novos
        item.removeEventListener('click', navClickHandler);
        item.addEventListener('click', navClickHandler);
        
        // Verifica se este item deve estar ativo
        const href = item.getAttribute('href') || '';
        item.classList.remove('active');
        
        const hrefParts = href.split('/');
        const pathParts = currentPath.split('/');
        
        if (currentPath.includes(href) || 
            pathParts[pathParts.length - 1].includes(hrefParts[hrefParts.length - 1]) || 
            pathParts[pathParts.length - 2].includes(hrefParts[hrefParts.length - 2])) {
            item.classList.add('active');
            activeFound = true;
        }
    });
    
    // Define o dashboard como ativo padrão se necessário
    if (!activeFound && (currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
        const dashboardItem = document.querySelector('.nav-item:first-child');
        if (dashboardItem) dashboardItem.classList.add('active');
    }
}

// Manipulador de cliques na navegação
function navClickHandler() {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    this.classList.add('active');
}