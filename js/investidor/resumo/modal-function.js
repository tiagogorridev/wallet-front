const ModalFunctions = {
    createModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        const closeButton = modal ? modal.querySelector('.close-button') : null;
        const cancelButton = modal ? modal.querySelector('.cancel-btn') : null;
        
        function openModal() {
            if (modal) {
                modal.style.display = 'flex';
                document.dispatchEvent(new CustomEvent('modalOpened', {
                    detail: { modalId: modal.id }
                }));
                
                if (typeof options.onOpen === 'function') {
                    options.onOpen();
                }
            }
        }
        
        function closeModal() {
            if (modal) {
                modal.style.display = 'none';
                const form = modal.querySelector('form');
                if (form) form.reset();
                
                if (typeof options.onClose === 'function') {
                    options.onClose();
                }
            }
        }
        
        function initialize(triggerButtonId) {
            const triggerButton = triggerButtonId ? document.getElementById(triggerButtonId) : null;
            
            if (triggerButton) {
                triggerButton.addEventListener('click', openModal);
            }
            
            if (closeButton) {
                closeButton.addEventListener('click', closeModal);
            }
            
            if (cancelButton) {
                cancelButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    closeModal();
                });
            }
            
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                }
            });
        }
        
        return { initialize, openModal, closeModal };
    }
};

window.createModal = function(modalId, options = {}) {
    return ModalFunctions.createModal(modalId, options);
};

window.ModalFunctions = ModalFunctions;