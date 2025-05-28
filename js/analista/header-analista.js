document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header-analista');
    if (header) {
        fetch('../../html/analista/header-analista.html')
            .then(response => response.ok ? response.text() : Promise.reject())
            .then(data => {
                header.innerHTML = data;
                inicializar();
            })
            .catch(() => console.error('Erro ao carregar header'));
    } else {
        inicializar();
    }
});

function inicializar() {
    // Configurar menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const closeMobileMenu = document.querySelector('.close-mobile-menu');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (closeMobileMenu && mobileMenu) {
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '../../index.html'; // ou '../auth/login.html'
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

    // Navegação ativa (seu código existente)
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href') || '';

        if (path.includes(href)) {
            item.classList.add('active');
        }

        item.addEventListener('click', function () {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if ((path.endsWith('/') || path.endsWith('index.html')) &&
        !document.querySelector('.nav-item.active')) {
        const dashboard = document.querySelector('.nav-item:first-child');
        if (dashboard) dashboard.classList.add('active');
    }
}