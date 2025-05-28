document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://191.239.116.115:8080';
    const token = localStorage.getItem('accessToken');

    // Carrega header
    const header = document.getElementById('header');
    if (header) {
        fetch('../../html/investidor/header.html')
            .then(r => r.text())
            .then(html => {
                header.innerHTML = html;
                init();
            })
            .catch(() => init());
    } else {
        init();
    }

    function init() {
        // Inicializa componentes
        marcaPaginaAtiva();
        atualizaResumoInvestimentos();
        inicializaDropdownCarteiras();
        configuraFormularioCarteira();
        configuraLogout();
        inicializaMenuMobile();
    }

    function inicializaMenuMobile() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const closeMobileMenu = document.querySelector('.close-mobile-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        const body = document.body;

        if (!mobileMenuBtn || !closeMobileMenu || !mobileMenu) return;

        let scrollPosition = 0;

        // Função para abrir o menu mobile
        function openMobileMenu() {
            scrollPosition = window.scrollY;
            mobileMenu.classList.add('active');
            body.classList.add('menu-open');
            body.style.top = `-${scrollPosition}px`;
        }

        // Função para fechar o menu mobile
        function closeMobileMenuHandler() {
            mobileMenu.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.top = '';
            window.scrollTo(0, scrollPosition);
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

    function configuraLogout() {
        // Configura logout para desktop e mobile
        const btnLogout = document.getElementById('logoutBtn');
        const btnMobileLogout = document.getElementById('mobileLogoutBtn');

        const handleLogout = () => {
            localStorage.clear();
            window.location.href = '../../index.html';
        };

        if (btnLogout) {
            btnLogout.onclick = handleLogout;
        }

        if (btnMobileLogout) {
            btnMobileLogout.onclick = handleLogout;
        }
    }

    function marcaPaginaAtiva() {
        // Marca menu ativo
        const path = window.location.pathname;
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href') || '';
            item.classList.toggle('active', path.includes(href));
        });

        if (!document.querySelector('.nav-item.active') &&
            (path.endsWith('/') || path.endsWith('index.html'))) {
            document.querySelector('.nav-item')?.classList.add('active');
        }
    }

    function atualizaResumoInvestimentos() {
        // Atualiza resumo financeiro
        const formataPorcentagem = (el, key) => {
            if (!el) return;
            const valor = parseFloat(localStorage.getItem(key) || '0');
            el.textContent = (valor >= 0 ? '+' : '') + valor + '%';
            el.className = 'summary-value ' + (valor >= 0 ? 'positive' : 'negative');
        };

        const patrimonio = document.querySelector('.summary-value:nth-of-type(1)');
        if (patrimonio) {
            patrimonio.textContent = localStorage.getItem('patrimonioTotal') || 'R$ 0,00';
        }

        formataPorcentagem(document.querySelector('.summary-value:nth-of-type(2)'), 'rentabilidade');
        formataPorcentagem(document.querySelector('.summary-value:nth-of-type(3)'), 'mesAtual');
    }

    function inicializaDropdownCarteiras() {
        // Setup dropdown carteiras
        const seletor = document.querySelector('.portfolio-selector');
        if (!seletor || seletor.querySelector('.portfolio-dropdown')) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'portfolio-dropdown';
        dropdown.style.display = 'none';

        const span = seletor.querySelector('span');
        const token = localStorage.getItem('accessToken');

        if (!token) {
            if (span) span.textContent = 'Carteira não encontrada';
            dropdown.innerHTML = '<div class="portfolio-option"><span>Faça login novamente</span></div>';
            seletor.appendChild(dropdown);
            return;
        }

        fetch(`${API}/wallets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(res => {
                if (res.error) throw new Error();

                const carteiras = res.data.data || [];
                const selectedId = parseInt(localStorage.getItem('selectedWalletId') || '0');

                let selecionada = carteiras.find(c => c.id === selectedId);
                if (!selecionada && carteiras.length) {
                    selecionada = carteiras[0];
                    localStorage.setItem('selectedPortfolio', selecionada.nome);
                    localStorage.setItem('selectedWalletId', selecionada.id.toString());
                }

                if (span) span.textContent = selecionada?.nome || 'Nova Carteira';

                // Limpa o dropdown antes de adicionar as opções
                dropdown.innerHTML = '';

                // Adiciona carteiras ao dropdown
                carteiras.forEach(c => {
                    const option = document.createElement('div');
                    option.className = 'portfolio-option';
                    option.innerHTML = `<span>${c.nome}</span><i class="fas fa-check ${c.id === selecionada?.id ? 'visible' : 'hidden'}"></i>`;
                    option.onclick = () => selecionaCarteira(c, option);
                    dropdown.appendChild(option);
                });

                // Opção Nova Carteira - Sempre adicionada
                const novaOpcao = document.createElement('div');
                novaOpcao.className = 'portfolio-option new-wallet-option';
                novaOpcao.innerHTML = '<span><i class="fas fa-plus"></i> Nova Carteira</span>';
                novaOpcao.onclick = e => {
                    e.stopPropagation();
                    const modal = document.getElementById('add-wallet-modal');
                    if (modal) {
                        modal.style.display = 'block';
                        dropdown.style.display = 'none';
                        toggleIconDropdown(false);
                    }
                };
                dropdown.appendChild(novaOpcao);

                if (!carteiras.length) {
                    const nenhumaOpcao = document.createElement('div');
                    nenhumaOpcao.className = 'portfolio-option';
                    nenhumaOpcao.innerHTML = '<span>Nenhuma carteira encontrada</span>';
                    dropdown.insertBefore(nenhumaOpcao, novaOpcao);
                }

                if (selecionada) {
                    document.dispatchEvent(new CustomEvent('portfolioChanged', {
                        detail: { portfolio: selecionada }
                    }));
                }
            })
            .catch(() => {
                if (span) span.textContent = 'Nova Carteira';

                // Limpa o dropdown antes de adicionar as opções
                dropdown.innerHTML = '';

                const erroOpcao = document.createElement('div');
                erroOpcao.className = 'portfolio-option';
                erroOpcao.innerHTML = '<span>Erro ao carregar carteiras</span>';
                dropdown.appendChild(erroOpcao);

                // Adiciona opção Nova Carteira mesmo em caso de erro
                const novaOpcao = document.createElement('div');
                novaOpcao.className = 'portfolio-option new-wallet-option';
                novaOpcao.innerHTML = '<span><i class="fas fa-plus"></i> Nova Carteira</span>';
                novaOpcao.onclick = e => {
                    e.stopPropagation();
                    const modal = document.getElementById('add-wallet-modal');
                    if (modal) {
                        modal.style.display = 'block';
                        dropdown.style.display = 'none';
                        toggleIconDropdown(false);
                    }
                };
                dropdown.appendChild(novaOpcao);
            })
            .finally(() => {
                seletor.appendChild(dropdown);
            });

        // Toggle dropdown
        seletor.onclick = e => {
            if (e.target.closest('.portfolio-option')) return;
            const visivel = dropdown.style.display === 'block';
            dropdown.style.display = visivel ? 'none' : 'block';
            toggleIconDropdown(!visivel);
        };

        document.addEventListener('click', e => {
            if (!seletor.contains(e.target)) {
                dropdown.style.display = 'none';
                toggleIconDropdown(false);
            }
        });
    }

    function selecionaCarteira(carteira, option) {
        // Seleciona carteira
        const span = document.querySelector('.portfolio-selector span');
        const dropdown = document.querySelector('.portfolio-dropdown');

        if (span) span.textContent = carteira.nome;
        if (dropdown) dropdown.style.display = 'none';

        toggleIconDropdown(false);
        localStorage.setItem('selectedPortfolio', carteira.nome);
        localStorage.setItem('selectedWalletId', carteira.id.toString());

        document.dispatchEvent(new CustomEvent('portfolioChanged', {
            detail: { portfolio: carteira }
        }));

        document.querySelectorAll('.portfolio-option i').forEach(i => {
            i.className = 'fas fa-check hidden';
        });

        const checkIcon = option.querySelector('i');
        if (checkIcon) checkIcon.classList.replace('hidden', 'visible');
    }

    function toggleIconDropdown(mostrarCima) {
        // Alterna ícone
        const icon = document.querySelector('.portfolio-selector i');
        if (icon) {
            icon.className = `fas fa-chevron-${mostrarCima ? 'up' : 'down'}`;
        }
    }

    function configuraFormularioCarteira() {
        // Setup modal nova carteira
        const modal = document.getElementById('add-wallet-modal');
        if (!modal) return;

        const btnFechar = modal.querySelector('.close-modal');
        if (btnFechar) btnFechar.onclick = () => modal.style.display = 'none';

        const form = document.getElementById('add-wallet-form');
        if (form) {
            form.onsubmit = e => {
                e.preventDefault();

                if (!token) {
                    alert('Você precisa estar logado para criar uma carteira');
                    return;
                }

                const nome = document.getElementById('wallet-name').value;
                const desc = document.getElementById('wallet-description').value;

                fetch(`${API}/wallets`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nome, descricao: desc })
                })
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(res => {
                        if (res.error) throw new Error(res.msg);

                        alert('Carteira criada com sucesso!');
                        modal.style.display = 'none';
                        form.reset();

                        // Força recarregamento do dropdown
                        const dropdown = document.querySelector('.portfolio-dropdown');
                        if (dropdown) dropdown.remove();
                        inicializaDropdownCarteiras();
                    })
                    .catch(err => alert('Erro ao criar carteira: ' + err.message));
            };
        }

        window.onclick = e => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }
});