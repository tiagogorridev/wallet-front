document.addEventListener('DOMContentLoaded', function() {
  // Inicializar eventos e funcionalidades do dashboard
  initDashboard();
  
  // Simular carregamento de dados para demonstração
  simulateDataLoading();
});

/**
 * Inicializa os eventos e funcionalidades do dashboard
 */
function initDashboard() {
  // Inicializa o filtro de período
  initPeriodFilter();
  
  // Inicializa botões de visualização
  initViewButtons();
  
  // Adiciona interatividade aos cards
  initCardHoverEffects();
  
  // Animação para mostrar os valores nos cards
  animateValueCounters();
  
  // Inicializa comportamento responsivo
  initResponsiveLayout();
}

/**
 * Inicializa o filtro de período com evento de mudança
 */
function initPeriodFilter() {
  const periodFilter = document.getElementById('period-filter');
  if (periodFilter) {
    periodFilter.addEventListener('change', function() {
      const selectedPeriod = this.value;
      console.log(`Filtro alterado para: ${selectedPeriod}`);
      
      // Aqui você normalmente buscaria dados do servidor
      // Por enquanto, vamos apenas simular uma atualização
      simulateDataUpdate(selectedPeriod);
    });
  }
}

/**
 * Inicializa botões de visualização nas seções
 */
function initViewButtons() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Identifica o tipo de item associado ao botão
      const activityItem = this.closest('.activity-item');
      const activityDesc = activityItem.querySelector('.activity-desc').textContent;
      
      console.log(`Visualizando atividade: ${activityDesc}`);
      
      // Aqui você normalmente abriria um modal ou redirecionaria
      // Por enquanto, apenas mostramos um alerta para simulação
      alert(`Detalhes de: ${activityDesc}`);
    });
  });
  
  // Inicializa links "Ver todos"
  const viewAllLinks = document.querySelectorAll('.view-all');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.closest('section').className;
      console.log(`Ver todos os itens da seção: ${section}`);
      
      // Aqui você normalmente redirecionaria para uma página específica
      alert(`Redirecionando para lista completa de ${this.closest('section').querySelector('h2').textContent}`);
    });
  });
}

/**
 * Adiciona efeitos de hover aos cards
 */
function initCardHoverEffects() {
  const cards = document.querySelectorAll('.overview-card, .chart-card, .activity-item, .user-item, .asset-item');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
      this.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
  });
}

/**
 * Anima os contadores de valor nos cards do resumo
 */
function animateValueCounters() {
  const valueElements = document.querySelectorAll('.overview-card .value');
  
  valueElements.forEach(element => {
    const finalValue = element.textContent;
    const isMonetary = finalValue.includes('R$');
    
    // Remove formatação para obter o número puro
    let numericValue;
    if (isMonetary) {
      numericValue = parseFloat(finalValue.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    } else {
      numericValue = parseFloat(finalValue.replace(/\./g, '').trim());
    }
    
    // Começa com zero
    element.textContent = isMonetary ? 'R$ 0' : '0';
    
    // Anima até o valor final
    let startTime;
    const duration = 1500; // duração da animação em ms
    
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * numericValue);
      
      if (isMonetary) {
        element.textContent = `R$ ${currentValue.toLocaleString('pt-BR')}`;
      } else {
        element.textContent = currentValue.toLocaleString('pt-BR');
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(animate);
      } else {
        element.textContent = finalValue; // Garante o valor final exato
      }
    }
    
    window.requestAnimationFrame(animate);
  });
}

/**
 * Inicializa comportamentos responsivos
 */
function initResponsiveLayout() {
  // Verifica o tamanho da tela e ajusta elementos se necessário
  const checkScreenSize = () => {
    const isMobile = window.innerWidth < 768;
    
    // Ajusta layout para mobi  le se necessário
    if (isMobile) {
      document.querySelectorAll('.section-header').forEach(header => {
        const viewAllLink = header.querySelector('.view-all');
        if (viewAllLink) {
          header.after(viewAllLink);
          viewAllLink.style.display = 'block';
          viewAllLink.style.marginTop = '-10px';
          viewAllLink.style.marginBottom = '15px';
          viewAllLink.style.textAlign = 'right';
        }
      });
    } else {
      // Reverte ajustes quando voltar para desktop
      // Este é um placeholder onde você adicionaria o código reverso
    }
  };
  
  // Verifica na carga inicial
  checkScreenSize();
  
  // Adiciona listener para redimensionamento da janela
  window.addEventListener('resize', checkScreenSize);
}

