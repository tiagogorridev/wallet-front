document.addEventListener('DOMContentLoaded', function() {
  // Carregar o cabeçalho do investidor (substitua isso pelo conteúdo real do seu cabeçalho)
  const header = document.getElementById('header');

  // Adicionar comportamento de roteamento para botões com data-route
  const routeButtons = document.querySelectorAll('[data-route]');

  routeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const route = this.getAttribute('data-route');
      console.log(`Navegando para: ${route}`);

      // Em uma aplicação real, você usaria algum dos métodos abaixo:
      // window.location.href = route;  // Para navegação completa
      // history.pushState({}, '', route);  // Para SPA sem recarregar a página

      // Para este exemplo, apenas mostramos um alerta
      alert(`Redirecionando para: ${route}`);
    });
  });

  // Adicionar funcionalidade de slide para os cards de testemunhos (versão simplificada)
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
      const walk = (x - startX) * 2; // Velocidade do scroll
      testimonialContainer.scrollLeft = scrollLeft - walk;
    });
  }

  // Adicionar funcionalidade de hover para os cards de benefícios
  const benefitCards = document.querySelectorAll('.benefit-card');

  benefitCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Funcionalidade para o botão de seleção do plano
  const planSelectBtn = document.querySelector('.plan-select-btn');
  if (planSelectBtn) {
    planSelectBtn.addEventListener('click', function() {
      const route = this.getAttribute('data-route');
      console.log(`Selecionando plano e navegando para: ${route}`);
      alert(`Plano selecionado! Redirecionando para pagamento.`);
    });
  }
});
