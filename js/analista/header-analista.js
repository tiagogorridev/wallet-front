document.addEventListener('DOMContentLoaded', () => {
    // Carrega header e inicializa funcionalidades
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

// Funções principais
function inicializar() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '../../index.html';
        });
    }
    
    const path = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href') || '';
        
        if (path.includes(href)) {
            item.classList.add('active');
        }
        
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Ativa dashboard se estiver na página inicial
    if ((path.endsWith('/') || path.endsWith('index.html')) && 
        !document.querySelector('.nav-item.active')) {
        const dashboard = document.querySelector('.nav-item:first-child');
        if (dashboard) dashboard.classList.add('active');
    }
}