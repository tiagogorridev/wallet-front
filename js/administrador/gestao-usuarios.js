const API_URL = "191.239.116.115:8080";
let currentPage = 1,
  itemsPerPage = 8,
  users = [],
  currentUserInfo = null,
  userToDelete = null,
  userToEdit = null;

// Elementos DOM
const elements = {
  tbody: document.getElementById("users-table-body"),
  status: document.getElementById("pagination-status"),
  buttons: document.getElementById("pagination-buttons"),
  perPage: document.getElementById("per-page-select"),
  search: document.getElementById("search-users"),
  deleteModal: document.getElementById("delete-confirmation-modal"),
  editModal: document.getElementById("edit-user-modal"),
  editForm: document.getElementById("edit-user-form"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  currentUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  if (!token || currentUserInfo.perfil !== "ADMIN") {
    window.location.href = "../../index.html";
    return;
  }

  fetchUsers();
  setupEvents();
});

// Event Listeners
function setupEvents() {
  elements.perPage.onchange = () => {
    itemsPerPage = parseInt(elements.perPage.value);
    currentPage = 1;
    fetchUsers();
  };
  elements.search.onkeypress = (e) =>
    e.key === "Enter" && ((currentPage = 1), fetchUsers());
  document.querySelector(".search-btn").onclick = () => (
    (currentPage = 1), fetchUsers()
  );

  document.getElementById("confirm-delete").onclick = deleteUser;
  document.getElementById("cancel-delete").onclick = () =>
    closeModal(elements.deleteModal);
  document.getElementById("cancel-edit").onclick = () =>
    closeModal(elements.editModal);

  document
    .querySelectorAll(".close-modal")
    .forEach((btn) => (btn.onclick = () => closeModal(btn.closest(".modal"))));

  elements.editForm.onsubmit = (e) => {
    e.preventDefault();
    updateUser();
  };
}

// API - Buscar usuários
async function fetchUsers() {
  const token = localStorage.getItem("accessToken");
  const searchTerm = elements.search.value.trim();

  elements.tbody.innerHTML =
    '<tr><td colspan="5" class="loading-message">Carregando...</td></tr>';
  elements.status.textContent = "Carregando...";

  try {
    const response = await fetch(`http://${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      users = data.data?.data || data.data || [];

      if (searchTerm) {
        users = users.filter(
          (user) =>
            user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id?.toString().includes(searchTerm)
        );
      }

      displayUsers();
      updatePagination();
    } else {
      showError(data.msg || data.errors?.[0] || "Falha ao obter usuários");
    }
  } catch (error) {
    showError("Erro ao conectar ao servidor");
  }
}

// Exibir usuários na tabela
function displayUsers() {
  if (users.length === 0) {
    elements.tbody.innerHTML =
      '<tr><td colspan="5" class="empty-message">Nenhum usuário encontrado</td></tr>';
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const displayedUsers = users.slice(start, start + itemsPerPage);

  elements.tbody.innerHTML = displayedUsers
    .map((user) => {
      const isCurrentUser = user.id === currentUserInfo.id;
      return `
            <tr>
                <td>${user.id || "N/A"}</td>
                <td>${user.nome || "N/A"}</td>
                <td>${user.email || "N/A"}</td>
                <td>${getProfileName(user.perfil)}</td>
                <td class="actions-cell">
                    <button class="edit-btn" data-id="${
                      user.id
                    }"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn ${
                      isCurrentUser ? "disabled" : ""
                    }" data-id="${user.id}" ${isCurrentUser ? "disabled" : ""}>
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");

  setupActionButtons();
}

// Configurar botões de ação
function setupActionButtons() {
  document.querySelectorAll(".delete-btn:not(.disabled)").forEach(
    (btn) =>
      (btn.onclick = () => {
        userToDelete = btn.dataset.id;
        openModal(elements.deleteModal);
      })
  );

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) => (btn.onclick = () => openEditModal(btn.dataset.id)));
}

// Atualizar paginação
function updatePagination() {
  const total = users.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const start = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);

  elements.status.textContent = `Mostrando ${start} - ${end} de ${total} usuários`;

  const buttons = [];
  buttons.push(
    `<button class="pagination-btn prev-btn" ${
      currentPage === 1 ? "disabled" : ""
    } onclick="changePage(${
      currentPage - 1
    })"><i class="fas fa-chevron-left"></i></button>`
  );

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(
      `<button class="pagination-btn page-btn ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})">${i}</button>`
    );
  }

  buttons.push(
    `<button class="pagination-btn next-btn" ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(${
      currentPage + 1
    })"><i class="fas fa-chevron-right"></i></button>`
  );

  elements.buttons.innerHTML = buttons.join("");
}

// Navegação de páginas
function changePage(page) {
  if (page >= 1 && page <= Math.ceil(users.length / itemsPerPage)) {
    currentPage = page;
    displayUsers();
    updatePagination();
  }
}

// Modais
function openModal(modal) {
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
}

function closeModal(modal) {
  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
    if (modal === elements.editModal) userToEdit = null;
    if (modal === elements.deleteModal) userToDelete = null;
  }, 300);
}

// Modal de edição
function openEditModal(userId) {
  const user = users.find((u) => u.id.toString() === userId.toString());
  if (!user) return;

  userToEdit = user;
  document.getElementById("edit-user-id").value = user.id || "";
  document.getElementById("edit-user-name").value = user.nome || "";
  document.getElementById("edit-user-email").value = user.email || "";

  const idField = document.getElementById("edit-user-id");
  const emailField = document.getElementById("edit-user-email");
  [idField, emailField].forEach((field) =>
    field.setAttribute("readonly", true)
  );

  openModal(elements.editModal);
}

// API - Atualizar usuário
async function updateUser() {
  if (!userToEdit) return;

  const nome = document.getElementById("edit-user-name").value.trim();
  if (!nome) {
    alert("O nome não pode ser vazio.");
    return;
  }

  try {
    const response = await fetch(`http://${API_URL}/users`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: parseInt(userToEdit.id), nome }),
    });

    const data = await response.json();

    if (response.ok) {
      closeModal(elements.editModal);
      fetchUsers();
      alert("Usuário atualizado com sucesso!");
    } else {
      alert(
        `Erro: ${data.msg || data.errors?.join(", ") || "Falha na operação"}`
      );
    }
  } catch (error) {
    alert("Erro ao conectar ao servidor.");
  }
}

// API - Excluir usuário
async function deleteUser() {
  if (!userToDelete) return;

  try {
    const response = await fetch(`http://${API_URL}/users?id=${userToDelete}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      closeModal(elements.deleteModal);
      fetchUsers();
      alert("Usuário excluído com sucesso!");
    } else {
      alert(
        `Erro: ${data.msg || data.errors?.join(", ") || "Falha na operação"}`
      );
    }
  } catch (error) {
    alert("Erro ao conectar ao servidor.");
  }
}

// Utilitários
function getProfileName(profile) {
  const profiles = {
    ADMIN: "Administrador",
    USUARIO: "Investidor",
    ANALISTA: "Analista",
  };
  return profiles[profile] || profile || "N/A";
}

function showError(message) {
  elements.tbody.innerHTML = `<tr><td colspan="5" class="error-message">Erro: ${message}</td></tr>`;
  elements.status.textContent = "Erro ao carregar usuários";
}
