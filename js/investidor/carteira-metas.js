const API_URL = "http://191.239.116.115:8080";

class GoalManager {
  constructor() {
    this.goals = [];
    this.walletBalance = 0;
    this.currentWalletId = null;
    this.token = null;
  }

  init() {
    this.loadAuthData();
    this.setupEventListeners();
    this.loadGoals();
    this.loadWalletBalance();
  }

  loadAuthData() {
    this.token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    this.currentWalletId =
      localStorage.getItem("selectedWalletId") ||
      localStorage.getItem("walletId") ||
      localStorage.getItem("id_carteira");

    if (!this.token) {
      alert("Token não encontrado. Redirecionando para login...");
      window.location.href = "../../index.html";
      return false;
    }

    if (!this.currentWalletId) return false;
    return true;
  }

  setupEventListeners() {
    document
      .getElementById("openAddGoalModalBtn")
      .addEventListener("click", () => this.openModal("addGoalModal"));

    document
      .querySelectorAll(".close-btn, .close-modal-btn")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleCloseModal.bind(this))
      );

    document
      .getElementById("addGoalForm")
      .addEventListener("submit", this.handleAddGoal.bind(this));

    document
      .getElementById("editGoalForm")
      .addEventListener("submit", this.handleUpdateGoal.bind(this));

    document
      .querySelectorAll(".goal-tab")
      .forEach((tab) =>
        tab.addEventListener("click", this.handleTabChange.bind(this))
      );

    document.addEventListener(
      "portfolioChanged",
      this.handlePortfolioChange.bind(this)
    );
  }

  handleCloseModal(e) {
    const modalId = e.target.closest(".modal-overlay").id;
    this.closeModal(modalId);
  }

  handleTabChange(e) {
    document.querySelector(".goal-tab.active").classList.remove("active");
    e.target.classList.add("active");
    this.renderGoals();
  }

  handlePortfolioChange(e) {
    if (e.detail?.portfolio?.saldo_total !== undefined) {
      this.walletBalance = e.detail.portfolio.saldo_total;
      const newWalletId =
        localStorage.getItem("selectedWalletId") ||
        localStorage.getItem("walletId") ||
        localStorage.getItem("id_carteira");

      if (newWalletId && newWalletId != this.currentWalletId) {
        this.currentWalletId = newWalletId;
        this.loadGoals();
      } else {
        this.updateStats();
        this.renderGoals();
      }
    }
  }

  async loadWalletBalance() {
    if (!this.loadAuthData()) return;

    try {
      const response = await fetch(
        `${API_URL}/wallets/${this.currentWalletId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      this.walletBalance = data.data?.saldo_total || data.data?.saldo || 0;
      this.updateStats();
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    }
  }

  async updateGoalStatusIfCompleted(goal) {
    const progress = this.calculateProgress(goal);
    const shouldBeCompleted = progress >= 100;
    const isCurrentlyActive = goal.meta_status === "ATIVA";

    if (shouldBeCompleted && isCurrentlyActive) {
      try {
        const response = await fetch(`${API_URL}/goals`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: goal.id,
            descricao: goal.descricao,
            valor_meta: goal.valor_meta,
            data_final: goal.data_final,
            meta_status: "CONCLUIDA",
          }),
        });

        const data = await response.json();
        if (!data.error) {
          goal.meta_status = "CONCLUIDA";
          return true;
        }
      } catch (error) {
        console.error("Erro ao atualizar status da meta:", error);
      }
    }
    return false;
  }

  async loadGoals() {
    if (!this.loadAuthData()) return;

    try {
      const response = await fetch(`${API_URL}/goals`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      const allGoals = data.data?.data || [];
      this.goals = allGoals.filter(
        (goal) => goal.id_carteira == this.currentWalletId
      );

      // Verifica e atualiza status das metas automaticamente
      let statusUpdated = false;
      for (const goal of this.goals) {
        const updated = await this.updateGoalStatusIfCompleted(goal);
        if (updated) statusUpdated = true;
      }

      this.updateStats();
      this.renderGoals();

      // Se algum status foi atualizado, recarrega para ter dados consistentes
      if (statusUpdated) {
        setTimeout(() => this.loadGoals(), 1000);
      }
    } catch (error) {
      this.goals = [];
      this.updateStats();
      this.renderGoals();
    }
  }

  updateStats() {
    const activeGoals = this.goals.filter(
      (goal) => goal.meta_status === "ATIVA"
    ).length;
    const completedGoals = this.goals.filter(
      (goal) => goal.meta_status === "CONCLUIDA"
    ).length;
    const totalValue = this.goals.reduce(
      (sum, goal) => sum + parseFloat(goal.valor_meta || 0),
      0
    );

    const statValues = document.querySelectorAll(".goal-stat-card .stat-value");
    statValues[0].textContent = activeGoals;
    statValues[1].textContent = completedGoals;
    statValues[2].textContent = this.formatCurrency(totalValue);
  }

  renderGoals() {
    const goalsList = document.getElementById("goalsList");
    const filter = document.querySelector(".goal-tab.active").dataset.filter;
    const filteredGoals = this.filterGoalsByStatus(filter);

    if (filteredGoals.length === 0) {
      goalsList.innerHTML =
        '<div class="empty-goals">Nenhuma meta encontrada.</div>';
      return;
    }

    goalsList.innerHTML = filteredGoals
      .map((goal) => this.createGoalCard(goal))
      .join("");
    this.attachGoalEventListeners();
  }

  filterGoalsByStatus(filter) {
    switch (filter) {
      case "active":
        return this.goals.filter((goal) => goal.meta_status === "ATIVA");
      case "completed":
        return this.goals.filter((goal) => goal.meta_status === "CONCLUIDA");
      default:
        return this.goals;
    }
  }

  createGoalCard(goal) {
    const progress = this.calculateProgress(goal);
    const isCompleted = goal.meta_status === "CONCLUIDA" || progress >= 100;

    return `
            <div class="goal-card ${isCompleted ? "completed" : ""}" data-id="${
      goal.id
    }">
              <div class="goal-header">
                <h3>${goal.descricao}</h3>
                <div class="goal-actions">
                  ${
                    !isCompleted && progress >= 100
                      ? `
                    <button class="complete-goal" data-goal-id="${goal.id}" title="Marcar como concluída">
                      <i class="fas fa-check"></i>
                    </button>
                  `
                      : ""
                  }
                  <button class="edit-goal" data-goal-id="${goal.id}">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="delete-goal" data-goal-id="${goal.id}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div class="progress" style="width: ${Math.min(
                    progress,
                    100
                  )}%;"></div>
                </div>
                <div class="progress-info">
                  <span class="current-value">${this.formatCurrency(
                    this.walletBalance
                  )}</span>
                  <span class="target-value">${this.formatCurrency(
                    goal.valor_meta
                  )}</span>
                </div>
                <div class="progress-percentage">
                  ${Math.round(progress)}% concluído
                </div>
              </div>
              <div class="goal-dates">
                <span class="status-badge ${
                  isCompleted ? "completed" : "active"
                }">
                  ${isCompleted ? "Concluída" : "Ativa"}
                </span>
                ${
                  goal.data_final
                    ? `<span class="due-date">Prazo: ${new Date(
                        goal.data_final
                      ).toLocaleDateString("pt-BR")}</span>`
                    : ""
                }
              </div>
            </div>
          `;
  }

  calculateProgress(goal) {
    const targetValue = parseFloat(goal.valor_meta);
    return targetValue > 0 ? (this.walletBalance / targetValue) * 100 : 0;
  }

  attachGoalEventListeners() {
    document
      .querySelectorAll(".edit-goal")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleEditGoal.bind(this))
      );

    document
      .querySelectorAll(".delete-goal")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleDeleteGoal.bind(this))
      );

    document
      .querySelectorAll(".complete-goal")
      .forEach((btn) =>
        btn.addEventListener("click", this.handleCompleteGoal.bind(this))
      );
  }

  handleEditGoal(e) {
    e.stopPropagation();
    const goalId = parseInt(e.currentTarget.dataset.goalId);
    this.openEditModal(goalId);
  }

  handleDeleteGoal(e) {
    e.stopPropagation();
    const goalId = parseInt(e.currentTarget.dataset.goalId);
    this.deleteGoal(goalId);
  }

  handleCompleteGoal(e) {
    e.stopPropagation();
    const goalId = parseInt(e.currentTarget.dataset.goalId);
    if (confirm("Marcar esta meta como concluída?")) {
      this.markGoalAsCompleted(goalId);
    }
  }

  async handleAddGoal(e) {
    e.preventDefault();

    const formData = this.getFormData("add");
    if (!this.validateForm(formData, "add")) return;

    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id_carteira: parseInt(this.currentWalletId),
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      alert("Meta criada com sucesso!");
      this.closeModal("addGoalModal");
      document.getElementById("addGoalForm").reset();
      this.loadGoals();
    } catch (error) {
      alert(`Erro ao criar meta: ${error.message}`);
    }
  }

  async handleUpdateGoal(e) {
    e.preventDefault();

    const formData = this.getFormData("edit");
    if (!this.validateForm(formData, "edit")) return;

    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      alert("Meta atualizada com sucesso!");
      this.closeModal("editGoalModal");
      this.loadGoals();
    } catch (error) {
      alert(`Erro ao atualizar meta: ${error.message}`);
    }
  }

  getFormData(type) {
    const prefix = type === "edit" ? "edit-" : "";
    const idField = type === "edit" ? "edit-id" : null;

    return {
      ...(idField && { id: parseInt(document.getElementById(idField).value) }),
      descricao: document
        .getElementById(`${prefix}${type === "edit" ? "title" : "description"}`)
        .value.trim(),
      valor_meta: parseFloat(
        document.getElementById(`${prefix}targetValue`).value
      ),
      data_final: document.getElementById(`${prefix}completionDate`).value,
    };
  }

  validateForm(data, type) {
    const errors = this.getValidationErrors(data);
    this.clearErrors(type);

    if (errors.length > 0) {
      this.showErrors(errors, type);
      return false;
    }

    return true;
  }

  getValidationErrors(data) {
    const errors = [];
    if (!data.descricao || data.descricao.length < 3)
      errors.push("description");
    if (!data.data_final) errors.push("completionDate");
    if (!data.valor_meta || data.valor_meta <= 0) errors.push("targetValue");
    return errors;
  }

  clearErrors(type) {
    const prefix = type === "edit" ? "edit-" : "";
    ["description", "completionDate", "targetValue"].forEach((field) => {
      const errorElement = document.getElementById(
        `${prefix}${
          field === "description" && type === "edit" ? "title" : field
        }Error`
      );
      if (errorElement) errorElement.style.display = "none";
    });
  }

  showErrors(errors, type) {
    const prefix = type === "edit" ? "edit-" : "";
    errors.forEach((field) => {
      const fieldName =
        field === "description" && type === "edit" ? "title" : field;
      const errorElement = document.getElementById(
        `${prefix}${fieldName}Error`
      );
      if (errorElement) errorElement.style.display = "block";
    });
  }

  openEditModal(goalId) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) {
      alert("Meta não encontrada");
      return;
    }

    document.getElementById("edit-id").value = goal.id;
    document.getElementById("edit-title").value = goal.descricao;
    document.getElementById("edit-targetValue").value = goal.valor_meta;

    if (goal.data_final) {
      const date = new Date(goal.data_final);
      document.getElementById("edit-completionDate").value = date
        .toISOString()
        .split("T")[0];
    }

    this.openModal("editGoalModal");
  }

  async deleteGoal(goalId) {
    if (!goalId || !confirm("Tem certeza que deseja excluir esta meta?"))
      return;

    try {
      const response = await fetch(`${API_URL}/goals?id=${goalId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      alert("Meta excluída com sucesso!");
      this.loadGoals();
    } catch (error) {
      alert(`Erro ao excluir meta: ${error.message}`);
    }
  }

  async markGoalAsCompleted(goalId) {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) return;

    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: goal.id,
          descricao: goal.descricao,
          valor_meta: goal.valor_meta,
          data_final: goal.data_final,
          meta_status: "CONCLUIDA",
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.msg);

      alert("Meta marcada como concluída!");
      this.loadGoals();
    } catch (error) {
      alert(`Erro ao atualizar meta: ${error.message}`);
    }
  }

  openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
  }

  closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
  }

  formatCurrency(value) {
    return `R$ ${parseFloat(value || 0)
      .toFixed(2)
      .replace(".", ",")}`;
  }

  onWalletChange() {
    const oldWalletId = this.currentWalletId;
    this.loadAuthData();

    if (this.currentWalletId != oldWalletId) {
      this.loadGoals();
      this.loadWalletBalance();
    }
  }
}

// Inicialização
const goalManager = new GoalManager();

document.addEventListener("DOMContentLoaded", () => {
  goalManager.init();
});

document.addEventListener("walletChanged", () => {
  goalManager.onWalletChange();
});

window.addEventListener("storage", (e) => {
  if (
    e.key === "selectedWalletId" ||
    e.key === "walletId" ||
    e.key === "id_carteira"
  ) {
    goalManager.onWalletChange();
  }
});
