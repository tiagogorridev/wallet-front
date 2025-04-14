document.addEventListener('DOMContentLoaded', function() {
  const routeButtons = document.querySelectorAll('[data-route]');
  routeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const route = this.getAttribute('data-route');
      console.log(`Navegando para: ${route}`);
      alert(`Redirecionando para: ${route}`);
    });
  });

  const testimonialContainer = document.querySelector('.testimonials-container');
  if (testimonialContainer) {
    let isDown = false;
    let startX;
    let scrollLeft;

    testimonialContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - testimonialContainer.offsetLeft;
      scrollLeft = testimonialContainer.scrollLeft;
    });

    testimonialContainer.addEventListener('mouseleave', () => {
      isDown = false;
    });

    testimonialContainer.addEventListener('mouseup', () => {
      isDown = false;
    });

    testimonialContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - testimonialContainer.offsetLeft;
      const walk = (x - startX) * 2;
      testimonialContainer.scrollLeft = scrollLeft - walk;
    });
  }

  const planSelectBtn = document.querySelector('.plan-select-btn');
  if (planSelectBtn) {
    planSelectBtn.addEventListener('click', function() {
      const route = this.getAttribute('data-route');
      console.log(`Selecionando plano e navegando para: ${route}`);
      alert(`Plano selecionado! Redirecionando para pagamento.`);
    });
  }
});