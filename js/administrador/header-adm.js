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
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../../index.html';
    };

    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (mobileMenuBtn && closeMobileMenu && mobileMenu) {
        // Função para abrir o menu mobile
        function openMobileMenu() {
            mobileMenu.classList.add('active');
            body.classList.add('menu-open');
            // Salva a posição atual do scroll
            const scrollY = window.scrollY;
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
        }

        // Função para fechar o menu mobile
        function closeMobileMenuHandler() {
            mobileMenu.classList.remove('active');
            body.classList.remove('menu-open');
            // Restaura a posição do scroll
            const scrollY = body.style.top;
            body.style.position = '';
            body.style.top = '';
            body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        // Event listeners
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        closeMobileMenu.addEventListener('click', closeMobileMenuHandler);

        // Fechar menu ao clicar em um item
        const mobileMenuItems = document.querySelectorAll('.mobile-menu-items .nav-item');
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', closeMobileMenuHandler);
        });

        // Fechar menu ao clicar fora
        mobileMenu.addEventListener('click', function (e) {
            if (e.target === mobileMenu) {
                closeMobileMenuHandler();
            }
        });

        // Fechar menu ao pressionar ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenuHandler();
            }
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