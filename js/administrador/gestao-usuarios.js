// Configuração inicial
const API_URL = '191.239.116.115:8080';

// Variáveis globais de estado
let currentPage = 1;
let itemsPerPage = 8;
let users = [];
let currentUserInfo = null;
let userToDelete = null;
let userToEdit = null;

// Elementos DOM principais
const usersTableBody = document.getElementById('users-table-body');
const paginationStatus = document.getElementById('pagination-status');
const paginationButtons = document.getElementById('pagination-buttons');
const perPageSelect = document.getElementById('per-page-select');
const searchInput = document.getElementById('search-users');
const searchButton = document.querySelector('.search-btn');
const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
const editUserModal = document.getElementById('edit-user-modal');
const editUserForm = document.getElementById('edit-user-form');

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
    // Verificação de autenticação e autorização
    const token = localStorage.getItem('accessToken');
    currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || currentUserInfo.perfil !== 'ADMIN') {
        window.location.href = '../../index.html';
        return;
    }

    // Carrega a lista inicial de usuários
    fetchUsers();
    
    // Configuração dos event listeners
    setupEventListeners();
});

// Configura todos os event listeners
function setupEventListeners() {
    // Listener para alteração de itens por página
    perPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(perPageSelect.value);
        currentPage = 1;
        fetchUsers();
    });
    
    // Listeners para busca
    searchButton.addEventListener('click', () => {
        currentPage = 1;
        fetchUsers();
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            fetchUsers();
        }
    });

    // Listeners para modal de exclusão
    document.getElementById('confirm-delete').addEventListener('click', deleteUser);
    document.getElementById('cancel-delete').addEventListener('click', () => closeModal(deleteConfirmationModal));
    
    // Listeners para fechar modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal')));
    });
    
    // Listeners para modal de edição
    editUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateUser();
    });
    
    document.getElementById('cancel-edit').addEventListener('click', () => closeModal(editUserModal));
}

