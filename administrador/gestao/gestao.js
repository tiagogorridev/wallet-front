document.addEventListener('DOMContentLoaded', function() {
  initDashboard();
  simulateDataLoading();
});

function initDashboard() {
  initPeriodFilter();
  initViewButtons();
  initCardHoverEffects();
  animateValueCounters();
  initResponsiveLayout();
}

function initPeriodFilter() {
  const periodFilter = document.getElementById('period-filter');
  if (periodFilter) {
    periodFilter.addEventListener('change', function() {
      const selectedPeriod = this.value;
      console.log(`Filtro alterado para: ${selectedPeriod}`);
      simulateDataUpdate(selectedPeriod);
    });
  }
}

function initViewButtons() {
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const activityItem = this.closest('.activity-item');
      const activityDesc = activityItem.querySelector('.activity-desc').textContent;
      console.log(`Visualizando atividade: ${activityDesc}`);
      alert(`Detalhes de: ${activityDesc}`);
    });
  });
  
  const viewAllLinks = document.querySelectorAll('.view-all');
  viewAllLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.closest('section').className;
      console.log(`Ver todos os itens da seção: ${section}`);
      alert(`Redirecionando para lista completa de ${this.closest('section').querySelector('h2').textContent}`);
    });
  });
}

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

function animateValueCounters() {
  const valueElements = document.querySelectorAll('.overview-card .value');
  
  valueElements.forEach(element => {
    const finalValue = element.textContent;
    const isMonetary = finalValue.includes('R$');
    let numericValue;
    if (isMonetary) {
      numericValue = parseFloat(finalValue.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
    } else {
      numericValue = parseFloat(finalValue.replace(/\./g, '').trim());
    }
    
    element.textContent = isMonetary ? 'R$ 0' : '0';
    let startTime;
    const duration = 1500;
    
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
        element.textContent = finalValue;
      }
    }
    
    window.requestAnimationFrame(animate);
  });
}

function initResponsiveLayout() {
  const checkScreenSize = () => {
    const isMobile = window.innerWidth < 768;
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
    }
  };
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
}
