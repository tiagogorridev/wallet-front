const API_URL = "191.239.116.115:8080";
let currentPage = 1,
  itemsPerPage = 8,
  users = [],
  userToDelete = null,
  userToEdit = null;

// ELEMENTOS DOM
const tbody = document.getElementById("users-table-body");
const status = document.getElementById("pagination-status");
const buttons = document.getElementById("pagination-buttons");
const perPage = document.getElementById("per-page-select");
const search = document.getElementById("search-users");
const deleteModal = document.getElementById("delete-confirmation-modal");
const editModal = document.getElementById("edit-user-modal");
const editForm = document.getElementById("edit-user-form");

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken");
  const currentUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  if (!token || currentUserInfo.perfil !== "ADMIN") {
    window.location.href = "../../index.html";
    return;
  }

  fetchUsers();
  setupEvents();
});

// EVENTOS
function setupEvents() {
  perPage.onchange = () => {
    itemsPerPage = parseInt(perPage.value);
    currentPage = 1;
    fetchUsers();
  };

  search.onkeypress = (e) =>
    e.key === "Enter" && ((currentPage = 1), fetchUsers());
  document.querySelector(".search-btn").onclick = () => (
    (currentPage = 1), fetchUsers()
  );

  document.getElementById("confirm-delete").onclick = deleteUser;
  document.getElementById("cancel-delete").onclick = () =>
    closeModal(deleteModal);
  document.getElementById("cancel-edit").onclick = () => closeModal(editModal);

  document
    .querySelectorAll(".close-modal")
    .forEach((btn) => (btn.onclick = () => closeModal(btn.closest(".modal"))));

  editForm.onsubmit = (e) => {
    e.preventDefault();
    updateUser();
  };
}

// BUSCAR USUÁRIOS
async function fetchUsers() {
  const token = localStorage.getItem("accessToken");
  const searchTerm = search.value.trim();

  tbody.innerHTML =
    '<tr><td colspan="5" class="loading-message">Carregando...</td></tr>';
  status.textContent = "Carregando...";

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

// EXIBIR USUÁRIOS
function displayUsers() {
  if (users.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-message">Nenhum usuário encontrado</td></tr>';
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const displayedUsers = users.slice(start, start + itemsPerPage);
  const currentUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  tbody.innerHTML = displayedUsers
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

// BOTÕES DE AÇÃO
function setupActionButtons() {
  document.querySelectorAll(".delete-btn:not(.disabled)").forEach(
    (btn) =>
      (btn.onclick = () => {
        userToDelete = btn.dataset.id;
        openModal(deleteModal);
      })
  );

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) => (btn.onclick = () => openEditModal(btn.dataset.id)));
}

// PAGINAÇÃO
function updatePagination() {
  const total = users.length;
  const totalPages = Math.ceil(total / itemsPerPage);
  const start = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, total);

  status.textContent = `Mostrando ${start} - ${end} de ${total} usuários`;

  const buttonsList = [];
  buttonsList.push(
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
    buttonsList.push(
      `<button class="pagination-btn page-btn ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})">${i}</button>`
    );
  }

  buttonsList.push(
    `<button class="pagination-btn next-btn" ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(${
      currentPage + 1
    })"><i class="fas fa-chevron-right"></i></button>`
  );

  buttons.innerHTML = buttonsList.join("");
}

function changePage(page) {
  if (page >= 1 && page <= Math.ceil(users.length / itemsPerPage)) {
    currentPage = page;
    displayUsers();
    updatePagination();
  }
}

// MODAIS
function openModal(modal) {
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("active"), 10);
}

function closeModal(modal) {
  modal.classList.remove("active");
  setTimeout(() => {
    modal.style.display = "none";
    if (modal === editModal) userToEdit = null;
    if (modal === deleteModal) userToDelete = null;
  }, 300);
}

// EDITAR USUÁRIO
function openEditModal(userId) {
  const user = users.find((u) => u.id.toString() === userId.toString());
  if (!user) return;

  userToEdit = user;
  document.getElementById("edit-user-id").value = user.id || "";
  document.getElementById("edit-user-name").value = user.nome || "";
  document.getElementById("edit-user-email").value = user.email || "";

  document.getElementById("edit-user-id").setAttribute("readonly", true);
  document.getElementById("edit-user-email").setAttribute("readonly", true);

  openModal(editModal);
}

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
      closeModal(editModal);
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

// EXCLUIR USUÁRIO
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
      closeModal(deleteModal);
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

// UTILITÁRIOS
function getProfileName(profile) {
  const profiles = {
    ADMIN: "Administrador",
    USUARIO: "Investidor",
    ANALISTA: "Analista",
  };
  return profiles[profile] || profile || "N/A";
}

function showError(message) {
  tbody.innerHTML = `<tr><td colspan="5" class="error-message">Erro: ${message}</td></tr>`;
  status.textContent = "Erro ao carregar usuários";
}