// Busca os usuários da API
async function fetchUsers() {
    const token = localStorage.getItem('accessToken');
    const searchTerm = searchInput.value.trim();
    
    try {
        // Mostra mensagem de carregamento
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Carregando usuários...</td></tr>';
        paginationStatus.textContent = 'Carregando...';
        
        // Faz requisição à API
        const response = await fetch(`http://${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Processa os dados recebidos
            users = data.data?.data || data.data || [];
            
            // Aplica o filtro de busca
            if (searchTerm) {
                users = users.filter(user => 
                    (user.nome && user.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.id && user.id.toString().includes(searchTerm))
                );
            }
            
            // Atualiza a interface
            displayUsers();
            updatePagination();
        } else {
            // Exibe mensagem de erro retornada pelo backend
            const errorMsg = data.msg || (data.errors && data.errors.length > 0 ? data.errors[0] : 'Falha ao obter usuários');
            usersTableBody.innerHTML = `<tr><td colspan="5" class="error-message">Erro: ${errorMsg}</td></tr>`;
            paginationStatus.textContent = 'Erro ao carregar usuários';
        }
    } catch (error) {
        // Trata erros de conexão
        usersTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Erro ao conectar ao servidor</td></tr>';
        paginationStatus.textContent = 'Erro de conexão';
    }
}

// Exibe os usuários na tabela
function displayUsers() {
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    // Calcula quais usuários exibir na página atual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, users.length);
    const displayedUsers = users.slice(startIndex, endIndex);
    
    usersTableBody.innerHTML = '';
    
    // Popula a tabela com os usuários
    displayedUsers.forEach(user => {
        const isCurrentUser = currentUserInfo && user.id === currentUserInfo.id;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.id || 'N/A'}</td>
            <td>${user.nome || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${getProfileDisplayName(user.perfil)}</td>
            <td class="actions-cell">
                <button class="edit-btn" data-id="${user.id}" title="Editar usuário">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete-btn ${isCurrentUser ? 'disabled' : ''}" 
                  data-id="${user.id}" 
                  title="${isCurrentUser ? 'Não é possível excluir seu próprio usuário' : 'Excluir usuário'}" 
                  ${isCurrentUser ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
    
    // Adiciona listeners aos botões de ação
    setupActionButtons();
}

// Converte o tipo de perfil para exibição
function getProfileDisplayName(profile) {
    const profiles = {
        'ADMIN': 'Administrador',
        'USUARIO': 'Investidor',
        'ANALISTA': 'Analista'
    };
    return profiles[profile] || profile || 'N/A';
}

// Configura os botões de ação para cada usuário
function setupActionButtons() {
    // Listeners para botões de exclusão
    document.querySelectorAll('.delete-btn:not(.disabled)').forEach(button => {
        button.addEventListener('click', () => {
            userToDelete = button.getAttribute('data-id');
            openModal(deleteConfirmationModal);
        });
    });
    
    // Listeners para botões de edição
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            openEditModal(button.getAttribute('data-id'));
        });
    });
}

// Atualiza a paginação
function updatePagination() {
    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalUsers);
    
    // Atualiza o texto de status
    paginationStatus.textContent = `Mostrando ${startItem} - ${endItem} de ${totalUsers} usuários`;
    paginationButtons.innerHTML = '';
    
    // Botão para página anterior
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn', 'prev-btn');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
            updatePagination();
        }
    });
    
    paginationButtons.appendChild(prevButton);
    
    // Botões de páginas
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons && startPage > 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pagination-btn', 'page-btn');
        
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayUsers();
            updatePagination();
        });
        
        paginationButtons.appendChild(pageButton);
    }
    
    // Botão para próxima página
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn', 'next-btn');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
            updatePagination();
        }
    });
    
    paginationButtons.appendChild(nextButton);
}

// Funções para manipulação de modais
function openModal(modal) {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Reset de campos e variáveis
        if (modal === editUserModal) {
            const idField = document.getElementById('edit-user-id');
            const emailField = document.getElementById('edit-user-email');
            if (idField.parentElement) idField.parentElement.classList.remove('input-readonly-container');
            if (emailField.parentElement) emailField.parentElement.classList.remove('input-readonly-container');
            userToEdit = null;
        } else if (modal === deleteConfirmationModal) {
            userToDelete = null;
        }
    }, 300);
}

// Abre o modal de edição e preenche com dados do usuário
function openEditModal(userId) {
    const user = users.find(u => u.id.toString() === userId.toString());
    
    if (!user) return;
    
    userToEdit = user;
    
    // Preenche os campos do formulário
    const idField = document.getElementById('edit-user-id');
    const emailField = document.getElementById('edit-user-email');
    const nameField = document.getElementById('edit-user-name');
    idField.value = user.id || '';
    nameField.value = user.nome || '';
    emailField.value = user.email || '';
    
    // Configura campos somente leitura
    idField.setAttribute('readonly', true);
    emailField.setAttribute('readonly', true);
    idField.title = "ID não pode ser alterado";
    emailField.title = "Email não pode ser alterado";
    if (idField.parentElement) idField.parentElement.classList.add('input-readonly-container');
    if (emailField.parentElement) emailField.parentElement.classList.add('input-readonly-container');
    
    openModal(editUserModal);
}

// Atualiza os dados do usuário
async function updateUser() {
    if (!userToEdit) return;
    
    const token = localStorage.getItem('accessToken');
    const userId = document.getElementById('edit-user-id').value;
    const nome = document.getElementById('edit-user-name').value;
    
    // Validação básica
    if (!nome || nome.trim() === '') {
        alert('O nome do usuário não pode ser vazio.');
        return;
    }
    
    try {
        const userObj = {
            id: parseInt(userId),
            nome: nome
        };
        
        // Envia requisição de atualização
        const response = await fetch(`http://${API_URL}/users`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userObj)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeModal(editUserModal);
            fetchUsers();
            alert('Usuário atualizado com sucesso!');
        } else {
            // Trata erros do backend
            const errorMsg = data.msg || 
                (data.errors && data.errors.length > 0 ? data.errors.join(', ') : 'Falha na operação');
            alert(`Erro ao atualizar usuário: ${errorMsg}`);
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
}

// Exclui um usuário
async function deleteUser() {
    if (!userToDelete) return;
    
    const token = localStorage.getItem('accessToken');
    
    try {
        // Envia requisição de exclusão
        const response = await fetch(`http://${API_URL}/users?id=${userToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeModal(deleteConfirmationModal);
            fetchUsers();
            alert('Usuário excluído com sucesso!');
        } else {
            // Trata erros do backend
            const errorMsg = data.msg || 
                (data.errors && data.errors.length > 0 ? data.errors.join(', ') : 'Falha na operação');
            alert(`Erro ao excluir usuário: ${errorMsg}`);
        }
    } catch (error) {
        alert('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
}