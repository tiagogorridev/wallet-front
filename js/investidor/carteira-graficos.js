document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header');
    if (headerContainer) {
      fetch('../../html/investidor/header.html')
        .then(response => response.text())
        .then(data => {
          headerContainer.innerHTML = data;
          const headerStyle = document.createElement('link');
          headerStyle.rel = 'stylesheet';
          headerStyle.href = '/investidor/header/header.css';
          document.head.appendChild(headerStyle);
        })
        .catch(error => console.error('Erro ao carregar o header:', error));
    }

    const patrimonyComponent = new EvolutionPatrimonyComponent('patrimonyEvolutionChart', 'patrimonyFilter');
    patrimonyComponent.initialize();
  });
  