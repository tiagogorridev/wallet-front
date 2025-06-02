const ModalFunctions = {
  createModal(modalId, options = {}) {
    // ELEMENTOS DO MODAL
    const modal = document.getElementById(modalId);
    const closeButton = modal?.querySelector(".close-button");
    const cancelButton = modal?.querySelector(".cancel-btn");

    // FUNÇÃO PARA ABRIR MODAL
    const openModal = () => {
      if (modal) {
        modal.style.display = "flex";
        document.dispatchEvent(
          new CustomEvent("modalOpened", { detail: { modalId } })
        );
        options.onOpen?.();
      }
    };

    // FUNÇÃO PARA FECHAR MODAL
    const closeModal = () => {
      if (modal) {
        modal.style.display = "none";
        modal.querySelector("form")?.reset();
        options.onClose?.();
      }
    };

    // INICIALIZAÇÃO DOS EVENT LISTENERS
    const initialize = (triggerButtonId) => {
      const trigger = triggerButtonId
        ? document.getElementById(triggerButtonId)
        : null;

      trigger?.addEventListener("click", openModal);
      closeButton?.addEventListener("click", closeModal);
      cancelButton?.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });

      window.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    };

    return { initialize, openModal, closeModal };
  },
};

// EXPOSIÇÃO GLOBAL DAS FUNÇÕES
window.createModal = (modalId, options = {}) =>
  ModalFunctions.createModal(modalId, options);
window.ModalFunctions = ModalFunctions;
