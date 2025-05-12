const API_URL = '191.239.116.115:8080';

let currentPage = 1;
let itemsPerPage = 8;
let totalUsers = 0;
let users = [];
let currentUserInfo = null;
let userToDelete = null;
let userToEdit = null;

const usersTableBody = document.getElementById('users-table-body');
const paginationStatus = document.getElementById('pagination-status');
const paginationButtons = document.getElementById('pagination-buttons');
const perPageSelect = document.getElementById('per-page-select');
const searchInput = document.getElementById('search-users');
const searchButton = document.querySelector('.search-btn');
const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
const editUserModal = document.getElementById('edit-user-modal');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');
const closeModalButtons = document.querySelectorAll('.close-modal');
const editUserForm = document.getElementById('edit-user-form');
const cancelEditButton = document.getElementById('cancel-edit');

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || currentUserInfo.perfil !== 'ADMIN') {
        window.location.href = '../../index.html';
        return;
    }

    fetchUsers();
    
    perPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(perPageSelect.value);
        currentPage = 1;
        fetchUsers();
    });
    
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

    document.getElementById('select-all').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.user-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    confirmDeleteButton.addEventListener('click', deleteUser);
    
    cancelDeleteButton.addEventListener('click', () => {
        closeModal(deleteConfirmationModal);
        userToDelete = null;
    });
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
            if (modal === deleteConfirmationModal) {
                userToDelete = null;
            } else if (modal === editUserModal) {
                userToEdit = null;
            }
        });
    });
    
    editUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updateUser();
    });
    
    cancelEditButton.addEventListener('click', () => {
        closeModal(editUserModal);
        userToEdit = null;
    });
});

async function fetchUsers() {
    const token = localStorage.getItem('accessToken');
    const searchTerm = searchInput.value.trim();
    
    try {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="loading-message">Carregando usuários...</td></tr>';
        paginationStatus.textContent = 'Carregando...';
        
        const response = await fetch(`http://${API_URL}/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.data && data.data.data) {
                users = data.data.data;
            } else if (data.data) {
                users = data.data;
            } else {
                users = [];
            }
            
            if (searchTerm) {
                users = users.filter(user => 
                    (user.nome && user.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.id && user.id.toString().includes(searchTerm))
                );
            }
            
            totalUsers = users.length;
            displayUsers();
            updatePagination();
        } else {
            usersTableBody.innerHTML = `<tr><td colspan="5" class="error-message">Erro: ${data.msg || 'Falha ao obter usuários'}</td></tr>`;
            paginationStatus.textContent = 'Erro ao carregar usuários';
        }
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        usersTableBody.innerHTML = '<tr><td colspan="5" class="error-message">Erro ao conectar ao servidor</td></tr>';
        paginationStatus.textContent = 'Erro de conexão';
    }
}

function displayUsers() {
    if (users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="empty-message">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, users.length);
    const displayedUsers = users.slice(startIndex, endIndex);
    
    usersTableBody.innerHTML = '';
    
    displayedUsers.forEach(user => {
        const isCurrentUser = currentUserInfo && user.id === currentUserInfo.id;
        const row = document.createElement('tr');
        
        // Função para converter o tipo de perfil para exibição
        function getProfileDisplayName(profile) {
            switch(profile) {
                case 'ADMIN':
                    return 'ADMINISTRADOR';
                case 'USER':
                    return 'INVESTIDOR';
                case 'ANALYST':
                    return 'ANALISTA';
                default:
                    return profile || 'N/A';
            }
        }

        row.innerHTML = `
            <td><input type="checkbox" class="user-select" data-id="${user.id}"></td>
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
    
    document.querySelectorAll('.delete-btn:not(.disabled)').forEach(button => {
        button.addEventListener('click', (e) => {
            userToDelete = e.currentTarget.getAttribute('data-id');
            openModal(deleteConfirmationModal);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            openEditModal(userId);
        });
    });
}

function updatePagination() {
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalUsers);
    
    paginationStatus.textContent = `Mostrando ${startItem} - ${endItem} de ${totalUsers} usuários`;
    paginationButtons.innerHTML = '';
    
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

function openModal(modal) {
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal(modal) {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        if (modal === editUserModal) {
            resetEditModalFields();
        }
    }, 300);
}

function resetEditModalFields() {
    const idField = document.getElementById('edit-user-id');
    const emailField = document.getElementById('edit-user-email');
    if (idField.parentElement) idField.parentElement.classList.remove('input-readonly-container');
    if (emailField.parentElement) emailField.parentElement.classList.remove('input-readonly-container');
}

function openEditModal(userId) {
    const user = users.find(u => u.id.toString() === userId.toString());
    
    if (!user) return;
    
    userToEdit = user;
    
    const idField = document.getElementById('edit-user-id');
    const emailField = document.getElementById('edit-user-email');
    const nameField = document.getElementById('edit-user-name');
    idField.value = user.id || '';
    nameField.value = user.nome || '';
    emailField.value = user.email || '';
    idField.setAttribute('readonly', true);
    emailField.setAttribute('readonly', true);
    idField.title = "ID não pode ser alterado";
    emailField.title = "Email não pode ser alterado";
    if (idField.parentElement) idField.parentElement.classList.add('input-readonly-container');
    if (emailField.parentElement) emailField.parentElement.classList.add('input-readonly-container');
    
    openModal(editUserModal);
}

async function updateUser() {
    if (!userToEdit) return;
    
    const token = localStorage.getItem('accessToken');
    const userId = document.getElementById('edit-user-id').value;
    const nome = document.getElementById('edit-user-name').value;
    const email = document.getElementById('edit-user-email').value;
    
    if (!nome || nome.trim() === '') {
        alert('O nome do usuário não pode ser vazio.');
        return;
    }
    
    try {
        const userObj = {
            id: parseInt(userId),
            nome: nome
        };
        
        console.log('Enviando dados para atualização:', userObj);
        
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
            userToEdit = null;
            fetchUsers();
            alert('Usuário atualizado com sucesso!');
        } else {
            console.error('Resposta de erro:', data);
            alert(`Erro ao atualizar usuário: ${data.msg || 'Falha na operação'}`);
        }
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        alert('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    }
}

async function deleteUser() {
    if (!userToDelete) return;
    
    const token = localStorage.getItem('accessToken');
    
    try {
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
            userToDelete = null;
            fetchUsers();
            alert('Usuário excluído com sucesso!');
        } else {
            alert(`Erro ao excluir usuário: ${data.msg || 'Falha na operação'}`);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao conectar ao servidor. Tente novamente mais tarde.');
    } finally {
        closeModal(deleteConfirmationModal);
    }
}