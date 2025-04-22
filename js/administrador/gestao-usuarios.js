const API_URL = '191.239.116.115:8080';

let currentPage = 1;
let itemsPerPage = 8;
let totalUsers = 0;
let users = [];

const usersTableBody = document.getElementById('users-table-body');
const paginationStatus = document.getElementById('pagination-status');
const paginationButtons = document.getElementById('pagination-buttons');
const perPageSelect = document.getElementById('per-page-select');
const searchInput = document.getElementById('search-users');
const searchButton = document.querySelector('.search-btn');

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('accessToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || userInfo.perfil !== 'ADMIN') {
        window.location.href = '/html/auth/login.html';
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
});

async function fetchUsers() {
    const token = localStorage.getItem('accessToken');
    const searchTerm = searchInput.value.trim();
    
    try {
        usersTableBody.innerHTML = '<tr><td colspan="4" class="loading-message">Carregando usuários...</td></tr>';
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
            usersTableBody.innerHTML = `<tr><td colspan="4" class="error-message">Erro: ${data.msg || 'Falha ao obter usuários'}</td></tr>`;
            paginationStatus.textContent = 'Erro ao carregar usuários';
        }
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        usersTableBody.innerHTML = '<tr><td colspan="4" class="error-message">Erro ao conectar ao servidor</td></tr>';
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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="user-select" data-id="${user.id}"></td>
            <td>${user.id || 'N/A'}</td>
            <td>${user.nome || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td class="actions-cell">
                <button class="delete-btn" data-id="${user.id}" title="Excluir usuário">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            showDeleteConfirmation(userId);
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
document.getElementById('select-all').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.user-select');
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});