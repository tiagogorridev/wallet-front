document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = 'http://localhost:3000';  // ajuste a porta/host se necessário

    // Estado da aplicação
    let users = [];
    let currentPortfolioUserId = null;
    const currentPrices = {
        'PETR4': 32.40, /* … */ 'DEFAULT': 25.00
    };

    // DOM shortcuts
    const editUserModal       = document.getElementById('editUserModal');
    const userPortfolioModal  = document.getElementById('userPortfolioModal');
    const addAssetModal       = document.getElementById('addAssetModal');
    const editAssetModal      = document.getElementById('editAssetModal');
    const deleteConfirmModal  = document.getElementById('deleteConfirmModal');
    const usersTableBody      = document.querySelector('#usersTable tbody');
    const editUserForm        = document.getElementById('editUserForm');
    const addAssetForm        = document.getElementById('addAssetForm');
    const editAssetForm       = document.getElementById('editAssetForm');
    const closeModalButtons   = document.querySelectorAll('.close-modal');
    const addAssetBtn         = document.getElementById('addAssetBtn');
    const cancelDeleteBtn     = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn    = document.getElementById('confirmDeleteBtn');
    const configUserBtn       = document.getElementById('configUserBtn');

    // 1) Carrega lista de usuários do back
    async function fetchUsers() {
        try {
            const res = await fetch(`${API_BASE}/users`);
            users = await res.json();
            displayUsers();
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            alert('Não foi possível carregar usuários.');
        }
    }

    // 2) Mostra usuários na tabela
    function displayUsers() {
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            let statusClass = {
                ativo:    'status-active',
                inativo:  'status-inactive',
                pendente: 'status-pending'
            }[user.status] || '';
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.registerDate}</td>
                <td><span class="user-status ${statusClass}">${user.status}</span></td>
                <td>${user.lastAccess}</td>
                <td>
                    <button class="action-button edit-button"      data-id="${user.id}">Editar</button>
                    <button class="action-button portfolio-button" data-id="${user.id}">Ver Carteira</button>
                </td>`;
            usersTableBody.appendChild(row);
        });
        document.querySelectorAll('.edit-button').forEach(b => b.onclick = () => openEditUserModal(b.dataset.id));
        document.querySelectorAll('.portfolio-button').forEach(b => b.onclick = () => openUserPortfolioModal(b.dataset.id));
    }

    // 3) Edição de usuário
    function openEditUserModal(id) {
        const u = users.find(x => x.id == id);
        if (!u) return;
        document.getElementById('userId').value     = u.id;
        document.getElementById('userName').value   = u.name;
        document.getElementById('userEmail').value  = u.email;
        document.getElementById('userStatus').value = u.status;
        editUserModal.style.display = 'block';
    }
    async function saveUserChanges(e) {
        e.preventDefault();
        const id     = document.getElementById('userId').value;
        const payload = {
            name:   document.getElementById('userName').value,
            email:  document.getElementById('userEmail').value,
            status: document.getElementById('userStatus').value
        };
        try {
            const res = await fetch(`${API_BASE}/users/${id}`, {
                method:'PUT',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(res.statusText);
            const updated = await res.json();
            const idx = users.findIndex(u => u.id == id);
            users[idx] = { ...users[idx], ...updated };
            displayUsers();
            closeAllModals();
            alert('Usuário atualizado com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar usuário.');
        }
    }

    // 4) Carteira de usuário
    async function openUserPortfolioModal(id) {
        currentPortfolioUserId = id;
        const u = users.find(x => x.id == id);
        document.getElementById('portfolioUserName').textContent = u.name;
        try {
            const res = await fetch(`${API_BASE}/users/${id}/portfolio`);
            const data = await res.json();
            u.portfolio = data.assets || [];
        } catch (err) {
            console.warn('não carregou portfolio, usando vazio', err);
            u.portfolio = [];
        }
        updatePortfolioDisplay(u);
        userPortfolioModal.style.display = 'block';
    }

    // 5) Renderiza tabela de ativos
    function updatePortfolioDisplay(user) {
        const tbody = document.querySelector('#portfolioTable tbody');
        tbody.innerHTML = '';
        let totalInvested = 0, totalCurrent = 0;

        if (!user.portfolio.length) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Nenhum ativo na carteira</td></tr>`;
        } else {
            user.portfolio.forEach((a,i) => {
                const invested = a.quantity * a.avgPrice;
                const current  = a.quantity * (a.currentPrice ?? currentPrices[a.asset] ?? currentPrices.DEFAULT);
                const diff     = current - invested;
                const pct      = invested ? diff/invested*100 : 0;
                totalInvested += invested;
                totalCurrent  += current;
                const clsNum   = diff>=0 ? 'positive' : 'negative';
                tbody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td>${a.asset}</td>
                        <td>${a.quantity}</td>
                        <td>R$ ${a.avgPrice.toFixed(2)}</td>
                        <td>R$ ${invested.toFixed(2)}</td>
                        <td>R$ ${current.toFixed(2)}</td>
                        <td class="${clsNum}">R$ ${diff.toFixed(2)}</td>
                        <td class="${clsNum}">${pct.toFixed(2)}%</td>
                        <td>
                            <button class="edit-asset-button"   data-idx="${i}">✏️</button>
                            <button class="delete-asset-button" data-idx="${i}">🗑️</button>
                        </td>
                    </tr>`);
            });
        }
        // summary
        const totalReturn = totalCurrent - totalInvested;
        const totalPct    = totalInvested ? totalReturn/totalInvested*100 : 0;
        document.getElementById('totalInvested').textContent  = `R$ ${totalInvested.toFixed(2)}`;
        document.getElementById('totalReturn').textContent    = `R$ ${totalReturn.toFixed(2)}`;
        document.getElementById('totalReturn').className      = totalReturn>=0?'positive':'negative';
        document.getElementById('totalVariation').textContent = `${totalPct.toFixed(2)}%`;
        document.getElementById('totalVariation').className   = totalPct>=0?'positive':'negative';

        // bind asset buttons
        document.querySelectorAll('.edit-asset-button').forEach(b => b.onclick = () => openEditAssetModal(user.id, b.dataset.idx));
        document.querySelectorAll('.delete-asset-button').forEach(b => b.onclick = () => openDeleteConfirmModal(user.id, b.dataset.idx));
    }

    // 6) CRUD de ativos via API
    function openAddAssetModal() {
        document.getElementById('portfolioUserId').value = currentPortfolioUserId;
        addAssetModal.style.display = 'block';
    }
    async function addAssetToPortfolio(e) {
        e.preventDefault();
        const userId = currentPortfolioUserId;
        const asset  = {
            asset:    document.getElementById('assetSymbol').value.toUpperCase(),
            quantity: +document.getElementById('assetQuantity').value,
            avgPrice: +document.getElementById('assetAvgPrice').value
        };
        try {
            const res = await fetch(`${API_BASE}/users/${userId}/portfolio`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(asset)
            });
            if (!res.ok) throw new Error();
            await openUserPortfolioModal(userId);
            closeAllModals();
            alert('Ativo adicionado com sucesso!');
        } catch {
            alert('Erro ao adicionar ativo.');
        }
    }

    function openEditAssetModal(userId, idx) {
        const a = users.find(u => u.id==userId).portfolio[idx];
        document.getElementById('editPortfolioUserId').value = userId;
        document.getElementById('editAssetIndex').value       = idx;
        document.getElementById('editAssetSymbol').value      = a.asset;
        document.getElementById('editAssetQuantity').value    = a.quantity;
        document.getElementById('editAssetAvgPrice').value    = a.avgPrice;
        editAssetModal.style.display = 'block';
    }
    async function editAssetInPortfolio(e) {
        e.preventDefault();
        const userId = +document.getElementById('editPortfolioUserId').value;
        const idx    = +document.getElementById('editAssetIndex').value;
        const symbol = document.getElementById('editAssetSymbol').value.toUpperCase();
        const body   = {
            quantity: +document.getElementById('editAssetQuantity').value,
            avgPrice: +document.getElementById('editAssetAvgPrice').value
        };
        try {
            const res = await fetch(
                `${API_BASE}/users/${userId}/portfolio/${symbol}`,
                {
                    method:'PUT',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify(body)
                }
            );
            if (!res.ok) throw new Error();
            await openUserPortfolioModal(userId);
            closeAllModals();
            alert('Ativo atualizado com sucesso!');
        } catch {
            alert('Erro ao atualizar ativo.');
        }
    }

    function openDeleteConfirmModal(userId, idx) {
        document.getElementById('deleteUserId').value      = userId;
        document.getElementById('deleteAssetIndex').value = idx;
        deleteConfirmModal.style.display = 'block';
    }
    async function deleteAssetFromPortfolio() {
        const userId = +document.getElementById('deleteUserId').value;
        const idx    = +document.getElementById('deleteAssetIndex').value;
        const symbol = users.find(u => u.id==userId).portfolio[idx].asset;
        try {
            const res = await fetch(
                `${API_BASE}/users/${userId}/portfolio/${symbol}`,
                { method:'DELETE' }
            );
            if (!res.ok) throw new Error();
            await openUserPortfolioModal(userId);
            closeAllModals();
            alert('Ativo removido com sucesso!');
        } catch {
            alert('Erro ao remover ativo.');
        }
    }

    // 7) Helpers
    function closeAllModals() {
        [editUserModal,userPortfolioModal,addAssetModal,editAssetModal,deleteConfirmModal]
            .forEach(m => m.style.display = 'none');
    }

    // 8) Bindings
    closeModalButtons.forEach(b => b.onclick = closeAllModals);
    addAssetBtn      .onclick = openAddAssetModal;
    configUserBtn    .onclick = () => alert('Configurações em desenvolvimento');
    editUserForm     .addEventListener('submit', saveUserChanges);
    addAssetForm     .addEventListener('submit', addAssetToPortfolio);
    editAssetForm    .addEventListener('submit', editAssetInPortfolio);
    cancelDeleteBtn  .onclick = closeAllModals;
    confirmDeleteBtn .onclick = deleteAssetFromPortfolio;
    window.addEventListener('click', e => {
        if ([editUserModal,userPortfolioModal,addAssetModal,editAssetModal,deleteConfirmModal]
            .includes(e.target)) closeAllModals();
    });

    // Inicialização
    fetchUsers();
});
